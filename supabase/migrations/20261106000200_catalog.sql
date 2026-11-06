create table app.media_assets (
  id uuid primary key default gen_random_uuid(), bucket app.nonempty not null,
  object_key app.nonempty not null, sha256 app.sha256_hex, mime app.nonempty not null,
  byte_size bigint check (byte_size >= 0), width integer check (width > 0), height integer check (height > 0),
  state text not null default 'pending' check (state in ('pending','staged','approved','rejected','deleting')),
  visibility text not null default 'private' check (visibility in ('private','public')),
  rights_note text not null default '', approved_by uuid references app.admin_profiles(user_id),
  created_by uuid not null references app.admin_profiles(user_id), created_at timestamptz not null default now(),
  expires_at timestamptz, unique(bucket, object_key),
  check (state <> 'approved' or (approved_by is not null and sha256 is not null and byte_size is not null)),
  check (expires_at is null or expires_at > created_at)
);
create table app.warranty_policies (
  id uuid primary key default gen_random_uuid(), code app.slug not null unique, name app.nonempty not null,
  status text not null default 'draft' check (status in ('draft','active','archived'))
);
create table app.warranty_policy_versions (
  id uuid primary key default gen_random_uuid(), policy_id uuid not null references app.warranty_policies(id),
  version_no integer not null check (version_no > 0), duration_months integer check (duration_months >= 0),
  start_rule app.nonempty not null, provider_name app.nonempty not null,
  coverage app.nonempty not null, exclusions text not null, process app.nonempty not null,
  approved_by uuid not null references app.admin_profiles(user_id), approved_at timestamptz not null,
  effective_from timestamptz not null, created_at timestamptz not null default now(), unique(policy_id, version_no)
);
create table app.brands (
  id uuid primary key default gen_random_uuid(), name app.nonempty not null, slug app.slug not null unique,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  logo_asset_id uuid references app.media_assets(id), description text not null default '',
  row_version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table app.product_types (
  id uuid primary key default gen_random_uuid(), code app.slug not null unique, name app.nonempty not null,
  status text not null default 'draft' check (status in ('draft','active','archived'))
);
create table app.categories (
  id uuid primary key default gen_random_uuid(), parent_id uuid references app.categories(id),
  name app.nonempty not null, slug app.slug not null unique, product_type_id uuid references app.product_types(id),
  status text not null default 'draft' check (status in ('draft','active','archived')), sort_order integer not null default 0,
  row_version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (parent_id is distinct from id)
);
create table app.products (
  id uuid primary key default gen_random_uuid(), brand_id uuid not null references app.brands(id),
  product_type_id uuid not null references app.product_types(id), primary_category_id uuid not null references app.categories(id),
  name app.nonempty not null, slug app.slug not null unique, model_family text, description text not null default '',
  publication_status text not null default 'draft' check (publication_status in ('draft','published','hidden')),
  lifecycle_status app.lifecycle not null default 'active', lifecycle_reason text,
  row_version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id, product_type_id)
);
create table app.product_categories (
  product_id uuid not null references app.products(id), category_id uuid not null references app.categories(id),
  primary key(product_id, category_id)
);
alter table app.products add constraint primary_category_membership foreign key(id, primary_category_id)
  references app.product_categories(product_id, category_id) deferrable initially deferred;
create table app.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null,
  product_type_id uuid not null, sku app.nonempty not null,
  sku_normalized text generated always as (private.normalize_identifier(sku)) stored unique,
  model app.nonempty not null, model_normalized text generated always as (private.normalize_identifier(model)) stored,
  variant_label text not null default '', sales_mode text not null default 'quote_only' check (sales_mode in ('retail','quote_only','not_for_sale')),
  lifecycle_status app.lifecycle not null default 'active',
  data_status text not null default 'draft' check (data_status in ('draft','ready')),
  current_price_id uuid, warranty_version_id uuid references app.warranty_policy_versions(id),
  row_version bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id, product_type_id), unique(id, product_id),
  foreign key(product_id, product_type_id) references app.products(id, product_type_id)
);
create table app.price_versions (
  id uuid primary key default gen_random_uuid(), variant_id uuid not null references app.product_variants(id),
  version_no integer not null check (version_no > 0), basis text not null check (basis in ('NET','GROSS')),
  amount_vnd app.money_vnd not null check (amount_vnd > 0), tax_status app.tax_status not null,
  tax_rate_bps integer, approved_by uuid not null references app.admin_profiles(user_id), approved_at timestamptz not null,
  created_at timestamptz not null default now(), unique(variant_id, version_no), unique(id, variant_id),
  check (private.tax_valid(tax_status, tax_rate_bps))
);
alter table app.product_variants add constraint current_price_same_variant foreign key(current_price_id, id)
  references app.price_versions(id, variant_id);
create table app.unit_definitions (code app.nonempty primary key, name app.nonempty not null, dimension app.nonempty not null);
create table app.specification_definitions (
  id uuid primary key default gen_random_uuid(), code app.slug not null unique, label app.nonempty not null,
  data_type text not null check (data_type in ('number','boolean','text','enum','multi_enum')),
  canonical_unit_code app.nonempty references app.unit_definitions(code), group_code app.slug not null,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  unique(id, data_type), check (canonical_unit_code is null or data_type = 'number')
);
create table app.product_type_specifications (
  product_type_id uuid not null references app.product_types(id), definition_id uuid not null references app.specification_definitions(id),
  required_for_publish boolean not null default false, filterable boolean not null default false,
  comparable boolean not null default false, display_order integer not null default 0,
  min_value numeric(20,6), max_value numeric(20,6), primary key(product_type_id, definition_id),
  check (min_value is null or min_value <> 'NaN'::numeric), check (max_value is null or max_value <> 'NaN'::numeric),
  check (min_value is null or max_value is null or min_value <= max_value)
);
create table app.specification_options (
  id uuid primary key default gen_random_uuid(), definition_id uuid not null references app.specification_definitions(id),
  code app.slug not null, label app.nonempty not null, sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active','archived')),
  unique(definition_id, code), unique(id, definition_id)
);
create table app.product_specifications (
  variant_id uuid not null, product_type_id uuid not null, definition_id uuid not null, data_type text not null,
  value_status text not null check (value_status in ('known','unknown','not_applicable','not_supported')),
  value_number numeric(20,6), value_boolean boolean, value_text text, option_id uuid,
  source_asset_id uuid references app.media_assets(id), source_note text,
  verified_by uuid references app.admin_profiles(user_id), verified_at timestamptz,
  primary key(variant_id, definition_id),
  foreign key(variant_id, product_type_id) references app.product_variants(id, product_type_id),
  foreign key(product_type_id, definition_id) references app.product_type_specifications(product_type_id, definition_id),
  foreign key(definition_id, data_type) references app.specification_definitions(id, data_type),
  foreign key(option_id, definition_id) references app.specification_options(id, definition_id),
  check ((verified_by is null) = (verified_at is null)),
  check (value_number is null or value_number <> 'NaN'::numeric),
  check (case when value_status <> 'known' then num_nonnulls(value_number,value_boolean,value_text,option_id) = 0
    when data_type = 'number' then value_number is not null and num_nonnulls(value_boolean,value_text,option_id) = 0
    when data_type = 'boolean' then value_boolean is not null and num_nonnulls(value_number,value_text,option_id) = 0
    when data_type = 'text' then value_text is not null and length(btrim(value_text)) > 0 and num_nonnulls(value_number,value_boolean,option_id) = 0
    when data_type = 'enum' then option_id is not null and num_nonnulls(value_number,value_boolean,value_text) = 0
    when data_type = 'multi_enum' then num_nonnulls(value_number,value_boolean,value_text,option_id) = 0 else false end)
);
create table app.product_specification_options (
  variant_id uuid not null, definition_id uuid not null, option_id uuid not null,
  primary key(variant_id, definition_id, option_id),
  foreign key(variant_id, definition_id) references app.product_specifications(variant_id, definition_id) deferrable initially deferred,
  foreign key(option_id, definition_id) references app.specification_options(id, definition_id)
);
create table app.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references app.products(id), variant_id uuid,
  asset_id uuid not null references app.media_assets(id), alt_text app.nonempty not null,
  sort_order integer not null default 0, is_primary boolean not null default false,
  foreign key(variant_id, product_id) references app.product_variants(id, product_id)
);
create unique index product_primary_image on app.product_images(product_id) where is_primary and variant_id is null;
create unique index variant_primary_image on app.product_images(variant_id) where is_primary and variant_id is not null;
create table app.product_documents (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references app.products(id), variant_id uuid,
  asset_id uuid not null references app.media_assets(id), title app.nonempty not null, language app.nonempty not null,
  revision text, model_scope app.nonempty not null, status text not null default 'draft' check (status in ('draft','published','archived')),
  foreign key(variant_id, product_id) references app.product_variants(id, product_id)
);
create table app.catalog_search_documents (
  variant_id uuid primary key, product_id uuid not null, search_text_normalized text not null,
  search_vector tsvector generated always as (to_tsvector('simple'::regconfig, search_text_normalized)) stored,
  source_revision bigint not null check (source_revision > 0),
  foreign key(variant_id, product_id) references app.product_variants(id, product_id)
);
