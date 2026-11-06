-- PostgreSQL grants EXECUTE to PUBLIC globally by default. A per-schema REVOKE
-- cannot subtract that global default; prevent newly created helper functions
-- from becoming callable until their exact API contract is explicitly granted.
-- Applies to functions created by this migration owner, not auth/storage owners.
alter default privileges revoke execute on functions from public, anon, authenticated, service_role;
revoke execute on all functions in schema app, private, api from public, anon, authenticated, service_role;

create function private.bump_inventory_version() returns trigger language plpgsql set search_path = pg_catalog as $$
begin new.version := old.version + 1; new.updated_at := clock_timestamp(); return new; end $$;
create trigger inventory_version before update on app.inventory for each row execute function private.bump_inventory_version();
