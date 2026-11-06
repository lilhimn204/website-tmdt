begin;
create extension if not exists pgtap with schema extensions;
set local search_path = app, extensions, public, pg_catalog;
select no_plan();
create function pg_temp.id(n integer) returns uuid language sql immutable as
$$ select ('00000000-0000-0000-0000-' || lpad(n::text,12,'0'))::uuid $$;

select is((select count(*)::integer from pg_tables where schemaname = 'app'),52,'all 52 planned business tables exist');
select is((select count(*)::integer from pg_tables where schemaname = 'app' and rowsecurity),52,'RLS enabled on every business table');
select is((select count(*)::integer from pg_policies where schemaname in ('app','api','private')),0,'no permissive application policies before 08.3');
select is((select count(*)::integer from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('app','api','private') and p.prosecdef),0,'no SECURITY DEFINER escape hatch');
select is((select count(*)::integer from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'api'),0,'no business RPC before the API modules');
select ok(not has_schema_privilege('anon','app','USAGE'),'anon cannot reach business schema');
select ok(not has_schema_privilege('authenticated','app','USAGE'),'authenticated cannot reach business schema');
select ok(not has_schema_privilege('service_role','app','USAGE'),'service role has no direct schema access');
select ok(not exists(select 1 from pg_tables t cross join (values('anon'),('authenticated'),('service_role')) r(role)
  where schemaname = 'app' and (has_table_privilege(r.role,format('%I.%I',schemaname,tablename),'SELECT')
    or has_table_privilege(r.role,format('%I.%I',schemaname,tablename),'INSERT')
    or has_table_privilege(r.role,format('%I.%I',schemaname,tablename),'UPDATE')
    or has_table_privilege(r.role,format('%I.%I',schemaname,tablename),'DELETE')
    or has_table_privilege(r.role,format('%I.%I',schemaname,tablename),'TRUNCATE'))),'all three API roles denied direct DML and TRUNCATE');
select ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  cross join (values('anon'),('authenticated'),('service_role')) r(role)
  where n.nspname in ('app','private','api') and has_function_privilege(r.role,p.oid,'EXECUTE')),'no API role can invoke private helpers');

-- Fixture data lives only in this transaction and is rolled back at the end.
insert into auth.users(id) values(pg_temp.id(1));
insert into app.admin_profiles(user_id,display_name) values(pg_temp.id(1),'TEST administrator, not a real identity');
select is((select active from app.admin_profiles where user_id = pg_temp.id(1)),false,'new admin profile is inactive by default');
select is((select count(*)::integer from app.admin_user_roles),0,'no roles assigned by signup or profile insertion');
insert into app.brands(id,name,slug) values(pg_temp.id(20),'TEST brand','test-brand');
insert into app.product_types(id,code,name) values(pg_temp.id(10),'test-ups','TEST UPS'),(pg_temp.id(11),'test-ram','TEST RAM');
insert into app.categories(id,name,slug,product_type_id) values
  (pg_temp.id(30),'TEST UPS','test-ups',pg_temp.id(10)),(pg_temp.id(31),'TEST RAM','test-ram',pg_temp.id(11)),
  (pg_temp.id(32),'TEST parent','test-parent',null),(pg_temp.id(33),'TEST child','test-child',null);
insert into app.products(id,brand_id,product_type_id,primary_category_id,name,slug) values
  (pg_temp.id(40),pg_temp.id(20),pg_temp.id(10),pg_temp.id(30),'TEST UPS','test-ups'),
  (pg_temp.id(41),pg_temp.id(20),pg_temp.id(11),pg_temp.id(31),'TEST RAM','test-ram');
insert into app.product_categories values(pg_temp.id(40),pg_temp.id(30)),(pg_temp.id(41),pg_temp.id(31));
insert into app.product_variants(id,product_id,product_type_id,sku,model) values
  (pg_temp.id(50),pg_temp.id(40),pg_temp.id(10),'Test-UPS-01','TEST model UPS'),
  (pg_temp.id(51),pg_temp.id(41),pg_temp.id(11),'TEST-RAM-01','TEST model RAM'),
  (pg_temp.id(52),pg_temp.id(40),pg_temp.id(10),'TEST-UPS-02','TEST model UPS 2');
set constraints all immediate;
set constraints all deferred;
select is((select sku_normalized from app.product_variants where id=pg_temp.id(50)),'TEST-UPS-01','SKU canonical case');
select throws_ok($$insert into app.product_variants(product_id,product_type_id,sku,model) values(pg_temp.id(40),pg_temp.id(10),' test-ups-01 ','X')$$,'23505',null,'case/space duplicate SKU denied');
select throws_ok($$insert into app.product_variants(product_id,product_type_id,sku,model) values(pg_temp.id(40),pg_temp.id(11),'TEST-WRONG-TYPE','X')$$,'23503',null,'variant cannot borrow a different product type');
select throws_ok($$update app.categories set parent_id=id where id=pg_temp.id(30)$$,'23514',null,'self-parent denied');
select throws_ok($$update app.categories set parent_id=pg_temp.id(33) where id=pg_temp.id(32); update app.categories set parent_id=pg_temp.id(32) where id=pg_temp.id(33); set constraints all immediate$$,'23514',null,'category cycle denied at commit boundary');
select throws_ok($$insert into app.product_categories values(pg_temp.id(40),pg_temp.id(31)); set constraints all immediate$$,'23514',null,'category type mismatch denied');
select throws_ok($$delete from app.product_categories where product_id=pg_temp.id(40); set constraints all immediate$$,'23503',null,'primary category membership required');
select throws_ok($$insert into app.brands(name,slug) values('Bad slug','Upper CASE')$$,'23514',null,'invalid URL slug denied');
update app.brands set name='TEST updated' where id=pg_temp.id(20);
select is((select row_version from app.brands where id=pg_temp.id(20)),2::bigint,'row version changes automatically');

insert into app.warranty_policies(id,code,name) values(pg_temp.id(60),'test-warranty','TEST warranty');
insert into app.warranty_policy_versions(id,policy_id,version_no,start_rule,provider_name,coverage,exclusions,process,approved_by,approved_at,effective_from)
 values(pg_temp.id(61),pg_temp.id(60),1,'TEST only','TEST only','TEST only','TEST only','TEST only',pg_temp.id(1),now(),now());
insert into app.price_versions(id,variant_id,version_no,basis,amount_vnd,tax_status,approved_by,approved_at) values
 (pg_temp.id(70),pg_temp.id(50),1,'NET',100,'not_applicable',pg_temp.id(1),now()),
 (pg_temp.id(71),pg_temp.id(51),1,'GROSS',200,'unknown',pg_temp.id(1),now());
select lives_ok($$update app.product_variants set current_price_id=pg_temp.id(70) where id=pg_temp.id(50)$$,'price may point to same SKU');
select throws_ok($$update app.product_variants set current_price_id=pg_temp.id(71) where id=pg_temp.id(50)$$,'23503',null,'price of another SKU denied');
select throws_ok($$update app.price_versions set amount_vnd=1 where id=pg_temp.id(70)$$,'23514','immutable_history','approved price immutable');
select throws_ok($$delete from app.warranty_policy_versions where id=pg_temp.id(61)$$,'23514','immutable_history','approved warranty immutable');
select throws_ok($$insert into app.price_versions(variant_id,version_no,basis,amount_vnd,tax_status,approved_by,approved_at) values(pg_temp.id(50),2,'NET',-1,'unknown',pg_temp.id(1),now())$$,'23514',null,'negative price denied');
select throws_ok($$insert into app.price_versions(variant_id,version_no,basis,amount_vnd,tax_status,approved_by,approved_at) values(pg_temp.id(50),2,'NET',100,'taxable',pg_temp.id(1),now())$$,'23514',null,'taxable price needs an explicit rate');
select throws_ok($$insert into app.price_versions(variant_id,version_no,basis,amount_vnd,tax_status,tax_rate_bps,approved_by,approved_at) values(pg_temp.id(50),2,'NET',100,'unknown',0,pg_temp.id(1),now())$$,'23514',null,'unknown tax is not zero tax');

insert into app.unit_definitions values('TEST-VA','Test apparent power','test-power');
insert into app.specification_definitions(id,code,label,data_type,group_code,canonical_unit_code) values
 (pg_temp.id(80),'test-number','TEST VA','number','test','TEST-VA'),
 (pg_temp.id(81),'test-boolean','TEST boolean','boolean','test',null),
 (pg_temp.id(82),'test-enum','TEST enum','enum','test',null),
 (pg_temp.id(83),'test-multi','TEST multi','multi_enum','test',null),
 (pg_temp.id(84),'test-text','TEST text','text','test',null);
insert into app.product_type_specifications(product_type_id,definition_id,min_value,max_value) values(pg_temp.id(10),pg_temp.id(80),0,2000);
insert into app.product_type_specifications(product_type_id,definition_id) select pg_temp.id(10),pg_temp.id(n) from generate_series(81,84) n;
insert into app.specification_options(id,definition_id,code,label) values
 (pg_temp.id(90),pg_temp.id(82),'single','TEST single'),(pg_temp.id(91),pg_temp.id(83),'multi-a','TEST multi A'),(pg_temp.id(92),pg_temp.id(83),'multi-b','TEST multi B');
insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status,value_number) values(pg_temp.id(50),pg_temp.id(10),pg_temp.id(80),'number','known',0);
insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status,value_boolean) values(pg_temp.id(50),pg_temp.id(10),pg_temp.id(81),'boolean','known',false);
select is((select value_number from app.product_specifications where definition_id=pg_temp.id(80)),0::numeric,'known zero is stored as zero');
select is((select value_boolean from app.product_specifications where definition_id=pg_temp.id(81)),false,'known false is stored as false');
select throws_ok($$update app.product_specifications set value_status='unknown' where definition_id=pg_temp.id(80)$$,'23514',null,'unknown cannot carry numeric value');
select throws_ok($$update app.product_specifications set value_number='NaN' where definition_id=pg_temp.id(80)$$,'23514',null,'NaN is not a technical specification');
select throws_ok($$update app.product_specifications set value_number=2001 where definition_id=pg_temp.id(80); set constraints all immediate$$,'23514',null,'numeric bounds enforced');
select throws_ok($$update app.product_specifications set value_text='0' where definition_id=pg_temp.id(80)$$,'23514',null,'numeric cannot also carry text');
select throws_ok($$insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status,option_id) values(pg_temp.id(50),pg_temp.id(10),pg_temp.id(82),'enum','known',pg_temp.id(91))$$,'23503',null,'enum option must match definition');
select throws_ok($$insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status,value_number) values(pg_temp.id(51),pg_temp.id(11),pg_temp.id(80),'number','known',5)$$,'23503',null,'attribute not assigned to RAM type denied');
select throws_ok($$insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status) values(pg_temp.id(50),pg_temp.id(10),pg_temp.id(83),'multi_enum','known'); set constraints all immediate$$,'23514',null,'known multi enum needs selections');
insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status) values(pg_temp.id(50),pg_temp.id(10),pg_temp.id(83),'multi_enum','known');
insert into app.product_specification_options values(pg_temp.id(50),pg_temp.id(83),pg_temp.id(91));
set constraints all immediate;
set constraints all deferred;
select throws_ok($$delete from app.product_specification_options where variant_id=pg_temp.id(50); set constraints all immediate$$,'23514',null,'cannot remove last known multi-enum choice');
select throws_ok($$update app.product_specifications set value_status='unknown' where definition_id=pg_temp.id(83); set constraints all immediate$$,'23514',null,'unknown multi enum cannot retain options');
select throws_ok($$update app.specification_definitions set canonical_unit_code=null where id=pg_temp.id(80)$$,'23514',null,'canonical unit changes require migration');
select throws_ok($$update app.product_type_specifications set max_value=1 where definition_id=pg_temp.id(80)$$,'23514',null,'bounds cannot silently invalidate stored specs');

insert into app.inventory(variant_id,on_hand) values(pg_temp.id(50),10),(pg_temp.id(51),0);
select is((select available from app.inventory where variant_id=pg_temp.id(50)),10,'available is derived');
select throws_ok($$update app.inventory set on_hand=-1 where variant_id=pg_temp.id(50)$$,'23514',null,'negative inventory denied');
select throws_ok($$update app.inventory set reserved=11 where variant_id=pg_temp.id(50)$$,'23514',null,'over-reservation denied');
select throws_ok($$update app.inventory set reserved=1 where variant_id=pg_temp.id(50); set constraints all immediate$$,'23514',null,'reserved must agree with reservation rows');
insert into app.commerce_policy_versions(id,version_no) values(pg_temp.id(100),1);
select throws_ok($$update app.commerce_policy_versions set status='active' where id=pg_temp.id(100)$$,'23514',null,'cannot activate policy without business decisions');
select is((select cod_hold_seconds from app.commerce_policy_versions where id=pg_temp.id(100)),null::integer,'COD hold not invented');
insert into app.orders(id,public_reference,source,policy_version_id,payment_method,items_net_vnd,items_tax_vnd,shipping_net_vnd,shipping_tax_vnd,total_vnd,currency)
 values(pg_temp.id(110),'TEST-ORDER','retail',pg_temp.id(100),'cod',200,0,0,0,200,'VND');
insert into app.order_contacts(order_id,name,phone,delivery_address) values(pg_temp.id(110),'TEST name','TEST phone','{"version":1,"text":"TEST address"}');
insert into app.order_items(id,order_id,variant_id,quantity,unit_amount_vnd,basis,tax_status,line_net_vnd,line_tax_vnd,line_total_vnd,product_snapshot,warranty_version_id,warranty_snapshot)
 values(pg_temp.id(120),pg_temp.id(110),pg_temp.id(50),2,100,'NET','not_applicable',200,0,200,'{"sku":"TEST-UPS-01"}',pg_temp.id(61),'{}');
insert into app.stock_reservations(id,order_item_id,variant_id,quantity,state,expires_at)
 values(pg_temp.id(130),pg_temp.id(120),pg_temp.id(50),2,'active',now()+interval '5 minutes');
update app.inventory set reserved=2 where variant_id=pg_temp.id(50);
set constraints all immediate;
set constraints all deferred;
select is((select available from app.inventory where variant_id=pg_temp.id(50)),8,'atomic fixture reserves exact item quantity');
select throws_ok($$update app.orders set total_vnd=201 where id=pg_temp.id(110)$$,'23514',null,'order total equality enforced');
select throws_ok($$update app.orders set items_net_vnd=201,total_vnd=201 where id=pg_temp.id(110)$$,'23514',null,'order monetary snapshot immutable');
select throws_ok($$
 insert into app.orders(id,public_reference,source,policy_version_id,payment_method,items_net_vnd,items_tax_vnd,shipping_net_vnd,shipping_tax_vnd,total_vnd,currency)
 values(pg_temp.id(111),'TEST-BAD-TOTAL','retail',pg_temp.id(100),'cod',201,0,0,0,201,'VND');
 insert into app.order_contacts(order_id,name,phone,delivery_address) values(pg_temp.id(111),'TEST','TEST','{}');
 insert into app.order_items(order_id,variant_id,quantity,unit_amount_vnd,basis,tax_status,line_net_vnd,line_tax_vnd,line_total_vnd,product_snapshot,warranty_version_id,warranty_snapshot)
 values(pg_temp.id(111),pg_temp.id(50),2,100,'NET','not_applicable',200,0,200,'{}',pg_temp.id(61),'{}');
 set constraints all immediate
$$,'23514','order_items_total_mismatch','new order aggregate checked against line snapshots');
select throws_ok($$update app.orders set payment_method='bank_transfer' where id=pg_temp.id(110)$$,'23514',null,'commercial order terms cannot be rewritten');
select throws_ok($$delete from app.order_contacts where order_id=pg_temp.id(110); set constraints all immediate$$,'23514',null,'cannot leave order without contact');
select throws_ok($$update app.order_items set quantity=3 where id=pg_temp.id(120)$$,'23514',null,'commercial order snapshot immutable');
select throws_ok($$update app.stock_reservations set quantity=3 where id=pg_temp.id(130)$$,'23514',null,'hold quantity identity immutable');
select throws_ok($$update app.stock_reservations set state='allocated',expires_at=null where id=pg_temp.id(130)$$,'23514',null,'allocated hold needs allocation timestamp');
select throws_ok($$insert into app.stock_reservations(order_item_id,variant_id,quantity,state,expires_at) values(pg_temp.id(120),pg_temp.id(50),2,'active',now()+interval '5 minutes')$$,'23505',null,'one reservation per order item');
select throws_ok($$delete from app.product_variants where id=pg_temp.id(50)$$,'23503',null,'historically referenced SKU cannot be deleted');

insert into app.quote_requests(id,public_reference,name,email,need_text) values(pg_temp.id(140),'TEST-RFQ','TEST name','test@example.invalid','TEST requirement without known model');
set constraints all immediate;
set constraints all deferred;
select lives_ok($$insert into app.quote_requests(id,public_reference,name,phone) values(pg_temp.id(141),'TEST-RFQ-LIST','TEST name','TEST phone'); insert into app.quote_request_items(request_id,variant_id,quantity) values(pg_temp.id(141),pg_temp.id(50),500); set constraints all immediate$$,'RFQ accepts SKU-only need and quantity above inventory');
set constraints all deferred;
select throws_ok($$insert into app.quote_requests(public_reference,name,email) values('TEST-EMPTY','TEST name','test@example.invalid'); set constraints all immediate$$,'23514',null,'empty RFQ denied');
select throws_ok($$insert into app.quote_requests(public_reference,name,need_text) values('TEST-NO-CONTACT','TEST name','TEST needs')$$,'23514',null,'RFQ requires contact channel');
insert into app.quotes(id,request_id) values(pg_temp.id(150),pg_temp.id(140)),(pg_temp.id(151),pg_temp.id(141));
insert into app.quote_versions(id,quote_id,version_no) values(pg_temp.id(160),pg_temp.id(150),1),(pg_temp.id(161),pg_temp.id(151),1);
select throws_ok($$update app.quotes set current_version_id=pg_temp.id(161) where id=pg_temp.id(150)$$,'23503',null,'quote version must belong to the same root');
select throws_ok($$update app.quote_versions set content_status='approved' where id=pg_temp.id(160)$$,'23514',null,'incomplete quote cannot be approved');
select throws_ok($$insert into app.payment_entries(order_id,kind,amount_vnd,channel,operation_id,actor_id,note) values(pg_temp.id(110),'receipt',0,'TEST',pg_temp.id(195),pg_temp.id(1),'TEST')$$,'23514',null,'payment entry cannot record zero money');
insert into app.payment_entries(id,order_id,kind,amount_vnd,channel,external_reference,operation_id,actor_id,note)
 values(pg_temp.id(196),pg_temp.id(110),'receipt',100,'TEST','TEST-REF',pg_temp.id(197),pg_temp.id(1),'TEST receipt');
select throws_ok($$update app.payment_entries set amount_vnd=200 where id=pg_temp.id(196)$$,'23514','immutable_history','payment history cannot be edited');
select throws_ok($$insert into app.payment_entries(order_id,kind,amount_vnd,channel,external_reference,operation_id,actor_id,note) values(pg_temp.id(110),'receipt',100,'TEST','TEST-REF',pg_temp.id(198),pg_temp.id(1),'TEST')$$,'23505',null,'payment reference cannot be recorded twice');

insert into app.media_assets(id,bucket,object_key,mime,created_by) values(pg_temp.id(200),'TEST-private','test.png','image/png',pg_temp.id(1));
select throws_ok($$insert into app.product_images(product_id,variant_id,asset_id,alt_text) values(pg_temp.id(40),pg_temp.id(51),pg_temp.id(200),'TEST')$$,'23503',null,'image cannot bind to another product variant');
insert into app.product_images(product_id,asset_id,alt_text,is_primary) values(pg_temp.id(40),pg_temp.id(200),'TEST',true);
select throws_ok($$insert into app.product_images(product_id,asset_id,alt_text,is_primary) values(pg_temp.id(40),pg_temp.id(200),'TEST',true)$$,'23505',null,'one primary image per product scope');

insert into app.guest_sessions(id,token_hash,csrf_hash,expires_at) values(pg_temp.id(170),repeat('a',64),repeat('b',64),now()+interval '1 hour');
insert into app.order_access_tokens(id,order_id,token_hash,scope,expires_at) values(pg_temp.id(180),pg_temp.id(110),repeat('c',64),'view_masked',now()+interval '1 hour');
select throws_ok($$insert into app.guest_sessions(token_hash,csrf_hash,expires_at) values('raw-token',repeat('a',64),now()+interval '1 hour')$$,'23514',null,'raw guest credential rejected');
select throws_ok($$insert into app.guest_sessions(token_hash,csrf_hash,expires_at) values(repeat('d',64),repeat('a',64),now()-interval '1 hour')$$,'23514',null,'expired-at-creation session denied');
select throws_ok($$insert into app.order_access_tokens(order_id,token_hash,scope,expires_at) values(pg_temp.id(110),repeat('d',64),'edit_order',now()+interval '1 hour')$$,'23514',null,'guest capability cannot edit orders');
insert into app.idempotency_records(actor_scope,operation,key,request_hash,resource_type,resource_id,response_code,replay_until)
 values('TEST actor','create_order',pg_temp.id(190),repeat('e',64),'order',pg_temp.id(110),201,now()+interval '1 hour');
select throws_ok($$insert into app.idempotency_records(actor_scope,operation,key,request_hash,resource_type,resource_id,response_code,replay_until) values('TEST actor','create_order',pg_temp.id(190),repeat('f',64),'order',pg_temp.id(110),201,now()+interval '1 hour')$$,'23505',null,'idempotency duplicate denied even with changed request hash');
select throws_ok($$update app.idempotency_records set request_hash=repeat('f',64) where key=pg_temp.id(190)$$,'23514',null,'idempotency request hash immutable');
select throws_ok($$insert into app.order_contacts(order_id,name,phone,delivery_address) values(pg_temp.id(110),'TEST','TEST','[]')$$,'23514',null,'address requires an object, not an array');

-- Test default privileges on future objects, inside the rollback-only fixture.
create table app.test_future_table(id uuid);
create function private.test_future_function() returns integer language sql as $$select 1$$;
select ok(not has_table_privilege('authenticated','app.test_future_table','INSERT'),'future table not writable by authenticated');
select ok(not has_function_privilege('anon','private.test_future_function()','EXECUTE'),'future function not public-executable');

-- ACL checks already denied DML. Temporarily grant SELECT to prove RLS itself still denies rows.
grant usage on schema app to anon,authenticated;
grant select on app.order_contacts,app.admin_user_roles to anon,authenticated;
set local role anon;
select is((select count(*)::integer from app.order_contacts),0,'anon RLS cannot read customer contact even with SELECT grant');
reset role;
set local role authenticated;
select is((select count(*)::integer from app.order_contacts),0,'authenticated RLS cannot read another customer contact');
select is((select count(*)::integer from app.admin_user_roles),0,'authenticated has no admin assignments visible');
reset role;
select throws_ok($$set local role authenticated; insert into app.admin_roles(code,name) values('self-owner','forbidden')$$,'42501',null,'authenticated cannot self-promote');
select throws_ok($$set local role service_role; select * from app.order_contacts$$,'42501',null,'service role bypass of RLS does not bypass revoked schema ACL');

set constraints all immediate;
select * from finish();
rollback;
