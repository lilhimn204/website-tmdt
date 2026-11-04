# Wireframe — chỉ mục bản vẽ

Giai đoạn 04 · 04/11/2026 · **Đề xuất để duyệt, chưa phải frontend hoặc prototype tương tác**.

Có **27 bản vẽ**, mỗi bản có PNG để xem nhanh và SVG vector để phóng lớn: 22 bản của 11 màn hình × desktop/mobile, 3 hướng giao diện, 1 design system và 1 bảng trạng thái. Đặc tả hành vi chuẩn nằm ở [PAGE_SPECIFICATIONS.md](PAGE_SPECIFICATIONS.md); các nút trên hình không bấm được.

## 1. Ba hướng giao diện

| Hướng | Xem nhanh | Bản vector | Khác biệt |
|---|---|---|---|
| A — Kỹ thuật rõ ràng · **đề xuất** | [PNG](wireframes/00-direction-a.png) | [SVG](wireframes/00-direction-a.svg) | Search/danh mục, nền sáng, card rõ thông số, cân bằng mua lẻ và báo giá |
| B — Danh mục kỹ thuật | [PNG](wireframes/00-direction-b.png) | [SVG](wireframes/00-direction-b.svg) | Nền tối, danh sách model theo cột, panel nhu cầu B2B |
| C — Trưng bày sản phẩm | [PNG](wireframes/00-direction-c.png) | [SVG](wireframes/00-direction-c.svg) | Ảnh lớn bất đối xứng, nhu cầu sử dụng dẫn tới catalog, nền ngà/cam đất |

Hướng B/C là phác thảo cấu trúc để so sánh, chưa có design system đã kiểm tra contrast riêng. Hướng A được phát triển tiếp thành 11 màn hình dưới; chưa coi người dùng đã chọn.

## 2. Design system và trạng thái

- [Design system PNG](wireframes/00-design-system.png) · [SVG](wireframes/00-design-system.svg): palette, typography, button, field, semantic states, spacing/radius.
- [Trạng thái mẫu PNG](wireframes/12-states.png) · [SVG](wireframes/12-states.svg): loading, không có kết quả, lỗi field, giá/tồn đổi, chưa biết kết quả gửi, đã tiếp nhận.
- Thông số đầy đủ, tỷ lệ contrast và mục tiêu accessibility: [DESIGN.md](../DESIGN.md).

## 3. 11 màn hình hướng A

Chiều rộng logic **1440 px desktop** và **390 px mobile**. Chiều cao thay đổi theo nội dung; đây là ảnh toàn trang, không phải chiều cao viewport. Thanh tối trên cùng ghi mã/kích thước là **nhãn bản vẽ**, không thuộc website.

| Mã / màn hình | Desktop PNG | Mobile PNG | SVG desktop | SVG mobile |
|---|---|---|---|---|
| DES01 — Trang chủ | [Xem](wireframes/01-home-desktop.png) | [Xem](wireframes/01-home-mobile.png) | [Vector](wireframes/01-home-desktop.svg) | [Vector](wireframes/01-home-mobile.svg) |
| DES02 — Danh mục | [Xem](wireframes/02-category-desktop.png) | [Xem](wireframes/02-category-mobile.png) | [Vector](wireframes/02-category-desktop.svg) | [Vector](wireframes/02-category-mobile.svg) |
| DES03 — Thương hiệu | [Xem](wireframes/03-brand-desktop.png) | [Xem](wireframes/03-brand-mobile.png) | [Vector](wireframes/03-brand-desktop.svg) | [Vector](wireframes/03-brand-mobile.svg) |
| DES04 — Tìm kiếm | [Xem](wireframes/04-search-desktop.png) | [Xem](wireframes/04-search-mobile.png) | [Vector](wireframes/04-search-desktop.svg) | [Vector](wireframes/04-search-mobile.svg) |
| DES05 — Chi tiết sản phẩm | [Xem](wireframes/05-product-desktop.png) | [Xem](wireframes/05-product-mobile.png) | [Vector](wireframes/05-product-desktop.svg) | [Vector](wireframes/05-product-mobile.svg) |
| DES06 — So sánh | [Xem](wireframes/06-compare-desktop.png) | [Xem](wireframes/06-compare-mobile.png) | [Vector](wireframes/06-compare-desktop.svg) | [Vector](wireframes/06-compare-mobile.svg) |
| DES07 — Giỏ hàng | [Xem](wireframes/07-cart-desktop.png) | [Xem](wireframes/07-cart-mobile.png) | [Vector](wireframes/07-cart-desktop.svg) | [Vector](wireframes/07-cart-mobile.svg) |
| DES08 — Checkout | [Xem](wireframes/08-checkout-desktop.png) | [Xem](wireframes/08-checkout-mobile.png) | [Vector](wireframes/08-checkout-desktop.svg) | [Vector](wireframes/08-checkout-mobile.svg) |
| DES09 — Báo giá | [Xem](wireframes/09-quote-desktop.png) | [Xem](wireframes/09-quote-mobile.png) | [Vector](wireframes/09-quote-desktop.svg) | [Vector](wireframes/09-quote-mobile.svg) |
| DES10 — Nội dung/bảo hành | [Xem](wireframes/10-warranty-desktop.png) | [Xem](wireframes/10-warranty-mobile.png) | [Vector](wireframes/10-warranty-desktop.svg) | [Vector](wireframes/10-warranty-mobile.svg) |
| DES11 — Admin Dashboard | [Xem](wireframes/11-admin-desktop.png) | [Xem](wireframes/11-admin-mobile.png) | [Vector](wireframes/11-admin-desktop.svg) | [Vector](wireframes/11-admin-mobile.svg) |

## 4. Chú thích để duyệt đúng phạm vi

- Hình dùng Segoe UI có sẵn trên máy. Font đề xuất cho sản phẩm là Be Vietnam Pro; cần kiểm chứng metrics/glyph/line wrap khi có frontend. Wireframe không khẳng định đã nhúng font đó.
- Mọi `[Giá]`, `[Tình trạng]`, `[SKU]`, `[Số liệu]`, ảnh, thương hiệu A/B là nhãn giữ chỗ. Không có giá bán, tồn kho, số đơn hoặc quyền phân phối thực tế được suy ra.
- Placeholder ảnh là khung, không phải tài sản sản phẩm. Bản vẽ không tải ảnh hay logo từ XTREND.
- Chú thích màu vàng ở PDP nói về C12/V1.1, **không phải nội dung đưa lên trang khách**. Khối liên quan bên dưới minh họa component theo yêu cầu thiết kế; trong MVP mặc định ẩn nếu chưa đổi phạm vi và chưa có quan hệ được duyệt.
- Bảng so sánh mobile chỉ vẽ vùng đang nhìn thấy và mép cột tiếp theo; bảng thực có vùng cuộn riêng. Cơ chế cuộn/focus/semantics chưa kiểm thử.
- Drawer filter/menu, sticky buy bar, invoice fields mở rộng và các trạng thái chi tiết được mô tả bằng văn bản. Bộ hình không giả là prototype đầy đủ mọi trạng thái.
- Admin hiển thị cấu trúc widget theo quyền; placeholder không phải thống kê thật. “Chưa có dữ liệu” khác giá trị 0.
- Khi nội dung giữ chỗ được thay bằng dữ liệu thật, độ dài và chiều cao sẽ thay đổi. Thiết kế triển khai phải theo grid/spacing/component và các quy tắc responsive, không cố định vị trí pixel của ảnh.

## 5. Kiểm tra và giới hạn

- Đã xuất PNG/SVG, kiểm tra danh sách file, mở xem các bản vẽ, sửa lỗi che phân trang, placeholder nhỏ và quantity xuống dòng.
- Kiểm tra hình học: phần tử nằm trong canvas; đo dòng chữ với font Segoe UI không vượt chiều rộng khung đã khai báo. Kiểm tra này không thay visual QA, semantics hoặc layout trình duyệt.
- Các cặp màu của hướng A được tính riêng trong DESIGN.md. Bản tĩnh chưa chứng minh tuân thủ WCAG 2.2 AA.
- Không có frontend, dependency ứng dụng, server, schema/API hoặc thao tác gửi đơn/báo giá. Chưa test trình duyệt, người dùng, thiết bị thật hoặc hiệu năng.

Mở [checklist](UI_UX_CHECKLIST.md) để duyệt bố cục/luồng và phân biệt phần cần kiểm tra sau này.
