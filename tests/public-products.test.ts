import { describe, it, expect, vi } from 'vitest';
import { handlePublicProducts } from '../server/catalog/products';
import type { ProductRoute, ProductParams } from '../server/catalog/products';
import type { CatalogFetch } from '../server/catalog/types';
import type { AuthEnv } from '../server/auth/types';

const env: AuthEnv = { APP_ENV: 'local', APP_ORIGIN: 'http://127.0.0.1:8788', SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_TEST_ONLY', DATA_API_GATEWAY_SECRET: 'g'.repeat(43) };
const id = (n: number) => `50000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const named = { id: id(1), name: 'TEST name', slug: 'test-name' };
const product = { ...named, model_family: null, description: 'TEST description', lifecycle_status: 'active',
  brand: named, product_type: { code: 'ups', name: 'TEST UPS' }, primary_category: named };
const variant = { id: id(20), product_id: id(1), sku: 'TEST/sku 20', model: 'TEST model', variant_label: '',
  lifecycle_status: 'active', sales_mode: 'retail', price: { amount_vnd: '9007199254740993', basis: 'GROSS', tax_status: 'taxable', tax_rate_bps: 0 },
  availability: 'in_stock', warranty: { policy_code: 'test-warranty', name: 'TEST warranty', duration_months: 0,
    start_rule: 'TEST start', provider_name: 'TEST provider', coverage: 'TEST coverage', exclusions: '', process: 'TEST process' }, purchase_enabled: false };
const spec = { code: 'watts', label: 'TEST power', group_code: 'technical', data_type: 'number',
  unit: { code: 'W', name: 'Watt' }, display_order: 0, required_for_publish: true, value_status: 'known', value: '0.000000' };
const page = (items: unknown[] = [], next_cursor: string | null = null) => ({ items, next_cursor });
const provider = (data: unknown = page(), status = 200) => vi.fn<CatalogFetch>(async () => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }));
const req = (query = '', method = 'GET') => new Request(`http://127.0.0.1:8788/api/v1/products${query}`, { method, headers: { Authorization: 'Bearer PRIVATE', Cookie: 'PRIVATE=cookie' } });
const scope = { slug: named.slug, variantId: id(20) };
async function call(data: unknown, route: ProductRoute = 'products', params: ProductParams = {}, query = '') {
  return handlePublicProducts(req(query), env, route, params, provider(data));
}
async function error(response: Response, status = 503, code = 'CATALOG_UNAVAILABLE') {
  expect(response.status).toBe(status); expect(await response.json()).toMatchObject({ error: { code } });
}

describe('08.5 product routes and isolation', () => {
  it.each([
    ['products', {}, page([product]), 'public_products'], ['product', scope, product, 'public_product'],
    ['variants', scope, page([variant]), 'public_product_variants'], ['variant', scope, variant, 'public_product_variant'],
    ['specifications', scope, page([spec]), 'public_variant_specifications'],
  ] as const)('maps %s to the reviewed RPC without caller identity', async (route, params, data, rpc) => {
    const fetcher = provider(data);
    const response = await handlePublicProducts(req(), env, route, params, fetcher);
    expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('no-store');
    const [url, init] = fetcher.mock.calls[0]!; expect(url).toBe(`${env.SUPABASE_URL}/rest/v1/rpc/${rpc}`);
    expect(init.redirect).toBe('manual'); expect(init.method).toBe('POST'); expect(init.signal).toBeDefined();
    const headers = new Headers(init.headers); expect(headers.has('Authorization')).toBe(false); expect(headers.has('Cookie')).toBe(false);
    expect(headers.get('X-Data-Api-Gateway')).toBe(env.DATA_API_GATEWAY_SECRET); expect(headers.get('Content-Profile')).toBe('api');
  });
  it('preserves exact VND, zero rate, zero warranty and unusual SKU characters', async () => {
    const response = await call(variant, 'variant', scope);
    expect(await response.json()).toEqual({ data: variant });
  });
  it('removes internal nested fields', async () => {
    const response = await call({ ...product, lifecycle_reason: 'PRIVATE', brand: { ...named, internal: 'PRIVATE' }, source_note: 'PRIVATE' }, 'product', scope);
    expect(JSON.stringify(await response.json())).not.toContain('PRIVATE');
  });
  it('list omits detail text and reports cursor', async () => {
    const response = await call(page([product], named.slug), 'products', {}, '?limit=1');
    const body = await response.json(); expect(body.data[0]).not.toHaveProperty('description');
    expect(body.page).toEqual({ limit: 1, next_cursor: named.slug, has_more: true });
  });
  it('passes variant cursor and normalizes UUIDs', async () => {
    const fetcher = provider(page());
    const response = await handlePublicProducts(req(`?limit=2&after=${id(20)}`), env, 'variants', scope, fetcher);
    expect(response.status).toBe(200); expect(JSON.parse(String(fetcher.mock.calls[0]![1].body))).toEqual({ requested_slug: named.slug, requested_limit: 2, after_id: id(20) });
  });
  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])('rejects write %s before fetch', async method => {
    const fetcher = provider(); await error(await handlePublicProducts(req('', method), env, 'variant', scope, fetcher), 405, 'METHOD_NOT_ALLOWED'); expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['?limit=0', '?limit=101', '?limit=01', '?limit=', '?limit=1.5', '?limit=1&limit=2', '?after=', '?after=BAD', '?after=x/y', '?search=abc', '?brand=a', '?select=*', '?after=a&after=b'])('rejects unsupported or malformed query %s', async query => {
    const fetcher = provider(); await error(await handlePublicProducts(req(query), env, 'products', {}, fetcher), 400, 'CATALOG_INVALID_QUERY'); expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([
    ['product', {}], ['product', { slug: '../private' }], ['product', { slug: ['test-name'] }],
    ['variant', { slug: named.slug, variantId: 'bad-id' }], ['specifications', { slug: named.slug, variantId: null }],
  ] as const)('validates path parameters %s %j', async (route, params) => {
    await error(await call({}, route, params), 400, 'CATALOG_INVALID_QUERY');
  });
  it('rejects detail query, non-UUID variant cursor and oversized query', async () => {
    await error(await call(product, 'product', scope, '?limit=1'), 400, 'CATALOG_INVALID_QUERY');
    await error(await call(page(), 'variants', scope, '?after=a'), 400, 'CATALOG_INVALID_QUERY');
    await error(await call(page(), 'products', {}, `?after=${'a'.repeat(1100)}`), 400, 'CATALOG_INVALID_QUERY');
  });
  it.each([200, 500])('HEAD is bodyless even for upstream %s', async status => {
    const response = await handlePublicProducts(req('', 'HEAD'), env, 'products', {}, provider(page(), status));
    expect(response.status).toBe(status === 200 ? 200 : 503); expect(await response.text()).toBe('');
  });
  it('reports missing configuration as failure, never fake empty data', async () => {
    await error(await handlePublicProducts(req(), {}, 'products', {}, provider()), 503, 'CATALOG_NOT_CONFIGURED');
  });
  it.each([
    [404, 'PT404', 'CATALOG_NOT_FOUND', 404], [400, '22023', 'CATALOG_INVALID_CURSOR', 400],
    [400, '22023', 'CATALOG_INVALID_QUERY', 400], [403, 'PT403', 'GATEWAY_REQUIRED', 503],
  ] as const)('maps controlled error %s %s', async (status, code, message, expected) => {
    await error(await handlePublicProducts(req(), env, 'products', {}, provider({ code, message, details: 'PRIVATE' }, status)), expected, message === 'GATEWAY_REQUIRED' ? 'CATALOG_NOT_CONFIGURED' : message);
  });
});

describe('08.5 validates upstream data instead of presenting corrupt success', () => {
  it.each([page([product, product]), page([product], 'wrong'), page([product], named.slug), { items: {}, next_cursor: null }])('rejects corrupt product page %j', async data => {
    await error(await call(data));
  });
  it('rejects wrong product or variant detail identifiers', async () => {
    await error(await call({ ...product, slug: 'wrong' }, 'product', scope));
    await error(await call({ ...variant, id: id(99) }, 'variant', scope));
  });
  it.each([
    { purchase_enabled: true }, { lifecycle_status: 'eol' }, { sales_mode: 'quote_only' }, { availability: 'maybe' },
    { price: { ...variant.price, amount_vnd: 9007199254740992 } }, { price: { ...variant.price, amount_vnd: '9223372036854775808' } },
    { price: { ...variant.price, amount_vnd: '0' } }, { price: { ...variant.price, tax_rate_bps: null } },
    { price: { ...variant.price, tax_status: 'unknown' } }, { warranty: { ...variant.warranty, duration_months: -1 } },
  ])('rejects unsafe variant %j', async change => { await error(await call({ ...variant, ...change }, 'variant', scope)); });
  it('allows reference-only EOL with missing price, stock and warranty', async () => {
    expect((await call({ ...variant, lifecycle_status: 'eol', sales_mode: 'not_for_sale', price: null, availability: 'unknown', warranty: null }, 'variant', scope)).status).toBe(200);
  });
  it.each([
    { value: '0.000000' }, { data_type: 'boolean', unit: null, value: false },
    { data_type: 'text', unit: null, value: 'TEST text' }, { data_type: 'enum', unit: null, value: { code: 'yes', label: 'TEST yes' } },
    { data_type: 'multi_enum', unit: null, value: [{ code: 'a', label: 'TEST A' }, { code: 'b', label: 'TEST B' }] },
    { value_status: 'unknown', value: null }, { value_status: 'not_applicable', value: null }, { value_status: 'not_supported', value: null },
  ])('preserves typed spec and explicit status %j', async change => {
    const data = { ...spec, ...change }; const response = await call(page([data]), 'specifications', scope);
    expect(response.status).toBe(200); expect((await response.json()).data).toEqual([data]);
  });
  it.each([
    { value: 0 }, { value: 'NaN' }, { value: '1e9' }, { value: '100000000000000.000000' }, { value: '0.0000001' },
    { value_status: 'unknown', value: '0' }, { value_status: 'known', value: null },
    { data_type: 'boolean', unit: null, value: 'false' }, { data_type: 'boolean', value: false },
    { data_type: 'multi_enum', unit: null, value: [] },
    { data_type: 'multi_enum', unit: null, value: [{ code: 'a', label: 'A' }, { code: 'a', label: 'B' }] },
  ])('rejects ambiguous or malformed spec %j', async change => {
    await error(await call(page([{ ...spec, ...change }]), 'specifications', scope));
  });
  it('rejects repeated pagination anchor', async () => {
    await error(await call(page([variant]), 'variants', scope, `?after=${variant.id}`));
  });
  it('hides transport errors and rejects oversized/non-JSON responses', async () => {
    for (const fetcher of [vi.fn<CatalogFetch>(async () => { throw new Error('PRIVATE'); }),
      vi.fn<CatalogFetch>(async () => new Response('PRIVATE', { headers: { 'Content-Type': 'text/html' } })),
      vi.fn<CatalogFetch>(async () => new Response(JSON.stringify(page()), { headers: { 'Content-Type': 'application/json', 'Content-Length': '300000' } }))]) {
      await error(await handlePublicProducts(req(), env, 'products', {}, fetcher));
    }
  });
});
