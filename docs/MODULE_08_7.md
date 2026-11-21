# Bàn giao 08.7 — API giỏ hàng và rà soát checkout

Ngày 21/11/2026. Tiếp tục sau module 08.6 (commit b567c3b). Phạm vi: phiên khách, kiểm tra giỏ và tính bản rà soát checkout; chưa tạo đơn/giữ hàng/thanh toán, chưa tích hợp frontend. Không tạo Supabase cloud, tài khoản hoặc catalog doanh nghiệp. Dữ liệu frontend vẫn DEMO.

## 1. Kết quả và tiêu chí

| Mã | Hành vi | Kiểm chứng |
|---|---|---|
| CK07.1 | Cookie khách ngẫu nhiên, chỉ hash trong DB, CSRF gắn phiên | Unit, pgTAP, Pages thật |
| CK07.2 | Reuse phiên, cấp CSRF mới, logout/expiry thu hồi quyền | pgTAP, integration |
| CK07.3 | Chỉ nhận SKU/quantity; chặn giả giá, trùng SKU, vượt giới hạn | Unit, pgTAP, integration |
| CK07.4 | Xác minh visibility/lifecycle/retail, giá hiện hành, tồn, bảo hành, thông số bắt buộc | pgTAP, integration |
| CK07.5 | Thuế/phí/giới hạn mua theo chính sách đã duyệt; thiếu thì chặn | pgTAP, integration |
| CK07.6 | Tiền chính xác, fingerprint thay đổi theo giá/số lượng; không giữ hàng | pgTAP, integration |
| CK07.7 | Một RPC service được phép; anon/staff/raw tables vẫn bị chặn | Schema ACL, HTTP integration |
| CK07.8 | Rate limit nguyên tử, lỗi không rollback bộ đếm | pgTAP, 34 request song song |

Áp dụng Spec Kit theo yêu cầu → contract → implementation → kiểm thử → nghiệm thu; không cài hoặc chạy CLI Spec Kit. Tiếp tục nguyên tắc Impeccable về trạng thái rõ ràng: unknown không phải 0, thiếu chính sách khác lỗi dịch vụ, preview khác tạo đơn. Không có thay đổi UI để nghiệm thu thị giác ở module này.

## 2. Tệp đầy đủ và cấu trúc

Các liên kết mở nguyên tệp đã ghi trong repo. Không cần ghép các đoạn code từ chat. Không thay dependency hoặc cấu trúc frontend.

| Tệp tạo/sửa | Nội dung |
|---|---|
| [checkout_review.sql](../supabase/migrations/20261121000400_checkout_review.sql) | RPC service, session/hash, giới hạn truy cập, kiểm giỏ và preview |
| [checkout_lint.sql](../supabase/migrations/20261121000500_checkout_lint.sql) | Khai báo volatility/default JSON chính xác; giữ migration đã áp dụng |
| [types.ts](../server/commerce/types.ts) | Environment, action và mã lỗi |
| [validation.ts](../server/commerce/validation.ts) | JSON bounded, request allowlist, số lượng/địa bàn |
| [dto.ts](../server/commerce/dto.ts) | Projection response, kiểm tiền và trạng thái |
| [handler.ts](../server/commerce/handler.ts) | Origin, cookie, CSRF, HMAC IP, transport service |
| [guest/session.ts](../functions/api/v1/guest/session.ts) | POST tạo/khôi phục phiên |
| [guest/logout.ts](../functions/api/v1/guest/logout.ts) | POST thu hồi phiên |
| [cart/review.ts](../functions/api/v1/cart/review.ts) | POST kiểm tra giỏ |
| [checkout/preview.ts](../functions/api/v1/checkout/preview.ts) | POST tính bản rà soát |
| [checkout.test.ts](../tests/checkout.test.ts) | 68 unit test mới |
| [08_checkout.test.sql](../supabase/tests/database/08_checkout.test.sql) | 72 pgTAP mới, fixture TEST rollback |
| [08_schema.test.sql](../supabase/tests/database/08_schema.test.sql) | Allowlist 15 RPC, chỉ service có commerce_request |
| [checkout-integration.mjs](../scripts/lib/checkout-integration.mjs) | 31 kiểm thử qua Pages + PostgreSQL thật |
| [check-auth-integration.mjs](../scripts/check-auth-integration.mjs) | Nối suite, secret chỉ ở scratch, mạng test riêng |
| [docker-loopback.mjs](../scripts/docker-loopback.mjs) | Giữ loopback/volumes trên đúng mạng mỗi project |
| [setup-commerce-local.mjs](../scripts/setup-commerce-local.mjs) | Tự lấy secret local, tạo HMAC, không in key |
| [.dev.vars.example](../.dev.vars.example), [package.json](../package.json) | Binding mẫu và lệnh setup commerce |
| [document-db.mjs](../scripts/document-db.mjs), [SCHEMA.md](../supabase/SCHEMA.md) | Metadata 52 bảng, thêm expiry index |
| [API.md](../API.md) | Request/response, mã lỗi, policy contract |
| [SECURITY.md](../architecture/SECURITY.md), [ARCHITECTURE.md](../ARCHITECTURE.md), [DATABASE.md](../DATABASE.md) | Trust boundary và phạm vi thực thi |
| [README.md](../README.md), [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md), tài liệu này | Trạng thái, chạy local và bàn giao |

```text
functions/api/v1/
  guest/session.ts
  guest/logout.ts
  cart/review.ts
  checkout/preview.ts
server/commerce/
  types.ts
  validation.ts
  dto.ts
  handler.ts
scripts/
  setup-commerce-local.mjs
  lib/checkout-integration.mjs
supabase/migrations/
  20261121000400_checkout_review.sql
  20261121000500_checkout_lint.sql
supabase/tests/database/08_checkout.test.sql
tests/checkout.test.ts
docs/MODULE_08_7.md
```

## 3. Chạy trên Windows

Mở Docker Desktop; đợi Docker Engine sẵn sàng. Trong VS Code mở thư mục dự án, Terminal → New Terminal → **PowerShell**. Các lệnh dưới chạy ở terminal A, từng dòng. Không nhập vào chat hoặc SQL Editor. `npm.cmd` tránh lỗi PowerShell chặn npm.ps1.

```powershell
# Chọn đúng thư mục đã có dự án; không tạo lại template.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Khởi động Supabase local của dự án, giữ dữ liệu cũ, chỉ mở cổng loopback.
npm.cmd run db:start
# Áp dụng migration còn thiếu lên local; không reset database.
npm.cmd run db:migrate
# Điền publishable/gateway local vào tệp bị Git bỏ qua; không in secret.
npm.cmd run auth:setup:local
# Điền secret/HMAC và TTL thử nghiệm local; không tạo policy hay đơn hàng.
npm.cmd run commerce:setup:local
# Kiểm tra TypeScript, ESLint, unit test, build và Pages Functions.
npm.cmd run check
# Kiểm database lint, pgTAP, concurrency và bề mặt HTTP.
npm.cmd run check:db
# Chạy API thật trên project thử nghiệm riêng; tự dọn project test khi kết thúc.
npm.cmd run test:backend:integration
```

Xem giao diện tại localhost trong **terminal B**, cùng thư mục:

```powershell
# Build giao diện rồi chạy Pages local tại http://127.0.0.1:8788.
npm.cmd run preview
```

Giao diện vẫn DEMO và chưa gọi API 08.7. Mở URL API bằng thanh địa chỉ sẽ nhận 405 vì đây là POST, không phải trang web. Bộ integration tự thử cookie/CSRF/checkout nên không cần tự sao chép key. Với database local hiện chưa có catalog/policy, checkout trả `CHECKOUT_NOT_CONFIGURED` là hành vi đúng.

Sau khi thử, nhấn **Ctrl+C** trong terminal B để dừng Pages. Trong terminal A:

```powershell
# Dừng riêng Supabase của website và giữ volume dữ liệu.
npm.cmd run db:stop
# Kiểm tra còn container nào chạy trước khi thoát Docker Desktop.
docker ps --format "{{.Names}}"
```

Nếu không còn công việc Docker khác, chọn Quit Docker Desktop. Không dùng reset, prune hoặc xóa volume để giải quyết lỗi thường gặp.

## 4. Cấu hình và lỗi thường gặp

| Binding | Cách dùng |
|---|---|
| APP_ENV, APP_ORIGIN | `local` chỉ cho loopback; online HTTPS, Origin chính xác |
| SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, DATA_API_GATEWAY_SECRET | Giữ cấu hình Auth/catalog; gateway vẫn bắt buộc |
| SUPABASE_SECRET_KEY | Chỉ backend commerce gửi qua apikey; không VITE_, không caller JWT |
| REQUEST_HASH_SECRET | 32 byte ngẫu nhiên dạng base64url; HMAC địa chỉ IP trước khi lưu bucket |
| GUEST_SESSION_TTL_SECONDS | Bắt buộc 60–86400, không có default production; local setup dùng 1800 chỉ để thử |
| TURNSTILE_SECRET_KEY | Chưa sử dụng trong preview; chống spam tạo đơn thuộc 08.8 |

Không ghi secret vào source, SQL migration, issue hoặc chat. Script chỉ điền `.dev.vars` bị Git bỏ qua và từ chối URL/môi trường khác local. Đổi bindings phải khởi động lại Pages. Không nâng CLI/dependency chỉ vì có thông báo phiên bản mới trong output.

- **Docker chưa sẵn sàng:** mở Docker Desktop rồi chạy lại db:start; không cần tạo project Supabase online.
- **COMMERCE_NOT_CONFIGURED:** chạy hai lệnh setup local, khởi động lại Pages; kiểm cổng/origin có trùng cấu hình.
- **CSRF_INVALID:** POST guest/session để lấy CSRF mới. Cấp CSRF mới làm token cũ ở tab khác hết hiệu lực; cookie phiên được giữ nguyên.
- **CHECKOUT_NOT_CONFIGURED:** còn thiếu policy đã duyệt, không phải lý do để tự nhập thuế/phí/TTL doanh nghiệp.
- **429:** chờ cửa sổ một phút; header Retry-After=60. Test sử dụng cùng IP loopback nên chia sẻ giới hạn IP.
- **Cổng 8791/55421 hoặc project test tồn tại:** dừng lượt test đang chạy; kiểm tra đúng `website-tmdt-auth-test` theo hướng dẫn 08.3. Không dừng/xóa project ứng dụng để giải quyết xung đột test.
- **Test database đọc nhầm schema khi chạy hai project:** 08.7 đã tách mạng `website-tmdt-auth-test-only` khỏi `website-tmdt-local-only`; chạy mã mới. Script từ chối dùng lại mạng test còn sót, tự xóa mạng do chính lượt test tạo sau khi dọn container.

## 5. Kiểm thử và giới hạn

Kết quả chạy thực tế: TypeScript strict, ESLint, 426 Vitest (68 mới), production build 61 URL và Pages compile đều đạt. Database lint không cảnh báo; 395 pgTAP (72 mới), 4 kiểm tra concurrency catalog, 7 kiểm tra HTTP surface đạt. Integration thực tế: 21 Auth + 23 navigation + 26 products + 30 discovery + 31 checkout = 131 kiểm tra đạt; bao gồm rate limit đồng thời.

Fixture chỉ trong rollback transaction hoặc project `website-tmdt-auth-test`; project test được dọn sau chạy. Lần kiểm tra đầu phát hiện xung đột DNS Docker khi hai project dùng chung mạng; đã tách mạng và chạy lại thành công. Điều này không phải kết quả load test production. Migration 005 sửa cảnh báo lint về volatility/JSON defaults, không sửa lịch sử migration 004 đã áp dụng.

Rate limit hiện là biện pháp kỹ thuật theo phút: 20 lần session/IP, 60 lần mỗi action khác/IP, 30 lần mỗi action/phiên. HMAC IP không lưu IP thô; bộ đếm hết hạn được dọn có giới hạn. Đây chưa thay thế WAF/Turnstile cho bán hàng public. Session hết hạn bị từ chối nhưng lịch xóa dữ liệu session/grant còn cần D07, chưa tự quyết retention.

## 6. Checklist nghiệm thu và bước tiếp

- [x] Bốn endpoint, request/response và toàn bộ source đã bàn giao.
- [x] Giá/tồn/bảo hành/thông số và hạn mức lấy từ backend, không từ client.
- [x] Chính sách thiếu/không hỗ trợ/ambiguous fail closed; phí 0 chỉ nếu rule đã duyệt ghi rõ 0.
- [x] Tiền dạng chuỗi chính xác, không JS float; fingerprint chỉ phát hiện thay đổi.
- [x] Không tạo đơn, không giữ hàng, không thay số tồn hoặc bật nút gửi đơn thật.
- [x] Phiên/CSRF/Origin, service-only RPC, ACL/RLS không mở rộng raw tables.
- [x] Lỗi và đồng thời được kiểm thử trên runtime thật.
- [ ] Doanh nghiệp chốt D05: thuế/làm tròn, giá/phí, vùng giao hàng, hạn mức và điều khoản.
- [ ] Doanh nghiệp chốt D07: TTL/retention phiên khách; TTL giữ hàng COD/chuyển khoản cũng còn chờ.
- [ ] Triển khai 08.8: tạo đơn nguyên tử, chống trùng, giữ kho và quyền xem đơn an toàn.
- [ ] Tích hợp frontend, cloud/production, WAF/Turnstile và kiểm thử tải theo quy mô thật.

Không cần tự viết code để tiếp tục. Module kế tiếp là **08.8 — tạo và quản lý đơn hàng**; không tự triển khai trong lượt 08.7 này.
