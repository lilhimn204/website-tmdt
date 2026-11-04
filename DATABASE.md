# DATABASE — Mô hình PostgreSQL và tính toàn vẹn

Giai đoạn 05 · 04/11/2026 · **Thiết kế để duyệt; chưa có DDL, migrations hoặc database được tạo**.

Đọc cùng [ARCHITECTURE](ARCHITECTURE.md), [ERD](architecture/ERD.md), [SECURITY](architecture/SECURITY.md) và [API](API.md). Các biểu thức constraint/index trong tài liệu là đặc tả, không phải script SQL có thể chạy.

## 1. Quy ước

- Bảng nghiệp vụ nằm trong schema `app`; tên bảng snake_case. UUID cho ID nội bộ; mã đơn/yêu cầu có unique riêng nhưng không là credential truy cập.
- ID/currency/code là dữ liệu có kiểm tra, không tin chuỗi do frontend gửi. `created_at`, `updated_at` dùng `timestamptz`, clock database UTC; UI trình bày theo múi giờ đã chọn. Người sửa dùng FK admin nếu phù hợp, actor hệ thống ghi riêng.
- Tiền VND lưu `bigint` số đồng, truyền API dạng chuỗi thập phân; không dùng float. Các tỷ lệ thuế lưu basis points nguyên, chỉ do doanh nghiệp duyệt. Giá/tax unknown khác 0/exempt.
- Số lượng hàng nguyên không âm; số lượng mua >0. Thuộc tính kỹ thuật có thể là `numeric(20,6)` tùy miền, không dùng kiểu tiền cho công suất/dung lượng.
- Bản ghi có thể chỉnh sửa có `row_version bigint` để optimistic concurrency. Snapshot đơn và phiên bản đã phát hành không sửa nội dung thương mại sau chốt.
- Không xóa cứng SKU/brand/policy đã được giao dịch tham chiếu. FK lịch sử dùng RESTRICT; xóa/tối thiểu hóa PII theo retention đã duyệt, không cascade xóa sổ tiền/kho.
- Trường chưa nêu optional được xem là bắt buộc khi bản ghi ở trạng thái hiệu lực. Draft có thể thiếu dữ liệu nhưng publish/checkout phải qua validation chặt hơn.

## 2. Catalog và thuộc tính

| Mã / bảng | Cột quan trọng | Quan hệ và quy tắc |
|---|---|---|
| DB01 `brands` | id, name, slug, status, logo_asset_id?, description, row_version | Slug unique; tên/logo có quyền sử dụng; archived không xóa lịch sử |
| DB02 `categories` | id, parent_id?, name, slug, product_type_id?, status, sort_order | Parent self-FK; slug unique toàn namespace; cấm chu trình; nhóm cha có thể chưa gắn type |
| DB03 `product_types` | id, code, name, status | Loại kỹ thuật như UPS, printer, RAM, SSD; khác cây điều hướng |
| DB04 `products` | id, brand_id, product_type_id, primary_category_id, name, slug, model_family?, description, publication_status, lifecycle_status, lifecycle_reason?, row_version | Một type chính; publication draft/published/hidden; lifecycle active/discontinued/eol tách biệt |
| DB05 `product_categories` | product_id, category_id | PK kép; quan hệ nhiều-nhiều; danh mục chính phải có trong membership; type phù hợp khi category ràng buộc type |
| DB06 `product_variants` | id, product_id, product_type_id, sku, sku_normalized, model, model_normalized, variant_label, sales_mode, lifecycle_status, data_status, current_price_id?, warranty_version_id?, row_version | SKU normalized unique toàn website; ít nhất 1 SKU kể cả sản phẩm không có tùy chọn; current_price phải thuộc chính SKU |
| DB07 `unit_definitions` | code, name, dimension | Đơn vị chuẩn: W khác VA, mm khác inch; tập đơn vị do kỹ thuật duyệt; không chuyển đổi tự động khi chưa có rule |
| DB08 `specification_definitions` | id, code, label, data_type, canonical_unit_code?, group_code, status | code unique; type number/boolean/text/enum/multi_enum; đổi kiểu có migration, không sửa phá dữ liệu |
| DB09 `product_type_specifications` | product_type_id, definition_id, required_for_publish, filterable, comparable, display_order, min_value?, max_value? | PK(type, definition); xác định thuộc tính hợp lệ theo ngành và cách trình bày |
| DB10 `specification_options` | id, definition_id, code, label, sort_order, status | Unique(definition, code), unique(id, definition); enum ổn định dùng code, không dùng nhãn làm khóa |
| DB11 `product_specifications` | variant_id, product_type_id, definition_id, data_type, value_status, value_number?, value_boolean?, value_text?, option_id?, source_asset_id?, source_note?, verified_by?, verified_at? | PK(variant, definition); FK sang SKU/type, type-definition và definition/type; đúng một kiểu giá trị khi known, trừ multi_enum dùng bảng con |
| DB12 `product_specification_options` | variant_id, definition_id, option_id | PK cả ba; parent FK về DB11; option phải thuộc đúng definition; chỉ dùng cho multi_enum known |
| DB13 `price_versions` | id, variant_id, version_no, basis, amount_vnd, tax_status, tax_rate_bps?, approved_by, approved_at, created_at | Unique(variant, version), unique(id, variant); basis NET/GROSS; immutable sau duyệt; published retail amount >0 |
| DB14 `warranty_policies` | id, code, name, status | Nhóm chính sách độc lập với model; code unique |
| DB15 `warranty_policy_versions` | id, policy_id, version_no, duration_months?, start_rule, provider_name, coverage, exclusions, process, approved_at, effective_from | Unique(policy, version); immutable; không mặc định cùng thời hạn cho mọi SKU |
| DB16 `media_assets` | id, bucket, object_key, sha256?, mime, byte_size?, width?, height?, state, visibility, rights_note, approved_by?, created_by, expires_at? | Unique(bucket, object_key); pending/staged/approved/rejected/deleting; bytes ở Storage, DB chỉ metadata |
| DB17 `product_images` | id, product_id, variant_id?, asset_id, alt_text, sort_order, is_primary | Variant nếu có phải thuộc product; asset phải là ảnh đã duyệt trước publish; primary tối đa một cho mỗi scope |
| DB18 `product_documents` | id, product_id, variant_id?, asset_id, title, language, revision?, model_scope, status | Tài liệu đúng model/revision; variant thuộc product; không công bố file private |
| DB19 `catalog_search_documents` | variant_id, product_id, search_text_normalized, search_vector, source_revision | Projection có thể tái tạo; không là nguồn giá/tồn/quyền; đồng bộ transaction khi đổi dữ liệu liên quan |

### 2.1. Vì sao không dùng một cột JSON cho toàn bộ thông số

Các thuộc tính cần lọc/so sánh được typed tại SKU. Ví dụ: UPS dùng `rated_va` và `rated_w` khác nhau; RAM có `memory_generation`, `capacity_gb`, `form_factor`; SSD có form factor và protocol riêng; switch có cổng/tốc độ/PoE budget. Thêm ngành mới chủ yếu là thêm type/definition/options, không thêm hàng chục cột vào products.

Không có kế thừa giá trị ngầm từ product sang variant trong MVP. Admin có thể áp dụng một giá trị cho nhiều SKU nhưng phải ghi các hàng cụ thể trong cùng giao dịch, giúp bộ lọc không bỏ sót override. Mô tả chung ở products; thông số dùng để quyết định mua phải xác định được SKU nào chịu trách nhiệm.

`value_status`: known, unknown, not_applicable, not_supported. Unknown không biến thành boolean false, 0 hoặc enum “khác”. Known numeric không kèm unit tùy ý: đơn vị lấy từ definition; source_note giữ cách diễn đạt gốc/điều kiện đo. Runtime UPS theo tải nhiều điểm có thể nằm trong tài liệu/bảng mô tả có nguồn; chưa tạo máy tính runtime.

Với multi_enum (ví dụ print/scan/copy hoặc USB/LAN/Wi-Fi), DB11 có status/type, DB12 chứa options. Known phải có ≥1 option; enum đơn dùng option_id. Text chỉ dùng khi nội dung khó chuẩn hóa và không cần range filter. JSON được dùng cho snapshot đơn/nội dung điều kiện/cấu hình có schema validation, không thay các cột money, quantity, FK hoặc filter typed.

### 2.2. Tìm kiếm và lọc

1. Chuẩn hóa Unicode, khoảng trắng, case; SKU/model vẫn giữ dạng hiển thị nguyên bản. Quy tắc bỏ dấu tiếng Việt áp dụng search, không sửa định danh hoặc nội dung nguồn.
2. Ưu tiên exact SKU/model normalized; kế đến prefix có index, tên và tên hãng trong search document. `simple` full-text configuration và chuẩn hóa được kiểm chứng bằng bộ từ khóa tiếng Việt; không tuyên bố PostgreSQL có stemming tiếng Việt hoàn hảo.
3. Filter: AND giữa definitions; OR giữa lựa chọn trong cùng definition; range numeric trên canonical unit. Truy vấn bằng EXISTS theo từng thuộc tính để tránh nhân hàng khi join multi_enum.
4. Cả bộ lọc, sort và count cùng áp dụng publication/lifecycle visibility. Không loại EOL khỏi search nếu vẫn công khai, nhưng tuyệt đối không tính là SKU được mua.
5. Sort allowlist và tie-breaker ổn định theo ID; giới hạn page/offset. MVP chưa cần vector search, Elasticsearch hoặc fuzzy AI; chỉ thêm index phức tạp khi EXPLAIN thực tế chỉ ra nhu cầu.

## 3. Tồn, cấu hình và đơn hàng

| Mã / bảng | Cột quan trọng | Quan hệ và quy tắc |
|---|---|---|
| DB20 `inventory` | variant_id PK, on_hand, reserved, version, updated_at | Một pool/SKU; `0 <= reserved <= on_hand`; available tính ra, không cho client ghi |
| DB21 `commerce_policy_versions` | id, version_no, status, cod_hold_seconds?, transfer_hold_seconds?, tax_rule_version, terms_version, bank_instruction_version?, rules_json, approved_by?, approved_at? | Draft thiếu giá trị được; active phải đủ tham số cần bán, nội dung đã duyệt immutable |
| DB22 `shipping_rules` | id, policy_version_id, zone_code, service_code, method_conditions, net_or_gross_fee_vnd, tax_status, tax_rate_bps?, priority, active | Mọi giá trị/địa bàn phải được duyệt; nếu nhiều rule cùng khớp không chọn tùy tiện; không khớp thì không checkout |
| DB23 `orders` | id, public_reference, source, quote_id?, quote_version_id?, policy_version_id, order_status, payment_status_cache, items_net_vnd, items_tax_vnd, shipping_net_vnd, shipping_tax_vnd, total_vnd, currency, flags, row_version, created_at | Source retail/quote; quote_id unique khi có; tổng có constraint; cache payment chỉ do RPC cập nhật và đối soát được |
| DB24 `order_contacts` | order_id PK, name, phone, email?, delivery_address, billing_details?, delivery_note?, retention_until? | Tách PII khỏi danh sách và public DTO; JSON address/billing có schema/version, không trả nguyên khối cho guest |
| DB25 `order_items` | id, order_id, variant_id, quantity, unit_amount_vnd, basis, tax_rate_bps?, tax_status, line_net_vnd, line_tax_vnd, line_total_vnd, product_snapshot, warranty_version_id, warranty_snapshot | Snapshot tên/model/SKU/đơn vị/biến thể, điều kiện bảo hành và thông số quyết định; FK SKU RESTRICT; immutable commercial content |
| DB26 `stock_reservations` | id, order_item_id UNIQUE, variant_id, quantity, state, expires_at?, allocated_at?, released_at?, consumed_at? | state active/allocated/released/consumed; active có TTL; allocated đã tiếp nhận xử lý/đủ tiền thì không tự timeout như giỏ |
| DB27 `inventory_movements` | id, variant_id, operation_id, source_line_key, movement_kind, delta_on_hand, delta_reserved, order_item_id?, return_item_id?, actor_id?, reason, created_at | UNIQUE(operation_id, variant_id, movement_kind, source_line_key); source_line_key bắt buộc, lấy ID dòng nguồn hoặc ID SKU cho điều chỉnh; append-only |
| DB28 `shipments` | id, order_id UNIQUE, status, carrier?, tracking_reference?, dispatched_at?, delivered_at?, returned_at?, row_version | Một lần giao/đơn; pending/dispatched/delivered/failed/returned/cancelled; không chia giao MVP |
| DB29 `payment_entries` | id, order_id, kind, amount_vnd, channel, external_reference?, evidence_asset_id?, reversal_of_id?, operation_id, actor_id, recorded_at, note | kind receipt/refund/reversal; số tiền >0; đã thực hiện ngoài hệ thống; append-only; không ghi lời hứa thanh toán như receipt |
| DB30 `after_sales_cases` | id, order_id, type, reason, status, requested_refund_vnd?, assignee_id?, resolution, created_at, closed_at? | Return/warranty/refund inquiry cơ bản; yêu cầu hoàn không phải tiền đã hoàn |
| DB31 `return_items` | id, case_id, order_item_id, received_quantity, restocked_quantity, inspection_result, received_at?, restocked_at? | Quantity không vượt lượng giao trừ đã nhận trả trước; chỉ phần được kiểm tra đạt mới cộng tồn; độc lập refund |

### 3.1. Tiền và thuế

Thiết kế hỗ trợ giá NET hoặc GROSS để doanh nghiệp chốt cách nhập. Không điền thuế suất pháp lý mặc định. Tax status known taxable / exempt / not_applicable / unknown; trạng thái unknown không đủ điều kiện nhận đơn.

- NET: line_net = unit_amount × quantity; line_tax = làm tròn số đồng theo tax rule đã duyệt; line_total = net + tax.
- GROSS: line_total = unit_amount × quantity; tách tax/net bằng tax rule đã duyệt, giữ đẳng thức net + tax = total.
- Đề xuất kỹ thuật là làm tròn half-up trên từng dòng đối với giá trị không âm, rồi cộng; **chờ D05**, không khẳng định đây là quy tắc kế toán/pháp lý của doanh nghiệp. Shipping tính riêng theo cùng policy version.
- Không có discount/promo trong MVP. Tổng order = tổng line_net + tổng line_tax + shipping_net + shipping_tax. Giá hiển thị một chiếc có thể không nhân chính xác ra tổng tax khi rule làm tròn theo dòng; checkout phải trình bày tổng xác nhận từ server.
- API gửi expected fingerprint/total chỉ để phát hiện thay đổi; không dùng giá client làm giá có thẩm quyền. B2B lấy giá từ quote version đã duyệt và được khách chấp thuận.

### 3.2. State machine nghiệp vụ

| Đối tượng | Chuyển trạng thái chính | Điều kiện |
|---|---|---|
| Order | pending_review → confirmed → processing → completed | Sales xác nhận, kho thực hiện; completed chỉ sau delivered và đủ tiền đã đối soát theo rule |
| Order chưa xuất | pending_review/confirmed → cancelled | Giải phóng active/allocated đúng một lần; nếu có tiền thì phát sinh việc cần hoàn, chưa tự hoàn |
| Order chờ hết hạn | pending_review → expired | Hold active quá hạn, không được nâng thành allocated trước hạn; partial money thành exception |
| Reservation | active → allocated | COD được Sales chấp nhận đúng hạn hoặc chuyển khoản đủ tiền được xác nhận đúng hạn; vẫn cần điều kiện order trước xuất |
| Reservation | active/allocated → released | Hủy trước xuất hoặc active hết hạn; chỉ giảm reserved |
| Reservation | allocated → consumed | Xuất một lần: giảm cả on_hand và reserved |
| Shipment | pending → dispatched → delivered/failed/returned | Chuyển khoản chưa đủ tiền không dispatch; COD đủ điều kiện có thể dispatch trước receipt |
| Payment | Tính từ ledger | unpaid/partial/paid/partially_refunded/refunded; overpayment/late_payment là exception riêng, không tự xác nhận đơn |

Order sau dispatch không dùng thao tác hủy trước xuất để cộng kho. Giao thất bại/đã trả đi qua nhận hàng kiểm tra và ghi ledger tồn; refund là luồng độc lập. Order đã completed có thể có after-sales/refund mà không sửa ngược lịch sử hoàn tất. Không tự giữ hàng vô thời hạn khi xác nhận bằng thao tác giả: allocated có hàng chờ vận hành và cảnh báo thời gian xử lý riêng.

Tiền nhận sau expires_at vẫn phải được ghi nhận thực tế; không đổi expired thành confirmed, không tự tạo lại hold. Nhân viên xử lý/hoàn hoặc lập giao dịch mới có sự đồng ý của khách và kiểm tra lại tồn.

## 4. RFQ và báo giá có phiên bản

| Mã / bảng | Cột quan trọng | Quy tắc |
|---|---|---|
| DB32 `quote_requests` | id, public_reference, name, phone?, email?, company?, need_text, destination?, needed_at?, status, assignee_id?, row_version | Tên + ít nhất một kênh liên hệ + nhu cầu; RFQ không cần đăng ký; dữ liệu riêng |
| DB33 `quote_request_items` | id, request_id, variant_id?, requested_model?, quantity?, requirement_text? | SKU đã biết hoặc mô tả tự do; quantity nếu có >0; không chứa giá chính thức |
| DB34 `quotes` | id, request_id UNIQUE, current_version_id?, status, converted_order_id? UNIQUE, row_version | Một họ báo giá cho một RFQ trong MVP, nhiều phiên bản thương lượng; root chống chuyển lại |
| DB35 `quote_versions` | id, quote_id, version_no, policy_version_id, valid_until, terms_snapshot, totals, content_status, approved_by?, approved_at?, sent_at? | Unique(quote, version); draft/approved/sealed; sent đóng băng nội dung; expiry không làm sửa payload đã gửi |
| DB36 `quote_items` | id, quote_version_id, variant_id?, label_snapshot, quantity, basis, unit_amount_vnd, tax_status, tax_rate_bps?, line_net_vnd, line_tax_vnd, line_total_vnd, warranty_snapshot | Draft có dòng chưa map SKU; **chuyển đơn bắt buộc mọi dòng có SKU hợp lệ**; đổi mapping sau gửi cần phiên bản mới và xác nhận lại |
| DB37 `quote_acceptances` | id, quote_version_id UNIQUE, recorded_by, accepted_at, channel, evidence_asset_id?, evidence_note | Nhân viên ghi nhận đồng ý ngoài hệ thống theo quyền; không có portal ký/chấp thuận online MVP |
| DB38 `quote_events` | id, quote_id, version_id?, event_type, actor_id, occurred_at, note | Append-only: trao đổi, duyệt, gửi, từ chối, hết hiệu lực, chuyển đơn; không lưu raw secrets |

RFQ → draft quote → duyệt giá/điều kiện → seal khi gửi → ghi nhận chấp thuận → kiểm tra hiệu lực/SKU/EOL/tồn/địa chỉ/phương thức → một order. Chỉ bước cuối thay đổi inventory. Khi giá catalog đã đổi, quote price đã duyệt có thể vẫn có hiệu lực theo terms; không tự thay quote price bằng giá retail. Thay đổi điều kiện đã chấp thuận yêu cầu phiên bản mới.

`orders.quote_id` unique chặn tạo đơn thứ hai từ cùng họ báo giá bằng một version khác. Version_id/order source phải khớp quote root. Order hủy không xóa liên kết để chuyển lại; nhu cầu mua lại phải là giao dịch mới được ghi rõ.

## 5. Quyền, phiên guest và vận hành

| Mã / bảng | Cột quan trọng | Quy tắc |
|---|---|---|
| DB39 `admin_profiles` | user_id PK FK auth.users, display_name, active, authz_version, created_at | Không tự tạo quyền từ signup; khóa nhân viên có hiệu lực qua lookup DB ở mỗi thao tác |
| DB40 `admin_roles` | id, code UNIQUE, name, status | Owner/catalog/sales/warehouse/finance/support là cấu hình vai trò, không Postgres roles |
| DB41 `permission_definitions` | code PK, description | Danh sách permission cố định được migration/quản lý có kiểm soát |
| DB42 `admin_role_permissions` | role_id, permission_code | PK kép, FK; không client tự gán |
| DB43 `admin_user_roles` | user_id, role_id, granted_by, granted_at | PK kép; kiểm soát không vô hiệu hóa Owner cuối cùng ngoài quy trình khẩn cấp |
| DB44 `guest_sessions` | id, token_hash UNIQUE, csrf_hash, created_at, expires_at, revoked_at? | Cookie ngẫu nhiên; chỉ hash trong DB; không là tài khoản khách; hạn dùng chờ D07 |
| DB45 `guest_order_grants` | session_id, order_id, source_token_id?, expires_at, revoked_at? | PK(session, order); grant được tạo cùng order hoặc từ token hợp lệ; chỉ có quyền view_masked |
| DB46 `order_access_tokens` | id, order_id, token_hash UNIQUE, scope, expires_at, revoked_at?, created_at | Opaque 256-bit ngẫu nhiên; chỉ scope view_masked; source_token liên kết grant để revoke theo nguồn |
| DB47 `idempotency_records` | id, actor_scope, operation, key, request_hash, resource_type, resource_id, response_code, created_at, replay_until | Unique(actor_scope, operation, key); response lưu tham chiếu/kết quả không secret; không giữ toàn bộ PII request |
| DB48 `abuse_counters` | bucket_key_hash, action, window_start, count, expires_at | PK(action, hash, window); tăng atomic; HMAC IP/session bằng key xoay; không là bộ khóa tồn |
| DB49 `audit_events` | id, actor_type, actor_id?, action, entity_type, entity_id, request_id, redacted_change, occurred_at | Append-only; không audit raw cookie/JWT/link token, mật khẩu hoặc bank credential |
| DB50 `publication_revisions` | id, revision_no, created_at, state, requested_by?, deployment_ref?, published_at?, error_code? | Gom yêu cầu phát hành catalog; không dùng làm hàng đợi đơn/tiền; không lưu deploy hook URL |
| DB51 `site_content` | id, page_key UNIQUE, draft_content, approved_content, content_version, effective_at?, publication_status | Giới thiệu/liên hệ/chính sách cơ bản; không thêm CMS bài viết C13 |
| DB52 `operation_runs` | id, operation_type, started_at, finished_at?, status, counts, error_code? | Hết hạn/đối soát/publication/backup receipt metadata; heartbeat và kết quả, không chứa dump/secrets |

Các bảng phụ này xử lý yêu cầu sẵn có của MVP: lưu lịch sử, quyền, chống trùng, hết hạn và phục hồi. Không phải 52 màn hình admin hoặc 52 tính năng mới. Không tạo bảng customer accounts hay marketplace ở MVP.

## 6. Constraints cần có trong migration

PostgreSQL CHECK phù hợp quy tắc trên một hàng; không dùng CHECK truy vấn bảng khác để giả kiểm tra tổng/quan hệ. Quy tắc liên hàng dùng FK, UNIQUE, deferred constraint trigger hoặc RPC khóa đúng đối tượng. Nguồn: [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).

| ID | Constraint / cơ chế cần triển khai | Mục đích |
|---|---|---|
| CON01 | PK/FK mọi quan hệ ở ERD; indexes cho FK truy vấn/xóa thường xuyên | Không bản ghi mồ côi |
| CON02 | UNIQUE slug brand/category/product; UNIQUE sku_normalized; không tái dùng SKU lịch sử | Tránh URL/định danh mơ hồ |
| CON03 | Categories parent ≠ id và trigger kiểm tra ancestor với khóa điều phối cây | Cấm chu trình khi hai admin đổi parent đồng thời |
| CON04 | FK variants(product_id, product_type_id) → products(id, product_type_id), unique cặp đích | SKU không có type khác product |
| CON05 | FK specs(variant_id,type_id), FK(type_id,definition_id), FK(definition_id,data_type) | Chỉ thông số hợp lệ cho type; kiểu dữ liệu đúng |
| CON06 | CHECK XOR các cột typed theo data_type/value_status; options FK đúng definition; deferred trigger cho multi_enum | Không lưu số vào text để lọc, không enum sai nhóm |
| CON07 | Numeric bounds và đơn vị/range theo định nghĩa kiểm trong RPC/trigger publish | Không đưa dữ liệu vượt miền thành thông số thật |
| CON08 | CHECK on_hand≥0, reserved≥0, reserved≤on_hand; quantity>0 | Không bán âm tồn |
| CON09 | Reservation UNIQUE(order_item_id), quantity/SKU khớp item; active có expires_at, allocated không có expiry tự động | Một hold cho mỗi dòng, state không mâu thuẫn |
| CON10 | Deferred invariant: reserved = tổng quantity active+allocated cho SKU bị tác động | Counter và ledger giữ hàng nhất quán; index giúp kiểm trong transaction |
| CON11 | Giá/line/tổng không âm; retail amount>0; tax status/rate phù hợp; line_net+line_tax=line_total | Tiền có kiểu chính xác; unknown không là exempt |
| CON12 | Deferred invariant tổng items = order totals, cộng phí đúng; same currency VND | Không order có tổng sai |
| CON13 | Price pointer FK(id,variant_id); warranty version đã approved; quote/version root khớp | Chặn gắn giá/bảo hành sai đối tượng |
| CON14 | UNIQUE(actor_scope,operation,key), request_hash bất biến; bound actor không do client quyết định | Chống lặp và đánh cắp replay |
| CON15 | UNIQUE orders.quote_id WHERE NOT NULL; UNIQUE(quote_id,version_no); quote_acceptance đúng version | Một họ báo giá → tối đa một order |
| CON16 | UNIQUE payments(channel,external_reference) khi có reference đáng tin; UNIQUE reversal_of_id khi có; operation unique theo sự kiện | Chứng từ không ghi tiền hai lần, correction không xóa lịch sử |
| CON17 | Khóa order khi ghi payment; tổng refund không vượt receipt hợp lệ còn lại, reversal làm sai refund bị chặn | Giới hạn liên hàng không thực hiện bằng CHECK đơn giản |
| CON18 | UNIQUE shipment.order_id; quantity nhận trả cộng dồn≤đã dispatch; restocked≤received | Một lần giao và không cộng tồn trả hai lần |
| CON19 | Snapshot/sealed versions/ledger/audit immutable; phép chuyển state allowlist trong RPC | Không sửa lịch sử bằng UPDATE tùy ý |
| CON20 | Images/documents variant thuộc product qua FK kép hoặc constraint trigger; primary partial unique theo product/variant scope | File không gắn sai SKU hoặc nhiều ảnh chính |
| CON21 | Session/token hash unique, expires_at>created_at; grant order/source hợp lệ; credential revoke kiểm mỗi read | Quyền riêng không từ mã đơn |
| CON22 | Publication gate kiểm brand/category/type/price-policy/assets/specs; EOL/discontinued chặn create_order/convert_quote | Publish và sell là hai điều kiện riêng |

Các CON có trigger phải được thử đồng thời, không chỉ chạy kiểm tra form admin. Direct DML từ roles ứng dụng bị thu hồi; việc sửa SQL bằng Owner là thao tác vận hành đặc quyền phải theo runbook và audit.

## 7. Indexes dự kiến

| ID | Bảng / index | Truy vấn phục vụ |
|---|---|---|
| IDX01 | Unique B-tree slug và sku_normalized; B-tree model_normalized | Exact lookup URL/SKU/model |
| IDX02 | Prefix indexes normalized SKU/model theo operator class/collation được kiểm tra | Search prefix, không quét toàn bảng tùy ý |
| IDX03 | GIN catalog_search_documents.search_vector; B-tree product_id | Search tên/hãng; rebuild khi đổi tên hãng |
| IDX04 | products(publication_status, brand_id, product_type_id, id); product_categories(category_id,product_id) | Collection/filter chung |
| IDX05 | specs(definition_id,value_number,variant_id) partial known/number | Range filter công suất/dung lượng |
| IDX06 | specs(definition_id,option_id,variant_id) partial enum; spec_options(definition_id,option_id,variant_id) | Enum/multi_enum filter |
| IDX07 | specs(definition_id,value_boolean,variant_id) partial known/boolean | Bộ lọc true/false chính xác |
| IDX08 | reservations(state,expires_at,order_item_id) partial active; reservations(variant_id,state) | Cron và đối soát reserved |
| IDX09 | orders(order_status,created_at,id); orders(source,created_at,id) | Hàng chờ và báo cáo phân trang |
| IDX10 | order_items(order_id), payments(order_id,recorded_at), movements(variant_id,created_at) | Chi tiết và đối soát |
| IDX11 | quote_requests(status,assignee_id,created_at,id); versions(quote_id,version_no) | Hàng chờ B2B |
| IDX12 | guest/token hash unique; grants(order_id); idempotency unique scope/key; replay_until | Quyền truy cập/retry và cleanup |
| IDX13 | audit(entity_type,entity_id,occurred_at); operation_runs(type,started_at) | Truy vết vận hành |
| IDX14 | RLS helper user_roles(user_id,role_id), role_permissions(role_id,permission_code) | Kiểm tra quyền thường xuyên |

Không tạo index riêng cho mọi field trong JSON. GIN/text index, lịch sử audit/idempotency và file metadata đều tốn quota 500 MB; đo EXPLAIN và kích thước thật trước bổ sung. Chưa có kết quả benchmark. NFR05 hiện dùng bộ thử 500 SKU/10 người dùng đồng thời, không phải dự báo doanh nghiệp.

## 8. Giao dịch tạo đơn và chống trùng

### TX01 — Preview

Nhận SKU/quantity, địa chỉ, phương thức; lấy current price/version/policy, tính phí/thuế/tổng; trả fingerprint của dữ liệu đã chuẩn hóa và các revision thương mại. Không insert order, không giữ hàng. Fingerprint là token phát hiện stale data, không là chứng cứ được mua hoặc giá được tin; create RPC luôn tính lại. Dữ liệu địa chỉ/tổng không đưa vào URL.

### TX02 — Create order, một POST RPC

1. BFF xác minh phiên guest trước đó, CSRF/origin, payload, chống spam. Actor scope lấy từ phiên đã xác minh, không lấy từ body.
2. Trong RPC, insert idempotency row theo unique key. Nếu trùng, chờ giao dịch kia kết thúc; hash giống → trả resource cũ với quyền hiện hành, hash khác → conflict. Nếu giao dịch trước rollback thì retry có thể tiến hành; không có đơn nửa vời.
3. Chuẩn hóa/gộp SKU lặp để một dòng/SKU, áp giới hạn quantity/line count, kiểm tra policy active. Khóa product rồi variant theo ID tăng dần bằng khóa đọc bảo vệ thay đổi EOL/giá/pointer; mọi admin mutation liên quan cũng dùng khóa tương thích.
4. Lấy giá hiện hành và policy đã khóa; kiểm tra published/data-ready/active, warranty, thuế, vùng/phí, COD điều kiện; tính tổng lại. Fingerprint hoặc nội dung thương mại khác preview → 409, chưa tạo đơn; khách phải rà soát và dùng submission mới.
5. Khóa inventory tất cả SKU theo ID tăng dần. Kiểm tra available≥quantity **sau khi có khóa**. Không dùng cached stock hoặc câu SELECT bên ngoài transaction làm quyết định.
6. Insert order, contacts, item snapshots, active reservations với expires_at tính bằng clock DB và TTL policy; tăng reserved, ghi inventory movement/audit, tạo guest_order_grant, ghi idempotency result trong cùng transaction.
7. Nếu bất kỳ bước nào lỗi, rollback toàn bộ. Sau commit mới trả mã đơn và trạng thái tiếp nhận. Không gọi email/Storage/HTTP bên ngoài trong transaction.

PostgREST transaction bao trùm một request; không BEGIN ở request A rồi COMMIT ở request B. [Nguồn PostgREST](https://docs.postgrest.org/en/stable/references/transactions.html).

### TX03 — Retry, timeout, cửa sổ replay

- Client tạo UUID cho một ý định submit, giữ key khi retry; key mới chỉ khi khách sửa nội dung/rà soát thành ý định mới. Key không là mật khẩu xem đơn.
- Request hash dùng dữ liệu chuẩn hóa gồm items, địa chỉ/liên hệ, phương thức, fingerprint/phiên bản điều khoản. Không gồm Turnstile token, CSRF token hoặc correlation ID vốn thay đổi giữa các lần thử.
- Timeout HTTP có thể xảy ra sau commit. `GET operations/{operation}/{key}` cùng session chỉ trả kết quả thuộc scope; nếu chưa tìm thấy vẫn có thể đang chạy, retry **cùng key**, không lập đơn mới ngay.
- Với result đã commit, lấy lại sau xác minh phiên/quyền, không bắt xác minh lại Turnstile single-use rồi làm mất kết quả. Với thao tác chưa commit, dùng challenge mới khi token đã hết hạn/đã dùng; vẫn giữ idempotency key.
- Không lưu raw link token trong idempotency response. Grant cùng phiên đã tạo atomic, cho lấy mã đơn và phát hành link xem riêng sau đó.
- `replay_until` phải được chốt cùng retention; giữ tombstone unique gắn đơn trong suốt thời gian cho phép replay. Key hết hạn bị từ chối và hướng kiểm tra/hỗ trợ, không silently tái dùng để tạo đơn thứ hai. Cleanup không xóa khóa của đơn còn active.

### TX04 — Lock order thống nhất

Thứ tự chung: idempotency → quote root nếu có → order hiện hữu nếu có → policy/product/variant theo ID → inventory theo variant ID → reservations/ledger liên quan. Order mới chưa có cạnh tranh trước insert. Không giữ inventory rồi quay sang khóa order khác. Cron lấy từng order hoặc batch nhỏ; không quét giữ khóa trên hàng nghìn order trước khi khóa inventory.

EOL/đổi giá phải khóa cùng parent/variant row mà create/convert đọc có khóa; transaction nào commit trước xác định điểm hiệu lực. Đơn đã commit trước EOL vẫn giữ snapshot; đơn bắt đầu kiểm tra sau EOL bị từ chối. Giá version immutable và pointer chỉ thay dưới khóa.

Dùng PostgreSQL READ COMMITTED + khóa tường minh/unique/constraints cho các luồng đã mô tả; không tuyên bố SERIALIZABLE tự giải quyết mọi retry. Deadlock/lock timeout có thể xảy ra: rollback và retry giới hạn cùng key, không retry vô hạn. Nguồn cơ chế: [PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html).

### TX05 — Expiry, xác nhận, tiền và xuất kho

- pg_cron đề xuất mỗi phút gọi hàm nội bộ expire_holds, batch nhỏ có giới hạn; ghi operation_runs. Lịch này không thay TTL của doanh nghiệp.
- Lock order trước, rồi inventory/reservations theo quy tắc chung. Kiểm tra thời gian thực DB **sau khi lấy khóa**; không dùng thời gian client hoặc chỉ transaction start time nếu request đã phải chờ lâu.
- Nếu active quá expires_at: giảm reserved một lần, chuyển hold released, order expired nếu điều kiện cho phép. `active → allocated` chỉ hợp lệ trước hạn và theo điều kiện COD/đủ tiền; cron không giải phóng allocated.
- Nhận tiền và cron tranh nhau cùng order lock. Tiền đến sau hạn được ghi receipt + late_payment exception; không tự giữ lại hàng. Partial money trước hạn chưa đủ để allocated theo đề xuất; hết hạn vẫn giải phóng và mở việc xử lý tiền.
- Cron chậm chỉ làm available bị bảo thủ thấp hơn, không bán vượt. Trước confirm/pay/ship, RPC vẫn kiểm tra expires_at, không tin cron đã chạy. Admin có lệnh reconcile/expire quyền hẹp, dùng cùng hàm idempotent.
- Ship kiểm tra order confirmed/processing, không cancelled/expired, allocated đủ từng dòng, tiền đủ nếu bank transfer; cập nhật on_hand/reserved/movements/shipment một lần trong transaction. COD có thể ship trước tiền nếu policy cho phép.
- Không thực hiện “lấy tồn rồi UPDATE số mới” từ JS; các cập nhật counter có điều kiện và row lock trong DB.

### TX06 — Báo giá, hoàn tiền, nhận trả

- Convert quote khóa root trước; nếu đã có order trả cùng order theo quyền, không tạo mới dù key/version khác. Bản accepted/sealed còn hiệu lực, SKU mapping đủ, EOL/stock/shipping/terms hợp lệ mới tạo order+hold+snapshot+link atomic; giá dùng phiên bản đã duyệt.
- Payment/refund khóa order; external reference unique ngăn cùng chứng từ ghi ở hai đơn. Không có reference thì yêu cầu operation key + bằng chứng/lý do theo quy trình; không tự phát minh reference ngân hàng.
- Refund thực tế không vượt số receipt còn có thể hoàn. Ghi sai được điều chỉnh qua reversal có quyền/lý do và kiểm tra cân đối, không DELETE ledger; nếu reversal làm refund vượt receipt thì chặn để xử lý điều chỉnh hợp lệ.
- Nhận trả khóa order/return source và inventory; tổng nhận/restock không vượt đã giao. Chỉ delta restock mới cộng on_hand. Chấp thuận case/refund không cộng tồn; cộng tồn không khẳng định đã hoàn tiền.

## 9. Kế hoạch migrations — chỉ thiết kế

| Mã | Nhóm migration tương lai | Kiểm tra bắt buộc |
|---|---|---|
| MIG01 | Schemas, revoke defaults, extensions cần dùng, roles/grants nền | app/private không exposed; API không default public execute |
| MIG02 | Catalog/type/units/spec definitions/options/values | Type/enum/FK/cycle/unknown; dữ liệu nhiều ngành |
| MIG03 | Media metadata, warranty/price versions, policy/shipping/content | Snapshot/version immutability; chưa có rule thì checkout off |
| MIG04 | Orders/items/contacts/inventory/reservations/movements/shipment | Tổng tiền/counter, khóa và FK lịch sử |
| MIG05 | RFQ/quote versions/acceptance/events, payments/returns | One quote→order; refund/return giới hạn |
| MIG06 | Admin roles/permissions, guest sessions/grants/tokens, idempotency/abuse/audit | Cross-user denied, secret hash, quyền theo action |
| MIG07 | RPC read/write, deferred constraints, gateway hook/RLS/Storage policies | Public/guest/admin/service direct-access negative tests |
| MIG08 | Search projections/indexes, publication/operation_runs, cron | Rebuild projection, bounded jobs, đối soát |
| MIG09 | Reference seeds chỉ code/quyền/đơn vị/definitions đã duyệt; kiểm soát quyền cuối | Không seed giá/tồn/khách giả vào production |

Migrations versioned trong Git ở giai đoạn sau; không sửa lại file đã áp dụng production. Thứ tự FK vòng price pointer/current quote version xử lý bằng tạo bảng trước rồi thêm FK trong migration phù hợp. Mỗi migration có validation và kế hoạch rollback/forward-fix; không coi rollback ứng dụng là rollback dữ liệu.

Áp dụng expand → migrate/backfill → verify → contract ở lần phát hành sau. Migration destructive cần backup đã kiểm chứng và kế hoạch phục hồi. Index concurrently nếu cần tránh khóa dài phải là bước riêng ngoài transaction bao migration phù hợp PostgreSQL; kiểm tra index invalid và quyền thực tế. Chưa sinh file `.sql`, chưa chạy migration hoặc SQL trực tiếp.
