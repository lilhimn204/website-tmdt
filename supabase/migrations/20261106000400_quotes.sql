create table app.quote_requests (
  id uuid primary key default gen_random_uuid(), public_reference app.nonempty not null unique,
  name app.nonempty not null, phone app.nonempty, email app.nonempty, company text,
  need_text text not null default '', destination text, needed_at text,
  status text not null default 'new' check (status in ('new','reviewing','quoted','closed','spam')),
  assignee_id uuid references app.admin_profiles(user_id), row_version bigint not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (phone is not null or email is not null), check (email is null or length(email) <= 254)
);
create table app.quote_request_items (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references app.quote_requests(id),
  variant_id uuid references app.product_variants(id), requested_model app.nonempty,
  quantity integer check (quantity > 0), requirement_text app.nonempty,
  check (variant_id is not null or requested_model is not null or requirement_text is not null),
  check (variant_id is null or quantity is not null)
);
create unique index rfq_unique_sku on app.quote_request_items(request_id, variant_id) where variant_id is not null;
create table app.quotes (
  id uuid primary key default gen_random_uuid(), request_id uuid not null unique references app.quote_requests(id),
  current_version_id uuid, status text not null default 'draft' check (status in ('draft','negotiating','accepted','declined','expired','converted')),
  row_version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- orders.quote_id is the single authoritative conversion pointer; no redundant converted_order_id.
create table app.quote_versions (
  id uuid primary key default gen_random_uuid(), quote_id uuid not null references app.quotes(id),
  version_no integer not null check (version_no > 0), policy_version_id uuid references app.commerce_policy_versions(id),
  valid_until timestamptz, terms_snapshot app.json_object not null default '{}',
  items_net_vnd app.money_vnd, items_tax_vnd app.money_vnd, shipping_net_vnd app.money_vnd, shipping_tax_vnd app.money_vnd, total_vnd app.money_vnd,
  content_status text not null default 'draft' check (content_status in ('draft','approved','sealed')),
  approved_by uuid references app.admin_profiles(user_id), approved_at timestamptz, sent_at timestamptz,
  created_at timestamptz not null default now(), unique(quote_id, version_no), unique(id, quote_id),
  check ((approved_by is null) = (approved_at is null)),
  check (num_nonnulls(items_net_vnd,items_tax_vnd,shipping_net_vnd,shipping_tax_vnd,total_vnd) in (0,5)),
  check (total_vnd::numeric = items_net_vnd::numeric + items_tax_vnd::numeric + shipping_net_vnd::numeric + shipping_tax_vnd::numeric),
  check (content_status = 'draft' or (approved_at is not null and valid_until is not null and valid_until > created_at and policy_version_id is not null and total_vnd is not null)),
  check ((content_status = 'sealed') = (sent_at is not null))
);
alter table app.quotes add constraint current_version_same_quote foreign key(current_version_id, id) references app.quote_versions(id, quote_id);
alter table app.orders add constraint order_quote_root foreign key(quote_id) references app.quotes(id);
alter table app.orders add constraint order_quote_version foreign key(quote_version_id, quote_id) references app.quote_versions(id, quote_id);
create table app.quote_items (
  id uuid primary key default gen_random_uuid(), quote_version_id uuid not null references app.quote_versions(id),
  variant_id uuid references app.product_variants(id), label_snapshot app.nonempty not null, quantity integer not null check (quantity > 0),
  basis text not null check (basis in ('NET','GROSS')), unit_amount_vnd app.money_vnd not null check (unit_amount_vnd > 0),
  tax_status app.tax_status not null, tax_rate_bps integer,
  line_net_vnd app.money_vnd not null, line_tax_vnd app.money_vnd not null, line_total_vnd app.money_vnd not null,
  warranty_snapshot app.json_object not null, check (private.tax_valid(tax_status, tax_rate_bps)),
  check (line_total_vnd::numeric = line_net_vnd::numeric + line_tax_vnd::numeric),
  check ((basis = 'NET' and line_net_vnd::numeric = unit_amount_vnd::numeric * quantity) or
    (basis = 'GROSS' and line_total_vnd::numeric = unit_amount_vnd::numeric * quantity)),
  check (tax_status not in ('exempt','not_applicable') or line_tax_vnd = 0)
);
create table app.quote_acceptances (
  id uuid primary key default gen_random_uuid(), quote_version_id uuid not null unique references app.quote_versions(id),
  recorded_by uuid not null references app.admin_profiles(user_id), accepted_at timestamptz not null,
  channel app.nonempty not null, evidence_asset_id uuid references app.media_assets(id), evidence_note app.nonempty
);
create table app.quote_events (
  id uuid primary key default gen_random_uuid(), quote_id uuid not null references app.quotes(id), version_id uuid,
  event_type app.nonempty not null, actor_id uuid not null references app.admin_profiles(user_id),
  occurred_at timestamptz not null default now(), note text not null default '',
  foreign key(version_id, quote_id) references app.quote_versions(id, quote_id)
);
