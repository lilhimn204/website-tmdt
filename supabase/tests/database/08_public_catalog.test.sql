begin;
create extension if not exists pgtap with schema extensions;
set local search_path=app,extensions,public,pg_catalog;
select no_plan();
create function pg_temp.cid(n integer) returns uuid language sql immutable as
$$ select ('40000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid $$;
insert into app.brands(id,name,slug,status,description) values
 (pg_temp.cid(1),'TEST public A','test-public-a','active','TEST description'),
 (pg_temp.cid(2),'TEST public B','test-public-b','active','TEST description'),
 (pg_temp.cid(3),'TEST public C','test-public-c','active','TEST description'),
 (pg_temp.cid(4),'TEST draft','test-public-draft','draft','PRIVATE description'),
 (pg_temp.cid(5),'TEST archived','test-public-archived','archived','PRIVATE description');
insert into app.product_types(id,code,name,status) values
 (pg_temp.cid(6),'test-public-ups','TEST UPS','active'),(pg_temp.cid(7),'test-public-ram','PRIVATE RAM','draft');
insert into app.categories(id,name,slug,status,parent_id,sort_order,product_type_id) values
 (pg_temp.cid(10),'TEST root','test-public-root','active',null,0,null),
 (pg_temp.cid(11),'TEST Z','test-public-z-child','active',pg_temp.cid(10),0,pg_temp.cid(6)),
 (pg_temp.cid(12),'TEST A','test-public-a-child','active',pg_temp.cid(10),5,null),
 (pg_temp.cid(13),'TEST B','test-public-b-child','active',pg_temp.cid(10),5,null),
 (pg_temp.cid(14),'TEST grandchild','test-public-grandchild','active',pg_temp.cid(11),0,null),
 (pg_temp.cid(15),'PRIVATE root','test-public-hidden-root','draft',null,0,null),
 (pg_temp.cid(16),'PRIVATE child','test-public-hidden-child','active',pg_temp.cid(15),0,null),
 (pg_temp.cid(17),'PRIVATE grandchild','test-public-hidden-grandchild','active',pg_temp.cid(16),0,null),
 (pg_temp.cid(18),'PRIVATE archived','test-public-archived-child','archived',pg_temp.cid(10),0,null),
 (pg_temp.cid(19),'PRIVATE type root','test-public-type-root','active',null,0,pg_temp.cid(7)),
 (pg_temp.cid(20),'PRIVATE type child','test-public-type-child','active',pg_temp.cid(19),0,null),
 (pg_temp.cid(21),'TEST empty root','test-public-empty-root','active',null,9,null);
set constraints all immediate;
select is((select count(*)::integer from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='api' and p.proname like 'public_%'),4,'exactly four public metadata RPCs');
select ok(not has_function_privilege('authenticated','api.public_brands(integer,text)','EXECUTE'),'public reads do not inherit a caller admin context');
select ok(not has_function_privilege('service_role','api.public_brands(integer,text)','EXECUTE'),'no service-role shortcut');
select ok(not has_function_privilege('anon','private.public_category_rows()','EXECUTE'),'internal tree helper not executable by anon');
select ok(not has_function_privilege('anon','private.check_catalog_query(integer,text[])','EXECUTE'),'internal validation helper not executable by anon');
select ok(not has_schema_privilege('anon','app','USAGE'),'raw schema remains inaccessible');
select ok(not has_table_privilege('anon','app.brands','SELECT'),'no raw brand SELECT grant');
select ok(not has_table_privilege('anon','app.categories','SELECT'),'no raw category SELECT grant');
set local role anon;
select is(jsonb_array_length(api.public_brands(2,null)->'items'),2,'brand page bounded');
select is(api.public_brands(2,null)->>'next_cursor','test-public-b','brand continuation uses last returned slug');
select is(api.public_brands(2,'test-public-b')->'items'->0->>'slug','test-public-c','brand next page has no repeat');
select is(api.public_brands(2,'test-public-b')->>'next_cursor',null::text,'last brand page has no cursor');
select is(api.public_brands(2,'test-public-c')->'items','[]'::jsonb,'end of catalog is genuinely empty');
select ok(not (api.public_brands(100,null)::text ~ 'PRIVATE|draft|archived|description|row_version|logo_asset_id'),'brand list omits private rows and internal/detail fields');
select is(api.public_brand('test-public-a')->>'description','TEST description','active brand detail available');
select is((select count(*)::integer from jsonb_object_keys(api.public_brand('test-public-a'))),4,'brand detail has only four approved fields');
select throws_ok($$select api.public_brand('test-public-draft')$$,'PT404','CATALOG_NOT_FOUND','draft brand indistinguishable from absent');
select throws_ok($$select api.public_brand('test-public-archived')$$,'PT404','CATALOG_NOT_FOUND','archived brand hidden');
select throws_ok($$select api.public_brand('test-public-absent')$$,'PT404','CATALOG_NOT_FOUND','absent brand returns same error');
select throws_ok($$select api.public_brands(1,'test-public-draft')$$,'22023','CATALOG_INVALID_CURSOR','draft cannot be pagination anchor');
select throws_ok($$select api.public_brands(0,null)$$,'22023','CATALOG_INVALID_QUERY','zero page size denied in SQL');
select throws_ok($$select api.public_brands(101,null)$$,'22023','CATALOG_INVALID_QUERY','unbounded page size denied');
select throws_ok($$select api.public_brands(null,null)$$,'22023','CATALOG_INVALID_QUERY','null page size cannot disable LIMIT');
select throws_ok($$select api.public_brand(null)$$,'22023','CATALOG_INVALID_QUERY','null detail slug denied');
select throws_ok($$select api.public_brand('Bad/slug')$$,'22023','CATALOG_INVALID_QUERY','unsafe slug denied in SQL');
select throws_ok($$select api.public_brand(repeat('a',161))$$,'22023','CATALOG_INVALID_QUERY','slug bound matches domain');
select is(jsonb_array_length(api.public_categories(100,null,null)->'items'),2,'root list only contains visible roots');
select ok(not (api.public_categories(100,null,null)::text ~ 'PRIVATE|hidden|type-root'),'hidden roots/types do not appear');
select is(api.public_categories(2,null,'test-public-root')->'items'->0->>'slug','test-public-z-child','category sort_order precedes slug');
select is(api.public_categories(2,null,'test-public-root')->'items'->1->>'slug','test-public-a-child','slug breaks equal-order ties');
select is(api.public_categories(2,null,'test-public-root')->>'next_cursor','test-public-a-child','category page has correct continuation');
select is(api.public_categories(2,'test-public-a-child','test-public-root')->'items'->0->>'slug','test-public-b-child','category continuation follows order and slug');
select is(api.public_categories(2,'test-public-a-child','test-public-root')->>'next_cursor',null::text,'category terminal cursor absent');
select is(api.public_categories(20,null,'test-public-empty-root')->'items','[]'::jsonb,'visible empty category returns empty children');
select is(jsonb_array_length(api.public_category('test-public-grandchild')->'breadcrumbs'),3,'breadcrumb covers all visible ancestors');
select is(api.public_category('test-public-grandchild')->'breadcrumbs'->0->>'slug','test-public-root','breadcrumb starts at root');
select is(api.public_category('test-public-grandchild')->>'parent_slug','test-public-z-child','detail has public parent slug');
select is(api.public_category('test-public-z-child')->'product_type',jsonb_build_object('code','test-public-ups','name','TEST UPS'),'only approved public type fields');
select is(api.public_category('test-public-root')->'product_type','null'::jsonb,'untyped navigation node remains null');
select ok(not (api.public_category('test-public-z-child') ?| array['status','row_version','parent_id','product_type_id']),'category DTO has no private metadata');
select throws_ok($$select api.public_category('test-public-hidden-child')$$,'PT404','CATALOG_NOT_FOUND','active child under draft parent stays hidden');
select throws_ok($$select api.public_category('test-public-hidden-grandchild')$$,'PT404','CATALOG_NOT_FOUND','hidden ancestor propagates beyond one level');
select throws_ok($$select api.public_category('test-public-type-child')$$,'PT404','CATALOG_NOT_FOUND','inactive technical type hides entire branch');
select throws_ok($$select api.public_category('test-public-archived-child')$$,'PT404','CATALOG_NOT_FOUND','archived category cannot be read directly');
select throws_ok($$select api.public_categories(20,null,'test-public-hidden-root')$$,'PT404','CATALOG_NOT_FOUND','cannot browse hidden parent');
select throws_ok($$select api.public_categories(20,'test-public-z-child',null)$$,'22023','CATALOG_INVALID_CURSOR','cursor cannot cross parent scope');
select throws_ok($$select api.public_categories(20,'absent','test-public-root')$$,'22023','CATALOG_INVALID_CURSOR','invalid category cursor denied');
select throws_ok($$select * from app.brands$$,'42501',null,'direct table read denied');
select throws_ok($$select api.admin_context()$$,'42501',null,'public reader cannot invoke admin RPC');
reset role;
update app.categories set status='archived' where id=pg_temp.cid(10);
set local role anon;
select throws_ok($$select api.public_category('test-public-grandchild')$$,'PT404','CATALOG_NOT_FOUND','unpublishing ancestor immediately hides descendant');
reset role;
update app.brands set status='archived' where id=pg_temp.cid(1);
set local role anon;
select throws_ok($$select api.public_brand('test-public-a')$$,'PT404','CATALOG_NOT_FOUND','brand withdrawal takes effect immediately');
reset role;
select * from finish();
rollback;
