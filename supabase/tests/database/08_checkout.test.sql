begin;
create extension if not exists pgtap with schema extensions;
set local search_path=app,extensions,public,pg_catalog;
select no_plan();
-- BEGIN CHECKOUT FIXTURE

-- CHECKOUT TEST ONLY. Caller MUST wrap in a rollback transaction or use the disposable stack.
-- Never a seed migration, never data for the live storefront.
create function pg_temp.cid(n integer) returns uuid language sql immutable as
$$ select ('70000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid $$;
grant execute on function pg_temp.cid(integer) to service_role;
insert into auth.users(id) values(pg_temp.cid(1));
insert into app.admin_profiles(user_id,display_name) values(pg_temp.cid(1),'CHECKOUT TEST reviewer without login');
insert into app.brands(id,name,slug,status) values(pg_temp.cid(2),'CHECKOUT TEST product brand','checkout-test-product-brand','active');
insert into app.product_types(id,code,name,status) values(pg_temp.cid(3),'checkout-test-product-type','CHECKOUT TEST type','active');
insert into app.categories(id,name,slug,status,parent_id,product_type_id) values
 (pg_temp.cid(4),'CHECKOUT TEST parent','checkout-test-product-root','active',null,null),
 (pg_temp.cid(5),'CHECKOUT TEST category','checkout-test-product-category','active',pg_temp.cid(4),pg_temp.cid(3));
insert into app.products(id,brand_id,product_type_id,primary_category_id,name,slug,description,publication_status,lifecycle_status,lifecycle_reason)
select pg_temp.cid(n),pg_temp.cid(2),pg_temp.cid(3),pg_temp.cid(5),'CHECKOUT TEST product '||n,'checkout-test-product-'||n,
 'CHECKOUT TEST description',case when n=12 then 'draft' when n=13 then 'hidden' else 'published' end,
 case when n=14 then 'eol' when n=15 then 'discontinued' else 'active' end,'PRIVATE lifecycle note'
from generate_series(10,16) n;
insert into app.product_categories select pg_temp.cid(n),pg_temp.cid(5) from generate_series(10,16) n;
insert into app.product_variants(id,product_id,product_type_id,sku,model,data_status,sales_mode,lifecycle_status) values
 (pg_temp.cid(20),pg_temp.cid(10),pg_temp.cid(3),'CHECKOUT TEST/sku 20','CHECKOUT TEST model 20','ready','retail','active'),
 (pg_temp.cid(21),pg_temp.cid(10),pg_temp.cid(3),'CHECKOUT TEST sku 21','CHECKOUT TEST model 21','ready','quote_only','active'),
 (pg_temp.cid(22),pg_temp.cid(10),pg_temp.cid(3),'CHECKOUT TEST sku 22','CHECKOUT TEST model 22','draft','retail','active'),
 (pg_temp.cid(23),pg_temp.cid(11),pg_temp.cid(3),'CHECKOUT TEST sku 23','CHECKOUT TEST model 23','ready','retail','active'),
 (pg_temp.cid(24),pg_temp.cid(12),pg_temp.cid(3),'CHECKOUT TEST sku 24','CHECKOUT TEST model 24','ready','retail','active'),
 (pg_temp.cid(25),pg_temp.cid(13),pg_temp.cid(3),'CHECKOUT TEST sku 25','CHECKOUT TEST model 25','ready','retail','active'),
 (pg_temp.cid(26),pg_temp.cid(14),pg_temp.cid(3),'CHECKOUT TEST sku 26','CHECKOUT TEST model 26','ready','retail','active'),
 (pg_temp.cid(27),pg_temp.cid(15),pg_temp.cid(3),'CHECKOUT TEST sku 27','CHECKOUT TEST model 27','ready','retail','active'),
 (pg_temp.cid(28),pg_temp.cid(16),pg_temp.cid(3),'CHECKOUT TEST sku 28','CHECKOUT TEST model 28','draft','retail','active');
insert into app.price_versions(id,variant_id,version_no,basis,amount_vnd,tax_status,tax_rate_bps,approved_by,approved_at) values
 (pg_temp.cid(30),pg_temp.cid(20),1,'GROSS',9007199254740993,'taxable',0,pg_temp.cid(1),now()),
 (pg_temp.cid(31),pg_temp.cid(21),1,'NET',123,'exempt',null,pg_temp.cid(1),now()),
 (pg_temp.cid(32),pg_temp.cid(23),1,'NET',456,'unknown',null,pg_temp.cid(1),now()+interval '1 day');
update app.product_variants set current_price_id=pg_temp.cid(30) where id=pg_temp.cid(20);
update app.product_variants set current_price_id=pg_temp.cid(31) where id=pg_temp.cid(21);
update app.product_variants set current_price_id=pg_temp.cid(32) where id=pg_temp.cid(23);
insert into app.inventory(variant_id,on_hand) values(pg_temp.cid(20),5),(pg_temp.cid(21),0),(pg_temp.cid(26),2);
insert into app.warranty_policies(id,code,name,status) values(pg_temp.cid(40),'checkout-test-warranty','CHECKOUT TEST warranty','active');
insert into app.warranty_policy_versions(id,policy_id,version_no,duration_months,start_rule,provider_name,coverage,exclusions,process,approved_by,approved_at,effective_from)
values(pg_temp.cid(41),pg_temp.cid(40),1,0,'CHECKOUT TEST start','CHECKOUT TEST provider','CHECKOUT TEST coverage','CHECKOUT TEST exclusions','CHECKOUT TEST process',pg_temp.cid(1),now(),now());
update app.product_variants set warranty_version_id=pg_temp.cid(41) where id=pg_temp.cid(20);
insert into app.unit_definitions(code,name,dimension) values('CHECKOUT TEST-W','CHECKOUT TEST watt','CHECKOUT TEST power');
insert into app.specification_definitions(id,code,label,data_type,group_code,status,canonical_unit_code) values
 (pg_temp.cid(50),'checkout-test-number','CHECKOUT TEST numeric zero','number','technical','active','CHECKOUT TEST-W'),
 (pg_temp.cid(51),'checkout-test-boolean','CHECKOUT TEST false','boolean','technical','active',null),
 (pg_temp.cid(52),'checkout-test-text','CHECKOUT TEST unverified','text','technical','active',null),
 (pg_temp.cid(53),'checkout-test-enum','CHECKOUT TEST enum','enum','technical','active',null),
 (pg_temp.cid(54),'checkout-test-multi','CHECKOUT TEST multi','multi_enum','technical','active',null),
 (pg_temp.cid(55),'checkout-test-missing','CHECKOUT TEST missing','number','technical','active',null),
 (pg_temp.cid(56),'checkout-test-na','CHECKOUT TEST not applicable','text','technical','active',null),
 (pg_temp.cid(57),'checkout-test-unsupported','CHECKOUT TEST unsupported','boolean','technical','active',null),
 (pg_temp.cid(58),'checkout-test-private','PRIVATE definition','text','technical','draft',null),
 (pg_temp.cid(59),'checkout-test-unknown','CHECKOUT TEST unknown','text','technical','active',null);
insert into app.product_type_specifications(product_type_id,definition_id,display_order,required_for_publish)
select pg_temp.cid(3),pg_temp.cid(n),n,n=50 from generate_series(50,59) n;
insert into app.specification_options(id,definition_id,code,label,status) values
 (pg_temp.cid(60),pg_temp.cid(53),'checkout-test-option','CHECKOUT TEST option','active'),
 (pg_temp.cid(61),pg_temp.cid(54),'checkout-test-a','CHECKOUT TEST A','active'),
 (pg_temp.cid(62),pg_temp.cid(54),'checkout-test-b','CHECKOUT TEST B','active');
insert into app.product_specifications(variant_id,product_type_id,definition_id,data_type,value_status,value_number,value_boolean,value_text,option_id,verified_by,verified_at,source_note)
select pg_temp.cid(20),pg_temp.cid(3),d.id,d.data_type,
 case when d.code='checkout-test-na' then 'not_applicable' when d.code='checkout-test-unsupported' then 'not_supported' when d.code='checkout-test-unknown' then 'unknown' else 'known' end,
 case when d.code='checkout-test-number' then 0 end,case when d.code='checkout-test-boolean' then false end,
 case when d.code in ('checkout-test-text','checkout-test-private') then 'PRIVATE unreviewed value' end,
 case when d.code='checkout-test-enum' then pg_temp.cid(60) end,
 case when d.code<>'checkout-test-text' then pg_temp.cid(1) end,case when d.code<>'checkout-test-text' then now() end,'PRIVATE source note'
from app.specification_definitions d where d.id between pg_temp.cid(50) and pg_temp.cid(59) and d.code<>'checkout-test-missing';
insert into app.product_specification_options values(pg_temp.cid(20),pg_temp.cid(54),pg_temp.cid(61)),(pg_temp.cid(20),pg_temp.cid(54),pg_temp.cid(62));
set constraints all immediate;
set constraints all deferred;


insert into app.commerce_policy_versions(id,version_no,cod_hold_seconds,transfer_hold_seconds,tax_rule_version,terms_version,bank_instruction_version,rules_json)
values(pg_temp.cid(100),700,600,900,'vnd-line-half-up-v1','TEST-terms','TEST-bank',
'{"schema_version":1,"max_lines":10,"max_line_quantity":5,"max_total_quantity":20,"payment_methods":["cod","bank_transfer"],"cod_max_total_vnd":"9223372036854775807","destinations":[{"province_code":"TEST-P","ward_code":"TEST-W","zone_code":"TEST-Z"}]}');
insert into app.shipping_rules(id,policy_version_id,zone_code,service_code,method_conditions,basis,net_or_gross_fee_vnd,tax_status,tax_rate_bps,active)
values(pg_temp.cid(101),pg_temp.cid(100),'TEST-Z','standard','{"payment_methods":["cod","bank_transfer"]}','NET',101,'taxable',1000,true);
-- Policy remains DRAFT. Only tests explicitly activate it.
-- END CHECKOUT FIXTURE
create function pg_temp.call(action text,payload jsonb default '{}') returns jsonb language sql as $$
 select api.commerce_request(action,repeat('a',64),repeat('b',64),repeat('c',64),payload)
$$;
create function pg_temp.cart(n integer default 20,q integer default 2) returns jsonb language sql as $$
 select jsonb_build_object('items',jsonb_build_array(jsonb_build_object('variant_id',pg_temp.cid(n),'quantity',q)))
$$;
create function pg_temp.preview(n integer default 20,q integer default 2) returns jsonb language sql as $$
 select pg_temp.cart(n,q)||'{"destination":{"province_code":"TEST-P","ward_code":"TEST-W"},"payment_method":"cod","shipping_service":"standard"}'::jsonb
$$;
select ok(has_function_privilege('service_role','api.commerce_request(text,text,text,text,jsonb)','EXECUTE'),'service role RPC granted');
select ok(not has_function_privilege('anon','api.commerce_request(text,text,text,text,jsonb)','EXECUTE'),'anon denied');
select ok(not has_function_privilege('authenticated','api.commerce_request(text,text,text,text,jsonb)','EXECUTE'),'staff cannot impersonate guest');
select ok(not has_function_privilege('service_role','private.checkout_review(jsonb,boolean,uuid)','EXECUTE'),'private helper denied');
select ok(not has_table_privilege('service_role','app.guest_sessions','SELECT'),'raw guest sessions denied');
select is(pg_temp.call('cart',pg_temp.cart())->>'error','GUEST_SESSION_REQUIRED','missing session rejected');
select is(pg_temp.call('session',jsonb_build_object('new_session_hash',repeat('a',64),'ttl_seconds',1800))#>>'{data,reused}','false','new session created');
select is((select count(*)::integer from app.guest_sessions),1,'one hashed session');
select is(api.commerce_request('cart',repeat('a',64),repeat('d',64),repeat('c',64),pg_temp.cart())->>'error','CSRF_INVALID','wrong CSRF rejected');
select is(pg_temp.call('cart',pg_temp.cart())#>>'{data,policy_configured}','false','draft policy never enables totals');
select is(pg_temp.call('cart',pg_temp.cart())#>'{data,lines,0,amounts}','null'::jsonb,'no guessed tax before policy approval');
select is(pg_temp.call('preview',pg_temp.preview())->>'error','CHECKOUT_NOT_CONFIGURED','preview needs approved policy');
update app.commerce_policy_versions set status='active',approved_by=pg_temp.cid(1),approved_at=now() where id=pg_temp.cid(100);
select is(pg_temp.call('preview',pg_temp.preview())#>>'{data,totals,total_vnd}','18014398509482097','exact total above JS safe integer includes shipping tax');
select is(pg_temp.call('preview',pg_temp.preview())#>>'{data,submission_enabled}','false','preview cannot place order');
select is(pg_temp.call('preview',pg_temp.preview())#>>'{data,inventory_reserved}','false','preview cannot reserve');
select is(pg_temp.call('preview',pg_temp.preview())#>>'{data,order_created}','false','preview does not create orders');
select is((select count(*)::integer from app.orders),0,'no orders inserted');
select is((select sum(reserved)::integer from app.inventory),0,'inventory untouched');
select is(pg_temp.call('preview',pg_temp.preview())#>>'{data,fingerprint}',pg_temp.call('preview',pg_temp.preview())#>>'{data,fingerprint}','same request fingerprint stable');
select isnt(pg_temp.call('preview',pg_temp.preview())#>>'{data,fingerprint}',pg_temp.call('preview',pg_temp.preview(20,1))#>>'{data,fingerprint}','quantity changes fingerprint');
select ok(pg_temp.call('cart',pg_temp.cart())::text !~ 'PRIVATE|current_price_id|warranty_version_id|on_hand|reserved_quantity|token_hash|csrf_hash','no private fields exposed');
select is(pg_temp.call('cart','{"items":[]}')#>'{data,lines}','[]'::jsonb,'empty cart permitted');
select is(pg_temp.call('preview',pg_temp.preview()||'{"items":[]}')->>'error','INVALID_COMMERCE_INPUT','empty checkout rejected');
select is(pg_temp.call('cart',pg_temp.cart()||'{"price":1}')->>'error','INVALID_COMMERCE_INPUT','client price rejected');
select is(pg_temp.call('cart',pg_temp.cart(20,0))->>'error','INVALID_COMMERCE_INPUT','zero quantity rejected');
select is(pg_temp.call('cart',pg_temp.cart(20,10001))->>'error','INVALID_COMMERCE_INPUT','technical quantity bound');
select is(pg_temp.call('cart',jsonb_build_object('items',(pg_temp.cart()->'items')||(pg_temp.cart()->'items')))->>'error','INVALID_COMMERCE_INPUT','duplicate SKU rejected');
select is(pg_temp.call('cart',pg_temp.cart(24))#>'{data,lines,0,issues}','["ITEM_UNAVAILABLE"]'::jsonb,'draft product concealed');
select is(pg_temp.call('cart',pg_temp.cart(999))#>'{data,lines,0,issues}','["ITEM_UNAVAILABLE"]'::jsonb,'unknown indistinguishable');
select ok(pg_temp.call('cart',pg_temp.cart(21))#>'{data,lines,0,issues}' ? 'NOT_RETAIL','quote only cannot retail checkout');
select ok(pg_temp.call('cart',pg_temp.cart(26))#>'{data,lines,0,issues}' ? 'NOT_RETAIL','EOL cannot checkout');
delete from app.abuse_counters;
select ok(pg_temp.call('cart',pg_temp.cart(23))#>'{data,lines,0,issues}' ? 'PRICE_UNAVAILABLE','future approved price unavailable');
select ok(pg_temp.call('cart',pg_temp.cart(23))#>'{data,lines,0,issues}' ? 'STOCK_UNKNOWN','missing stock unknown');
select ok(pg_temp.call('cart',pg_temp.cart(23))#>'{data,lines,0,issues}' ? 'WARRANTY_UNAVAILABLE','missing warranty blocks');
select ok(pg_temp.call('cart',pg_temp.cart(20,6))#>'{data,lines,0,issues}' ? 'INSUFFICIENT_STOCK','exact quantity checked');
select ok(pg_temp.call('cart',pg_temp.cart(20,6))#>'{data,lines,0,issues}' ? 'QUANTITY_LIMIT','approved business quantity checked');
select is(pg_temp.call('preview',pg_temp.preview(20,6))->>'error','CHECKOUT_REVIEW_BLOCKED','invalid cart cannot preview totals');
update app.product_specifications set verified_at=null,verified_by=null where variant_id=pg_temp.cid(20) and definition_id=pg_temp.cid(50);
select ok(pg_temp.call('cart',pg_temp.cart())#>'{data,lines,0,issues}' ? 'SPECIFICATION_UNVERIFIED','required unverified spec blocks');
update app.product_specifications set verified_at=now(),verified_by=pg_temp.cid(1) where variant_id=pg_temp.cid(20) and definition_id=pg_temp.cid(50);
select is(pg_temp.call('preview',pg_temp.preview())#>>'{status}','200','known zero is valid');
select is(pg_temp.call('preview',jsonb_set(pg_temp.preview(),'{destination,ward_code}','"UNKNOWN"'))->>'error','DESTINATION_UNSUPPORTED','cannot choose invented shipping zone');
select is(pg_temp.call('preview',pg_temp.preview()||'{"shipping_service":"unknown"}')->>'error','SHIPPING_UNSUPPORTED','missing rule not free shipping');
select is(private.checkout_money(5,'NET','taxable',1000)->>'tax_vnd','1','NET half-up line rounding');
select is(private.checkout_money(11,'GROSS','taxable',1000)->>'net_vnd','10','GROSS split exact');
select is(private.checkout_money(1,'GROSS','taxable',10000)->>'tax_vnd','1','GROSS half-up tax');
select is(private.checkout_money(5,'NET','exempt',null)->>'tax_vnd','0','explicit exemption');
select is(private.checkout_money(5,'NET','unknown',null),null::jsonb,'unknown tax never zero');
select is(private.checkout_money(9223372036854775807,'NET','taxable',1),null::jsonb,'overflow blocked');
select ok(not private.checkout_policy_valid('{}'),'empty policy invalid');
select ok(not private.checkout_policy_valid((select rules_json||'{"max_lines":51}' from app.commerce_policy_versions where id=pg_temp.cid(100))),'policy cannot exceed technical bound');
select ok(not private.checkout_policy_valid((select rules_json||jsonb_build_object('destinations',rules_json->'destinations'||rules_json->'destinations') from app.commerce_policy_versions where id=pg_temp.cid(100))),'ambiguous destination policy rejected');

delete from app.abuse_counters;
create temporary table checkout_before as select pg_temp.call('preview',pg_temp.preview())#>>'{data,fingerprint}' as fingerprint;
insert into app.price_versions(id,variant_id,version_no,basis,amount_vnd,tax_status,tax_rate_bps,approved_by,approved_at)
values(pg_temp.cid(110),pg_temp.cid(20),2,'NET',5,'taxable',1000,pg_temp.cid(1),now());
update app.product_variants set current_price_id=pg_temp.cid(110) where id=pg_temp.cid(20);
select isnt(pg_temp.call('preview',pg_temp.preview())#>>'{data,fingerprint}',(select fingerprint from checkout_before),'current price change invalidates fingerprint');
select is(pg_temp.call('preview',pg_temp.preview())#>>'{data,totals,total_vnd}','122','uses current NET price and line tax');
update app.inventory set on_hand=1 where variant_id=pg_temp.cid(20);
select is(pg_temp.call('preview',pg_temp.preview())->>'error','CHECKOUT_REVIEW_BLOCKED','stock change immediately blocks stale review');
update app.inventory set on_hand=5 where variant_id=pg_temp.cid(20);
insert into app.price_versions(id,variant_id,version_no,basis,amount_vnd,tax_status,approved_by,approved_at)
values(pg_temp.cid(111),pg_temp.cid(20),3,'GROSS',10,'unknown',pg_temp.cid(1),now());
update app.product_variants set current_price_id=pg_temp.cid(111) where id=pg_temp.cid(20);
select ok(pg_temp.call('cart',pg_temp.cart())#>'{data,lines,0,issues}' ? 'TAX_UNKNOWN','current unknown tax blocks retail review');
update app.product_variants set current_price_id=pg_temp.cid(110) where id=pg_temp.cid(20);
update app.warranty_policies set status='archived' where id=pg_temp.cid(40);
select ok(pg_temp.call('cart',pg_temp.cart())#>'{data,lines,0,issues}' ? 'WARRANTY_UNAVAILABLE','withdrawn warranty blocks');
update app.warranty_policies set status='active' where id=pg_temp.cid(40);
update app.commerce_policy_versions set status='retired' where id=pg_temp.cid(100);
insert into app.commerce_policy_versions(id,version_no,cod_hold_seconds,transfer_hold_seconds,tax_rule_version,terms_version,bank_instruction_version,rules_json)
select pg_temp.cid(102),701,cod_hold_seconds,transfer_hold_seconds,tax_rule_version,terms_version,bank_instruction_version,
 rules_json||'{"cod_max_total_vnd":"100","payment_methods":["cod"]}'::jsonb from app.commerce_policy_versions where id=pg_temp.cid(100);
insert into app.shipping_rules(policy_version_id,zone_code,service_code,method_conditions,basis,net_or_gross_fee_vnd,tax_status,tax_rate_bps,priority,active)
select pg_temp.cid(102),zone_code,service_code,method_conditions,basis,net_or_gross_fee_vnd,tax_status,tax_rate_bps,priority,true from app.shipping_rules where id=pg_temp.cid(101);
insert into app.shipping_rules(policy_version_id,zone_code,service_code,method_conditions,basis,net_or_gross_fee_vnd,tax_status,tax_rate_bps,priority,active)
select pg_temp.cid(102),zone_code,'ambiguous',method_conditions,basis,net_or_gross_fee_vnd,tax_status,tax_rate_bps,n,true from app.shipping_rules cross join generate_series(1,2) n where id=pg_temp.cid(101);
update app.commerce_policy_versions set status='active',approved_by=pg_temp.cid(1),approved_at=now() where id=pg_temp.cid(102);
select is(pg_temp.call('preview',pg_temp.preview())->>'error','COD_LIMIT_EXCEEDED','approved COD cap enforced');
select is(pg_temp.call('preview',pg_temp.preview()||'{"payment_method":"bank_transfer"}')->>'error','PAYMENT_UNSUPPORTED','approved payment method restriction');
select is(pg_temp.call('preview',pg_temp.preview()||'{"shipping_service":"ambiguous"}')->>'error','CHECKOUT_NOT_CONFIGURED','multiple matching rules never select arbitrary fee');
select throws_ok($$update app.shipping_rules set net_or_gross_fee_vnd=0 where policy_version_id=pg_temp.cid(102)$$,'23514',null,'active shipping rules immutable');
select is(pg_temp.call('preview',pg_temp.preview()||'{"payment_method":null}')->>'error','INVALID_COMMERCE_INPUT','null payment rejected at SQL boundary');
select ok(not private.checkout_policy_valid((select rules_json||'{"schema_version":"1"}' from app.commerce_policy_versions where id=pg_temp.cid(100))),'policy version must be numeric');
delete from app.abuse_counters;
select is(pg_temp.call('session',jsonb_build_object('new_session_hash',repeat('e',64),'ttl_seconds',1800))#>>'{data,reused}','true','existing session preserved');
select is((select count(*)::integer from app.guest_sessions),1,'reuse does not create new rows');
select is(pg_temp.call('logout')->>'status','200','logout revokes session');
select is(pg_temp.call('cart',pg_temp.cart())->>'error','GUEST_SESSION_REQUIRED','revoked token rejected');
select is(pg_temp.call('session',jsonb_build_object('new_session_hash',repeat('e',64),'ttl_seconds',1800))#>>'{data,reused}','false','revoked session replaced');
update app.guest_sessions set expires_at=now()-interval '1 second',created_at=now()-interval '1 hour' where token_hash=repeat('e',64);
select is(api.commerce_request('cart',repeat('e',64),repeat('b',64),repeat('c',64),pg_temp.cart())->>'error','GUEST_SESSION_REQUIRED','expired session rejected');
delete from app.abuse_counters;
select ok((select bool_and(private.commerce_limit(repeat('f',64),'TEST-rate',3)) from generate_series(1,3)),'limit allows first three');
select ok(not private.commerce_limit(repeat('f',64),'TEST-rate',3),'fourth denied');
select is((select count from app.abuse_counters where action='TEST-rate'),4,'denied request counter retained');
select ok(not private.commerce_limit(repeat('f',64),'TEST-rate',3),'repeated denied');
select is((select count from app.abuse_counters where action='TEST-rate'),4,'counter saturates safely');
select * from finish();
rollback;
