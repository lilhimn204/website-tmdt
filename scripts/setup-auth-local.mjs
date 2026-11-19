import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv.length !== 2) throw new Error('Local setup accepts no remote targets or arguments.');
const cli = resolve(root, 'node_modules/supabase/dist/supabase.js');
const result = spawnSync(process.execPath, [cli, 'status', '--output', 'json'], { cwd: root, encoding: 'utf8', windowsHide: true });
if (result.status !== 0) throw new Error('Start local Supabase first: npm run db:start.');
const status = JSON.parse(result.stdout);
if (status.API_URL !== 'http://127.0.0.1:54321' || !status.PUBLISHABLE_KEY?.startsWith('sb_publishable_')) throw new Error('Unexpected local Supabase configuration.');
const path = resolve(root, '.dev.vars');
let text = existsSync(path) ? readFileSync(path, 'utf8') : '# Local bindings only. Never commit this file.\n';
const read = key => {
  const line = text.split(/\r?\n/).find(l => l.startsWith(`${key}=`));
  return line?.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '');
};
if (read('APP_ENV') && read('APP_ENV') !== 'local') throw new Error('Refusing to change a non-local .dev.vars.');
if (read('SUPABASE_URL') && read('SUPABASE_URL') !== status.API_URL) throw new Error('Existing .dev.vars points to another project.');
const existing = read('DATA_API_GATEWAY_SECRET');
if (existing && !/^[A-Za-z0-9_-]{43,128}$/.test(existing)) throw new Error('Existing gateway secret has an unsupported format; no file changed.');
const secret = existing || randomBytes(32).toString('base64url');
const hash = createHash('sha256').update(secret).digest('hex');
const sql = `insert into private.gateway_secrets(slot,secret_hash) values('current','${hash}') on conflict(slot) do update set secret_hash=excluded.secret_hash,valid_until=null,updated_at=now();`;
const applied = spawnSync('docker', ['exec', '-i', 'supabase_db_website-tmdt', 'psql', '-Xq', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'], { input: sql, encoding: 'utf8', windowsHide: true });
if (applied.status !== 0) throw new Error('Cannot provision gateway hash. Apply the 08.3 migrations first.');
for (const [key, value] of Object.entries({ APP_ENV: 'local', APP_ORIGIN: read('APP_ORIGIN') || 'http://127.0.0.1:8788', SUPABASE_URL: status.API_URL, SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY, DATA_API_GATEWAY_SECRET: secret })) {
  const line = `${key}=${JSON.stringify(value)}`;
  const regex = new RegExp(`^${key}=.*$`, 'm');
  text = regex.test(text) ? text.replace(regex, line) : `${text.trimEnd()}\n${line}\n`;
}
writeFileSync(path, text);
console.log('Configured local .dev.vars and gateway hash; no credential values printed.');
console.log('No owner account created. Restart the local Pages preview to load these bindings.');
