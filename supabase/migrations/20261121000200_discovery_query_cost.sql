-- Preserve applied migrations. Filter/count IDs before enriching a bounded page.
-- Variant visibility remains identical; direct indexed product lookup avoids an
-- all-product scan for every selected SKU. No ACL or API contract changes.
create or replace function private.public_variant_rows(requested_product_id uuid)
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
 from app.product_variants v join app.products p on p.id=v.product_id and p.publication_status='published'
 join app.brands b on b.id=p.brand_id and b.status='active'
 join app.product_types t on t.id=p.product_type_id and t.status='active'
 join private.public_category_rows() c on c.id=p.primary_category_id
 left join app.price_versions price on price.id=v.current_price_id and price.variant_id=v.id
   and price.approved_at<=statement_timestamp() and v.sales_mode='retail'
 left join app.inventory i on i.variant_id=v.id
 left join app.warranty_policies wp on wp.status='active' and exists(
   select 1 from app.warranty_policy_versions wv where wv.id=v.warranty_version_id and wv.policy_id=wp.id)
 left join app.warranty_policy_versions w on w.id=v.warranty_version_id and w.policy_id=wp.id
   and w.approved_at<=statement_timestamp() and w.effective_from<=statement_timestamp()
 where v.product_id=requested_product_id and v.data_status='ready'
$$;


create or replace function api.public_search_products(requested_query text default '',brand_slugs text[] default '{}',
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
 with visible as materialized (select * from private.public_product_rows()),
 candidates as materialized (
   select p.id as product_id,v.id as variant_id,
     case when identifier_query='' then 3 when v.sku_normalized=identifier_query or v.model_normalized=identifier_query then 0
       when starts_with(v.sku_normalized,identifier_query) or starts_with(v.model_normalized,identifier_query) then 1
       else 2 end as rank,
     price.amount_vnd as price_amount,p.slug
   from visible p join app.product_variants v on v.product_id=p.id and v.data_status='ready'
   join app.catalog_search_documents doc on doc.variant_id=v.id
   left join app.price_versions price on price.id=v.current_price_id and price.variant_id=v.id
     and v.sales_mode='retail' and price.approved_at<=statement_timestamp()
   where (cardinality(brand_slugs)=0 or p.brand->>'slug'=any(brand_slugs))
     and (type_id is null or v.product_type_id=type_id)
     and (category_slug is null or exists(select 1 from app.product_categories pc join private.public_category_rows() c on c.id=pc.category_id
       where pc.product_id=p.id and c.breadcrumbs @> jsonb_build_array(jsonb_build_object('slug',category_slug))))
     and (identifier_query='' or starts_with(v.sku_normalized,identifier_query) or starts_with(v.model_normalized,identifier_query)
       or doc.search_vector @@ name_query)
     and (spec_filters='{}' or private.variant_matches_filters(v.id,spec_filters))
 ), ranked as (
   select *,row_number() over(order by
     case when requested_sort='relevance' then rank end,
     case when requested_sort='price_asc' then price_amount end asc nulls last,
     case when requested_sort='price_desc' then price_amount end desc nulls last,
     slug collate "C",variant_id) as position from candidates
 ), page as materialized (select * from ranked order by position limit requested_limit offset requested_offset)
 select jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('product',to_jsonb(p)-'description','variant',to_jsonb(v),
     'match_type',case page.rank when 0 then 'exact' when 1 then 'prefix' when 2 then 'text' else 'browse' end) order by page.position)
     from page join visible p on p.id=page.product_id cross join lateral private.public_variant_rows(p.id) v where v.id=page.variant_id),'[]'),
   'total',(select count(*) from candidates),'total_products',(select count(distinct product_id) from candidates)) into result;
 return result;
end $$;


notify pgrst,'reload schema';
