# Schema thực tế — module 08.2

Sinh từ PostgreSQL local bằng `npm.cmd run db:docs`. Migrations là nguồn chuẩn; tài liệu này chỉ đọc metadata, không có dữ liệu khách hoặc secret.

52 bảng trong `app`; RLS bật và chưa có policy cho phép. `api` chưa có RPC/view. `private.catalog_integrity_lock` chỉ điều phối chỉnh cây danh mục. Quan hệ tổng thể: [ERD](../architecture/ERD.md).

Ràng buộc trigger, giới hạn chưa triển khai và checklist: [bàn giao 08.1–08.2](../docs/MODULE_08_1_2.md).

## app.abuse_counters

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| bucket_key_hash | app.sha256_hex | Có | — |
| action | app.nonempty | Có | — |
| window_start | timestamp with time zone | Có | — |
| count | integer | Có | — |
| expires_at | timestamp with time zone | Có | — |

Constraints:

```sql
-- abuse_counters_check
CHECK ((expires_at > window_start));
-- abuse_counters_count_check
CHECK ((count >= 0));
-- abuse_counters_pkey
PRIMARY KEY (action, bucket_key_hash, window_start);
```

Indexes:

```sql
CREATE UNIQUE INDEX abuse_counters_pkey ON app.abuse_counters USING btree (action, bucket_key_hash, window_start)
CREATE INDEX abuse_expiry ON app.abuse_counters USING btree (expires_at)
```

## app.admin_profiles

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| user_id | uuid | Có | — |
| display_name | app.nonempty | Có | — |
| active | boolean | Có | false |
| authz_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- admin_profiles_authz_version_check
CHECK ((authz_version > 0));
-- admin_profiles_pkey
PRIMARY KEY (user_id);
-- admin_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;
```

Indexes:

```sql
CREATE UNIQUE INDEX admin_profiles_pkey ON app.admin_profiles USING btree (user_id)
```

## app.admin_role_permissions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| role_id | uuid | Có | — |
| permission_code | app.nonempty | Có | — |

Constraints:

```sql
-- admin_role_permissions_permission_code_fkey
FOREIGN KEY (permission_code) REFERENCES app.permission_definitions(code) ON DELETE RESTRICT;
-- admin_role_permissions_pkey
PRIMARY KEY (role_id, permission_code);
-- admin_role_permissions_role_id_fkey
FOREIGN KEY (role_id) REFERENCES app.admin_roles(id) ON DELETE RESTRICT;
```

Indexes:

```sql
CREATE UNIQUE INDEX admin_role_permissions_pkey ON app.admin_role_permissions USING btree (role_id, permission_code)
```

## app.admin_roles

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| code | app.slug | Có | — |
| name | app.nonempty | Có | — |
| status | text | Có | 'active'::text |

Constraints:

```sql
-- admin_roles_code_key
UNIQUE (code);
-- admin_roles_pkey
PRIMARY KEY (id);
-- admin_roles_status_check
CHECK ((status = ANY (ARRAY['active'::text, 'archived'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX admin_roles_code_key ON app.admin_roles USING btree (code)
CREATE UNIQUE INDEX admin_roles_pkey ON app.admin_roles USING btree (id)
```

## app.admin_user_roles

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| user_id | uuid | Có | — |
| role_id | uuid | Có | — |
| granted_by | uuid | Có | — |
| granted_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- admin_user_roles_granted_by_fkey
FOREIGN KEY (granted_by) REFERENCES app.admin_profiles(user_id) ON DELETE RESTRICT;
-- admin_user_roles_pkey
PRIMARY KEY (user_id, role_id);
-- admin_user_roles_role_id_fkey
FOREIGN KEY (role_id) REFERENCES app.admin_roles(id) ON DELETE RESTRICT;
-- admin_user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES app.admin_profiles(user_id) ON DELETE RESTRICT;
```

Indexes:

```sql
CREATE INDEX admin_roles_users ON app.admin_user_roles USING btree (role_id, user_id)
CREATE UNIQUE INDEX admin_user_roles_pkey ON app.admin_user_roles USING btree (user_id, role_id)
```

## app.after_sales_cases

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| order_id | uuid | Có | — |
| type | text | Có | — |
| reason | app.nonempty | Có | — |
| status | text | Có | 'open'::text |
| requested_refund_vnd | app.money_vnd | Không | — |
| assignee_id | uuid | Không | — |
| resolution | text | Không | — |
| created_at | timestamp with time zone | Có | now() |
| closed_at | timestamp with time zone | Không | — |

Constraints:

```sql
-- after_sales_cases_assignee_id_fkey
FOREIGN KEY (assignee_id) REFERENCES app.admin_profiles(user_id);
-- after_sales_cases_check
CHECK (((closed_at IS NULL) OR (closed_at >= created_at)));
-- after_sales_cases_id_order_id_key
UNIQUE (id, order_id);
-- after_sales_cases_order_id_fkey
FOREIGN KEY (order_id) REFERENCES app.orders(id);
-- after_sales_cases_pkey
PRIMARY KEY (id);
-- after_sales_cases_status_check
CHECK ((status = ANY (ARRAY['open'::text, 'reviewing'::text, 'resolved'::text, 'rejected'::text, 'closed'::text])));
-- after_sales_cases_type_check
CHECK ((type = ANY (ARRAY['return'::text, 'warranty'::text, 'refund'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX after_sales_cases_id_order_id_key ON app.after_sales_cases USING btree (id, order_id)
CREATE UNIQUE INDEX after_sales_cases_pkey ON app.after_sales_cases USING btree (id)
```

## app.audit_events

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| actor_type | text | Có | — |
| actor_id | uuid | Không | — |
| action | app.nonempty | Có | — |
| entity_type | app.nonempty | Có | — |
| entity_id | uuid | Có | — |
| request_id | uuid | Có | — |
| redacted_change | app."json_object" | Có | '{}'::jsonb |
| occurred_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- audit_events_actor_id_fkey
FOREIGN KEY (actor_id) REFERENCES app.admin_profiles(user_id);
-- audit_events_actor_type_check
CHECK ((actor_type = ANY (ARRAY['admin'::text, 'guest'::text, 'system'::text])));
-- audit_events_check
CHECK (((actor_type = 'admin'::text) = (actor_id IS NOT NULL)));
-- audit_events_pkey
PRIMARY KEY (id);
```

Indexes:

```sql
CREATE INDEX audit_entity ON app.audit_events USING btree (entity_type, entity_id, occurred_at)
CREATE UNIQUE INDEX audit_events_pkey ON app.audit_events USING btree (id)
```

## app.brands

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| name | app.nonempty | Có | — |
| slug | app.slug | Có | — |
| status | text | Có | 'draft'::text |
| logo_asset_id | uuid | Không | — |
| description | text | Có | ''::text |
| row_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- brands_logo_asset_id_fkey
FOREIGN KEY (logo_asset_id) REFERENCES app.media_assets(id);
-- brands_pkey
PRIMARY KEY (id);
-- brands_slug_key
UNIQUE (slug);
-- brands_status_check
CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])));
-- positive_row_version
CHECK ((row_version > 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX brands_pkey ON app.brands USING btree (id)
CREATE UNIQUE INDEX brands_slug_key ON app.brands USING btree (slug)
```

## app.catalog_search_documents

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| variant_id | uuid | Có | — |
| product_id | uuid | Có | — |
| search_text_normalized | text | Có | — |
| search_vector | tsvector | Không | GENERATED: to_tsvector('simple'::regconfig, search_text_normalized) |
| source_revision | bigint | Có | — |

Constraints:

```sql
-- catalog_search_documents_pkey
PRIMARY KEY (variant_id);
-- catalog_search_documents_source_revision_check
CHECK ((source_revision > 0));
-- catalog_search_documents_variant_id_product_id_fkey
FOREIGN KEY (variant_id, product_id) REFERENCES app.product_variants(id, product_id);
```

Indexes:

```sql
CREATE UNIQUE INDEX catalog_search_documents_pkey ON app.catalog_search_documents USING btree (variant_id)
CREATE INDEX search_gin ON app.catalog_search_documents USING gin (search_vector)
CREATE INDEX search_product ON app.catalog_search_documents USING btree (product_id)
```

## app.categories

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| parent_id | uuid | Không | — |
| name | app.nonempty | Có | — |
| slug | app.slug | Có | — |
| product_type_id | uuid | Không | — |
| status | text | Có | 'draft'::text |
| sort_order | integer | Có | 0 |
| row_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- catalog_structure_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
-- categories_check
CHECK ((parent_id IS DISTINCT FROM id));
-- categories_parent_id_fkey
FOREIGN KEY (parent_id) REFERENCES app.categories(id);
-- categories_pkey
PRIMARY KEY (id);
-- categories_product_type_id_fkey
FOREIGN KEY (product_type_id) REFERENCES app.product_types(id);
-- categories_slug_key
UNIQUE (slug);
-- categories_status_check
CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])));
-- positive_row_version
CHECK ((row_version > 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX categories_pkey ON app.categories USING btree (id)
CREATE UNIQUE INDEX categories_slug_key ON app.categories USING btree (slug)
CREATE INDEX category_parent ON app.categories USING btree (parent_id)
```

## app.commerce_policy_versions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| version_no | integer | Có | — |
| status | text | Có | 'draft'::text |
| cod_hold_seconds | integer | Không | — |
| transfer_hold_seconds | integer | Không | — |
| tax_rule_version | app.nonempty | Không | — |
| terms_version | app.nonempty | Không | — |
| bank_instruction_version | app.nonempty | Không | — |
| rules_json | app."json_object" | Có | '{}'::jsonb |
| approved_by | uuid | Không | — |
| approved_at | timestamp with time zone | Không | — |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- commerce_policy_versions_approved_by_fkey
FOREIGN KEY (approved_by) REFERENCES app.admin_profiles(user_id);
-- commerce_policy_versions_check
CHECK (((approved_by IS NULL) = (approved_at IS NULL)));
-- commerce_policy_versions_check1
CHECK (((status = 'draft'::text) OR ((cod_hold_seconds IS NOT NULL) AND (transfer_hold_seconds IS NOT NULL) AND (tax_rule_version IS NOT NULL) AND (terms_version IS NOT NULL) AND (bank_instruction_version IS NOT NULL) AND (approved_at IS NOT NULL))));
-- commerce_policy_versions_cod_hold_seconds_check
CHECK ((cod_hold_seconds > 0));
-- commerce_policy_versions_pkey
PRIMARY KEY (id);
-- commerce_policy_versions_status_check
CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'retired'::text])));
-- commerce_policy_versions_transfer_hold_seconds_check
CHECK ((transfer_hold_seconds > 0));
-- commerce_policy_versions_version_no_check
CHECK ((version_no > 0));
-- commerce_policy_versions_version_no_key
UNIQUE (version_no);
```

Indexes:

```sql
CREATE UNIQUE INDEX commerce_policy_versions_pkey ON app.commerce_policy_versions USING btree (id)
CREATE UNIQUE INDEX commerce_policy_versions_version_no_key ON app.commerce_policy_versions USING btree (version_no)
CREATE UNIQUE INDEX one_active_commerce_policy ON app.commerce_policy_versions USING btree (status) WHERE (status = 'active'::text)
```

## app.guest_order_grants

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| session_id | uuid | Có | — |
| order_id | uuid | Có | — |
| source_token_id | uuid | Không | — |
| scope | text | Có | — |
| expires_at | timestamp with time zone | Có | — |
| revoked_at | timestamp with time zone | Không | — |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- guest_order_grants_check
CHECK ((expires_at > created_at));
-- guest_order_grants_check1
CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at)));
-- guest_order_grants_order_id_fkey
FOREIGN KEY (order_id) REFERENCES app.orders(id);
-- guest_order_grants_pkey
PRIMARY KEY (session_id, order_id);
-- guest_order_grants_scope_check
CHECK ((scope = 'view_masked'::text));
-- guest_order_grants_session_id_fkey
FOREIGN KEY (session_id) REFERENCES app.guest_sessions(id);
-- guest_order_grants_source_token_id_order_id_fkey
FOREIGN KEY (source_token_id, order_id) REFERENCES app.order_access_tokens(id, order_id);
```

Indexes:

```sql
CREATE INDEX grants_order ON app.guest_order_grants USING btree (order_id)
CREATE INDEX grants_token ON app.guest_order_grants USING btree (source_token_id)
CREATE UNIQUE INDEX guest_order_grants_pkey ON app.guest_order_grants USING btree (session_id, order_id)
```

## app.guest_sessions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| token_hash | app.sha256_hex | Có | — |
| csrf_hash | app.sha256_hex | Có | — |
| created_at | timestamp with time zone | Có | now() |
| expires_at | timestamp with time zone | Có | — |
| revoked_at | timestamp with time zone | Không | — |

Constraints:

```sql
-- guest_sessions_check
CHECK ((expires_at > created_at));
-- guest_sessions_check1
CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at)));
-- guest_sessions_pkey
PRIMARY KEY (id);
-- guest_sessions_token_hash_key
UNIQUE (token_hash);
```

Indexes:

```sql
CREATE UNIQUE INDEX guest_sessions_pkey ON app.guest_sessions USING btree (id)
CREATE UNIQUE INDEX guest_sessions_token_hash_key ON app.guest_sessions USING btree (token_hash)
```

## app.idempotency_records

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| actor_scope | app.nonempty | Có | — |
| operation | app.nonempty | Có | — |
| key | uuid | Có | — |
| request_hash | app.sha256_hex | Có | — |
| resource_type | text | Có | — |
| resource_id | uuid | Có | — |
| response_code | integer | Có | — |
| created_at | timestamp with time zone | Có | now() |
| replay_until | timestamp with time zone | Có | — |

Constraints:

```sql
-- idempotency_records_actor_scope_operation_key_key
UNIQUE (actor_scope, operation, key);
-- idempotency_records_check
CHECK ((replay_until > created_at));
-- idempotency_records_pkey
PRIMARY KEY (id);
-- idempotency_records_resource_type_check
CHECK ((resource_type = ANY (ARRAY['order'::text, 'quote_request'::text, 'payment'::text, 'shipment'::text, 'return'::text, 'operation'::text])));
-- idempotency_records_response_code_check
CHECK (((response_code >= 200) AND (response_code <= 299)));
```

Indexes:

```sql
CREATE INDEX idempotency_expiry ON app.idempotency_records USING btree (replay_until)
CREATE UNIQUE INDEX idempotency_records_actor_scope_operation_key_key ON app.idempotency_records USING btree (actor_scope, operation, key)
CREATE UNIQUE INDEX idempotency_records_pkey ON app.idempotency_records USING btree (id)
```

## app.inventory

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| variant_id | uuid | Có | — |
| on_hand | integer | Có | 0 |
| reserved | integer | Có | 0 |
| available | integer | Không | GENERATED: (on_hand - reserved) |
| version | bigint | Có | 1 |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- inventory_check
CHECK (((on_hand >= 0) AND (reserved >= 0) AND (reserved <= on_hand)));
-- inventory_pkey
PRIMARY KEY (variant_id);
-- inventory_reserved_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
-- inventory_variant_id_fkey
FOREIGN KEY (variant_id) REFERENCES app.product_variants(id);
-- inventory_version_check
CHECK ((version > 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX inventory_pkey ON app.inventory USING btree (variant_id)
```

## app.inventory_movements

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| variant_id | uuid | Có | — |
| operation_id | uuid | Có | — |
| source_line_key | app.nonempty | Có | — |
| movement_kind | text | Có | — |
| delta_on_hand | integer | Có | — |
| delta_reserved | integer | Có | — |
| order_item_id | uuid | Không | — |
| return_item_id | uuid | Không | — |
| actor_id | uuid | Không | — |
| reason | app.nonempty | Có | — |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- inventory_movements_actor_id_fkey
FOREIGN KEY (actor_id) REFERENCES app.admin_profiles(user_id);
-- inventory_movements_check
CHECK (((delta_on_hand <> 0) OR (delta_reserved <> 0)));
-- inventory_movements_check1
CHECK (
CASE movement_kind
    WHEN 'reserve'::text THEN ((delta_on_hand = 0) AND (delta_reserved > 0) AND (order_item_id IS NOT NULL))
    WHEN 'release'::text THEN ((delta_on_hand = 0) AND (delta_reserved < 0) AND (order_item_id IS NOT NULL))
    WHEN 'dispatch'::text THEN ((delta_on_hand < 0) AND (delta_reserved = delta_on_hand) AND (order_item_id IS NOT NULL))
    WHEN 'restock'::text THEN ((delta_on_hand > 0) AND (delta_reserved = 0) AND (return_item_id IS NOT NULL))
    WHEN 'adjustment'::text THEN (delta_reserved = 0)
    ELSE false
END);
-- inventory_movements_movement_kind_check
CHECK ((movement_kind = ANY (ARRAY['adjustment'::text, 'reserve'::text, 'release'::text, 'dispatch'::text, 'restock'::text])));
-- inventory_movements_operation_id_variant_id_movement_kind_s_key
UNIQUE (operation_id, variant_id, movement_kind, source_line_key);
-- inventory_movements_order_item_id_fkey
FOREIGN KEY (order_item_id) REFERENCES app.order_items(id);
-- inventory_movements_pkey
PRIMARY KEY (id);
-- inventory_movements_return_item_id_fkey
FOREIGN KEY (return_item_id) REFERENCES app.return_items(id);
-- inventory_movements_variant_id_fkey
FOREIGN KEY (variant_id) REFERENCES app.inventory(variant_id);
```

Indexes:

```sql
CREATE UNIQUE INDEX inventory_movements_operation_id_variant_id_movement_kind_s_key ON app.inventory_movements USING btree (operation_id, variant_id, movement_kind, source_line_key)
CREATE UNIQUE INDEX inventory_movements_pkey ON app.inventory_movements USING btree (id)
CREATE INDEX movement_inventory ON app.inventory_movements USING btree (variant_id, created_at)
```

## app.media_assets

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| bucket | app.nonempty | Có | — |
| object_key | app.nonempty | Có | — |
| sha256 | app.sha256_hex | Không | — |
| mime | app.nonempty | Có | — |
| byte_size | bigint | Không | — |
| width | integer | Không | — |
| height | integer | Không | — |
| state | text | Có | 'pending'::text |
| visibility | text | Có | 'private'::text |
| rights_note | text | Có | ''::text |
| approved_by | uuid | Không | — |
| created_by | uuid | Có | — |
| created_at | timestamp with time zone | Có | now() |
| expires_at | timestamp with time zone | Không | — |

Constraints:

```sql
-- media_assets_approved_by_fkey
FOREIGN KEY (approved_by) REFERENCES app.admin_profiles(user_id);
-- media_assets_bucket_object_key_key
UNIQUE (bucket, object_key);
-- media_assets_byte_size_check
CHECK ((byte_size >= 0));
-- media_assets_check
CHECK (((state <> 'approved'::text) OR ((approved_by IS NOT NULL) AND (sha256 IS NOT NULL) AND (byte_size IS NOT NULL))));
-- media_assets_check1
CHECK (((expires_at IS NULL) OR (expires_at > created_at)));
-- media_assets_created_by_fkey
FOREIGN KEY (created_by) REFERENCES app.admin_profiles(user_id);
-- media_assets_height_check
CHECK ((height > 0));
-- media_assets_pkey
PRIMARY KEY (id);
-- media_assets_state_check
CHECK ((state = ANY (ARRAY['pending'::text, 'staged'::text, 'approved'::text, 'rejected'::text, 'deleting'::text])));
-- media_assets_visibility_check
CHECK ((visibility = ANY (ARRAY['private'::text, 'public'::text])));
-- media_assets_width_check
CHECK ((width > 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX media_assets_bucket_object_key_key ON app.media_assets USING btree (bucket, object_key)
CREATE UNIQUE INDEX media_assets_pkey ON app.media_assets USING btree (id)
```

## app.operation_runs

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| operation_type | app.nonempty | Có | — |
| started_at | timestamp with time zone | Có | now() |
| finished_at | timestamp with time zone | Không | — |
| status | text | Có | 'running'::text |
| counts | app."json_object" | Có | '{}'::jsonb |
| error_code | text | Không | — |

Constraints:

```sql
-- operation_runs_check
CHECK (((status = 'running'::text) = (finished_at IS NULL)));
-- operation_runs_check1
CHECK (((finished_at IS NULL) OR (finished_at >= started_at)));
-- operation_runs_pkey
PRIMARY KEY (id);
-- operation_runs_status_check
CHECK ((status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text])));
```

Indexes:

```sql
CREATE INDEX operation_history ON app.operation_runs USING btree (operation_type, started_at)
CREATE UNIQUE INDEX operation_runs_pkey ON app.operation_runs USING btree (id)
```

## app.order_access_tokens

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| order_id | uuid | Có | — |
| token_hash | app.sha256_hex | Có | — |
| scope | text | Có | — |
| expires_at | timestamp with time zone | Có | — |
| revoked_at | timestamp with time zone | Không | — |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- order_access_tokens_check
CHECK ((expires_at > created_at));
-- order_access_tokens_check1
CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at)));
-- order_access_tokens_id_order_id_key
UNIQUE (id, order_id);
-- order_access_tokens_order_id_fkey
FOREIGN KEY (order_id) REFERENCES app.orders(id);
-- order_access_tokens_pkey
PRIMARY KEY (id);
-- order_access_tokens_scope_check
CHECK ((scope = 'view_masked'::text));
-- order_access_tokens_token_hash_key
UNIQUE (token_hash);
```

Indexes:

```sql
CREATE UNIQUE INDEX order_access_tokens_id_order_id_key ON app.order_access_tokens USING btree (id, order_id)
CREATE UNIQUE INDEX order_access_tokens_pkey ON app.order_access_tokens USING btree (id)
CREATE UNIQUE INDEX order_access_tokens_token_hash_key ON app.order_access_tokens USING btree (token_hash)
CREATE INDEX tokens_order ON app.order_access_tokens USING btree (order_id)
```

## app.order_contacts

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| order_id | uuid | Có | — |
| name | app.nonempty | Có | — |
| phone | app.nonempty | Có | — |
| email | text | Không | — |
| delivery_address | app."json_object" | Có | — |
| billing_details | app."json_object" | Không | — |
| delivery_note | text | Không | — |
| retention_until | timestamp with time zone | Không | — |

Constraints:

```sql
-- order_contacts_email_check
CHECK (((email IS NULL) OR ((length(email) >= 3) AND (length(email) <= 254))));
-- order_contacts_order_id_fkey
FOREIGN KEY (order_id) REFERENCES app.orders(id);
-- order_contacts_pkey
PRIMARY KEY (order_id);
-- order_totals_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
```

Indexes:

```sql
CREATE UNIQUE INDEX order_contacts_pkey ON app.order_contacts USING btree (order_id)
```

## app.order_items

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| order_id | uuid | Có | — |
| variant_id | uuid | Có | — |
| quantity | integer | Có | — |
| unit_amount_vnd | app.money_vnd | Có | — |
| basis | text | Có | — |
| tax_status | app.tax_status | Có | — |
| tax_rate_bps | integer | Không | — |
| line_net_vnd | app.money_vnd | Có | — |
| line_tax_vnd | app.money_vnd | Có | — |
| line_total_vnd | app.money_vnd | Có | — |
| product_snapshot | app."json_object" | Có | — |
| warranty_version_id | uuid | Có | — |
| warranty_snapshot | app."json_object" | Có | — |

Constraints:

```sql
-- order_items_basis_check
CHECK ((basis = ANY (ARRAY['NET'::text, 'GROSS'::text])));
-- order_items_check
CHECK (private.tax_valid((tax_status)::text, tax_rate_bps));
-- order_items_check1
CHECK (((line_total_vnd)::numeric = ((line_net_vnd)::numeric + (line_tax_vnd)::numeric)));
-- order_items_check2
CHECK ((((basis = 'NET'::text) AND ((line_net_vnd)::numeric = ((unit_amount_vnd)::numeric * (quantity)::numeric))) OR ((basis = 'GROSS'::text) AND ((line_total_vnd)::numeric = ((unit_amount_vnd)::numeric * (quantity)::numeric)))));
-- order_items_check3
CHECK ((((tax_status)::text = 'taxable'::text) OR ((line_tax_vnd)::bigint = 0)));
-- order_items_id_order_id_key
UNIQUE (id, order_id);
-- order_items_id_variant_id_quantity_key
UNIQUE (id, variant_id, quantity);
-- order_items_order_id_fkey
FOREIGN KEY (order_id) REFERENCES app.orders(id);
-- order_items_order_id_variant_id_key
UNIQUE (order_id, variant_id);
-- order_items_pkey
PRIMARY KEY (id);
-- order_items_quantity_check
CHECK ((quantity > 0));
-- order_items_tax_status_check
CHECK (((tax_status)::text <> 'unknown'::text));
-- order_items_unit_amount_vnd_check
CHECK (((unit_amount_vnd)::bigint > 0));
-- order_items_variant_id_fkey
FOREIGN KEY (variant_id) REFERENCES app.product_variants(id);
-- order_items_warranty_version_id_fkey
FOREIGN KEY (warranty_version_id) REFERENCES app.warranty_policy_versions(id);
-- order_totals_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
```

Indexes:

```sql
CREATE UNIQUE INDEX order_items_id_order_id_key ON app.order_items USING btree (id, order_id)
CREATE UNIQUE INDEX order_items_id_variant_id_quantity_key ON app.order_items USING btree (id, variant_id, quantity)
CREATE UNIQUE INDEX order_items_order_id_variant_id_key ON app.order_items USING btree (order_id, variant_id)
CREATE UNIQUE INDEX order_items_pkey ON app.order_items USING btree (id)
```

## app.orders

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| public_reference | app.nonempty | Có | — |
| source | text | Có | — |
| quote_id | uuid | Không | — |
| quote_version_id | uuid | Không | — |
| policy_version_id | uuid | Có | — |
| payment_method | text | Có | — |
| order_status | text | Có | 'pending_review'::text |
| payment_status_cache | text | Có | 'unpaid'::text |
| items_net_vnd | app.money_vnd | Có | — |
| items_tax_vnd | app.money_vnd | Có | — |
| shipping_net_vnd | app.money_vnd | Có | — |
| shipping_tax_vnd | app.money_vnd | Có | — |
| total_vnd | app.money_vnd | Có | — |
| currency | text | Có | — |
| flags | app."json_object" | Có | '{}'::jsonb |
| row_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- order_quote_root
FOREIGN KEY (quote_id) REFERENCES app.quotes(id);
-- order_quote_version
FOREIGN KEY (quote_version_id, quote_id) REFERENCES app.quote_versions(id, quote_id);
-- order_totals_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
-- orders_check
CHECK (((total_vnd)::numeric = ((((items_net_vnd)::numeric + (items_tax_vnd)::numeric) + (shipping_net_vnd)::numeric) + (shipping_tax_vnd)::numeric)));
-- orders_check1
CHECK ((((source = 'retail'::text) AND (quote_id IS NULL) AND (quote_version_id IS NULL)) OR ((source = 'quote'::text) AND (quote_id IS NOT NULL) AND (quote_version_id IS NOT NULL))));
-- orders_currency_check
CHECK ((currency = 'VND'::text));
-- orders_order_status_check
CHECK ((order_status = ANY (ARRAY['pending_review'::text, 'confirmed'::text, 'processing'::text, 'completed'::text, 'cancelled'::text, 'expired'::text])));
-- orders_payment_method_check
CHECK ((payment_method = ANY (ARRAY['cod'::text, 'bank_transfer'::text])));
-- orders_payment_status_cache_check
CHECK ((payment_status_cache = ANY (ARRAY['unpaid'::text, 'partial'::text, 'paid'::text, 'partially_refunded'::text, 'refunded'::text])));
-- orders_pkey
PRIMARY KEY (id);
-- orders_policy_version_id_fkey
FOREIGN KEY (policy_version_id) REFERENCES app.commerce_policy_versions(id);
-- orders_public_reference_key
UNIQUE (public_reference);
-- orders_quote_id_key
UNIQUE (quote_id);
-- orders_source_check
CHECK ((source = ANY (ARRAY['retail'::text, 'quote'::text])));
-- positive_row_version
CHECK ((row_version > 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX orders_pkey ON app.orders USING btree (id)
CREATE UNIQUE INDEX orders_public_reference_key ON app.orders USING btree (public_reference)
CREATE INDEX orders_queue ON app.orders USING btree (order_status, created_at, id)
CREATE UNIQUE INDEX orders_quote_id_key ON app.orders USING btree (quote_id)
CREATE INDEX orders_source ON app.orders USING btree (source, created_at, id)
```

## app.payment_entries

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| order_id | uuid | Có | — |
| kind | text | Có | — |
| amount_vnd | app.money_vnd | Có | — |
| channel | app.nonempty | Có | — |
| external_reference | app.nonempty | Không | — |
| evidence_asset_id | uuid | Không | — |
| reversal_of_id | uuid | Không | — |
| operation_id | uuid | Có | — |
| actor_id | uuid | Có | — |
| recorded_at | timestamp with time zone | Có | now() |
| note | app.nonempty | Có | — |

Constraints:

```sql
-- payment_entries_actor_id_fkey
FOREIGN KEY (actor_id) REFERENCES app.admin_profiles(user_id);
-- payment_entries_amount_vnd_check
CHECK (((amount_vnd)::bigint > 0));
-- payment_entries_check
CHECK (((kind = 'reversal'::text) = (reversal_of_id IS NOT NULL)));
-- payment_entries_check1
CHECK ((reversal_of_id IS DISTINCT FROM id));
-- payment_entries_evidence_asset_id_fkey
FOREIGN KEY (evidence_asset_id) REFERENCES app.media_assets(id);
-- payment_entries_id_order_id_key
UNIQUE (id, order_id);
-- payment_entries_kind_check
CHECK ((kind = ANY (ARRAY['receipt'::text, 'refund'::text, 'reversal'::text])));
-- payment_entries_operation_id_key
UNIQUE (operation_id);
-- payment_entries_order_id_fkey
FOREIGN KEY (order_id) REFERENCES app.orders(id);
-- payment_entries_pkey
PRIMARY KEY (id);
-- payment_entries_reversal_of_id_key
UNIQUE (reversal_of_id);
-- payment_entries_reversal_of_id_order_id_fkey
FOREIGN KEY (reversal_of_id, order_id) REFERENCES app.payment_entries(id, order_id);
```

Indexes:

```sql
CREATE UNIQUE INDEX payment_entries_id_order_id_key ON app.payment_entries USING btree (id, order_id)
CREATE UNIQUE INDEX payment_entries_operation_id_key ON app.payment_entries USING btree (operation_id)
CREATE UNIQUE INDEX payment_entries_pkey ON app.payment_entries USING btree (id)
CREATE UNIQUE INDEX payment_entries_reversal_of_id_key ON app.payment_entries USING btree (reversal_of_id)
CREATE UNIQUE INDEX payment_external_reference ON app.payment_entries USING btree (channel, external_reference) WHERE (external_reference IS NOT NULL)
CREATE INDEX payment_order ON app.payment_entries USING btree (order_id, recorded_at)
```

## app.permission_definitions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| code | app.nonempty | Có | — |
| description | text | Có | — |

Constraints:

```sql
-- permission_definitions_pkey
PRIMARY KEY (code);
```

Indexes:

```sql
CREATE UNIQUE INDEX permission_definitions_pkey ON app.permission_definitions USING btree (code)
```

## app.price_versions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| variant_id | uuid | Có | — |
| version_no | integer | Có | — |
| basis | text | Có | — |
| amount_vnd | app.money_vnd | Có | — |
| tax_status | app.tax_status | Có | — |
| tax_rate_bps | integer | Không | — |
| approved_by | uuid | Có | — |
| approved_at | timestamp with time zone | Có | — |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- price_versions_amount_vnd_check
CHECK (((amount_vnd)::bigint > 0));
-- price_versions_approved_by_fkey
FOREIGN KEY (approved_by) REFERENCES app.admin_profiles(user_id);
-- price_versions_basis_check
CHECK ((basis = ANY (ARRAY['NET'::text, 'GROSS'::text])));
-- price_versions_check
CHECK (private.tax_valid((tax_status)::text, tax_rate_bps));
-- price_versions_id_variant_id_key
UNIQUE (id, variant_id);
-- price_versions_pkey
PRIMARY KEY (id);
-- price_versions_variant_id_fkey
FOREIGN KEY (variant_id) REFERENCES app.product_variants(id);
-- price_versions_variant_id_version_no_key
UNIQUE (variant_id, version_no);
-- price_versions_version_no_check
CHECK ((version_no > 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX price_versions_id_variant_id_key ON app.price_versions USING btree (id, variant_id)
CREATE UNIQUE INDEX price_versions_pkey ON app.price_versions USING btree (id)
CREATE UNIQUE INDEX price_versions_variant_id_version_no_key ON app.price_versions USING btree (variant_id, version_no)
```

## app.product_categories

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| product_id | uuid | Có | — |
| category_id | uuid | Có | — |

Constraints:

```sql
-- catalog_structure_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
-- product_categories_category_id_fkey
FOREIGN KEY (category_id) REFERENCES app.categories(id);
-- product_categories_pkey
PRIMARY KEY (product_id, category_id);
-- product_categories_product_id_fkey
FOREIGN KEY (product_id) REFERENCES app.products(id);
```

Indexes:

```sql
CREATE INDEX categories_products ON app.product_categories USING btree (category_id, product_id)
CREATE UNIQUE INDEX product_categories_pkey ON app.product_categories USING btree (product_id, category_id)
```

## app.product_documents

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| product_id | uuid | Có | — |
| variant_id | uuid | Không | — |
| asset_id | uuid | Có | — |
| title | app.nonempty | Có | — |
| language | app.nonempty | Có | — |
| revision | text | Không | — |
| model_scope | app.nonempty | Có | — |
| status | text | Có | 'draft'::text |

Constraints:

```sql
-- product_documents_asset_id_fkey
FOREIGN KEY (asset_id) REFERENCES app.media_assets(id);
-- product_documents_pkey
PRIMARY KEY (id);
-- product_documents_product_id_fkey
FOREIGN KEY (product_id) REFERENCES app.products(id);
-- product_documents_status_check
CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])));
-- product_documents_variant_id_product_id_fkey
FOREIGN KEY (variant_id, product_id) REFERENCES app.product_variants(id, product_id);
```

Indexes:

```sql
CREATE UNIQUE INDEX product_documents_pkey ON app.product_documents USING btree (id)
```

## app.product_images

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| product_id | uuid | Có | — |
| variant_id | uuid | Không | — |
| asset_id | uuid | Có | — |
| alt_text | app.nonempty | Có | — |
| sort_order | integer | Có | 0 |
| is_primary | boolean | Có | false |

Constraints:

```sql
-- product_images_asset_id_fkey
FOREIGN KEY (asset_id) REFERENCES app.media_assets(id);
-- product_images_pkey
PRIMARY KEY (id);
-- product_images_product_id_fkey
FOREIGN KEY (product_id) REFERENCES app.products(id);
-- product_images_variant_id_product_id_fkey
FOREIGN KEY (variant_id, product_id) REFERENCES app.product_variants(id, product_id);
```

Indexes:

```sql
CREATE UNIQUE INDEX product_images_pkey ON app.product_images USING btree (id)
CREATE UNIQUE INDEX product_primary_image ON app.product_images USING btree (product_id) WHERE (is_primary AND (variant_id IS NULL))
CREATE UNIQUE INDEX variant_primary_image ON app.product_images USING btree (variant_id) WHERE (is_primary AND (variant_id IS NOT NULL))
```

## app.product_specification_options

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| variant_id | uuid | Có | — |
| definition_id | uuid | Có | — |
| option_id | uuid | Có | — |

Constraints:

```sql
-- product_specification_options_option_id_definition_id_fkey
FOREIGN KEY (option_id, definition_id) REFERENCES app.specification_options(id, definition_id);
-- product_specification_options_pkey
PRIMARY KEY (variant_id, definition_id, option_id);
-- product_specification_options_variant_id_definition_id_fkey
FOREIGN KEY (variant_id, definition_id) REFERENCES app.product_specifications(variant_id, definition_id) DEFERRABLE INITIALLY DEFERRED;
-- specification_options_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
```

Indexes:

```sql
CREATE UNIQUE INDEX product_specification_options_pkey ON app.product_specification_options USING btree (variant_id, definition_id, option_id)
CREATE INDEX specs_multi_enum ON app.product_specification_options USING btree (definition_id, option_id, variant_id)
```

## app.product_specifications

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| variant_id | uuid | Có | — |
| product_type_id | uuid | Có | — |
| definition_id | uuid | Có | — |
| data_type | text | Có | — |
| value_status | text | Có | — |
| value_number | numeric(20,6) | Không | — |
| value_boolean | boolean | Không | — |
| value_text | text | Không | — |
| option_id | uuid | Không | — |
| source_asset_id | uuid | Không | — |
| source_note | text | Không | — |
| verified_by | uuid | Không | — |
| verified_at | timestamp with time zone | Không | — |

Constraints:

```sql
-- product_specifications_check
CHECK (((verified_by IS NULL) = (verified_at IS NULL)));
-- product_specifications_check1
CHECK (
CASE
    WHEN (value_status <> 'known'::text) THEN (num_nonnulls(value_number, value_boolean, value_text, option_id) = 0)
    WHEN (data_type = 'number'::text) THEN ((value_number IS NOT NULL) AND (num_nonnulls(value_boolean, value_text, option_id) = 0))
    WHEN (data_type = 'boolean'::text) THEN ((value_boolean IS NOT NULL) AND (num_nonnulls(value_number, value_text, option_id) = 0))
    WHEN (data_type = 'text'::text) THEN ((value_text IS NOT NULL) AND (length(btrim(value_text)) > 0) AND (num_nonnulls(value_number, value_boolean, option_id) = 0))
    WHEN (data_type = 'enum'::text) THEN ((option_id IS NOT NULL) AND (num_nonnulls(value_number, value_boolean, value_text) = 0))
    WHEN (data_type = 'multi_enum'::text) THEN (num_nonnulls(value_number, value_boolean, value_text, option_id) = 0)
    ELSE false
END);
-- product_specifications_definition_id_data_type_fkey
FOREIGN KEY (definition_id, data_type) REFERENCES app.specification_definitions(id, data_type);
-- product_specifications_option_id_definition_id_fkey
FOREIGN KEY (option_id, definition_id) REFERENCES app.specification_options(id, definition_id);
-- product_specifications_pkey
PRIMARY KEY (variant_id, definition_id);
-- product_specifications_product_type_id_definition_id_fkey
FOREIGN KEY (product_type_id, definition_id) REFERENCES app.product_type_specifications(product_type_id, definition_id);
-- product_specifications_source_asset_id_fkey
FOREIGN KEY (source_asset_id) REFERENCES app.media_assets(id);
-- product_specifications_value_number_check
CHECK (((value_number IS NULL) OR (value_number <> 'NaN'::numeric)));
-- product_specifications_value_status_check
CHECK ((value_status = ANY (ARRAY['known'::text, 'unknown'::text, 'not_applicable'::text, 'not_supported'::text])));
-- product_specifications_variant_id_product_type_id_fkey
FOREIGN KEY (variant_id, product_type_id) REFERENCES app.product_variants(id, product_type_id);
-- product_specifications_verified_by_fkey
FOREIGN KEY (verified_by) REFERENCES app.admin_profiles(user_id);
-- specification_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
```

Indexes:

```sql
CREATE UNIQUE INDEX product_specifications_pkey ON app.product_specifications USING btree (variant_id, definition_id)
CREATE INDEX specs_boolean ON app.product_specifications USING btree (definition_id, value_boolean, variant_id) WHERE ((value_status = 'known'::text) AND (data_type = 'boolean'::text))
CREATE INDEX specs_enum ON app.product_specifications USING btree (definition_id, option_id, variant_id) WHERE ((value_status = 'known'::text) AND (data_type = 'enum'::text))
CREATE INDEX specs_number ON app.product_specifications USING btree (definition_id, value_number, variant_id) WHERE ((value_status = 'known'::text) AND (data_type = 'number'::text))
```

## app.product_type_specifications

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| product_type_id | uuid | Có | — |
| definition_id | uuid | Có | — |
| required_for_publish | boolean | Có | false |
| filterable | boolean | Có | false |
| comparable | boolean | Có | false |
| display_order | integer | Có | 0 |
| min_value | numeric(20,6) | Không | — |
| max_value | numeric(20,6) | Không | — |

Constraints:

```sql
-- product_type_specifications_check
CHECK (((min_value IS NULL) OR (max_value IS NULL) OR (min_value <= max_value)));
-- product_type_specifications_definition_id_fkey
FOREIGN KEY (definition_id) REFERENCES app.specification_definitions(id);
-- product_type_specifications_max_value_check
CHECK (((max_value IS NULL) OR (max_value <> 'NaN'::numeric)));
-- product_type_specifications_min_value_check
CHECK (((min_value IS NULL) OR (min_value <> 'NaN'::numeric)));
-- product_type_specifications_pkey
PRIMARY KEY (product_type_id, definition_id);
-- product_type_specifications_product_type_id_fkey
FOREIGN KEY (product_type_id) REFERENCES app.product_types(id);
```

Indexes:

```sql
CREATE UNIQUE INDEX product_type_specifications_pkey ON app.product_type_specifications USING btree (product_type_id, definition_id)
```

## app.product_types

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| code | app.slug | Có | — |
| name | app.nonempty | Có | — |
| status | text | Có | 'draft'::text |

Constraints:

```sql
-- product_types_code_key
UNIQUE (code);
-- product_types_pkey
PRIMARY KEY (id);
-- product_types_status_check
CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX product_types_code_key ON app.product_types USING btree (code)
CREATE UNIQUE INDEX product_types_pkey ON app.product_types USING btree (id)
```

## app.product_variants

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| product_id | uuid | Có | — |
| product_type_id | uuid | Có | — |
| sku | app.nonempty | Có | — |
| sku_normalized | text | Không | GENERATED: private.normalize_identifier((sku)::text) |
| model | app.nonempty | Có | — |
| model_normalized | text | Không | GENERATED: private.normalize_identifier((model)::text) |
| variant_label | text | Có | ''::text |
| sales_mode | text | Có | 'quote_only'::text |
| lifecycle_status | app.lifecycle | Có | 'active'::text |
| data_status | text | Có | 'draft'::text |
| current_price_id | uuid | Không | — |
| warranty_version_id | uuid | Không | — |
| row_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- current_price_same_variant
FOREIGN KEY (current_price_id, id) REFERENCES app.price_versions(id, variant_id);
-- positive_row_version
CHECK ((row_version > 0));
-- product_variants_data_status_check
CHECK ((data_status = ANY (ARRAY['draft'::text, 'ready'::text])));
-- product_variants_id_product_id_key
UNIQUE (id, product_id);
-- product_variants_id_product_type_id_key
UNIQUE (id, product_type_id);
-- product_variants_pkey
PRIMARY KEY (id);
-- product_variants_product_id_product_type_id_fkey
FOREIGN KEY (product_id, product_type_id) REFERENCES app.products(id, product_type_id);
-- product_variants_sales_mode_check
CHECK ((sales_mode = ANY (ARRAY['retail'::text, 'quote_only'::text, 'not_for_sale'::text])));
-- product_variants_sku_normalized_key
UNIQUE (sku_normalized);
-- product_variants_warranty_version_id_fkey
FOREIGN KEY (warranty_version_id) REFERENCES app.warranty_policy_versions(id);
```

Indexes:

```sql
CREATE INDEX model_prefix ON app.product_variants USING btree (model_normalized text_pattern_ops)
CREATE UNIQUE INDEX product_variants_id_product_id_key ON app.product_variants USING btree (id, product_id)
CREATE UNIQUE INDEX product_variants_id_product_type_id_key ON app.product_variants USING btree (id, product_type_id)
CREATE UNIQUE INDEX product_variants_pkey ON app.product_variants USING btree (id)
CREATE UNIQUE INDEX product_variants_sku_normalized_key ON app.product_variants USING btree (sku_normalized)
CREATE INDEX sku_prefix ON app.product_variants USING btree (sku_normalized text_pattern_ops)
CREATE INDEX variants_product ON app.product_variants USING btree (product_id)
```

## app.products

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| brand_id | uuid | Có | — |
| product_type_id | uuid | Có | — |
| primary_category_id | uuid | Có | — |
| name | app.nonempty | Có | — |
| slug | app.slug | Có | — |
| model_family | text | Không | — |
| description | text | Có | ''::text |
| publication_status | text | Có | 'draft'::text |
| lifecycle_status | app.lifecycle | Có | 'active'::text |
| lifecycle_reason | text | Không | — |
| row_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- catalog_structure_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
-- positive_row_version
CHECK ((row_version > 0));
-- primary_category_membership
FOREIGN KEY (id, primary_category_id) REFERENCES app.product_categories(product_id, category_id) DEFERRABLE INITIALLY DEFERRED;
-- products_brand_id_fkey
FOREIGN KEY (brand_id) REFERENCES app.brands(id);
-- products_id_product_type_id_key
UNIQUE (id, product_type_id);
-- products_pkey
PRIMARY KEY (id);
-- products_primary_category_id_fkey
FOREIGN KEY (primary_category_id) REFERENCES app.categories(id);
-- products_product_type_id_fkey
FOREIGN KEY (product_type_id) REFERENCES app.product_types(id);
-- products_publication_status_check
CHECK ((publication_status = ANY (ARRAY['draft'::text, 'published'::text, 'hidden'::text])));
-- products_slug_key
UNIQUE (slug);
```

Indexes:

```sql
CREATE INDEX products_collection ON app.products USING btree (publication_status, brand_id, product_type_id, id)
CREATE UNIQUE INDEX products_id_product_type_id_key ON app.products USING btree (id, product_type_id)
CREATE UNIQUE INDEX products_pkey ON app.products USING btree (id)
CREATE UNIQUE INDEX products_slug_key ON app.products USING btree (slug)
```

## app.publication_revisions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| revision_no | bigint | Có | — |
| created_at | timestamp with time zone | Có | now() |
| state | text | Có | 'pending'::text |
| requested_by | uuid | Không | — |
| deployment_ref | text | Không | — |
| published_at | timestamp with time zone | Không | — |
| error_code | text | Không | — |

Constraints:

```sql
-- publication_revisions_check
CHECK (((state <> 'published'::text) OR ((published_at IS NOT NULL) AND (deployment_ref IS NOT NULL))));
-- publication_revisions_pkey
PRIMARY KEY (id);
-- publication_revisions_requested_by_fkey
FOREIGN KEY (requested_by) REFERENCES app.admin_profiles(user_id);
-- publication_revisions_revision_no_check
CHECK ((revision_no > 0));
-- publication_revisions_revision_no_key
UNIQUE (revision_no);
-- publication_revisions_state_check
CHECK ((state = ANY (ARRAY['pending'::text, 'building'::text, 'published'::text, 'failed'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX publication_revisions_pkey ON app.publication_revisions USING btree (id)
CREATE UNIQUE INDEX publication_revisions_revision_no_key ON app.publication_revisions USING btree (revision_no)
```

## app.quote_acceptances

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| quote_version_id | uuid | Có | — |
| recorded_by | uuid | Có | — |
| accepted_at | timestamp with time zone | Có | — |
| channel | app.nonempty | Có | — |
| evidence_asset_id | uuid | Không | — |
| evidence_note | app.nonempty | Không | — |

Constraints:

```sql
-- quote_acceptances_evidence_asset_id_fkey
FOREIGN KEY (evidence_asset_id) REFERENCES app.media_assets(id);
-- quote_acceptances_pkey
PRIMARY KEY (id);
-- quote_acceptances_quote_version_id_fkey
FOREIGN KEY (quote_version_id) REFERENCES app.quote_versions(id);
-- quote_acceptances_quote_version_id_key
UNIQUE (quote_version_id);
-- quote_acceptances_recorded_by_fkey
FOREIGN KEY (recorded_by) REFERENCES app.admin_profiles(user_id);
```

Indexes:

```sql
CREATE UNIQUE INDEX quote_acceptances_pkey ON app.quote_acceptances USING btree (id)
CREATE UNIQUE INDEX quote_acceptances_quote_version_id_key ON app.quote_acceptances USING btree (quote_version_id)
```

## app.quote_events

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| quote_id | uuid | Có | — |
| version_id | uuid | Không | — |
| event_type | app.nonempty | Có | — |
| actor_id | uuid | Có | — |
| occurred_at | timestamp with time zone | Có | now() |
| note | text | Có | ''::text |

Constraints:

```sql
-- quote_events_actor_id_fkey
FOREIGN KEY (actor_id) REFERENCES app.admin_profiles(user_id);
-- quote_events_pkey
PRIMARY KEY (id);
-- quote_events_quote_id_fkey
FOREIGN KEY (quote_id) REFERENCES app.quotes(id);
-- quote_events_version_id_quote_id_fkey
FOREIGN KEY (version_id, quote_id) REFERENCES app.quote_versions(id, quote_id);
```

Indexes:

```sql
CREATE UNIQUE INDEX quote_events_pkey ON app.quote_events USING btree (id)
```

## app.quote_items

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| quote_version_id | uuid | Có | — |
| variant_id | uuid | Không | — |
| label_snapshot | app.nonempty | Có | — |
| quantity | integer | Có | — |
| basis | text | Có | — |
| unit_amount_vnd | app.money_vnd | Có | — |
| tax_status | app.tax_status | Có | — |
| tax_rate_bps | integer | Không | — |
| line_net_vnd | app.money_vnd | Có | — |
| line_tax_vnd | app.money_vnd | Có | — |
| line_total_vnd | app.money_vnd | Có | — |
| warranty_snapshot | app."json_object" | Có | — |

Constraints:

```sql
-- quote_items_basis_check
CHECK ((basis = ANY (ARRAY['NET'::text, 'GROSS'::text])));
-- quote_items_check
CHECK (private.tax_valid((tax_status)::text, tax_rate_bps));
-- quote_items_check1
CHECK (((line_total_vnd)::numeric = ((line_net_vnd)::numeric + (line_tax_vnd)::numeric)));
-- quote_items_check2
CHECK ((((basis = 'NET'::text) AND ((line_net_vnd)::numeric = ((unit_amount_vnd)::numeric * (quantity)::numeric))) OR ((basis = 'GROSS'::text) AND ((line_total_vnd)::numeric = ((unit_amount_vnd)::numeric * (quantity)::numeric)))));
-- quote_items_check3
CHECK ((((tax_status)::text <> ALL (ARRAY['exempt'::text, 'not_applicable'::text])) OR ((line_tax_vnd)::bigint = 0)));
-- quote_items_pkey
PRIMARY KEY (id);
-- quote_items_quantity_check
CHECK ((quantity > 0));
-- quote_items_quote_version_id_fkey
FOREIGN KEY (quote_version_id) REFERENCES app.quote_versions(id);
-- quote_items_unit_amount_vnd_check
CHECK (((unit_amount_vnd)::bigint > 0));
-- quote_items_variant_id_fkey
FOREIGN KEY (variant_id) REFERENCES app.product_variants(id);
```

Indexes:

```sql
CREATE UNIQUE INDEX quote_items_pkey ON app.quote_items USING btree (id)
CREATE INDEX quote_items_version ON app.quote_items USING btree (quote_version_id)
```

## app.quote_request_items

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| request_id | uuid | Có | — |
| variant_id | uuid | Không | — |
| requested_model | app.nonempty | Không | — |
| quantity | integer | Không | — |
| requirement_text | app.nonempty | Không | — |

Constraints:

```sql
-- quote_request_items_check
CHECK (((variant_id IS NOT NULL) OR (requested_model IS NOT NULL) OR (requirement_text IS NOT NULL)));
-- quote_request_items_check1
CHECK (((variant_id IS NULL) OR (quantity IS NOT NULL)));
-- quote_request_items_pkey
PRIMARY KEY (id);
-- quote_request_items_quantity_check
CHECK ((quantity > 0));
-- quote_request_items_request_id_fkey
FOREIGN KEY (request_id) REFERENCES app.quote_requests(id);
-- quote_request_items_variant_id_fkey
FOREIGN KEY (variant_id) REFERENCES app.product_variants(id);
-- rfq_items_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
```

Indexes:

```sql
CREATE UNIQUE INDEX quote_request_items_pkey ON app.quote_request_items USING btree (id)
CREATE UNIQUE INDEX rfq_unique_sku ON app.quote_request_items USING btree (request_id, variant_id) WHERE (variant_id IS NOT NULL)
```

## app.quote_requests

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| public_reference | app.nonempty | Có | — |
| name | app.nonempty | Có | — |
| phone | app.nonempty | Không | — |
| email | app.nonempty | Không | — |
| company | text | Không | — |
| need_text | text | Có | ''::text |
| destination | text | Không | — |
| needed_at | text | Không | — |
| status | text | Có | 'new'::text |
| assignee_id | uuid | Không | — |
| row_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- positive_row_version
CHECK ((row_version > 0));
-- quote_requests_assignee_id_fkey
FOREIGN KEY (assignee_id) REFERENCES app.admin_profiles(user_id);
-- quote_requests_check
CHECK (((phone IS NOT NULL) OR (email IS NOT NULL)));
-- quote_requests_email_check
CHECK (((email IS NULL) OR (length((email)::text) <= 254)));
-- quote_requests_pkey
PRIMARY KEY (id);
-- quote_requests_public_reference_key
UNIQUE (public_reference);
-- quote_requests_status_check
CHECK ((status = ANY (ARRAY['new'::text, 'reviewing'::text, 'quoted'::text, 'closed'::text, 'spam'::text])));
-- rfq_content_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
```

Indexes:

```sql
CREATE UNIQUE INDEX quote_requests_pkey ON app.quote_requests USING btree (id)
CREATE UNIQUE INDEX quote_requests_public_reference_key ON app.quote_requests USING btree (public_reference)
CREATE INDEX rfq_queue ON app.quote_requests USING btree (status, assignee_id, created_at, id)
```

## app.quote_versions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| quote_id | uuid | Có | — |
| version_no | integer | Có | — |
| policy_version_id | uuid | Không | — |
| valid_until | timestamp with time zone | Không | — |
| terms_snapshot | app."json_object" | Có | '{}'::jsonb |
| items_net_vnd | app.money_vnd | Không | — |
| items_tax_vnd | app.money_vnd | Không | — |
| shipping_net_vnd | app.money_vnd | Không | — |
| shipping_tax_vnd | app.money_vnd | Không | — |
| total_vnd | app.money_vnd | Không | — |
| content_status | text | Có | 'draft'::text |
| approved_by | uuid | Không | — |
| approved_at | timestamp with time zone | Không | — |
| sent_at | timestamp with time zone | Không | — |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- quote_versions_approved_by_fkey
FOREIGN KEY (approved_by) REFERENCES app.admin_profiles(user_id);
-- quote_versions_check
CHECK (((approved_by IS NULL) = (approved_at IS NULL)));
-- quote_versions_check1
CHECK ((num_nonnulls(items_net_vnd, items_tax_vnd, shipping_net_vnd, shipping_tax_vnd, total_vnd) = ANY (ARRAY[0, 5])));
-- quote_versions_check2
CHECK (((total_vnd)::numeric = ((((items_net_vnd)::numeric + (items_tax_vnd)::numeric) + (shipping_net_vnd)::numeric) + (shipping_tax_vnd)::numeric)));
-- quote_versions_check3
CHECK (((content_status = 'draft'::text) OR ((approved_at IS NOT NULL) AND (valid_until IS NOT NULL) AND (valid_until > created_at) AND (policy_version_id IS NOT NULL) AND (total_vnd IS NOT NULL))));
-- quote_versions_check4
CHECK (((content_status = 'sealed'::text) = (sent_at IS NOT NULL)));
-- quote_versions_content_status_check
CHECK ((content_status = ANY (ARRAY['draft'::text, 'approved'::text, 'sealed'::text])));
-- quote_versions_id_quote_id_key
UNIQUE (id, quote_id);
-- quote_versions_pkey
PRIMARY KEY (id);
-- quote_versions_policy_version_id_fkey
FOREIGN KEY (policy_version_id) REFERENCES app.commerce_policy_versions(id);
-- quote_versions_quote_id_fkey
FOREIGN KEY (quote_id) REFERENCES app.quotes(id);
-- quote_versions_quote_id_version_no_key
UNIQUE (quote_id, version_no);
-- quote_versions_version_no_check
CHECK ((version_no > 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX quote_versions_id_quote_id_key ON app.quote_versions USING btree (id, quote_id)
CREATE UNIQUE INDEX quote_versions_pkey ON app.quote_versions USING btree (id)
CREATE UNIQUE INDEX quote_versions_quote_id_version_no_key ON app.quote_versions USING btree (quote_id, version_no)
```

## app.quotes

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| request_id | uuid | Có | — |
| current_version_id | uuid | Không | — |
| status | text | Có | 'draft'::text |
| row_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- current_version_same_quote
FOREIGN KEY (current_version_id, id) REFERENCES app.quote_versions(id, quote_id);
-- positive_row_version
CHECK ((row_version > 0));
-- quotes_pkey
PRIMARY KEY (id);
-- quotes_request_id_fkey
FOREIGN KEY (request_id) REFERENCES app.quote_requests(id);
-- quotes_request_id_key
UNIQUE (request_id);
-- quotes_status_check
CHECK ((status = ANY (ARRAY['draft'::text, 'negotiating'::text, 'accepted'::text, 'declined'::text, 'expired'::text, 'converted'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX quotes_pkey ON app.quotes USING btree (id)
CREATE UNIQUE INDEX quotes_request_id_key ON app.quotes USING btree (request_id)
```

## app.return_items

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| case_id | uuid | Có | — |
| order_id | uuid | Có | — |
| order_item_id | uuid | Có | — |
| received_quantity | integer | Có | — |
| restocked_quantity | integer | Có | 0 |
| inspection_result | text | Không | — |
| received_at | timestamp with time zone | Không | — |
| restocked_at | timestamp with time zone | Không | — |

Constraints:

```sql
-- return_items_case_id_order_id_fkey
FOREIGN KEY (case_id, order_id) REFERENCES app.after_sales_cases(id, order_id);
-- return_items_case_id_order_item_id_key
UNIQUE (case_id, order_item_id);
-- return_items_check
CHECK (((restocked_quantity >= 0) AND (restocked_quantity <= received_quantity)));
-- return_items_check1
CHECK (((received_quantity = 0) OR (received_at IS NOT NULL)));
-- return_items_check2
CHECK (((restocked_quantity = 0) OR ((restocked_at IS NOT NULL) AND (inspection_result IS NOT NULL))));
-- return_items_order_item_id_order_id_fkey
FOREIGN KEY (order_item_id, order_id) REFERENCES app.order_items(id, order_id);
-- return_items_pkey
PRIMARY KEY (id);
-- return_items_received_quantity_check
CHECK ((received_quantity >= 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX return_items_case_id_order_item_id_key ON app.return_items USING btree (case_id, order_item_id)
CREATE UNIQUE INDEX return_items_pkey ON app.return_items USING btree (id)
CREATE INDEX return_order_line ON app.return_items USING btree (order_item_id)
```

## app.shipments

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| order_id | uuid | Có | — |
| status | text | Có | 'pending'::text |
| carrier | text | Không | — |
| tracking_reference | text | Không | — |
| dispatched_at | timestamp with time zone | Không | — |
| delivered_at | timestamp with time zone | Không | — |
| returned_at | timestamp with time zone | Không | — |
| row_version | bigint | Có | 1 |
| created_at | timestamp with time zone | Có | now() |
| updated_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- positive_row_version
CHECK ((row_version > 0));
-- shipments_check
CHECK (((status <> ALL (ARRAY['dispatched'::text, 'delivered'::text, 'failed'::text, 'returned'::text])) OR (dispatched_at IS NOT NULL)));
-- shipments_check1
CHECK (((status <> 'delivered'::text) OR (delivered_at IS NOT NULL)));
-- shipments_check2
CHECK (((status <> 'returned'::text) OR (returned_at IS NOT NULL)));
-- shipments_order_id_fkey
FOREIGN KEY (order_id) REFERENCES app.orders(id);
-- shipments_order_id_key
UNIQUE (order_id);
-- shipments_pkey
PRIMARY KEY (id);
-- shipments_status_check
CHECK ((status = ANY (ARRAY['pending'::text, 'dispatched'::text, 'delivered'::text, 'failed'::text, 'returned'::text, 'cancelled'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX shipments_order_id_key ON app.shipments USING btree (order_id)
CREATE UNIQUE INDEX shipments_pkey ON app.shipments USING btree (id)
```

## app.shipping_rules

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| policy_version_id | uuid | Có | — |
| zone_code | app.nonempty | Có | — |
| service_code | app.nonempty | Có | — |
| method_conditions | app."json_object" | Có | — |
| basis | text | Có | — |
| net_or_gross_fee_vnd | app.money_vnd | Có | — |
| tax_status | app.tax_status | Có | — |
| tax_rate_bps | integer | Không | — |
| priority | integer | Có | 0 |
| active | boolean | Có | false |

Constraints:

```sql
-- shipping_rules_basis_check
CHECK ((basis = ANY (ARRAY['NET'::text, 'GROSS'::text])));
-- shipping_rules_check
CHECK (private.tax_valid((tax_status)::text, tax_rate_bps));
-- shipping_rules_check1
CHECK (((NOT active) OR ((tax_status)::text <> 'unknown'::text)));
-- shipping_rules_pkey
PRIMARY KEY (id);
-- shipping_rules_policy_version_id_fkey
FOREIGN KEY (policy_version_id) REFERENCES app.commerce_policy_versions(id);
-- shipping_rules_policy_version_id_zone_code_service_code_pri_key
UNIQUE (policy_version_id, zone_code, service_code, priority);
```

Indexes:

```sql
CREATE UNIQUE INDEX shipping_rules_pkey ON app.shipping_rules USING btree (id)
CREATE UNIQUE INDEX shipping_rules_policy_version_id_zone_code_service_code_pri_key ON app.shipping_rules USING btree (policy_version_id, zone_code, service_code, priority)
```

## app.site_content

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| page_key | app.slug | Có | — |
| draft_content | app."json_object" | Có | '{}'::jsonb |
| approved_content | app."json_object" | Không | — |
| content_version | bigint | Có | 1 |
| effective_at | timestamp with time zone | Không | — |
| publication_status | text | Có | 'draft'::text |

Constraints:

```sql
-- site_content_check
CHECK (((publication_status <> 'published'::text) OR (approved_content IS NOT NULL)));
-- site_content_content_version_check
CHECK ((content_version > 0));
-- site_content_page_key_key
UNIQUE (page_key);
-- site_content_pkey
PRIMARY KEY (id);
-- site_content_publication_status_check
CHECK ((publication_status = ANY (ARRAY['draft'::text, 'published'::text, 'hidden'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX site_content_page_key_key ON app.site_content USING btree (page_key)
CREATE UNIQUE INDEX site_content_pkey ON app.site_content USING btree (id)
```

## app.specification_definitions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| code | app.slug | Có | — |
| label | app.nonempty | Có | — |
| data_type | text | Có | — |
| canonical_unit_code | app.nonempty | Không | — |
| group_code | app.slug | Có | — |
| status | text | Có | 'draft'::text |

Constraints:

```sql
-- specification_definitions_canonical_unit_code_fkey
FOREIGN KEY (canonical_unit_code) REFERENCES app.unit_definitions(code);
-- specification_definitions_check
CHECK (((canonical_unit_code IS NULL) OR (data_type = 'number'::text)));
-- specification_definitions_code_key
UNIQUE (code);
-- specification_definitions_data_type_check
CHECK ((data_type = ANY (ARRAY['number'::text, 'boolean'::text, 'text'::text, 'enum'::text, 'multi_enum'::text])));
-- specification_definitions_id_data_type_key
UNIQUE (id, data_type);
-- specification_definitions_pkey
PRIMARY KEY (id);
-- specification_definitions_status_check
CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX specification_definitions_code_key ON app.specification_definitions USING btree (code)
CREATE UNIQUE INDEX specification_definitions_id_data_type_key ON app.specification_definitions USING btree (id, data_type)
CREATE UNIQUE INDEX specification_definitions_pkey ON app.specification_definitions USING btree (id)
```

## app.specification_options

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| definition_id | uuid | Có | — |
| code | app.slug | Có | — |
| label | app.nonempty | Có | — |
| sort_order | integer | Có | 0 |
| status | text | Có | 'active'::text |

Constraints:

```sql
-- specification_options_definition_id_code_key
UNIQUE (definition_id, code);
-- specification_options_definition_id_fkey
FOREIGN KEY (definition_id) REFERENCES app.specification_definitions(id);
-- specification_options_id_definition_id_key
UNIQUE (id, definition_id);
-- specification_options_pkey
PRIMARY KEY (id);
-- specification_options_status_check
CHECK ((status = ANY (ARRAY['active'::text, 'archived'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX specification_options_definition_id_code_key ON app.specification_options USING btree (definition_id, code)
CREATE UNIQUE INDEX specification_options_id_definition_id_key ON app.specification_options USING btree (id, definition_id)
CREATE UNIQUE INDEX specification_options_pkey ON app.specification_options USING btree (id)
```

## app.stock_reservations

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| order_item_id | uuid | Có | — |
| variant_id | uuid | Có | — |
| quantity | integer | Có | — |
| state | text | Có | — |
| expires_at | timestamp with time zone | Không | — |
| allocated_at | timestamp with time zone | Không | — |
| released_at | timestamp with time zone | Không | — |
| consumed_at | timestamp with time zone | Không | — |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- reservation_counter_check
TRIGGER DEFERRABLE INITIALLY DEFERRED;
-- stock_reservations_check
CHECK (
CASE state
    WHEN 'active'::text THEN ((expires_at IS NOT NULL) AND (expires_at > created_at) AND (num_nonnulls(allocated_at, released_at, consumed_at) = 0))
    WHEN 'allocated'::text THEN ((expires_at IS NULL) AND (allocated_at IS NOT NULL) AND (released_at IS NULL) AND (consumed_at IS NULL))
    WHEN 'released'::text THEN ((released_at IS NOT NULL) AND (consumed_at IS NULL))
    WHEN 'consumed'::text THEN ((consumed_at IS NOT NULL) AND (allocated_at IS NOT NULL) AND (released_at IS NULL))
    ELSE false
END);
-- stock_reservations_order_item_id_key
UNIQUE (order_item_id);
-- stock_reservations_order_item_id_variant_id_quantity_fkey
FOREIGN KEY (order_item_id, variant_id, quantity) REFERENCES app.order_items(id, variant_id, quantity);
-- stock_reservations_pkey
PRIMARY KEY (id);
-- stock_reservations_quantity_check
CHECK ((quantity > 0));
-- stock_reservations_state_check
CHECK ((state = ANY (ARRAY['active'::text, 'allocated'::text, 'released'::text, 'consumed'::text])));
-- stock_reservations_variant_id_fkey
FOREIGN KEY (variant_id) REFERENCES app.inventory(variant_id);
```

Indexes:

```sql
CREATE INDEX reservation_expiry ON app.stock_reservations USING btree (expires_at, order_item_id) WHERE (state = 'active'::text)
CREATE INDEX reservation_inventory ON app.stock_reservations USING btree (variant_id, state)
CREATE UNIQUE INDEX stock_reservations_order_item_id_key ON app.stock_reservations USING btree (order_item_id)
CREATE UNIQUE INDEX stock_reservations_pkey ON app.stock_reservations USING btree (id)
```

## app.unit_definitions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| code | app.nonempty | Có | — |
| name | app.nonempty | Có | — |
| dimension | app.nonempty | Có | — |

Constraints:

```sql
-- unit_definitions_pkey
PRIMARY KEY (code);
```

Indexes:

```sql
CREATE UNIQUE INDEX unit_definitions_pkey ON app.unit_definitions USING btree (code)
```

## app.warranty_policies

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| code | app.slug | Có | — |
| name | app.nonempty | Có | — |
| status | text | Có | 'draft'::text |

Constraints:

```sql
-- warranty_policies_code_key
UNIQUE (code);
-- warranty_policies_pkey
PRIMARY KEY (id);
-- warranty_policies_status_check
CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])));
```

Indexes:

```sql
CREATE UNIQUE INDEX warranty_policies_code_key ON app.warranty_policies USING btree (code)
CREATE UNIQUE INDEX warranty_policies_pkey ON app.warranty_policies USING btree (id)
```

## app.warranty_policy_versions

RLS: bật.

| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |
|---|---|---|---|
| id | uuid | Có | gen_random_uuid() |
| policy_id | uuid | Có | — |
| version_no | integer | Có | — |
| duration_months | integer | Không | — |
| start_rule | app.nonempty | Có | — |
| provider_name | app.nonempty | Có | — |
| coverage | app.nonempty | Có | — |
| exclusions | text | Có | — |
| process | app.nonempty | Có | — |
| approved_by | uuid | Có | — |
| approved_at | timestamp with time zone | Có | — |
| effective_from | timestamp with time zone | Có | — |
| created_at | timestamp with time zone | Có | now() |

Constraints:

```sql
-- warranty_policy_versions_approved_by_fkey
FOREIGN KEY (approved_by) REFERENCES app.admin_profiles(user_id);
-- warranty_policy_versions_duration_months_check
CHECK ((duration_months >= 0));
-- warranty_policy_versions_pkey
PRIMARY KEY (id);
-- warranty_policy_versions_policy_id_fkey
FOREIGN KEY (policy_id) REFERENCES app.warranty_policies(id);
-- warranty_policy_versions_policy_id_version_no_key
UNIQUE (policy_id, version_no);
-- warranty_policy_versions_version_no_check
CHECK ((version_no > 0));
```

Indexes:

```sql
CREATE UNIQUE INDEX warranty_policy_versions_pkey ON app.warranty_policy_versions USING btree (id)
CREATE UNIQUE INDEX warranty_policy_versions_policy_id_version_no_key ON app.warranty_policy_versions USING btree (policy_id, version_no)
```
