# Bàn giao 08.1–08.2 — Supabase local và database schema

Ngày 06/11/2026. Người dùng chọn: **“Chưa có — chuẩn bị local và hướng dẫn tạo project”**. Vì vậy 08.1 hoàn thành trong phạm vi local; chưa tạo/link project Supabase online. Không cần gửi thông tin đăng nhập hoặc secret vào chat.

## 1. Phạm vi đã thực hiện

- Cài Supabase CLI **3.0.0**, pin trong devDependencies/lockfile; Docker Desktop sẵn có, engine **29.4.0**. PostgreSQL local major **17**. Không thay dependency của frontend.
- `supabase/config.toml`: project local `website-tmdt`, chỉ expose schema `api`; signup/anonymous sign-in tắt; không seed catalog, giá, kho, tài khoản hoặc chính sách giả. Chưa tạo bucket Storage.
- Tám migrations tạo đủ **52 bảng nghiệp vụ trong `app`**, một bảng khóa kỹ thuật trong `private`, các domain/helper/index/trigger. `api` hiện rỗng.
- RLS bật trên toàn bộ bảng nghiệp vụ; thu hồi quyền trực tiếp của `anon`, `authenticated`, `service_role` và PUBLIC; chưa có policy cho phép/RPC/SECURITY DEFINER. Đây là nền bảo vệ mặc định, **không phải đã hoàn thành 08.3**.
- 81 test pgTAP, 2 bài concurrent category edit, kiểm tra bề mặt HTTP local và bộ kiểm tra ứng dụng. Kết quả thực tế ở mục 6; không suy ra hệ thống đã bán hàng được.

Mã frontend DEMO, API health và nút gửi đơn/báo giá giữ trạng thái hiện có. Không làm 08.4–08.10 trong lần này.

## 2. Cấu trúc và migrations

```text
supabase/
  .gitignore
  config.toml
  SCHEMA.md
  migrations/
    20261106000100_foundation.sql
    20261106000200_catalog.sql
    20261106000300_commerce.sql
    20261106000400_quotes.sql
    20261106000500_access_operations.sql
    20261106000600_integrity_and_indexes.sql
    20261106000700_default_function_privileges.sql
    20261106000800_order_snapshot_guard.sql
  tests/database/08_schema.test.sql
scripts/
  supabase-local.mjs
  docker-loopback.mjs
  check-db-concurrency.mjs
  check-db-surface.mjs
  document-db.mjs
```

| Migration | Nội dung |
|---|---|
| 001 | Schema/domain/helper chuẩn hóa, năm bảng vai trò/quyền admin, default deny |
| 002 | 19 bảng catalog, typed specs, model/SKU, media, giá và bảo hành phiên bản |
| 003 | 12 bảng policy/phí, tồn, đơn, contact, dòng hàng, reservation, ledger, giao/thu/hoàn |
| 004 | Bảy bảng RFQ/quote/version/line/acceptance/event; FK vòng quote/order |
| 005 | Chín bảng guest/capability/idempotency/abuse/audit/publication/content/operations |
| 006 | FK bổ sung, deferred checks, immutability, concurrency khóa cây, indexes, RLS/revoke |
| 007 | Thu hồi **global default EXECUTE** của migration owner; version tồn kho tự tăng |
| 008 | Đóng băng nội dung thương mại của order; trạng thái nghiệp vụ sẽ do RPC có quyền quản lý |

[SCHEMA.md](../supabase/SCHEMA.md) được sinh từ metadata PostgreSQL thật, có toàn bộ cột/kiểu/default/constraints/index của 52 bảng. [DATABASE.md](../DATABASE.md) giữ lý do thiết kế; [ERD](../architecture/ERD.md) mô tả quan hệ. Migrations là nguồn chuẩn để tái tạo database, không copy thủ công từng bảng từ tài liệu.

## 3. Những ràng buộc đã có và giới hạn chính xác

- SKU chuẩn hóa NFKC, trim, gộp khoảng trắng và upper; unique toàn website. Model không unique vì có thể lặp giữa SKU. FK kép chặn variant sai type, price của SKU khác, ảnh/tài liệu gắn sai product, quote version sai root.
- Primary category phải thuộc membership; category có type phải khớp product. Cấm chu trình; khóa một hàng kỹ thuật trước sửa cấu trúc cây để chặn write-skew ở READ COMMITTED và REPEATABLE READ. Khóa này dành cho thao tác cấu trúc ít xảy ra, chưa benchmark tải catalog lớn.
- Thông số có number/boolean/text/enum/multi_enum; XOR dữ liệu, đúng definition/type/options, known khác unknown/not_applicable/not_supported, 0 khác thiếu và false khác thiếu. Numeric bounds được kiểm; known multi-enum phải có ít nhất một option. Đổi kiểu/đơn vị/bounds cần migration có kiểm soát.
- VND bigint không âm, không float; rate taxable phải được nhập rõ; unknown không là 0 thuế. Quantity nguyên dương, `0 <= reserved <= on_hand`; available là generated column. Deferred check đối chiếu reserved với active/allocated reservations; quantity/SKU của reservation khớp order item.
- Order có contact và ít nhất một item; tổng dòng/tổng đơn nhất quán khi commit. Snapshot order/item, giá/bảo hành đã duyệt và ledger/audit/idempotency immutable. Chỉ mục unique chống trùng SKU, idempotency scope/key, chứng từ, quote root chuyển đơn, ảnh chính và hold mỗi dòng.
- RFQ chấp nhận mô tả hoặc danh sách; không bắt tồn đủ cho yêu cầu số lượng lớn. Một kênh liên hệ là bắt buộc. Session/token chỉ lưu hash đúng định dạng, có expiry, scope view_masked; mã đơn không là credential.

**Chưa được bảo đảm chỉ bởi schema:** quyền admin theo action; bootstrap Owner; Auth/JWT/MFA; gateway hook; publication gate kiểm asset/spec/giá/policy; search projection đồng bộ; tính giá/thuế/phí; idempotency replay/conflict theo người gọi; transaction tạo đơn/hold; state machine; tổng refund/reversal/return xuyên dòng; ledger đối soát on_hand; rate limiting; TTL cleanup/cron; tra đơn được che; upload Storage. Các phần này cần RPC/API và test ở 08.3–08.10 trước khi cấp quyền ứng dụng.

Do mọi role ứng dụng hiện bị chặn, các bảng chưa có runtime hoàn chỉnh không trở thành API có thể gọi. DB owner vẫn là quyền vận hành đặc biệt, không phải mô hình quyền nhân viên. Không dùng SQL owner để xử lý đơn thật khi chưa có RPC.

Một số cụ thể hóa so với thiết kế: `orders.quote_id` là nguồn duy nhất cho quan hệ chuyển đổi, không tạo cột ngược dư `quotes.converted_order_id`; quote totals được tách thành cột money; `orders.payment_method` được lưu snapshot; `return_items.order_id` hỗ trợ FK kép chặn dòng trả thuộc đơn khác. Đây là chi tiết toàn vẹn, không thay phạm vi kinh doanh.

## 4. Chạy trên Windows

Mở Docker Desktop, chờ engine chạy. Nếu máy mới, cài theo [hướng dẫn Docker Desktop Windows](https://docs.docker.com/desktop/setup/install/windows-install/), hoàn thành WSL/virtualization hoặc restart nếu trình cài yêu cầu. Máy đang làm việc đã có Docker; không cài lại. CLI local cần container runtime theo [hướng dẫn Supabase](https://supabase.com/docs/guides/local-development).

Trong **VS Code → Terminal → New Terminal → PowerShell**, dùng terminal B tại repo; terminal A có thể tiếp tục chạy website.

```powershell
# Vào đúng thư mục; dấu ngoặc kép giữ khoảng trắng trong đường dẫn.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Chỉ cần trên bản clone/giải nén mới: cài đúng dependency đã khóa.
npm.cmd ci
# Mở Supabase local, tạo network riêng và giữ cổng chỉ trên máy này.
npm.cmd run db:start
# Xem trạng thái và URL; lệnh này không in khóa hoặc mật khẩu.
npm.cmd run db:status
# Áp dụng migrations còn thiếu vào local; không xóa dữ liệu đã có.
npm.cmd run db:migrate
# Kiểm SQL, 81 pgTAP, concurrency và HTTP local.
npm.cmd run check:db
# Kiểm hồi quy TypeScript, lint, 82 Vitest, build và Functions.
npm.cmd run check
```

Các lệnh dùng CLI **v3**, nơi `db push` mặc định là **local**. Online cần `--remote` riêng; không chép lệnh từ CLI v2 có `--local`/`--linked` đã đổi. [Thay đổi CLI v3](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3).

Mở Studio ở `http://127.0.0.1:54323`, chọn schema `app` để xem bảng; database trống dữ liệu kinh doanh là đúng. API local dùng 54321, PostgreSQL dùng 54322; website vẫn là 8788/5173. Không cần `.dev.vars` hoặc Supabase key để chạy SQL tests.

```powershell
# Cập nhật tài liệu cột/constraint từ DB local sau migration, không đọc dữ liệu khách.
npm.cmd run db:docs
# Dừng chỉ Supabase của website này, giữ volume dữ liệu.
npm.cmd run db:stop
```

`db:start` dùng network `website-tmdt-local-only`. Trên Docker Desktop đã kiểm thử, tùy chọn network chưa đủ giới hạn bind; helper kiểm tra và thay đúng ba container db/kong/studio bằng cấu hình cũ + `127.0.0.1`, giữ named volume và file cấu hình gateway. Không đụng project khác, không xóa volume, không in credentials. Nếu cấu hình container khác dự kiến, script dừng với lỗi. Không dùng `docker system prune`, `stop --all` hoặc `stop --no-backup` để sửa lỗi.

**Reset không phải lệnh chạy hằng ngày.** Khi muốn kiểm chứng từ đầu trên DB local dùng để thử, kiểm tra/backup dữ liệu cần giữ trước. Lệnh dưới xóa database local rồi áp migrations; không dùng trên project có dữ liệu cần giữ.

```powershell
# Chỉ chạy có chủ đích trên DB local dùng để thử; CLI sẽ hỏi xác nhận.
npx.cmd supabase db reset --no-seed --network-id website-tmdt-local-only
# Kiểm tra/bind lại cổng vì reset có thể tạo lại container database.
npm.cmd run db:start
# Kiểm tra schema vừa dựng lại.
npm.cmd run check:db
```

Lỗi Docker pipe: mở Docker Desktop và chờ engine; kiểm `docker version` trong PowerShell. Lỗi cổng đã dùng: kiểm tra project/process đang dùng 54321–54323, không tự dừng project khác. Pull image thất bại: kiểm mạng/Docker rồi chạy lại `db:start`, không xóa volume. `network ... not found` khi test: dùng `npm.cmd run check:db` để nhận đúng `--network-id`. Gateway 502 sau reset: chạy `db:stop` rồi `db:start` để CLI tái tạo cấu hình, sau đó `check:db`; stop vẫn giữ dữ liệu. SQL/constraint error: đọc mã test, sửa bằng migration mới, không tắt RLS để thử cho qua. `.cmd` tránh lỗi PowerShell chặn `npm.ps1`.

## 5. Tạo Supabase project online sau này

Các bước dưới **chưa thực hiện trên tài khoản của bạn**. Hiện không liên kết remote, không phát sinh hạ tầng online hoặc thay đổi Cloudflare.

1. Mở [Supabase Dashboard](https://supabase.com/dashboard), đăng nhập, tạo/chọn organization thuộc quyền quản lý của bạn.
2. Chọn New project; dùng tên rõ như `website-tmdt-dev` cho thử nghiệm. Chọn plan theo tài khoản, kiểm giới hạn hiển thị trước xác nhận; không tự mua gói. Chọn region phù hợp yêu cầu dữ liệu; region local không quyết định region online.
3. Tạo database password ngẫu nhiên và lưu trong password manager. Không đưa password vào repo, URL chat hoặc screenshot. Chờ project sẵn sàng; ghi Project URL/ID và PostgreSQL major. Local đang major 17; kiểm tương thích trước đẩy nếu online khác major.
4. Trong Auth, tắt public signups và anonymous sign-ins. Chưa tạo/quyền Owner bằng user metadata. Cấu hình admin/Auth cụ thể thuộc 08.3.
5. Trong Data API, tắt tự expose object mới và bỏ schema nghiệp vụ khỏi exposed list. Trong lúc thiết lập có thể tắt Data API. Sau migrations, chỉ expose `api`, không expose `app`, `private` hoặc bảng PII trong `public`. Đây là setting dashboard riêng; file config local không tự sửa project online. [Bảo vệ Data API](https://supabase.com/docs/guides/api/securing-your-api).
6. Nếu cần CLI sau khi đã chọn đúng **project dev rỗng**, chạy các lệnh riêng bên dưới. Lệnh online được cung cấp để người dùng thao tác sau này; chưa chạy trong lần bàn giao này.

```powershell
# Đăng nhập CLI qua luồng của Supabase; không nhập access token vào source.
npx.cmd supabase login
# Hỏi Project ID công khai ngay trong terminal, không phải password hoặc secret key.
$devProjectRef = Read-Host "Project ID của website-tmdt-dev"
# Liên kết thư mục với project dev đã chọn; làm theo xác thực của CLI.
npx.cmd supabase link --project-ref $devProjectRef
# Chỉ xem migration history online để phát hiện project đã có schema/dữ liệu.
npx.cmd supabase migration list --remote
# Xem những migration sẽ áp dụng, chưa thay database.
npx.cmd supabase db push --remote --dry-run --skip-vault
# Chỉ khi đã kiểm đúng project dev và danh sách trên: áp migrations; đọc xác nhận của CLI.
npx.cmd supabase db push --remote --skip-vault
```

Không dùng `db reset --remote`. Nếu online không rỗng hoặc history lệch, dừng push và lập baseline/backfill riêng; không thêm `--include-all` để ép qua lỗi. Không sửa migrations đã được áp dụng ở remote; tạo migration forward mới. Không bật auto-push database trong GitHub/Cloudflare.

Keys chỉ cần ở module API sau. `.env.example` chỉ public frontend; `.dev.vars.example` là mẫu server với giá trị key rỗng, không phải cấu hình thật. Secret key có quyền bypass RLS theo [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys); không gắn tiền tố `VITE_`, không dùng trong browser. Cloudflare preview và production dùng project/secrets riêng khi triển khai. Chưa cam kết Free tier có backup/restore production; RPO/RTO, tải/SKU và TTL vẫn chờ doanh nghiệp.

## 6. Nghiệm thu và điểm dừng

Kết quả thực tế: PostgreSQL **17.11**, tám migrations replay thành công từ DB local trống; **81/81 pgTAP, 2/2 concurrency, 6/6 HTTP, 82/82 Vitest** đạt. SQL lint, TypeScript, ESLint, build 61 URL và Functions compile đạt. Sau tests, 52 bảng nghiệp vụ có **0 dòng dữ liệu**, schema `api` có **0 routine**. Studio HTTP 200 và ba cổng publish chỉ bind `127.0.0.1`. Không coi đây là kiểm thử backend giao dịch hoặc project online.

| Tiêu chí | Bằng chứng |
|---|---|
| Local project chạy, cổng loopback, Studio/API phản hồi | `db:status`, `test:db:surface` |
| Tám migrations chạy từ DB trống | log replay, migration history local |
| 52 bảng đúng schema, RLS bật, không có policy mở | pgTAP + SCHEMA.md |
| Multi-category/type, SKU/price/spec/media FK, unknown/false/0 | pgTAP |
| Inventory/quantity, tổng/snapshot, idempotency unique và contact private | pgTAP |
| Không tự nâng quyền, service direct DML bị revoke, default function execute bị chặn | pgTAP, negative HTTP |
| Hai admin không thể tạo cycle đồng thời | hai PostgreSQL session, cả READ COMMITTED và REPEATABLE READ |
| Fixture không để lại catalog, giá, kho, khách, admin | transaction rollback; concurrency cleanup chỉ UUID thử |
| Ứng dụng frontend/Functions giữ hợp lệ | `npm.cmd run check` |
| Project online | Chưa tạo theo lựa chọn của người dùng; hướng dẫn sẵn ở mục 5 |
| Auth/RLS nghiệp vụ, API đơn/báo giá/admin/upload | Chưa làm; đúng phạm vi dừng 08.1–08.2 |

Logs sạch để bàn giao ở `artifacts/module-08-1-2-db-check.log`, `module-08-1-2-app-check.log`, `module-08-1-2-replay.log` và report tổng hợp. Log khởi động/status thô có thể chứa khóa dev nên **không đưa vào ZIP/Git**. Không có test throughput/khôi phục production, không tuyên bố giao dịch đồng thời/overselling đã được giải quyết bằng unique index đơn lẻ.

Tiếp theo theo PROMPT 08 là **08.3: Auth + RLS/authorization có quyền cụ thể**, sau đó mới mở từng RPC/API. Các số TTL, thuế, phí, RPO/RTO không được thay bằng fixture test. Spec Kit được áp dụng qua DB/CON → migration → test/checklist; giữ thông báo đúng trạng thái theo Impeccable, không giả frontend đã nối database.

## 7. Toàn bộ file tạo/sửa

Mở liên kết để xem nguyên file. Không có source bị lược bỏ.

| Tệp | Thao tác |
|---|---|
| [.dev.vars.example](../.dev.vars.example) | Sửa |
| [.env.example](../.env.example) | Sửa |
| [.gitignore](../.gitignore) | Sửa |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Sửa |
| [DATABASE.md](../DATABASE.md) | Sửa |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Sửa |
| [README.md](../README.md) | Sửa |
| [architecture/ERD.md](../architecture/ERD.md) | Sửa |
| [package-lock.json](../package-lock.json) | Sửa |
| [package.json](../package.json) | Sửa |
| [API.md](../API.md) | Tạo |
| [architecture/SECURITY.md](../architecture/SECURITY.md) | Tạo |
| [docs/MODULE_08_1_2.md](MODULE_08_1_2.md) | Tạo |
| [scripts/check-db-concurrency.mjs](../scripts/check-db-concurrency.mjs) | Tạo |
| [scripts/check-db-surface.mjs](../scripts/check-db-surface.mjs) | Tạo |
| [scripts/docker-loopback.mjs](../scripts/docker-loopback.mjs) | Tạo |
| [scripts/document-db.mjs](../scripts/document-db.mjs) | Tạo |
| [scripts/supabase-local.mjs](../scripts/supabase-local.mjs) | Tạo |
| [supabase/.gitignore](../supabase/.gitignore) | Tạo |
| [supabase/SCHEMA.md](../supabase/SCHEMA.md) | Tạo |
| [supabase/config.toml](../supabase/config.toml) | Tạo |
| [supabase/migrations/20261106000100_foundation.sql](../supabase/migrations/20261106000100_foundation.sql) | Tạo |
| [supabase/migrations/20261106000200_catalog.sql](../supabase/migrations/20261106000200_catalog.sql) | Tạo |
| [supabase/migrations/20261106000300_commerce.sql](../supabase/migrations/20261106000300_commerce.sql) | Tạo |
| [supabase/migrations/20261106000400_quotes.sql](../supabase/migrations/20261106000400_quotes.sql) | Tạo |
| [supabase/migrations/20261106000500_access_operations.sql](../supabase/migrations/20261106000500_access_operations.sql) | Tạo |
| [supabase/migrations/20261106000600_integrity_and_indexes.sql](../supabase/migrations/20261106000600_integrity_and_indexes.sql) | Tạo |
| [supabase/migrations/20261106000700_default_function_privileges.sql](../supabase/migrations/20261106000700_default_function_privileges.sql) | Tạo |
| [supabase/migrations/20261106000800_order_snapshot_guard.sql](../supabase/migrations/20261106000800_order_snapshot_guard.sql) | Tạo |
| [supabase/tests/database/08_schema.test.sql](../supabase/tests/database/08_schema.test.sql) | Tạo |
