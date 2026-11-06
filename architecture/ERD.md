# ERD — Quan hệ dữ liệu

Giai đoạn 05, cập nhật 08.2: đã tạo 52 bảng trên Supabase local. Chi tiết thực tế ở [SCHEMA.md](../supabase/SCHEMA.md), thiết kế ở [DATABASE.md](../DATABASE.md), quyền nền ở [SECURITY.md](SECURITY.md). Các sơ đồ chia theo miền để đọc được, không phải nhiều database tách rời.

Ký hiệu Mermaid: `||` đúng một, `o|` không hoặc một, `o{` không hoặc nhiều, `|{` một hoặc nhiều. Một số bảng hiển thị lại giữa sơ đồ để nối miền. Audit/idempotency có tham chiếu đa loại được kiểm soát trong RPC; không giả rằng chuỗi entity_id là FK SQL tới mọi bảng.

## 1. Sản phẩm, danh mục, giá và bảo hành

```mermaid
erDiagram
    brands ||--o{ products : owns
    product_types ||--o{ products : classifies
    categories o|--o{ categories : parent
    product_types o|--o{ categories : constrains
    products ||--o{ product_categories : membership
    categories ||--o{ product_categories : contains
    categories ||--o{ products : primary_category
    products ||--|{ product_variants : sells_as
    product_variants ||--o{ price_versions : has_versions
    warranty_policies ||--o{ warranty_policy_versions : versions
    warranty_policy_versions o|--o{ product_variants : applies
    products ||--o{ product_images : displays
    product_variants o|--o{ product_images : scope
    products ||--o{ product_documents : documents
    product_variants o|--o{ product_documents : scope
    media_assets ||--o{ product_images : image_file
    media_assets ||--o{ product_documents : document_file
    media_assets o|--o{ brands : logo
    product_variants ||--o| catalog_search_documents : projection
    products {
        uuid id PK
        uuid brand_id FK
        uuid product_type_id FK
        uuid primary_category_id FK
        text publication_status
        text lifecycle_status
    }
    product_variants {
        uuid id PK
        uuid product_id FK
        text sku_normalized UK
        uuid current_price_id FK
        uuid warranty_version_id FK
        text lifecycle_status
    }
    price_versions {
        uuid id PK
        uuid variant_id FK
        bigint amount_vnd
        text basis
        text tax_status
    }
```

`current_price_id` trỏ một price_version của chính SKU, được FK kép bảo vệ; sơ đồ chỉ vẽ cạnh sở hữu để tránh vòng khó đọc. Warranty có thể chưa gắn ở draft, nhưng publish/checkout cần điều kiện tương ứng. Product phải có ít nhất một SKU ở lúc publish; cardinality minimum này được kiểm bằng publication gate.

## 2. Thuộc tính nhiều ngành

```mermaid
erDiagram
    product_types ||--o{ product_type_specifications : defines_schema
    specification_definitions ||--o{ product_type_specifications : usable_in
    unit_definitions o|--o{ specification_definitions : canonical_unit
    specification_definitions ||--o{ specification_options : enumerates
    product_variants ||--o{ product_specifications : values
    product_type_specifications ||--o{ product_specifications : permits
    product_specifications ||--o{ product_specification_options : selected_values
    specification_options ||--o{ product_specification_options : selected_option
    specification_options o|--o{ product_specifications : single_option
    media_assets o|--o{ product_specifications : evidence
    specification_definitions {
        uuid id PK
        text code UK
        text data_type
        text canonical_unit_code FK
    }
    product_specifications {
        uuid variant_id PK,FK
        uuid definition_id PK,FK
        uuid product_type_id FK
        text data_type FK
        text value_status
        numeric value_number
        boolean value_boolean
        text value_text
        uuid option_id FK
    }
    product_specification_options {
        uuid variant_id PK,FK
        uuid definition_id PK,FK
        uuid option_id PK,FK
    }
```

FK kép xác thực type/SKU/definition. Các cột typed là lựa chọn có điều kiện, không có nghĩa mỗi hàng chứa đồng thời mọi kiểu. Unknown/not-applicable/not-supported không mang giá trị giả. Multi-enum có child rows; scalar có XOR constraint theo kiểu.

## 3. Đơn, tồn, tiền và sau bán

```mermaid
erDiagram
    commerce_policy_versions ||--o{ shipping_rules : rules
    commerce_policy_versions ||--o{ orders : snapshot_basis
    orders ||--|| order_contacts : private_contact
    orders ||--|{ order_items : contains
    product_variants ||--o{ order_items : references
    warranty_policy_versions ||--o{ order_items : agreed_warranty
    product_variants ||--o| inventory : one_pool
    order_items ||--|| stock_reservations : one_reservation
    product_variants ||--o{ stock_reservations : reserves
    product_variants ||--o{ inventory_movements : ledger
    order_items o|--o{ inventory_movements : order_source
    orders ||--o| shipments : single_shipment
    orders ||--o{ payment_entries : financial_ledger
    payment_entries o|--o| payment_entries : reversal_of
    media_assets o|--o{ payment_entries : private_evidence
    orders ||--o{ after_sales_cases : after_sales
    after_sales_cases ||--o{ return_items : received_items
    order_items ||--o{ return_items : return_source
    return_items o|--o{ inventory_movements : restock_source
    inventory {
        uuid variant_id PK,FK
        integer on_hand
        integer reserved
        bigint version
    }
    orders {
        uuid id PK
        text public_reference UK
        uuid quote_id FK,UK
        uuid quote_version_id FK
        text order_status
        bigint total_vnd
    }
    stock_reservations {
        uuid id PK
        uuid order_item_id FK,UK
        uuid variant_id FK
        integer quantity
        text state
        timestamptz expires_at
    }
```

Inventory có thể chưa tồn tại cho draft SKU; SKU được bán phải có inventory row hợp lệ. Reservation được tạo cùng order item; khi hết hạn/hủy/xuất vẫn giữ hàng lịch sử ở state released/consumed, không xóa để tạo lại. Payment và stock không đồng nghĩa: refund không tự restock.

## 4. RFQ, báo giá và chuyển đơn

```mermaid
erDiagram
    quote_requests ||--o{ quote_request_items : requested_lines
    product_variants o|--o{ quote_request_items : optional_known_sku
    quote_requests ||--o| quotes : quotation_family
    quotes ||--o{ quote_versions : version_history
    commerce_policy_versions ||--o{ quote_versions : terms_basis
    quote_versions ||--|{ quote_items : priced_lines
    product_variants o|--o{ quote_items : mapped_sku
    quote_versions ||--o| quote_acceptances : acceptance
    media_assets o|--o{ quote_acceptances : evidence
    quotes ||--o{ quote_events : event_history
    quote_versions o|--o{ quote_events : version_event
    quotes o|--o| orders : converts_once
    quote_versions o|--o| orders : chosen_version
    quotes {
        uuid id PK
        uuid request_id FK,UK
        uuid current_version_id FK
        uuid converted_order_id FK,UK
    }
    quote_versions {
        uuid id PK
        uuid quote_id FK
        integer version_no
        text content_status
        timestamptz valid_until
        timestamptz sent_at
    }
```

Version có ít nhất một priced line khi gửi/chuyển, draft có thể chưa đủ. `current_version_id` phải thuộc root. Ghi accepted không sửa nội dung sealed; convert chỉ khi tất cả dòng đã map SKU hợp lệ. Hai chiều liên kết quote/order là consistency invariant kiểm trong transaction; có thể triển khai một FK có thẩm quyền và một view thay cột dư nếu review implementation cho thấy ít rủi ro hơn, nhưng unique một root → một order phải giữ.

## 5. Admin, guest và hạ tầng dữ liệu

```mermaid
erDiagram
    auth_users ||--o| admin_profiles : staff_identity
    admin_profiles ||--o{ admin_user_roles : assignments
    admin_roles ||--o{ admin_user_roles : role
    admin_roles ||--o{ admin_role_permissions : permissions
    permission_definitions ||--o{ admin_role_permissions : capability
    guest_sessions ||--o{ guest_order_grants : scoped_access
    orders ||--o{ guest_order_grants : order_access
    orders ||--o{ order_access_tokens : capability_links
    order_access_tokens o|--o{ guest_order_grants : exchanged_from
    admin_profiles o|--o{ audit_events : actor_when_admin
    admin_profiles o|--o{ publication_revisions : requested_by
    guest_sessions {
        uuid id PK
        text token_hash UK
        text csrf_hash
        timestamptz expires_at
        timestamptz revoked_at
    }
    order_access_tokens {
        uuid id PK
        uuid order_id FK
        text token_hash UK
        text scope
        timestamptz expires_at
    }
    idempotency_records {
        uuid id PK
        text actor_scope
        text operation
        uuid key
        text request_hash
        uuid resource_id
    }
    abuse_counters {
        text action PK
        text bucket_key_hash PK
        timestamptz window_start PK
        integer count
    }
    site_content {
        uuid id PK
        text page_key UK
        bigint content_version
        text publication_status
    }
    operation_runs {
        uuid id PK
        text operation_type
        text status
        timestamptz started_at
    }
```

`auth_users` là biểu diễn `auth.users` do Supabase quản lý, không tạo bảng thay thế. Guest session không tham gia Auth/account và không có quyền tự sửa/hủy đơn. Bảng idempotency liên kết kết quả bằng loại resource + ID và actor scope server xác định; invariants được kiểm trong RPC. `site_content`, `operation_runs`, `abuse_counters` không cần FK giả chỉ để nối hình.

Các sơ đồ đã đối chiếu tên bảng với data dictionary. 08.2 đã chạy migrations và test referential integrity trên PostgreSQL local. Quan hệ chuyển quote dùng `orders.quote_id` làm nguồn duy nhất, không tạo cột ngược dư `quotes.converted_order_id`. Các cardinality ở thời điểm publish/checkout và chuyển trạng thái còn cần RPC theo [phạm vi bàn giao](../docs/MODULE_08_1_2.md).
