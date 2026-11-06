create table app.guest_sessions (
  id uuid primary key default gen_random_uuid(), token_hash app.sha256_hex not null unique, csrf_hash app.sha256_hex not null,
  created_at timestamptz not null default now(), expires_at timestamptz not null, revoked_at timestamptz,
  check (expires_at > created_at), check (revoked_at is null or revoked_at >= created_at)
);
create table app.order_access_tokens (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references app.orders(id), token_hash app.sha256_hex not null unique,
  scope text not null check (scope = 'view_masked'), expires_at timestamptz not null, revoked_at timestamptz,
  created_at timestamptz not null default now(), unique(id, order_id),
  check (expires_at > created_at), check (revoked_at is null or revoked_at >= created_at)
);
create table app.guest_order_grants (
  session_id uuid not null references app.guest_sessions(id), order_id uuid not null references app.orders(id), source_token_id uuid,
  scope text not null check (scope = 'view_masked'), expires_at timestamptz not null, revoked_at timestamptz,
  created_at timestamptz not null default now(), primary key(session_id, order_id),
  foreign key(source_token_id, order_id) references app.order_access_tokens(id, order_id),
  check (expires_at > created_at), check (revoked_at is null or revoked_at >= created_at)
);
create table app.idempotency_records (
  id uuid primary key default gen_random_uuid(), actor_scope app.nonempty not null, operation app.nonempty not null,
  key uuid not null, request_hash app.sha256_hex not null,
  resource_type text not null check (resource_type in ('order','quote_request','payment','shipment','return','operation')),
  resource_id uuid not null, response_code integer not null check (response_code between 200 and 299),
  created_at timestamptz not null default now(), replay_until timestamptz not null,
  unique(actor_scope, operation, key), check (replay_until > created_at)
);
create table app.abuse_counters (
  bucket_key_hash app.sha256_hex not null, action app.nonempty not null, window_start timestamptz not null,
  count integer not null check (count >= 0), expires_at timestamptz not null,
  primary key(action, bucket_key_hash, window_start), check (expires_at > window_start)
);
create table app.audit_events (
  id uuid primary key default gen_random_uuid(), actor_type text not null check (actor_type in ('admin','guest','system')),
  actor_id uuid references app.admin_profiles(user_id), action app.nonempty not null, entity_type app.nonempty not null,
  entity_id uuid not null, request_id uuid not null, redacted_change app.json_object not null default '{}',
  occurred_at timestamptz not null default now(), check ((actor_type = 'admin') = (actor_id is not null))
);
create table app.publication_revisions (
  id uuid primary key default gen_random_uuid(), revision_no bigint not null unique check (revision_no > 0),
  created_at timestamptz not null default now(), state text not null default 'pending' check (state in ('pending','building','published','failed')),
  requested_by uuid references app.admin_profiles(user_id), deployment_ref text, published_at timestamptz, error_code text,
  check (state <> 'published' or (published_at is not null and deployment_ref is not null))
);
create table app.site_content (
  id uuid primary key default gen_random_uuid(), page_key app.slug not null unique,
  draft_content app.json_object not null default '{}', approved_content app.json_object,
  content_version bigint not null default 1 check (content_version > 0), effective_at timestamptz,
  publication_status text not null default 'draft' check (publication_status in ('draft','published','hidden')),
  check (publication_status <> 'published' or approved_content is not null)
);
create table app.operation_runs (
  id uuid primary key default gen_random_uuid(), operation_type app.nonempty not null,
  started_at timestamptz not null default now(), finished_at timestamptz,
  status text not null default 'running' check (status in ('running','completed','failed')),
  counts app.json_object not null default '{}', error_code text,
  check ((status = 'running') = (finished_at is null)), check (finished_at is null or finished_at >= started_at)
);
