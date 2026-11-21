-- 08.6: synchronous name/brand search projection; values and visibility stay live.
create extension if not exists unaccent with schema extensions;
create function private.normalize_search(value text) returns text
language sql stable strict security invoker set search_path=pg_catalog as $$
 select lower(extensions.unaccent('extensions.unaccent'::regdictionary,
   regexp_replace(normalize(btrim(value),NFKC),'\s+',' ','g')))
$$;
create function private.refresh_search_documents() returns trigger
language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if tg_op='DELETE' then delete from app.catalog_search_documents where variant_id=old.id; return old; end if;
 insert into app.catalog_search_documents(variant_id,product_id,search_text_normalized,source_revision)
 select v.id,p.id,private.normalize_search(p.name||' '||b.name),1
 from app.product_variants v join app.products p on p.id=v.product_id join app.brands b on b.id=p.brand_id
 where (tg_table_name='product_variants' and v.id=new.id) or (tg_table_name='products' and p.id=new.id)
   or (tg_table_name='brands' and b.id=new.id)
 on conflict(variant_id) do update set product_id=excluded.product_id,search_text_normalized=excluded.search_text_normalized,
   source_revision=app.catalog_search_documents.source_revision+1;
 return new;
end $$;
-- Join the existing structural catalog lock before row locks. Concurrent brand
-- rename and variant insert cannot leave an old name in the projection.
create trigger brand_search_lock before insert or update or delete on app.brands
 for each statement execute function private.lock_catalog_structure();
create trigger variant_search_lock before insert or update or delete on app.product_variants
 for each statement execute function private.lock_catalog_structure();
create trigger variant_search_refresh after insert or update of sku,model,product_id on app.product_variants
 for each row execute function private.refresh_search_documents();
create trigger variant_search_remove before delete on app.product_variants
 for each row execute function private.refresh_search_documents();
create trigger product_search_refresh after update of name,brand_id on app.products
 for each row execute function private.refresh_search_documents();
create trigger brand_search_refresh after update of name on app.brands
 for each row execute function private.refresh_search_documents();
insert into app.catalog_search_documents(variant_id,product_id,search_text_normalized,source_revision)
select v.id,p.id,private.normalize_search(p.name||' '||b.name),1
from app.product_variants v join app.products p on p.id=v.product_id join app.brands b on b.id=p.brand_id
on conflict(variant_id) do update set search_text_normalized=excluded.search_text_normalized,
 source_revision=app.catalog_search_documents.source_revision+1;

create function private.public_filter_rows(requested_type_id uuid)
returns table(code text,label text,group_code text,data_type text,unit jsonb,display_order integer,
 min_value text,max_value text,options jsonb)
language sql stable security invoker set search_path=pg_catalog as $$
 select d.code::text,d.label::text,d.group_code::text,d.data_type,
   case when u.code is null then null else jsonb_build_object('code',u.code,'name',u.name) end,
   ts.display_order,case when d.data_type='number' then ts.min_value::text end,
   case when d.data_type='number' then ts.max_value::text end,
   case when d.data_type in ('enum','multi_enum') then coalesce((select jsonb_agg(jsonb_build_object('code',o.code,'label',o.label)
     order by o.sort_order,o.code::text collate "C") from app.specification_options o where o.definition_id=d.id and o.status='active'),'[]') else null end
 from app.product_type_specifications ts join app.specification_definitions d on d.id=ts.definition_id
 left join app.unit_definitions u on u.code=d.canonical_unit_code
 where ts.product_type_id=requested_type_id and ts.filterable and d.status='active' and d.data_type<>'text'
$$;

create function private.validate_spec_filters(requested_type_id uuid,filters jsonb) returns void
language plpgsql stable security invoker set search_path=pg_catalog as $$
declare f record; definition record; n text; option_value jsonb;
begin
 if filters is null or jsonb_typeof(filters)<>'object' or octet_length(filters::text)>4096 then
   raise sqlstate '22023' using message='CATALOG_INVALID_FILTER';
 end if;
 if (select count(*) from jsonb_object_keys(filters))>10 or (filters<>'{}' and requested_type_id is null) then
   raise sqlstate '22023' using message='CATALOG_INVALID_FILTER';
 end if;
 for f in select * from jsonb_each(filters) loop
   select * into definition from private.public_filter_rows(requested_type_id) d where d.code=f.key;
   if not found or jsonb_typeof(f.value)<>'object' then raise sqlstate '22023' using message='CATALOG_INVALID_FILTER'; end if;
   if definition.data_type='number' then
     if not (f.value ? 'min' or f.value ? 'max') or exists(select 1 from jsonb_object_keys(f.value) k where k not in ('min','max')) then
       raise sqlstate '22023' using message='CATALOG_INVALID_FILTER';
     end if;
     foreach n in array array['min','max'] loop
       if f.value ? n and (jsonb_typeof(f.value->n)<>'string' or (f.value->>n) !~ '^-?(0|[1-9][0-9]{0,13})(\.[0-9]{1,6})?$') then
         raise sqlstate '22023' using message='CATALOG_INVALID_FILTER';
       end if;
     end loop;
     if (f.value->>'min')::numeric>(f.value->>'max')::numeric then raise sqlstate '22023' using message='CATALOG_INVALID_FILTER'; end if;
   else
     if not f.value ? 'values' or (select count(*) from jsonb_object_keys(f.value))<>1 or jsonb_typeof(f.value->'values')<>'array' then
       raise sqlstate '22023' using message='CATALOG_INVALID_FILTER';
     end if;
     if jsonb_array_length(f.value->'values') not between 1 and 10
       or (select count(distinct v) from jsonb_array_elements(f.value->'values') v)<>jsonb_array_length(f.value->'values') then
       raise sqlstate '22023' using message='CATALOG_INVALID_FILTER';
     end if;
     for option_value in select * from jsonb_array_elements(f.value->'values') loop
       if (definition.data_type='boolean' and jsonb_typeof(option_value)<>'boolean')
         or (definition.data_type<>'boolean' and (jsonb_typeof(option_value)<>'string' or not exists(
           select 1 from jsonb_array_elements(definition.options) o where o->'code'=option_value))) then
         raise sqlstate '22023' using message='CATALOG_INVALID_FILTER';
       end if;
     end loop;
   end if;
 end loop;
end $$;

create function private.variant_matches_filters(variant_id uuid,filters jsonb) returns boolean
language sql stable security invoker set search_path=pg_catalog as $$
 select not exists(select 1 from jsonb_each(filters) f where not exists(
   select 1 from private.public_specification_rows(variant_id) s where s.code=f.key and s.value_status='known' and
   case s.data_type
     when 'number' then ((f.value->>'min') is null or (s.value#>>'{}')::numeric>=(f.value->>'min')::numeric)
       and ((f.value->>'max') is null or (s.value#>>'{}')::numeric<=(f.value->>'max')::numeric)
     when 'boolean' then (f.value->'values') @> jsonb_build_array(s.value)
     when 'enum' then (f.value->'values') @> jsonb_build_array(s.value->'code')
     when 'multi_enum' then exists(select 1 from jsonb_array_elements(s.value) o where (f.value->'values') @> jsonb_build_array(o->'code'))
     else false end))
$$;

create function api.public_product_filters(requested_type text,requested_limit integer default 20,after_code text default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare type_id uuid; type_name text; result jsonb; cursor_order integer;
begin
 perform private.check_catalog_query(requested_limit,array[requested_type,after_code]);
 if requested_type is null then raise sqlstate '22023' using message='CATALOG_INVALID_QUERY'; end if;
 select t.id,t.name into type_id,type_name from app.product_types t where t.code=requested_type and t.status='active';
 if type_id is null then raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND'; end if;
 if after_code is not null then
   select f.display_order into cursor_order from private.public_filter_rows(type_id) f where f.code=after_code;
   if cursor_order is null then raise sqlstate '22023' using message='CATALOG_INVALID_CURSOR'; end if;
 end if;
 with page as materialized (
   select f.* from private.public_filter_rows(type_id) f
   where after_code is null or (f.display_order,f.code collate "C")>(cursor_order,after_code collate "C")
   order by f.display_order,f.code collate "C" limit requested_limit+1
 ), items as (select * from page order by display_order,code collate "C" limit requested_limit)
 select jsonb_build_object('product_type',jsonb_build_object('code',requested_type,'name',type_name),
   'items',coalesce((select jsonb_agg(to_jsonb(i) order by i.display_order,i.code collate "C") from items i),'[]'),
   'next_cursor',case when (select count(*) from page)>requested_limit then
     (select code from items order by display_order desc,code collate "C" desc limit 1) else null end) into result;
 return result;
end $$;

create function api.public_search_products(requested_query text default '',brand_slugs text[] default '{}',
 category_slug text default null,type_code text default null,spec_filters jsonb default '{}',requested_sort text default 'relevance',
 requested_limit integer default 20,requested_offset integer default 0) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare type_id uuid; identifier_query text; name_query tsquery; result jsonb;
begin
 if coalesce(array_ndims(brand_slugs),1)<>1 or coalesce(array_lower(brand_slugs,1),1)<>1 then
   raise sqlstate '22023' using message='CATALOG_INVALID_QUERY';
 end if;
 perform private.check_catalog_query(requested_limit,array[category_slug,type_code]||brand_slugs);
 if requested_query is null or length(requested_query)>200 or requested_query ~ '[[:cntrl:]]'
   or requested_offset is null or requested_offset not between 0 and 5000
   or requested_sort is null or requested_sort not in ('relevance','price_asc','price_desc')
   or brand_slugs is null or cardinality(brand_slugs)>10 or array_position(brand_slugs,null) is not null
   or (select count(distinct b) from unnest(brand_slugs) b)<>cardinality(brand_slugs) then
   raise sqlstate '22023' using message='CATALOG_INVALID_QUERY';
 end if;
 if exists(select 1 from unnest(brand_slugs) s where not exists(select 1 from app.brands b where b.slug=s and b.status='active'))
   or (category_slug is not null and not exists(select 1 from private.public_category_rows() c where c.slug=category_slug)) then
   raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND';
 end if;
 if type_code is not null then
   select t.id into type_id from app.product_types t where t.code=type_code and t.status='active';
   if type_id is null then raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND'; end if;
 end if;
 perform private.validate_spec_filters(type_id,spec_filters);
 identifier_query:=private.normalize_identifier(requested_query);
 name_query:=plainto_tsquery('simple'::regconfig,private.normalize_search(requested_query));
 with candidates as materialized (
   select p.id as product_id,v.id as variant_id,
     case when identifier_query='' then 3 when raw.sku_normalized=identifier_query or raw.model_normalized=identifier_query then 0
       when starts_with(raw.sku_normalized,identifier_query) or starts_with(raw.model_normalized,identifier_query) then 1
       else 2 end as rank,
     (v.price->>'amount_vnd')::bigint as price_amount,
     to_jsonb(p)-'description' as product,to_jsonb(v) as variant
   from private.public_product_rows() p join app.products rawp on rawp.id=p.id
   cross join lateral private.public_variant_rows(p.id) v
   join app.product_variants raw on raw.id=v.id
   join app.catalog_search_documents doc on doc.variant_id=v.id
   where (cardinality(brand_slugs)=0 or p.brand->>'slug'=any(brand_slugs))
     and (type_id is null or rawp.product_type_id=type_id)
     and (category_slug is null or exists(select 1 from app.product_categories pc join private.public_category_rows() c on c.id=pc.category_id
       where pc.product_id=p.id and c.breadcrumbs @> jsonb_build_array(jsonb_build_object('slug',category_slug))))
     and (identifier_query='' or starts_with(raw.sku_normalized,identifier_query) or starts_with(raw.model_normalized,identifier_query)
       or doc.search_vector @@ name_query)
     and private.variant_matches_filters(v.id,spec_filters)
 ), ranked as (
   select *,row_number() over(order by
     case when requested_sort='relevance' then rank end,
     case when requested_sort='price_asc' then price_amount end asc nulls last,
     case when requested_sort='price_desc' then price_amount end desc nulls last,
     product->>'slug' collate "C",variant_id) as position from candidates
 ), page as (select * from ranked order by position limit requested_limit offset requested_offset)
 select jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('product',p.product,'variant',p.variant,
     'match_type',case p.rank when 0 then 'exact' when 1 then 'prefix' when 2 then 'text' else 'browse' end) order by p.position) from page p),'[]'),
   'total',(select count(*) from candidates),'total_products',(select count(distinct product_id) from candidates)) into result;
 return result;
end $$;

create function api.public_compare_products(variant_ids uuid[],requested_limit integer default 20,after_code text default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare selected_type uuid; result jsonb; items jsonb; cursor_order integer;
begin
 perform private.check_catalog_query(requested_limit,array[after_code]);
 if coalesce(array_ndims(variant_ids),1)<>1 or coalesce(array_lower(variant_ids,1),1)<>1 then
   raise sqlstate '22023' using message='CATALOG_INVALID_QUERY';
 end if;
 if variant_ids is null or cardinality(variant_ids) not between 2 and 3 or array_position(variant_ids,null) is not null
   or (select count(distinct v) from unnest(variant_ids) v)<>cardinality(variant_ids) then
   raise sqlstate '22023' using message='CATALOG_INVALID_QUERY';
 end if;
 select jsonb_agg(jsonb_build_object('product',to_jsonb(p)-'description','variant',to_jsonb(v)) order by requested.ord) into items
 from unnest(variant_ids) with ordinality requested(id,ord) join app.product_variants raw on raw.id=requested.id
 join private.public_product_rows() p on p.id=raw.product_id
 cross join lateral private.public_variant_rows(p.id) v where v.id=raw.id;
 if items is null or jsonb_array_length(items)<>cardinality(variant_ids) then raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND'; end if;
 if (select count(distinct product_type_id) from app.product_variants where id=any(variant_ids))<>1 then
   raise sqlstate '22023' using message='CATALOG_INCOMPATIBLE_COMPARISON';
 end if;
 select product_type_id into selected_type from app.product_variants where id=variant_ids[1];
 if after_code is not null then
   select ts.display_order into cursor_order from app.product_type_specifications ts join app.specification_definitions d on d.id=ts.definition_id
   where ts.product_type_id=selected_type and ts.comparable and d.status='active' and d.code=after_code;
   if cursor_order is null then raise sqlstate '22023' using message='CATALOG_INVALID_CURSOR'; end if;
 end if;
 with definitions as materialized (
   select d.code::text,ts.display_order from app.product_type_specifications ts join app.specification_definitions d on d.id=ts.definition_id
   where ts.product_type_id=selected_type and ts.comparable and d.status='active'
     and (after_code is null or (ts.display_order,d.code::text collate "C")>(cursor_order,after_code collate "C"))
   order by ts.display_order,d.code::text collate "C" limit requested_limit+1
 ), cells as (
   select requested.id,requested.ord,s.* from unnest(variant_ids) with ordinality requested(id,ord)
   cross join lateral private.public_specification_rows(requested.id) s join definitions d on d.code=s.code
 ), rows as (
   select d.code,d.display_order,jsonb_build_object('code',d.code,'label',min(c.label),'group_code',min(c.group_code),
     'data_type',min(c.data_type),'unit',(array_agg(c.unit order by c.ord))[1],'display_order',d.display_order,
     'cells',jsonb_agg(jsonb_build_object('variant_id',c.id,'value_status',c.value_status,'value',c.value) order by c.ord),
     'comparison',case when bool_or(c.value_status='unknown') then 'incomplete'
       when count(distinct jsonb_build_array(c.value_status,c.value))=1 then 'equal' else 'different' end) as row
   from definitions d join cells c on c.code=d.code group by d.code,d.display_order
   order by d.display_order,d.code collate "C" limit requested_limit
 ) select jsonb_build_object('product_type',items->0->'product'->'product_type','items',items,
   'rows',coalesce((select jsonb_agg(r.row order by r.display_order,r.code collate "C") from rows r),'[]'),
   'next_cursor',case when (select count(*) from definitions)>requested_limit then
     (select code from rows order by display_order desc,code collate "C" desc limit 1) else null end) into result;
 return result;
end $$;

revoke all on function private.normalize_search(text),private.refresh_search_documents(),private.public_filter_rows(uuid),
 private.validate_spec_filters(uuid,jsonb),private.variant_matches_filters(uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function api.public_product_filters(text,integer,text),api.public_search_products(text,text[],text,text,jsonb,text,integer,integer),
 api.public_compare_products(uuid[],integer,text) from public,anon,authenticated,service_role;
grant execute on function api.public_product_filters(text,integer,text),api.public_search_products(text,text[],text,text,jsonb,text,integer,integer),
 api.public_compare_products(uuid[],integer,text) to anon;
notify pgrst,'reload schema';
