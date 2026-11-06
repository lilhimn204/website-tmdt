import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const status = spawnSync(process.execPath, [resolve(root, 'node_modules/supabase/dist/supabase.js'), 'status', '--output', 'json'], { cwd: root, encoding: 'utf8', windowsHide: true });
if (status.status !== 0) throw new Error('Local Supabase is not running. Use npm run db:start.');
// Status contains local credentials. Read in memory, never print or persist them.
const values = JSON.parse(status.stdout);
assert.equal(new URL(values.API_URL).hostname, '127.0.0.1');
const api = 'http://127.0.0.1:54321';
const key = values.PUBLISHABLE_KEY ?? values.ANON_KEY;
assert.ok(key);
let ready = false;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    ready = (await fetch(`${api}/rest/v1/`, { headers: { apikey: key, 'Accept-Profile': 'api' } })).ok;
  } catch { ready = false; }
  if (ready) break;
  await delay(1000);
}
assert.ok(ready, 'local Data API must become healthy');
const catalog = await fetch(`${api}/rest/v1/`, { headers: { apikey: key, 'Accept-Profile': 'api' } });
assert.equal(catalog.status, 200);
const spec = await catalog.json();
assert.ok(!Object.keys(spec.paths ?? {}).some(path => path !== '/'), 'no business endpoint exposed');
console.log('PASS: Data API healthy with an empty, dedicated api schema.');
for (const schema of ['app', 'private', 'public']) {
  const response = await fetch(`${api}/rest/v1/orders`, { headers: { apikey: key, 'Accept-Profile': schema } });
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
