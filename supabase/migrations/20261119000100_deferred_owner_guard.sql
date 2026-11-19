-- Deferred constraints run after the RPC's SECURITY DEFINER context has ended.
-- Keep the check privileged, with a fixed search_path and no direct API EXECUTE.
alter function private.keep_last_owner() security definer;
revoke all on function private.keep_last_owner() from public,anon,authenticated,service_role;
