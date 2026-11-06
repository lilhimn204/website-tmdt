import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { bindProjectToLoopback } from './docker-loopback.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = resolve(root, 'node_modules/supabase/dist/supabase.js');
const network = 'website-tmdt-local-only';
const project = 'website-tmdt';
const action = process.argv[2];
if (!['start', 'stop', 'status'].includes(action) || process.argv.length !== 3) {
  throw new Error('Use npm run db:start, db:stop or db:status; no remote arguments accepted.');
}
function redact(value) {
  return value.split('\n').filter(line => !/"(?:SECRET|JWT|ANON|SERVICE_ROLE|PUBLISHABLE|DB_URL|S3_PROTOCOL)_?\w*"/i.test(line))
    .join('\n').replace(/sb_(secret|publishable)_[\w-]+/g, '[redacted]')
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[redacted JWT]')
    .replace(/postgres(?:ql)?:\/\/\S+/gi, '[redacted database URL]');
}
function run(binary, args, allowFailure = false) {
  const result = spawnSync(binary, args, { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 12 * 1024 * 1024 });
  if ((result.error || result.status !== 0) && !allowFailure) {
    throw new Error(redact(result.error?.message ?? result.stderr ?? 'Command failed'));
  }
  return result;
}
function verifyLoopback() {
  for (const name of ['db', 'kong', 'studio']) {
    const result = run('docker', ['inspect', `supabase_${name}_${project}`, '--format', '{{json .NetworkSettings.Ports}}']);
    const bindings = Object.values(JSON.parse(result.stdout)).flat().filter(Boolean);
    if (bindings.some(binding => binding.HostIp !== '127.0.0.1' && binding.HostIp !== '::1')) {
      throw new Error('Local ports are not loopback-only. Run npm run db:stop, then npm run db:start.');
    }
  }
}
if (action === 'start') {
  run('docker', ['info', '--format', '{{.ServerVersion}}']);
  const existing = run('docker', ['network', 'inspect', network], true);
  if (existing.status !== 0) {
    run('docker', ['network', 'create', '-o', 'com.docker.network.bridge.host_binding_ipv4=127.0.0.1', network]);
  } else if (JSON.parse(existing.stdout)[0].Options?.['com.docker.network.bridge.host_binding_ipv4'] !== '127.0.0.1') {
    throw new Error('The named local network has unexpected binding options; refusing to reuse it.');
  }
  console.log('Starting this project only. First run may download Docker images; credentials are hidden.');
  run(process.execPath, [cli, 'start', '--network-id', network]);
  await bindProjectToLoopback();
  verifyLoopback();
} else if (action === 'stop') {
  run(process.execPath, [cli, 'stop', '--project-id', project]);
  console.log('Stopped website-tmdt local services; data volumes retained.');
  process.exit(0);
} else {
  run(process.execPath, [cli, 'status', '--output', 'json']);
  verifyLoopback();
}
console.log('Local Supabase is running on loopback only.');
console.log('Studio: http://127.0.0.1:54323 | API: http://127.0.0.1:54321 | PostgreSQL port: 54322');
console.log('No cloud project is created or linked by this script. Keys and passwords are not printed.');
