-- Preserve applied migration history; explicit JSON defaults and honest volatility.
alter function private.checkout_money(numeric,text,text,integer) stable;
create or replace function private.checkout_review(body jsonb, preview boolean, guest_id uuid) returns jsonb
language plpgsql stable security invoker set search_path=pg_catalog as $$
declare line jsonb; v record; raw app.product_variants; policy app.commerce_policy_versions; ship app.shipping_rules;
 lines jsonb:='[]'::jsonb; issues jsonb; money jsonb; shipping jsonb; totals jsonb; signature jsonb:='[]'::jsonb;
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

notify pgrst,'reload schema';
