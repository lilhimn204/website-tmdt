import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv.length !== 2) throw new Error('Local setup accepts no remote targets or arguments.');
const path = resolve(root, '.dev.vars');
if (!existsSync(path)) throw new Error('Run npm run auth:setup:local first.');
let text = readFileSync(path, 'utf8');
const read = key => text.split(/\r?\n/).find(l => l.startsWith(`${key}=`))?.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '');
if (read('APP_ENV') !== 'local' || read('SUPABASE_URL') !== 'http://127.0.0.1:54321') throw new Error('Refusing to change non-local bindings.');
const result = spawnSync(process.execPath, [resolve(root, 'node_modules/supabase/dist/supabase.js'), 'status', '--output', 'json'], { cwd: root, encoding: 'utf8', windowsHide: true });
if (result.status !== 0) throw new Error('Start local Supabase first. Credentials suppressed.');
const status = JSON.parse(result.stdout);
if (status.API_URL !== read('SUPABASE_URL') || !status.SECRET_KEY?.startsWith('sb_secret_')) throw new Error('Unexpected local secret-key format. No file changed.');
const hashing = read('REQUEST_HASH_SECRET') || randomBytes(32).toString('base64url');
if (!/^[A-Za-z0-9_-]{43}$/.test(hashing)) throw new Error('Invalid existing request hash binding.');
const ttl = read('GUEST_SESSION_TTL_SECONDS') || '1800';
if (!/^[1-9][0-9]{1,4}$/.test(ttl) || Number(ttl) < 60 || Number(ttl) > 86400) throw new Error('Invalid existing local TTL.');
for (const [key, value] of Object.entries({ SUPABASE_SECRET_KEY: status.SECRET_KEY, REQUEST_HASH_SECRET: hashing, GUEST_SESSION_TTL_SECONDS: ttl })) {
  const regex = new RegExp(`^${key}=.*$`, 'm'), line = `${key}=${JSON.stringify(value)}`;
  text = regex.test(text) ? text.replace(regex, () => line) : `${text.trimEnd()}\n${line}\n`;
}
writeFileSync(path, text);
console.log('Configured local commerce bindings; no credentials printed.');
console.log('1800-second default is a LOCAL TEST value only. Production guest TTL remains unapproved (D07).');
console.log('No policy, guest session, product, order or reservation was created. Restart local Pages to load bindings.');
