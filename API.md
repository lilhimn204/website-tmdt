# API — trạng thái module 08.3

Cập nhật 19/11/2026. Cloudflare Pages Functions có health và ba endpoint Auth quản trị. Chưa có API sản phẩm, giỏ, checkout, đơn, RFQ hoặc upload. Frontend vẫn DEMO và khóa gửi đơn/báo giá thật.

## Health

`GET /api/v1/health` trả 200: `{"status":"ok","scope":"starter","database":"not_configured"}`. HEAD trả 200 không body; phương thức khác trả 405, Allow: GET, HEAD. Đây chỉ là health bộ khung; không probe Supabase hoặc xác nhận giao dịch hoạt động.

Đường dẫn chưa triển khai trả 404: `{"error":{"code":"NOT_FOUND","message":"API này chưa tồn tại."}}`.

## Quy tắc chung cho admin

- Cùng origin với website; HTTPS khi online. Local mặc định http://127.0.0.1:8788.
- `Authorization: Bearer <access_token>` từ Supabase Auth. Không nhận token qua cookie, query hoặc body. Không gửi refresh token vào ba endpoint này.
- Pages gọi Auth `/user` xác minh chính bearer đó trước khi kiểm claims. Database kiểm profile/role/session/factor sống; không lấy quyền từ metadata.
- POST bắt buộc Origin đúng APP_ORIGIN. GET cho phép không có Origin nhưng từ chối Origin sai. Không mở CORS; từ chối Sec-Fetch-Site: cross-site.
- POST JSON tối đa 4096 byte, không body nén hoặc query string. Response no-store; không trả token, email Auth, gateway hoặc lỗi SQL thô.
- Chưa cung cấp UI đăng nhập/MFA/nhân sự. Mật khẩu và TOTP gửi trực tiếp tới Supabase Auth bằng SDK/API chính thức; backend không lưu mật khẩu.

## GET /api/v1/admin/session

Không body. HTTP 200, ví dụ cấu trúc (UUID/tên/version chỉ minh họa):

```json
{"data":{"user_id":"00000000-0000-0000-0000-000000000001","display_name":"Nhân sự mẫu","authz_version":"2","roles":["sales"],"permissions":["catalog.read","inventory.read","orders.contact.read","orders.process","orders.read","quotes.read","quotes.write"]}}
```

Chỉ trả chính người đăng nhập. Version là chuỗi bigint, client không tự cộng/trừ hoặc đoán. Quyền đọc lại mỗi request, không cache theo JWT cũ.

## POST /api/v1/admin/access

Chỉ Owner có security.manage, phiên MFA sống. Đúng bảy trường; không nhận trường ngoài hợp đồng:

```json
{
  "user_id":"00000000-0000-0000-0000-000000000002",
  "display_name":"Nhân sự mẫu",
  "roles":["sales"],
  "active":true,
  "expected_version":"0",
  "reason":"Phân công nhân sự đã được duyệt",
  "request_id":"00000000-0000-0000-0000-000000000003"
}
```

- Target phải là Auth user đã xác nhận, không anonymous/deleted/banned. Endpoint không tự tạo tài khoản.
- display_name: 1–100 ký tự sau trim; reason: 3–500, không nhập secret hoặc thông tin khách.
- roles: tập duy nhất từ owner/catalog/sales/warehouse/finance/support, tối đa 6. Active cần ít nhất một vai trò. Đây là thay toàn bộ tập vai trò.
- expected_version: "0" cho profile chưa tồn tại; nếu có, lấy version tin cậy hiện tại. Chưa có API liệt kê nhân sự; operator local xem profile trong Studio. Không expose bảng public để lấy version.
- request_id: UUID liên kết audit, **không phải idempotency key**. Gửi lại với version cũ bị 409. Nếu mất response, đọc trạng thái/version/audit trước khi quyết định gửi lại.

200 trả `{"data":{"user_id":"00000000-0000-0000-0000-000000000002","active":true,"roles":["sales"],"authz_version":"2"}}` (version phụ thuộc lịch sử). Một transaction thực hiện kiểm quyền, CAS version, profile, assignments và audit. Hàng khóa chung tuần tự hóa thay quyền; kiểm quyền lại sau chờ khóa. Deferred trigger bảo vệ ít nhất một Owner hoạt động có security.manage, kể cả request đồng thời.

## POST /api/v1/admin/logout

Không body hoặc JSON {}. Chấp nhận bearer hợp lệ ở aal1 để người chưa MFA cũng thoát được. Gọi Supabase logout scope=local; thành công trả **204 không body**, không giả thành công khi Auth lỗi. Không đăng xuất các phiên khác. Phiên vừa xóa không vượt qua kiểm tra auth.sessions dù JWT chưa hết hạn.

## Lỗi admin

Body: `{"error":{"code":"MFA_REQUIRED","message":"Cần xác thực MFA trước khi truy cập quản trị."}}`.

| HTTP | Code | Cách xử lý |
|---|---|---|
| 400 | INVALID_ACCESS_INPUT | Kiểm tra trường, query, JSON và kiểu dữ liệu |
| 401 | UNAUTHENTICATED | Đăng nhập lại; có WWW-Authenticate: Bearer |
| 403 | MFA_REQUIRED | Hoàn tất TOTP challenge/verify, dùng token aal2 mới |
| 403 | FORBIDDEN | Thiếu quyền, bị vô hiệu hóa hoặc session/factor hết hiệu lực |
| 403 | ORIGIN_NOT_ALLOWED | Dùng origin đúng, không mở CORS tùy tiện |
| 405 | METHOD_NOT_ALLOWED | Dùng phương thức trong Allow |
| 409 | ACCESS_VERSION_CONFLICT | Đọc lại trạng thái/version |
| 409 | LAST_OWNER_REQUIRED | Giữ ít nhất một Owner hoạt động |
| 413 | PAYLOAD_TOO_LARGE | Vượt 4096 byte hoặc Content-Length sai |
| 415 | UNSUPPORTED_MEDIA_TYPE | Dùng JSON, không Content-Encoding |
| 429 | TOO_MANY_REQUESTS | Auth đang rate limit; chờ rồi thử lại |
| 503 | AUTH_NOT_CONFIGURED | Operator kiểm tra bindings/gateway hash |
| 503 | AUTH_UNAVAILABLE | Không xác nhận thay đổi thành công; kiểm tra trạng thái |

## Supabase bên trong

Data API chỉ expose api, có admin_context() và set_admin_access(...). Chỉ authenticated có EXECUTE; không cấp anon/service_role. Pages dùng publishable key + JWT người dùng + X-Data-Api-Gateway. Pre-request hook so hash server-only. Thiếu/sai gateway → 403 GATEWAY_REQUIRED; không tắt hook để sửa kết nối. app/private/public không expose. Hook không áp dụng Auth/Storage.

08.4–08.10 đặc tả DTO/nghiệp vụ riêng. Quyền guest xem đơn, giá/tồn server-side, transaction giữ hàng, idempotency checkout, chống spam khách và Storage signed URL chưa làm ở 08.3. Xem [bảo mật](architecture/SECURITY.md), [hướng dẫn](docs/MODULE_08_3.md).
