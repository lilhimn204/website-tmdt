create table app.inventory (
  variant_id uuid primary key references app.product_variants(id), on_hand integer not null default 0,
  reserved integer not null default 0, available integer generated always as (on_hand - reserved) stored,
  version bigint not null default 1 check (version > 0), updated_at timestamptz not null default now(),
  check (on_hand >= 0 and reserved >= 0 and reserved <= on_hand)
);
create table app.commerce_policy_versions (
  id uuid primary key default gen_random_uuid(), version_no integer not null unique check (version_no > 0),
  status text not null default 'draft' check (status in ('draft','active','retired')),
  cod_hold_seconds integer check (cod_hold_seconds > 0), transfer_hold_seconds integer check (transfer_hold_seconds > 0),
  tax_rule_version app.nonempty, terms_version app.nonempty, bank_instruction_version app.nonempty,
  rules_json app.json_object not null default '{}', approved_by uuid references app.admin_profiles(user_id), approved_at timestamptz,
  created_at timestamptz not null default now(),
  check ((approved_by is null) = (approved_at is null)),
  check (status = 'draft' or (cod_hold_seconds is not null and transfer_hold_seconds is not null and
    tax_rule_version is not null and terms_version is not null and bank_instruction_version is not null and approved_at is not null))
);
create unique index one_active_commerce_policy on app.commerce_policy_versions(status) where status = 'active';
create table app.shipping_rules (
  id uuid primary key default gen_random_uuid(), policy_version_id uuid not null references app.commerce_policy_versions(id),
  zone_code app.nonempty not null, service_code app.nonempty not null, method_conditions app.json_object not null,
  basis text not null check (basis in ('NET','GROSS')), net_or_gross_fee_vnd app.money_vnd not null,
  tax_status app.tax_status not null, tax_rate_bps integer, priority integer not null default 0, active boolean not null default false,
  check (private.tax_valid(tax_status, tax_rate_bps)), check (not active or tax_status <> 'unknown'),
  unique(policy_version_id, zone_code, service_code, priority)
);
create table app.orders (
  id uuid primary key default gen_random_uuid(), public_reference app.nonempty not null unique,
  source text not null check (source in ('retail','quote')), quote_id uuid unique, quote_version_id uuid,
  policy_version_id uuid not null references app.commerce_policy_versions(id),
  payment_method text not null check (payment_method in ('cod','bank_transfer')),
  order_status text not null default 'pending_review' check (order_status in ('pending_review','confirmed','processing','completed','cancelled','expired')),
  payment_status_cache text not null default 'unpaid' check (payment_status_cache in ('unpaid','partial','paid','partially_refunded','refunded')),
  items_net_vnd app.money_vnd not null, items_tax_vnd app.money_vnd not null,
  shipping_net_vnd app.money_vnd not null, shipping_tax_vnd app.money_vnd not null, total_vnd app.money_vnd not null,
  currency text not null check (currency = 'VND'), flags app.json_object not null default '{}',
  row_version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (total_vnd::numeric = items_net_vnd::numeric + items_tax_vnd::numeric + shipping_net_vnd::numeric + shipping_tax_vnd::numeric),
  check ((source = 'retail' and quote_id is null and quote_version_id is null) or
    (source = 'quote' and quote_id is not null and quote_version_id is not null))
);
create table app.order_contacts (
  order_id uuid primary key references app.orders(id), name app.nonempty not null, phone app.nonempty not null,
  email text, delivery_address app.json_object not null, billing_details app.json_object, delivery_note text,
  retention_until timestamptz, check (email is null or length(email) between 3 and 254)
);
create table app.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references app.orders(id),
  variant_id uuid not null references app.product_variants(id), quantity integer not null check (quantity > 0),
  unit_amount_vnd app.money_vnd not null check (unit_amount_vnd > 0), basis text not null check (basis in ('NET','GROSS')),
  tax_status app.tax_status not null check (tax_status <> 'unknown'), tax_rate_bps integer,
  line_net_vnd app.money_vnd not null, line_tax_vnd app.money_vnd not null, line_total_vnd app.money_vnd not null,
  product_snapshot app.json_object not null, warranty_version_id uuid not null references app.warranty_policy_versions(id),
  warranty_snapshot app.json_object not null, unique(order_id, variant_id), unique(id, variant_id, quantity), unique(id, order_id),
  check (private.tax_valid(tax_status, tax_rate_bps)),
  check (line_total_vnd::numeric = line_net_vnd::numeric + line_tax_vnd::numeric),
  check ((basis = 'NET' and line_net_vnd::numeric = unit_amount_vnd::numeric * quantity) or
    (basis = 'GROSS' and line_total_vnd::numeric = unit_amount_vnd::numeric * quantity)),
  check (tax_status = 'taxable' or line_tax_vnd = 0)
);
create table app.stock_reservations (
  id uuid primary key default gen_random_uuid(), order_item_id uuid not null unique, variant_id uuid not null,
  quantity integer not null check (quantity > 0), state text not null check (state in ('active','allocated','released','consumed')),
  expires_at timestamptz, allocated_at timestamptz, released_at timestamptz, consumed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key(order_item_id, variant_id, quantity) references app.order_items(id, variant_id, quantity),
  foreign key(variant_id) references app.inventory(variant_id),
  check (case state
    when 'active' then expires_at is not null and expires_at > created_at and num_nonnulls(allocated_at,released_at,consumed_at) = 0
    when 'allocated' then expires_at is null and allocated_at is not null and released_at is null and consumed_at is null
    when 'released' then released_at is not null and consumed_at is null
    when 'consumed' then consumed_at is not null and allocated_at is not null and released_at is null else false end)
);
create table app.shipments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references app.orders(id),
  status text not null default 'pending' check (status in ('pending','dispatched','delivered','failed','returned','cancelled')),
  carrier text, tracking_reference text, dispatched_at timestamptz, delivered_at timestamptz, returned_at timestamptz,
  row_version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (status not in ('dispatched','delivered','failed','returned') or dispatched_at is not null),
  check (status <> 'delivered' or delivered_at is not null), check (status <> 'returned' or returned_at is not null)
);
create table app.payment_entries (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references app.orders(id),
  kind text not null check (kind in ('receipt','refund','reversal')), amount_vnd app.money_vnd not null check (amount_vnd > 0),
  channel app.nonempty not null, external_reference app.nonempty, evidence_asset_id uuid references app.media_assets(id),
  reversal_of_id uuid unique, operation_id uuid not null unique,
  actor_id uuid not null references app.admin_profiles(user_id), recorded_at timestamptz not null default now(), note app.nonempty not null,
  unique(id, order_id), foreign key(reversal_of_id, order_id) references app.payment_entries(id, order_id),
  check ((kind = 'reversal') = (reversal_of_id is not null)), check (reversal_of_id is distinct from id)
);
create unique index payment_external_reference on app.payment_entries(channel, external_reference) where external_reference is not null;
create table app.after_sales_cases (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references app.orders(id),
  type text not null check (type in ('return','warranty','refund')), reason app.nonempty not null,
  status text not null default 'open' check (status in ('open','reviewing','resolved','rejected','closed')),
  requested_refund_vnd app.money_vnd, assignee_id uuid references app.admin_profiles(user_id), resolution text,
  created_at timestamptz not null default now(), closed_at timestamptz, unique(id, order_id),
  check (closed_at is null or closed_at >= created_at)
);
create table app.return_items (
  id uuid primary key default gen_random_uuid(), case_id uuid not null, order_id uuid not null, order_item_id uuid not null,
  received_quantity integer not null check (received_quantity >= 0),
  restocked_quantity integer not null default 0 check (restocked_quantity >= 0 and restocked_quantity <= received_quantity),
  inspection_result text, received_at timestamptz, restocked_at timestamptz,
  foreign key(case_id, order_id) references app.after_sales_cases(id, order_id),
  foreign key(order_item_id, order_id) references app.order_items(id, order_id),
  unique(case_id, order_item_id),
  check (received_quantity = 0 or received_at is not null),
  check (restocked_quantity = 0 or (restocked_at is not null and inspection_result is not null))
);
create table app.inventory_movements (
  id uuid primary key default gen_random_uuid(), variant_id uuid not null references app.inventory(variant_id),
  operation_id uuid not null, source_line_key app.nonempty not null,
  movement_kind text not null check (movement_kind in ('adjustment','reserve','release','dispatch','restock')),
  delta_on_hand integer not null, delta_reserved integer not null,
  order_item_id uuid references app.order_items(id), return_item_id uuid references app.return_items(id),
  actor_id uuid references app.admin_profiles(user_id), reason app.nonempty not null, created_at timestamptz not null default now(),
  unique(operation_id, variant_id, movement_kind, source_line_key),
  check (delta_on_hand <> 0 or delta_reserved <> 0),
  check (case movement_kind
    when 'reserve' then delta_on_hand = 0 and delta_reserved > 0 and order_item_id is not null
    when 'release' then delta_on_hand = 0 and delta_reserved < 0 and order_item_id is not null
    when 'dispatch' then delta_on_hand < 0 and delta_reserved = delta_on_hand and order_item_id is not null
    when 'restock' then delta_on_hand > 0 and delta_reserved = 0 and return_item_id is not null
    when 'adjustment' then delta_reserved = 0 else false end)
);
