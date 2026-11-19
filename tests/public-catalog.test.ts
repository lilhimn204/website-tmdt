import { describe, expect, it, vi } from 'vitest';
import { handlePublicCatalog } from '../server/catalog/handler';
import type { AuthEnv } from '../server/auth/types';
import type { CatalogFetch, CatalogKind } from '../server/catalog/types';

const env: AuthEnv = { APP_ENV: 'local', APP_ORIGIN: 'http://127.0.0.1:8788', SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_UNIT_TEST_ONLY', DATA_API_GATEWAY_SECRET: 'g'.repeat(43) };
const brand = { id: '40000000-0000-0000-0000-000000000001', name: 'TEST brand', slug: 'test-brand' };
const category = { ...brand, name: 'TEST category', slug: 'test-category', parent_slug: null, sort_order: 0, product_type: null };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const provider = (body: unknown = { items: [], next_cursor: null }, status = 200) => vi.fn(async () => json(body, status));
const req = (query = '', method = 'GET', headers?: Record<string, string>) => new Request(`${env.APP_ORIGIN}/api/v1/brands${query}`, { method, headers: headers ?? {} });
async function code(response: Response, status: number, expected: string) {
  expect(response.status).toBe(status); expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(await response.json()).toHaveProperty('error.code', expected);
}

describe('08.4 public catalog HTTP contract', () => {
  it('returns real empty data, pagination and no-store without pretending there are products', async () => {
    const response = await handlePublicCatalog(req(), env, 'brands', undefined, provider());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: [], page: { limit: 20, next_cursor: null, has_more: false } });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
  it('uses only the publishable key and gateway; never forwards caller identity or arbitrary query arguments', async () => {
    const fetcher = vi.fn<CatalogFetch>(async () => json({ items: [brand], next_cursor: brand.slug }));
    const response = await handlePublicCatalog(req('?limit=1&after=earlier', 'GET', { Authorization: 'Bearer private', Cookie: 'private' }), env, 'brands', undefined, fetcher);
    expect(response.status).toBe(200);
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe(`${env.SUPABASE_URL}/rest/v1/rpc/public_brands`);
    expect(init.redirect).toBe('manual'); expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ requested_limit: 1, after_slug: 'earlier' }));
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBeNull(); expect(headers.get('Cookie')).toBeNull();
    expect(headers.get('apikey')).toBe(env.SUPABASE_PUBLISHABLE_KEY); expect(headers.get('X-Data-Api-Gateway')).toBe(env.DATA_API_GATEWAY_SECRET);
    expect(await response.json()).toHaveProperty('page.has_more', true);
  });
  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])('rejects %s without an upstream call', async method => {
    const fetcher = provider();
    const response = await handlePublicCatalog(req('', method), env, 'brands', undefined, fetcher);
    await code(response, 405, 'METHOD_NOT_ALLOWED'); expect(response.headers.get('Allow')).toBe('GET, HEAD'); expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['?limit=0', '?limit=101', '?limit=1.5', '?limit=01', '?limit=-1', '?limit=1e2', '?limit=', '?limit=1&limit=2', '?select=*', '?status=draft', '?after=', '?after=Bad', '?after=a%2Fb', '?access_token=secret', '?parent=a'])('rejects invalid brand query %s before requesting data', async query => {
    const fetcher = provider();
    await code(await handlePublicCatalog(req(query), env, 'brands', undefined, fetcher), 400, 'CATALOG_INVALID_QUERY');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['', 'UPPER', '../brands', 'a'.repeat(161), ['wrong'], null])('rejects invalid detail identifier %j', async slug => {
    await code(await handlePublicCatalog(req(), env, 'brands', slug, provider()), 400, 'CATALOG_INVALID_QUERY');
  });
  it('rejects detail query parameters and oversized URL queries', async () => {
    await code(await handlePublicCatalog(req('?limit=1'), env, 'brands', brand.slug, provider()), 400, 'CATALOG_INVALID_QUERY');
    await code(await handlePublicCatalog(req(`?after=${'a'.repeat(1100)}`), env, 'brands', undefined, provider()), 400, 'CATALOG_INVALID_QUERY');
  });
  it('projects only public brand fields', async () => {
    const response = await handlePublicCatalog(req(), env, 'brands', brand.slug, provider({ ...brand, description: 'TEST description', logo_asset_id: 'private', status: 'active', internal: 'secret' }));
    expect(await response.json()).toEqual({ data: { ...brand, description: 'TEST description' } });
  });
  it('projects category type and breadcrumbs without internal fields', async () => {
    const value = { ...category, parent_slug: 'root', product_type: { code: 'ups', name: 'TEST UPS', internal: 'secret' }, breadcrumbs: [{ name: 'Root', slug: 'root', id: 'private' }, { name: category.name, slug: category.slug }] };
    const response = await handlePublicCatalog(req(), env, 'categories', category.slug, provider(value));
    expect(response.status).toBe(200); expect(JSON.stringify(await response.json())).not.toMatch(/secret|private/);
  });
  it('passes category parent and validates the returned parent', async () => {
    const fetcher = vi.fn<CatalogFetch>(async () => json({ items: [{ ...category, parent_slug: 'root' }], next_cursor: null }));
    expect((await handlePublicCatalog(req('?parent=root'), env, 'categories', undefined, fetcher)).status).toBe(200);
    expect(JSON.parse(String(fetcher.mock.calls[0]![1].body))).toEqual({ requested_limit: 20, after_slug: null, parent_slug: 'root' });
    await code(await handlePublicCatalog(req('?parent=root'), env, 'categories', undefined, provider({ items: [category], next_cursor: null })), 503, 'CATALOG_UNAVAILABLE');
  });
  it.each(['?parent=', '?parent=UPPER', '?parent=root&parent=other'])('rejects invalid category query %s', async query => {
    await code(await handlePublicCatalog(req(query), env, 'categories', undefined, provider()), 400, 'CATALOG_INVALID_QUERY');
  });
  it.each([false, true])('returns bodyless HEAD responses, including errors (%s)', async fails => {
    const response = await handlePublicCatalog(req('', 'HEAD'), env, 'brands', undefined, fails ? provider({}, 500) : provider());
    expect(response.status).toBe(fails ? 503 : 200); expect(await response.text()).toBe('');
  });
});

describe('08.4 failures do not masquerade as empty data', () => {
  it('fails closed without bindings', async () => {
    await code(await handlePublicCatalog(req(), {}, 'brands', undefined, provider()), 503, 'CATALOG_NOT_CONFIGURED');
  });
  it.each([
    [404, 'PT404', 'CATALOG_NOT_FOUND', 404], [400, '22023', 'CATALOG_INVALID_CURSOR', 400],
    [400, '22023', 'CATALOG_INVALID_QUERY', 400], [403, 'PT403', 'GATEWAY_REQUIRED', 503],
  ])('maps controlled database error %s / %s / %s', async (status, sqlCode, message, expected) => {
    await code(await handlePublicCatalog(req(), env, 'brands', undefined, provider({ code: sqlCode, message, details: 'private' }, Number(status))), Number(expected), message === 'GATEWAY_REQUIRED' ? 'CATALOG_NOT_CONFIGURED' : String(message));
  });
  it.each([401, 403, 404, 500, 502])('hides arbitrary upstream failure %s', async status => {
    const response = await handlePublicCatalog(req(), env, 'brands', undefined, provider({ code: 'XX000', message: 'private diagnostic' }, status));
    await code(response, 503, 'CATALOG_UNAVAILABLE');
  });
  it('maps upstream throttling without leaking its response', async () => {
    await code(await handlePublicCatalog(req(), env, 'brands', undefined, provider({}, 429)), 429, 'CATALOG_RATE_LIMITED');
  });
  it('rejects redirects without forwarding secrets and handles connection loss', async () => {
    const fetcher = vi.fn(async () => Response.redirect('https://untrusted.invalid', 302));
    await code(await handlePublicCatalog(req(), env, 'brands', undefined, fetcher), 503, 'CATALOG_UNAVAILABLE'); expect(fetcher).toHaveBeenCalledTimes(1);
    await code(await handlePublicCatalog(req(), env, 'brands', undefined, async () => { throw new Error('private network diagnostic'); }), 503, 'CATALOG_UNAVAILABLE');
  });
  it.each([null, {}, { items: [], next_cursor: 'orphan' }, { items: [brand, brand], next_cursor: null }, { items: [{ ...brand, id: 'bad' }], next_cursor: null }, { items: [], next_cursor: false }])('rejects malformed list %j', async body => {
    await code(await handlePublicCatalog(req(), env, 'brands', undefined, provider(body)), 503, 'CATALOG_UNAVAILABLE');
  });
  it('rejects too many items and mismatched detail identity', async () => {
    await code(await handlePublicCatalog(req('?limit=1'), env, 'brands', undefined, provider({ items: [brand, { ...brand, id: '40000000-0000-0000-0000-000000000002', slug: 'other' }], next_cursor: null })), 503, 'CATALOG_UNAVAILABLE');
    await code(await handlePublicCatalog(req(), env, 'brands', 'other', provider({ ...brand, description: '' })), 503, 'CATALOG_UNAVAILABLE');
  });
  it.each([
    { ...category, product_type: {} }, { ...category, sort_order: 1.5 },
    { ...category, breadcrumbs: [] }, { ...category, breadcrumbs: [{ slug: 'other', name: 'Other' }] },
    { ...category, parent_slug: 'missing', breadcrumbs: [{ slug: category.slug, name: category.name }] },
  ])('rejects malformed category detail %j', async body => {
    await code(await handlePublicCatalog(req(), env, 'categories', category.slug, provider(body)), 503, 'CATALOG_UNAVAILABLE');
  });
  it('rejects HTML, invalid JSON, invalid UTF-8 and oversized responses', async () => {
    const responses = [new Response('<html>private</html>'), new Response('{bad', { headers: { 'Content-Type': 'application/json' } }),
      new Response(new Uint8Array([0xff]), { headers: { 'Content-Type': 'application/json' } }), json({ padding: 'x'.repeat(256 * 1024) })];
    for (const response of responses) await code(await handlePublicCatalog(req(), env, 'brands', undefined, async () => response), 503, 'CATALOG_UNAVAILABLE');
  });
  it.each(['brands', 'categories'] as CatalogKind[])('does not expose a public data write for %s', async kind => {
    await code(await handlePublicCatalog(req('', 'POST'), env, kind, brand.slug, provider()), 405, 'METHOD_NOT_ALLOWED');
  });
});
