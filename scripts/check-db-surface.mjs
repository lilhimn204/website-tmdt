import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { readFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const status = spawnSync(process.execPath, [resolve(root, 'node_modules/supabase/dist/supabase.js'), 'status', '--output', 'json'], { cwd: root, encoding: 'utf8', windowsHide: true });
if (status.status !== 0) throw new Error('Local Supabase is not running. Use npm run db:start.');
// Status contains local credentials. Read in memory, never print or persist them.
const values = JSON.parse(status.stdout);
assert.equal(new URL(values.API_URL).hostname, '127.0.0.1');
const api = 'http://127.0.0.1:54321';
const key = values.PUBLISHABLE_KEY ?? values.ANON_KEY;
assert.ok(key);
const vars = readFileSync(resolve(root, '.dev.vars'), 'utf8');
const gateway = vars.split(/\r?\n/).find(line => line.startsWith('DATA_API_GATEWAY_SECRET='))?.split('=')[1]?.replaceAll('"', '').trim();
assert.ok(gateway, 'run npm run auth:setup:local before the HTTP checks');
const gatewayHeaders = { apikey: key, 'Accept-Profile': 'api', 'X-Data-Api-Gateway': gateway };
let ready = false;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    ready = (await fetch(`${api}/rest/v1/`, { headers: gatewayHeaders })).ok;
  } catch { ready = false; }
  if (ready) break;
  await delay(1000);
}
assert.ok(ready, 'local Data API must become healthy');
const blocked = await fetch(`${api}/rest/v1/`, { headers: { apikey: key } });
assert.equal(blocked.status, 403);
assert.equal((await blocked.json()).message, 'GATEWAY_REQUIRED');
console.log('PASS: direct Data API requests without the server gateway are denied.');
const catalog = await fetch(`${api}/rest/v1/`, { headers: gatewayHeaders });
assert.equal(catalog.status, 200);
const spec = await catalog.json();
assert.ok(!Object.keys(spec.paths ?? {}).some(path => path !== '/'), 'no business endpoint exposed');
console.log('PASS: Data API healthy; anon sees no admin or business endpoint.');
for (const schema of ['app', 'private', 'public']) {
  const response = await fetch(`${api}/rest/v1/orders`, { headers: { ...gatewayHeaders, 'Accept-Profile': schema } });
  assert.equal(response.status, 406, `${schema} must not be exposed`);
  assert.equal((await response.json()).code, 'PGRST106');
  console.log(`PASS: schema ${schema} cannot be selected through Data API.`);
}
const signup = await fetch(`${api}/auth/v1/signup`, {
  method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: `test-${randomUUID()}@example.invalid`, password: randomUUID() }),
});
assert.equal(signup.status, 422);
assert.equal((await signup.json()).error_code, 'signup_disabled');
console.log('PASS: public Auth signup is disabled; no admin identity is created.');
assert.equal((await fetch('http://127.0.0.1:54323')).status, 200);
console.log('PASS: local Studio returns HTTP 200. No credentials or customer data printed.');
