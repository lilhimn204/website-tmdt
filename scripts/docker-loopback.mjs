import { request } from 'node:http';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

// Docker Desktop may ignore the bridge's default host binding. Recreate only this
// project's three published containers with explicit loopback ports, retaining
// the exact configuration and named volumes. Secrets stay in process memory.
export async function bindProjectToLoopback() {
  const context = spawnSync('docker', ['context', 'inspect'], { encoding: 'utf8', windowsHide: true });
  if (context.status !== 0) throw new Error('Cannot inspect the local Docker context.');
  const endpoint = JSON.parse(context.stdout)[0].Endpoints.docker.Host;
  let socketPath;
  if (endpoint.startsWith('npipe:////./pipe/')) socketPath = endpoint.replace('npipe:////./pipe/', '\\\\.\\pipe\\');
  else if (endpoint.startsWith('unix:///')) socketPath = endpoint.slice('unix://'.length);
  else throw new Error('Only a local Docker named pipe or Unix socket is supported.');
  function api(method, path, payload, binary = false) {
    return new Promise((resolve, reject) => {
      const body = payload === undefined ? undefined : Buffer.isBuffer(payload) ? payload : JSON.stringify(payload);
      const req = request({ socketPath, path: `/v1.47${path}`, method, headers: body ? { 'Content-Type': Buffer.isBuffer(body) ? 'application/x-tar' : 'application/json', 'Content-Length': Buffer.byteLength(body) } : {} }, res => {
        const chunks = [];
        res.on('data', chunk => { chunks.push(chunk); });
        res.on('end', () => {
          const data = Buffer.concat(chunks);
          const output = data.toString('utf8');
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const reason = String(JSON.parse(output || '{}').message ?? '').replace(/sb_(secret|publishable)_[\w-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+|postgres(?:ql)?:\/\/\S+/g, '[redacted]');
            reject(new Error(`Local Docker ${method} failed with HTTP ${res.statusCode}: ${reason}`));
          }
          else resolve(binary ? data : output ? JSON.parse(output) : undefined);
        });
      });
      req.setTimeout(60000, () => req.destroy(new Error('Local Docker request timed out.')));
      req.on('error', reject);
      req.end(body);
    });
  }
  for (const service of ['db', 'kong', 'studio']) {
    const name = `supabase_${service}_website-tmdt`;
    const original = await api('GET', `/containers/${name}/json`);
    const published = Object.values(original.NetworkSettings.Ports).flat().filter(Boolean);
    if (published.every(port => ['127.0.0.1', '::1'].includes(port.HostIp))) continue;
    if (original.HostConfig.NetworkMode !== 'website-tmdt-local-only' || original.HostConfig.AutoRemove || original.Mounts.some(m => m.Type === 'volume' && !m.Name.startsWith('supabase_'))) {
      throw new Error(`Unexpected configuration for ${name}; refusing to replace it.`);
    }
    const config = structuredClone(original.Config);
    const host = structuredClone(original.HostConfig);
    for (const bindings of Object.values(host.PortBindings)) for (const binding of bindings) binding.HostIp = '127.0.0.1';
    const mounts = original.Mounts.filter(m => m.Type === 'volume');
    // Pin every volume name to preserve data, including any Docker-created volume.
    host.Binds = (host.Binds ?? []).filter(bind => !mounts.some(m => bind.includes(`:${m.Destination}:`) || bind.endsWith(`:${m.Destination}`)));
    host.Mounts = (host.Mounts ?? []).filter(mount => !mounts.some(m => mount.Target === m.Destination));
    for (const mount of mounts) host.Binds.push(`${mount.Name}:${mount.Destination}:${mount.RW ? 'rw' : 'ro'}`);
    const aliases = original.NetworkSettings.Networks['website-tmdt-local-only'].Aliases;
    const backup = `${name}_rebind_${randomUUID().slice(0, 8)}`;
    await api('POST', `/containers/${name}/stop?t=10`);
    await api('POST', `/containers/${name}/rename?name=${backup}`);
    let replacement;
    try {
      replacement = await api('POST', `/containers/create?name=${name}`, {
        ...config, HostConfig: host,
        NetworkingConfig: { EndpointsConfig: { 'website-tmdt-local-only': { Aliases: aliases } } },
      });
      // CLI copies the gateway config/TLS certificates into its writable layer.
      // Preserve that directory in memory; otherwise a later db reset/reload fails.
      if (service === 'kong') {
        const gatewayFiles = await api('GET', `/containers/${backup}/archive?path=/home/kong`, undefined, true);
        await api('PUT', `/containers/${replacement.Id}/archive?path=/home`, gatewayFiles);
      }
      await api('POST', `/containers/${replacement.Id}/start`);
    } catch (error) {
      if (replacement) await api('DELETE', `/containers/${replacement.Id}?force=true`);
      await api('POST', `/containers/${backup}/rename?name=${name}`);
      await api('POST', `/containers/${name}/start`);
      throw error;
    }
    // Remove only the replaced, stopped container. Never remove volumes.
    await api('DELETE', `/containers/${backup}`);
    console.log(`Bound ${service} to 127.0.0.1; retained project data volume(s).`);
  }
}
