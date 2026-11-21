-- 08.5: public, read-only product projections. Never grant raw table access.
create function private.public_product_rows()
returns table(id uuid,name text,slug text,model_family text,description text,lifecycle_status text,
 brand jsonb,product_type jsonb,primary_category jsonb)
language sql stable security invoker set search_path=pg_catalog as $$
 select p.id,p.name::text,p.slug::text,p.model_family,p.description,p.lifecycle_status::text,
   jsonb_build_object('id',b.id,'name',b.name,'slug',b.slug),
   jsonb_build_object('code',t.code,'name',t.name),
   jsonb_build_object('id',c.id,'name',c.name,'slug',c.slug)
 from app.products p join app.brands b on b.id=p.brand_id and b.status='active'
 join app.product_types t on t.id=p.product_type_id and t.status='active'
 join private.public_category_rows() c on c.id=p.primary_category_id
 where p.publication_status='published'
   and exists(select 1 from app.product_variants v where v.product_id=p.id and v.data_status='ready')
$$;

create function private.public_variant_rows(requested_product_id uuid)
returns table(id uuid,product_id uuid,sku text,model text,variant_label text,lifecycle_status text,
 sales_mode text,price jsonb,availability text,warranty jsonb,purchase_enabled boolean)
language sql stable security invoker set search_path=pg_catalog as $$
 select v.id,v.product_id,v.sku::text,v.model::text,v.variant_label,
   case when p.lifecycle_status='eol' or v.lifecycle_status='eol' then 'eol'
     when p.lifecycle_status='discontinued' or v.lifecycle_status='discontinued' then 'discontinued' else 'active' end,
   case when p.lifecycle_status<>'active' or v.lifecycle_status<>'active' then 'not_for_sale' else v.sales_mode end,
   case when price.id is null then null else jsonb_build_object('amount_vnd',price.amount_vnd::text,
     'basis',price.basis,'tax_status',price.tax_status,'tax_rate_bps',price.tax_rate_bps) end,
   case when i.variant_id is null then 'unknown' when i.available>0 then 'in_stock' else 'out_of_stock' end,
   case when w.id is null then null else jsonb_build_object('policy_code',wp.code,'name',wp.name,
     'duration_months',w.duration_months,'start_rule',w.start_rule,'provider_name',w.provider_name,
     'coverage',w.coverage,'exclusions',w.exclusions,'process',w.process) end,
   false -- This read module cannot promise a checkout or reserve inventory.
 from app.product_variants v join private.public_product_rows() p on p.id=v.product_id
 left join app.price_versions price on price.id=v.current_price_id and price.variant_id=v.id
   and price.approved_at<=statement_timestamp() and v.sales_mode='retail'
 left join app.inventory i on i.variant_id=v.id
 left join app.warranty_policies wp on wp.status='active' and exists(
   select 1 from app.warranty_policy_versions wv where wv.id=v.warranty_version_id and wv.policy_id=wp.id)
 left join app.warranty_policy_versions w on w.id=v.warranty_version_id and w.policy_id=wp.id
   and w.approved_at<=statement_timestamp() and w.effective_from<=statement_timestamp()
 where v.product_id=requested_product_id and v.data_status='ready'
$$;

-- Every active definition for this technical type appears, even without a value.
-- Unverified, out-of-range or partially archived option sets become unknown in full.
create function private.public_specification_rows(requested_variant_id uuid)
returns table(code text,label text,group_code text,data_type text,unit jsonb,display_order integer,
 required_for_publish boolean,value_status text,value jsonb)
language sql stable security invoker set search_path=pg_catalog as $$
 with source as (
   select d.code::text,d.label::text,d.group_code::text,d.data_type,ts.display_order,ts.required_for_publish,
     case when u.code is null then null else jsonb_build_object('code',u.code,'name',u.name) end as unit,
     case when s.verified_at is null or s.verified_at>statement_timestamp() then 'unknown'
       when s.value_status<>'known' then s.value_status
       when d.data_type='number' and ((ts.min_value is not null and s.value_number<ts.min_value)
         or (ts.max_value is not null and s.value_number>ts.max_value)) then 'unknown'
       when d.data_type='enum' and o.id is null then 'unknown'
       when d.data_type='multi_enum' and (not exists(select 1 from app.product_specification_options so
           where so.variant_id=s.variant_id and so.definition_id=d.id)
         or exists(select 1 from app.product_specification_options so join app.specification_options op on op.id=so.option_id
           where so.variant_id=s.variant_id and so.definition_id=d.id and op.status<>'active')) then 'unknown'
       else s.value_status end as value_status,
     case d.data_type when 'number' then to_jsonb(s.value_number::text)
       when 'boolean' then to_jsonb(s.value_boolean) when 'text' then to_jsonb(s.value_text)
       when 'enum' then jsonb_build_object('code',o.code,'label',o.label)
       when 'multi_enum' then (select jsonb_agg(jsonb_build_object('code',op.code,'label',op.label) order by op.sort_order,op.code::text collate "C")
         from app.product_specification_options so join app.specification_options op on op.id=so.option_id
         where so.variant_id=s.variant_id and so.definition_id=d.id and op.status='active') end as raw_value
   from app.product_variants v join app.product_type_specifications ts on ts.product_type_id=v.product_type_id
   join app.specification_definitions d on d.id=ts.definition_id and d.status='active'
   left join app.unit_definitions u on u.code=d.canonical_unit_code
   left join app.product_specifications s on s.variant_id=v.id and s.definition_id=d.id
   left join app.specification_options o on o.id=s.option_id and o.status='active'
   where v.id=requested_variant_id
 ) select code,label,group_code,data_type,unit,display_order,required_for_publish,value_status,
   case when value_status='known' then raw_value else null end from source
$$;

create function api.public_products(requested_limit integer default 20,after_slug text default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare result jsonb;
begin
 perform private.check_catalog_query(requested_limit,array[after_slug]);
 if after_slug is not null and not exists(select 1 from private.public_product_rows() p where p.slug=after_slug) then
   raise sqlstate '22023' using message='CATALOG_INVALID_CURSOR';
 end if;
 with page as materialized (
   select p.id,p.name,p.slug,p.model_family,p.lifecycle_status,p.brand,p.product_type,p.primary_category
   from private.public_product_rows() p where after_slug is null or p.slug collate "C">after_slug collate "C"
   order by p.slug collate "C" limit requested_limit+1
 ), items as (select * from page order by slug collate "C" limit requested_limit)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by i.slug collate "C") from items i),'[]'),
   'next_cursor',case when (select count(*) from page)>requested_limit then
     (select slug from items order by slug collate "C" desc limit 1) else null end) into result;
 return result;
end $$;

create function api.public_product(requested_slug text) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare result jsonb;
begin
 perform private.check_catalog_query(1,array[requested_slug]);
 if requested_slug is null then raise sqlstate '22023' using message='CATALOG_INVALID_QUERY'; end if;
 select to_jsonb(p) into result from private.public_product_rows() p where p.slug=requested_slug;
 if result is null then raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND'; end if;
 return result;
end $$;

create function api.public_product_variants(requested_slug text,requested_limit integer default 20,after_id uuid default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare product_id uuid; result jsonb;
begin
 perform private.check_catalog_query(requested_limit,array[requested_slug]);
 if requested_slug is null then raise sqlstate '22023' using message='CATALOG_INVALID_QUERY'; end if;
 select p.id into product_id from private.public_product_rows() p where p.slug=requested_slug;
 if product_id is null then raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND'; end if;
 if after_id is not null and not exists(select 1 from private.public_variant_rows(product_id) v where v.id=after_id) then
   raise sqlstate '22023' using message='CATALOG_INVALID_CURSOR';
 end if;
 with page as materialized (
   select v.* from private.public_variant_rows(product_id) v where after_id is null or v.id>after_id order by v.id limit requested_limit+1
 ), items as (select * from page order by id limit requested_limit)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from items i),'[]'),
   'next_cursor',case when (select count(*) from page)>requested_limit then
     (select id from items order by id desc limit 1) else null end) into result;
 return result;
end $$;

create function api.public_product_variant(requested_slug text,requested_variant_id uuid) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare product_id uuid; result jsonb;
begin
 perform private.check_catalog_query(1,array[requested_slug]);
 if requested_slug is null or requested_variant_id is null then raise sqlstate '22023' using message='CATALOG_INVALID_QUERY'; end if;
 select p.id into product_id from private.public_product_rows() p where p.slug=requested_slug;
 select to_jsonb(v) into result from private.public_variant_rows(product_id) v where v.id=requested_variant_id;
 if result is null then raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND'; end if;
 return result;
end $$;

create function api.public_variant_specifications(requested_slug text,requested_variant_id uuid,
 requested_limit integer default 20,after_code text default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare result jsonb; cursor_order integer;
begin
 perform private.check_catalog_query(requested_limit,array[after_code]);
 perform api.public_product_variant(requested_slug,requested_variant_id);
 if after_code is not null then
   select s.display_order into cursor_order from private.public_specification_rows(requested_variant_id) s where s.code=after_code;
   if cursor_order is null then raise sqlstate '22023' using message='CATALOG_INVALID_CURSOR'; end if;
 end if;
 with page as materialized (
   select s.* from private.public_specification_rows(requested_variant_id) s
   where after_code is null or (s.display_order,s.code collate "C")>(cursor_order,after_code collate "C")
   order by s.display_order,s.code collate "C" limit requested_limit+1
 ), items as (select * from page order by display_order,code collate "C" limit requested_limit)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by i.display_order,i.code collate "C") from items i),'[]'),
   'next_cursor',case when (select count(*) from page)>requested_limit then
     (select code from items order by display_order desc,code collate "C" desc limit 1) else null end) into result;
 return result;
end $$;

revoke all on function private.public_product_rows(),private.public_variant_rows(uuid),private.public_specification_rows(uuid)
 from public,anon,authenticated,service_role;
revoke all on function api.public_products(integer,text),api.public_product(text),api.public_product_variants(text,integer,uuid),
 api.public_product_variant(text,uuid),api.public_variant_specifications(text,uuid,integer,text) from public,anon,authenticated,service_role;
grant execute on function api.public_products(integer,text),api.public_product(text),api.public_product_variants(text,integer,uuid),
 api.public_product_variant(text,uuid),api.public_variant_specifications(text,uuid,integer,text) to anon;
create index products_public_slug on app.products ((slug::text collate "C")) where publication_status='published';
create index variants_public_product on app.product_variants(product_id,id) where data_status='ready';
notify pgrst,'reload schema';
