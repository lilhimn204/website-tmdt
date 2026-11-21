import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Local-only, rollback-only diagnostic; timings depend on the machine, not an SLA.
if (process.argv.length !== 2) throw new Error('This local query-plan check accepts no database target or arguments.');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = readFileSync(resolve(root, 'supabase/tests/database/08_discovery.test.sql'), 'utf8')
  .split('-- BEGIN DISCOVERY FIXTURE')[1].split('-- END DISCOVERY FIXTURE')[0];
const query = `begin;set local statement_timeout='60s';${fixture}
insert into app.products(brand_id,product_type_id,primary_category_id,name,slug,publication_status)
select pg_temp.did(2),pg_temp.did(5),pg_temp.did(9),'TEST performance '||n,'discovery-perf-'||n,'published' from generate_series(1,500) n;
insert into app.product_categories select id,primary_category_id from app.products where slug::text like 'discovery-perf-%';
insert into app.product_variants(product_id,product_type_id,sku,model,data_status)
select p.id,p.product_type_id,'PERF-'||p.slug||'-'||n,'TEST perf model','ready' from app.products p cross join generate_series(1,2) n where p.slug::text like 'discovery-perf-%';
set constraints all immediate;
explain(analyze,buffers,format json) select api.public_search_products('TEST',requested_limit=>20);
explain(analyze,buffers,format json) select api.public_search_products('bo luu dien',type_code=>'discovery-ups',spec_filters=>'{"discovery-power":{"min":"0","max":"16"}}');
explain(analyze,buffers,format json) select api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-power":{"min":"0","max":"16"}}');
rollback;`;
const result = spawnSync('docker', ['exec', '-i', 'supabase_db_website-tmdt', 'psql', '-XqAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'],
  { input: query, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024, timeout: 90000 });
if (result.status !== 0) throw new Error('Local rollback query-plan check failed; ensure Docker/Supabase are running and migrations are applied. No source data is committed.');
mkdirSync(resolve(root, 'artifacts'), { recursive: true });
writeFileSync(resolve(root, 'artifacts/module-08-6-query-plan.log'), result.stdout);
const times = [...result.stdout.matchAll(/"Execution Time":\s*([\d.]+)/g)].map(m => Number(m[1]));
if (times.length !== 3 || times.some(t => !Number.isFinite(t))) throw new Error('Expected three PostgreSQL query timings.');
console.log(JSON.stringify({ addedTestProducts: 500, addedTestVariants: 1000, browseMs: times[0], filteredSearchMs: times[1], filterOnlyMs: times[2], rolledBack: true, productionLoadTest: false }));
