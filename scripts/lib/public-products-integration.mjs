import { readFileSync } from 'node:fs';

// Invoked only against website-tmdt-auth-test; the runner removes this stack.
export async function checkPublicProducts({ sql, api, origin, publishable, gateway }) {
  let checks = 0;
  const ensure = (condition, label) => { if (!condition) throw new Error(`Products integration: ${label}`); };
  const pass = label => { checks++; console.log(`PRODUCT PASS ${checks}: ${label}`); };
  const id = n => `50000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
  const skuPath = (product = 10, variant = 20) => `products/test-product-${product}/variants/${id(variant)}`;
  async function http(path, options) {
    const response = await fetch(`${origin}/api/v1/${path}`, options);
    return { status: response.status, body: await response.json().catch(() => null), headers: response.headers };
  }
  const empty = await http('products');
  ensure(empty.status === 200 && empty.body.data.length === 0, 'unseeded products'); pass('no invented products in empty database');
  sql(`begin;\n${readFileSync(new URL('../../supabase/tests/database/08_public_products.test.sql', import.meta.url), 'utf8').split('-- BEGIN PRODUCT FIXTURE')[1].split('-- END PRODUCT FIXTURE')[0]}\ncommit;`);
  const first = await http('products?limit=2');
  ensure(first.status === 200 && first.body.data.map(p => p.slug).join(',') === 'test-product-10,test-product-11' && first.body.page.next_cursor === 'test-product-11', 'first product page');
  pass('public products paginate in stable slug order');
  const second = await http('products?limit=2&after=test-product-11');
  ensure(second.body.data.map(p => p.slug).join(',') === 'test-product-14,test-product-15' && !second.body.page.has_more, 'terminal product page');
  pass('EOL/discontinued remain readable; drafts and products without ready SKUs hidden');
  const product = await http('products/test-product-10');
  ensure(product.status === 200 && product.body.data.description === 'TEST description' && !JSON.stringify(product.body).includes('PRIVATE'), 'product projection');
  pass('product detail returns only public metadata');
  const missing = await http('products/missing');
  for (const n of [12, 13, 16]) {
    const hidden = await http(`products/test-product-${n}`);
    ensure(hidden.status === 404 && JSON.stringify(hidden.body) === JSON.stringify(missing.body), '404 parity');
  }
  pass('hidden, draft, not-ready and absent products share the same 404');
  const variants = await http('products/test-product-10/variants?limit=1');
  ensure(variants.status === 200 && variants.body.data[0].id === id(20) && variants.body.page.next_cursor === id(20), 'variant pagination');
  const moreVariants = await http(`products/test-product-10/variants?limit=1&after=${id(20)}`);
  ensure(moreVariants.body.data.length === 1 && moreVariants.body.data[0].id === id(21) && !moreVariants.body.page.has_more, 'variant continuation');
  pass('ready variants paginate by UUID and omit draft SKU');
  const variant = await http(skuPath());
  ensure(variant.status === 200 && variant.body.data.sku === 'TEST/sku 20' && variant.body.data.price.amount_vnd === '9007199254740993'
    && variant.body.data.price.tax_rate_bps === 0 && !variant.body.data.purchase_enabled, 'exact price and no checkout');
  pass('exact VND string and zero tax survive PostgreSQL, PostgREST and workerd');
  ensure(variant.body.data.warranty.duration_months === 0 && !JSON.stringify(variant.body).match(/approved_by|on_hand|reserved|current_price_id/), 'warranty and internal projection');
  pass('explicit SKU warranty preserves zero; internal price/stock fields remain private');
  const quote = await http(skuPath(10, 21)), unknown = await http(skuPath(11, 23));
  ensure(variant.body.data.availability === 'in_stock' && quote.body.data.availability === 'out_of_stock' && unknown.body.data.availability === 'unknown', 'stock states');
  pass('positive, zero and missing inventory have distinct states');
  ensure(quote.body.data.price === null && quote.body.data.warranty === null && unknown.body.data.price === null, 'no price/warranty inference');
  pass('quote-only/future approval do not publish prices; warranty never inherited implicitly');
  for (const [p, v] of [[14, 26], [15, 27]]) {
    const data = (await http(skuPath(p, v))).body.data;
    ensure(data.sales_mode === 'not_for_sale' && data.purchase_enabled === false, 'lifecycle sell block');
  }
  pass('EOL and discontinued explicitly prevent sale even with remaining inventory');
  for (const path of [skuPath(10, 23), skuPath(10, 22), `${skuPath(10, 23)}/specifications`]) ensure((await http(path)).status === 404, 'variant scope');
  pass('cross-product and draft SKU access denied on detail and specifications');
  ensure((await http(`products/test-product-10/variants?after=${id(23)}`)).body.error.code === 'CATALOG_INVALID_CURSOR', 'cursor scope');
  pass('variant cursor cannot cross product boundary');
  const specifications = await http(`${skuPath()}/specifications?limit=100`);
  ensure(specifications.status === 200 && specifications.body.data.length === 9, 'active definitions');
  const byCode = Object.fromEntries(specifications.body.data.map(s => [s.code, s]));
  ensure(byCode['test-number'].value === '0.000000' && byCode['test-boolean'].value === false, 'zero/false');
  pass('typed specification zero and false remain known values');
  ensure(byCode['test-text'].value_status === 'unknown' && byCode['test-missing'].value_status === 'unknown'
    && byCode['test-na'].value_status === 'not_applicable' && byCode['test-unsupported'].value_status === 'not_supported'
    && !JSON.stringify(specifications.body).match(/PRIVATE|source_note|verified_by/), 'unknown/unverified distinctions');
  pass('missing/unverified, not applicable and unsupported are distinct with no draft/source leaks');
  ensure(byCode['test-multi'].value.length === 2 && byCode['test-enum'].value.code === 'test-option', 'enum projection');
  pass('enum and multi-enum return complete public code/label values');
  const specPage = await http(`${skuPath()}/specifications?limit=1&after=test-number`);
  ensure(specPage.body.data[0].code === 'test-boolean' && specPage.body.page.next_cursor === 'test-boolean', 'spec order');
  pass('specification pagination follows display order and definition code');
  sql(`update app.specification_options set status='archived' where id in ('${id(60)}','${id(62)}');`);
  const withdrawnOptions = (await http(`${skuPath()}/specifications?limit=100`)).body.data;
  ensure(withdrawnOptions.filter(s => ['test-multi', 'test-enum'].includes(s.code)).every(s => s.value_status === 'unknown' && s.value === null), 'partial option set');
  pass('archiving one selected option invalidates the complete value, not just that element');
  const publicIdentity = await http('products', { headers: { Authorization: 'Bearer invalid', Cookie: 'private=ignored' } });
  ensure(publicIdentity.status === 200 && publicIdentity.body.data.length === 4, 'public identity'); pass('caller tokens cannot elevate public product reads');
  for (const path of ['products?search=test', 'products?limit=0', 'products?limit=101', 'products?limit=1&limit=2',
    'products/test-product-10?select=*', 'products/test-product-10/variants/not-a-uuid', `${skuPath()}/specifications?after=test-private`]) ensure((await http(path)).status === 400, 'query errors');
  pass('real Pages routing validates query allowlist, page bounds, UUID and private cursors');
  for (const path of ['products', 'products/test-product-10', 'products/test-product-10/variants', skuPath(), `${skuPath()}/specifications`]) {
    const head = await fetch(`${origin}/api/v1/${path}`, { method: 'HEAD' });
    ensure(head.status === 200 && (await head.text()) === '' && head.headers.get('Cache-Control') === 'no-store', 'HEAD');
    ensure((await http(path, { method: 'POST' })).status === 405, 'read-only');
  }
  pass('all five routes implement bodyless HEAD/no-store and reject writes');
  const headers = { apikey: publishable, 'Content-Type': 'application/json', 'Content-Profile': 'api' };
  const bypass = await fetch(`${api}/rest/v1/rpc/public_products`, { method: 'POST', headers, body: '{}' });
  ensure(bypass.status === 403, 'gateway bypass'); pass('direct product RPC still requires server gateway');
  const invalidSql = await fetch(`${api}/rest/v1/rpc/public_product_variants`, { method: 'POST', headers: { ...headers, 'X-Data-Api-Gateway': gateway }, body: JSON.stringify({ requested_slug: 'test-product-10', requested_limit: null }) });
  ensure(invalidSql.status === 400 && (await invalidSql.json()).message === 'CATALOG_INVALID_QUERY', 'SQL bound');
  pass('SQL enforces limit even when BFF validation is bypassed');
  sql(`update app.product_variants set data_status='draft' where id='${id(20)}';`);
  ensure((await http(skuPath())).status === 404 && (await http(`${skuPath()}/specifications`)).status === 404, 'SKU withdrawal');
  pass('withdrawing a SKU immediately removes its detail and specifications');
  sql(`update app.categories set status='archived' where id='${id(4)}';`);
  ensure((await http('products')).body.data.length === 0 && (await http('products/test-product-10')).status === 404, 'ancestor withdrawal');
  pass('withdrawing an ancestor removes all affected public products');
  sql("update private.gateway_secrets set valid_until=now()-interval '1 second';");
  const failure = await http('products');
  ensure(failure.status === 503 && failure.body.error.code === 'CATALOG_NOT_CONFIGURED' && !('data' in failure.body), 'configuration error');
  pass('gateway failure remains an error and never masquerades as empty success');
  sql("update private.gateway_secrets set valid_until=null where slot='current';");
  console.log(`Public products integration: ${checks} checks passed with real PostgreSQL, PostgREST and Pages Functions.`);
}
