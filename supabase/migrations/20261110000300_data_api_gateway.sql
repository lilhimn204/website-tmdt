create table private.gateway_secrets (
 slot text primary key check(slot in ('current','previous')), secret_hash app.sha256_hex not null,
 valid_until timestamptz, updated_at timestamptz not null default now(),
 check(slot<>'previous' or valid_until is not null)
);
alter table private.gateway_secrets enable row level security;
revoke all on private.gateway_secrets from public,anon,authenticated,service_role;
create function private.require_gateway() returns void
language plpgsql security definer set search_path=pg_catalog as $$
declare supplied text;
begin
 supplied:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-data-api-gateway','');
 if length(supplied) not between 43 and 128 or not exists (
   select 1 from private.gateway_secrets where secret_hash=encode(extensions.digest(supplied,'sha256'),'hex')
    and (valid_until is null or valid_until>now())
 ) then raise sqlstate 'PT403' using message='GATEWAY_REQUIRED'; end if;
end $$;
grant usage on schema private to anon,service_role;
grant execute on function private.require_gateway() to anon,authenticated,service_role;
alter role authenticator set pgrst.db_pre_request='private.require_gateway';
notify pgrst,'reload config';
notify pgrst,'reload schema';
-- No hash is seeded. Until a server-only gateway secret is provisioned, fail closed.
