create table private.admin_control_state (
 id boolean primary key check(id), bootstrapped boolean not null default false, revision bigint not null default 1
);
insert into private.admin_control_state(id) values(true);
alter table private.admin_control_state enable row level security;
revoke all on private.admin_control_state from public,anon,authenticated,service_role;

create function private.lock_admin_control() returns trigger language plpgsql set search_path=pg_catalog as $$
begin update private.admin_control_state set revision=revision+1 where id; return null; end $$;
create function private.keep_last_owner() returns trigger language plpgsql set search_path=pg_catalog as $$
begin
 if (select bootstrapped from private.admin_control_state where id) and not exists (
   select 1 from app.admin_profiles p join app.admin_user_roles ur on ur.user_id=p.user_id
   join app.admin_roles r on r.id=ur.role_id and r.code='owner' and r.status='active'
   join app.admin_role_permissions rp on rp.role_id=r.id and rp.permission_code='security.manage' where p.active
 ) then raise sqlstate '23514' using message='LAST_OWNER_REQUIRED'; end if;
 return null;
end $$;
do $$ declare t text; begin
 foreach t in array array['admin_profiles','admin_user_roles','admin_roles','admin_role_permissions'] loop
   execute format('create trigger admin_control_lock before insert or update or delete on app.%I for each statement execute function private.lock_admin_control()',t);
   execute format('create constraint trigger last_owner_check after insert or update or delete on app.%I deferrable initially deferred for each row execute function private.keep_last_owner()',t);
 end loop;
end $$;
create function private.bump_authz_version() returns trigger language plpgsql set search_path=pg_catalog as $$
begin new.authz_version:=old.authz_version+1; return new; end $$;
create trigger bump_authz before update on app.admin_profiles for each row execute function private.bump_authz_version();
create function private.bump_assignment_version() returns trigger language plpgsql set search_path=pg_catalog as $$
begin
 update app.admin_profiles set authz_version=authz_version+1 where user_id=coalesce(new.user_id,old.user_id);
 return null;
end $$;
create trigger assignment_version after insert or delete on app.admin_user_roles for each row execute function private.bump_assignment_version();

create function private.bootstrap_owner(target_user uuid, staff_name text, reason text) returns void
language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if target_user is null or staff_name is null or length(btrim(staff_name)) not between 1 and 100
   or reason is null or length(btrim(reason)) not between 3 and 500 then
   raise sqlstate '22023' using message='INVALID_ACCESS_INPUT';
 end if;
 update private.admin_control_state set revision=revision+1 where id;
 if (select bootstrapped from private.admin_control_state where id) or exists(select 1 from app.admin_user_roles) then
   raise sqlstate '23514' using message='OWNER_ALREADY_BOOTSTRAPPED';
 end if;
 if not exists(select 1 from auth.users where id=target_user and email_confirmed_at is not null
   and not coalesce(is_anonymous,false) and deleted_at is null and (banned_until is null or banned_until<=now())) then
   raise sqlstate '22023' using message='AUTH_USER_NOT_ELIGIBLE';
 end if;
 insert into app.admin_profiles(user_id,display_name,active) values(target_user,btrim(staff_name),true)
 on conflict(user_id) do update set display_name=excluded.display_name,active=true;
 insert into app.admin_user_roles(user_id,role_id,granted_by)
 select target_user,id,target_user from app.admin_roles where code='owner' and status='active';
 update private.admin_control_state set bootstrapped=true where id;
 insert into app.audit_events(actor_type,action,entity_type,entity_id,request_id,redacted_change)
 values('system','security.owner.bootstrap','admin_profile',target_user,gen_random_uuid(),jsonb_build_object('reason',btrim(reason),'roles',jsonb_build_array('owner')));
end $$;
-- No API-role EXECUTE; SQL operator only. Never invoked automatically by migrations/signup.

create function api.set_admin_access(target_user uuid, staff_name text, role_codes text[], enabled boolean,
 expected_version bigint, reason text, operation_id uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare current_version bigint; old_roles jsonb; new_roles jsonb; before_active boolean;
begin
 if not private.has_permission('security.manage') then raise sqlstate '42501' using message='ADMIN_ACCESS_DENIED'; end if;
 if target_user is null or enabled is null or expected_version is null or expected_version<0 or operation_id is null
   or staff_name is null or length(btrim(staff_name)) not between 1 and 100
   or reason is null or length(btrim(reason)) not between 3 and 500
   or role_codes is null or cardinality(role_codes)>6 or (enabled and cardinality(role_codes)=0)
   or array_position(role_codes,null) is not null
   or (select count(distinct x) from unnest(role_codes) x)<>cardinality(role_codes)
   or (select count(*) from app.admin_roles where code=any(role_codes) and status='active')<>cardinality(role_codes) then
   raise sqlstate '22023' using message='INVALID_ACCESS_INPUT';
 end if;
 -- Recheck after serialization: a queued caller may have been revoked while waiting.
 update private.admin_control_state set revision=revision+1 where id;
 if not private.has_permission('security.manage') then raise sqlstate '42501' using message='ADMIN_ACCESS_DENIED'; end if;
 if not exists(select 1 from auth.users where id=target_user and email_confirmed_at is not null
   and not coalesce(is_anonymous,false) and deleted_at is null and (banned_until is null or banned_until<=now())) then
   raise sqlstate '22023' using message='AUTH_USER_NOT_ELIGIBLE';
 end if;
 select authz_version,active into current_version,before_active from app.admin_profiles where user_id=target_user for update;
 if coalesce(current_version,0)<>expected_version then raise sqlstate '40001' using message='ACCESS_VERSION_CONFLICT'; end if;
 select coalesce(jsonb_agg(r.code order by r.code),'[]') into old_roles
 from app.admin_user_roles ur join app.admin_roles r on r.id=ur.role_id where ur.user_id=target_user;
 insert into app.admin_profiles(user_id,display_name,active) values(target_user,btrim(staff_name),enabled)
 on conflict(user_id) do update set display_name=excluded.display_name,active=excluded.active;
 delete from app.admin_user_roles where user_id=target_user;
 insert into app.admin_user_roles(user_id,role_id,granted_by)
 select target_user,id,auth.uid() from app.admin_roles where code=any(role_codes);
 select coalesce(jsonb_agg(r.code order by r.code),'[]') into new_roles
 from app.admin_user_roles ur join app.admin_roles r on r.id=ur.role_id where ur.user_id=target_user;
 insert into app.audit_events(actor_type,actor_id,action,entity_type,entity_id,request_id,redacted_change)
 values('admin',auth.uid(),'security.access.changed','admin_profile',target_user,operation_id,
   jsonb_build_object('before',jsonb_build_object('active',before_active,'roles',old_roles),
    'after',jsonb_build_object('active',enabled,'roles',new_roles),'reason',btrim(reason)));
 return jsonb_build_object('user_id',target_user,'active',enabled,'roles',new_roles,
   'authz_version',(select authz_version::text from app.admin_profiles where user_id=target_user));
end $$;
grant execute on function api.set_admin_access(uuid,text,text[],boolean,bigint,text,uuid) to authenticated;
