# API — trạng thái đến module 08.1–08.2

Backend dùng Cloudflare Pages Functions và sẽ gọi Supabase Data API/RPC qua HTTPS theo [ARCHITECTURE.md](ARCHITECTURE.md). 08.1–08.2 chỉ chuẩn bị local/schema; **chưa thêm API nghiệp vụ hoặc kết nối database từ Functions**. Xem [bàn giao](docs/MODULE_08_1_2.md).

## Endpoint đang có

`GET /api/v1/health` → HTTP 200, JSON:

```json
{"status":"ok","scope":"starter","database":"not_configured"}
```

`database: not_configured` chỉ việc endpoint chưa có adapter/kết nối DB, không có nghĩa máy không có Supabase local. Endpoint không probe database và không chứng minh checkout hoạt động.

`HEAD /api/v1/health` → HTTP 200, không body. Phương thức khác → HTTP 405, `Allow: GET, HEAD`:

```json
{"error":{"code":"METHOD_NOT_ALLOWED","message":"Chỉ hỗ trợ GET và HEAD."}}
```

Đường dẫn API chưa triển khai → HTTP 404:

```json
{"error":{"code":"NOT_FOUND","message":"API này chưa tồn tại."}}
```

## Supabase local ở giai đoạn này

`http://127.0.0.1:54321/rest/v1/` chỉ expose schema `api` rỗng. Không có endpoint thương hiệu, sản phẩm, đơn hoặc báo giá để frontend sử dụng. Schema `app` và `private` không expose; requests chọn những schema này bị PostgREST từ chối. Public signup tắt. Không dùng secret key để mở quyền trực tiếp trong quá trình thử.

## Hợp đồng sẽ viết theo module tiếp theo

08.3 xác định JWT/admin, guest context, CSRF/gateway và lỗi quyền. 08.4–08.6 đặc tả DTO catalog/search/filter/compare. 08.7–08.8 đặc tả checkout/order, tiền VND dạng chuỗi, server-authoritative pricing, transaction/idempotency/unknown-result và quyền xem đơn. 08.9 xử lý RFQ; 08.10 admin/upload. Chưa có request/response giả cho những endpoint chưa tồn tại. Frontend vẫn ghi DEMO và khóa submit thật.
