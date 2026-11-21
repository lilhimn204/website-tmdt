import { describe, it, expect, vi } from 'vitest';
import { handleCommerce } from '../server/commerce/handler';
import type { CommerceAction, CommerceEnv } from '../server/commerce/types';
import type { AuthFetch } from '../server/auth/supabase';
import { responseDto } from '../server/commerce/dto';
import { input } from '../server/commerce/validation';
const env: CommerceEnv = { APP_ENV: 'local', APP_ORIGIN: 'http://127.0.0.1:8788', SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_TEST', SUPABASE_SECRET_KEY: 'sb_secret_TEST', DATA_API_GATEWAY_SECRET: 'g'.repeat(43),
  REQUEST_HASH_SECRET: 'h'.repeat(43), GUEST_SESSION_TTL_SECONDS: '1800' };
const id = '70000000-0000-0000-0000-000000000020';
const cart = { items: [{ variant_id: id, quantity: 2 }] };
const preview = { ...cart, destination: { province_code: 'TEST-P', ward_code: 'TEST-W' }, payment_method: 'cod', shipping_service: 'standard' };
const empty = { status: 200, data: { lines: [], policy_configured: false, order_created: false, inventory_reserved: false, submission_enabled: false } };
const provider = (data: unknown = empty) => vi.fn<AuthFetch>(async () => Response.json(data));
function req(body: unknown = { items: [] }, headers: Record<string, string> = {}, method = 'POST', query = '') {
  return new Request(`${env.APP_ORIGIN}/api/v1/cart/review${query}`, { method, headers: { Origin: env.APP_ORIGIN!,
    'Content-Type': 'application/json', Cookie: `tmdt_guest_local=${'a'.repeat(43)}`, 'X-CSRF-Token': 'b'.repeat(43), ...headers },
    ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
}
async function expectError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status); expect(await response.json()).toMatchObject({ error: { code } });
  expect(response.headers.get('Cache-Control')).toBe('no-store'); expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
}
describe('08.7 request boundary', () => {
  it.each(['GET', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'])('denies %s', async method => {
    const r = await handleCommerce(req({}, {}, method), env, 'cart', provider()); expect(r.status).toBe(405); expect(r.headers.get('Allow')).toBe('POST');
  });
  it.each(['https://evil.invalid', 'null', ''])('requires exact Origin %s', async origin => {
    const upstream = provider(); await expectError(await handleCommerce(req({}, { Origin: origin }), env, 'session', upstream), 403, 'ORIGIN_NOT_ALLOWED'); expect(upstream).not.toHaveBeenCalled();
  });
  it.each(['cross-site', 'same-site'])('rejects %s metadata', async site => {
    await expectError(await handleCommerce(req({}, { 'Sec-Fetch-Site': site }), env, 'session', provider()), 403, 'ORIGIN_NOT_ALLOWED');
  });
  it('rejects query parameters', async () => expectError(await handleCommerce(req({}, {}, 'POST', '?price=1'), env, 'session', provider()), 400, 'INVALID_COMMERCE_INPUT'));
  it.each(['text/plain', 'application/x-www-form-urlencoded'])('requires JSON %s', async content => {
    await expectError(await handleCommerce(req({}, { 'Content-Type': content }), env, 'session', provider()), 415, 'UNSUPPORTED_MEDIA_TYPE');
  });
  it('rejects encoded body', async () => expectError(await handleCommerce(req({}, { 'Content-Encoding': 'gzip' }), env, 'session', provider()), 415, 'UNSUPPORTED_MEDIA_TYPE'));
  it('limits declared size', async () => expectError(await handleCommerce(req({}, { 'Content-Length': '65537' }), env, 'session', provider()), 413, 'PAYLOAD_TOO_LARGE'));
  it('limits actual streamed size', async () => expectError(await handleCommerce(req({ text: 'x'.repeat(65537) }), env, 'session', provider()), 413, 'PAYLOAD_TOO_LARGE'));
  it('rejects invalid UTF-8', async () => {
    const r = new Request(`${env.APP_ORIGIN}/api/v1/guest/session`, { method: 'POST', headers: { Origin: env.APP_ORIGIN!, 'Content-Type': 'application/json' }, body: new Uint8Array([0xff]) });
    await expectError(await handleCommerce(r, env, 'session', provider()), 400, 'INVALID_COMMERCE_INPUT');
  });
  it.each([
    {}, { items: null }, { items: [{}] }, { items: [{ variant_id: id, quantity: 0 }] }, { items: [{ variant_id: id, quantity: -1 }] },
    { items: [{ variant_id: id, quantity: 1.5 }] }, { items: [{ variant_id: id, quantity: '2' }] }, { items: [{ variant_id: id, quantity: 10001 }] },
    { items: [{ variant_id: 'bad', quantity: 1 }] }, { ...cart, total: 1 }, { items: [{ ...cart.items[0], price: 1 }] },
    { items: [cart.items[0], cart.items[0]] }, { items: Array.from({ length: 51 }, () => cart.items[0]) },
  ])('rejects tampering and malformed cart %#', body => expect(() => input(body, 'cart')).toThrow('INVALID_COMMERCE_INPUT'));
  it.each([
    { ...preview, items: [] }, { ...preview, payment_method: 'card' }, { ...preview, destination: { ...preview.destination, zone: 'cheap' } },
    { ...preview, destination: { province_code: 'TEST-P' } }, { ...preview, shipping_service: '' }, { ...preview, shipping_service: 'x'.repeat(33) },
  ])('rejects malformed preview %#', body => expect(() => input(body, 'preview')).toThrow());
  it('accepts empty cart and normalized IDs', () => { expect(input({ items: [] }, 'cart')).toEqual({ items: [] }); expect(input(cart, 'cart')).toEqual(cart); });
  it('denies duplicate cookies', async () => expectError(await handleCommerce(req({ items: [] }, { Cookie: `tmdt_guest_local=${'a'.repeat(43)}; tmdt_guest_local=${'b'.repeat(43)}` }), env, 'cart', provider()), 400, 'INVALID_COMMERCE_INPUT'));
  it('requires guest cookie', async () => expectError(await handleCommerce(req({ items: [] }, { Cookie: '' }), env, 'cart', provider()), 401, 'GUEST_SESSION_REQUIRED'));
  it('requires CSRF header', async () => expectError(await handleCommerce(req({ items: [] }, { 'X-CSRF-Token': '' }), env, 'cart', provider()), 403, 'CSRF_INVALID'));
  it.each(['SUPABASE_SECRET_KEY', 'REQUEST_HASH_SECRET', 'GUEST_SESSION_TTL_SECONDS'])('fails closed missing %s', async key => {
    await expectError(await handleCommerce(req(), { ...env, [key]: '' }, 'cart', provider()), 503, 'COMMERCE_NOT_CONFIGURED');
  });
  it.each(['0', '59', '86401', '1.5', 'NaN'])('denies invalid TTL %s', async ttl => expectError(await handleCommerce(req(), { ...env, GUEST_SESSION_TTL_SECONDS: ttl }, 'cart', provider()), 503, 'COMMERCE_NOT_CONFIGURED'));
});
describe('08.7 service transport and session', () => {
  it('sends hashes and server secret only; never caller JWT/cookie or raw IP', async () => {
    const fetcher = provider(); const r = await handleCommerce(req({ items: [] }, { Authorization: 'Bearer CALLER', 'CF-Connecting-IP': '1.2.3.4' }), env, 'cart', fetcher);
    expect(r.status).toBe(200); const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe(`${env.SUPABASE_URL}/rest/v1/rpc/commerce_request`); expect(init.redirect).toBe('manual'); expect(init.signal).toBeDefined();
    const h = new Headers(init.headers); expect(h.get('apikey')).toBe(env.SUPABASE_SECRET_KEY); expect(h.has('Authorization')).toBe(false); expect(h.has('Cookie')).toBe(false);
    const args = JSON.parse(String(init.body)); expect(args.session_hash).toMatch(/^[a-f0-9]{64}$/); expect(args.csrf_hash).toMatch(/^[a-f0-9]{64}$/); expect(args.ip_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(String(init.body)).not.toContain('a'.repeat(43)); expect(String(init.body)).not.toContain('1.2.3.4');
    await handleCommerce(req(), env, 'cart', fetcher); expect(JSON.parse(String(fetcher.mock.calls[1]![1].body)).ip_hash).toBe(args.ip_hash);
  });
  it('creates HttpOnly cookie and separate CSRF response', async () => {
    const fetcher = provider({ status: 200, data: { reused: false, expires_at: new Date(Date.now() + 1800000).toISOString() } });
    const r = await handleCommerce(req({}, { Cookie: '' }), env, 'session', fetcher); const body = await r.json();
    expect(r.status).toBe(200); expect(r.headers.get('Set-Cookie')).toMatch(/^tmdt_guest_local=[A-Za-z0-9_-]{43}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=/);
    expect(body.data.csrf_token).toMatch(/^[A-Za-z0-9_-]{43}$/); expect(body.data).not.toHaveProperty('reused');
    expect(String(fetcher.mock.calls[0]![1].body)).not.toContain(body.data.csrf_token);
    const reused = await handleCommerce(req({}), { ...env, GUEST_SESSION_TTL_SECONDS: '60' }, 'session',
      provider({ status: 200, data: { reused: true, expires_at: new Date(Date.now() + 1800000).toISOString() } }));
    expect(reused.status).toBe(200); expect(reused.headers.get('Set-Cookie')).toContain(`tmdt_guest_local=${'a'.repeat(43)}`);
  });
  it('production cookie has __Host and Secure', async () => {
    const production = { ...env, APP_ENV: 'production', APP_ORIGIN: 'https://store.example', SUPABASE_URL: 'https://test.supabase.co' };
    const r = new Request('https://store.example/api/v1/guest/session', { method: 'POST', headers: { Origin: production.APP_ORIGIN, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.1' }, body: '{}' });
    const res = await handleCommerce(r, production, 'session', provider({ status: 200, data: { reused: false, expires_at: new Date(Date.now() + 1800000).toISOString() } }));
    expect(res.status).toBe(200); expect(res.headers.get('Set-Cookie')).toMatch(/^__Host-tmdt_guest=/); expect(res.headers.get('Set-Cookie')).toContain('; Secure'); expect(res.headers.get('Set-Cookie')).not.toContain('Domain=');
  });
  it('logout expires cookie', async () => {
    const r = await handleCommerce(req({}), env, 'logout', provider({ status: 200, data: { logged_out: true } })); expect(r.headers.get('Set-Cookie')).toContain('Max-Age=0');
  });
  it.each([301, 401, 403, 500])('rejects upstream HTTP %i', async status => {
    const fetcher = vi.fn<AuthFetch>(async () => new Response('PRIVATE database detail', { status }));
    await expectError(await handleCommerce(req(), env, 'cart', fetcher), 503, 'COMMERCE_UNAVAILABLE');
  });
  it('handles network failure without exposing diagnostics', async () => {
    await expectError(await handleCommerce(req(), env, 'cart', async () => { throw new Error('PRIVATE key'); }), 503, 'COMMERCE_UNAVAILABLE');
  });
  it('normalizes rate limit and Retry-After', async () => {
    const r = await handleCommerce(req(), env, 'cart', provider({ status: 429, error: 'TOO_MANY_REQUESTS' })); await expectError(r, 429, 'TOO_MANY_REQUESTS'); expect(r.headers.get('Retry-After')).toBe('60');
  });
  it.each([{ error: 'PRIVATE' }, { status: 200, data: null }, { status: 200, data: { ...empty.data, order_created: true } },
    { status: 200, data: { ...empty.data, inventory_reserved: true } }, { status: 200, data: { ...empty.data, submission_enabled: true } },
    { status: 200, data: { ...empty.data, lines: [{ variant_id: id, quantity: 1, issues: [], variant: null, amounts: null }] } },
  ])('rejects invalid upstream shape %#', async data => expectError(await handleCommerce(req(), env, 'cart', provider(data)), 503, 'COMMERCE_UNAVAILABLE'));
  it('removes extra server-only fields', async () => {
    expect(responseDto({ status: 200, data: { ...empty.data, secret: 'PRIVATE' } }, 'cart')).toEqual(empty);
  });
  it('rejects upstream cart with different input', async () => expectError(await handleCommerce(req(cart), env, 'cart', provider()), 503, 'COMMERCE_UNAVAILABLE'));
  it.each(['session', 'logout'] as CommerceAction[])('rejects extra fields in %s', action => expect(() => input({ price: 1 }, action)).toThrow());
});
