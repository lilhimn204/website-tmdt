begin;
create extension if not exists pgtap with schema extensions;
set local search_path=app,extensions,public,pg_catalog;
select no_plan();
-- BEGIN DISCOVERY FIXTURE
-- TEST ONLY: caller rolls back this transaction or uses the disposable stack.
create function pg_temp.did(n integer) returns uuid language sql immutable as
$$ select ('60000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid $$;
grant execute on function pg_temp.did(integer) to anon;
insert into auth.users(id) values(pg_temp.did(1));
insert into app.admin_profiles(user_id,display_name) values(pg_temp.did(1),'TEST reviewer');
insert into app.brands(id,name,slug,status) values
 (pg_temp.did(2),'Ánh Dương','discovery-a','active'),(pg_temp.did(3),'Bắc Việt','discovery-b','active'),(pg_temp.did(4),'PRIVATE brand','discovery-private','draft');
insert into app.product_types(id,code,name,status) values
 (pg_temp.did(5),'discovery-ups','TEST UPS','active'),(pg_temp.did(6),'discovery-ram','TEST RAM','active');
insert into app.categories(id,name,slug,status,parent_id,product_type_id) values
 (pg_temp.did(8),'TEST root','discovery-root','active',null,null),
 (pg_temp.did(9),'TEST UPS','discovery-ups','active',pg_temp.did(8),pg_temp.did(5)),
 (pg_temp.did(10),'TEST RAM','discovery-ram','active',null,pg_temp.did(6)),
 (pg_temp.did(11),'PRIVATE category','discovery-hidden','draft',null,pg_temp.did(5));
insert into app.products(id,brand_id,product_type_id,primary_category_id,name,slug,publication_status,lifecycle_status) values
 (pg_temp.did(20),pg_temp.did(2),pg_temp.did(5),pg_temp.did(9),'Bộ lưu điện Văn Phòng','discovery-20','published','active'),
 (pg_temp.did(21),pg_temp.did(3),pg_temp.did(5),pg_temp.did(9),'Máy chủ','discovery-21','published','active'),
 (pg_temp.did(22),pg_temp.did(2),pg_temp.did(6),pg_temp.did(10),'Bộ nhớ máy tính','discovery-22','published','active'),
 (pg_temp.did(23),pg_temp.did(2),pg_temp.did(5),pg_temp.did(9),'PRIVATE product','discovery-23','draft','active'),
 (pg_temp.did(24),pg_temp.did(3),pg_temp.did(5),pg_temp.did(9),'Máy tham khảo','discovery-24','published','eol'),
 (pg_temp.did(25),pg_temp.did(4),pg_temp.did(5),pg_temp.did(9),'PRIVATE brand product','discovery-25','published','active'),
 (pg_temp.did(26),pg_temp.did(2),pg_temp.did(5),pg_temp.did(11),'PRIVATE category product','discovery-26','published','active');
insert into app.product_categories select id,primary_category_id from app.products where id between pg_temp.did(20) and pg_temp.did(26);
insert into app.product_variants(id,product_id,product_type_id,sku,model,data_status,sales_mode) values
 (pg_temp.did(30),pg_temp.did(20),pg_temp.did(5),'UPS-100','M-ONE','ready','retail'),
 (pg_temp.did(31),pg_temp.did(20),pg_temp.did(5),'UPS-100-PLUS','MODEL-PLUS','ready','retail'),
 (pg_temp.did(32),pg_temp.did(21),pg_temp.did(5),'UPS100','M-TWO','ready','quote_only'),
 (pg_temp.did(33),pg_temp.did(22),pg_temp.did(6),'RAM-100','RAM-MODEL','ready','retail'),
 (pg_temp.did(34),pg_temp.did(23),pg_temp.did(5),'PRIVATE-PARENT','PRIVATE model','ready','retail'),
 (pg_temp.did(35),pg_temp.did(20),pg_temp.did(5),'SECRET-SKU','PRIVATE model','draft','retail'),
 (pg_temp.did(36),pg_temp.did(24),pg_temp.did(5),'EOL-100','EOL-MODEL','ready','retail'),
 (pg_temp.did(37),pg_temp.did(25),pg_temp.did(5),'PRIVATE-BRAND','PRIVATE model','ready','retail'),
 (pg_temp.did(38),pg_temp.did(26),pg_temp.did(5),'PRIVATE-CATEGORY','PRIVATE model','ready','retail');
insert into app.price_versions(id,variant_id,version_no,basis,amount_vnd,tax_status,tax_rate_bps,approved_by,approved_at) values
 (pg_temp.did(40),pg_temp.did(30),1,'GROSS',100,'taxable',0,pg_temp.did(1),now()),
 (pg_temp.did(41),pg_temp.did(31),1,'GROSS',200,'taxable',0,pg_temp.did(1),now()),
 (pg_temp.did(42),pg_temp.did(36),1,'GROSS',200,'taxable',0,pg_temp.did(1),now()),
 (pg_temp.did(43),pg_temp.did(33),1,'GROSS',50,'taxable',0,pg_temp.did(1),now());
update app.product_variants set current_price_id=pg_temp.did(40) where id=pg_temp.did(30);
update app.product_variants set current_price_id=pg_temp.did(41) where id=pg_temp.did(31);
update app.product_variants set current_price_id=pg_temp.did(42) where id=pg_temp.did(36);
update app.product_variants set current_price_id=pg_temp.did(43) where id=pg_temp.did(33);
insert into app.unit_definitions(code,name,dimension) values('DISC-W','TEST watt','TEST power');
insert into app.specification_definitions(id,code,label,data_type,group_code,status,canonical_unit_code) values
 (pg_temp.did(50),'discovery-power','TEST power','number','technical','active','DISC-W'),
 (pg_temp.did(51),'discovery-interface','TEST interface','enum','technical','active',null),
 (pg_temp.did(52),'discovery-wifi','TEST Wi-Fi','boolean','technical','active',null),
 (pg_temp.did(53),'discovery-ports','TEST ports','multi_enum','technical','active',null),
 (pg_temp.did(54),'discovery-note','TEST note','text','technical','active',null),
 (pg_temp.did(55),'discovery-not-filterable','TEST not filterable','number','technical','active',null),
 (pg_temp.did(56),'discovery-private','PRIVATE definition','number','technical','draft',null),
 (pg_temp.did(57),'discovery-missing','TEST missing','number','technical','active',null),
 (pg_temp.did(58),'discovery-na','TEST N/A','text','technical','active',null),
 (pg_temp.did(59),'discovery-unsupported','TEST unsupported','boolean','technical','active',null);
insert into app.product_type_specifications(product_type_id,definition_id,display_order,filterable,comparable,min_value,max_value)
select pg_temp.did(5),pg_temp.did(n),n,n<>55,n<>55,case when n=50 then 0 end,case when n=50 then 10000 end from generate_series(50,59) n;
insert into app.product_type_specifications(product_type_id,definition_id,filterable,comparable) values(pg_temp.did(6),pg_temp.did(50),true,true);
insert into app.specification_options(id,definition_id,code,label) values
 (pg_temp.did(60),pg_temp.did(51),'usb','TEST USB'),(pg_temp.did(61),pg_temp.did(51),'nvme','TEST NVMe'),
 (pg_temp.did(62),pg_temp.did(53),'usb','TEST USB'),(pg_temp.did(63),pg_temp.did(53),'lan','TEST LAN');
insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status,value_number,value_boolean,value_text,option_id,verified_by,verified_at,source_note)
select v.id,v.product_type_id,d.id,d.data_type,
 case d.code when 'discovery-na' then 'not_applicable' when 'discovery-unsupported' then 'not_supported' else 'known' end,
 case when d.data_type='number' then case when v.id in (pg_temp.did(31),pg_temp.did(32)) then 16 else 0 end end,
 case when d.code='discovery-wifi' then v.id=pg_temp.did(31) end,
 case when d.code='discovery-note' then case when v.id=pg_temp.did(31) then 'TEST beta' else 'TEST alpha' end end,
 case when d.data_type='enum' then case when v.id=pg_temp.did(31) then pg_temp.did(61) else pg_temp.did(60) end end,
 case when not(v.id=pg_temp.did(32) and d.code='discovery-wifi') then pg_temp.did(1) end,
 case when not(v.id=pg_temp.did(32) and d.code='discovery-wifi') then now() end,'PRIVATE source'
from app.product_variants v cross join app.specification_definitions d
where v.id in (pg_temp.did(30),pg_temp.did(31),pg_temp.did(32),pg_temp.did(36))
 and d.id in (pg_temp.did(50),pg_temp.did(51),pg_temp.did(52),pg_temp.did(53),pg_temp.did(54),pg_temp.did(58),pg_temp.did(59));
insert into app.product_specification_options values
 (pg_temp.did(30),pg_temp.did(53),pg_temp.did(62)),(pg_temp.did(30),pg_temp.did(53),pg_temp.did(63)),
 (pg_temp.did(31),pg_temp.did(53),pg_temp.did(63)),(pg_temp.did(32),pg_temp.did(53),pg_temp.did(62)),
 (pg_temp.did(36),pg_temp.did(53),pg_temp.did(62)),(pg_temp.did(36),pg_temp.did(53),pg_temp.did(63));
set constraints all immediate;
set constraints all deferred;
-- END DISCOVERY FIXTURE
select ok(not has_function_privilege('anon','private.normalize_search(text)','EXECUTE'),'normalizer private');
select ok(not has_function_privilege('anon','private.public_filter_rows(uuid)','EXECUTE'),'filter helper private');
select ok(not has_function_privilege('anon','private.validate_spec_filters(uuid,jsonb)','EXECUTE'),'filter validator private');
select ok(not has_function_privilege('anon','private.variant_matches_filters(uuid,jsonb)','EXECUTE'),'filter matcher private');
select ok(not has_function_privilege('authenticated','api.public_search_products(text,text[],text,text,jsonb,text,integer,integer)','EXECUTE'),'authenticated cannot elevate search');
select ok(not has_function_privilege('service_role','api.public_compare_products(uuid[],integer,text)','EXECUTE'),'service shortcut denied');
select is((select count(*)::integer from app.catalog_search_documents where variant_id between pg_temp.did(30) and pg_temp.did(38)),9,'variant insert synchronously builds search documents including private internal records');
set local role anon;
select is(api.public_search_products()->>'total','5','only five public ready SKUs');
select is(api.public_search_products()->>'total_products','4','product count does not double-count variants');
select is(api.public_search_products(' ups-100 ')->'items'->0->'variant'->>'id',pg_temp.did(30)::text,'exact SKU first');
select is(api.public_search_products('UPS-100')->'items'->1->>'match_type','prefix','prefix SKU second');
select is(api.public_search_products('UPS100')->>'total','1','separator preserved, not collapsed with UPS-100');
select is(api.public_search_products('m-one')->'items'->0->>'match_type','exact','exact model ranked first');
select is(api.public_search_products('model-')->'items'->0->'variant'->>'id',pg_temp.did(31)::text,'model prefix works');
select is(api.public_search_products('BỘ   LƯU điện')->'items',api.public_search_products('bo luu DIEN')->'items','Vietnamese accents/case/spaces normalized');
select is(api.public_search_products('anh duong')->>'total','3','brand name matches products without brand in product name');
select is(api.public_search_products('ĐIỆN')->>'total','2','Vietnamese D stroke normalized');
select is(api.public_search_products('SECRET-SKU')->>'total','0','draft SKU never searchable');
select is(api.public_search_products('PRIVATE')->>'total','0','private product/brand/category never searchable');
select is(api.public_search_products('%')->>'total','0','percent is not a wildcard');
select is(api.public_search_products('_')->>'total','0','underscore is not a wildcard');
select is(api.public_search_products(brand_slugs=>array['discovery-a','discovery-b'])->>'total','5','multiple brands OR');
select is(api.public_search_products(category_slug=>'discovery-root')->>'total','4','category includes visible descendants');
select is(api.public_search_products(type_code=>'discovery-ram')->>'total','1','technical type scope');
select is(api.public_search_products(requested_sort=>'price_asc')->'items'->0->'variant'->>'id',pg_temp.did(33)::text,'lowest actual price first');
select is(api.public_search_products(requested_sort=>'price_desc')->'items'->4->'variant'->>'id',pg_temp.did(32)::text,'quote-only after priced SKUs for descending too');
select is(api.public_search_products(requested_limit=>2,requested_offset=>2)->'items'->0->'variant'->>'id',pg_temp.did(32)::text,'stable page offset');
select is(api.public_search_products(requested_offset=>50)->>'total','5','total survives empty page');
select is(api.public_search_products(requested_offset=>50)->'items','[]'::jsonb,'out-of-range page genuinely empty');
select is(api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-power":{"min":"0","max":"0"}}')->>'total','2','inclusive numeric zero excludes missing');
select is(api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-wifi":{"values":[false]}}')->>'total','2','known false passes, unverified false does not');
select is(api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-interface":{"values":["usb","nvme"]}}')->>'total','4','OR options within enum');
select is(api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-power":{"max":"0"},"discovery-interface":{"values":["nvme"]}}')->>'total','0','cannot splice attributes across two SKUs of one product');
select is(api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-ports":{"values":["usb"]},"discovery-interface":{"values":["usb"]}}')->>'total','3','multi-enum any option AND separate attribute');
select is(jsonb_array_length(api.public_product_filters('discovery-ups')->'items'),6,'only active filterable supported types');
select is(api.public_product_filters('discovery-ups')->'items'->0->'unit'->>'code','DISC-W','canonical unit returned');
select is(api.public_product_filters('discovery-ups',1)->>'next_cursor','discovery-power','metadata cursor');
select is(api.public_product_filters('discovery-ups',1,'discovery-power')->'items'->0->>'code','discovery-interface','metadata continuation');
select is(jsonb_array_length(api.public_product_filters('discovery-ram')->'items'),1,'different type has own definitions');
select is(api.public_compare_products(array[pg_temp.did(31),pg_temp.did(30)])->'items'->0->'variant'->>'id',pg_temp.did(31)::text,'comparison retains requested column order');
select is(api.public_compare_products(array[pg_temp.did(30),pg_temp.did(31)])->'rows'->0->>'comparison','different','known numeric difference');
select is(api.public_compare_products(array[pg_temp.did(30),pg_temp.did(36)])->'rows'->0->>'comparison','equal','known numeric equality');
select is(api.public_compare_products(array[pg_temp.did(30),pg_temp.did(36)],1,'discovery-note')->'rows'->0->>'comparison','incomplete','two missing values are not equal');
select is(api.public_compare_products(array[pg_temp.did(30),pg_temp.did(32)],1,'discovery-interface')->'rows'->0->>'comparison','incomplete','false versus unverified false incomplete');
select is(api.public_compare_products(array[pg_temp.did(30),pg_temp.did(31)],1,'discovery-missing')->'rows'->0->>'comparison','equal','not_applicable remains explicit, not missing');
select is(api.public_compare_products(array[pg_temp.did(30),pg_temp.did(36)])->'items'->1->'variant'->>'sales_mode','not_for_sale','EOL comparison uses current sale block');
select ok(not (api.public_compare_products(array[pg_temp.did(30),pg_temp.did(31)])::text ~ 'PRIVATE|source_note|verified_by|search_text_normalized'),'comparison exposes no internal sources');
select throws_ok($$select api.public_compare_products(array[pg_temp.did(30),pg_temp.did(33)])$$,'22023','CATALOG_INCOMPATIBLE_COMPARISON','cross-type comparison denied');
select throws_ok($$select api.public_compare_products(array[pg_temp.did(30),pg_temp.did(35)])$$,'PT404','CATALOG_NOT_FOUND','draft comparison item cannot leak');
select throws_ok($$select api.public_compare_products(array[pg_temp.did(30),pg_temp.did(99)])$$,'PT404','CATALOG_NOT_FOUND','missing comparison same error');
select throws_ok($$select api.public_compare_products(array[pg_temp.did(30),pg_temp.did(30)])$$,'22023','CATALOG_INVALID_QUERY','duplicate comparison item denied');
select throws_ok($$select api.public_compare_products(array[pg_temp.did(30)])$$,'22023','CATALOG_INVALID_QUERY','single comparison denied');
select throws_ok($$select api.public_compare_products(array[pg_temp.did(30),pg_temp.did(31),pg_temp.did(32),pg_temp.did(36)])$$,'22023','CATALOG_INVALID_QUERY','fourth comparison denied');
select throws_ok($$select api.public_search_products(requested_limit=>101)$$,'22023','CATALOG_INVALID_QUERY','SQL page limit');
select throws_ok($$select api.public_search_products(requested_offset=>5001)$$,'22023','CATALOG_INVALID_QUERY','SQL offset cap');
select throws_ok($$select api.public_search_products(requested_query=>repeat('a',201))$$,'22023','CATALOG_INVALID_QUERY','SQL query cap');
select throws_ok($$select api.public_search_products(brand_slugs=>array['discovery-a','discovery-a'])$$,'22023','CATALOG_INVALID_QUERY','duplicate brand denied');
select throws_ok($$select api.public_search_products(category_slug=>'discovery-hidden')$$,'PT404','CATALOG_NOT_FOUND','hidden category rejected');
select throws_ok($$select api.public_search_products(spec_filters=>'{"discovery-power":{"min":"0"}}')$$,'22023','CATALOG_INVALID_FILTER','technical filter requires type');
select throws_ok($$select api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-power":{"min":0}}')$$,'22023','CATALOG_INVALID_FILTER','decimal must be string');
select throws_ok($$select api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-power":{"min":"16","max":"0"}}')$$,'22023','CATALOG_INVALID_FILTER','reversed range denied');
select throws_ok($$select api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-power":{"min":"NaN"}}')$$,'22023','CATALOG_INVALID_FILTER','NaN denied');
select throws_ok($$select api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-wifi":{"values":["false"]}}')$$,'22023','CATALOG_INVALID_FILTER','string false not boolean');
select throws_ok($$select api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-interface":{"values":["missing"]}}')$$,'22023','CATALOG_INVALID_FILTER','unapproved option denied');
select throws_ok($$select api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-note":{"values":["test"]}}')$$,'22023','CATALOG_INVALID_FILTER','text filter excluded');
select throws_ok($$select api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-not-filterable":{"min":"0"}}')$$,'22023','CATALOG_INVALID_FILTER','nonfilterable definition rejected');
select throws_ok($$select api.public_search_products(type_code=>'discovery-ram',spec_filters=>'{"discovery-interface":{"values":["usb"]}}')$$,'22023','CATALOG_INVALID_FILTER','stale filter from different type rejected explicitly');
reset role;
update app.specification_options set status='archived' where id=pg_temp.did(62);
select is(api.public_search_products(type_code=>'discovery-ups',spec_filters=>'{"discovery-ports":{"values":["lan"]}}')->>'total','1','partial multi-enum does not match remaining active option');
update app.brands set name='TEST Đổi Tên' where id=pg_temp.did(2);
select is(api.public_search_products('doi ten')->>'total','3','brand rename synchronously refreshes documents');
select is(api.public_search_products('anh duong')->>'total','0','old brand name no longer matches');
update app.products set name='TEST Tên Mới' where id=pg_temp.did(20);
select is(api.public_search_products('ten moi')->>'total','2','product rename refreshes all variants');
select is(api.public_search_products('bo luu dien')->>'total','0','old product name removed');
update app.product_variants set sku='UPS-NEW' where id=pg_temp.did(30);
select is(api.public_search_products('UPS-NEW')->'items'->0->>'match_type','exact','SKU edit immediately searchable');
update app.product_variants set data_status='draft' where id=pg_temp.did(30);
select is(api.public_search_products('UPS-NEW')->>'total','0','visibility live even with search document present');
select throws_ok($$select api.public_compare_products(array[pg_temp.did(30),pg_temp.did(31)])$$,'PT404','CATALOG_NOT_FOUND','withdrawn comparison column rejects stale selection');
update app.categories set status='archived' where id=pg_temp.did(8);
select is(api.public_search_products()->>'total','1','ancestor withdrawal applied to result and count');
select * from finish();
rollback;
