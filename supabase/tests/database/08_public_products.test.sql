begin;
create extension if not exists pgtap with schema extensions;
set local search_path=app,extensions,public,pg_catalog;
select no_plan();
-- BEGIN PRODUCT FIXTURE
-- TEST ONLY. Caller MUST wrap in a rollback transaction or use the disposable stack.
-- Never a seed migration, never data for the live storefront.
create function pg_temp.pid(n integer) returns uuid language sql immutable as
$$ select ('50000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid $$;
grant execute on function pg_temp.pid(integer) to anon;
insert into auth.users(id) values(pg_temp.pid(1));
insert into app.admin_profiles(user_id,display_name) values(pg_temp.pid(1),'TEST reviewer without login');
insert into app.brands(id,name,slug,status) values(pg_temp.pid(2),'TEST product brand','test-product-brand','active');
insert into app.product_types(id,code,name,status) values(pg_temp.pid(3),'test-product-type','TEST type','active');
insert into app.categories(id,name,slug,status,parent_id,product_type_id) values
 (pg_temp.pid(4),'TEST parent','test-product-root','active',null,null),
 (pg_temp.pid(5),'TEST category','test-product-category','active',pg_temp.pid(4),pg_temp.pid(3));
insert into app.products(id,brand_id,product_type_id,primary_category_id,name,slug,description,publication_status,lifecycle_status,lifecycle_reason)
select pg_temp.pid(n),pg_temp.pid(2),pg_temp.pid(3),pg_temp.pid(5),'TEST product '||n,'test-product-'||n,
 'TEST description',case when n=12 then 'draft' when n=13 then 'hidden' else 'published' end,
 case when n=14 then 'eol' when n=15 then 'discontinued' else 'active' end,'PRIVATE lifecycle note'
from generate_series(10,16) n;
insert into app.product_categories select pg_temp.pid(n),pg_temp.pid(5) from generate_series(10,16) n;
insert into app.product_variants(id,product_id,product_type_id,sku,model,data_status,sales_mode,lifecycle_status) values
 (pg_temp.pid(20),pg_temp.pid(10),pg_temp.pid(3),'TEST/sku 20','TEST model 20','ready','retail','active'),
 (pg_temp.pid(21),pg_temp.pid(10),pg_temp.pid(3),'TEST sku 21','TEST model 21','ready','quote_only','active'),
 (pg_temp.pid(22),pg_temp.pid(10),pg_temp.pid(3),'TEST sku 22','TEST model 22','draft','retail','active'),
 (pg_temp.pid(23),pg_temp.pid(11),pg_temp.pid(3),'TEST sku 23','TEST model 23','ready','retail','active'),
 (pg_temp.pid(24),pg_temp.pid(12),pg_temp.pid(3),'TEST sku 24','TEST model 24','ready','retail','active'),
 (pg_temp.pid(25),pg_temp.pid(13),pg_temp.pid(3),'TEST sku 25','TEST model 25','ready','retail','active'),
 (pg_temp.pid(26),pg_temp.pid(14),pg_temp.pid(3),'TEST sku 26','TEST model 26','ready','retail','active'),
 (pg_temp.pid(27),pg_temp.pid(15),pg_temp.pid(3),'TEST sku 27','TEST model 27','ready','retail','active'),
 (pg_temp.pid(28),pg_temp.pid(16),pg_temp.pid(3),'TEST sku 28','TEST model 28','draft','retail','active');
insert into app.price_versions(id,variant_id,version_no,basis,amount_vnd,tax_status,tax_rate_bps,approved_by,approved_at) values
 (pg_temp.pid(30),pg_temp.pid(20),1,'GROSS',9007199254740993,'taxable',0,pg_temp.pid(1),now()),
 (pg_temp.pid(31),pg_temp.pid(21),1,'NET',123,'exempt',null,pg_temp.pid(1),now()),
 (pg_temp.pid(32),pg_temp.pid(23),1,'NET',456,'unknown',null,pg_temp.pid(1),now()+interval '1 day');
update app.product_variants set current_price_id=pg_temp.pid(30) where id=pg_temp.pid(20);
update app.product_variants set current_price_id=pg_temp.pid(31) where id=pg_temp.pid(21);
update app.product_variants set current_price_id=pg_temp.pid(32) where id=pg_temp.pid(23);
insert into app.inventory(variant_id,on_hand) values(pg_temp.pid(20),5),(pg_temp.pid(21),0),(pg_temp.pid(26),2);
insert into app.warranty_policies(id,code,name,status) values(pg_temp.pid(40),'test-warranty','TEST warranty','active');
insert into app.warranty_policy_versions(id,policy_id,version_no,duration_months,start_rule,provider_name,coverage,exclusions,process,approved_by,approved_at,effective_from)
values(pg_temp.pid(41),pg_temp.pid(40),1,0,'TEST start','TEST provider','TEST coverage','TEST exclusions','TEST process',pg_temp.pid(1),now(),now());
update app.product_variants set warranty_version_id=pg_temp.pid(41) where id=pg_temp.pid(20);
insert into app.unit_definitions(code,name,dimension) values('TEST-W','TEST watt','TEST power');
insert into app.specification_definitions(id,code,label,data_type,group_code,status,canonical_unit_code) values
 (pg_temp.pid(50),'test-number','TEST numeric zero','number','technical','active','TEST-W'),
 (pg_temp.pid(51),'test-boolean','TEST false','boolean','technical','active',null),
 (pg_temp.pid(52),'test-text','TEST unverified','text','technical','active',null),
 (pg_temp.pid(53),'test-enum','TEST enum','enum','technical','active',null),
 (pg_temp.pid(54),'test-multi','TEST multi','multi_enum','technical','active',null),
 (pg_temp.pid(55),'test-missing','TEST missing','number','technical','active',null),
 (pg_temp.pid(56),'test-na','TEST not applicable','text','technical','active',null),
 (pg_temp.pid(57),'test-unsupported','TEST unsupported','boolean','technical','active',null),
 (pg_temp.pid(58),'test-private','PRIVATE definition','text','technical','draft',null),
 (pg_temp.pid(59),'test-unknown','TEST unknown','text','technical','active',null);
insert into app.product_type_specifications(product_type_id,definition_id,display_order,required_for_publish)
select pg_temp.pid(3),pg_temp.pid(n),n,n=50 from generate_series(50,59) n;
insert into app.specification_options(id,definition_id,code,label,status) values
 (pg_temp.pid(60),pg_temp.pid(53),'test-option','TEST option','active'),
 (pg_temp.pid(61),pg_temp.pid(54),'test-a','TEST A','active'),
 (pg_temp.pid(62),pg_temp.pid(54),'test-b','TEST B','active');
insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status,value_number,value_boolean,value_text,option_id,verified_by,verified_at,source_note)
select pg_temp.pid(20),pg_temp.pid(3),d.id,d.data_type,
 case when d.code='test-na' then 'not_applicable' when d.code='test-unsupported' then 'not_supported' when d.code='test-unknown' then 'unknown' else 'known' end,
 case when d.code='test-number' then 0 end,case when d.code='test-boolean' then false end,
 case when d.code in ('test-text','test-private') then 'PRIVATE unreviewed value' end,
 case when d.code='test-enum' then pg_temp.pid(60) end,
 case when d.code<>'test-text' then pg_temp.pid(1) end,case when d.code<>'test-text' then now() end,'PRIVATE source note'
from app.specification_definitions d where d.id between pg_temp.pid(50) and pg_temp.pid(59) and d.code<>'test-missing';
insert into app.product_specification_options values(pg_temp.pid(20),pg_temp.pid(54),pg_temp.pid(61)),(pg_temp.pid(20),pg_temp.pid(54),pg_temp.pid(62));
set constraints all immediate;
set constraints all deferred;

-- END PRODUCT FIXTURE
select ok(not has_function_privilege('authenticated','api.public_product(text)','EXECUTE'),'authenticated cannot bypass anon projection');
select ok(not has_function_privilege('service_role','api.public_product(text)','EXECUTE'),'service role not granted public RPC');
select ok(not has_function_privilege('anon','private.public_variant_rows(uuid)','EXECUTE'),'private variant helper denied');
select ok(not has_function_privilege('anon','private.public_specification_rows(uuid)','EXECUTE'),'private spec helper denied');
select ok(not has_function_privilege('anon','private.public_product_rows()','EXECUTE'),'private product helper denied');
select ok(not has_table_privilege('anon','app.product_variants','SELECT'),'no raw variants read');
set local role anon;
select is(jsonb_array_length(api.public_products(100)->'items'),4,'only published products with ready variants');
select is(api.public_products(2)->>'next_cursor','test-product-11','product cursor uses slug');
select is(api.public_products(2,'test-product-11')->'items'->0->>'slug','test-product-14','next page excludes hidden/draft');
select is(api.public_products(2,'test-product-15')->'items','[]'::jsonb,'real terminal empty page');
select ok(not (api.public_products(100)::text ~ 'PRIVATE|description|row_version|current_price_id'),'product list redacts internals');
select is(api.public_product('test-product-10')->>'description','TEST description','product detail description');
select is(api.public_product('test-product-14')->>'lifecycle_status','eol','EOL remains readable');
select throws_ok($$select api.public_product('test-product-12')$$,'PT404','CATALOG_NOT_FOUND','draft product hidden');
select throws_ok($$select api.public_product('test-product-13')$$,'PT404','CATALOG_NOT_FOUND','hidden product hidden');
select throws_ok($$select api.public_product('test-product-16')$$,'PT404','CATALOG_NOT_FOUND','product without ready variant hidden');
select throws_ok($$select api.public_product('missing')$$,'PT404','CATALOG_NOT_FOUND','missing indistinguishable');
select throws_ok($$select api.public_products(101)$$,'22023','CATALOG_INVALID_QUERY','SQL page bound');
select throws_ok($$select api.public_products(null)$$,'22023','CATALOG_INVALID_QUERY','null page cannot disable limit');
select throws_ok($$select api.public_products(1,'test-product-12')$$,'22023','CATALOG_INVALID_CURSOR','private cursor rejected');
select throws_ok($$select api.public_product(null)$$,'22023','CATALOG_INVALID_QUERY','null slug rejected');
select is(jsonb_array_length(api.public_product_variants('test-product-10',100)->'items'),2,'ready variants only');
select is(api.public_product_variants('test-product-10',1)->>'next_cursor',pg_temp.pid(20)::text,'variant keyset');
select is(api.public_product_variants('test-product-10',1,pg_temp.pid(20))->'items'->0->>'id',pg_temp.pid(21)::text,'variant next page');
select throws_ok($$select api.public_product_variants('test-product-10',1,pg_temp.pid(23))$$,'22023','CATALOG_INVALID_CURSOR','cross-product cursor denied');
select throws_ok($$select api.public_product_variant('test-product-10',pg_temp.pid(23))$$,'PT404','CATALOG_NOT_FOUND','cross-product variant denied');
select throws_ok($$select api.public_product_variant('test-product-10',pg_temp.pid(22))$$,'PT404','CATALOG_NOT_FOUND','draft variant denied');
select throws_ok($$select api.public_product_variant('test-product-10',null)$$,'22023','CATALOG_INVALID_QUERY','null variant rejected');
select is(api.public_product_variant('test-product-10',pg_temp.pid(20))->'price'->>'amount_vnd','9007199254740993','bigint price preserved exactly');
select is(api.public_product_variant('test-product-10',pg_temp.pid(20))->'price'->>'tax_rate_bps','0','zero tax rate preserved');
select is(api.public_product_variant('test-product-10',pg_temp.pid(21))->'price','null'::jsonb,'quote-only hides price even if pointer exists');
select is(api.public_product_variant('test-product-11',pg_temp.pid(23))->'price','null'::jsonb,'future approval not public');
select is(api.public_product_variant('test-product-10',pg_temp.pid(20))->>'availability','in_stock','positive available inventory');
select is(api.public_product_variant('test-product-10',pg_temp.pid(21))->>'availability','out_of_stock','zero stock not unknown');
select is(api.public_product_variant('test-product-11',pg_temp.pid(23))->>'availability','unknown','missing inventory not zero');
select is(api.public_product_variant('test-product-14',pg_temp.pid(26))->>'sales_mode','not_for_sale','EOL not saleable despite stock');
select is(api.public_product_variant('test-product-15',pg_temp.pid(27))->>'sales_mode','not_for_sale','discontinued not saleable');
select is(api.public_product_variant('test-product-10',pg_temp.pid(20))->>'purchase_enabled','false','read API never enables checkout');
select is(api.public_product_variant('test-product-10',pg_temp.pid(20))->'warranty'->>'duration_months','0','zero warranty duration not missing');
select is(api.public_product_variant('test-product-10',pg_temp.pid(21))->'warranty','null'::jsonb,'no automatic warranty inheritance');
select ok(not (api.public_product_variant('test-product-10',pg_temp.pid(20))::text ~ 'approved_by|on_hand|reserved|current_price|row_version|PRIVATE'),'variant projection excludes internal data');
select is(jsonb_array_length(api.public_variant_specifications('test-product-10',pg_temp.pid(20),100)->'items'),9,'active definitions include missing values');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1)->>'next_cursor','test-number','specification order uses display_order');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-number')->'items'->0->'value','false'::jsonb,'known false preserved');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1)->'items'->0->>'value','0.000000','known numeric zero preserved as decimal');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-boolean')->'items'->0->>'value_status','unknown','unverified text not leaked');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-multi')->'items'->0->>'value_status','unknown','missing value explicit unknown');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-missing')->'items'->0->>'value_status','not_applicable','not applicable distinct');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-na')->'items'->0->>'value_status','not_supported','not supported distinct');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-text')->'items'->0->'value'->>'code','test-option','enum public code');
select is(jsonb_array_length(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-enum')->'items'->0->'value'),2,'complete multi-enum selection');
select ok(not (api.public_variant_specifications('test-product-10',pg_temp.pid(20),100)::text ~ 'PRIVATE|verified_by|source_note|source_asset'),'spec source and reviewer private');
select throws_ok($$select api.public_variant_specifications('test-product-10',pg_temp.pid(23))$$,'PT404','CATALOG_NOT_FOUND','specs cannot cross product scope');
select throws_ok($$select api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-private')$$,'22023','CATALOG_INVALID_CURSOR','private definition not cursor');
reset role;
update app.specification_options set status='archived' where id in (pg_temp.pid(60),pg_temp.pid(62));
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-enum')->'items'->0->>'value_status','unknown','partial multi-enum becomes unknown in full');
select is(api.public_variant_specifications('test-product-10',pg_temp.pid(20),1,'test-text')->'items'->0->'value','null'::jsonb,'archived enum removed');
update app.warranty_policies set status='archived' where id=pg_temp.pid(40);
select is(api.public_product_variant('test-product-10',pg_temp.pid(20))->'warranty','null'::jsonb,'withdrawn warranty hidden immediately');
update app.product_types set status='archived' where id=pg_temp.pid(3);
select is(api.public_products(100)->'items','[]'::jsonb,'archived type hides products');
update app.product_types set status='active' where id=pg_temp.pid(3);
update app.brands set status='archived' where id=pg_temp.pid(2);
select throws_ok($$select api.public_product('test-product-10')$$,'PT404','CATALOG_NOT_FOUND','withdrawn brand hides product');
update app.brands set status='active' where id=pg_temp.pid(2);
update app.categories set status='archived' where id=pg_temp.pid(4);
select throws_ok($$select api.public_product_variant('test-product-10',pg_temp.pid(20))$$,'PT404','CATALOG_NOT_FOUND','withdrawn ancestor hides SKU');
select * from finish();
rollback;
