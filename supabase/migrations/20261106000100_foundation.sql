-- 08.2: private-by-default foundation. No application role gets DML or RPC access.
create schema app;
create schema private;
create schema api;
revoke all on schema app, private, api from public, anon, authenticated, service_role;
grant usage on schema api to anon, authenticated, service_role;
alter default privileges in schema app revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema app revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges in schema app revoke execute on functions from public, anon, authenticated, service_role;
alter default privileges in schema private revoke execute on functions from public, anon, authenticated, service_role;
alter default privileges in schema api revoke execute on functions from public, anon, authenticated, service_role;

create domain app.nonempty as text check (length(btrim(value)) between 1 and 2000);
create domain app.slug as text check (length(value) between 1 and 160 and value ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
create domain app.money_vnd as bigint check (value >= 0);
create domain app.sha256_hex as text check (value ~ '^[0-9a-f]{64}$');
create domain app.json_object as jsonb check (jsonb_typeof(value) = 'object');
create domain app.tax_status as text check (value in ('taxable','exempt','not_applicable','unknown'));
create domain app.lifecycle as text check (value in ('active','discontinued','eol'));

create function private.normalize_identifier(value text) returns text
language sql immutable strict set search_path = pg_catalog
as $$ select upper(regexp_replace(normalize(btrim(value), NFKC), '\s+', ' ', 'g')) $$;

create function private.tax_valid(status text, rate integer) returns boolean
language sql immutable set search_path = pg_catalog
as $$ select case when status = 'taxable' then rate is not null and rate between 0 and 10000
  when status in ('exempt','not_applicable','unknown') then rate is null else false end $$;

create table app.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  display_name app.nonempty not null, active boolean not null default false,
  authz_version bigint not null default 1 check (authz_version > 0),
  created_at timestamptz not null default now()
);
create table app.admin_roles (
  id uuid primary key default gen_random_uuid(), code app.slug not null unique,
  name app.nonempty not null, status text not null default 'active' check (status in ('active','archived'))
);
create table app.permission_definitions (code app.nonempty primary key, description text not null);
create table app.admin_role_permissions (
  role_id uuid not null references app.admin_roles(id) on delete restrict,
  permission_code app.nonempty not null references app.permission_definitions(code) on delete restrict,
  primary key (role_id, permission_code)
);
create table app.admin_user_roles (
  user_id uuid not null references app.admin_profiles(user_id) on delete restrict,
  role_id uuid not null references app.admin_roles(id) on delete restrict,
  granted_by uuid not null references app.admin_profiles(user_id) on delete restrict,
  granted_at timestamptz not null default now(), primary key(user_id, role_id)
);
-- No Auth signup trigger, admin assignment, seeded identity or self-service grant.
