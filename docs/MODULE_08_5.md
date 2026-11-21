# Bàn giao 08.5 — API sản phẩm, biến thể và thông số

Ngày 19/11/2026. Tiếp tục sau 08.4 theo yêu cầu người dùng; chỉ triển khai public reads của 08.5. Không triển khai 08.6–08.10, không nối frontend vào dữ liệu thật và không deploy. Supabase hiện là local, chưa tạo project online hoặc Owner thật.

## 1. Hành vi và tiêu chí

| Mã | Đã thực hiện | Liên hệ PRD |
|---|---|---|
| PROD05.1 | Product published, brand/type/category ancestors active và có SKU ready mới công khai | C01/C04, không lộ nháp |
| PROD05.2 | SKU đúng product; pagination riêng, SKU không làm URL ID | C04, quản lý model/SKU/biến thể |
| PROD05.3 | Giá current đã duyệt dạng chuỗi VND; thiếu giá/tồn/bảo hành biểu diễn rõ | C04, giá/thuế/tồn |
| PROD05.4 | EOL/discontinued tra cứu được nhưng not_for_sale, checkout luôn tắt trong module đọc | C04, quy tắc vòng đời |
| PROD05.5 | Thông số theo loại hàng và đúng SKU, không kế thừa ngầm; missing/unverified khác 0/false/NA | C04, nền C05 |
| PROD05.6 | Multi-enum có lựa chọn archived trở thành unknown toàn bộ | C04/C05, không trình bày dữ liệu thiếu như đầy đủ |
| PROD05.7 | RPC public riêng, gateway, không caller identity/raw-table grants; SQL và BFF cùng validate | Kiến trúc bảo mật |
| PROD05.8 | GET/HEAD, pagination có giới hạn, lỗi thật, no-store, DTO whitelist | API, UX trạng thái |

Năm URL mới: `/api/v1/products`, `/api/v1/products/{slug}`, `/api/v1/products/{slug}/variants`, `/api/v1/products/{slug}/variants/{variantId}`, `/api/v1/products/{slug}/variants/{variantId}/specifications`. Xem [API.md](../API.md) để biết request/response, kiểu dữ liệu, error code, giới hạn và điều kiện công khai đầy đủ.

Mọi SKU trả purchase_enabled=false: module đọc không tạo đơn, xác nhận checkout hay giữ hàng. availability phản ánh inventory hiện có, không phải lời hứa giao hàng. Thuế unknown vẫn unknown, không tự gán thuế suất. Null warranty không phải 0 tháng. Không tự tạo giá, tồn, thương hiệu, quyền phân phối hoặc quan hệ tương thích.

Theo phương pháp Spec Kit đang dùng trong dự án: yêu cầu → hợp đồng → implementation → kiểm thử → checklist. Impeccable giữ yêu cầu trạng thái trung thực để UI sau này không biến thiếu dữ liệu thành thành công; không sửa giao diện ở module backend. Không cài/chạy hoặc nâng cấp hai bộ công cụ.

## 2. Mã nguồn đầy đủ và cấu trúc

Tệp đã được viết trực tiếp trong repo. Mở liên kết để xem toàn bộ mã nguồn; không cần chép ghép các đoạn code. Danh sách này bao gồm mọi tệp được tạo/sửa trong module, không có thay đổi frontend hoặc dependency.

| Tệp | Công việc |
|---|---|
| [public_products.sql](../supabase/migrations/20261119000400_public_products.sql) | Tạo migration: 5 RPC, 3 helpers, 2 indexes; không đổi migration đã áp dụng |
| [transport.ts](../server/catalog/transport.ts) | Tách transport/bounded JSON dùng chung từ handler 08.4, giữ hành vi an toàn |
| [handler.ts](../server/catalog/handler.ts) | API navigation gọi transport chung |
| [products.ts](../server/catalog/products.ts) | Validate route/query/pagination, HTTP/error contract |
| [product-dto.ts](../server/catalog/product-dto.ts) | Validate và chỉ chọn trường công khai, tiền/decimal chính xác |
| [products/index.ts](../functions/api/v1/products/index.ts) | Route danh sách sản phẩm |
| [products/[slug]/index.ts](../functions/api/v1/products/[slug]/index.ts) | Route chi tiết sản phẩm |
| [variants/index.ts](../functions/api/v1/products/[slug]/variants/index.ts) | Route danh sách SKU |
| [variants/[variantId]/index.ts](../functions/api/v1/products/[slug]/variants/[variantId]/index.ts) | Route chi tiết SKU |
| [specifications.ts](../functions/api/v1/products/[slug]/variants/[variantId]/specifications.ts) | Route thông số SKU |
| [public-products.test.ts](../tests/public-products.test.ts) | 77 Vitest mới cho API và DTO |
| [08_public_products.test.sql](../supabase/tests/database/08_public_products.test.sql) | 60 pgTAP và fixture TEST nằm trong transaction rollback |
| [08_schema.test.sql](../supabase/tests/database/08_schema.test.sql) | Cập nhật strict allowlist RPC/definer/grants |
| [08_public_catalog.test.sql](../supabase/tests/database/08_public_catalog.test.sql) | Giữ kiểm tra đúng 4 RPC navigation khi thêm 5 RPC sản phẩm |
| [public-products-integration.mjs](../scripts/lib/public-products-integration.mjs) | 26 tình huống thật trên stack thử riêng; dùng cùng fixture đã đánh dấu trong pgTAP |
| [check-auth-integration.mjs](../scripts/check-auth-integration.mjs) | Chạy thêm kiểm thử sản phẩm sau Auth/navigation |
| [check-db-surface.mjs](../scripts/check-db-surface.mjs) | Kiểm anon chỉ thấy đúng 9 RPC public, không thấy bảng/admin |
| [document-db.mjs](../scripts/document-db.mjs) | Cập nhật nhãn và mô tả schema thực tế |
| [SCHEMA.md](../supabase/SCHEMA.md) | Sinh lại từ PostgreSQL thật, có indexes mới |
| [API.md](../API.md) | Hợp đồng tất cả endpoint hiện có |
| [DATABASE.md](../DATABASE.md) | Trạng thái 15 migrations/52 bảng |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Phạm vi triển khai thực tế 08.5 |
| [SECURITY.md](../architecture/SECURITY.md) | Ranh giới projection/definer/gateway |
| [README.md](../README.md) | Điểm vào hướng dẫn hiện tại |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Trạng thái và bước tiếp theo |
| [MODULE_08_5.md](MODULE_08_5.md) | Bàn giao, hướng dẫn, kết quả và checklist này |

```text
functions/api/v1/products/
  index.ts
  [slug]/
    index.ts
    variants/
      index.ts
      [variantId]/
        index.ts
        specifications.ts
server/catalog/
  handler.ts          # navigation đã có
  types.ts            # giữ nguyên
  transport.ts
  products.ts
  product-dto.ts
supabase/migrations/20261119000400_public_products.sql
supabase/tests/database/08_public_products.test.sql
tests/public-products.test.ts
scripts/lib/public-products-integration.mjs
docs/MODULE_08_5.md
```

Không thêm biến môi trường. Dùng nguyên [.env.example](../.env.example) và [.dev.vars.example](../.dev.vars.example) của 08.3; file secret thật `.dev.vars` tiếp tục được Git bỏ qua. Không đặt gateway/Supabase secret trong biến VITE_* hoặc source frontend.

## 3. Chạy trên Windows

Máy này đã có Node/npm/Git/Docker và thư viện. Mở Docker Desktop trước khi kiểm thử backend. Trong VS Code chọn **Terminal → New Terminal → PowerShell**. Không dán các lệnh vào ô chat hoặc SQL Editor. `npm.cmd` tránh lỗi PowerShell chặn npm.ps1.

**Terminal 1**, chạy từng lệnh dưới đây; chỉ tiếp tục khi lệnh trước không báo lỗi:

```powershell
# Chuyển vào đúng thư mục dự án.
Set-Location 'C:\Users\Minh\Documents\ChatGPT\Website TMDT'

# Bật Supabase local của riêng dự án, không tạo project cloud.
npm.cmd run db:start

# Áp dụng các migration còn thiếu; không reset hay xóa dữ liệu.
npm.cmd run db:migrate

# Chuẩn bị gateway/cấu hình local trong file bị Git bỏ qua; không in secret.
npm.cmd run auth:setup:local

# Kiểm TypeScript, ESLint, test, production build và biên dịch Pages Functions.
npm.cmd run check

# Kiểm database, quyền truy cập, constraint và kết nối HTTP local.
npm.cmd run check:db

# Chạy 70 tình huống backend thật trên stack thử riêng, tự dọn khi kết thúc.
npm.cmd run test:backend:integration

# Chạy Pages local để xem API; giữ terminal này mở đến khi muốn dừng.
npm.cmd run pages:dev
```

Nếu lấy source ZIP trên máy khác, sau Set-Location chạy `npm.cmd ci`: lệnh này cài đúng các phiên bản từ package-lock.json; cần Node nhánh 24 đã ghi trong README. Không cần cài thư viện mới cho 08.5. `.dev.vars` không nằm trong ZIP, nên phải chạy setup local trên máy đó.

**Terminal 2**, PowerShell mới, kiểm tra danh sách:

```powershell
# Gọi API đọc danh sách sản phẩm từ Pages đang chạy ở Terminal 1.
Invoke-RestMethod 'http://127.0.0.1:8788/api/v1/products?limit=20' | ConvertTo-Json -Depth 8
```

Database ứng dụng chưa có sản phẩm thật: kết quả đúng là data=[], next_cursor=null, has_more=false. Không copy fixture TEST vào database ứng dụng để làm cửa hàng có hàng. Không cần tạo Owner chỉ để kiểm thử đọc; bộ integration tự tạo account TEST trong stack riêng.

Khi xong, bấm **Ctrl+C** tại Terminal 1 để dừng Pages. Tiếp đó trong PowerShell ở gốc repo:

```powershell
# Dừng Supabase của riêng dự án, giữ volume/dữ liệu cho lần sau.
npm.cmd run db:stop
```

Nếu không còn ứng dụng khác dùng Docker, có thể chọn **Quit Docker Desktop** từ biểu tượng Docker ở khay hệ thống. Không dùng Reset/Purge data. Không dùng db reset hoặc xóa volume để giải quyết lỗi đọc API.

## 4. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Docker pipe/daemon chưa chạy | Mở Docker Desktop, đợi engine sẵn sàng rồi chạy lại db:start |
| npm.ps1 bị chặn | Dùng npm.cmd trong PowerShell như hướng dẫn; không cần đổi policy toàn máy |
| Cổng 54321/54322/54323 hoặc 8788 đang dùng | Kiểm terminal đang chạy của dự án, dừng bằng Ctrl+C; không kill/xóa container của dự án khác |
| API 503 CATALOG_NOT_CONFIGURED | Chạy db:start, db:migrate, auth:setup:local theo thứ tự; khởi động lại pages:dev để nạp .dev.vars; không copy secret vào chat |
| 503 CATALOG_UNAVAILABLE | Kiểm Supabase còn chạy; không biến lỗi thành []; DTO/payload không hợp lệ cũng được chặn như vậy |
| List rỗng, detail 404 | Bình thường khi chưa nhập/duyệt catalog; kiểm các cờ công khai, SKU ready và nhánh danh mục bằng quy trình admin khi 08.10 có |
| 400 INVALID_CURSOR | Dữ liệu đã thu hồi hoặc cursor sai scope; tải lại từ trang đầu, không bỏ điều kiện bảo mật |
| Integration phát hiện stack test cũ | Đọc thông báo và kiểm container đúng tên website-tmdt-auth-test; không reset database ứng dụng. Script từ chối ghi đè stack test có sẵn |

## 5. Kết quả kiểm tra thực tế

Ngày 19/11/2026 trên Windows, PostgreSQL local và Cloudflare workerd:

| Kiểm tra | Kết quả |
|---|---|
| npm run check | Đạt typecheck/lint; **272 Vitest / 10 files**, gồm 77 test sản phẩm mới |
| Production build và Pages compile | Đạt **61 URL prerender**, Worker compiled successfully |
| npm run check:db | Lint không lỗi; **247 pgTAP**, gồm 60 test sản phẩm mới; 2 concurrency nền; 7 HTTP surface |
| npm run test:backend:integration | **70 tình huống thật: 21 Auth + 23 navigation + 26 products** |
| Dọn test | Stack integration riêng được xóa; pgTAP rollback, không tạo catalog/Owner thật trong DB ứng dụng |

Test bao phủ phân trang, visibility, cross-product, EOL có tồn, price bigint vượt Number safe integer, giá chưa hiệu lực, 0/false/unknown, warranty, enum/multi-enum, thu hồi tức thì, no-store/HEAD/405, query và DTO lỗi, gateway/role/raw-schema access. Auth cũ được chạy lại. Chưa phải load test production hoặc kiểm concurrency checkout; phần đó thuộc 08.7–08.8.

Tài liệu chính thức đã đối chiếu: [Supabase database functions](https://supabase.com/docs/guides/database/functions) cho quyền EXECUTE/SECURITY DEFINER; [Cloudflare Request](https://developers.cloudflare.com/workers/runtime-apis/request/) cho redirect manual trên Workers. Kết quả của repo dựa thêm trên test thực tế, không coi tài liệu nhà cung cấp là bằng chứng code đã chạy.

## 6. Checklist nghiệm thu

- [x] Năm endpoint đọc có route thật và cùng contract API.md.
- [x] SQL migration thêm mới, không sửa migration cũ, không seed dữ liệu kinh doanh.
- [x] Giữ 52 bảng với RLS; không mở raw-table grant hoặc dùng service secret.
- [x] Không đọc SKU nháp/khác sản phẩm; không coi missing/unverified là bằng nhau hoặc bằng 0.
- [x] Giá/tồn/bảo hành lấy từ database theo quy tắc công khai, không nhận giá do client gửi.
- [x] EOL/discontinued chặn bán; purchase_enabled=false toàn bộ, không giả lập lưu đơn.
- [x] Unit, SQL, integration thật và các kiểm tra regression đều đạt.
- [x] Hướng dẫn Windows, file đầy đủ, environment mẫu và giới hạn được ghi rõ.
- [ ] Doanh nghiệp cung cấp/duyệt catalog, giá, thuế, tồn và bảo hành thật — chưa có dữ liệu.
- [ ] Cloud project/production/WAF/load testing và vận hành — chưa thuộc lần này.

`required_for_publish` và cờ ready cần workflow duyệt ở 08.10; không coi API đọc là công cụ chứng nhận dữ liệu. Media URL/upload, danh mục phụ, quan hệ phụ kiện chưa thuộc contract. Bước tiếp theo khi người dùng yêu cầu: **08.6 — API tìm kiếm, lọc và so sánh**; chưa triển khai trong 08.5.
