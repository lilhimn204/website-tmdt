# Bàn giao 08.6 — Tìm kiếm, lọc và so sánh

Ngày 21/11/2026. Thực hiện yêu cầu “tiếp tục task tiếp theo” sau khi chốt 08.5 (commit 333bcce). Chỉ làm backend discovery 08.6; không triển khai 08.7–08.10 hoặc nối frontend vào API. Frontend hiện vẫn DEMO, không nhận đơn/báo giá thật. Chưa có Supabase cloud/Owner/catalog doanh nghiệp thật.

## 1. Phạm vi và nghiệm thu

| Mã | Hành vi backend | PRD/story |
|---|---|---|
| DISC06.1 | Tìm tên/hãng có/không dấu tiếng Việt, case/space normalized; SKU/model exact trước prefix trước text | C02.1–3 |
| DISC06.2 | Giữ dấu phân cách SKU; không lộ nháp/ẩn qua mã chính xác, query hoặc count | C02, bảo mật |
| DISC06.3 | Metadata bộ lọc riêng cho technical type, canonical unit, active definitions/options | C03.1 |
| DISC06.4 | OR lựa chọn cùng thuộc tính, AND thuộc tính khác, mọi rule cùng một SKU | C03.2–3 |
| DISC06.5 | Count SKU/product, pagination giới hạn, sort giá không coi quote-only là 0 | C03.4–5, phần API |
| DISC06.6 | So sánh 2–3 SKU cùng loại; unknown → incomplete, 0/false vẫn known | C05.1–2 |
| DISC06.7 | EOL/not_for_sale hiện hành, thu hồi SKU/ancestor có hiệu lực ngay | C05.3, phần API |
| DISC06.8 | Search document đồng bộ khi đổi tên/hãng/SKU; có kiểm tra ghi đồng thời | Kiến trúc projection |
| DISC06.9 | Gateway/role/query/DTO/payload bounds, lỗi thật, GET/HEAD/no-store | Bảo mật/API |

Ba endpoint: `/api/v1/search`, `/api/v1/product-types/{code}/filters`, `/api/v1/compare`. Contract đầy đủ, JSON request/response, loại lỗi và quy tắc filter/compare ở [API.md](../API.md). Endpoint sản phẩm 08.5 không đổi query contract. Cách chọn SKU khi tìm kiếm là một kết quả cho một SKU, không tự chọn đại diện rồi ghép thông số từ nhiều biến thể.

Spec Kit tiếp tục theo yêu cầu → contract → implementation → test → checklist; không cài/chạy bộ CLI. Yêu cầu Impeccable về trạng thái rõ ràng thể hiện qua empty/error riêng, unknown/incomplete, EOL và nhãn giá/thuế; chưa có thay đổi UI. Đây không phải nghiệm thu frontend C02.4 hoặc UX mobile của C05.3.

## 2. Mã nguồn đầy đủ

Tệp đã tạo/sửa trực tiếp trong repo; liên kết mở nguyên tệp, không cần tự ghép code. Không nâng dependency hoặc đổi cấu trúc frontend. package.json chỉ thêm lệnh kiểm tra query plan.

| Tệp | Công việc |
|---|---|
| [public_discovery.sql](../supabase/migrations/20261121000100_public_discovery.sql) | Tạo: unaccent, search projection triggers/helpers và 3 public RPC |
| [discovery_query_cost.sql](../supabase/migrations/20261121000200_discovery_query_cost.sql) | Tạo: enrich DTO sau pagination, tối ưu lookup variant mà giữ visibility |
| [discovery_filter_cost.sql](../supabase/migrations/20261121000300_discovery_filter_cost.sql) | Tạo: matched candidates trước technical filters, kiểm typed storage qua EXISTS |
| [discovery-query.ts](../server/catalog/discovery-query.ts) | Tạo: query/JSON/decimal/selection validation |
| [discovery-dto.ts](../server/catalog/discovery-dto.ts) | Tạo: projection và consistency guard cho search/filter/compare |
| [discovery.ts](../server/catalog/discovery.ts) | Tạo: HTTP handler, count/page/errors, scope checks |
| [transport.ts](../server/catalog/transport.ts) | Sửa: map hai mã lỗi SQL mới có kiểm soát |
| [search.ts](../functions/api/v1/search.ts) | Tạo: route tìm/lọc SKU |
| [compare.ts](../functions/api/v1/compare.ts) | Tạo: route so sánh |
| [product-types filters.ts](../functions/api/v1/product-types/[code]/filters.ts) | Tạo: route metadata bộ lọc |
| [public-discovery.test.ts](../tests/public-discovery.test.ts) | Tạo: 86 Vitest input/DTO/semantics |
| [08_discovery.test.sql](../supabase/tests/database/08_discovery.test.sql) | Tạo: fixture TEST và 76 pgTAP, rollback |
| [08_schema.test.sql](../supabase/tests/database/08_schema.test.sql) | Sửa: strict allowlist RPC/definer/grants |
| [discovery-integration.mjs](../scripts/lib/discovery-integration.mjs) | Tạo: 30 tình huống HTTP xuyên suốt thật |
| [check-auth-integration.mjs](../scripts/check-auth-integration.mjs) | Sửa: thêm discovery vào runner stack riêng |
| [check-db-concurrency.mjs](../scripts/check-db-concurrency.mjs) | Sửa: thêm hai thử nghiệm brand rename/variant insert đồng thời |
| [check-db-surface.mjs](../scripts/check-db-surface.mjs) | Sửa: anon chỉ thấy đúng 12 public RPC, không admin/raw tables |
| [check-discovery-query-plan.mjs](../scripts/check-discovery-query-plan.mjs) | Tạo: phép đo SQL local với 500 products/1000 SKU TEST, rollback |
| [package.json](../package.json) | Sửa: thêm test:db:query-plan, không dependency mới |
| [document-db.mjs](../scripts/document-db.mjs) | Sửa: nhãn/schema scope hiện tại |
| [SCHEMA.md](../supabase/SCHEMA.md) | Sinh lại từ metadata PostgreSQL thật |
| [API.md](../API.md) | Sửa: contract discovery và scope hiện tại |
| [DATABASE.md](../DATABASE.md) | Sửa: 18 migrations/52 bảng/14 RPC gồm 2 Auth + 12 public |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Sửa: trạng thái implementation, projection/query flow |
| [SECURITY.md](../architecture/SECURITY.md) | Sửa: permissions, input bounds và visibility |
| [README.md](../README.md) | Sửa: hướng dẫn entry point 08.6 |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Sửa: tình trạng, kết quả và điểm dừng |
| [MODULE_08_6.md](MODULE_08_6.md) | Tạo: bàn giao này |

```text
functions/api/v1/
  search.ts
  compare.ts
  product-types/[code]/filters.ts
server/catalog/
  discovery-query.ts
  discovery-dto.ts
  discovery.ts
  transport.ts
supabase/migrations/
  20261121000100_public_discovery.sql
  20261121000200_discovery_query_cost.sql
  20261121000300_discovery_filter_cost.sql
supabase/tests/database/08_discovery.test.sql
tests/public-discovery.test.ts
scripts/
  lib/discovery-integration.mjs
  check-discovery-query-plan.mjs
```

08.5 và toàn bộ frontend vẫn nằm trong bản source đầy đủ; tài liệu trước giữ lịch sử ở [08.5](MODULE_08_5.md). Không xóa/sửa migration đã áp dụng để giấu quá trình nâng cấp. Hai migration tối ưu giữ nguyên API/ACL và có regression tests.

## 3. Hướng dẫn Windows

Mở Docker Desktop. Mở repo trong VS Code → **Terminal → New Terminal → PowerShell**. Chạy từng lệnh; không dán vào chat, SQL Editor hoặc terminal Python. Dùng npm.cmd để tránh PowerShell chặn npm.ps1.

**Terminal 1**, PowerShell:

```powershell
# Vào thư mục dự án hiện tại.
Set-Location 'C:\Users\Minh\Documents\ChatGPT\Website TMDT'

# Bật Supabase local của riêng website, không tạo hoặc link cloud project.
npm.cmd run db:start

# Áp dụng migration còn thiếu; không reset hoặc xóa dữ liệu.
npm.cmd run db:migrate

# Chuẩn bị cấu hình/gateway local trong file Git bỏ qua, không in secret.
npm.cmd run auth:setup:local

# Kiểm TypeScript, ESLint, Vitest, production build và Pages Functions.
npm.cmd run check

# Kiểm SQL, quyền truy cập, 4 trường hợp đồng thời và HTTP surface local.
npm.cmd run check:db

# Chạy 100 tình huống API thật trên stack TEST riêng và tự dọn sau kiểm thử.
npm.cmd run test:backend:integration

# Đo ba query với dữ liệu TEST trong transaction rollback, không commit dữ liệu.
npm.cmd run test:db:query-plan

# Bật Pages local cho các request thủ công; giữ terminal này mở.
npm.cmd run pages:dev
```

Nếu dùng ZIP trên máy khác, sau Set-Location chạy `npm.cmd ci` để cài đúng phiên bản trong package-lock.json, với Node nhánh 24 như README. Máy này đã có dependencies. Không có biến môi trường mới: dùng [.env.example](../.env.example) và [.dev.vars.example](../.dev.vars.example). `.dev.vars` thật không nằm trong Git/ZIP. Không nhập gateway, secret key hoặc access token vào source hay chat.

**Terminal 2**, PowerShell mới, thử tìm kiếm:

```powershell
# Gọi API thật qua Pages và hiển thị JSON đủ sâu.
Invoke-RestMethod 'http://127.0.0.1:8788/api/v1/search?q=UPS&limit=20' | ConvertTo-Json -Depth 12
```

Database ứng dụng hiện chưa có catalog thật nên data=[]/total=0 là kết quả đúng. Filters dùng code loại chưa tạo sẽ 404; compare cần UUID SKU công khai thật, không tự tạo ID rồi mong có kết quả. Bộ integration đã kiểm thử đầy đủ bằng dữ liệu TEST riêng, không cần seed vào cửa hàng. Chưa nối API vào frontend nên trang DEMO không thay đổi theo kết quả này.

Khi xong, bấm **Ctrl+C** ở Terminal 1 để dừng Pages, rồi trong PowerShell tại gốc repo:

```powershell
# Dừng Supabase của riêng dự án, giữ nguyên dữ liệu trong volume.
npm.cmd run db:stop
```

Nếu không còn dự án khác dùng Docker, chọn **Quit Docker Desktop** ở khay hệ thống để giải phóng tài nguyên. Không dùng Reset/Purge hoặc xóa volume.

## 4. Trạng thái lỗi cần hiểu

| Hiện tượng | Cách xử lý |
|---|---|
| Docker pipe/daemon không có | Mở Docker Desktop, đợi engine sẵn sàng, chạy lại db:start |
| npm.ps1 bị chặn | Dùng npm.cmd, không cần đổi policy toàn máy |
| 503 CATALOG_NOT_CONFIGURED | Chạy db:start → db:migrate → auth:setup:local; khởi động lại pages:dev để nạp bindings |
| 503 CATALOG_UNAVAILABLE | Kiểm Supabase/kết nối; response sai kiểu/quá lớn cũng bị chặn, không được biến thành [] thành công |
| 400 CATALOG_INVALID_FILTER | Rule không phù hợp type/option hiện hành hoặc sai kiểu; lấy metadata mới và gỡ/sửa rule. Số dùng chuỗi, boolean dùng true/false |
| 400 CATALOG_INCOMPATIBLE_COMPARISON | Chỉ chọn 2–3 SKU cùng technical type, không trộn UPS/RAM |
| Compare 404 | Ít nhất một SKU không còn công khai hoặc không tồn tại; làm mới lựa chọn, không giữ bảng cũ để mua |
| page.truncated=true | Có kết quả ngoài trần offset 5000; thu hẹp từ khóa/bộ lọc |
| Cổng local trùng hoặc test stack đã tồn tại | Dừng terminal đúng dự án; kiểm tên stack test. Không kill/reset các dự án khác để vượt lỗi |

Không mở quyền database hoặc tắt gateway để xử lý lỗi. Quy tắc lỗi đầy đủ ở API.md.

## 5. Kiểm chứng thực tế

| Kiểm tra ngày 21/11/2026 | Kết quả |
|---|---|
| npm run check | Typecheck/lint đạt; **358 Vitest trong 11 files**, gồm 86 discovery mới |
| Build | **61 URL prerender**, Pages Worker compile đạt |
| npm run check:db | Lint schema không lỗi; **323 pgTAP**, gồm 76 discovery mới |
| Concurrency | **4 tình huống thật**: 2 chống cycle cũ, 2 brand rename/variant insert với Read Committed và Repeatable Read |
| HTTP surface | **7 kiểm tra**; anon chỉ thấy 12 public RPC, raw schemas/admin bị chặn |
| npm run test:backend:integration | **100 tình huống thật**: 21 Auth + 23 navigation + 26 products + 30 discovery |
| Query plan local | Thêm 500 products/1000 SKU TEST trong transaction rollback; khoảng **29 ms** tìm thông thường, **19 ms** tìm kèm lọc, **54 ms** chỉ lọc |

Các phép đo là thời gian SQL trên máy này, chưa tính mạng/Pages và không phải load test nhiều người dùng hay SLA production. Thử nghiệm đã giúp tách lọc/count IDs khỏi bước enrich DTO; mọi tối ưu được chạy lại unit/SQL/real integration. Không thiết lập mục tiêu tải giả khi doanh nghiệp chưa có số SKU/traffic dự kiến.

pgTAP rollback; concurrency xóa đúng UUID TEST do script tạo; integration dùng stack riêng rồi dọn; query plan rollback. Không có catalog, giá/tồn/bảo hành hoặc Owner thật được thêm vào database ứng dụng. Báo cáo audit/kiểm thử và manifest checksum được kèm bản ZIP bàn giao; không kèm secret, CLI cache, node_modules, build hoặc database volume.

Nguồn kỹ thuật đã đối chiếu: [PostgreSQL 17 unaccent](https://www.postgresql.org/docs/17/unaccent.html) và [text-search controls](https://www.postgresql.org/docs/17/textsearch-controls.html). Implementation dùng plain query/simple dictionary; không tuyên bố có stemming hoặc tìm ngữ nghĩa tiếng Việt.

## 6. Checklist và phần còn lại

- [x] Search exact/prefix/name/brand, tiếng Việt, private visibility, bounded count/pagination hoạt động.
- [x] Filter metadata/type/option/đơn vị rõ; cùng-SKU AND và trong-attribute OR có test.
- [x] Compare 2–3 cùng loại, đúng column order và trạng thái equal/different/incomplete.
- [x] Unknown/unverified không thành 0/false/equal; EOL vẫn không được mua.
- [x] Projection đồng bộ transaction, concurrent rename/insert không để tên cũ.
- [x] Giữ RLS/grants/gateway, không service secret hoặc direct database writes từ client.
- [x] SQL migrations, API code, request/response, môi trường mẫu và test/hướng dẫn đầy đủ.
- [ ] Frontend thật xử lý response về trễ, đổi type/gỡ filter, bảng mobile — chưa nối API trong 08.6.
- [ ] Chuẩn hóa chính sách NET/GROSS/thuế/làm tròn/phí trước checkout thật. Sort hiện dùng amount hiển thị, không quy đổi tổng phải trả.
- [ ] Cloud project, dữ liệu doanh nghiệp, WAF/rate limits, catalog/load thực tế và vận hành production — chưa thực hiện.

Không bổ sung fuzzy/semantic search, runtime UPS, gợi ý tương thích hoặc tích hợp sàn. Không bật checkout/giữ hàng. Bước tiếp theo khi có yêu cầu mới: **08.7 — API giỏ hàng/checkout theo kiến trúc đã duyệt**; TTL giữ hàng, thuế/phí và các quyết định doanh nghiệp chưa chốt vẫn phải để mở trước các thao tác phụ thuộc.
