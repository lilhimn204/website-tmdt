-- 08.7: review only. No orders, reservations, payment or inventory mutations.
create index abuse_counters_expiry on app.abuse_counters(expires_at);

create function private.commerce_limit(bucket text, action_name text, ceiling integer) returns boolean
language plpgsql volatile security invoker set search_path=pg_catalog as $$
declare hits integer; stamp timestamptz:=date_trunc('minute',statement_timestamp());
begin
 delete from app.abuse_counters where ctid in (select ctid from app.abuse_counters
   where expires_at<statement_timestamp() order by expires_at limit 100);
 insert into app.abuse_counters(bucket_key_hash,action,window_start,count,expires_at)
 values(bucket,action_name,stamp,1,stamp+interval '2 minutes')
 on conflict(action,bucket_key_hash,window_start) do update
 set count=least(app.abuse_counters.count::bigint+1,ceiling+1)::integer returning count into hits;
 return hits<=ceiling;
end $$;

create function private.checkout_policy_valid(r jsonb) returns boolean
language plpgsql immutable security invoker set search_path=pg_catalog as $$
declare d jsonb; k text;
begin
 if jsonb_typeof(r) is distinct from 'object' or r->'schema_version' is distinct from '1'::jsonb
   or not r ?& array['schema_version','max_lines','max_line_quantity','max_total_quantity','payment_methods','cod_max_total_vnd','destinations']
   or r-array['schema_version','max_lines','max_line_quantity','max_total_quantity','payment_methods','cod_max_total_vnd','destinations']<>'{}' then return false; end if;
 foreach k in array array['max_lines','max_line_quantity','max_total_quantity'] loop
   if jsonb_typeof(r->k) is distinct from 'number' or (r->>k)!~'^[1-9][0-9]{0,5}$' then return false; end if;
 end loop;
 if (r->>'max_lines')::integer>50 or (r->>'max_line_quantity')::integer>10000
   or (r->>'max_total_quantity')::integer>500000
   or jsonb_typeof(r->'cod_max_total_vnd') is distinct from 'string'
   or (r->>'cod_max_total_vnd')!~'^[1-9][0-9]{0,18}$'
   or (r->>'cod_max_total_vnd')::numeric>9223372036854775807
   or jsonb_typeof(r->'payment_methods') is distinct from 'array'
   or jsonb_array_length(r->'payment_methods') not between 1 and 2
   or not (r->'payment_methods'<@'["cod","bank_transfer"]'::jsonb)
   or (select count(distinct v) from jsonb_array_elements(r->'payment_methods') v)<>jsonb_array_length(r->'payment_methods')
   or jsonb_typeof(r->'destinations') is distinct from 'array'
   or jsonb_array_length(r->'destinations') not between 1 and 20000 then return false; end if;
 for d in select value from jsonb_array_elements(r->'destinations') loop
   if jsonb_typeof(d) is distinct from 'object' or not d ?& array['province_code','ward_code','zone_code']
     or d-array['province_code','ward_code','zone_code']<>'{}' then return false; end if;
   foreach k in array array['province_code','ward_code','zone_code'] loop
     if jsonb_typeof(d->k) is distinct from 'string' or (d->>k)!~'^[a-zA-Z0-9_-]{1,32}$' then return false; end if;
   end loop;
 end loop;
 return (select count(distinct (v->>'province_code',v->>'ward_code')) from jsonb_array_elements(r->'destinations') v)=jsonb_array_length(r->'destinations');
exception when others then return false;
end $$;

create function private.checkout_money(amount numeric,basis text,tax_status text,rate integer) returns jsonb
language plpgsql immutable security invoker set search_path=pg_catalog as $$
declare net numeric; tax numeric;
begin
 -- Explicitly selected vnd-line-half-up-v1 only; no implicit business policy.
 if amount is null or amount<0 or amount<>trunc(amount) or basis not in ('NET','GROSS')
   or tax_status not in ('taxable','exempt','not_applicable')
   or (tax_status='taxable' and (rate is null or rate not between 0 and 10000)) then return null; end if;
 if tax_status<>'taxable' then net:=amount; tax:=0;
 elsif basis='NET' then net:=amount; tax:=round(amount*rate/10000);
 else tax:=round(amount*rate/(10000+rate)); net:=amount-tax; end if;
 if net+tax>9223372036854775807 then return null; end if;
 return jsonb_build_object('net_vnd',net::text,'tax_vnd',tax::text,'total_vnd',(net+tax)::text);
end $$;

create function private.checkout_review(body jsonb, preview boolean, guest_id uuid) returns jsonb
language plpgsql stable security invoker set search_path=pg_catalog as $$
declare line jsonb; v record; raw app.product_variants; policy app.commerce_policy_versions; ship app.shipping_rules;
 lines jsonb:='[]'; issues jsonb; money jsonb; shipping jsonb; totals jsonb; signature jsonb:='[]';
 qty integer; available_count integer; zone text; matches integer; net numeric:=0; tax numeric:=0; total numeric;
 blocked boolean:=false; configured boolean; limit_issue boolean; result jsonb;
begin
 select * into policy from app.commerce_policy_versions where status='active' and approved_at<=statement_timestamp();
 configured:=policy.id is not null and policy.tax_rule_version='vnd-line-half-up-v1' and private.checkout_policy_valid(policy.rules_json);
 if preview and not configured then return jsonb_build_object('status',503,'error','CHECKOUT_NOT_CONFIGURED'); end if;
 limit_issue:=configured and (jsonb_array_length(body->'items')>(policy.rules_json->>'max_lines')::integer
   or (select coalesce(sum((i->>'quantity')::integer),0) from jsonb_array_elements(body->'items') i)>(policy.rules_json->>'max_total_quantity')::integer);
 for line in select value from jsonb_array_elements(body->'items') loop
   qty:=(line->>'quantity')::integer; issues:='[]'; money:=null;
   select * into raw from app.product_variants where id=(line->>'variant_id')::uuid;
   select * into v from private.public_variant_rows(raw.product_id) where id=raw.id;
   if not found then
     issues:='["ITEM_UNAVAILABLE"]';
     lines:=lines||jsonb_build_array(jsonb_build_object('variant_id',line->>'variant_id','quantity',qty,'variant',null,'issues',issues,'amounts',null));
     blocked:=true; continue;
   end if;
   if v.sales_mode<>'retail' or v.lifecycle_status<>'active' then issues:=issues||'"NOT_RETAIL"'::jsonb; end if;
   if v.price is null then issues:=issues||'"PRICE_UNAVAILABLE"'::jsonb;
   elsif v.price->>'tax_status'='unknown' then issues:=issues||'"TAX_UNKNOWN"'::jsonb; end if;
   if v.warranty is null then issues:=issues||'"WARRANTY_UNAVAILABLE"'::jsonb; end if;
   select available into available_count from app.inventory where variant_id=v.id;
   if available_count is null then issues:=issues||'"STOCK_UNKNOWN"'::jsonb;
   elsif available_count<qty then issues:=issues||'"INSUFFICIENT_STOCK"'::jsonb; end if;
   if exists(select 1 from app.product_type_specifications ts join app.specification_definitions d on d.id=ts.definition_id
     where ts.product_type_id=raw.product_type_id and ts.required_for_publish and (d.status<>'active' or not exists(
       select 1 from private.public_specification_rows(v.id) s where s.code=d.code and s.value_status<>'unknown'))) then
     issues:=issues||'"SPECIFICATION_UNVERIFIED"'::jsonb;
   end if;
   if limit_issue or (configured and qty>(policy.rules_json->>'max_line_quantity')::integer) then issues:=issues||'"QUANTITY_LIMIT"'::jsonb; end if;
   if configured and v.price is not null and v.price->>'tax_status'<>'unknown' then
     money:=private.checkout_money((v.price->>'amount_vnd')::numeric*qty,v.price->>'basis',v.price->>'tax_status',(v.price->>'tax_rate_bps')::integer);
     if money is null then issues:=issues||'"AMOUNT_OVERFLOW"'::jsonb;
     else net:=net+(money->>'net_vnd')::numeric; tax:=tax+(money->>'tax_vnd')::numeric; end if;
   end if;
   blocked:=blocked or issues<>'[]';
   lines:=lines||jsonb_build_array(jsonb_build_object('variant_id',v.id,'quantity',qty,'variant',to_jsonb(v),'issues',issues,'amounts',money));
   signature:=signature||jsonb_build_array(jsonb_build_object('variant_id',v.id,'quantity',qty,'price_version_id',raw.current_price_id,'warranty_version_id',raw.warranty_version_id));
 end loop;
 result:=jsonb_build_object('lines',lines,'policy_configured',configured,'order_created',false,'inventory_reserved',false,'submission_enabled',false);
 if not preview then return jsonb_build_object('status',200,'data',result); end if;
 if blocked then return jsonb_build_object('status',422,'error','CHECKOUT_REVIEW_BLOCKED','data',result); end if;
 if not (policy.rules_json->'payment_methods' ? (body->>'payment_method')) then
   return jsonb_build_object('status',422,'error','PAYMENT_UNSUPPORTED'); end if;
 select d->>'zone_code' into zone from jsonb_array_elements(policy.rules_json->'destinations') d
   where d->>'province_code'=body#>>'{destination,province_code}' and d->>'ward_code'=body#>>'{destination,ward_code}';
 if zone is null then return jsonb_build_object('status',422,'error','DESTINATION_UNSUPPORTED'); end if;
 -- Fail closed for malformed/ambiguous matching rules; never guess free shipping.
 if exists(select 1 from app.shipping_rules s where s.policy_version_id=policy.id and s.active and s.zone_code=zone and s.service_code=body->>'shipping_service'
   and (s.method_conditions-array['payment_methods']<>'{}' or jsonb_typeof(s.method_conditions->'payment_methods') is distinct from 'array'
     or not (s.method_conditions->'payment_methods'<@'["cod","bank_transfer"]'::jsonb))) then
   return jsonb_build_object('status',503,'error','CHECKOUT_NOT_CONFIGURED'); end if;
 select count(*) into matches from app.shipping_rules s where s.policy_version_id=policy.id and s.active and s.zone_code=zone
   and s.service_code=body->>'shipping_service' and s.method_conditions->'payment_methods' ? (body->>'payment_method');
 if matches=0 then return jsonb_build_object('status',422,'error','SHIPPING_UNSUPPORTED'); end if;
 if matches<>1 then return jsonb_build_object('status',503,'error','CHECKOUT_NOT_CONFIGURED'); end if;
 select * into ship from app.shipping_rules s where s.policy_version_id=policy.id and s.active and s.zone_code=zone
   and s.service_code=body->>'shipping_service' and s.method_conditions->'payment_methods' ? (body->>'payment_method');
 shipping:=private.checkout_money(ship.net_or_gross_fee_vnd,ship.basis,ship.tax_status,ship.tax_rate_bps);
 total:=net+tax+(shipping->>'total_vnd')::numeric;
 if shipping is null or total>9223372036854775807 then return jsonb_build_object('status',422,'error','AMOUNT_OVERFLOW'); end if;
 if body->>'payment_method'='cod' and total>(policy.rules_json->>'cod_max_total_vnd')::numeric then
   return jsonb_build_object('status',422,'error','COD_LIMIT_EXCEEDED'); end if;
 totals:=jsonb_build_object('items_net_vnd',net::text,'items_tax_vnd',tax::text,'shipping_net_vnd',shipping->>'net_vnd',
   'shipping_tax_vnd',shipping->>'tax_vnd','total_vnd',total::text,'currency','VND');
 select jsonb_agg(i order by i->>'variant_id') into signature from jsonb_array_elements(signature) i;
 result:=result||jsonb_build_object('totals',totals,'terms_version',policy.terms_version,'policy_version',policy.version_no,
   'calculated_at',statement_timestamp(),'fingerprint',encode(extensions.digest(jsonb_build_object('guest',guest_id,'items',signature,
     'policy',policy.id,'shipping',ship.id,'destination',body->'destination','payment_method',body->>'payment_method','totals',totals)::text,'sha256'),'hex'));
 return jsonb_build_object('status',200,'data',result);
end $$;

create function api.commerce_request(action_name text,session_hash text,csrf_hash text,ip_hash text,body jsonb) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare guest app.guest_sessions; item jsonb; key text; count_items integer; allowed boolean; ttl integer;
begin
 if action_name is null or action_name not in ('session','logout','cart','preview') or ip_hash is null or ip_hash!~'^[a-f0-9]{64}$'
   or session_hash is null or session_hash!~'^[a-f0-9]{64}$' or csrf_hash is null or csrf_hash!~'^[a-f0-9]{64}$'
   or jsonb_typeof(body) is distinct from 'object' or octet_length(body::text)>65536 then
   raise sqlstate '22023' using message='INVALID_COMMERCE_INPUT'; end if;
 -- Error envelopes commit counters, unlike exceptions which would roll them back.
 if not private.commerce_limit(ip_hash,'commerce.ip.'||action_name,case action_name when 'session' then 20 else 60 end) then
   return jsonb_build_object('status',429,'error','TOO_MANY_REQUESTS'); end if;
 if action_name='session' then
   if not body ?& array['new_session_hash','ttl_seconds'] or body-array['new_session_hash','ttl_seconds']<>'{}'
     or jsonb_typeof(body->'new_session_hash') is distinct from 'string' or (body->>'new_session_hash')!~'^[a-f0-9]{64}$'
     or jsonb_typeof(body->'ttl_seconds') is distinct from 'number' or (body->>'ttl_seconds')!~'^[1-9][0-9]{1,4}$' then
     return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
   ttl:=(body->>'ttl_seconds')::integer;
   if ttl not between 60 and 86400 then return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
   select * into guest from app.guest_sessions where token_hash=session_hash and revoked_at is null and expires_at>statement_timestamp() for update;
   if found then
     update app.guest_sessions set csrf_hash=commerce_request.csrf_hash where id=guest.id;
     return jsonb_build_object('status',200,'data',jsonb_build_object('reused',true,'expires_at',guest.expires_at));
   end if;
   insert into app.guest_sessions(token_hash,csrf_hash,expires_at) values(body->>'new_session_hash',csrf_hash,statement_timestamp()+make_interval(secs=>ttl)) returning * into guest;
   return jsonb_build_object('status',200,'data',jsonb_build_object('reused',false,'expires_at',guest.expires_at));
 end if;
 select * into guest from app.guest_sessions where token_hash=session_hash and revoked_at is null and expires_at>statement_timestamp() for update;
 if not found then return jsonb_build_object('status',401,'error','GUEST_SESSION_REQUIRED'); end if;
 if guest.csrf_hash<>csrf_hash then return jsonb_build_object('status',403,'error','CSRF_INVALID'); end if;
 allowed:=private.commerce_limit(session_hash,'commerce.session.'||action_name,30);
 if not allowed then return jsonb_build_object('status',429,'error','TOO_MANY_REQUESTS'); end if;
 if action_name='logout' then
   if body<>'{}' then return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
   update app.guest_sessions set revoked_at=statement_timestamp() where id=guest.id;
   return jsonb_build_object('status',200,'data',jsonb_build_object('logged_out',true));
 end if;
 if jsonb_typeof(body->'items') is distinct from 'array' or body-(case when action_name='cart' then array['items']
   else array['items','destination','payment_method','shipping_service'] end)<>'{}' then
   return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
 count_items:=jsonb_array_length(body->'items');
 if count_items>50 or (action_name='preview' and count_items=0) then return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
 for item in select value from jsonb_array_elements(body->'items') loop
   if jsonb_typeof(item) is distinct from 'object' or not item ?& array['variant_id','quantity'] or item-array['variant_id','quantity']<>'{}'
     or jsonb_typeof(item->'variant_id') is distinct from 'string' or (item->>'variant_id')!~'^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
     or jsonb_typeof(item->'quantity') is distinct from 'number' or (item->>'quantity')!~'^[1-9][0-9]{0,4}$'
     or (item->>'quantity')::numeric>10000 then return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
 end loop;
 if (select count(distinct (i->>'variant_id')::uuid) from jsonb_array_elements(body->'items') i)<>count_items then
   return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
 if action_name='preview' then
   if not body ?& array['destination','payment_method','shipping_service'] or jsonb_typeof(body->'payment_method') is distinct from 'string' or body->>'payment_method' not in ('cod','bank_transfer')
     or jsonb_typeof(body->'destination') is distinct from 'object' or not (body->'destination') ?& array['province_code','ward_code']
     or (body->'destination')-array['province_code','ward_code']<>'{}' then return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
   foreach key in array array['province_code','ward_code'] loop
     if jsonb_typeof(body->'destination'->key) is distinct from 'string' or (body->'destination'->>key)!~'^[a-zA-Z0-9_-]{1,32}$' then
       return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
   end loop;
   if jsonb_typeof(body->'shipping_service') is distinct from 'string' or (body->>'shipping_service')!~'^[a-zA-Z0-9_-]{1,32}$' then
     return jsonb_build_object('status',400,'error','INVALID_COMMERCE_INPUT'); end if;
 end if;
 return private.checkout_review(body,action_name='preview',guest.id);
end $$;

revoke all on function private.commerce_limit(text,text,integer),private.checkout_policy_valid(jsonb),private.checkout_money(numeric,text,text,integer),
 private.checkout_review(jsonb,boolean,uuid),api.commerce_request(text,text,text,text,jsonb) from public,anon,authenticated,service_role;
grant usage on schema api to service_role;
grant execute on function api.commerce_request(text,text,text,text,jsonb) to service_role;
notify pgrst,'reload schema';
