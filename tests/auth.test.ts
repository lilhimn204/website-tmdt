import { describe, expect, it, vi } from 'vitest';
import { handleAdminAuth } from '../server/auth/handlers';
import type { AuthEnv } from '../server/auth/types';

const id = '00000000-0000-4000-8000-000000000001';
const session = '00000000-0000-4000-8000-000000000002';
const target = '00000000-0000-4000-8000-000000000003';
const env: AuthEnv = { APP_ENV: 'local', APP_ORIGIN: 'http://127.0.0.1:8788', SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_UNIT_TEST_ONLY', DATA_API_GATEWAY_SECRET: 'g'.repeat(43) };
// Unit fixture only: Auth verification is mocked here; real signed tokens are tested in integration.
const token = (claims: Record<string, unknown> = {}) => `eyJhbGciOiJVTklUX09OTFkifQ.${Buffer.from(JSON.stringify({ sub: id, session_id: session, iss: `${env.SUPABASE_URL}/auth/v1`, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, aal: 'aal2', ...claims })).toString('base64url')}.unit-signature`;
const context = (permissions = ['security.manage']) => ({ user_id: id, display_name: 'TEST staff', authz_version: '1', roles: ['owner'], permissions });
const input = { user_id: target, display_name: 'TEST catalog', roles: ['catalog'], active: true, expected_version: '0', reason: 'TEST assignment', request_id: session };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
function request(action = 'session', options: { bearer?: string; body?: unknown; headers?: Record<string, string>; method?: string; query?: string } = {}) {
  const method = options.method ?? (action === 'session' ? 'GET' : 'POST');
  return new Request(`${env.APP_ORIGIN}/api/v1/admin/${action}${options.query ?? ''}`, {
    method, headers: { Authorization: `Bearer ${options.bearer ?? token()}`, ...(method === 'POST' ? { Origin: env.APP_ORIGIN!, 'Content-Type': 'application/json' } : {}), ...options.headers },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
}
function provider(permissions = ['security.manage']) {
  return vi.fn(async (url: string, init: RequestInit) => {
    if (url.endsWith('/auth/v1/user')) return json({ id, user_metadata: { role: 'owner' } });
    if (url.endsWith('/rpc/admin_context')) return json(context(permissions));
    if (url.endsWith('/rpc/set_admin_access')) {
      const body = JSON.parse(String(init.body));
      return json({ user_id: body.target_user, active: body.enabled, roles: body.role_codes, authz_version: '4', raw_internal: 'must-not-leak' });
    }
    if (url.endsWith('/logout?scope=local')) return new Response(null, { status: 204 });
    throw new Error('Unexpected URL');
  });
}
async function errorCode(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(await response.json()).toHaveProperty('error.code', code);
}

describe('08.3 admin BFF authentication and boundaries', () => {
  it.each(['POST', 'PUT', 'DELETE', 'OPTIONS'])('rejects %s on session without making upstream requests', async method => {
    const fetcher = provider();
    const res = await handleAdminAuth(request('session', { method }), env, 'session', fetcher);
    expect(res.status).toBe(405); expect(fetcher).not.toHaveBeenCalled(); expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
  it('fails closed without gateway configuration', async () => {
    await errorCode(await handleAdminAuth(request(), { ...env, DATA_API_GATEWAY_SECRET: '' }, 'session', provider()), 503, 'AUTH_NOT_CONFIGURED');
  });
  it.each(['http://remote.example', 'https://user:password@example.test', 'https://example.test/another-path'])('rejects unsafe server URL %s', async url => {
    await errorCode(await handleAdminAuth(request(), { ...env, SUPABASE_URL: url }, 'session', provider()), 503, 'AUTH_NOT_CONFIGURED');
  });
  it('rejects credential query strings and cookies as substitutes for Bearer', async () => {
    await errorCode(await handleAdminAuth(request('session', { query: '?access_token=private' }), env, 'session', provider()), 400, 'INVALID_ACCESS_INPUT');
    await errorCode(await handleAdminAuth(request('session', { headers: { Authorization: '', Cookie: 'access_token=private' } }), env, 'session', provider()), 401, 'UNAUTHENTICATED');
  });
  it('uses the original JWT + publishable key, never a service role for admin RPC', async () => {
    const fetcher = provider(), bearer = token();
    const res = await handleAdminAuth(request('session', { bearer }), env, 'session', fetcher);
    expect(res.status).toBe(200); expect(await res.json()).toEqual({ data: context() });
    const headers = fetcher.mock.calls[1]![1].headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${bearer}`); expect(headers.apikey).toBe(env.SUPABASE_PUBLISHABLE_KEY);
    expect(headers['X-Data-Api-Gateway']).toBe(env.DATA_API_GATEWAY_SECRET);
    expect((fetcher.mock.calls[0]![1].headers as Record<string, string>)['X-Data-Api-Gateway']).toBeUndefined();
  });
  it('rejects a forged token when Supabase Auth rejects it, before RPC', async () => {
    const fetcher = vi.fn(async () => json({ message: 'private diagnostic' }, 401));
    await errorCode(await handleAdminAuth(request(), env, 'session', fetcher), 401, 'UNAUTHENTICATED');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each([{ exp: 1 }, { sub: target }, { iss: 'https://evil.test/auth/v1' }, { role: 'service_role' }, { aud: 'wrong' }, { session_id: 'invalid' }, { nbf: 9999999999 }])('rejects invalid verified claim shape %j', async claims => {
    await errorCode(await handleAdminAuth(request('session', { bearer: token(claims) }), env, 'session', provider()), 401, 'UNAUTHENTICATED');
  });
  it('requires MFA and does not accept owner user_metadata as authorization', async () => {
    await errorCode(await handleAdminAuth(request('session', { bearer: token({ aal: 'aal1', user_metadata: { role: 'owner' } }) }), env, 'session', provider()), 403, 'MFA_REQUIRED');
  });
  it('looks up live permissions again on every request', async () => {
    const fetcher = provider();
    expect((await handleAdminAuth(request(), env, 'session', fetcher)).status).toBe(200);
    fetcher.mockImplementation(async url => url.endsWith('/user') ? json({ id }) : json({ code: '42501', message: 'ADMIN_ACCESS_DENIED' }, 403));
    await errorCode(await handleAdminAuth(request(), env, 'session', fetcher), 403, 'FORBIDDEN');
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it('hides provider failures and private diagnostic messages', async () => {
    const res = await handleAdminAuth(request(), env, 'session', vi.fn(async () => json({ details: 'secret-value' }, 500)));
    await errorCode(res, 503, 'AUTH_UNAVAILABLE');
  });
  it('handles network timeout without false success', async () => {
    await errorCode(await handleAdminAuth(request(), env, 'session', vi.fn(async () => { throw new Error('timeout secret'); })), 503, 'AUTH_UNAVAILABLE');
  });
  it.each([301, 302, 303, 307, 308])('rejects redirect %s without forwarding credentials; uses a workerd-supported mode', async status => {
    const fetcher = vi.fn(async (_url: string, init: RequestInit) => {
      expect(init.redirect).toBe('manual');
      return Response.redirect('https://untrusted.invalid', status);
    });
    await errorCode(await handleAdminAuth(request(), env, 'session', fetcher), 503, 'AUTH_UNAVAILABLE');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('rejects malformed/foreign admin context rather than echoing upstream data', async () => {
    const fetcher = vi.fn(async (url: string) => url.endsWith('/user') ? json({ id }) : json({ ...context(), user_id: target, token: 'private' }));
    await errorCode(await handleAdminAuth(request(), env, 'session', fetcher), 503, 'AUTH_UNAVAILABLE');
  });
});

describe('08.3 access changes and logout', () => {
  it('accepts the empty POST stream delivered by Workers for logout without JSON content', async () => {
    const req = new Request(`${env.APP_ORIGIN}/api/v1/admin/logout`, {
      method: 'POST', headers: { Authorization: `Bearer ${token()}`, Origin: env.APP_ORIGIN! }, body: '',
    });
    expect(req.body).not.toBeNull();
    expect((await handleAdminAuth(req, env, 'logout', provider())).status).toBe(204);
  });
  it('submits a validated access change and strips unknown response fields', async () => {
    const fetcher = provider();
    const res = await handleAdminAuth(request('access', { body: input }), env, 'access', fetcher);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { user_id: target, active: true, roles: ['catalog'], authz_version: '4' } });
    expect(JSON.parse(String(fetcher.mock.calls[2]![1].body))).toHaveProperty('expected_version', '0');
  });
  it('sales cannot grant themselves finance/owner even with valid MFA', async () => {
    const fetcher = provider(['quotes.write']);
    await errorCode(await handleAdminAuth(request('access', { body: input }), env, 'access', fetcher), 403, 'FORBIDDEN');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it.each([{ roles: ['unknown'] }, { roles: ['owner', 'owner'] }, { roles: [] }, { expected_version: '-1' }, { expected_version: '9999999999999999999' }, { actor_id: id }, { reason: 'x' }, { user_id: 'bad' }])('rejects invalid mutation payload %j', async override => {
    await errorCode(await handleAdminAuth(request('access', { body: { ...input, ...override } }), env, 'access', provider()), 400, 'INVALID_ACCESS_INPUT');
  });
  it.each(['https://other.test', 'null', ''])('rejects untrusted/missing write origin %s', async origin => {
    await errorCode(await handleAdminAuth(request('access', { body: input, headers: { Origin: origin } }), env, 'access', provider()), 403, 'ORIGIN_NOT_ALLOWED');
  });
  it('rejects cross-site requests even with an allowed Origin value', async () => {
    await errorCode(await handleAdminAuth(request('access', { body: input, headers: { 'Sec-Fetch-Site': 'cross-site' } }), env, 'access', provider()), 403, 'ORIGIN_NOT_ALLOWED');
  });
  it('bounds the body before contacting Auth', async () => {
    const fetcher = provider();
    await errorCode(await handleAdminAuth(request('access', { body: { reason: 'x'.repeat(5000) } }), env, 'access', fetcher), 413, 'PAYLOAD_TOO_LARGE');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('requires JSON and rejects malformed JSON', async () => {
    await errorCode(await handleAdminAuth(request('access', { body: input, headers: { 'Content-Type': 'text/plain' } }), env, 'access', provider()), 415, 'UNSUPPORTED_MEDIA_TYPE');
    const req = new Request(`${env.APP_ORIGIN}/api/v1/admin/access`, { method: 'POST', headers: { Authorization: `Bearer ${token()}`, Origin: env.APP_ORIGIN!, 'Content-Type': 'application/json' }, body: '{' });
    await errorCode(await handleAdminAuth(req, env, 'access', provider()), 400, 'INVALID_ACCESS_INPUT');
  });
  it.each([['23514', 'LAST_OWNER_REQUIRED'], ['40001', 'ACCESS_VERSION_CONFLICT']])('reports %s safely', async (code, message) => {
    const fetcher = provider();
    fetcher.mockImplementation(async url => url.endsWith('/user') ? json({ id }) : url.endsWith('/admin_context') ? json(context()) : json({ code, message, details: 'private' }, 400));
    await errorCode(await handleAdminAuth(request('access', { body: input }), env, 'access', fetcher), 409, message);
  });
  it('logs out the current session even before MFA, without touching access roles', async () => {
    const fetcher = provider();
    const res = await handleAdminAuth(request('logout', { bearer: token({ aal: 'aal1' }), body: {} }), env, 'logout', fetcher);
    expect(res.status).toBe(204); expect(await res.text()).toBe('');
    expect(fetcher).toHaveBeenCalledTimes(2); expect(fetcher.mock.calls[1]![0]).toContain('/logout?scope=local');
  });
  it('does not claim logout success when the provider fails', async () => {
    const fetcher = vi.fn(async (url: string) => url.endsWith('/user') ? json({ id }) : json({}, 500));
    await errorCode(await handleAdminAuth(request('logout', { body: {} }), env, 'logout', fetcher), 503, 'AUTH_UNAVAILABLE');
  });
});
