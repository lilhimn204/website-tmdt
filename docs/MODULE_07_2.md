# Bàn giao module 07.2 — Trang chủ

Ngày 05/11/2026 · Windows · Tiếp nối module 07.1 theo yêu cầu “tiếp tục”.

## 1. Phạm vi đã thực hiện

Trang `/` đã có các khối của 07.2: banner, danh mục, sản phẩm nổi bật, thương hiệu, lợi ích và chính sách. Giữ header/navigation/footer của 07.1, cấu trúc thư mục, React Router, Vite và Cloudflare runtime hiện tại. Không thêm thư viện. Trang `/kiem-tra` và API health vẫn hoạt động; liên kết kỹ thuật được bỏ khỏi trang chủ hướng tới khách mua.

| Khối | Nội dung và hành vi thực tế |
|---|---|
| Banner | Thông điệp chọn thiết bị; “Khám phá danh mục” chuyển đến phần ngành hàng trên cùng trang |
| Lối doanh nghiệp | “Chuẩn bị yêu cầu” chuyển đến hướng dẫn chuẩn bị model/số lượng/địa điểm; chưa có form gửi hoặc lưu yêu cầu |
| Danh mục | Bốn nhóm dùng chung taxonomy với navigation; “Gợi ý chọn” chuyển đến hướng dẫn tương ứng, không giả đi tới danh mục chưa làm |
| Sản phẩm nổi bật | Bốn card mẫu; có tên, model/SKU giả mang tiền tố DEMO/MAU, thuộc tính minh họa và trạng thái chưa xác minh |
| Thương hiệu | Sáu tên chữ từ PRODUCT_CATALOG_PLAN; nhãn tham khảo, không lấy logo hoặc tuyên bố quan hệ phân phối |
| Hướng dẫn chọn | Các câu hỏi cần đối chiếu cho UPS, máy in, linh kiện và mạng; không có công cụ tính runtime hoặc suy tương thích |
| Lợi ích/chính sách | Định hướng thông tin rõ trước khi mua; giao hàng, thanh toán, đổi trả, bảo hành và liên hệ ghi rõ chưa được công bố |

**Không có giá bán hoặc tồn kho giả.** Mọi card ghi “Giá chưa công bố”, “Tồn kho chưa xác nhận”, “Mẫu giao diện”; thông số thiếu ghi “Chưa xác minh”, không đổi thành 0 hoặc “Không hỗ trợ”. Chưa có ảnh được duyệt nên dùng icon Phosphor với nhãn “Chưa có ảnh”, không tải ảnh từ XTREND hoặc gắn ảnh AI thành ảnh hàng thật. Các tên thương hiệu tham khảo không được gán cho sản phẩm mẫu.

Header vẫn thông báo bản xem trước. Tìm kiếm, giỏ, báo giá và các trang tương lai còn chưa khả dụng. Không có nút mua/gửi yêu cầu giả, không tự thêm route của 07.3–07.10. Trang giữ `noindex, nofollow` và không phát sinh Product schema cho dữ liệu mẫu.

## 2. Áp dụng yêu cầu và phương pháp

- DESIGN hướng A / DES01: hero ngắn, vùng B2B riêng; danh mục 2 cột mobile, 4 cột desktop; sản phẩm 1 cột dạng hàng mobile, 2 cột tablet, 4 cột từ 1280 px; token và typography của project hiện tại.
- SITEMAP P01 / PRD C01, C09, C11: tạo điểm vào và hướng dẫn; chưa mở nghiệp vụ báo giá hoặc giao dịch. Đích danh mục sẽ nối route ở module 07.3 khi có trang thật.
- [Spec Kit](https://github.com/github/spec-kit): truy vết đầu vào → component → AC07.2 → kiểm thử, ghi rõ dữ liệu và điểm dừng.
- [Impeccable](https://github.com/pbakaus/impeccable): phân cấp rõ, nội dung ngắn, trạng thái có lý do, dùng được bằng bàn phím, kiểm tra responsive và ảnh giao diện thực tế.

Đây là áp dụng phương pháp, không phải tuyên bố đã cài/chạy CLI của hai repo. Giữ phạm vi một module. Không biến việc triển khai giao diện thành xác nhận dữ liệu kinh doanh hoặc chọn nhận diện cuối cùng.

## 3. Toàn bộ tệp tạo/sửa và mã nguồn

Mã đã nằm trực tiếp trong workspace. Mỗi liên kết mở nguyên tệp đầy đủ; không có phần code bị lược bỏ. ZIP `artifacts/website-tmdt-module-07-2-2026-11-05.zip` chứa toàn bộ source/config/docs cùng bằng chứng, không chứa secret, `node_modules`, bản build hoặc Git history.

| Tệp | Thao tác / trách nhiệm |
|---|---|
| [home-data.ts](../src/components/home-data.ts) | Tạo: kiểu state, danh mục/gợi ý, sản phẩm mẫu, tên thương hiệu tham khảo |
| [category-icon.tsx](../src/components/category-icon.tsx) | Tạo: icon theo nhóm ngành, dùng thư viện hiện có |
| [home-section-state.tsx](../src/components/home-section-state.tsx) | Tạo: loading skeleton, empty, error và retry cho từng khối |
| [home-hero.tsx](../src/components/home-hero.tsx) | Tạo: banner và lối hướng dẫn B2B |
| [home-categories.tsx](../src/components/home-categories.tsx) | Tạo: bốn ngành hàng và liên kết đến hướng dẫn |
| [preview-product-card.tsx](../src/components/preview-product-card.tsx) | Tạo: card mẫu, chưa phải card bán hàng có giá/tồn thực |
| [home-featured-products.tsx](../src/components/home-featured-products.tsx) | Tạo: danh sách sản phẩm mẫu và trạng thái riêng |
| [home-brands.tsx](../src/components/home-brands.tsx) | Tạo: tên thương hiệu tham khảo, trạng thái khi thiếu dữ liệu |
| [home-buying-guide.tsx](../src/components/home-buying-guide.tsx) | Tạo: gợi ý lựa chọn, chuẩn bị RFQ và lợi ích/chính sách |
| [home.tsx](../src/routes/home.tsx) | Sửa: ghép trang chủ và metadata, thay màn hình khởi tạo |
| [app.css](../src/app.css) | Sửa: style chung cho heading/intro/section của trang chủ |
| [home.test.tsx](../tests/home.test.tsx) | Tạo: 10 test hành vi, trạng thái và dữ liệu |
| [check-home.mjs](../scripts/check-home.mjs) | Tạo: kiểm tra Edge, 7 viewport, keyboard/hash/focus và chụp ảnh |
| [check-navigation.mjs](../scripts/check-navigation.mjs) | Sửa: kiểm tra menu quanh trang chủ hiện tại, ghi `navigation-current-*` để giữ ảnh 07.1 cũ |
| [smoke.mjs](../scripts/smoke.mjs) | Sửa: kiểm tra heading trang chủ mới; vẫn kiểm tra HTTP/API/404 |
| [package.json](../package.json) | Sửa: thêm lệnh `test:home`; không đổi dependency |
| [eslint.config.js](../eslint.config.js) | Sửa: globals cho script kiểm thử browser mới |
| [README.md](../README.md) | Sửa: trạng thái module và lệnh kiểm tra |
| [DESIGN.md](../DESIGN.md) | Sửa: ghi mốc triển khai 07.2 |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Sửa: tóm tắt hiện tại và phạm vi chờ tiếp theo |
| [MODULE_07_2.md](MODULE_07_2.md) | Tạo: bàn giao này |

## 4. Hướng dẫn áp dụng trên Windows

Mở VS Code, chọn thư mục `C:\Users\Minh\Documents\ChatGPT\Website TMDT`. Chọn **Terminal → New Terminal → PowerShell**. Không nhập lệnh vào ô chat. Máy hiện tại đã có thư viện; không cần chép lại mã hoặc cài thêm package.

**Terminal A — xem giao diện:** nếu server 8788 còn chạy, chỉ mở http://127.0.0.1:8788 và Ctrl+F5. Khi cần khởi động lại, nhấn Ctrl+C đúng terminal của server cũ rồi chạy:

```powershell
# Đi vào đúng thư mục dự án, giữ dấu ngoặc kép vì đường dẫn có khoảng trắng.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Build source hiện tại rồi phục vụ frontend/API local tại cổng 8788.
npm.cmd run preview
```

Giữ terminal A mở. Với máy mới hoặc bản ZIP giải nén vào thư mục mới, chạy `npm.cmd ci` trước `preview` để cài đúng phiên bản trong lockfile. Dùng `.cmd` để tránh lỗi PowerShell chặn `npm.ps1`. Không cần secret hoặc tài khoản Supabase để xem bản này.

**Terminal B — kiểm thử:** mở PowerShell thứ hai, A vẫn phục vụ localhost.

```powershell
# Đi vào gốc dự án trong terminal B.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Kiểm tra TypeScript, lint, toàn bộ Vitest, build và biên dịch Functions.
npm.cmd run check
# Kiểm tra trang chủ bằng Edge headless; lưu ảnh và báo cáo vào artifacts.
npm.cmd run test:home
# Kiểm tra hồi quy menu của 07.1 trên trang hiện tại.
npm.cmd run test:navigation
# Kiểm tra HTTP HTML/CSS/API, HEAD, 405 và 404 thật của Pages local.
npm.cmd run smoke
```

Chỉ chạy lệnh tiếp khi lệnh trước thành công. Muốn kiểm tra riêng 10 test mới: chạy `npm.cmd test -- tests/home.test.tsx` trong terminal B. Các lệnh browser dùng Edge hiện có, tạo phiên headless riêng và tự đóng, không dùng profile cá nhân. Nếu chỉ có Chrome đã cài, đặt `$env:BROWSER_CHANNEL = "chrome"` trong terminal B trước khi chạy browser tests. Script chỉ cho phép localhost.

**Lỗi thường gặp:**

- Cổng 8788 đã dùng: sử dụng server đang chạy hoặc Ctrl+C đúng terminal của nó; không dừng tiến trình không liên quan.
- `ECONNREFUSED`: khởi động `preview` và đợi `Ready on http://127.0.0.1:8788` ở terminal A.
- Browser executable không tồn tại: dùng Edge/Chrome đã cài theo hướng dẫn trên; Vitest không cần mở trình duyệt.
- Giao diện còn là trang khởi tạo: chạy lại `preview`, sau đó Ctrl+F5.
- Danh mục dẫn tới gợi ý thay vì danh sách hàng: đúng phạm vi 07.2; route danh mục thuộc 07.3.
- Không thấy ảnh, giá, tồn hoặc nút mua: dữ liệu chưa được doanh nghiệp xác nhận; không sửa bằng cách điền giá/tồn tùy ý.

## 5. Hợp đồng state và dữ liệu

`HomeCategories`, `HomeFeaturedProducts`, `HomeBrands` nhận `HomeListState<T>`: `ready` kèm `items`, `loading`, hoặc `error` kèm callback `onRetry`. Mỗi khối xử lý trạng thái độc lập. Loading không hiển thị thông báo empty; retry không tự giả thành công; chỉ parent thay props khi có dữ liệu. Trang hiện tại truyền dữ liệu local `ready`, không có delay/fetch giả.

`homeCategories` tái sử dụng nhóm từ `navigation-data.ts`. `PreviewProductCard` chỉ có trách nhiệm trình bày dữ liệu mẫu, chưa được dùng để đặt hàng hoặc tính tiền. Tên `Preview` giúp tránh đưa nhầm card này vào luồng bán hàng thật ở bước sau. Sản phẩm thật, ảnh được phép dùng, giá/tồn/bảo hành và nút chuyển trang sẽ được nối khi triển khai module tương ứng.

Phân loại dữ liệu:

| Loại | Nội dung |
|---|---|
| Tìm thấy trong tài liệu tham khảo trước | Bốn nhóm ngành; tên PROLiNK, Pantum, TRM, Cooler Master, Antec, ISON trong PRODUCT_CATALOG_PLAN |
| Đề xuất AI / mẫu | Copy banner, hướng dẫn, model/SKU DEMO/MAU, thuộc tính gắn “mẫu”, bố cục và thứ tự khối |
| Doanh nghiệp phải cung cấp | Nhận diện/ảnh, catalog thực, quyền kinh doanh, giá/thuế, tồn, chính sách và liên hệ |
| Chưa xác minh | Giá/tồn/thông số còn thiếu, quyền phân phối và điều kiện giao dịch; không được suy từ tên thương hiệu |

## 6. Kiểm tra thực tế và checklist nghiệm thu

Ngày 05/11/2026 trên Node 24.15.0, Edge **156.0.4314.58**:

- Typecheck, ESLint không warning, **34 Vitest đạt** (12 health + 12 shell + 10 home).
- Production build/prerender `/` và `/kiem-tra`, Pages Functions compile đạt.
- **10 nhóm browser checks trang chủ** đạt: 7 viewport và nội dung, điều hướng/focus, không có mutation hoặc console/page error.
- **10 nhóm browser checks navigation** đạt; HTTP smoke HTML/CSS/health/HEAD/405/404 đạt.
- Đã xem ảnh desktop toàn trang, vùng sản phẩm, mobile hero và mobile product cards.

| ID | Tiêu chí | Đánh giá |
|---|---|---|
| AC07.2-01 | Có đủ banner, danh mục, sản phẩm, thương hiệu và lợi ích/chính sách | Đạt — UI test + ảnh thực tế |
| AC07.2-02 | H1 duy nhất; title/description phù hợp, giữ noindex cho preview | Đạt — UI + browser + smoke |
| AC07.2-03 | CTA và bốn ngành hàng tới đúng nội dung; focus theo đích bằng bàn phím | Đạt — browser Enter/hash/focus |
| AC07.2-04 | Mẫu có nhãn; không bịa giá/tồn, không coi thiếu dữ liệu là 0 | Đạt — UI + browser |
| AC07.2-05 | Tên thương hiệu có bối cảnh nguồn, không logo/phân phối giả | Đạt — UI + kiểm tra nội dung |
| AC07.2-06 | Loading/empty/error riêng; retry gọi callback; lỗi một khối không làm mất khối khác | Đạt — UI tests |
| AC07.2-07 | Không tràn ngang ở 320/390/640/768/1024/1280/1440 px; grid 1/2/4 cột | Đạt — browser đo viewport |
| AC07.2-08 | CTA chính xuất hiện trong viewport mobile 320/390 × 844, vùng bấm ≥44 px | Đạt — browser đo bounding box |
| AC07.2-09 | Menu, focus, Escape, scroll lock của 07.1 không hỏng | Đạt — test navigation hồi quy |
| AC07.2-10 | Không nhận đơn/báo giá giả, không tự thêm module tiếp theo | Đạt — không form giao dịch, không mutation; không route mới |

Bằng chứng local/ZIP: `artifacts/module-07-2-check.log`, `module-07-2-browser.json`, `module-07-2-browser.log`, `module-07-2-navigation.log`, `module-07-2-smoke.log`, ảnh `module-07-2-*.png` và `navigation-current-*`. Ảnh/log 07.1 gốc được giữ riêng. ZIP có manifest SHA-256 để đối chiếu source.

Giới hạn: viewport giả lập trên Edge Windows, chưa thử điện thoại vật lý/Safari/trình đọc màn hình thật; không tuyên bố chứng nhận WCAG. Chưa có catalog/ảnh đã duyệt nên giao diện vẫn là bản mẫu. Không thay dependency trong 07.2; vấn đề audit chuỗi lint được ghi tại bàn giao 07.1, không coi các kiểm tra này là audit bảo mật mới hoặc nghiệm thu production.

## 7. Điểm dừng

Đạt tiêu chí kỹ thuật của 07.2 trong phạm vi bản mẫu. Chưa triển khai 07.3 — trang danh mục/tìm kiếm/lọc/sắp xếp; chưa nối API bán hàng, tạo đơn, báo giá, database hoặc deploy. Duyệt nội dung/nhận diện và dữ liệu kinh doanh vẫn do doanh nghiệp quyết định.
