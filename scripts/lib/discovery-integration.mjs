import { readFileSync } from 'node:fs';

// Only called by the disposable integration runner, never the application DB.
export async function checkDiscovery({ sql, api, origin, publishable, gateway }) {
  let checks = 0;
  const ensure = (ok, label) => { if (!ok) throw new Error(`Discovery integration: ${label}`); };
  const pass = label => { checks++; console.log(`DISCOVERY PASS ${checks}: ${label}`); };
  const id = n => `60000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
  const compare = (...values) => `compare?ids=${values.map(id).join(',')}`;
  const search = (q = '', filters = null, type = 'discovery-ups') => {
    const params = new URLSearchParams(); if (q) params.set('q', q);
    if (filters) { params.set('type', type); params.set('filters', JSON.stringify(filters)); }
    return `search?${params}`;
  };
  async function http(path, options) {
    const response = await fetch(`${origin}/api/v1/${path}`, options);
    return { status: response.status, body: await response.json().catch(() => null), headers: response.headers };
  }
  const empty = await http('search');
  ensure(empty.status === 200 && empty.body.page.total === 0 && empty.body.data.length === 0, 'empty public catalog');
  pass('search sees no invented data or earlier withdrawn fixtures');
  const fixture = readFileSync(new URL('../../supabase/tests/database/08_discovery.test.sql', import.meta.url), 'utf8').split('-- BEGIN DISCOVERY FIXTURE')[1].split('-- END DISCOVERY FIXTURE')[0];
  sql(`begin;${fixture}commit;`);
  const ranked = await http(search(' ups-100 '));
  ensure(ranked.status === 200 && ranked.body.data.map(i => i.variant.id).join(',') === [id(30), id(31)].join(',')
    && ranked.body.data[0].match_type === 'exact' && ranked.body.data[1].match_type === 'prefix', 'exact/prefix ordering');
  pass('SKU exact matches precede literal prefix matches');
  ensure((await http(search('UPS100'))).body.page.total === 1 && (await http(search('m-one'))).body.data[0].variant.id === id(30), 'identifier semantics');
  pass('model matching works and SKU separators retain meaning');
  const accent = await http(search('BỘ   LƯU điện')), plain = await http(search('bo luu DIEN'));
  ensure(accent.body.page.total === 2 && JSON.stringify(accent.body.data) === JSON.stringify(plain.body.data), 'Vietnamese normalization');
  pass('Vietnamese accents/case/extra spaces return the same variants');
  ensure((await http(search('anh duong'))).body.page.total === 3, 'brand name search');
  pass('brand name search finds products whose title omits that brand');
  for (const q of ['PRIVATE', 'SECRET-SKU', '%', '_']) ensure((await http(search(q))).body.page.total === 0, 'private/wildcard query');
  pass('private rows and wildcard-shaped input cannot broaden results');
  const first = await http('search?limit=2'), next = await http('search?limit=2&offset=2');
  ensure(first.body.page.total === 5 && first.body.page.total_products === 4 && first.body.page.next_offset === 2
    && next.body.data[0].variant.id === id(32) && next.body.page.next_offset === 4, 'pagination/count');
  pass('bounded pagination has exact SKU/product counts and stable continuation');
  ensure((await http('search?category=discovery-root')).body.page.total === 4 && (await http('search?type=discovery-ram')).body.page.total === 1, 'scope');
  pass('category descendants and technical type constrain both results and counts');
  const asc = await http('search?sort=price_asc'), desc = await http('search?sort=price_desc');
  ensure(asc.body.data[0].variant.id === id(33) && asc.body.data.at(-1).variant.id === id(32)
    && desc.body.data.at(-1).variant.id === id(32), 'price null ordering');
  pass('price ordering preserves exact amounts and puts quote-only last in both directions');
  const filters = await http('product-types/discovery-ups/filters');
  ensure(filters.status === 200 && filters.body.data.filters.length === 6 && filters.body.data.filters[0].unit.code === 'DISC-W'
    && !JSON.stringify(filters.body).includes('PRIVATE'), 'filter definitions');
  pass('filter metadata is active/type-specific with canonical units and approved options');
  const filterPage = await http('product-types/discovery-ups/filters?limit=1&after=discovery-power');
  ensure(filterPage.body.data.filters[0].code === 'discovery-interface' && filterPage.body.page.has_more, 'filter page');
  pass('filter metadata supports bounded cursor pagination');
  const zero = await http(search('', { 'discovery-power': { min: '0', max: '0' } }));
  const falseValue = await http(search('', { 'discovery-wifi': { values: [false] } }));
  ensure(zero.body.page.total === 2 && falseValue.body.page.total === 2, 'zero/false filter');
  pass('inclusive numeric zero and verified false filter correctly; unknowns do not match');
  const impossible = await http(search('', { 'discovery-power': { max: '0' }, 'discovery-interface': { values: ['nvme'] } }));
  ensure(impossible.status === 200 && impossible.body.page.total === 0, 'cross-SKU conjunction');
  pass('AND filters cannot splice properties of two variants into a fictitious SKU');
  const multi = await http(search('', { 'discovery-interface': { values: ['usb', 'nvme'] }, 'discovery-ports': { values: ['usb'] } }));
  ensure(multi.body.page.total === 3, 'OR/AND options');
  pass('enum/multi-enum choices use OR within an attribute and AND across attributes');
  for (const [rule, type] of [[{ 'discovery-wifi': { values: ['false'] } }, 'discovery-ups'],
    [{ 'discovery-interface': { values: ['usb'] } }, 'discovery-ram'], [{ 'discovery-not-filterable': { min: '0' } }, 'discovery-ups']]) {
    const result = await http(search('', rule, type)); ensure(result.status === 400 && result.body.error.code === 'CATALOG_INVALID_FILTER', 'semantic invalid filter');
  }
  pass('wrong types, stale cross-type filters and nonfilterable definitions fail explicitly');
  const compared = await http(compare(31, 30));
  ensure(compared.status === 200 && compared.body.data.items[0].variant.id === id(31) && compared.body.data.rows[0].comparison === 'different', 'comparison order/difference');
  pass('comparison retains selected column order and detects known differences');
  const incomplete = compared.body.data.rows.find(r => r.code === 'discovery-missing');
  ensure(incomplete.comparison === 'incomplete' && incomplete.cells.every(c => c.value_status === 'unknown' && c.value === null), 'unknown equality');
  pass('two unknown values are incomplete, never falsely equal');
  const equal = await http(compare(30, 36));
  ensure(equal.body.data.rows[0].comparison === 'equal' && equal.body.data.items[1].variant.sales_mode === 'not_for_sale', 'EOL/equality');
  const triple = await http(compare(30, 31, 36)); ensure(triple.status === 200 && triple.body.data.items.length === 3, 'three SKU comparison');
  pass('2–3 same-type SKUs compare with current EOL sale blocks');
  const cmpPage = await http(`${compare(30, 31)}&limit=1&after=discovery-power`);
  ensure(cmpPage.body.data.rows[0].code === 'discovery-interface' && cmpPage.body.page.has_more, 'comparison rows page');
  pass('comparison attributes paginate without losing selected columns');
  ensure((await http(compare(30, 33))).body.error.code === 'CATALOG_INCOMPATIBLE_COMPARISON'
    && (await http(compare(30, 35))).status === 404 && (await http(compare(30, 99))).status === 404, 'comparison selection guard');
  pass('mixed types and hidden/missing selections are rejected before exposing a table');
  for (const path of ['search?q=', 'search?limit=101', 'search?offset=5001', 'search?q=a&q=b', 'search?select=*',
    compare(30), compare(30, 30), compare(30, 31, 32, 36)]) ensure((await http(path)).status === 400, 'query guard');
  pass('URL/selection bounds and duplicate parameters are enforced by real Pages routes');
  for (const path of ['search', 'product-types/discovery-ups/filters', compare(30, 31)]) {
    const head = await fetch(`${origin}/api/v1/${path}`, { method: 'HEAD' });
    ensure(head.status === 200 && (await head.text()) === '' && head.headers.get('Cache-Control') === 'no-store', 'HEAD');
    ensure((await http(path, { method: 'POST' })).status === 405, 'readonly');
  }
  pass('all discovery routes are GET/HEAD only and use no-store');
  ensure((await http('search', { headers: { Authorization: 'Bearer bad-token', Cookie: 'private=ignored' } })).status === 200, 'public identity isolation');
  pass('caller identity cannot change public discovery permissions');
  const headers = { apikey: publishable, 'Content-Type': 'application/json', 'Content-Profile': 'api' };
  const bypass = await fetch(`${api}/rest/v1/rpc/public_search_products`, { method: 'POST', headers, body: '{}' });
  ensure(bypass.status === 403, 'gateway');
  const invalid = await fetch(`${api}/rest/v1/rpc/public_search_products`, { method: 'POST', headers: { ...headers, 'X-Data-Api-Gateway': gateway }, body: '{"requested_offset":5001}' });
  ensure(invalid.status === 400 && (await invalid.json()).message === 'CATALOG_INVALID_QUERY', 'SQL independently validates');
  pass('gateway and independent SQL input guards remain active');
  sql(`update app.specification_options set status='archived' where id='${id(62)}';`);
  ensure((await http(search('', { 'discovery-ports': { values: ['lan'] } }))).body.page.total === 1, 'partial multi-enum');
  pass('archived selected option makes the whole multi-enum unknown for filtering');
  sql(`update app.brands set name='TEST Đổi Tên' where id='${id(2)}';`);
  ensure((await http(search('doi ten'))).body.page.total === 3 && (await http(search('anh duong'))).body.page.total === 0, 'brand refresh');
  pass('brand rename updates all related search documents in the same transaction');
  sql(`update app.products set name='TEST Tên Mới' where id='${id(20)}';`);
  ensure((await http(search('ten moi'))).body.page.total === 2 && (await http(search('bo luu dien'))).body.page.total === 0, 'product refresh');
  pass('product rename refreshes variant search results immediately');
  sql(`update app.product_variants set data_status='draft' where id='${id(30)}';`);
  ensure((await http(compare(30, 31))).status === 404 && (await http(search('UPS-100'))).body.page.total === 1, 'withdrawal');
  pass('withdrawing a SKU invalidates comparison and search without stale public results');
  sql(`update app.categories set status='archived' where id='${id(8)}';`);
  ensure((await http('search')).body.page.total === 1, 'ancestor count');
  pass('withdrawing an ancestor changes result counts and visibility together');
  sql("update private.gateway_secrets set valid_until=now()-interval '1 second';");
  const failure = await http('search'); ensure(failure.status === 503 && !('data' in failure.body), 'not empty on failure');
  sql("update private.gateway_secrets set valid_until=null where slot='current';");
  pass('configuration failures remain explicit errors without credentials or fabricated data');
  console.log(`Discovery integration: ${checks} checks passed with real PostgreSQL, PostgREST and Pages Functions.`);
}
