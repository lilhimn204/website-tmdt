import { randomUUID } from 'node:crypto';

// Called only inside the disposable backend integration stack. No main-project writes.
export async function checkPublicCatalog({ sql, api, origin, publishable, gateway }) {
  let checks = 0;
  const ensure = (condition, label) => { if (!condition) throw new Error(`Catalog integration: ${label}`); };
  const pass = label => { checks++; console.log(`CATALOG PASS ${checks}: ${label}`); };
  async function http(path, options) {
    const response = await fetch(`${origin}/api/v1/${path}`, options);
    const body = await response.json().catch(() => null);
    return { status: response.status, body, headers: response.headers };
  }
  const emptyBrands = await http('brands'), emptyCategories = await http('categories');
  ensure(emptyBrands.status === 200 && emptyBrands.body.data.length === 0 && emptyCategories.body.data.length === 0, 'unseeded database must return empty lists');
  pass('empty database returns actual empty data, no invented brands/categories');
  const ids = Array.from({ length: 12 }, () => randomUUID());
  sql(`insert into app.brands(id,name,slug,status,description) values
    ('${ids[0]}','TEST A','integration-a','active','TEST public description'),
    ('${ids[1]}','TEST B','integration-b','active','TEST public description'),
    ('${ids[2]}','TEST C','integration-c','active','TEST public description'),
    ('${ids[3]}','TEST draft','integration-draft','draft','PRIVATE fixture');
    insert into app.product_types(id,code,name,status) values('${ids[4]}','integration-ups','TEST UPS','active'),('${ids[5]}','integration-private-type','PRIVATE fixture','draft');
    insert into app.categories(id,name,slug,status,parent_id,sort_order,product_type_id) values
    ('${ids[6]}','TEST root','integration-root','active',null,0,null),
    ('${ids[7]}','TEST Z child','integration-z-child','active','${ids[6]}',0,'${ids[4]}'),
    ('${ids[8]}','TEST A child','integration-a-child','active','${ids[6]}',5,null),
    ('${ids[9]}','TEST B child','integration-b-child','active','${ids[6]}',5,null),
    ('${ids[10]}','PRIVATE root','integration-hidden-root','draft',null,0,'${ids[5]}'),
    ('${ids[11]}','PRIVATE child','integration-hidden-child','active','${ids[10]}',0,null);`);
  const first = await http('brands?limit=2');
  ensure(first.status === 200 && first.body.data.map(b => b.slug).join(',') === 'integration-a,integration-b' && first.body.page.next_cursor === 'integration-b', 'brand first page');
  pass('brand pagination has deterministic order and continuation');
  const second = await http(`brands?limit=2&after=${first.body.page.next_cursor}`);
  ensure(second.body.data.length === 1 && second.body.data[0].slug === 'integration-c' && second.body.page.has_more === false, 'brand second page');
  pass('next brand page neither repeats nor invents items');
  ensure(!JSON.stringify(first.body).match(/description|status|row_version|logo_asset_id/), 'list DTO fields');
  pass('brand list excludes internal and detail-only fields');
  const detail = await http('brands/integration-a');
  ensure(detail.status === 200 && Object.keys(detail.body.data).sort().join(',') === 'description,id,name,slug' && detail.body.data.description === 'TEST public description', 'brand detail');
  pass('brand detail exposes only the approved projection');
  const draft = await http('brands/integration-draft'), absent = await http('brands/integration-absent');
  ensure(draft.status === 404 && absent.status === 404 && JSON.stringify(draft.body) === JSON.stringify(absent.body), 'draft and absent parity');
  pass('draft and missing brands have indistinguishable 404 responses');
  const authless = await http('brands', { headers: { Authorization: 'Bearer not-a-valid-token', Cookie: 'private=ignored' } });
  ensure(authless.status === 200 && authless.body.data.length === 3, 'public identity isolation');
  pass('public endpoint ignores caller credentials and never elevates to admin');
  const roots = await http('categories');
  ensure(roots.status === 200 && roots.body.data.length === 1 && roots.body.data[0].slug === 'integration-root', 'root scope');
  pass('root navigation excludes children and unpublished branches');
  const children = await http('categories?parent=integration-root&limit=2');
  ensure(children.body.data.map(c => c.slug).join(',') === 'integration-z-child,integration-a-child' && children.body.page.next_cursor === 'integration-a-child', 'category ordering');
  pass('category pagination sorts by sort_order then slug');
  const moreChildren = await http('categories?parent=integration-root&limit=2&after=integration-a-child');
  ensure(moreChildren.body.data.length === 1 && moreChildren.body.data[0].slug === 'integration-b-child' && !moreChildren.body.page.has_more, 'category continuation');
  pass('category continuation stays within the selected parent');
  const child = await http('categories/integration-z-child');
  ensure(child.status === 200 && child.body.data.breadcrumbs.map(c => c.slug).join(',') === 'integration-root,integration-z-child' && child.body.data.product_type.code === 'integration-ups', 'category detail projection');
  pass('category detail returns public breadcrumbs and technical type');
  ensure((await http('categories/integration-hidden-child')).status === 404 && (await http('categories?parent=integration-hidden-root')).status === 404, 'hidden branch');
  pass('direct child URLs cannot bypass an unpublished ancestor');
  ensure((await http('categories?after=integration-z-child')).body.error.code === 'CATALOG_INVALID_CURSOR', 'cursor scope');
  pass('a cursor from another parent is rejected');
  for (const path of ['brands?limit=0', 'brands?limit=101', 'brands?limit=1&limit=2', 'brands?select=*', 'categories?parent=UPPER', 'brands/integration-a?status=draft']) {
    ensure((await http(path)).status === 400, 'query validation');
  }
  pass('query size/type/allowlist/duplicate validation works through actual Pages routes');
  const head = await fetch(`${origin}/api/v1/brands`, { method: 'HEAD' });
  ensure(head.status === 200 && (await head.text()) === '' && head.headers.get('Cache-Control') === 'no-store', 'HEAD/no-store');
  pass('HEAD is bodyless and catalog responses are not cached');
  for (const method of ['POST', 'PUT', 'DELETE']) ensure((await http('brands/integration-a', { method })).status === 405, 'read-only methods');
  pass('public metadata routes reject write methods');
  const bypass = await fetch(`${api}/rest/v1/rpc/public_brands`, { method: 'POST', headers: { apikey: publishable, 'Content-Type': 'application/json', 'Content-Profile': 'api' }, body: '{}' });
  ensure(bypass.status === 403 && (await bypass.json()).message === 'GATEWAY_REQUIRED', 'gateway bypass');
  pass('direct Data API requests still require the server gateway');
  const headers = { apikey: publishable, 'X-Data-Api-Gateway': gateway, 'Content-Type': 'application/json', 'Content-Profile': 'api' };
  const sqlLimit = await fetch(`${api}/rest/v1/rpc/public_brands`, { method: 'POST', headers, body: JSON.stringify({ requested_limit: 101 }) });
  ensure(sqlLimit.status === 400 && (await sqlLimit.json()).message === 'CATALOG_INVALID_QUERY', 'SQL limit independent of BFF');
  pass('SQL validation also enforces the page bound behind the gateway');
  const raw = await fetch(`${api}/rest/v1/brands`, { headers: { ...headers, 'Accept-Profile': 'app' } });
  ensure(raw.status === 406, 'raw schema isolation'); pass('raw business tables remain inaccessible');
  sql(`update app.brands set status='archived' where id='${ids[0]}'; update app.categories set status='archived' where id='${ids[6]}';`);
  ensure((await http('brands/integration-a')).status === 404 && (await http('brands?after=integration-a')).body.error.code === 'CATALOG_INVALID_CURSOR', 'brand withdrawal');
  pass('brand withdrawal and cursor invalidation are immediate');
  ensure((await http('categories/integration-z-child')).status === 404 && (await http('categories')).body.data.length === 0, 'ancestor withdrawal');
  pass('withdrawing an ancestor immediately hides its entire subtree');
  sql("update private.gateway_secrets set valid_until=now()-interval '1 second';");
  const unavailable = await http('brands');
  ensure(unavailable.status === 503 && unavailable.body.error.code === 'CATALOG_NOT_CONFIGURED' && !('data' in unavailable.body), 'gateway failure is not empty data');
  pass('configuration failure returns a real error, not an empty-success response');
  ensure(!JSON.stringify(unavailable.body).includes(gateway) && !JSON.stringify(detail.body).includes(publishable), 'credential redaction');
  pass('responses do not expose configured credentials');
  sql("update private.gateway_secrets set valid_until=null where slot='current';");
  console.log(`Public catalog integration: ${checks} checks passed with real PostgreSQL, PostgREST and Pages Functions.`);
}
