-- 08.3: technical permissions only. No account, price, stock or customer seed.
insert into app.permission_definitions(code, description) values
 ('security.manage','Assign staff access; cannot erase audit history'),
 ('catalog.read','Read draft catalog'),('catalog.write','Edit catalog data'),('catalog.publish','Publish approved catalog'),
 ('pricing.write','Create approved price versions'),('inventory.read','Read inventory'),('inventory.adjust','Record stock adjustments'),
 ('fulfillment.write','Dispatch and receive returns'),('orders.read','Read operational order summary'),('orders.process','Process orders'),
 ('orders.contact.read','Request necessary contact DTO through authorized API'),
 ('quotes.read','Read accessible quote requests'),('quotes.write','Prepare quote versions'),('quotes.approve','Approve quote versions'),
 ('finance.read','Read financial DTOs'),('finance.record','Record received funds'),('finance.refund','Record refunds'),
 ('support.read','Read necessary support DTOs'),('support.write','Record after-sales requests'),
 ('content.write','Edit site content'),('media.write','Manage authorized media'),('audit.read','Read redacted audit'),('operations.manage','Manage operational settings');
insert into app.admin_roles(code,name) values
 ('owner','Chủ hệ thống'),('catalog','Catalog / kỹ thuật'),('sales','Sales'),
 ('warehouse','Kho'),('finance','Kế toán / đối soát'),('support','Hỗ trợ');
insert into app.admin_role_permissions(role_id,permission_code)
 select r.id,p.code from app.admin_roles r cross join app.permission_definitions p where r.code='owner';
insert into app.admin_role_permissions(role_id,permission_code)
 select r.id, m.permission from (values
 ('catalog','catalog.read'),('catalog','catalog.write'),('catalog','catalog.publish'),('catalog','pricing.write'),('catalog','inventory.read'),('catalog','content.write'),('catalog','media.write'),
 ('sales','catalog.read'),('sales','inventory.read'),('sales','orders.read'),('sales','orders.process'),('sales','orders.contact.read'),('sales','quotes.read'),('sales','quotes.write'),
 ('warehouse','catalog.read'),('warehouse','inventory.read'),('warehouse','inventory.adjust'),('warehouse','orders.read'),('warehouse','fulfillment.write'),
 ('finance','orders.read'),('finance','finance.read'),('finance','finance.record'),('finance','finance.refund'),
 ('support','catalog.read'),('support','orders.read'),('support','support.read'),('support','support.write')
 ) m(role,permission) join app.admin_roles r on r.code=m.role;

-- These reviewed definers only answer predicates about auth.uid(); no caller-supplied identity.
-- Owner postgres is needed to inspect platform-managed Auth sessions/factors without
-- changing Auth RLS. There is no dynamic SQL, exposed schema or broad EXECUTE grant.
create function private.is_active_admin() returns boolean
language sql stable security definer set search_path = pg_catalog as $$
 select coalesce(auth.jwt()->>'role'='authenticated' and auth.jwt()->>'aal'='aal2' and exists (
   select 1 from app.admin_profiles p
   join auth.users u on u.id=p.user_id
   join auth.sessions s on s.user_id=p.user_id and s.id=nullif(auth.jwt()->>'session_id','')::uuid
   join auth.mfa_factors f on f.id=s.factor_id and f.user_id=p.user_id and f.status='verified'
   where p.user_id=auth.uid() and p.active and u.email_confirmed_at is not null
     and not coalesce(u.is_anonymous,false) and u.deleted_at is null
     and (u.banned_until is null or u.banned_until<=now()) and (s.not_after is null or s.not_after>now())
     and exists (select 1 from app.admin_user_roles ur join app.admin_roles r on r.id=ur.role_id
       where ur.user_id=p.user_id and r.status='active')
 ),false)
$$;
create function private.has_permission(required_permission text) returns boolean
language sql stable security definer set search_path = pg_catalog as $$
 select private.is_active_admin() and exists (
   select 1 from app.admin_user_roles ur join app.admin_roles r on r.id=ur.role_id and r.status='active'
   join app.admin_role_permissions rp on rp.role_id=r.id
   where ur.user_id=auth.uid() and rp.permission_code=required_permission
 )
$$;
grant usage on schema app,private to authenticated;
grant execute on function private.is_active_admin(),private.has_permission(text) to authenticated;

grant select on app.admin_profiles,app.admin_roles,app.permission_definitions,app.admin_role_permissions,app.admin_user_roles to authenticated;
create policy staff_profile_read on app.admin_profiles for select to authenticated
 using (private.is_active_admin() and (user_id=auth.uid() or private.has_permission('security.manage')));
create policy staff_role_read on app.admin_roles for select to authenticated using (private.is_active_admin());
create policy staff_permission_read on app.permission_definitions for select to authenticated using (private.is_active_admin());
create policy staff_role_permission_read on app.admin_role_permissions for select to authenticated using (private.is_active_admin());
create policy staff_assignment_read on app.admin_user_roles for select to authenticated
 using (private.is_active_admin() and (user_id=auth.uid() or private.has_permission('security.manage')));

do $$ declare t text; begin
 foreach t in array array['brands','categories','product_types','products','product_categories','product_variants',
 'unit_definitions','specification_definitions','product_type_specifications','specification_options','product_specifications',
 'product_specification_options','price_versions','warranty_policies','warranty_policy_versions','product_images','product_documents','catalog_search_documents'] loop
   execute format('grant select on app.%I to authenticated',t);
   execute format('create policy catalog_staff_read on app.%I for select to authenticated using (private.has_permission(''catalog.read''))',t);
 end loop;
end $$;
grant select on app.inventory to authenticated;
create policy inventory_staff_read on app.inventory for select to authenticated using (private.has_permission('inventory.read'));
-- Column grants keep raw flags/contact/payment evidence out of generic order reads.
grant select(id,public_reference,source,order_status,payment_status_cache,created_at,row_version) on app.orders to authenticated;
create policy order_summary_read on app.orders for select to authenticated using (private.has_permission('orders.read'));
grant select on app.quote_requests,app.quote_request_items to authenticated;
create policy assigned_rfq_read on app.quote_requests for select to authenticated using (
 private.has_permission('quotes.read') and (assignee_id is null or assignee_id=auth.uid() or private.has_permission('security.manage'))
);
create policy assigned_rfq_item_read on app.quote_request_items for select to authenticated using (
 private.has_permission('quotes.read') and exists(select 1 from app.quote_requests q where q.id=request_id)
);
-- Raw contact, tokens, finance, media, audit and all other tables remain denied.
-- Their per-object/minimal DTO reads will be implemented with the matching API modules.
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='app' loop
   execute format('create policy active_mfa_session on app.%I as restrictive for all to authenticated using (private.is_active_admin()) with check (private.is_active_admin())',t.tablename);
 end loop;
end $$;

create function api.admin_context() returns jsonb language plpgsql stable security invoker set search_path = pg_catalog as $$
declare result jsonb;
begin
 if not private.is_active_admin() then raise sqlstate '42501' using message='ADMIN_ACCESS_DENIED'; end if;
 select jsonb_build_object('user_id',p.user_id,'display_name',p.display_name,'authz_version',p.authz_version::text,
   'roles',(select coalesce(jsonb_agg(r.code order by r.code),'[]'::jsonb) from app.admin_user_roles ur join app.admin_roles r on r.id=ur.role_id where ur.user_id=p.user_id and r.status='active'),
   'permissions',(select coalesce(jsonb_agg(code order by code),'[]'::jsonb) from (
     select distinct rp.permission_code as code from app.admin_user_roles ur join app.admin_roles r on r.id=ur.role_id and r.status='active'
     join app.admin_role_permissions rp on rp.role_id=r.id where ur.user_id=p.user_id) allowed))
 into result from app.admin_profiles p where p.user_id=auth.uid();
 if result is null then raise sqlstate '42501' using message='ADMIN_ACCESS_DENIED'; end if;
 return result;
end $$;
grant execute on function api.admin_context() to authenticated;
