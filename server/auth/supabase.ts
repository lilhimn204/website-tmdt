import { AuthError, isObject, permissionCodes, staffRoles, uuidPattern } from './types';
import type { AdminContext, AuthEnv } from './types';

export type AuthFetch = (input: string, init: RequestInit) => Promise<Response>;
export interface AuthConfig { url: string; key: string; gateway: string; origin: string }
export function authConfig(env: AuthEnv): AuthConfig {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY || !env.APP_ORIGIN || !env.DATA_API_GATEWAY_SECRET) throw new Error();
    const url = new URL(env.SUPABASE_URL), origin = new URL(env.APP_ORIGIN);
    const acceptable = (target: URL) => target.protocol === 'https:' || (env.APP_ENV === 'local' && target.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(target.hostname));
    if (!acceptable(url) || !acceptable(origin) || url.username || url.password || url.pathname !== '/' || url.search || url.hash
      || origin.origin !== env.APP_ORIGIN || !/^[A-Za-z0-9_-]{43,128}$/.test(env.DATA_API_GATEWAY_SECRET)
      || !env.SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) throw new Error();
    return { url: url.origin, key: env.SUPABASE_PUBLISHABLE_KEY, gateway: env.DATA_API_GATEWAY_SECRET, origin: origin.origin };
  } catch { throw new AuthError(503, 'AUTH_NOT_CONFIGURED'); }
}

export async function upstream(config: AuthConfig, fetcher: AuthFetch, path: string, token: string, method: string, body?: unknown, rpc = false): Promise<Response> {
  const headers: Record<string, string> = { apikey: config.key, Authorization: `Bearer ${token}`, Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (rpc) {
    headers['Accept-Profile'] = 'api'; headers['Content-Profile'] = 'api';
    headers['X-Data-Api-Gateway'] = config.gateway;
  }
  try {
    // workerd supports manual/follow, not redirect:error. Never forward credentials
    // to a redirected origin: reject the 3xx response without following it.
    const response = await fetcher(`${config.url}${path}`, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }), redirect: 'manual', signal: AbortSignal.timeout(8000) });
    if (response.status >= 300 && response.status < 400) throw new AuthError(503, 'AUTH_UNAVAILABLE');
    return response;
  } catch { throw new AuthError(503, 'AUTH_UNAVAILABLE'); }
}
export async function jsonBody(response: Response): Promise<unknown> {
  try { return await response.json(); } catch { throw new AuthError(503, 'AUTH_UNAVAILABLE'); }
}
export function readBearer(request: Request): string {
  const header = request.headers.get('Authorization') ?? '';
  if (header.length > 8192 || !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(header)) throw new AuthError(401, 'UNAUTHENTICATED');
  return header.slice(7);
}
export async function verifyUser(config: AuthConfig, token: string, fetcher: AuthFetch, requireMfa = true): Promise<string> {
  const response = await upstream(config, fetcher, '/auth/v1/user', token, 'GET');
  if (response.status === 401 || response.status === 403) throw new AuthError(401, 'UNAUTHENTICATED');
  if (response.status === 429) throw new AuthError(429, 'TOO_MANY_REQUESTS');
  if (!response.ok) throw new AuthError(503, 'AUTH_UNAVAILABLE');
  const user = await jsonBody(response);
  // Decode only AFTER the Auth server has verified this exact bearer. This is not a JWT signature verifier.
  let claims: unknown;
  try { const payload = token.split('.')[1]!; claims = JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(payload.length / 4) * 4, '='))); }
  catch { throw new AuthError(401, 'UNAUTHENTICATED'); }
  const now = Math.floor(Date.now() / 1000);
  if (!isObject(user) || typeof user.id !== 'string' || !uuidPattern.test(user.id) || !isObject(claims)
    || claims.sub !== user.id || claims.role !== 'authenticated' || claims.iss !== `${config.url}/auth/v1`
    || !(claims.aud === 'authenticated' || (Array.isArray(claims.aud) && claims.aud.includes('authenticated')))
    || typeof claims.exp !== 'number' || !Number.isSafeInteger(claims.exp) || claims.exp <= now
    || (claims.nbf !== undefined && (typeof claims.nbf !== 'number' || claims.nbf > now))
    || typeof claims.session_id !== 'string' || !uuidPattern.test(claims.session_id)) throw new AuthError(401, 'UNAUTHENTICATED');
  if (requireMfa && claims.aal !== 'aal2') throw new AuthError(403, 'MFA_REQUIRED');
  return user.id;
}
export async function rpc(config: AuthConfig, token: string, fetcher: AuthFetch, name: 'admin_context' | 'set_admin_access', body: unknown): Promise<unknown> {
  const response = await upstream(config, fetcher, `/rest/v1/rpc/${name}`, token, 'POST', body, true);
  const payload = await jsonBody(response);
  if (!response.ok) {
    if (response.status === 401) throw new AuthError(401, 'UNAUTHENTICATED');
    if (isObject(payload)) {
      if (payload.message === 'GATEWAY_REQUIRED') throw new AuthError(503, 'AUTH_NOT_CONFIGURED');
      if (payload.code === '42501') throw new AuthError(403, 'FORBIDDEN');
      if (payload.message === 'LAST_OWNER_REQUIRED') throw new AuthError(409, 'LAST_OWNER_REQUIRED');
      if (payload.message === 'ACCESS_VERSION_CONFLICT' || payload.code === '40001') throw new AuthError(409, 'ACCESS_VERSION_CONFLICT');
      if (payload.code === '22023') throw new AuthError(400, 'INVALID_ACCESS_INPUT');
    }
    throw new AuthError(503, 'AUTH_UNAVAILABLE');
  }
  return payload;
}
export async function adminContext(config: AuthConfig, token: string, fetcher: AuthFetch, userId: string): Promise<AdminContext> {
  const result = await rpc(config, token, fetcher, 'admin_context', {});
  if (!isObject(result) || result.user_id !== userId || typeof result.display_name !== 'string' || result.display_name.length > 100
    || typeof result.authz_version !== 'string' || !/^[1-9][0-9]*$/.test(result.authz_version)
    || !Array.isArray(result.roles) || result.roles.length > 6 || !result.roles.every(r => typeof r === 'string' && (staffRoles as readonly string[]).includes(r))
    || !Array.isArray(result.permissions) || result.permissions.length > permissionCodes.length || !result.permissions.every(p => typeof p === 'string' && (permissionCodes as readonly string[]).includes(p))) {
    throw new AuthError(503, 'AUTH_UNAVAILABLE');
  }
  return { user_id: userId, display_name: result.display_name, authz_version: result.authz_version, roles: result.roles as string[], permissions: result.permissions as string[] };
}
