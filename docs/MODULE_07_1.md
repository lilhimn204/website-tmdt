# Bàn giao module 07.1 — Header, navigation, footer

Ngày 05/11/2026 · Windows · Phạm vi theo PROMPT 07.

## 1. Kết quả và phạm vi

Đã thêm header, điều hướng desktop/mobile và footer vào `AppShell` hiện tại. Không chuyển thư mục, không thay router, không viết lại màn hình khởi tạo hoặc endpoint health. Phần giữa trang vẫn thuộc Giai đoạn 06; trang chủ bán hàng thuộc module 07.2 chưa được làm.

- Desktop: tên website về trang chủ, vị trí tìm kiếm, hỗ trợ/giỏ hàng, menu danh mục bốn nhóm, thương hiệu, tất cả sản phẩm và yêu cầu báo giá.
- Mobile: nút mở menu, danh mục theo cấp, quay lại, đóng bằng nút/Escape/vùng ngoài, giữ focus, trả focus và khóa cuộn nền. Khi chuyển lên desktop, drawer tự đóng.
- Footer: giới thiệu/liên hệ, hỗ trợ, hướng dẫn, báo giá và sáu mục chính sách. Không tự thêm số điện thoại, địa chỉ, quyền phân phối hoặc cam kết giao hàng/bảo hành.
- Semantic `header`, `nav`, `main`, `footer`; skip link; tên truy cập cho nút icon; viền focus; giảm chuyển động khi hệ điều hành yêu cầu.
- Menu có trạng thái loading, empty và error với callback thử lại. Bản hiện tại dùng `ready` với dữ liệu minh họa, không giả gọi API.

**Giới hạn có chủ đích:** chỉ `/` và `/kiem-tra` đã có trang. Các đích tương lai mang `available: false`, hiển thị `aria-disabled` và không có `href`/tab stop. Ô tìm kiếm bị vô hiệu hóa có giải thích; chưa xử lý query. Chưa có giỏ hàng nên không tự hiển thị số 0. Không nhận đơn hoặc yêu cầu báo giá. Chỉ bật từng đích khi module tương ứng thực sự tồn tại.

## 2. Bám tài liệu và hai phương pháp

| Đầu vào | Áp dụng trong 07.1 |
|---|---|
| PRD C01, C02 và phạm vi MVP | Tạo khung duyệt/tìm; nghiệp vụ tìm kiếm để module sau, không tự thêm tài khoản, wishlist hoặc admin vào storefront |
| SITEMAP: điều hướng desktop/mobile và URL | Một nguồn cấu hình cho cả hai menu, nhóm ngành và namespace danh mục/thương hiệu/sản phẩm/báo giá/chính sách |
| DESIGN hướng A; CMP06, CMP08, CMP11, CMP13 | Nền sáng, xanh ngọc, token màu theo vai trò, Segoe UI hiện có, điều khiển 44–48 px, drawer và trạng thái rõ ràng; CMP13 mới là vị trí giao diện |
| Spec Kit | Truy vết yêu cầu → component → AC07.1 → kiểm thử; ghi giới hạn và dừng đúng module |
| Impeccable | Phân cấp rõ, nội dung trung thực, khả năng dùng bằng bàn phím, responsive, kiểm tra thực tế và sửa lỗi focus |

Đây là áp dụng phương pháp từ [Spec Kit](https://github.com/github/spec-kit) và [Impeccable](https://github.com/pbakaus/impeccable), không tuyên bố đã cài/chạy CLI của hai repo. Hướng A được dùng làm cơ sở thực hiện yêu cầu hiện tại, chưa phải xác nhận nhận diện thương hiệu cuối cùng. Favicon hình màn hình là biểu tượng kỹ thuật tạm, không phải logo doanh nghiệp.

## 3. Toàn bộ tệp tạo hoặc sửa

Mỗi liên kết dưới đây mở nguyên tệp đầy đủ. Mã đã được áp dụng trực tiếp trong workspace; không cần chép các đoạn code vào vị trí khác. Bản ZIP trong `artifacts/website-tmdt-module-07-1-2026-11-05.zip` chứa toàn bộ source/config/docs cùng bằng chứng kiểm tra, không chứa `node_modules`, bản build, Git history hoặc secret.

| Tệp đầy đủ | Thao tác / trách nhiệm |
|---|---|
| [navigation-data.ts](../src/components/navigation-data.ts) | Tạo: kiểu dữ liệu, đích URL, danh mục minh họa và chính sách |
| [site-link.tsx](../src/components/site-link.tsx) | Tạo: link thật khi có trang, trạng thái chưa khả dụng khi chưa có |
| [category-menu-state.tsx](../src/components/category-menu-state.tsx) | Tạo: loading/empty/error và retry |
| [search-form.tsx](../src/components/search-form.tsx) | Tạo: vị trí tìm kiếm và mô tả chưa khả dụng |
| [desktop-navigation.tsx](../src/components/desktop-navigation.tsx) | Tạo: disclosure/menu desktop, Escape và đóng khi rời menu |
| [mobile-navigation.tsx](../src/components/mobile-navigation.tsx) | Tạo: dialog, cấp danh mục, focus, scroll lock và breakpoint |
| [storefront-header.tsx](../src/components/storefront-header.tsx) | Tạo: header chung, vị trí giỏ/hỗ trợ và nhãn preview |
| [storefront-footer.tsx](../src/components/storefront-footer.tsx) | Tạo: footer và nội dung chờ doanh nghiệp |
| [app-shell.tsx](../src/components/app-shell.tsx) | Sửa: ghép header/main/footer và skip link |
| [app.css](../src/app.css) | Sửa: token Tailwind, layout, focus, dialog và reduced motion |
| [root.tsx](../src/root.tsx) | Sửa: khai báo favicon, tránh request favicon.ico bị 404 |
| [favicon.svg](../public/favicon.svg) | Tạo: biểu tượng kỹ thuật tạm trên tab |
| [storefront-shell.test.tsx](../tests/storefront-shell.test.tsx) | Tạo: 12 test UI hành vi và trạng thái |
| [ui-setup.ts](../tests/ui-setup.ts) | Tạo: cleanup và shim dialog/matchMedia cho jsdom; không giả chứng minh focus trap trình duyệt |
| [check-navigation.mjs](../scripts/check-navigation.mjs) | Tạo: Playwright kiểm tra Edge thật, viewport, focus và ảnh bằng chứng |
| [vitest.config.ts](../vitest.config.ts) | Sửa: nhận test TSX và JSX automatic qua OXC |
| [tsconfig.tools.json](../tsconfig.tools.json) | Sửa: typecheck test UI và kiểu DOM/Vite |
| [eslint.config.js](../eslint.config.js) | Sửa: globals cho test trình duyệt |
| [package.json](../package.json) | Sửa: icon/test dependencies và lệnh test:navigation |
| [package-lock.json](../package-lock.json) | Sửa: khóa chính xác dependency mới |
| [README.md](../README.md) | Sửa: trạng thái hiện tại và đường dẫn bàn giao |
| [DESIGN.md](../DESIGN.md) | Sửa: ghi mốc triển khai 07.1, giữ các quyết định thiết kế còn mở |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Sửa: cập nhật phạm vi hiện tại và điểm dừng |
| [MODULE_07_1.md](MODULE_07_1.md) | Tạo: tài liệu bàn giao này |

Thư viện mới được khóa phiên bản: `@phosphor-icons/react` 2.1.10; dev-only `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2, `@testing-library/user-event` 14.6.8, `jsdom` 30.1.3 và `playwright` 1.64.1. Icon import riêng từng tệp; không kéo toàn bộ icon set vào bundle. Node đã kiểm thử là 24.15.0, phù hợp yêu cầu jsdom.

## 4. Hướng dẫn áp dụng và chạy trên Windows

Mở VS Code → Open Folder → `C:\Users\Minh\Documents\ChatGPT\Website TMDT`. Chọn **Terminal → New Terminal → PowerShell**. Các lệnh chạy trong terminal, không gõ vào ô chat. Không cần quyền administrator hoặc secret.

**Terminal A — xem website:** source đã sửa sẵn. Nếu server cũ đang chạy, nhấn Ctrl+C trong terminal của server trước khi chạy lại.

```powershell
# Đi đến thư mục dự án; ngoặc kép giữ nguyên dấu cách trong tên thư mục.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Build bản hiện tại rồi chạy Cloudflare Pages local tại cổng 8788.
npm.cmd run preview
```

Mở **http://127.0.0.1:8788**. Giữ terminal A chạy. Khi lấy bản mới ở máy khác hoặc giải nén ZIP vào thư mục mới, chạy `npm.cmd ci` trước `preview`: lệnh này cài đúng các phiên bản trong lockfile. Máy hiện tại đã được cài dependencies, không cần cài lại. Dùng `.cmd` để tránh PowerShell chặn `npm.ps1`.

**Terminal B — kiểm tra:** mở thêm PowerShell tại cùng thư mục; A vẫn phục vụ localhost.

```powershell
# Đặt thư mục làm việc của terminal B.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Kiểm tra TypeScript, lint, toàn bộ Vitest, build và Pages Functions.
npm.cmd run check
# Gửi HTTP kiểm tra HTML/CSS/API và lỗi 404 trên Pages đang chạy.
npm.cmd run smoke
# Mở Edge headless để kiểm tra menu, responsive và bàn phím; tự đóng sau khi xong.
npm.cmd run test:navigation
```

Chỉ chạy lệnh tiếp khi lệnh trước thành công. Muốn chạy riêng 12 UI test: `npm.cmd test -- tests/storefront-shell.test.tsx` trong terminal B. Test browser mặc định dùng Microsoft Edge đã cài trên máy; không điều khiển cửa sổ hoặc profile Edge cá nhân. Playwright chỉ được phép truy cập localhost trong script này. Nếu máy chỉ có Chrome, đặt `$env:BROWSER_CHANNEL = "chrome"` trong terminal B rồi chạy lại `npm.cmd run test:navigation`; biến chỉ áp dụng cho terminal đó. Hướng dẫn [browser channel](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-channel) và [viewport emulation](https://playwright.dev/docs/emulation).

**Lỗi thường gặp:**

- `EADDRINUSE`/cổng 8788 đang dùng: sử dụng server đang chạy, hoặc Ctrl+C đúng terminal đó rồi chạy lại; không dừng tiến trình không liên quan.
- `ECONNREFUSED` ở smoke/browser: chạy `preview` ở terminal A, đợi dòng `Ready on http://127.0.0.1:8788`.
- Browser executable không tồn tại: cài/mở Edge theo hướng dẫn Windows hoặc dùng Chrome đã có bằng biến trên. Unit tests không cần trình duyệt cài ngoài.
- Giao diện vẫn cũ: chạy lại `preview` để build source mới rồi Ctrl+F5 trong trình duyệt.
- Search/giỏ hàng/chính sách không bấm được: trạng thái đúng của 07.1; chức năng và trang tương ứng chưa được triển khai.

## 5. Thiết kế component để tiếp tục sau này

`AppShell` nhận `navigationState` và `cartCount` tùy chọn. Header/footer nhận tên từ `VITE_APP_NAME` hoặc tên tạm `Website TMĐT`. Có thể chỉnh tên công khai trong `.env` theo `.env.example`; không đưa secret vào biến `VITE_*`.

`NavigationState` phân biệt `ready`/`loading`/`error`. `ready` có `groups` và `preview`; nhóm có danh sách con. `NavigationItem` có `label`, `to`, `available`. Hai menu dùng chung nguồn dữ liệu; không có hai bộ quy tắc phân loại độc lập. Các module sau nối nguồn catalog và bật `available` khi route đã tồn tại. `SiteLink` dùng React Router khi khả dụng; không dùng `href="#"`.

Dialog dùng native `showModal()` để nền inert, bổ sung vòng Tab ở biên, Escape/onClose để trả focus và phục hồi overflow cũ. Desktop dùng native details/summary, không gán `role="menu"` cho navigation website. Tham chiếu [WAI disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) và [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

## 6. Kiểm thử thực tế và nghiệm thu

**Đã kiểm tra thành công ngày 05/11/2026:** typecheck, lint không warning, 24 Vitest (12 health + 12 UI), production prerender/build, Pages Functions compile, HTTP smoke và 10 nhóm kiểm tra browser. Edge **156.0.4314.58**, Playwright 1.64.1; browser không có console error/page error trong luồng đã kiểm tra. Đã xem trực tiếp ảnh desktop, mobile và menu mở. Bằng chứng được lưu trong `artifacts/module-07-1-*`; không commit ảnh/log build vào Git.

| ID | Tiêu chí | Bằng chứng / kết quả |
|---|---|---|
| AC07.1-01 | Header/footer dùng chung, có đúng landmark và một h1 của nội dung trang | **Đạt** — UI tests; `/` và `/kiem-tra` |
| AC07.1-02 | Danh mục desktop mở bằng click/bàn phím, Escape/ngoài menu/rời focus đóng | **Đạt** — unit + browser |
| AC07.1-03 | Mobile đi cấp danh mục, quay lại, đóng, trả focus, khóa cuộn nền | **Đạt** — unit + browser native dialog |
| AC07.1-04 | Tab/Shift+Tab giữ trong drawer; nền không nhận focus; lên desktop tự đóng | **Đạt** — browser, không suy từ jsdom |
| AC07.1-05 | Không tràn ngang tại 320, 390, 768, 1024, 1440 px | **Đạt** — browser viewport + xem ảnh |
| AC07.1-06 | Có skip link, tên nút icon, focus-visible, reduced motion | **Đạt** — unit + browser + xem CSS/ảnh |
| AC07.1-07 | Phân biệt loading/empty/error, retry gọi đúng callback | **Đạt** — UI tests |
| AC07.1-08 | Mock có nhãn; đích chưa làm không đi vào 404; không bịa cart count/liên hệ/chính sách | **Đạt** — UI tests + kiểm tra giao diện |
| AC07.1-09 | Source compile, lint, test, prerender và Functions đều đạt | **Đạt** — `npm.cmd run check` |
| AC07.1-10 | HTML/CSS/health/HEAD/405/404 cũ còn hoạt động | **Đạt** — `npm.cmd run smoke` |

Đánh giá kỹ thuật của 07.1: đạt các tiêu chí trên. Phê duyệt hình ảnh/nội dung cuối cùng của doanh nghiệp vẫn do người dùng quyết định; không tự chuyển quyết định đó thành nghiệm thu kinh doanh.

Giới hạn nghiệm thu: browser automation dùng Edge/Chromium trên Windows với viewport giả lập, chưa phải thử trên điện thoại vật lý, Safari/iOS hoặc trình đọc màn hình thực tế; chưa tuyên bố chứng nhận WCAG. Toàn bộ test này chỉ chứng minh bộ khung/menu, không chứng minh nghiệp vụ bán hàng, Supabase hoặc production đã sẵn sàng.

Audit ngày 05/11/2026: production dependencies **0 lỗ hổng được npm audit báo cáo**; toàn bộ cây còn **10 moderate** trong chuỗi công cụ lint/minimatch. Không dùng `audit fix --force` vì các đề xuất thay major/toolchain ngoài phạm vi module; giữ vấn đề này để xử lý bằng nâng cấp có kiểm thử. Báo cáo đầy đủ nằm trong `artifacts/module-07-1-audit-*.json`.

## 7. Điểm dừng

Đã giới hạn công việc ở 07.1. Chưa làm banner/danh mục/sản phẩm nổi bật của 07.2; chưa triển khai sản phẩm, tìm kiếm, so sánh, giỏ hàng, checkout, báo giá, nội dung chính sách hoặc database. Doanh nghiệp vẫn cần cung cấp tên/logo, catalog, liên hệ và chính sách chính thức ở bước phụ thuộc phù hợp.
