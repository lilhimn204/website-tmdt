# Bàn giao 07.7–07.10 — Hoàn thiện frontend DEMO

Ngày bàn giao 06/11/2026 · Windows · Tiếp nối commit `96033ba` của 07.3–07.6. Kết quả kiểm thử ghi ngày chạy thực tế 05/11/2026.

Người dùng yêu cầu “thực hiện nốt các task còn lại”. Đã triển khai bốn module còn lại của PROMPT 07 và nối các đích điều hướng liên quan. **Hoàn thành frontend dùng dữ liệu DEMO, chưa hoàn thành hệ thống nhận đơn/báo giá production.** Không thay đổi cấu trúc thư mục, stack, dependency hoặc backend/API health hiện có.

## 1. Module 07.7 — Checkout

Trang `/dat-hang/` nhận toàn bộ giỏ, gồm các món đã chọn từ trước. Giỏ trống hoặc có SKU/số lượng không hợp lệ không mở form. Form có tên/điện thoại bắt buộc, email tùy chọn, địa chỉ tự do, ghi chú, nhu cầu hóa đơn tùy chọn và lựa chọn COD/chuyển khoản thử nghiệm. Không tự áp danh mục địa giới cũ, không bịa vùng giao hàng, phí, tài khoản ngân hàng hay quy tắc xuất hóa đơn.

“Rà soát thông tin” kiểm tra các trường, hiện lỗi cạnh trường và summary có link/focus tới đúng trường. Bản rà soát hiển thị người nhận, địa chỉ, phương thức, hóa đơn, tất cả SKU/số lượng và tiền hàng DEMO. Thuế/phí và tổng thanh toán thực luôn ghi chưa xác định; không thay bằng 0. Sửa thông tin hoặc giỏ thay đổi làm bước rà soát mất hiệu lực. Mobile đặt tóm tắt giỏ trước form và nhắc lại tiền hàng trước hành động cuối.

**Nút đặt hàng thật bị khóa có giải thích.** Không gọi API giả, không tạo mã đơn, không xóa giỏ hoặc điều hướng sang thành công khi chỉ kiểm tra form. Các route `/dat-hang/da-tiep-nhan/` và `/don-hang/theo-doi/` có trạng thái chưa xác minh; URL/query không là bằng chứng tạo đơn hoặc quyền đọc dữ liệu.

Tệp chính: [checkout-page.tsx](../src/components/checkout-page.tsx), [checkout.tsx](../src/routes/checkout.tsx), [order-receipt.tsx](../src/routes/order-receipt.tsx), [order-tracking.tsx](../src/routes/order-tracking.tsx), [receipt-page.tsx](../src/components/receipt-page.tsx). Form/validation dùng chung tệp ở mục 5; cart đã được nối tới bước thử này.

**Cách thử:** thêm một SKU hợp lệ tại trang sản phẩm → Giỏ → Tiếp tục đặt hàng thử. Để trống form rồi bấm Rà soát; dùng link lỗi tới trường. Nhập dữ liệu mẫu, chọn COD rồi chuyển khoản, thử nhu cầu hóa đơn; rà soát và xác nhận nút gửi cuối vẫn khóa. Test ở terminal B: `npm.cmd test -- tests/request-model.test.ts tests/request-ui.test.tsx`; kiểm thử thật: `npm.cmd run test:requests`.

## 2. Module 07.8 — Yêu cầu báo giá B2B

Trang `/bao-gia/` nhận SKU từ PDP bằng query chỉ chứa mã. Tên + ít nhất một kênh điện thoại/email hợp lệ là bắt buộc. Có thể hỏi bằng danh sách SKU/số lượng **hoặc** mô tả bài toán chưa biết model; công ty, nơi triển khai và thời điểm cần là tùy chọn. Không bắt mã số thuế/tài khoản, không upload tệp.

Có thêm/xóa dòng, focus tới dòng mới hoặc nút thêm khi xóa; phát hiện SKU trùng/không công khai và số lượng sai. Số lượng báo giá được phép lớn hơn tồn DEMO; mẫu EOL chỉ để hỏi thông tin/thay thế, không hứa cung cấp. Giới hạn thử nghiệm: tối đa 30 dòng, mỗi dòng số lượng nguyên 1–999.999; đây là giới hạn UI, không phải quyết định kinh doanh. Link có quá 30 SKU được cảnh báo rõ; SKU sai được giữ để sửa/xóa. Không tự chuyển cả giỏ thành yêu cầu.

“Rà soát yêu cầu” hiển thị bản nháp; sửa nội dung làm mất trạng thái rà soát. **Gửi yêu cầu thật chưa khả dụng**; không có mã tiếp nhận, giá cuối, giữ hàng, SLA hoặc email gửi tự động. `/bao-gia/da-tiep-nhan/` không giả thành công khi mở trực tiếp.

Tệp chính: [quote-page.tsx](../src/components/quote-page.tsx), [quote.tsx](../src/routes/quote.tsx), [quote-receipt.tsx](../src/routes/quote-receipt.tsx); sửa [product-detail.tsx](../src/components/product-detail.tsx) và [home-buying-guide.tsx](../src/components/home-buying-guide.tsx) để mở đúng form.

**Cách thử:** từ PDP Rack, bấm Chuẩn bị yêu cầu báo giá; kiểm tra SKU `DEMO-U1000-R`. Nhập 500, thêm dòng trùng để xem lỗi, đổi sang SKU khác rồi rà soát. Thử riêng `/bao-gia/` chỉ nhập tên/email/mô tả, không thêm SKU. Lệnh test dùng cùng bộ request ở mục 1.

## 3. Module 07.9 — Chính sách, liên hệ, bảo hành

Đã có `/ho-tro/`, `/ho-tro/huong-dan-su-dung/`, `/lien-he/`, `/gioi-thieu/`, `/chinh-sach/` và sáu trang: `bao-hanh`, `doi-tra`, `van-chuyen`, `thanh-toan`, `bao-mat`, `dieu-kien-giao-dich`.

Template gồm breadcrumb, H1, trạng thái, mục lục có bàn phím, section và liên kết đi tiếp. Chính sách/liên hệ/giới thiệu chỉ hiển thị **trạng thái chưa công bố và hướng dẫn dùng bản thử**, không công bố văn bản pháp lý mẫu có hiệu lực. Không có ngày hiệu lực, điện thoại/email/địa chỉ, quyền phân phối, cam kết bảo hành/giao hàng hoặc chứng nhận tự tạo. Bảo hành chung không ghi đè số liệu theo SKU; tài liệu DEMO không là hướng dẫn vận hành thiết bị thật.

Trang bảo vệ thông tin mô tả hành vi thực tế của bản thử: ứng dụng không gửi hoặc lưu form checkout/RFQ vào localStorage/sessionStorage; chỉ cart lưu SKU/số lượng. Trình duyệt có thể tự autofill theo cài đặt riêng. Form mất khi rời hoặc tải lại trang, có thông báo trước khi nhập. Liên kết chính sách trong form mở tab mới, có nhãn rõ, để giữ bản nháp đang sửa. Không thêm form liên hệ trùng RFQ.

Tệp chính: [information-data.ts](../src/components/information-data.ts), [information-page.tsx](../src/components/information-page.tsx), các route [policies](../src/routes/policies.tsx), [support](../src/routes/support.tsx), [guide](../src/routes/guide.tsx), [contact](../src/routes/contact.tsx), [about](../src/routes/about.tsx).

**Cách thử:** mở chính sách bảo hành, dùng Tab/Enter chọn mục lục; đọc trạng thái chưa công bố. Mở liên hệ để thấy các hướng tìm sản phẩm/báo giá/hỗ trợ, không có số hoặc email giả. Test riêng: `npm.cmd test -- tests/request-ui.test.tsx`; browser: `npm.cmd run test:requests`.

## 4. Module 07.10 — Responsive và accessibility

- Giữ token hướng A, nền sáng/teal, điều khiển tối thiểu 44–48 px, font form 16 px và focus-visible.
- Form một cột mobile, hai cột desktop; SKU RFQ dạng khối; select/input co theo khung, không tràn toàn trang. Trường số lượng có bàn phím số; không tự sticky nhiều thanh che nội dung.
- Mỗi trang có H1, label/legend, aria-invalid và mô tả lỗi; summary lỗi có focus/link. Rà soát có focus vào tiêu đề, thêm/xóa dòng có điểm focus hợp lý.
- [route-focus.tsx](../src/components/route-focus.tsx) đưa focus tới H1 sau đổi trang, không chiếm focus khi đổi query lọc/SKU. Sửa menu mobile để link tất cả danh mục cũng đóng drawer. Thanh compare ẩn khi nhập checkout/RFQ.
- Nối các đích nav đã có. Bổ sung `/thuong-hieu/` và hai trang nhãn DEMO A/B; tái sử dụng catalog, giữ phạm vi nhãn khi đổi loại/lọc/reload. Không biến các tên hãng thật tham khảo trên homepage thành đối tác được xác nhận.
- Prerender **61 URL** đã biết, giữ `noindex, nofollow`; URL chính sách/nhãn không tồn tại có HTTP 404. Không tạo SEO Product/Offer giả.

**Cách thử:** dùng Tab từ menu sang báo giá/hỗ trợ, đóng drawer bằng Escape, chuyển trang rồi kiểm tra focus. Mở form tại 320, 360, 390, 768, 1024 và 1440 px; xem bảng compare trong bộ test cũ. Bộ test `test:requests` còn kiểm tra chữ 200% ở trang hỗ trợ, ID/label/mô tả lỗi của form và scope nhãn. Kiểm tra này không thay việc thử Safari/iOS, điện thoại vật lý hoặc trình đọc màn hình.

## 5. Tệp dùng chung, tích hợp và toàn bộ mã nguồn

[request-model.ts](../src/components/request-model.ts) chứa kiểu draft và validation thuần; [request-fields.tsx](../src/components/request-fields.tsx) chứa field, section, error summary, nhãn bản thử và liên kết chính sách. Không tạo service giả hoặc phương thức nhận secret frontend. Nguồn thông tin nằm trong state React của trang; không có ghi log nội dung form.

Toàn bộ tệp tạo/sửa được liệt kê ở cuối tài liệu; mỗi link mở nguyên file, không có code lược bỏ. Mã đã áp dụng trực tiếp vào workspace. ZIP `artifacts/website-tmdt-modules-07-7-10-2026-11-06.zip` chứa toàn bộ source/config/docs và bằng chứng hiện tại, không có `.git`, `node_modules`, build hoặc secret. `module-07-7-10-handoff.json` ghi commit/hash từng tệp; checksum ZIP đi kèm. Tài liệu và ZIP mốc cũ giữ nguyên lịch sử.

## 6. Chạy và áp dụng trên Windows

Trong VS Code, mở folder `C:\Users\Minh\Documents\ChatGPT\Website TMDT`, rồi **Terminal → New Terminal → PowerShell**. Không tạo lại template, không cần copy source hay cài dependency mới trên máy này.

**Terminal A — chạy website:** nếu localhost còn chạy, Ctrl+F5 để lấy bản mới. Nếu cần khởi động lại, Ctrl+C đúng terminal server cũ trước.

```powershell
# Vào thư mục dự án; dấu ngoặc kép giữ đường dẫn có khoảng trắng.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Build source hiện tại rồi chạy frontend và Pages Functions local ở cổng 8788.
npm.cmd run preview
```

Giữ terminal A mở. Trên máy mới hoặc thư mục giải nén mới, chạy `npm.cmd ci` trước `preview`: cài đúng dependency trong lockfile. Dùng Node 24.x theo README. Không cần nhập secret, đăng nhập Supabase hoặc triển khai Cloudflare để xem bản thử. Không giải nén đè lên việc riêng chưa lưu.

**Terminal B — kiểm tra:** mở thêm PowerShell tại cùng thư mục, A tiếp tục phục vụ localhost.

```powershell
# Đặt thư mục làm việc cho terminal B.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Kiểm tra TypeScript, ESLint, toàn bộ Vitest, production build và Functions compile.
npm.cmd run check
# Kiểm tra checkout, RFQ, policies, brand scope, dữ liệu form và bàn phím bằng Edge.
npm.cmd run test:requests
# Kiểm tra hồi quy danh mục, PDP, so sánh và giỏ.
npm.cmd run test:commerce
# Kiểm tra trang chủ, liên kết và các breakpoint.
npm.cmd run test:home
# Kiểm tra menu desktop/mobile, focus, Escape và khóa cuộn.
npm.cmd run test:navigation
# Kiểm tra HTTP, HTML/CSS/API health, HEAD/405 và 404 thật.
npm.cmd run smoke
```

Chỉ chạy lệnh tiếp khi lệnh trước đạt. `.cmd` tránh PowerShell chặn `npm.ps1`. Browser scripts dùng Edge headless đã cài và profile riêng; chỉ chấp nhận localhost. Nếu chỉ có Chrome, `$env:BROWSER_CHANNEL = "chrome"` chọn Chrome trước khi chạy, nhưng chưa coi Chrome là browser đã kiểm thử trong lần này.

Lỗi `ECONNREFUSED`: mở server ở terminal A. `EADDRINUSE`: kiểm tra server cũ và dừng đúng terminal, không dừng tiến trình không liên quan. Thấy giao diện cũ: build lại và Ctrl+F5. Gửi cuối bị khóa là trạng thái đúng của bản thử; không mở bằng sửa database public hoặc thêm secret vào frontend. Form mất khi tải lại cũng là hành vi có chủ ý, không dùng localStorage để giữ thông tin khách.

Git đã kết nối repo; không cần `git init` hoặc commit đầu tiên lại. `git status --short` xem việc chưa lưu; `git log -3 --oneline` xem ba commit gần nhất, chạy ở terminal B. Trên bản clone sạch ở máy khác, `git pull --ff-only` nhận commit mới mà không tạo merge tự động; không dùng force/reset để ghi đè thay đổi riêng.

## 7. Kết quả và checklist

Kiểm tra thực tế 05/11/2026: **82/82 Vitest, 7 file test**; typecheck/lint/build/Pages Functions compile đạt. Production build 61 URL. HTTP smoke kiểm tra 16 trang, API health, HEAD/405 và 404 thật. Edge 156 trên Windows: 5 nhóm request + 7 commerce + 11 home + 10 navigation; không lỗi console/page/hydration hoặc request giao dịch POST/PUT/PATCH/DELETE trong các luồng kiểm thử. Đã xem ảnh giao diện desktop/mobile; không chỉ dựa vào test DOM.

| Tiêu chí | Kết quả frontend / bằng chứng |
|---|---|
| AC07.7-01 — Giỏ trống/lỗi chặn nhập, toàn bộ giỏ được rà soát | Đạt — request UI + browser |
| AC07.7-02 — Contact/address/payment, lỗi từng trường và summary/focus | Đạt — model/UI/browser |
| AC07.7-03 — COD/chuyển khoản có nhãn thử; phí/tổng chưa biết không là 0 | Đạt — UI/browser, không có tài khoản/QR giả |
| AC07.7-04 — Không fake receipt, không xóa giỏ, không gửi/lưu form | Đạt — UI/browser/network/storage; giao dịch thật chưa triển khai |
| AC07.8-01 — SKU/số lượng hoặc nhu cầu; ít nhất một kênh liên hệ | Đạt — model/UI/browser |
| AC07.8-02 — Prefill đúng SKU, thêm/xóa, trùng/sai/số lượng và EOL | Đạt — model/UI/browser |
| AC07.8-03 — Rà soát/sửa, không tạo yêu cầu/giữ kho/SLA giả | Đạt — UI/browser; gửi thật chưa triển khai |
| AC07.9-01 — Sáu policies, hỗ trợ/hướng dẫn/liên hệ/giới thiệu; mục lục | Đạt — UI/browser; nội dung chính thức còn chờ doanh nghiệp |
| AC07.9-02 — Không bịa liên hệ, ngày hiệu lực, bảo hành hoặc quyền bán | Đạt — data review/UI/browser |
| AC07.10-01 — Viewport 320–1440, form labels/IDs/descriptions | Đạt — browser + xem ảnh |
| AC07.10-02 — Error/review/row/route focus, menu, table và reduced motion | Đạt — request + regression browser |
| AC07.10-03 — Nhãn hàng giữ scope, URL sai/receipt không lộ dữ liệu | Đạt — browser và HTTP 404 |
| AC07-COMMON — Typecheck/lint/tests/prerender/Functions, không thêm dependency | Đạt — check log, lockfile không đổi |

Bằng chứng trong `artifacts/module-07-7-10-*`: check/build/smoke logs, request browser JSON/log, ảnh checkout/quote/policy/contact/brand desktop và `-mobile`; logs regression commerce/home/navigation. Ảnh regression hiện tại còn ở `home-current-*`, `navigation-current-*`, `module-07-3-06-*` theo script cũ; ZIP lưu bằng chứng tương ứng của bản này. Chỉ dùng dữ liệu kiểm thử như `TEST-PRIVATE-*`, không phải thông tin khách thật.

## 8. Ranh giới hoàn thành và công việc backend sau frontend

Đã hoàn thành phạm vi giao diện PROMPT 07 bằng mock được gắn nhãn. Những việc dưới đây **chưa được thực hiện và không nằm trong kết luận frontend đã đạt**:

1. API tạo đơn/báo giá thật, lỗi mạng/timeout/retry/idempotency và tra cứu kết quả giao dịch đã gửi. Hiện không có request để giả lập thành công hoặc timeout.
2. Database/migrations/Supabase, RLS, quyền xem đơn khách, admin tác nghiệp, kiểm giá server-side và tồn kho nguyên tử. Lọc fixture không là bảo mật server.
3. Catalog, ảnh/tài liệu, pháp nhân, liên hệ, chính sách, giá/thuế/phí, vùng COD, tài khoản chuyển khoản và SLA do doanh nghiệp xác nhận. Chưa đủ để công bố website bán hàng.
4. Chốt tải/SKU, TTL giữ hàng, RPO/RTO, sao lưu/khôi phục và kiểm chứng hạn mức runtime trước triển khai. Người dùng đã trả lời chưa có thông tin này; không tự điền bằng giá trị thử.
5. Kiểm thử thiết bị thật/Safari/trình đọc màn hình và tải production; chưa tuyên bố chứng nhận WCAG hoặc điểm Lighthouse chưa đo.

Không deploy, không gửi email/tin nhắn, không mở thu tiền. Khi nối API cần bổ sung xác nhận điều kiện thực, adapter có trạng thái pending/retry/unknown-result, server-authoritative totals và receipt được xác minh trước khi mở nút gửi cuối. Tài liệu này không yêu cầu người dùng phê duyệt lại các chỉnh sửa frontend đã được cho phép.

Áp dụng Spec Kit bằng truy vết C07–C11/S03 → module → AC → test và tách dữ liệu còn thiếu; áp dụng Impeccable bằng phân cấp, nội dung trung thực, mobile và keyboard audit theo DESIGN. Không cài/chạy CLI của hai repo, không tự thay thiết kế bằng một bộ phong cách khác.

## 9. Danh sách đầy đủ tệp tạo/sửa

Danh sách bên dưới được đối chiếu với Git trước commit; mỗi liên kết là nguyên file.

| Tệp đầy đủ | Thao tác |
|---|---|
| [DESIGN.md](../DESIGN.md) | Sửa |
| [docs/MODULE_07_7_10.md](MODULE_07_7_10.md) | Tạo |
| [eslint.config.js](../eslint.config.js) | Sửa |
| [package.json](../package.json) | Sửa |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Sửa |
| [react-router.config.ts](../react-router.config.ts) | Sửa |
| [README.md](../README.md) | Sửa |
| [scripts/check-commerce.mjs](../scripts/check-commerce.mjs) | Sửa |
| [scripts/check-requests.mjs](../scripts/check-requests.mjs) | Tạo |
| [scripts/smoke.mjs](../scripts/smoke.mjs) | Sửa |
| [src/components/app-shell.tsx](../src/components/app-shell.tsx) | Sửa |
| [src/components/cart-page.tsx](../src/components/cart-page.tsx) | Sửa |
| [src/components/catalog-data.ts](../src/components/catalog-data.ts) | Sửa |
| [src/components/catalog-filters.tsx](../src/components/catalog-filters.tsx) | Sửa |
| [src/components/catalog-page.tsx](../src/components/catalog-page.tsx) | Sửa |
| [src/components/catalog-ui.tsx](../src/components/catalog-ui.tsx) | Sửa |
| [src/components/checkout-page.tsx](../src/components/checkout-page.tsx) | Tạo |
| [src/components/home-buying-guide.tsx](../src/components/home-buying-guide.tsx) | Sửa |
| [src/components/information-data.ts](../src/components/information-data.ts) | Tạo |
| [src/components/information-page.tsx](../src/components/information-page.tsx) | Tạo |
| [src/components/mobile-navigation.tsx](../src/components/mobile-navigation.tsx) | Sửa |
| [src/components/navigation-data.ts](../src/components/navigation-data.ts) | Sửa |
| [src/components/product-detail.tsx](../src/components/product-detail.tsx) | Sửa |
| [src/components/quote-page.tsx](../src/components/quote-page.tsx) | Tạo |
| [src/components/receipt-page.tsx](../src/components/receipt-page.tsx) | Tạo |
| [src/components/request-fields.tsx](../src/components/request-fields.tsx) | Tạo |
| [src/components/request-model.ts](../src/components/request-model.ts) | Tạo |
| [src/components/route-focus.tsx](../src/components/route-focus.tsx) | Tạo |
| [src/routes.ts](../src/routes.ts) | Sửa |
| [src/routes/about.tsx](../src/routes/about.tsx) | Tạo |
| [src/routes/brands.tsx](../src/routes/brands.tsx) | Tạo |
| [src/routes/checkout.tsx](../src/routes/checkout.tsx) | Tạo |
| [src/routes/contact.tsx](../src/routes/contact.tsx) | Tạo |
| [src/routes/guide.tsx](../src/routes/guide.tsx) | Tạo |
| [src/routes/order-receipt.tsx](../src/routes/order-receipt.tsx) | Tạo |
| [src/routes/order-tracking.tsx](../src/routes/order-tracking.tsx) | Tạo |
| [src/routes/policies.tsx](../src/routes/policies.tsx) | Tạo |
| [src/routes/quote-receipt.tsx](../src/routes/quote-receipt.tsx) | Tạo |
| [src/routes/quote.tsx](../src/routes/quote.tsx) | Tạo |
| [src/routes/support.tsx](../src/routes/support.tsx) | Tạo |
| [tests/commerce-ui.test.tsx](../tests/commerce-ui.test.tsx) | Sửa |
| [tests/home.test.tsx](../tests/home.test.tsx) | Sửa |
| [tests/request-model.test.ts](../tests/request-model.test.ts) | Tạo |
| [tests/request-ui.test.tsx](../tests/request-ui.test.tsx) | Tạo |
