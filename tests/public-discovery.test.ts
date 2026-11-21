import { describe, expect, it, vi } from 'vitest';
import { handlePublicDiscovery } from '../server/catalog/discovery';
import { decimalUnits, discoveryQuery } from '../server/catalog/discovery-query';
import type { DiscoveryRoute } from '../server/catalog/discovery-query';
import type { CatalogFetch } from '../server/catalog/types';
import type { AuthEnv } from '../server/auth/types';

const env: AuthEnv = { APP_ENV: 'local', APP_ORIGIN: 'http://127.0.0.1:8788', SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_TEST_ONLY', DATA_API_GATEWAY_SECRET: 'g'.repeat(43) };
const id = (n: number) => `60000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const named = { id: id(1), name: 'TEST', slug: 'test-product' }, type = { code: 'ups', name: 'TEST UPS' };
const item = (n: number) => ({ product: { ...named, model_family: null, lifecycle_status: 'active', brand: named, product_type: type, primary_category: named },
  variant: { id: id(n), product_id: id(1), sku: `TEST-${n}`, model: 'TEST', variant_label: '', lifecycle_status: 'active', sales_mode: 'retail',
    price: null, availability: 'unknown', warranty: null, purchase_enabled: false } });
const metadata = { code: 'power', label: 'TEST power', group_code: 'technical', data_type: 'number', unit: { code: 'W', name: 'Watt' }, display_order: 0 };
const filter = { ...metadata, min_value: '0.000000', max_value: '10000.000000', options: null };
const ids = [id(30), id(31)], idsQuery = `?ids=${ids.join(',')}`;
const row = { ...metadata, cells: ids.map(variant_id => ({ variant_id, value_status: 'known', value: '0.000000' })), comparison: 'equal' };
const comparison = { product_type: type, items: [item(30), item(31)], rows: [row], next_cursor: null };
const emptySearch = { items: [], total: 0, total_products: 0 };
const search = { items: [{ ...item(30), match_type: 'exact' }], total: 1, total_products: 1 };
const provider = (data: unknown, status = 200) => vi.fn<CatalogFetch>(async () => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }));
const request = (query = '', method = 'GET') => new Request(`http://127.0.0.1:8788/api/v1/search${query}`, { method, headers: { Authorization: 'Bearer PRIVATE', Cookie: 'PRIVATE=yes' } });
const queryFilters = (value: unknown, selectedType = 'ups') => `?type=${selectedType}&filters=${encodeURIComponent(JSON.stringify(value))}`;
async function call(data: unknown = emptySearch, query = '', route: DiscoveryRoute = 'search', typeCode: unknown = 'ups') {
  return handlePublicDiscovery(request(query), env, route, typeCode, provider(data));
}
async function failure(response: Response, status = 400, code = 'CATALOG_INVALID_QUERY') {
  expect(response.status).toBe(status); expect(await response.json()).toMatchObject({ error: { code } });
}
describe('08.6 route contract and input', () => {
  it.each([
    ['search', '', search, 'public_search_products'],
    ['filters', '', { product_type: type, items: [filter], next_cursor: null }, 'public_product_filters'],
    ['compare', idsQuery, comparison, 'public_compare_products'],
  ] as const)('calls the closed %s RPC without forwarding identity', async (route, query, data, rpc) => {
    const fetcher = provider(data), response = await handlePublicDiscovery(request(query), env, route, 'ups', fetcher);
    expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('no-store');
    const [url, init] = fetcher.mock.calls[0]!; expect(url).toBe(`${env.SUPABASE_URL}/rest/v1/rpc/${rpc}`); expect(init.redirect).toBe('manual');
    const headers = new Headers(init.headers); expect(headers.has('Authorization')).toBe(false); expect(headers.has('Cookie')).toBe(false);
    expect(headers.get('Content-Profile')).toBe('api'); expect(headers.get('X-Data-Api-Gateway')).toBe(env.DATA_API_GATEWAY_SECRET);
  });
  it('returns real empty search with query echo and count', async () => {
    const response = await call(); expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ data: [], query: { q: '', sort: 'relevance' }, page: { total: 0, total_products: 0, offset: 0, has_more: false, next_offset: null } });
  });
  it('normalizes Unicode/whitespace without stripping SKU separators', () => {
    const parsed = discoveryQuery(request('?q=%20%20UPS-%EF%BC%91%EF%BC%90%EF%BC%90%20%20'), 'search');
    expect(parsed.args).toMatchObject({ requested_query: 'UPS-100' });
  });
  it('preserves exact numeric filter bounds and false options', () => {
    const filters = { power: { min: '99999999999999.000001', max: '99999999999999.000002' }, wifi: { values: [false] } };
    expect(discoveryQuery(request(queryFilters(filters)), 'search').args).toMatchObject({ spec_filters: filters, type_code: 'ups' });
    expect(decimalUnits('-0.000001')).toBe(-1n); expect(decimalUnits('-0.000000')).toBe(0n);
  });
  it.each(['?q=', '?q=x&q=y', '?sort=raw-sql', '?limit=101', '?limit=0', '?limit=01', '?offset=-1', '?offset=5001', '?offset=01',
    '?offset=1e2', '?status=draft', '?brands=a,a', '?brands=a,', '?type=BAD', '?category=Bad', '?q=%00', '?q=%0A'])('rejects query %s before fetching', async query => {
    const fetcher = provider(emptySearch); await failure(await handlePublicDiscovery(request(query), env, 'search', undefined, fetcher)); expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects overlong query/URL and too many brands', async () => {
    await failure(await call(emptySearch, `?q=${'x'.repeat(201)}`));
    await failure(await call(emptySearch, `?q=${'x'.repeat(16385)}`));
    await failure(await call(emptySearch, `?brands=${Array.from({ length: 11 }, (_, i) => `b${i}`).join(',')}`));
  });
  it.each([null, [], { power: {} }, { power: { min: 0 } }, { power: { min: null } }, { power: { min: 'NaN' } },
    { power: { min: '1e3' } }, { power: { min: '0.0000001' } }, { power: { min: '99999999999999.000002', max: '99999999999999.000001' } },
    { power: { min: '1', wrong: '2' } }, { wifi: { values: [] } }, { wifi: { values: [false, false] } },
    { ports: { values: ['usb', 'usb'] } }, { ports: { values: ['BAD'] } }, { power: { values: [3] } },
    { ports: { values: ['usb'], min: '0' } }, { 'bad/code': { min: '1' } }])('rejects malformed filter %j', async filters => {
    await failure(await call(emptySearch, queryFilters(filters)), 400, 'CATALOG_INVALID_FILTER');
  });
  it('requires type for technical filters and limits JSON size/count', async () => {
    await failure(await call(emptySearch, `?filters=${encodeURIComponent('{"power":{"min":"0"}}')}`), 400, 'CATALOG_INVALID_FILTER');
    await failure(await call(emptySearch, '?type=ups&filters=%7B'), 400, 'CATALOG_INVALID_FILTER');
    await failure(await call(emptySearch, queryFilters(Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`p${i}`, { min: '0' }])))), 400, 'CATALOG_INVALID_FILTER');
    await failure(await call(emptySearch, `?type=ups&filters=${encodeURIComponent(' '.repeat(4100))}`), 400, 'CATALOG_INVALID_FILTER');
  });
  it.each(['', '?ids=', `?ids=${id(30)}`, `?ids=${id(30)},${id(30)}`, '?ids=bad,bad2', `?ids=${[30, 31, 32, 33].map(id).join(',')}`, `${idsQuery}&ids=${id(32)}`])('rejects comparison selection %s', async query => {
    await failure(await call(comparison, query, 'compare'));
  });
  it('rejects invalid type and cursor metadata', async () => {
    await failure(await call({}, '', 'filters', ['ups']));
    await failure(await call({}, '?after=BAD', 'filters'));
    await failure(await call({}, '?sort=price_asc', 'filters'));
  });
  it.each(['POST', 'PATCH', 'DELETE', 'OPTIONS'])('rejects method %s before upstream', async method => {
    const fetcher = provider(emptySearch); await failure(await handlePublicDiscovery(request('', method), env, 'search', undefined, fetcher), 405, 'METHOD_NOT_ALLOWED'); expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([200, 500])('HEAD bodyless for %s upstream', async status => {
    const response = await handlePublicDiscovery(request('', 'HEAD'), env, 'search', undefined, provider(emptySearch, status));
    expect(response.status).toBe(status === 200 ? 200 : 503); expect(await response.text()).toBe('');
  });
  it.each(['CATALOG_INVALID_FILTER', 'CATALOG_INCOMPATIBLE_COMPARISON'])('maps controlled SQL %s without diagnostics', async message => {
    await failure(await handlePublicDiscovery(request(), env, 'search', undefined, provider({ code: '22023', message, details: 'PRIVATE' }, 400)), 400, message);
  });
  it('configuration or upstream failure never becomes empty success', async () => {
    await failure(await handlePublicDiscovery(request(), {}, 'search', undefined, provider(emptySearch)), 503, 'CATALOG_NOT_CONFIGURED');
    await failure(await handlePublicDiscovery(request(), env, 'search', undefined, provider({ message: 'PRIVATE' }, 500)), 503, 'CATALOG_UNAVAILABLE');
  });
});

describe('08.6 DTO consistency and unknown comparison', () => {
  it('strips private fields at every level', async () => {
    const response = await call({ ...search, internal: 'PRIVATE', items: search.items.map(i => ({ ...i, hidden: 'PRIVATE', variant: { ...i.variant, source: 'PRIVATE' } })) });
    expect(response.status).toBe(200); expect(JSON.stringify(await response.json())).not.toContain('PRIVATE');
  });
  it.each([
    { ...search, total: -1 }, { ...search, total: 2 }, { ...search, total_products: 2 }, { ...search, total_products: 0 },
    { ...search, items: [{ ...item(30), match_type: 'magic' }] },
    { ...search, items: [{ ...item(30), variant: { ...item(30).variant, product_id: id(99) }, match_type: 'text' }] },
    { items: [search.items[0], search.items[0]], total: 2, total_products: 1 },
  ])('rejects corrupt search result', async data => { await failure(await call(data), 503, 'CATALOG_UNAVAILABLE'); });
  it('checks returned brand and type scopes', async () => {
    await failure(await call(search, '?type=ram'), 503, 'CATALOG_UNAVAILABLE');
    await failure(await call(search, '?brands=other-brand'), 503, 'CATALOG_UNAVAILABLE');
  });
  it('reports more results with bounded continuation and explicit truncation', async () => {
    const first = await call({ ...search, total: 2 }, '?limit=1');
    expect((await first.json()).page).toMatchObject({ next_offset: 1, has_more: true, truncated: false });
    const end = await call({ ...search, total: 5002 }, '?limit=1&offset=5000');
    expect((await end.json()).page).toMatchObject({ next_offset: null, has_more: true, truncated: true });
  });
  it('preserves complete filter metadata and strips option internals', async () => {
    const data = { product_type: type, items: [{ ...filter, data_type: 'enum', unit: null, min_value: null, max_value: null, options: [{ code: 'a', label: 'TEST A', internal: 'PRIVATE' }] }], next_cursor: null };
    const response = await call(data, '', 'filters'); expect(response.status).toBe(200); expect(JSON.stringify(await response.json())).not.toContain('PRIVATE');
  });
  it.each([
    { ...filter, data_type: 'text' }, { ...filter, min_value: 'NaN' }, { ...filter, min_value: '10', max_value: '0' },
    { ...filter, options: [] }, { ...filter, data_type: 'boolean', unit: null },
    { ...filter, data_type: 'enum', unit: null, min_value: null, max_value: null, options: [{ code: 'a', label: 'A' }, { code: 'a', label: 'B' }] },
  ])('rejects corrupt filter metadata', async f => {
    await failure(await call({ product_type: type, items: [f], next_cursor: null }, '', 'filters'), 503, 'CATALOG_UNAVAILABLE');
  });
  it('accepts equal/different/incomplete and preserves columns', async () => {
    for (const [values, status] of [[['0.000000', '0.000000'], 'equal'], [['0.000000', '1.000000'], 'different'], [[null, null], 'incomplete']] as const) {
      const r = { ...row, comparison: status, cells: ids.map((variant_id, i) => ({ variant_id, value_status: values[i] === null ? 'unknown' : 'known', value: values[i] })) };
      const response = await call({ ...comparison, rows: [r] }, idsQuery, 'compare'); expect(response.status).toBe(200); expect((await response.json()).data.rows[0].comparison).toBe(status);
    }
  });
  it('rejects false equality when both values are unknown', async () => {
    const r = { ...row, cells: ids.map(variant_id => ({ variant_id, value_status: 'unknown', value: null })) };
    await failure(await call({ ...comparison, rows: [r] }, idsQuery, 'compare'), 503, 'CATALOG_UNAVAILABLE');
  });
  it('distinguishes known false from not_supported', async () => {
    const r = { ...row, data_type: 'boolean', unit: null, comparison: 'different', cells: [
      { variant_id: ids[0], value_status: 'known', value: false }, { variant_id: ids[1], value_status: 'not_supported', value: null }] };
    expect((await call({ ...comparison, rows: [r] }, idsQuery, 'compare')).status).toBe(200);
  });
  it('compares multi-enum sets and precise numeric decimals', async () => {
    const options = [{ code: 'a', label: 'A' }, { code: 'b', label: 'B' }];
    const r = { ...row, data_type: 'multi_enum', unit: null, cells: ids.map((variant_id, i) => ({ variant_id, value_status: 'known', value: i ? [...options].reverse() : options })) };
    expect((await call({ ...comparison, rows: [r] }, idsQuery, 'compare')).status).toBe(200);
    const numeric = { ...row, cells: [{ variant_id: ids[0], value_status: 'known', value: '0' }, row.cells[1]] };
    expect((await call({ ...comparison, rows: [numeric] }, idsQuery, 'compare')).status).toBe(200);
  });
  it.each([
    { ...comparison, items: [...comparison.items].reverse() },
    { ...comparison, product_type: { ...type, code: 'ram' } },
    { ...comparison, rows: [{ ...row, cells: [...row.cells].reverse() }] },
    { ...comparison, rows: [{ ...row, comparison: 'different' }] },
    { ...comparison, rows: [row, row] },
    { ...comparison, next_cursor: 'other' },
  ])('rejects mixed, reordered or inconsistent comparison', async data => { await failure(await call(data, idsQuery, 'compare'), 503, 'CATALOG_UNAVAILABLE'); });
});
