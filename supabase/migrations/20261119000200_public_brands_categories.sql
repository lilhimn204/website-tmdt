-- 08.4: approved navigation metadata only. No raw-table grants or data seed.
create function private.check_catalog_query(page_limit integer, slugs text[]) returns void
language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if page_limit is null or page_limit not between 1 and 100 or exists(
   select 1 from unnest(slugs) s where s is not null and
   (length(s) not between 1 and 160 or s !~ '^[a-z0-9]+(-[a-z0-9]+)*$')
 ) then raise sqlstate '22023' using message='CATALOG_INVALID_QUERY'; end if;
end $$;

-- Walking FROM visible roots prevents an active child leaking a hidden ancestor.
-- A category tied to a non-active technical type, and its subtree, stay private.
create function private.public_category_rows()
returns table(id uuid,name text,slug text,parent_slug text,sort_order integer,product_type jsonb,breadcrumbs jsonb)
language sql stable security invoker set search_path=pg_catalog as $$
 with recursive visible as (
   select c.id,c.name::text,c.slug::text,null::text as parent_slug,c.sort_order,
     case when t.id is null then null else jsonb_build_object('code',t.code,'name',t.name) end as product_type,
     jsonb_build_array(jsonb_build_object('name',c.name,'slug',c.slug)) as breadcrumbs
   from app.categories c left join app.product_types t on t.id=c.product_type_id
   where c.parent_id is null and c.status='active' and (c.product_type_id is null or t.status='active')
   union all
   select c.id,c.name::text,c.slug::text,p.slug,c.sort_order,
     case when t.id is null then null else jsonb_build_object('code',t.code,'name',t.name) end,
     p.breadcrumbs || jsonb_build_array(jsonb_build_object('name',c.name,'slug',c.slug))
   from visible p join app.categories c on c.parent_id=p.id
   left join app.product_types t on t.id=c.product_type_id
   where c.status='active' and (c.product_type_id is null or t.status='active')
 ) select * from visible
$$;

create function api.public_brands(requested_limit integer default 20, after_slug text default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare result jsonb;
begin
 perform private.check_catalog_query(requested_limit,array[after_slug]);
 if after_slug is not null and not exists(select 1 from app.brands where slug=after_slug and status='active') then
   raise sqlstate '22023' using message='CATALOG_INVALID_CURSOR';
 end if;
 with page as materialized (
   select id,name::text,slug::text from app.brands where status='active'
     and (after_slug is null or slug::text collate "C">after_slug collate "C")
   order by slug::text collate "C" limit requested_limit+1
 ), items as (select * from page order by slug collate "C" limit requested_limit)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by i.slug collate "C") from items i),'[]'),
   'next_cursor',case when (select count(*) from page)>requested_limit then
     (select slug from items order by slug collate "C" desc limit 1) else null end) into result;
 return result;
end $$;

create function api.public_brand(requested_slug text) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare result jsonb;
begin
 perform private.check_catalog_query(1,array[requested_slug]);
 if requested_slug is null then raise sqlstate '22023' using message='CATALOG_INVALID_QUERY'; end if;
 select jsonb_build_object('id',id,'name',name,'slug',slug,'description',description) into result
 from app.brands where slug=requested_slug and status='active';
 if result is null then raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND'; end if;
 return result;
end $$;

create function api.public_categories(requested_limit integer default 20, after_slug text default null, parent_slug text default null) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare result jsonb; cursor_order integer;
begin
 perform private.check_catalog_query(requested_limit,array[after_slug,parent_slug]);
 if parent_slug is not null and not exists(select 1 from private.public_category_rows() c where c.slug=parent_slug) then
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

create function api.public_category(requested_slug text) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare result jsonb;
begin
 perform private.check_catalog_query(1,array[requested_slug]);
 if requested_slug is null then raise sqlstate '22023' using message='CATALOG_INVALID_QUERY'; end if;
 select to_jsonb(c) into result from private.public_category_rows() c where c.slug=requested_slug;
 if result is null then raise sqlstate 'PT404' using message='CATALOG_NOT_FOUND'; end if;
 return result;
end $$;

-- Reviewed definers bypass table RLS ONLY for the explicit public projections above.
-- Pages uses publishable key without a user bearer. Gateway remains mandatory.
revoke all on function api.public_brands(integer,text),api.public_brand(text),
 api.public_categories(integer,text,text),api.public_category(text) from public,anon,authenticated,service_role;
revoke all on function private.check_catalog_query(integer,text[]),private.public_category_rows() from public,anon,authenticated,service_role;
grant execute on function api.public_brands(integer,text),api.public_brand(text),
 api.public_categories(integer,text,text),api.public_category(text) to anon;
create index brands_public_slug on app.brands ((slug::text collate "C")) where status='active';
create index categories_public_children on app.categories(parent_id,sort_order,(slug::text collate "C")) where status='active';
notify pgrst,'reload schema';
