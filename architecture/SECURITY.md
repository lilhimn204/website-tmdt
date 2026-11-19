# Bảo mật — module 08.4

Cập nhật 19/11/2026. Đã có Auth/MFA, staff permissions, RLS, mutation cấp quyền, gateway và public brand/category reads. Chưa là security sign-off production. [Vận hành Auth](../docs/MODULE_08_3.md), [public catalog](../docs/MODULE_08_4.md), [API](../API.md).

## Public reads 08.4

Chỉ bốn hàm public_brands/public_brand/public_categories/public_category được cấp EXECUTE cho anon. Các hàm SECURITY DEFINER do postgres sở hữu **bypass table RLS một cách có giới hạn** để trả projection id/name/slug và các trường công khai đã liệt kê trong API; không coi RLS staff là bộ lọc của đường đọc này. SQL kiểm status=active, active ancestors và active technical type; private helper đi từ gốc công khai, không cho đọc nháp qua URL con. Không đổi grants/SELECT/DML/schema exposure của anon. Helper nội bộ không có EXECUTE cho API roles.

Public Pages adapter chỉ dùng publishable key + gateway; không chuyển tiếp token/cookie của người gọi, không dùng service secret. RPC whitelist, limit tối đa 100, slug tối đa 160, query whitelist/không trùng; SQL kiểm lại. Không nhận tên bảng/cột/SQL từ client. Cả hai bên kiểm cursor trong tập công khai và cùng parent. DTO bỏ trường không allowlist, payload upstream tối đa 256 KiB, timeout 8 giây, redirect manual rồi chặn 3xx, lỗi chuẩn hóa không rò chẩn đoán. Responses no-store; giữ cơ chế gateway. Chưa có WAF/rate limiter phân tán hoặc cache invalidation cho public deployment.

## Ranh giới tin cậy

1. Browser dùng access token Auth; không chứa service secret/gateway. UI đăng nhập/MFA chưa làm trong module backend này.
2. Pages xác minh bearer qua Auth /user trước khi đọc claims; kiểm sub/iss/aud/exp/nbf/role/session_id/aal. Không decode JWT đơn thuần làm xác thực. HTTPS online; HTTP local chỉ localhost/127.0.0.1.
3. Pages gọi RPC bằng publishable key và **chính JWT người dùng**, không đổi thành service role. Gateway chỉ ở .dev.vars/Cloudflare secret; DB giữ SHA-256. JWT định danh người gọi; gateway xác nhận đường qua server; cần cả hai.
4. is_active_admin kiểm aal2, profile active, role active, Auth user confirmed/không anonymous/deleted/banned, session còn tồn tại/chưa hết hạn, factor của session/user còn verified. has_permission đọc assignment sống; user_metadata không là nguồn quyền.
5. 52 bảng app bật RLS, restrictive policy active_mfa_session trên tất cả. ACL và permissive SELECT giới hạn dữ liệu đọc. Không permissive write policy hoặc DML/TRUNCATE grant cho API roles.

## Vai trò

| Vai trò | Permission codes | Đọc qua RLS hiện tại |
|---|---|---|
| Owner | Cả 23 mã quyền | Catalog, inventory, order summary, mọi RFQ, staff profiles/assignments |
| Catalog | catalog.read/write/publish, pricing.write, inventory.read, content.write, media.write | Catalog, inventory |
| Sales | catalog.read, inventory.read, orders.read/process/contact.read, quotes.read/write | Catalog, inventory, order summary, RFQ chưa phân công hoặc giao cho mình |
| Warehouse | catalog.read, inventory.read/adjust, orders.read, fulfillment.write | Catalog, inventory, order summary |
| Finance | orders.read, finance.read/record/refund | Order summary |
| Support | catalog.read, orders.read, support.read/write | Catalog, order summary |

Mọi staff hợp lệ đọc được định nghĩa vai trò/quyền và profile/assignment của mình. **Mã quyền ghi chỉ là điều kiện cho API tương lai**, không cấp quyền ghi SQL. Finance chưa có API ledger. Order summary chỉ gồm id/public_reference/source/order_status/payment_status_cache/created_at/row_version; SELECT * bị từ chối. RFQ chứa contact nên scope theo người phụ trách; child items theo RLS parent. Raw order contacts, access tokens, ledger, media, audit bị ACL chặn kể cả JWT Owner. Guest chưa có đường đọc đơn; mã đơn không đủ quyền.

## Definer, bootstrap và toàn vẹn

- Allowlist definer: is_active_admin, has_permission, require_gateway, set_admin_access, keep_last_owner và bốn public catalog RPC ở trên. Cố định search_path=pg_catalog, tên schema đầy đủ, không dynamic SQL theo input. Predicate Auth chỉ kiểm chính auth.uid(); public RPC chỉ trả projection trạng thái công khai.
- keep_last_owner là deferred trigger, cần definer vì chạy sau khi RPC thoát definer. Không API role nào có EXECUTE trực tiếp. Migration bổ sung sửa lỗi này mà không mở đọc bảng nội bộ.
- Bootstrap là invoker/operator-only, một lần, target đã confirmed, có reason/audit; không EXECUTE ứng dụng. Migrations/signup không tự tạo Owner.
- Cấp quyền cần security.manage, MFA, version, whitelist roles/reason; serialize trên admin_control_state; kiểm quyền lại sau khóa; profile/assignments/audit cùng transaction. Thu hồi Owner cuối cùng rollback ở commit. PostgreSQL superuser có thể thay DDL nên không phải tài khoản ứng dụng.
- Guard Owner bảo vệ trạng thái profile/vai trò; không ngăn operator quản lý Auth ban/xóa tài khoản hoặc người dùng mất thiết bị MFA. Các tình huống đó cần quy trình khôi phục, không có cam kết luôn còn phiên Owner đăng nhập được.
- authz_version tăng khi sửa profile/assignments; dùng chống ghi đè, không cache quyền theo token. Migration thay role-permission áp dụng ngay dù profile version không đổi.
- Audit không ghi token/password/body; có actor, before/after active/roles và reason. Reason do operator nhập, **không có lọc PII tự động**; không nhập thông tin khách/secret.
- Default privileges không tự cấp table/EXECUTE. service_role có BYPASSRLS nền tảng nhưng bị app ACL chặn; Pages Auth adapter không dùng service credential.

## HTTP và vận hành

POST cần Origin chính xác, bearer, JSON tối đa 4 KiB. Không cookie auth/query token/CORS public. Upstream timeout 8 giây, redirect=manual và từ chối 3xx để không chuyển credential sang host khác; lỗi chuẩn hóa; response no-store. workerd không hỗ trợ redirect=error dù TypeScript/Node chấp nhận; dùng theo [Cloudflare Request](https://developers.cloudflare.com/workers/runtime-apis/request/). Supabase Auth có rate limit nền tảng; bước xác minh chuyển lỗi 429. **Chưa có rate limiter phân tán riêng của Pages/WAF hoặc Turnstile**; cần cấu hình/kiểm thử trước public rollout và API khách 08.7–08.9. Body limit không thay cho chống spam.

Gateway chỉ áp dụng PostgREST, không Auth/Storage. Signup/anonymous local tắt; chưa có bucket/upload policy. config.toml không tự cấu hình project hosted. Đổi khóa/phục hồi MFA xem runbook 08.3.

Docker public ports bind loopback. CLI credentials chỉ đọc trong memory; .dev.vars/.temp/artifacts/test credentials không vào Git/ZIP. pgTAP rollback fixtures; HTTP integration dùng project riêng và xóa riêng stack thử. Không reset database ứng dụng.

## Còn phải làm trước production

Guest scoped access/CSRF cho checkout; atomic stock/order/idempotency; anti-spam/limits; Storage policies/signed URLs; quyền từng business DTO; UI đăng nhập/MFA/recovery; monitoring redacted; backup/restore diễn tập; RPO/RTO/retention được doanh nghiệp chốt. Không giả định Free tier có backup/timeout session của gói trả phí.

Nguồn chính thức: [getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [MFA](https://supabase.com/docs/guides/auth/auth-mfa), [sessions](https://supabase.com/docs/guides/auth/sessions), [grants/RLS và pre-request hook](https://supabase.com/docs/guides/api/securing-your-api). Kiểm soát cụ thể phải được xác nhận bằng test repo, không chỉ dựa vào tài liệu.
