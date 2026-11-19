import { spawn, spawnSync } from 'node:child_process';
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { bindProjectToLoopback } from './docker-loopback.mjs';
import { checkPublicCatalog } from './lib/public-catalog-integration.mjs';

// A disposable, named LOCAL stack. Never link/reset the application database.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const project = 'website-tmdt-auth-test';
const scratch = resolve(root, 'artifacts', project);
const api = 'http://127.0.0.1:55421', origin = 'http://127.0.0.1:8791';
const cli = resolve(root, 'node_modules/supabase/dist/supabase.js');
let worker, stackCreated = false, checks = 0;
function ensure(condition, label) { if (!condition) throw new Error(label); }
function pass(label) { checks++; console.log(`PASS ${checks}: ${label}`); }
function run(binary, args, input, cwd = root) {
  const result = spawnSync(binary, args, { cwd, input, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024, timeout: 240000 });
  // Never include stdout/stderr: CLI and Auth responses may contain credentials.
  ensure(result.status === 0, `Local command failed: ${binary === process.execPath ? 'Supabase CLI' : binary} (${result.status ?? 'timeout'})`);
  return result.stdout;
}
function sql(query) {
  return run('docker', ['exec', '-i', `supabase_db_${project}`, 'psql', '-XqAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'], query).trim();
}
async function waitFor(url, options) {
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(url, { ...options, signal: AbortSignal.timeout(2000) })).ok) return; } catch { /* startup */ }
    await delay(500);
  }
  throw new Error('Local service readiness timed out');
}
function totp(secret) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of secret.toUpperCase().replaceAll('=', '')) {
    ensure(alphabet.includes(c), 'Invalid TOTP fixture');
    bits += alphabet.indexOf(c).toString(2).padStart(5, '0');
  }
  const key = Buffer.from((bits.match(/.{8}/g) ?? []).map(b => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac('sha1', key).update(counter).digest();
  return ((digest.readUInt32BE(digest[19] & 15) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
}
try {
  ensure(process.argv.length === 2 && scratch.startsWith(resolve(root, 'artifacts') + sep), 'Local-only test has no arguments');
  ensure(existsSync(resolve(root, 'build/client/index.html')), 'Run npm run build first');
  // Refuse existing resources: an interrupted run requires explicit cleanup of THIS test project.
  const containers = run('docker', ['ps', '-a', '--format', '{{.Names}}']);
  const volumes = run('docker', ['volume', 'ls', '--format', '{{.Name}}']);
  ensure(!`${containers}\n${volumes}`.includes(project), 'Test project already exists; follow the module cleanup instructions');
  mkdirSync(resolve(scratch, 'supabase'), { recursive: true });
  // Pages locates its temporary worker via the nearest package.json. Without an
  // isolated package root it can load the application's .dev.vars instead.
  writeFileSync(resolve(scratch, 'package.json'), JSON.stringify({ name: project, private: true, type: 'module' }));
  const config = readFileSync(resolve(root, 'supabase/config.toml'), 'utf8')
    .replace('project_id = "website-tmdt"', `project_id = "${project}"`)
    .replaceAll('54321', '55421').replaceAll('54322', '55422').replaceAll('54323', '55423').replaceAll('54320', '55420').replaceAll('8788', '8791');
  writeFileSync(resolve(scratch, 'supabase/config.toml'), config);
  cpSync(resolve(root, 'supabase/migrations'), resolve(scratch, 'supabase/migrations'), { recursive: true });
  for (const dir of ['functions', 'server', 'shared']) cpSync(resolve(root, dir), resolve(scratch, dir), { recursive: true });
  // Test-only connectivity probe, generated inside the disposable project only.
  writeFileSync(resolve(scratch, 'functions/api/v1/integration-probe.ts'), `export const onRequest = async ({env}) => {
    try { const result = await fetch(env.SUPABASE_URL + '/auth/v1/health', {headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY}, signal:AbortSignal.timeout(8000)});
      return Response.json({status:result.status});
    } catch (error) { return Response.json({status:0,kind:error.name,message:error.message}, {status:503}); }
  };`);
  writeFileSync(resolve(scratch, 'wrangler.json'), JSON.stringify({ name: project, compatibility_date: '2026-11-04', send_metrics: false, pages_build_output_dir: resolve(root, 'build/client') }));
  console.log('Starting disposable Auth integration stack; CLI credentials suppressed.');
  stackCreated = true;
  run(process.execPath, [cli, 'start', '--workdir', scratch, '--network-id', 'website-tmdt-local-only']);
  await bindProjectToLoopback(project);
  // Explicit loopback binding recreates containers; wait for their health checks.
  let status;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { status = JSON.parse(run(process.execPath, [cli, 'status', '--workdir', scratch, '--output', 'json'])); break; }
    catch { await delay(1000); }
  }
  ensure(status, 'Disposable Supabase status did not become healthy');
  ensure(status.API_URL === api && status.PUBLISHABLE_KEY?.startsWith('sb_publishable_'), 'Unexpected test stack URL/key format');
  const gateway = randomBytes(32).toString('base64url');
  sql(`insert into private.gateway_secrets(slot,secret_hash) values('current','${createHash('sha256').update(gateway).digest('hex')}');`);
  const bindings = { APP_ENV: 'local', APP_ORIGIN: origin, SUPABASE_URL: api, SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY, DATA_API_GATEWAY_SECRET: gateway };
  writeFileSync(resolve(scratch, '.dev.vars'), Object.entries(bindings).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join('\n'));
  worker = spawn(process.execPath, [resolve(root, 'node_modules/wrangler/bin/wrangler.js'), 'pages', 'dev', '--cwd', scratch, '--ip', '127.0.0.1', '--port', '8791'], { cwd: scratch, windowsHide: true, stdio: 'ignore', env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' } });
  worker.on('error', () => {});
  await waitFor(`${origin}/api/v1/health`);
  await waitFor(`${api}/auth/v1/health`, { headers: { apikey: status.PUBLISHABLE_KEY } });
  const probe = await (await fetch(`${origin}/api/v1/integration-probe`)).json();
  ensure(probe.status === 200, `Pages-to-Auth connectivity failed (${probe.status}, ${probe.kind ?? ''}, ${probe.message ?? ''})`);
  async function auth(path, method, token, body, admin = false) {
    const response = await fetch(`${api}/auth/v1/${path}`, { method, headers: { apikey: admin ? status.SERVICE_ROLE_KEY : status.PUBLISHABLE_KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const data = await response.json().catch(() => ({}));
    ensure(response.ok, `Auth ${path.split('/')[0]} returned HTTP ${response.status}, code ${/^[a-z_]+$/.test(data.error_code ?? '') ? data.error_code : 'unavailable'}`);
    return data;
  }
  async function identity(label) {
    const email = `integration-${label}-${randomUUID()}@example.invalid`, password = randomBytes(32).toString('base64url');
    const user = await auth('admin/users', 'POST', status.SERVICE_ROLE_KEY, { email, password, email_confirm: true }, true);
    const login = await auth('token?grant_type=password', 'POST', null, { email, password });
    if (label === 'owner') {
      // Check the live aal1 token BEFORE Auth upgrades/revokes it during MFA.
      const passwordOnly = await bff('session', login.access_token);
      ensure(passwordOnly.data.error?.code === 'MFA_REQUIRED', `Password-only session must require MFA (${passwordOnly.status}, ${passwordOnly.data.error?.code})`);
      pass('real password login requires MFA');
    }
    const factor = await auth('factors', 'POST', login.access_token, { factor_type: 'totp', friendly_name: 'Disposable test TOTP' });
    const challenge = await auth(`factors/${factor.id}/challenge`, 'POST', login.access_token, {});
    const verified = await auth(`factors/${factor.id}/verify`, 'POST', login.access_token, { challenge_id: challenge.id, code: totp(factor.totp.secret) });
    ensure(/^[0-9a-f-]{36}$/.test(user.id), 'Unexpected Auth user ID');
    return { id: user.id, token: verified.access_token, factor: factor.id };
  }
  async function bff(action, token, body, customOrigin = origin) {
    const response = await fetch(`${origin}/api/v1/admin/${action}`, {
      method: action === 'session' ? 'GET' : 'POST',
      headers: { Origin: customOrigin, ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, data: await response.json().catch(() => ({})), cache: response.headers.get('Cache-Control') };
  }
  const anonymous = await bff('session');
  ensure(anonymous.status === 401, `Anonymous session must fail (${anonymous.status}, ${anonymous.data.error?.code})`); pass('missing bearer denied');
  const owner = await identity('owner'), sales = await identity('sales'), warehouse = await identity('warehouse'), finance = await identity('finance'), unassigned = await identity('unassigned'), owner2 = await identity('owner2');
  sql(`select private.bootstrap_owner('${owner.id}','TEST Owner','Isolated integration fixture');`);
  const version = user => sql(`select coalesce((select authz_version::text from app.admin_profiles where user_id='${user.id}'),'0');`);
  const accessBody = (user, roles, active = true, expected = version(user)) => ({ user_id: user.id, display_name: 'TEST staff', roles, active, expected_version: expected, reason: 'Isolated integration test', request_id: randomUUID() });
  const context = await bff('session', owner.token);
  ensure(context.status === 200 && context.data.data.user_id === owner.id && context.data.data.permissions.length === 23 && context.cache === 'no-store', 'Owner context invalid'); pass('real TOTP verification and owner context, no-store');
  ensure((await bff('session', unassigned.token)).status === 403, 'Unassigned user must fail'); pass('confirmed MFA user has no implicit staff access');
  for (const [user, role] of [[sales, 'sales'], [warehouse, 'warehouse'], [finance, 'finance']]) {
    const result = await bff('access', owner.token, accessBody(user, [role]));
    ensure(result.status === 200, `Owner grant ${role} failed (${result.status}, ${result.data.error?.code})`);
    pass(`owner assigns ${role} with committed audit`);
  }
  const salesContext = (await bff('session', sales.token)).data.data;
  ensure(salesContext.permissions.includes('quotes.write') && !salesContext.permissions.includes('finance.record'), 'Sales permissions invalid'); pass('sales cannot acquire finance permission');
  const warehouseContext = (await bff('session', warehouse.token)).data.data;
  ensure(warehouseContext.permissions.includes('inventory.adjust') && !warehouseContext.permissions.includes('pricing.write'), 'Warehouse permissions invalid'); pass('warehouse cannot acquire pricing permission');
  ensure((await bff('access', sales.token, accessBody(sales, ['owner']))).status === 403, 'Sales self-promotion must fail'); pass('self-promotion denied through Pages');
  await auth('user', 'PUT', sales.token, { data: { role: 'owner', permissions: ['security.manage'] } });
  ensure(!(await bff('session', sales.token)).data.data.permissions.includes('security.manage'), 'Metadata must not authorize'); pass('editable Auth metadata cannot elevate roles');
  ensure((await bff('access', owner.token, accessBody(sales, ['sales'], true, '0'))).data.error?.code === 'ACCESS_VERSION_CONFLICT', 'Stale write must fail'); pass('stale access update rejected');
  ensure((await bff('access', owner.token, accessBody(owner, [], false))).data.error?.code === 'LAST_OWNER_REQUIRED', 'Last owner must be preserved'); pass('last owner removal rejected at transaction commit');
  ensure((await bff('access', owner.token, accessBody(sales, ['sales']), 'https://untrusted.invalid')).status === 403, 'Wrong Origin must fail'); pass('cross-origin mutation denied');
  const chunks = owner.token.split('.'); chunks[2] = `${chunks[2][0] === 'a' ? 'b' : 'a'}${chunks[2].slice(1)}`;
  ensure((await bff('session', chunks.join('.'))).status === 401, 'Forged signature must fail'); pass('tampered JWT signature rejected by actual Auth');
  const direct = await fetch(`${api}/rest/v1/rpc/admin_context`, { method: 'POST', headers: { apikey: status.PUBLISHABLE_KEY, Authorization: `Bearer ${owner.token}`, 'Content-Profile': 'api', 'Content-Type': 'application/json' }, body: '{}' });
  ensure(direct.status === 403 && (await direct.json()).message === 'GATEWAY_REQUIRED', 'Direct RPC must fail'); pass('direct Data API denied without gateway secret');
  ensure((await bff('access', owner.token, accessBody(finance, ['finance'], false))).status === 200, 'Deactivation failed');
  ensure((await bff('session', finance.token)).status === 403, 'Deactivated token must fail'); pass('staff deactivation affects existing signed token immediately');
  const logout = await bff('logout', sales.token);
  ensure(logout.status === 204, `Logout failed (${logout.status}, ${logout.data.error?.code})`);
  ensure([401, 403].includes((await bff('session', sales.token)).status), 'Logged-out token must fail'); pass('logout revokes existing session access');
  await auth(`factors/${warehouse.factor}`, 'DELETE', warehouse.token);
  ensure([401, 403].includes((await bff('session', warehouse.token)).status), 'Removed factor must fail'); pass('MFA unenrollment invalidates previous aal2 access');
  ensure((await bff('access', owner.token, accessBody(owner2, ['owner']))).status === 200, 'Second test owner grant failed');
  const race = await Promise.all([bff('access', owner.token, accessBody(owner, [], false)), bff('access', owner2.token, accessBody(owner2, [], false))]);
  ensure(race.filter(r => r.status === 200).length === 1 && race.filter(r => r.data.error?.code === 'LAST_OWNER_REQUIRED').length === 1, 'Concurrent last-owner protection failed');
  ensure(sql("select count(*) from app.admin_profiles p join app.admin_user_roles ur on ur.user_id=p.user_id join app.admin_roles r on r.id=ur.role_id where p.active and r.code='owner';") === '1', 'Must retain one owner'); pass('two simultaneous owner removals preserve one active owner');
  ensure(sql("select count(*) from app.audit_events where action='security.access.changed' and actor_type='admin';") === '6', 'Audit must contain only committed mutations'); pass('successful grants/revocations audited; rejected writes rolled back');
  console.log(`Auth integration: ${checks} checks passed with real local Auth, TOTP, PostgREST and Pages Functions.`);
  await checkPublicCatalog({ sql, api, origin, publishable: status.PUBLISHABLE_KEY, gateway });
} catch (error) {
  console.error(`FAIL: ${error.message}`); process.exitCode = 1;
  if (stackCreated) {
    const logs = spawnSync('docker', ['logs', '--tail', '30', `supabase_auth_${project}`], { encoding: 'utf8', windowsHide: true });
    // Only allowlisted diagnostic fragments, never request bodies or credentials.
    const diagnostic = `${logs.stdout ?? ''}\n${logs.stderr ?? ''}`;
    const fragments = diagnostic.match(/SQLSTATE [0-9A-Z]{5}|permission denied for (?:schema|table|function|sequence) [a-z_]+|relation [\\"a-z_.]+ does not exist|connection refused|password authentication failed|duplicate key value violates unique constraint [\\"a-z_]+/g) ?? [];
    if (fragments.length) console.error(`Auth diagnostics: ${[...new Set(fragments)].join('; ')}`);
  }
} finally {
  if (worker?.pid) {
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(worker.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else worker.kill('SIGTERM');
  }
  const privateFile = resolve(scratch, '.dev.vars');
  if (existsSync(privateFile)) unlinkSync(privateFile);
  const probeFile = resolve(scratch, 'functions/api/v1/integration-probe.ts');
  if (existsSync(probeFile)) unlinkSync(probeFile);
  if (stackCreated) {
    try {
      run(process.execPath, [cli, 'stop', '--workdir', scratch, '--project-id', project, '--no-backup']);
      console.log('Disposable test stack removed. Application database and its users were not changed.');
    } catch { console.error('Test cleanup failed; follow the module instructions for website-tmdt-auth-test only.'); process.exitCode = 1; }
  }
}
