# Bàn giao 08.4 — API thương hiệu và danh mục

Ngày 19/11/2026. Thực hiện yêu cầu “tiếp task tiếp theo” sau 08.3; chỉ làm module 08.4. Chưa triển khai 08.5–08.10 hoặc CRUD quản trị. Các chức năng 08.3 vẫn được kiểm thử lại.

## 1. Phạm vi và tiêu chí

| Mã | Hành vi đã thực hiện | Liên hệ yêu cầu |
|---|---|---|
| CAT04.1 | List/detail thương hiệu active; nháp/archived/không có cùng 404 | C01.1, không lộ nháp |
| CAT04.2 | Danh mục gốc/con trực tiếp, type và breadcrumb; mọi tổ tiên/type phải active | C01, sitemap mở rộng |
| CAT04.3 | Limit 1–100, cursor thuộc tập công khai/cùng parent, thứ tự xác định | C01.2 khi dữ liệu không đổi |
| CAT04.4 | Empty thật khác lỗi kết nối/cấu hình; không trả dữ liệu DEMO làm kết quả DB | C01.3 |
| CAT04.5 | Publishable key + gateway, không forward JWT/cookie, không mở raw-table ACL | Kiến trúc public read |
| CAT04.6 | GET/HEAD, lỗi JSON/no-store, input validation ở BFF và SQL | API/security |

Đường dẫn: `/api/v1/brands`, `/api/v1/brands/{slug}`, `/api/v1/categories`, `/api/v1/categories/{slug}`. Hợp đồng query/request/response/lỗi đầy đủ ở [API.md](../API.md). Không có giá, tồn, quyền phân phối hoặc số lượng SKU tự tạo. Active chỉ là trạng thái công bố metadata.

Database ứng dụng chưa có thương hiệu/danh mục thật nên list trả rỗng. Frontend 07 vẫn dùng fixture DEMO, chưa nối API trong module này. Chưa thêm logo/media URL, tìm kiếm sản phẩm, CRUD admin hoặc dữ liệu nguồn XTREND. Tạo/sửa danh mục A02 tiếp tục ở 08.10; không coi API đọc là hoàn thành chức năng quản trị đó.

Theo phương pháp Spec Kit đang dùng: mã yêu cầu → hợp đồng → implementation → test → checklist. Không thay giao diện nên không phát sinh thiết kế Impeccable mới. Không cài/nâng phiên bản các bộ công cụ này.

## 2. Mã nguồn đầy đủ

Các liên kết mở nguyên tệp trong repo. Không cần tự ghép các đoạn code vào tệp cũ.

| Tệp | Tạo/sửa và mục đích |
|---|---|
| [public_brands_categories.sql](../supabase/migrations/20261119000200_public_brands_categories.sql) | Tạo: bốn public RPC, helper cây/validation, hai partial indexes |
| [catalog_query_validation.sql](../supabase/migrations/20261119000300_catalog_query_validation.sql) | Tạo: qualify tham số parent và volatility đúng, giữ migration đã áp dụng |
| [handler.ts](../server/catalog/handler.ts) | Tạo: BFF query/response validation, HTTP/error handling |
| [types.ts](../server/catalog/types.ts) | Tạo: DTO và slug contract |
| [brands/index.ts](../functions/api/v1/brands/index.ts) | Tạo: route list brands |
| [brands/[slug].ts](../functions/api/v1/brands/[slug].ts) | Tạo: route brand detail |
| [categories/index.ts](../functions/api/v1/categories/index.ts) | Tạo: route list categories |
| [categories/[slug].ts](../functions/api/v1/categories/[slug].ts) | Tạo: route category detail |
| [public-catalog.test.ts](../tests/public-catalog.test.ts) | Tạo: 64 unit tests |
| [08_public_catalog.test.sql](../supabase/tests/database/08_public_catalog.test.sql) | Tạo: 51 pgTAP cases |
| [08_schema.test.sql](../supabase/tests/database/08_schema.test.sql) | Sửa: allowlist sáu RPC/chín definers; không nới table ACL |
| [public-catalog-integration.mjs](../scripts/lib/public-catalog-integration.mjs) | Tạo: 23 checks qua Pages/PostgREST/DB thật |
| [check-auth-integration.mjs](../scripts/check-auth-integration.mjs) | Sửa: dùng cùng stack thử riêng để chạy Auth rồi catalog |
| [check-db-surface.mjs](../scripts/check-db-surface.mjs) | Sửa: anon chỉ thấy đúng bốn public RPC sau gateway |
| [document-db.mjs](../scripts/document-db.mjs) | Sửa: mô tả schema/RPC hiện hành |
| [package.json](../package.json) | Sửa: thêm test:backend:integration; không thêm dependency |
| [SCHEMA.md](../supabase/SCHEMA.md) | Sửa: metadata/indexes đọc từ PostgreSQL |
| [API.md](../API.md) | Sửa: hợp đồng public metadata; giữ Auth contracts |
| [SECURITY.md](../architecture/SECURITY.md) | Sửa: definer review và public-read boundary |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Sửa: phạm vi hiện tại |
| [DATABASE.md](../DATABASE.md) | Sửa: tổng 14 migrations, không thêm bảng |
| [README.md](../README.md) | Sửa: hướng dẫn/trạng thái mới |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Sửa: kết quả và điểm dừng trước 08.5 |
| [MODULE_08_4.md](MODULE_08_4.md) | Tạo: bàn giao này |

Dùng lại [.dev.vars.example](../.dev.vars.example), [.env.example](../.env.example) và setup local 08.3. Không thêm biến môi trường, không sửa frontend, không đổi cấu trúc dự án hay dependency/lockfile.

## 3. Hướng dẫn Windows

Mở Docker Desktop và chờ engine. Trong VS Code → Terminal → New Terminal → **PowerShell**, chạy từng dòng; chỉ tiếp tục khi lệnh trước thành công. Không cần Run as administrator. Các dòng # giải thích lệnh, không phải nhập dữ liệu.

**Terminal A**:

```powershell
# Đi vào đúng thư mục dự án hiện có.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Khởi động Supabase của dự án; giữ dữ liệu và cổng chỉ trên máy này.
npm.cmd run db:start
# Áp dụng migrations còn thiếu vào local, không reset database.
npm.cmd run db:migrate
# Chuẩn bị publishable key/gateway local tự động; không in hoặc yêu cầu dán secret.
npm.cmd run auth:setup:local
# Kiểm tra TypeScript, lint, tests, build frontend và compile Functions.
npm.cmd run check
# Phục vụ bản build và API tại 127.0.0.1:8788; giữ terminal mở.
npm.cmd run pages:dev
```

Máy này đã có thư viện. Với bản clone trên máy mới, chạy `npm.cmd ci` trong gốc repo để cài đúng lockfile trước các bước trên; xem [công cụ Windows](../README.md). Không chạy lại create-vite trong repo đang có.

**Terminal B**, PowerShell cùng thư mục:

```powershell
# Đọc list thương hiệu thật từ database local; hiện chưa có dữ liệu nên data rỗng.
Invoke-RestMethod -Uri "http://127.0.0.1:8788/api/v1/brands?limit=20" | ConvertTo-Json -Depth 8
# Đọc các danh mục gốc công khai; không suy dữ liệu khi database rỗng.
Invoke-RestMethod -Uri "http://127.0.0.1:8788/api/v1/categories" | ConvertTo-Json -Depth 8
# Kiểm schema/RLS/ACL, dữ liệu nháp, cây danh mục và HTTP gateway.
npm.cmd run check:db
# Replay migrations và kiểm Auth + catalog thật trong stack thử riêng.
npm.cmd run test:backend:integration
```

Cũng có thể mở hai URL GET trên trong trình duyệt. Không cần Owner hoặc đăng nhập để đọc public metadata. Ví dụ slug trong API.md chỉ minh họa; nếu chưa có dữ liệu tương ứng thì detail trả 404 là đúng. Không tự nhập nhãn hàng thật/giá/tồn để làm test.

Lệnh integration chạy 21 Auth + 23 catalog checks trong `website-tmdt-auth-test` (giữ tên stack cũ), cổng 55421–55423 và Pages 8791. Fixtures TEST/@example.invalid chỉ ở stack dùng thử, không ở database ứng dụng. Migrations được replay từ đầu trong stack riêng; khi xong, script xóa riêng stack thử. `test:auth:integration` cũ vẫn dùng được và hiện cũng chạy cả hai nhóm. Không chạy hai lệnh integration đồng thời.

Sau khi xem xong, nhấn **Ctrl+C tại terminal A** để dừng Pages; rồi chạy:

```powershell
# Dừng Supabase local, giữ nguyên data volumes.
npm.cmd run db:stop
```

Muốn tắt hẳn Docker Desktop: biểu tượng Docker ở khay hệ thống Windows → chuột phải → Quit Docker Desktop. Lần làm việc này Docker ban đầu tắt; môi trường local được dừng lại sau kiểm thử. Không có dịch vụ production được deploy.

## 4. Bảo mật và giới hạn

- Bốn public RPC là ngoại lệ SECURITY DEFINER được rà soát: bypass RLS để lọc active và chỉ xuất DTO đã duyệt. Search path cố định; không dynamic SQL. Anon vẫn không có quyền đọc/ghi raw tables hoặc gọi helper nội bộ. Không mở schema app/private/public qua Data API.
- Gateway vẫn bắt buộc; public Pages adapter không nhận vai trò từ token/cookie hoặc đổi sang service role. Các endpoint admin giữ yêu cầu MFA/role hiện có.
- Root traversal giấu toàn nhánh nếu parent/type chưa active. Không trả trạng thái nháp, version nội bộ, object key, PII, giá hoặc stock. JSON text không phải HTML đã sanitize.
- Query tối đa 1024 ký tự, slug 160, limit 100; response upstream 256 KiB, timeout 8 giây. Từ chối duplicate/unknown query, redirect, schema sai, cursor sai parent; lỗi không biến thành data [].
- Không cache metadata đang có thể bị thu hồi. Chưa có kiểm chứng tải lớn, WAF/rate limit phân tán hoặc cache invalidation production; số danh mục/SKU và tải doanh nghiệp chưa được cung cấp.
- Chưa có API ghi metadata, UI admin, API sản phẩm/biến thể/thông số, media upload hoặc nối frontend với dữ liệu thật. Tiếp tục theo từng module, không mở nhận đơn thật.

## 5. Kiểm thử thực tế và nghiệm thu

Ngày 19/11/2026:

- [x] TypeScript strict và lint không lỗi.
- [x] **195 Vitest / 9 files**, gồm 64 public-catalog tests mới và 131 hiện có.
- [x] Production build **61 URL**, Pages Functions compile thành công.
- [x] PostgreSQL lint không lỗi/cảnh báo; **187 pgTAP**, gồm 51 public-catalog mới.
- [x] Hai kiểm tra category concurrency và bảy HTTP surface checks đạt.
- [x] **44 integration thật:** 21 Auth regression + 23 public catalog qua PostgreSQL/PostgREST/Pages. Không coi mocked unit tests là chứng minh HTTP thật.
- [x] Migrations replay đủ 14 trong stack thử; fixtures/test stack đã dọn.
- [x] API 200 empty khác 400/404/405/429/503; HEAD không body; không lộ nháp hoặc nhánh ẩn.
- [x] Bảo vệ gateway/ACL/MFA cũ không bị nới rộng.
- [x] Mã nguồn đầy đủ, API contract, biến môi trường mẫu dùng lại, hướng dẫn Windows.

Database local ứng dụng vẫn chưa có brand/category/Auth user thật. Không tạo/link Supabase online, không bootstrap Owner hoặc deploy. Các kết quả lịch sử 08.3 giữ riêng trong [bàn giao cũ](MODULE_08_3.md).

Gói ZIP gồm source Git, log check/db-check/integration, verification/handoff và manifest SHA-256. Không có .dev.vars, CLI cache, node_modules, build, databases, startup logs hoặc scratch chứa credentials. SHA commit/checksum cụ thể ghi trong metadata của gói.

## 6. Xử lý lỗi và bước tiếp

| Lỗi | Cách xử lý |
|---|---|
| Docker engine chưa chạy | Mở Docker Desktop, chờ engine rồi db:start; không factory reset |
| npm.ps1 bị chặn | Dùng npm.cmd như tài liệu |
| 503 CATALOG_NOT_CONFIGURED | db:migrate → auth:setup:local → restart Pages; không mở RLS/tắt gateway |
| 503 CATALOG_UNAVAILABLE | Kiểm Docker/API local, payload và log đã che; không thay bằng fixture DEMO |
| 400 CATALOG_INVALID_CURSOR | Quay về trang đầu và giữ cùng parent |
| 404 | Kiểm slug, active và mọi ancestor/type; không tự công bố nháp để hết lỗi |
| 200 với data [] | Catalog thật đang rỗng; không phải website đã có sản phẩm bán |
| Integration báo stack tồn tại | Xem hướng dẫn dọn **chỉ stack thử** trong [08.3](MODULE_08_3.md); không xóa data volumes ứng dụng |

Bước tiếp theo theo yêu cầu mới: **08.5 — API sản phẩm, biến thể và thông số**. Các quyết định giá/tồn/TTL/thuế/RPO/RTO vẫn chờ doanh nghiệp, không tự chốt trong 08.4.

Nguồn kỹ thuật chính thức: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [Data API security](https://supabase.com/docs/guides/api/securing-your-api), [Cloudflare Request](https://developers.cloudflare.com/workers/runtime-apis/request/). Chi tiết triển khai được kiểm chứng bằng các bộ test của repo.
