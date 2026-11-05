# Bàn giao 07.3–07.6 — Catalog, chi tiết, so sánh và giỏ

Ngày 05/11/2026 · Windows · Tiếp nối commit `fe07948` của 07.2.

Người dùng yêu cầu làm từ 07.3 đến 07.6, sau đó tiếp tục công việc. Bản này hoàn thành bốn module frontend trong phạm vi đó. Không triển khai 07.7, API giao dịch, database hoặc deploy. Giữ nguyên cấu trúc dự án, dependency, React Router Framework Mode/Vite/Tailwind và Pages Functions hiện tại.

## 1. Dữ liệu, phương pháp và phạm vi

- **DEMO:** 15 sản phẩm, 18 SKU; nhãn hàng giả định A/B; giá, lượng hàng, thông số và tháng bảo hành chỉ để kiểm thử. Nhãn DEMO xuất hiện ở header, từng trang và khu vực giá. Không phải đề nghị bán hàng, dữ liệu XTREND hoặc khẳng định quyền phân phối.
- **Chưa được doanh nghiệp cung cấp:** catalog thật, tên/logo, ảnh/tài liệu có quyền sử dụng, giá/thuế/tồn, chính sách bảo hành, phí vận chuyển và nội dung liên hệ. Không tự suy các dữ liệu này từ fixture.
- **Ảnh/tài liệu:** hai SVG tự vẽ dạng sơ đồ, có chữ “Minh họa”; file TXT giải thích bộ DEMO, không giả làm datasheet. Các mẫu khác hiện chưa có ảnh/tài liệu được duyệt.
- **Giới hạn giao dịch:** thêm giỏ không giữ kho, tạo đơn, nhận thanh toán hay gửi yêu cầu báo giá. Nút đặt hàng chưa mở. localStorage chỉ chứa SKU/số lượng; không chứa giá, địa chỉ hoặc thông tin khách.
- **Spec Kit:** truy vết PRD C01–C06 → module → tiêu chí AC bên dưới → test; giữ quyết định kinh doanh chưa xác minh. **Impeccable:** giữ token hướng A, nhãn rõ, mobile card dạng hàng, trạng thái có lý do, focus/bàn phím và cuộn bảng độc lập. Đây là áp dụng phương pháp đã ghi trong DESIGN, không tuyên bố cài/chạy CLI của hai repo.

## 2. Module 07.3 — Danh mục, tìm kiếm và bộ lọc

**Đã làm:** danh sách theo SKU, danh mục cha/con dùng taxonomy hiện có; tìm tên/nhãn hàng có hoặc không dấu, SKU/model chính xác trước tiền tố; lọc OR trong thuộc tính, AND giữa thuộc tính; khoảng số hai đầu; sắp xếp tên/giá và phân trang 6 SKU. Thiếu giá hoặc cần báo giá nằm cuối khi sắp giá. Bộ lọc riêng cho UPS, máy in, RAM, SSD, mainboard, PSU, case, tản nhiệt và switch. Nhóm hỗn hợp chỉ có bộ lọc chung; nhóm chưa có mẫu hiện trạng thái trống.

URL giữ `q`, `danh-muc`, `thuong-hieu`, `sap-xep`, `trang` và khóa thuộc tính. Tải lại/Back giữ bộ lọc. URL sai có giải thích và nút đặt lại, không âm thầm diễn giải giá trị sai. Đổi loại thiết bị bỏ thông số cũ có thông báo. Mobile dùng dialog: Hủy bỏ bản nháp, Áp dụng ghi URL; Escape, Tab, trả focus và khóa cuộn nền.

**Tệp tạo riêng, mở liên kết để xem toàn bộ code:**

| Tệp | Vai trò |
|---|---|
| [catalog-data.ts](../src/components/catalog-data.ts) | Fixture, kiểu dữ liệu, taxonomy và schema thuộc tính; dùng chung 4 module |
| [catalog-model.ts](../src/components/catalog-model.ts) | Tìm/lọc/sắp xếp/phân trang; kiểm tra giá trị; hàm thuần cho compare/cart |
| [catalog-ui.tsx](../src/components/catalog-ui.tsx) | Card, nhãn DEMO, loading/error/empty, lựa chọn/thanh so sánh |
| [catalog-filters.tsx](../src/components/catalog-filters.tsx) | Form desktop/mobile và dialog |
| [catalog-page.tsx](../src/components/catalog-page.tsx) | Trang dùng chung ba chế độ danh mục/tất cả/tìm kiếm |
| [use-preview-search.ts](../src/components/use-preview-search.ts) | Áp dụng query sau hydration để khớp HTML prerender |
| [catalog.tsx](../src/routes/catalog.tsx) | Route `/danh-muc/:category?` |
| [products.tsx](../src/routes/products.tsx) | Route `/san-pham/` |
| [search.tsx](../src/routes/search.tsx) | Route `/tim-kiem/` |

**Áp dụng và thử:** code đã nằm trong workspace; chạy theo mục 7, mở `/san-pham/`, chọn RAM → DDR4 → Áp dụng. Hai SKU DDR4 xuất hiện. Tìm `DEMO-U1000-R` từ header phải mở đúng biến thể Rack. Lệnh test riêng: `npm.cmd test -- tests/catalog-model.test.ts tests/commerce-ui.test.tsx` ở terminal B. Kiểm tra URL/thao tác thật bằng `npm.cmd run test:commerce`.

## 3. Module 07.4 — Chi tiết sản phẩm

**Đã làm:** gallery có đổi ảnh và retry khi lỗi; tên, model/SKU, biến thể, giá/tồn DEMO, số lượng, thông số theo nhóm, bảo hành theo SKU, tài liệu và liên kết liên quan. Chọn biến thể đổi đồng bộ giá/thông số/bảo hành. Nhiều biến thể phải chọn rõ; URL SKU rỗng, lặp hoặc khác sản phẩm bị chặn, không dùng SKU thay thế. SKU EOL/quote-only/thiếu giá/thiếu tồn/hết hàng/thiếu bảo hành không thêm giỏ.

| Tệp tạo | Vai trò |
|---|---|
| [product-detail.tsx](../src/components/product-detail.tsx) | PDP và form số lượng; kiểm tra SKU trước hành động |
| [product-gallery.tsx](../src/components/product-gallery.tsx) | Ảnh, chọn hình, ảnh thiếu/lỗi và thử lại |
| [product.tsx](../src/routes/product.tsx) | Route `/san-pham/:slug/` |
| [demo-device-front.svg](../public/demo-device-front.svg) | Sơ đồ minh họa mặt trước |
| [demo-device-back.svg](../public/demo-device-back.svg) | Sơ đồ minh họa mặt sau |
| [demo-catalog-notes.txt](../public/demo-catalog-notes.txt) | Ghi chú tải xuống, không phải tài liệu kỹ thuật sản phẩm thật |

**Áp dụng và thử:** mở `/san-pham/ups-demo-1000/?sku=DEMO-U1000-R`, đổi Rack ↔ Tower để thấy bảo hành mẫu 24 ↔ 12 tháng và giá khác nhau. Thử URL `?sku=DEMO-P100` trên cùng sản phẩm: không được thêm giỏ. Test riêng bằng `npm.cmd test -- tests/commerce-ui.test.tsx`; browser dùng `npm.cmd run test:commerce`.

Danh sách liên quan chỉ là các slug khai báo thủ công để thử vị trí UI theo PROMPT 07.4; không suy tương thích hay mở bộ máy C12/C17. Tư vấn/RFQ chưa có endpoint nên chỉ thông báo chưa mở, không dựng nút gửi giả.

## 4. Module 07.5 — So sánh

**Đã làm:** chọn tối đa 3 SKU cùng family từ catalog/PDP; giữ lựa chọn trước khi từ chối SKU thứ tư hoặc khác loại. Trang `/so-sanh/?sku=...&sku=...` tái lập danh sách sau reload/chia sẻ URL. URL lặp/khác loại/không tồn tại có lỗi và từng nút bỏ; không âm thầm thay SKU. Bảng nhóm thông số, giá/khả dụng/bảo hành; tô hàng khác nhau và có nhãn chữ. Giá trị thiếu luôn “Chưa xác minh”/“Chưa đủ dữ liệu”, kể cả cả hai cùng thiếu; `false`, `0`, `not-applicable` giữ nghĩa riêng.

| Tệp tạo | Vai trò |
|---|---|
| [comparison-page.tsx](../src/components/comparison-page.tsx) | Kiểm tra URL, bảng và gỡ SKU; vùng cuộn có tên và bàn phím |
| [compare.tsx](../src/routes/compare.tsx) | Route `/so-sanh/` |

Logic/schema/card/store dùng chung các tệp ở mục 2 và 5. Danh sách chọn ngoài trang compare ở bộ nhớ phiên; URL trên trang compare là nguồn để khôi phục. Nút “Tiếp tục chọn sản phẩm” nhận danh sách hợp lệ từ URL vào phiên hiện tại.

**Áp dụng và thử:** chọn `DEMO-U1000-T`, `DEMO-U1500-T`, `DEMO-U2000-T` tại nhóm UPS rồi mở so sánh. Hàng công suất thực vừa khác nhau vừa thiếu dữ liệu; thời gian lưu điện thiếu ở mọi cột vẫn không được đánh dấu bằng nhau. Test riêng `npm.cmd test -- tests/catalog-model.test.ts`; browser `npm.cmd run test:commerce` kiểm tra giới hạn và bảng tại 320 px.

## 5. Module 07.6 — Giỏ thử nghiệm

**Đã làm:** thêm/xóa, gộp cùng SKU, tách biến thể khác, nhập hoặc tăng/giảm số lượng nguyên 1–99 và không vượt lượng mẫu. Tạm tính chỉ từ dữ liệu hiện tại. Giữ dòng SKU đã mất/EOL/vượt tồn để người dùng xử lý; không tính tổng có vẻ hợp lệ khi còn dòng lỗi. Phân biệt đang khôi phục với giỏ trống. Lỗi JSON, phiên bản bộ nhớ sai hoặc không được phép lưu có thông báo.

| Tệp tạo | Vai trò |
|---|---|
| [preview-store.ts](../src/components/preview-store.ts) | State cart/compare, validation, thông báo, lưu tối đa 30 SKU |
| [preview-context.ts](../src/components/preview-context.ts) | Hook đăng ký state dùng chung |
| [preview-provider.tsx](../src/components/preview-provider.tsx) | Khởi tạo localStorage sau hydration; fallback trong bộ nhớ |
| [cart-page.tsx](../src/components/cart-page.tsx) | Dòng giỏ, lỗi số lượng, xóa, tạm tính và chặn đặt hàng |
| [cart.tsx](../src/routes/cart.tsx) | Route `/gio-hang/` |

Khóa lưu: `website-tmdt.demo-cart.v1`. Payload duy nhất: `{ "version": 1, "lines": [{ "sku": "DEMO-U1000-T", "quantity": 2 }] }`. Không tin giá/tên được chèn vào bản lưu; dữ liệu không hợp lệ bị loại có giải thích. SKU hợp lệ về định dạng nhưng không còn công khai vẫn được giữ làm dòng cần xử lý. Chưa đồng bộ nhiều tab/thiết bị, chưa có giỏ server.

**Áp dụng và thử:** thêm Rack 2, Tower 1; thêm lại Rack 1 → giỏ có hai dòng, Rack 3. Đổi Rack thành 2 → tạm tính 340.000 đ kiểm thử. Nhập 6 cho Rack bị từ chối vì fixture chỉ có 5. F5 vẫn giữ số lượng hợp lệ. Test riêng `npm.cmd test -- tests/catalog-model.test.ts tests/commerce-ui.test.tsx`; browser `npm.cmd run test:commerce`.

## 6. Tích hợp, kiểm thử và toàn bộ tệp còn lại

Không di chuyển thư mục frontend/backend. Các tệp sửa để nối 4 module vào dự án:

| Tệp | Thay đổi |
|---|---|
| [root.tsx](../src/root.tsx) | Bọc provider; giữ noindex cho bản DEMO |
| [routes.ts](../src/routes.ts) | Khai báo 6 route mới |
| [react-router.config.ts](../react-router.config.ts) | Prerender 42 URL đã biết; giữ HTTP 404 cho URL không tồn tại |
| [app.css](../src/app.css) | Token/component class cho button/input dùng chung |
| [app-shell.tsx](../src/components/app-shell.tsx) | Số lượng giỏ thật từ state DEMO, live region và thanh compare |
| [navigation-data.ts](../src/components/navigation-data.ts) | Mở các route đã triển khai; các trang chưa làm vẫn không khả dụng |
| [search-form.tsx](../src/components/search-form.tsx) | Tìm kiếm bằng query URL |
| [storefront-header.tsx](../src/components/storefront-header.tsx) | Thông báo DEMO có giá/giỏ thử |
| [mobile-navigation.tsx](../src/components/mobile-navigation.tsx) | Nội dung trạng thái điều hướng hiện tại |
| [home-categories.tsx](../src/components/home-categories.tsx) | Liên kết đến danh mục thật |
| [home-data.ts](../src/components/home-data.ts) | Lấy 4 SKU nổi bật từ cùng catalog DEMO |
| [home-featured-products.tsx](../src/components/home-featured-products.tsx) | Giải thích dữ liệu/giá giả định |
| [preview-product-card.tsx](../src/components/preview-product-card.tsx) | Mở đúng PDP/SKU; hiện giá có nhãn kiểm thử |
| [package.json](../package.json) | Thêm `test:commerce`; không thêm dependency |
| [eslint.config.js](../eslint.config.js) | Globals browser cho script mới |
| [catalog-model.test.ts](../tests/catalog-model.test.ts) | Tạo: 18 test logic tìm/lọc/compare/cart |
| [commerce-ui.test.tsx](../tests/commerce-ui.test.tsx) | Tạo: 10 test trạng thái, ảnh lỗi, query SKU, form và khôi phục giỏ |
| [home.test.tsx](../tests/home.test.tsx) | Cập nhật 10 test trang chủ và liên kết fixture |
| [storefront-shell.test.tsx](../tests/storefront-shell.test.tsx) | Cập nhật 12 test khung cho provider/search/nav đang mở |
| [check-commerce.mjs](../scripts/check-commerce.mjs) | Tạo: browser test 4 module, ảnh và báo cáo |
| [check-home.mjs](../scripts/check-home.mjs) | Regression liên kết catalog/SKU; ảnh hiện tại riêng lịch sử 07.2 |
| [check-navigation.mjs](../scripts/check-navigation.mjs) | Regression menu khi có thêm đích khả dụng |
| [smoke.mjs](../scripts/smoke.mjs) | HTML/CSS 8 trang, API và 404 thật |
| [README.md](../README.md) | Trạng thái, cây thư mục, hướng dẫn/lệnh |
| [DESIGN.md](../DESIGN.md) | Ghi mốc triển khai, giữ quyết định thiết kế mở |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Phạm vi tiếp tục, kết quả và điểm dừng |
| [MODULE_07_3_06.md](MODULE_07_3_06.md) | Tạo: bàn giao này |

Mỗi liên kết mở **nguyên tệp mã nguồn**; không có phần lược bỏ. ZIP `artifacts/website-tmdt-modules-07-3-06-2026-11-05.zip` chứa toàn bộ source/config/docs và bằng chứng hiện tại. Không chứa `node_modules`, build, `.git` hoặc secret. Manifest `artifacts/module-07-3-06-handoff.json` ghi commit và SHA-256 từng tệp; checksum ZIP nằm cạnh gói. Giữ các tài liệu 07.1/07.2 làm lịch sử, không sửa số liệu nghiệm thu của mốc cũ.

## 7. Chạy trên Windows

Mở VS Code → Open Folder → `C:\Users\Minh\Documents\ChatGPT\Website TMDT`. Terminal → New Terminal → **PowerShell**. Không chép lại source hoặc chạy công cụ tạo template; code đã được áp dụng đầy đủ. Không cần thêm thư viện hoặc secret trên máy hiện tại.

**Terminal A — chạy website:** nếu localhost 8788 đã mở, dùng Ctrl+F5. Nếu cần khởi động lại, Ctrl+C tại terminal đang chạy server trước; không dừng tiến trình không liên quan.

```powershell
# Đi vào gốc dự án; giữ ngoặc kép vì đường dẫn có khoảng trắng.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Build mã hiện tại, rồi chạy Pages local tại cổng 8788; giữ terminal này mở.
npm.cmd run preview
```

Máy mới hoặc thư mục giải nén mới: chạy `npm.cmd ci` trước `preview` ở terminal A để cài đúng lockfile. Dùng Node 24.x theo README; `.cmd` tránh lỗi chặn `npm.ps1`. Gói ZIP không có Git history; không giải nén đè lên thư mục đang có sửa đổi riêng.

Mở [trang chủ](http://127.0.0.1:8788/), [catalog](http://127.0.0.1:8788/san-pham/), [UPS mẫu](http://127.0.0.1:8788/san-pham/ups-demo-1000/?sku=DEMO-U1000-T) hoặc [giỏ](http://127.0.0.1:8788/gio-hang/). Đây là địa chỉ máy bạn, không phải website đã deploy.

**Terminal B — kiểm tra:** mở PowerShell thứ hai trong VS Code. Giữ terminal A chạy Pages; thực hiện từng lệnh, dừng và đọc lỗi nếu có.

```powershell
# Đặt đúng thư mục trong terminal B.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Kiểm tra kiểu, lint, 62 Vitest, production build và biên dịch Functions.
npm.cmd run check
# Kiểm thử bằng Edge: lọc → biến thể → so sánh/giỏ và các trường hợp sai.
npm.cmd run test:commerce
# Kiểm tra hồi quy trang chủ, 7 độ rộng và liên kết danh mục/SKU.
npm.cmd run test:home
# Kiểm tra hồi quy menu, bàn phím, mobile dialog và breakpoint.
npm.cmd run test:navigation
# Kiểm tra HTTP, HTML prerender, CSS, API health và 404 thật.
npm.cmd run smoke
```

Browser tests chạy Edge headless trong phiên riêng, không dùng profile cá nhân; chỉ chấp nhận localhost. Nếu chỉ có Chrome, đặt `$env:BROWSER_CHANNEL = "chrome"` ở terminal B để chọn Chrome đã cài trước khi chạy. Chưa kiểm chứng Chrome trong lần bàn giao này.

Lỗi thường gặp: `ECONNREFUSED` → khởi động Pages ở terminal A; `EADDRINUSE` → kiểm tra server cũ và Ctrl+C đúng terminal; thấy giao diện cũ → build lại rồi Ctrl+F5; lỗi số lượng → nhập số nguyên không vượt fixture; không lưu được giỏ → đọc thông báo, giỏ chỉ tồn tại trong tab hiện tại. Không sửa ExecutionPolicy toàn máy hoặc đưa secret vào source để xử lý các lỗi này.

Muốn xem lịch sử Git đã lưu, chạy trong terminal B: `git log -3 --oneline` (ba commit gần nhất) và `git status --short` (các thay đổi chưa commit). Không cần khởi tạo Git/commit đầu tiên lại; repo đã có origin. Khi cập nhật trên máy khác, dùng `git pull --ff-only` trong bản clone sạch để nhận commit mới; không dùng force/reset để ghi đè việc riêng.

## 8. Kết quả thực tế và checklist nghiệm thu

Ngày 05/11/2026: **62/62 Vitest đạt** (12 health, 12 shell, 10 home, 18 model, 10 commerce UI); typecheck, lint không warning, production build **42 URL** và Pages Functions compile đều exit 0. Browser Edge có 7 nhóm commerce, 11 nhóm home và 10 nhóm navigation; smoke đạt. Các luồng kiểm thử không có lỗi console/hydration/page hoặc request giao dịch POST/PUT/PATCH/DELETE.

| ID | Tiêu chí frontend | Kết quả / bằng chứng |
|---|---|---|
| AC07.3-01 | Tên/nhãn không dấu; exact SKU/model trước tiền tố; SKU không công khai không hiện | Đạt — model tests |
| AC07.3-02 | Lọc đúng SKU, OR/AND, khoảng số; nhóm hỗn hợp/đổi schema; thiếu không thành 0 | Đạt — model/UI tests, browser |
| AC07.3-03 | URL/reload/Back; sort giá có dữ liệu trước thiếu/quote-only; phân trang không lặp | Đạt — model + browser |
| AC07.3-04 | Empty/invalid riêng; mobile cancel/apply, Tab/Escape, scroll lock, focus return | Đạt — UI + browser native dialog |
| AC07.4-01 | Gallery, ảnh thiếu/lỗi/thử lại; thông số nhóm, bảo hành và tài liệu có nhãn | Đạt — UI tests, browser, xem ảnh |
| AC07.4-02 | Chọn đúng SKU; đổi giá/bảo hành; URL rỗng/lặp/sai không fallback | Đạt — UI + browser |
| AC07.4-03 | Chặn mua EOL/quote-only/thiếu giá/tồn/bảo hành/hết hàng | Đạt — model + browser |
| AC07.5-01 | Tối đa 3 cùng family, không mất lựa chọn cũ; URL sai có cách gỡ | Đạt — model + browser |
| AC07.5-02 | Khác biệt có nhãn; null/false/0/not-applicable khác nghĩa | Đạt — model + browser |
| AC07.5-03 | Bảng cuộn riêng, có header/caption, đọc SKU và dùng bàn phím ở 320 px | Đạt — browser + xem ảnh |
| AC07.6-01 | Gộp đúng SKU/tách biến thể, xóa, số nguyên/vượt tồn, subtotal | Đạt — model/UI + browser |
| AC07.6-02 | Chỉ lưu SKU/qty, không tin giá cũ; lỗi storage và dữ liệu mất/EOL minh bạch | Đạt — model/UI + browser |
| AC07.6-03 | Không giữ hàng/tạo đơn/giả thành công; checkout bị khóa | Đạt — UI + browser/network |
| AC07-COMMON | Giữ khung/route cũ, noindex, 404, responsive, typecheck/build/Functions | Đạt — check/smoke/home/navigation/commerce |

Bằng chứng nằm trong `artifacts/`: `module-07-3-06-check.log`, `module-07-3-06-smoke.log`, `module-07-3-06-browser.log/json`; ảnh `module-07-3-06-{catalog,product,compare,cart}.png` và bản `-mobile.png`; `home-current-*`, `navigation-current-*`. Đã xem ảnh desktop/mobile của các trang. Cổng production local 8788 phục vụ build; không lấy dev server làm bằng chứng production.

Đánh giá: đạt phạm vi **frontend dùng dữ liệu DEMO của 07.3–07.6**. Không đồng nghĩa toàn bộ AC nghiệp vụ PRD hoặc MVP production đã đạt. Thiếu API nên chưa kiểm chứng lỗi mạng catalog thật, giá/tồn thay đổi đồng thời, quyền truy cập backend, transaction, tích hợp Supabase hoặc khôi phục production. Không tạo nháp/giá riêng thật trong bundle; lọc `published` trên fixture không thay cho authorization server. Schema bộ lọc hiện chỉ hiện trường có trong mẫu, không tự bịa ADF/khổ giấy/socket hoặc thời gian UPS.

Browser QA dùng Edge trên Windows với viewport 320–1440 px, chưa phải điện thoại vật lý/Safari hoặc thử với trình đọc màn hình; không tuyên bố chứng nhận WCAG. C03 xử lý URL bộ lọc lỗi bằng thông báo và nút đặt lại, giữ query cho người dùng sửa thay vì âm thầm bỏ. Giỏ đọc lại giá DEMO hiện tại nhưng chưa có giao thức server báo thay đổi giá và xác nhận lại; phải bổ sung khi nối checkout/API. Danh sách fixture là tĩnh, không có cuộc gọi mạng giả để mô phỏng tải thành công.

Giữ nguyên dependency/lockfile, không chạy nâng cấp ngoài phạm vi. Kết quả audit công cụ của các mốc trước là lịch sử, không phải chứng nhận hiện tại. Khi có yêu cầu tiếp tục, module kế tiếp là **07.7 Checkout**; chưa tự triển khai trong lần này.

Tham chiếu kỹ thuật đã đối chiếu khi tích hợp: [React Router prerendering](https://reactrouter.com/how-to/pre-rendering) và [optional route segments](https://reactrouter.com/start/framework/routing#optional-segments). Query lọc/SKU xử lý sau hydration, không tạo vô hạn HTML theo query; các URL catalog/PDP đã biết được tạo HTML lúc build.
