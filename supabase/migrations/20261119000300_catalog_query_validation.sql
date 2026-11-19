-- Preserve the applied migration; fix volatility and qualify the parent parameter.
alter function private.check_catalog_query(integer,text[]) immutable;
create or replace function api.public_categories(requested_limit integer default 20, after_slug text default null, parent_slug text default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare result jsonb; cursor_order integer;
begin
 perform private.check_catalog_query(requested_limit,array[after_slug,parent_slug]);
 if parent_slug is not null and not exists(select 1 from private.public_category_rows() c where c.slug=public_categories.parent_slug) then
   raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND';
 end if;
 if after_slug is not null then
   select c.sort_order into cursor_order from private.public_category_rows() c
   where c.slug=after_slug and c.parent_slug is not distinct from public_categories.parent_slug;
   if cursor_order is null then raise sqlstate '22023' using message='CATALOG_INVALID_CURSOR'; end if;
 end if;
 with page as materialized (
   select c.id,c.name,c.slug,c.parent_slug,c.sort_order,c.product_type from private.public_category_rows() c
   where c.parent_slug is not distinct from public_categories.parent_slug
     and (after_slug is null or (c.sort_order,c.slug collate "C")>(cursor_order,after_slug collate "C"))
   order by c.sort_order,c.slug collate "C" limit requested_limit+1
 ), items as (select * from page order by sort_order,slug collate "C" limit requested_limit)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by i.sort_order,i.slug collate "C") from items i),'[]'),
   'next_cursor',case when (select count(*) from page)>requested_limit then
     (select slug from items order by sort_order desc,slug collate "C" desc limit 1) else null end) into result;
 return result;
end $$;
notify pgrst,'reload schema';
