# Bàn giao 08.3 — Auth, authorization và RLS

Ngày 19/11/2026, Windows/PowerShell. Tiếp nối 08.1–08.2 theo yêu cầu “tiếp tục”. Chỉ thực hiện 08.3; chưa chuyển 08.4–08.10. Tài liệu này thay trạng thái cũ về Auth; không sửa kết quả lịch sử của các module đã bàn giao.

## 1. Phạm vi

- Supabase Auth local: public signup/anonymous tắt, TOTP enroll/verify bật. Không seed tài khoản hoặc mật khẩu.
- Sáu vai trò Owner/Catalog/Sales/Warehouse/Finance/Support, 23 mã quyền kỹ thuật. Quyền có hiệu lực từ DB, không từ user metadata.
- MFA bắt buộc để quản trị; kiểm user, phiên và factor còn sống. Thu hồi role, inactive, ban, logout hoặc bỏ factor khiến request sau bị từ chối.
- RLS/ACL hạn chế SELECT trên 52 bảng; không mở DML trực tiếp. RFQ theo assignee, order chỉ các cột summary; contact/token/finance raw vẫn khóa.
- Pages Functions: GET admin/session; POST admin/access và admin/logout. Mutation quyền có CAS, khóa giao dịch, guard Owner cuối cùng và audit.
- Gateway pre-request cho PostgREST; DB chỉ giữ hash, Pages giữ secret trong binding local. Không dùng service key trong Auth adapter.

Chưa có UI đăng nhập/MFA/nhân sự, API catalog/checkout/đơn/báo giá/upload, project cloud hoặc deploy. Frontend DEMO không đổi; không mở nhận đơn. Không tạo Owner thật trong lần bàn giao này.

Theo cách làm Spec Kit đã áp dụng trong dự án: phạm vi → hợp đồng/quyền → migrations/implementation → test → checklist. Impeccable không dẫn đến sửa giao diện trong module backend này.

## 2. Toàn bộ tệp nguồn tạo/sửa

Các liên kết mở nguyên tệp đầy đủ, không phải đoạn code trích. Không cần tự chép snippet lên tệp cũ.

| Tệp | Nội dung |
|---|---|
| [admin_roles_rls.sql](../supabase/migrations/20261110000100_admin_roles_rls.sql) | Vai trò/quyền, predicates, RLS/SELECT và context RPC |
| [admin_access_control.sql](../supabase/migrations/20261110000200_admin_access_control.sql) | Bootstrap, khóa/CAS, audit, guard Owner |
| [data_api_gateway.sql](../supabase/migrations/20261110000300_data_api_gateway.sql) | Hash gateway, pre-request hook |
| [deferred_owner_guard.sql](../supabase/migrations/20261119000100_deferred_owner_guard.sql) | Quyền thực thi đúng cho trigger deferred |
| [config.toml](../supabase/config.toml) | TOTP local |
| [types.ts](../server/auth/types.ts) | Binding types, DTO, whitelist roles/permissions |
| [supabase.ts](../server/auth/supabase.ts) | Auth verification và RPC bằng JWT gốc |
| [handlers.ts](../server/auth/handlers.ts) | Origin, body limit, validation, session/access/logout |
| [session.ts](../functions/api/v1/admin/session.ts) | Route GET session |
| [access.ts](../functions/api/v1/admin/access.ts) | Route POST access |
| [logout.ts](../functions/api/v1/admin/logout.ts) | Route POST logout |
| [setup-auth-local.mjs](../scripts/setup-auth-local.mjs) | Sinh/tái dùng gateway local, lưu binding/hash, không in secret |
| [bootstrap-owner-local.mjs](../scripts/bootstrap-owner-local.mjs) | Bootstrap operator một lần, chỉ local |
| [docker-loopback.mjs](../scripts/docker-loopback.mjs) | Bind loopback cho hai project allowlist, nối lại DB clients |
| [check-db-surface.mjs](../scripts/check-db-surface.mjs) | Kiểm gateway/schema/signup/Studio |
| [check-auth-integration.mjs](../scripts/check-auth-integration.mjs) | Auth/TOTP/Pages thật trong stack riêng |
| [document-db.mjs](../scripts/document-db.mjs) | Sinh metadata schema, cập nhật mô tả quyền |
| [08_auth.test.sql](../supabase/tests/database/08_auth.test.sql) | RLS/roles/MFA/revocation/CAS/gateway/Owner |
| [08_schema.test.sql](../supabase/tests/database/08_schema.test.sql) | Điều chỉnh assertions ACL theo 08.3; giữ invariants nền |
| [auth.test.ts](../tests/auth.test.ts) | 49 unit tests HTTP/Auth adapter |
| [package.json](../package.json) | Thêm lệnh setup/bootstrap/integration; không thêm dependency |
| [.dev.vars.example](../.dev.vars.example) | Binding mẫu, không chứa khóa thật |
| [.env.example](../.env.example) | Ghi rõ frontend chưa kết nối Auth |
| [SCHEMA.md](../supabase/SCHEMA.md) | Metadata 52 bảng thực tế |
| [API.md](../API.md) | Request/response/lỗi/giới hạn |
| [SECURITY.md](../architecture/SECURITY.md) | Ma trận quyền và trust boundaries |
| [ARCHITECTURE.md](../ARCHITECTURE.md), [DATABASE.md](../DATABASE.md) | Phân biệt thiết kế đích với phần đã triển khai |
| [README.md](../README.md), [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Trạng thái/hướng dẫn tiếp tục |
| [MODULE_08_3.md](MODULE_08_3.md) | Bàn giao này |

Migrations đã áp dụng trước đây được giữ nguyên; sửa deferred guard bằng migration bổ sung. Không đổi cấu trúc src/frontend hoặc phiên bản thư viện. `.dev.vars` local được script tạo nhưng không đưa vào Git/ZIP.

## 3. Chạy trên máy Windows này

Mở Docker Desktop và chờ engine sẵn sàng. Mở VS Code → Terminal → New Terminal → **PowerShell**, không Run as administrator. Các dòng bắt đầu bằng # giải thích lệnh. Chạy từng dòng, chỉ tiếp tục nếu lệnh trước thành công.

**Terminal A**, thư mục dự án:

```powershell
# Chọn đúng thư mục có package.json.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Chỉ cần nếu máy mới hoặc chưa cài thư viện; giữ đúng lockfile.
npm.cmd ci
# Bật Supabase local, giữ data volumes và giới hạn cổng loopback.
npm.cmd run db:start
# Áp dụng các migrations còn thiếu vào local; không reset dữ liệu.
npm.cmd run db:migrate
# Sinh cấu hình local/hash gateway; không cần nhập hoặc dán secret.
npm.cmd run auth:setup:local
# Typecheck, lint, unit tests, build frontend và compile Functions.
npm.cmd run check
# Bật bản build + Pages Functions local; giữ terminal này mở.
npm.cmd run pages:dev
```

Website: http://127.0.0.1:8788. Studio: http://127.0.0.1:54323. Dùng thống nhất 127.0.0.1; localhost có origin khác. Sau setup hoặc đổi .dev.vars, dừng Pages bằng Ctrl+C và bật lại. Không cần bật endpoint admin để dùng frontend DEMO.

**Terminal B**, PowerShell cùng thư mục:

```powershell
# Kiểm tra database, RLS, schema, concurrency nền và HTTP surface.
npm.cmd run check:db
# Kiểm Auth/TOTP/Pages thật trong stack thử riêng, cần build đã có.
npm.cmd run test:auth:integration
# Kiểm bindings/cổng trạng thái local, không in keys.
npm.cmd run db:status
```

Integration dùng website-tmdt-auth-test, API 55421, PostgreSQL 55422, Studio 55423, Pages 8791. Nó tạo tài khoản ngẫu nhiên @example.invalid, mật khẩu/TOTP trong memory, kiểm thật rồi dừng/xóa riêng stack thử. Không sửa user/database ứng dụng website-tmdt. Chỉ chạy một bản integration tại một thời điểm; có thể cần tải Docker images lần đầu. Không dùng tài khoản, dữ liệu hoặc secret production cho test.

Để dừng local khi không dùng, sau khi dừng Pages trong terminal A:

```powershell
# Dừng riêng Supabase ứng dụng; giữ volumes để lần sau dùng tiếp.
npm.cmd run db:stop
```

## 4. Owner local và đăng nhập

Không cần tạo Owner thật để chạy test. Khi chuẩn bị tài khoản vận hành local:

1. Mở Studio local → Authentication → Users → Add user/Create user; dùng tài khoản do bạn quản lý. Mật khẩu chỉ nhập trong Studio, không vào chat/source. Xác nhận email theo công cụ Auth; không sửa raw auth tables bằng SQL.
2. Copy UUID của Auth user đã xác nhận, không copy token/secret.
3. Trong PowerShell ở gốc repo chạy lệnh dưới, nhập UUID, tên hiển thị và lý do khi được hỏi. Script không hỏi mật khẩu và chỉ nhắm container local website-tmdt.

```powershell
# Bootstrap Owner một lần và ghi audit; không tự chạy khi migration/signup.
npm.cmd run auth:bootstrap:local
```

4. Backend yêu cầu chuỗi Auth chính thức: signInWithPassword → mfa.enroll(TOTP) → mfa.challenge → mfa.verify → dùng access token aal2 mới. Những lần sau challenge/verify factor đã đăng ký. Module này chưa có màn hình để thao tác chuỗi đó; bài integration kiểm chứng tự động bằng tài khoản thử, không phải công cụ đăng nhập cho Owner thật.
5. Gọi GET admin/session xác nhận context. Chỉ Owner+MFA mới gọi POST admin/access để cấp quyền. Khi thêm staff cần tạo Auth user đã xác nhận trước. Hợp đồng và version ở [API.md](../API.md).

Không dùng user_metadata.role để cấp quyền. Nếu bootstrap báo OWNER_ALREADY_BOOTSTRAPPED, không xóa bảng hoặc tắt guard: dùng Owner hiện có. Chuẩn bị hai Owner độc lập trước production để giảm rủi ro mất MFA; hệ thống hiện chỉ bắt buộc giữ tối thiểu một.

## 5. Khôi phục và đổi gateway

**Mất MFA:** nếu còn Owner khác, người đó có thể vô hiệu hóa tài khoản bị mất thiết bị. Operator có quyền quản lý Supabase Auth xác minh danh tính ngoài hệ thống, thu hồi session/factor bị mất qua công cụ Auth, rồi người dùng đăng nhập và enroll/verify factor mới. Giữ role assignments nếu chỉ khôi phục MFA. Ghi sự cố và thao tác operator; không bật aal1 admin hoặc mở RLS để khôi phục. Nếu không còn truy cập Supabase project/operator, cần khôi phục quyền nền tảng trước, không có public endpoint vượt MFA.

**Gateway local:** auth:setup:local giữ lại secret hợp lệ đang có và cập nhật hash tương ứng. Không cần mở tệp để copy khóa. Khi mất .dev.vars local, script sinh lại và Pages cần restart. Nó từ chối tệp chỉ môi trường/URL khác local.

**Đổi gateway hosted sau này:** operator sinh random tối thiểu 32 byte, chỉ lưu binding secret; SQL giữ SHA-256. Trong một transaction chuyển hash current sang previous với valid_until ngắn do operator chọn, ghi current mới. Cập nhật Pages secret, kiểm RPC hoạt động, rồi xóa previous sau khi mọi instance dùng khóa mới. previous bắt buộc có hạn; không đặt thời hạn vô hạn. Không ghi raw secret vào migration, SQL Editor history, Git hay ticket. Quy trình hosted chưa chạy và chưa có project cloud.

## 6. Lỗi thường gặp

| Hiện tượng | Xử lý |
|---|---|
| npm.ps1 bị chặn | Dùng npm.cmd như tài liệu; không cần tắt ExecutionPolicy toàn máy |
| Không kết nối dockerDesktopLinuxEngine | Mở Docker Desktop, chờ engine. Nếu ứng dụng bị kẹt, đóng/mở lại; không factory reset hoặc xóa volumes |
| Cổng 8788/8791 hoặc 55421–55423 bận | Dừng đúng terminal/process thử đang chạy; không đổi origin tùy tiện hoặc dừng dự án khác |
| 503 AUTH_NOT_CONFIGURED | Chạy db:migrate rồi auth:setup:local; restart Pages. Không tắt gateway |
| 403 MFA_REQUIRED | Token aal1 chưa đủ; hoàn tất verify và dùng token mới |
| 403 FORBIDDEN | Kiểm assignment/profile/factor/session; không tự mở grants |
| 403 ORIGIN_NOT_ALLOWED | Dùng đúng APP_ORIGIN/127.0.0.1 và header Origin khi gọi POST |
| 409 ACCESS_VERSION_CONFLICT | Đọc lại version; không lặp mutation với bản cũ |
| 409 LAST_OWNER_REQUIRED | Cấp quyền Owner hợp lệ khác trước khi thu hồi Owner hiện tại |
| TOTP không hợp lệ | Đồng bộ giờ Windows/điện thoại; dùng mã mới, không log secret TOTP |
| Integration báo test project already exists | Lần trước bị ngắt; kiểm và dọn **chỉ project test** theo lệnh bên dưới |

Sau khi xác nhận không có integration đang chạy, chỉ dùng lệnh sau để dọn stack thử còn sót. Lệnh có --no-backup sẽ bỏ dữ liệu thử của tên project được ghi rõ, không dùng với website-tmdt:

```powershell
# Xem tên container trước khi dọn, không hiển thị cấu hình/secret.
docker ps -a --format "{{.Names}}"
# Dừng và bỏ riêng dữ liệu test; không thay tên project sang ứng dụng.
npx.cmd --no-install supabase stop --workdir "artifacts/website-tmdt-auth-test" --project-id website-tmdt-auth-test --no-backup
```

## 7. Kiểm chứng và checklist

Kết quả được cập nhật từ lệnh thực tế, không từ dự đoán. Unit tests giả lập upstream không chứng minh chữ ký JWT thật; pgTAP dùng claims fixture trong transaction; integration bổ sung đường Auth/TOTP thực.

- [x] TypeScript strict, lint, 131 Vitest tests (49 Auth + 82 hiện có), build 61 URL và Functions compile.
- [x] Database lint không có lỗi/cảnh báo; 136 pgTAP (55 Auth + 81 schema).
- [x] Hai kiểm tra category concurrency và 7 HTTP surface checks.
- [x] 21 kiểm tra integration với Auth/TOTP/JWT thật, PostgREST và Pages; gồm logout, gỡ MFA, tamper JWT, concurrent Owner removal và audit rollback. Stack thử đã dọn thành công.
- [x] Không mở database public hoặc dùng service secret trong frontend/Pages Auth.
- [x] Không có Owner thật, project online hoặc API bán hàng được tạo.
- [x] Tệp đầy đủ, hướng dẫn Windows, hợp đồng API và ranh giới quyền.
- [x] Mã nguồn và bằng chứng bàn giao qua Git/ZIP; SHA commit và checksum tệp nằm trong handoff/manifest của gói.

Kiểm thử runtime đã phát hiện và sửa: quyền của deferred Owner trigger; kết nối Auth cũ sau khi bind lại Docker; Wrangler tìm nhầm cấu hình khi thư mục test chưa có package.json; redirect=error không được workerd hỗ trợ; POST logout có stream rỗng thay vì body=null. Đã bổ sung regression tests và chạy lại toàn bộ check sau sửa. 12 migrations được replay trong stack integration tạo mới; database ứng dụng vẫn có 0 Auth user, 0 assignments, chưa bootstrap Owner.

Bằng chứng sạch được đưa vào ZIP: check, db-check, auth-integration, handoff verification và manifest. Không đưa CLI startup logs, .dev.vars, test cache, node_modules, build hoặc database vào ZIP. Các log lịch sử lần lỗi giữ local nhưng không dùng làm bằng chứng pass.

Giới hạn còn mở: UI admin/login, kiểm thử hosted, chống spam phân tán/WAF/Turnstile, chính sách vận hành, dữ liệu doanh nghiệp, TTL COD/chuyển khoản và RPO/RTO. Các mã quyền cho business action không đồng nghĩa đã có API tương ứng. Bước kế tiếp khi được yêu cầu: **08.4 — API thương hiệu và danh mục**.

Nguồn tham chiếu chính thức: [MFA enrollment](https://supabase.com/docs/reference/javascript/auth-mfa-enroll), [Auth MFA](https://supabase.com/docs/guides/auth/auth-mfa), [sessions](https://supabase.com/docs/guides/auth/sessions), [API security](https://supabase.com/docs/guides/api/securing-your-api), [local Auth config](https://supabase.com/docs/guides/local-development/cli/config).
