import { authConfig } from '../auth/supabase';
import type { AuthEnv } from '../auth/types';
import { isObject } from '../auth/types';
import { CatalogError } from './types';
import type { CatalogFetch } from './types';
export function unavailable(): never { throw new CatalogError(503, 'CATALOG_UNAVAILABLE'); }
async function boundedJson(response: Response): Promise<unknown> {
  if (!response.headers.get('Content-Type')?.toLowerCase().includes('application/json')) unavailable();
  const maxBytes = 256 * 1024;
  const declared = response.headers.get('Content-Length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) unavailable();
  const reader = response.body?.getReader();
  if (!reader) unavailable();
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) { await reader.cancel(); unavailable(); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)); } catch { return unavailable(); }
}

export async function publicRpc(env: AuthEnv, rpc: string, args: object, fetcher: CatalogFetch): Promise<unknown> {
    let config;
    try { config = authConfig(env); } catch { throw new CatalogError(503, 'CATALOG_NOT_CONFIGURED'); }
    // No caller JWT/cookie is forwarded. Public projections always run as anon.
    const response = await fetcher(`${config.url}/rest/v1/rpc/${rpc}`, {
      method: 'POST', headers: { apikey: config.key, 'X-Data-Api-Gateway': config.gateway,
        'Content-Type': 'application/json', Accept: 'application/json', 'Content-Profile': 'api', 'Accept-Profile': 'api' },
      body: JSON.stringify(args), redirect: 'manual', signal: AbortSignal.timeout(8000),
    });
    if (response.status === 429) throw new CatalogError(429, 'CATALOG_RATE_LIMITED');
    if (response.status >= 300 && response.status < 400) unavailable();
    const data = await boundedJson(response);
    if (!response.ok) {
      if (isObject(data)) {
        if (data.message === 'GATEWAY_REQUIRED') throw new CatalogError(503, 'CATALOG_NOT_CONFIGURED');
        if (data.code === 'PT404' && data.message === 'CATALOG_NOT_FOUND') throw new CatalogError(404, 'CATALOG_NOT_FOUND');
        if (data.code === '22023' && ['CATALOG_INVALID_QUERY', 'CATALOG_INVALID_CURSOR'].includes(String(data.message))) throw new CatalogError(400, String(data.message));
      }
      unavailable();
    }
    return data;
}
