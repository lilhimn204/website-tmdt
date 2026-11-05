# DESIGN — UI/UX website thương mại điện tử công nghệ

Phiên bản 0.1 · Giai đoạn 04 · 04/11/2026 · **Đề xuất để phê duyệt thiết kế**.

Website mới độc lập với XTREND. Tại mốc Giai đoạn 04, bộ này chỉ có wireframe tĩnh có chú thích. Cập nhật 05/11/2026: đã thực hiện 07.1, sau đó người dùng yêu cầu tiếp tục để làm riêng 07.2. Header/navigation/footer và trang chủ dùng token hướng A làm cơ sở; xem [bàn giao 07.1](docs/MODULE_07_1.md), [bàn giao 07.2](docs/MODULE_07_2.md). Đây chưa phải phê duyệt toàn bộ nhận diện, dữ liệu kinh doanh hoặc những module tiếp theo.

## 1. Cách đọc bộ thiết kế

| Tài liệu | Nội dung |
|---|---|
| [DESIGN.md](DESIGN.md) | Ba hướng thiết kế, hướng đề xuất, design system, responsive và accessibility |
| [Đặc tả trang](design/PAGE_SPECIFICATIONS.md) | Nội dung, bố cục, hành động và trạng thái của 11 màn hình cùng các trang phụ |
| [Danh sách component](design/COMPONENTS.md) | Thành phần tái sử dụng, dữ liệu đầu vào, sự kiện, trạng thái và trách nhiệm |
| [Wireframe](design/WIREFRAMES.md) | Chỉ mục bản vẽ desktop/mobile và bảng so sánh ba hướng |
| [Checklist UI/UX](design/UI_UX_CHECKLIST.md) | Điều kiện rà soát thiết kế, việc đã kiểm tra và kiểm thử cần làm khi có frontend |

Đầu vào: [PRD](PRD.md), [backlog](PRODUCT_BACKLOG.md), [user stories](USER_STORIES.md), [sitemap](SITEMAP.md), [catalog plan](PRODUCT_CATALOG_PLAN.md). PROMPT 04 cho phép thiết kế UI/UX trên những tài liệu này; không phải xác nhận dữ liệu kinh doanh còn mở hoặc cho phép lập trình.

**Ký hiệu dữ liệu**:

- **Đề xuất thiết kế**: mọi màu, font, kích thước, bố cục, tên component và microcopy trong bộ này.
- **Đầu vào đã ghi nhận**: chức năng và URL có mã trong PRD/SITEMAP; chưa tự mở rộng MVP.
- **Doanh nghiệp cung cấp**: tên/logo, ảnh có quyền sử dụng, catalog/SKU, giá/thuế/tồn, phí giao hàng, tài khoản nhận tiền, thời gian xử lý, bảo hành và nội dung chính sách.
- **Chưa xác minh**: mọi dữ liệu còn mang nhãn này từ Giai đoạn 01–03 vẫn giữ nguyên. Placeholder trong hình không phải dữ liệu XTREND hoặc hàng thực tế của website mới.

## 2. Mục tiêu trải nghiệm và cách áp dụng hai repo

Người mua cần tìm đúng model, kiểm tra đặc tính, hiểu điều kiện mua, rồi chọn mua lẻ hoặc gửi nhu cầu doanh nghiệp. Thiết kế ưu tiên độ rõ thông tin và thao tác ổn định, nhất là khi đọc bảng thông số trên điện thoại.

| Phương pháp | Áp dụng cụ thể | Bằng chứng trong đầu ra |
|---|---|---|
| [Spec Kit](https://github.com/github/spec-kit) | Truy vết yêu cầu → trang → component → tiêu chí; ghi giả định/câu hỏi; dừng tại điểm duyệt thiết kế | Mã DS/DES/CMP/UX; mapping P/C/A/S; quyết định UI01–UI08; checklist |
| [Impeccable](https://github.com/pbakaus/impeccable) | Phân cấp thông tin, typography có chủ đích, nội dung rõ, trạng thái đầy đủ, khả năng thích nghi và rà soát chất lượng | Design system có contrast; PDP và checkout rõ CTA; mobile riêng; audit tài liệu/bản vẽ |

Đây là áp dụng phương pháp, chưa cài hoặc chạy lệnh của hai repo. Skill `design-taste-frontend` được dùng để rà soát hướng hình ảnh/trang chủ; skill tự giới hạn ở landing page/portfolio, nên bảng so sánh, checkout và admin bám nghiệp vụ trong PRD thay vì áp đặt phong cách landing page.

Thông số định hướng: **DESIGN_VARIANCE 4/10, MOTION_INTENSITY 2/10, VISUAL_DENSITY 5/10**. Bố cục đủ khác biệt ở trang chủ nhưng nhất quán khi mua hàng; chuyển động nhẹ; mật độ vừa phải để đọc SKU và thông số. Đây là lựa chọn thiết kế, không phải cấu hình ứng dụng.

## 3. Ba hướng giao diện khác biệt

### A — Kỹ thuật rõ ràng · Hướng đề xuất

- Nền sáng, chữ xanh đen, xanh ngọc đậm cho hành động chính. Search là điểm vào nổi bật ở đầu trang.
- Hero ngắn: một thông điệp về chọn thiết bị, một CTA duyệt hàng; cạnh bên là lối vào báo giá có nhãn rõ. Ngay sau đó là danh mục và danh sách sản phẩm.
- Dùng product card thông tin rõ, bảng thông số có hàng phân tách, khoảng trắng vừa đủ. Không dùng kính mờ, nền chuyển màu hoặc ảnh công nghệ trang trí sau chữ.
- B2C dễ mua; B2B vẫn thấy báo giá ngay. Phù hợp hàng nhiều thông số và ảnh sản phẩm có chất lượng không đồng đều.
- Đánh đổi: ít cảm giác trình diễn; cần ảnh catalog sạch và nội dung nhất quán để tránh khô cứng.

### B — Danh mục kỹ thuật

- Nền graphite tối, chữ sáng, điểm nhấn lime tiết chế; cấu trúc giống bàn tra cứu kỹ thuật nhưng không dùng hiệu ứng terminal.
- Trang chủ tập trung chọn ngành hàng, tìm model và danh sách dạng hàng với các cột thông số. Panel bên cạnh dành cho danh sách yêu cầu báo giá.
- Người mua chuyên môn có thể quét nhiều model; thương hiệu giữ vai trò bộ lọc, không chiếm hero.
- Phù hợp nếu khách doanh nghiệp/đại lý chiếm phần lớn doanh thu và dữ liệu sản phẩm đã chuẩn hóa tốt.
- Đánh đổi: bảng dày khó dùng trên điện thoại, nền tối không phù hợp tất cả ảnh catalog; cần thiết kế lại bảng/card và xác minh contrast riêng nếu chọn hướng này.

### C — Trưng bày sản phẩm

- Nền ngà sáng, chữ mực đen, điểm nhấn cam đất; hero bất đối xứng với ảnh sản phẩm lớn và số lượng nội dung ít.
- Dẫn theo nhu cầu sử dụng và bộ sưu tập được biên tập, sau đó mới tới danh sách catalog. Bố cục có nhịp ảnh lớn/khối chữ nhỏ.
- Phù hợp nếu muốn ưu tiên khách cá nhân, giới thiệu linh kiện có hình ảnh tốt và xây dựng nhận diện thương hiệu.
- Đánh đổi: cần nhiều ảnh được phép sử dụng và công biên tập; dễ kéo dài đường đi tới SKU. Không tự thêm bộ sưu tập động/CMS hoặc bộ máy gợi ý vào MVP.

| Tiêu chí so sánh đề xuất | A — Kỹ thuật rõ ràng | B — Danh mục kỹ thuật | C — Trưng bày sản phẩm |
|---|---|---|---|
| Điểm vào chính | Search + danh mục | Search + bảng tra cứu | Nhu cầu + ảnh sản phẩm |
| Bố cục chủ đạo | Grid/card + bảng khi cần | Danh sách hàng + panel RFQ | Khối ảnh bất đối xứng |
| Mua trên điện thoại | Tốt, thứ tự thông tin ngắn | Cần giản lược mật độ | Tốt nếu ảnh nhẹ |
| B2B nhiều thông số | Tốt | Mạnh nhất | Cần tăng lối tắt kỹ thuật |
| Phụ thuộc nội dung ảnh | Vừa | Thấp | Cao |
| Khả năng giữ phạm vi MVP | Cao | Cao, cần dữ liệu đồng đều | Cần kiểm soát biên tập |

Bảng này là đánh giá thiết kế, chưa có nghiên cứu người dùng chứng minh mức chuyển đổi. Ba hướng có bản phác riêng trong [wireframe](design/WIREFRAMES.md). Phần còn lại của bộ tài liệu phát triển **hướng A** để có một phương án cụ thể, nhất quán và có thể duyệt. Chưa coi hướng A đã được người dùng chọn.

## 4. Design system hướng A

### DS01 — Màu sắc và độ tương phản

| Token ngữ nghĩa | Giá trị | Dùng cho |
|---|---|---|
| `canvas` | `#F5F7F8` | Nền trang |
| `surface` | `#FFFFFF` | Nội dung, form, bảng |
| `ink` | `#172B35` | Tiêu đề, giá, nội dung chính |
| `muted` | `#52636B` | Metadata, hướng dẫn; vẫn phải đọc rõ |
| `line` | `#D9E1E5` | Phân tách trang trí; không làm viền duy nhất của input |
| `control-border` | `#75858D` | Viền input, checkbox, điều khiển cần nhận diện |
| `brand` | `#006B63` | CTA chính, link, focus trên nền sáng |
| `brand-hover` | `#00554F` | Hover/pressed của primary |
| `brand-soft` | `#E7F4F1` | Vùng nhấn/selected có chữ và dấu chọn |
| `danger` / `danger-soft` | `#B42318` / `#FEF3F2` | Lỗi, hành động hủy/xóa |
| `warning` / `warning-soft` | `#8A4B08` / `#FFF5E6` | Cần xác nhận, dữ liệu thay đổi |
| `success` / `success-soft` | `#166534` / `#ECFDF3` | Hoàn tất đã có phản hồi xác nhận |
| `info` / `info-soft` | `#1D4ED8` / `#EFF6FF` | Thông báo trung tính có ngữ cảnh |

Một màu nhận diện chính; các màu trạng thái chỉ dùng đúng ngữ nghĩa. Mọi badge luôn có chữ, lỗi có mô tả và biểu tượng khi phù hợp; không phân biệt còn hàng/hết hàng chỉ bằng chấm xanh/đỏ.

Tỷ lệ tính từ màu hex theo luminance sRGB, làm tròn 2 số:

| Cặp màu | Contrast | Vai trò |
|---|---:|---|
| ink / surface | 14.65:1 | Nội dung chính |
| muted / surface | 6.26:1 | Nội dung phụ |
| muted / canvas | 5.82:1 | Nội dung phụ trên nền trang |
| trắng / brand | 6.40:1 | Chữ CTA |
| trắng / brand-hover | 8.71:1 | Chữ CTA hover |
| brand / brand-soft | 5.67:1 | Selected/link |
| control-border / surface | 3.82:1 | Biên điều khiển |
| danger / danger-soft | 6.05:1 | Lỗi |
| warning / warning-soft | 6.30:1 | Cảnh báo |
| success / success-soft | 6.76:1 | Thành công |
| info / info-soft | 6.16:1 | Thông tin |
| brand / canvas | 5.95:1 | Focus/link |

Các cặp này đạt ngưỡng thiết kế dự kiến cho vai trò đã ghi. Không tự kết luận mọi tổ hợp token đều đạt hoặc website đã đạt WCAG. Không đặt chữ trắng trên `brand-soft`, chữ muted lên ảnh hoặc giảm opacity toàn control khi làm mờ trạng thái.

### DS02 — Typography tiếng Việt

Đề xuất **Be Vietnam Pro**, một họ font tiếng Việt nguồn mở theo [repo tác giả](https://github.com/bettergui/BeVietnamPro). Bước triển khai sẽ kiểm tra giấy phép/font file, giữ thông tin bản quyền, self-host các weight thực sự dùng và có fallback. Chưa tải font hoặc chọn thư viện.

- Stack định hướng: Be Vietnam Pro → Segoe UI → system sans-serif. Bản vẽ tĩnh dùng **Segoe UI đang có trên máy**, chưa phải bản kiểm chứng Be Vietnam Pro.
- Chỉ dùng weight 400, 500, 600, 700; thông số/giá dùng số thẳng hàng khi font hỗ trợ. SKU/model có thể dùng system monospace trong đoạn ngắn.
- Không viết hoa cả đoạn; dấu tiếng Việt đủ khoảng trên/dưới; không dùng chữ condensed cho thông số.

| Vai trò | Mobile font/line-height | Desktop font/line-height | Weight |
|---|---|---|---:|
| Hero/h1 trang chủ | 32/42 px | 40/52 px | 700 |
| H1 trang nội dung/PDP | 28/38 px | 32/44 px | 600 |
| H2/nhóm lớn | 24/34 px | 28/38 px | 600 |
| H3/tên khối | 20/30 px | 20/30 px | 600 |
| Body/label/input | 16/24 px | 16/24 px | 400/500 |
| Metadata/bảng compact | 14/22 px | 14/22 px | 400 |
| Giá PDP | 28/38 px | 32/42 px | 700 |
| Giá card | 20/28 px | 22/30 px | 600 |
| Button | 16/24 px | 16/24 px | 600 |

Body dài tối đa khoảng 65–75 ký tự mỗi dòng; tên sản phẩm tối đa 2–3 dòng trong card, có tên đầy đủ ở liên kết/trang chi tiết. Không cắt SKU/model làm người mua nhầm biến thể; chuỗi dài được ngắt hợp lý hoặc có thao tác sao chép có nhãn, không tràn trang.

### DS03 — Spacing, grid, kích thước

Scale: **4, 8, 12, 16, 24, 32, 48, 64 px**. Giá trị 4–8 cho quan hệ chặt; 12–16 trong component; 24–32 giữa khối; 48–64 giữa section trang chủ. Không dùng khoảng trắng lớn gây đẩy search/catalog quá xa.

| Dải viewport thiết kế | Lề ngang | Grid và hành vi |
|---|---:|---|
| 320–639 px | 16 px | 1 cột; card sản phẩm dạng hàng gọn; form 1 cột |
| 640–1023 px | 24 px | 2 cột sản phẩm; filter drawer; nội dung giao dịch vẫn đọc theo một trình tự |
| 1024–1279 px | 32 px | Sidebar filter 224 px; 2 cột sản phẩm; PDP chia 2 cột |
| ≥1280 px | Tối thiểu 32 px | Container tối đa 1280 px; filter 240 px + gap 24 + 3 cột card |

Admin dùng container rộng hơn nếu màn hình cho phép; sidebar desktop 224 px, content co giãn, bảng cuộn trong vùng riêng. Tại 1440 px, nội dung storefront rộng 1280 px, lề 80 px. Card/grid có chiều cao theo nội dung, không ép hàng có tên dài vào chiều cao gây cắt chữ.

- Control chuẩn cao **48 px**, compact desktop 40 px nếu vùng bấm vẫn đủ và có khoảng cách; icon button tối thiểu 44 × 44 px.
- Ảnh card tỉ lệ 4:3, `contain` theo ý nghĩa thiết kế để không cắt cổng/chi tiết thiết bị; gallery PDP vùng ảnh vuông hoặc 4:3 phù hợp dataset. Không kéo giãn hoặc tự thêm logo/nhãn lên ảnh gốc.
- Radius: 8 px control, 12 px card, 16 px panel/dialog. Không bo từng hàng bảng.
- Viền 1 px; shadow nhẹ chỉ cho lớp nổi (menu/drawer/dialog), không chồng nhiều card và shadow.
- Bản vẽ 390 px và 1440 px là hai mốc minh họa; dải 320/768/1024/1280 và zoom cần kiểm chứng khi có frontend.

### DS04 — Button, link và hành động

| Loại | Dùng cho | Trình bày |
|---|---|---|
| Primary | Hành động mua/đặt hàng/gửi yêu cầu chính của khối | Nền brand, chữ trắng |
| Secondary | Thêm giỏ, quay lại, báo giá khi mua đang là mục tiêu chính | Nền trắng, viền brand, chữ brand |
| Tertiary/link | Xem thông số, đọc chính sách, sửa | Link gạch chân trong đoạn văn; nhãn rõ |
| Destructive | Hủy đơn/xóa dữ liệu có tác động | Nền/viền danger, tên hành động cụ thể |

PDP có “Mua ngay” primary, “Thêm vào giỏ” secondary, “Yêu cầu báo giá” và “Liên hệ tư vấn” là các lối phụ rõ ràng. Nếu chỉ báo giá, “Yêu cầu báo giá” trở thành primary; không có nút mua hoạt động. Không gắn hai primary cạnh nhau cùng tranh chấp thị giác.

Trạng thái bắt buộc: mặc định, hover, pressed, focus-visible, disabled có lý do, loading có nhãn hành động đang thực hiện. Kích thước nút không đổi khi loading. “Đặt hàng” đổi thành “Đang gửi đơn…”; chỉ hiển thị thành công sau phản hồi xác nhận. Double-click/retry phải tuân quy tắc idempotency của S01, không chỉ dựa vào disable nút.

Focus mặc định: vòng ngoài 2 px brand và khoảng tách 2 px nền; trên primary có lớp tách trắng để nhìn rõ. Khi xếp sticky header/footer cần chừa vùng nhìn thấy focus. Không bỏ outline mà chưa có thay thế.

### DS05 — Form và phản hồi

- Nhãn nằm trên input; trường bắt buộc ghi bằng chữ/ký hiệu có chú giải; ví dụ định dạng nằm ở helper. Placeholder chỉ là ví dụ, không thay nhãn.
- Input mobile font 16 px, cao 48 px; textarea tối thiểu 120 px. Chọn loại bàn phím theo điện thoại/email/số lượng; không ép tên người dùng vào bảng chữ cái Latin.
- Validation sau blur hoặc sau submit tùy trường; không báo đỏ khi người dùng mới gõ ký tự đầu. Submit lỗi: summary đầu form + lỗi cạnh trường, đưa focus về summary, link tới trường lỗi.
- Giữ dữ liệu sau lỗi mạng và trở lại bước trước; không giữ dữ liệu nhạy cảm lâu dài trên máy chỉ để thuận tiện. Chính sách lưu nháp do Giai đoạn 05 xác định.
- Checkbox/radio có cả vùng nhãn bấm được. Không tick sẵn đồng ý giao dịch/marketing; không gộp marketing vào điều kiện đặt hàng. Chỉ thêm consent nếu có căn cứ và nội dung đã duyệt.
- Quantity: nút trừ/cộng và input trực tiếp, nhãn chứa tên SKU; không âm/không phân số cho hàng bán theo chiếc. Giới hạn theo dữ liệu được xác nhận, có lý do khi vượt mức.
- Form đặt hàng và RFQ tách nhau: đặt hàng cần địa chỉ giao/ phương thức/ tổng tiền; RFQ cần nhu cầu, danh sách SKU và cách liên hệ, chưa hứa giữ hàng hay giá cuối.
- Toast chỉ bổ trợ, không là nơi duy nhất báo lỗi giao dịch. Lỗi gửi đơn/phí/giá phải nằm tại summary và vùng liên quan cho đến khi xử lý.

### DS06 — Card, bảng và dữ liệu sản phẩm

Product card: ảnh → thương hiệu/tên → model/SKU → 2–3 thuộc tính đã chuẩn hóa → giá/tình trạng → liên kết xem và chọn so sánh. Card không có các button lồng trong một link phủ toàn bộ; điểm bấm phải độc lập. “Thêm giỏ” chỉ xuất hiện khi SKU, giá và khả năng bán đủ rõ; bản mặc định dùng “Xem sản phẩm” để tránh mua sai biến thể.

| Nhóm hàng | Thuộc tính ưu tiên trong card/bộ lọc | Quy tắc |
|---|---|---|
| UPS | VA, W, topology; runtime chỉ khi có dữ liệu đúng tải/điều kiện | Không đổi VA thành W bằng tỷ lệ tự đoán; không có bộ tính runtime MVP |
| Máy in | Đơn/đa năng, màu/đơn sắc, đảo mặt, tốc độ có điều kiện đo | Không dùng số trang/tháng làm cam kết tải làm việc |
| RAM | DDR, dung lượng, bus, form factor | Không khẳng định tương thích máy chỉ từ bus |
| SSD | Dung lượng, form factor, giao tiếp/protocol | Tách M.2 hình dạng và SATA/NVMe giao tiếp |
| PSU/case/tản | Công suất hoặc kích thước, form factor/socket, clearance liên quan | Chỉ thông số đã duyệt; không tự kết luận lắp vừa |
| Mạng | Loại cổng/số cổng, tốc độ, PoE nếu có | Tổng budget PoE khác với số cổng PoE |

SpecTable nhóm theo chủ đề; đơn vị nằm cùng giá trị/nhãn; “Chưa có thông tin” khác “Không hỗ trợ” và “Không áp dụng”. Các ô thiếu dữ liệu không dùng 0 hoặc dấu gạch không giải thích.

So sánh 2–3 SKU cùng loại; cùng tập thuộc tính/đơn vị đã chuẩn hóa. Khác ngành bị chặn với giải thích và lựa chọn thay danh sách. Không chấm điểm “tốt nhất” hoặc suy tương thích khi chưa có quy tắc đã duyệt.

### DS07 — Giá, tồn, vòng đời và bảo hành

Đây là các trạng thái tách biệt, không gộp thành một badge duy nhất:

| Dữ liệu/trạng thái | Nội dung người mua thấy | Hành động |
|---|---|---|
| Có giá đã duyệt + được bán + khả dụng | Giá VND, thuế theo dữ liệu, nhãn khả dụng | Cho mua, kiểm tra lại tại checkout |
| Chỉ báo giá/giá chưa có | “Liên hệ báo giá” | RFQ/tư vấn; không hiển thị 0 ₫ |
| Hết hàng | “Hết hàng” | Không mua; có thể gửi yêu cầu tư vấn/RFQ nếu quy trình cho phép |
| Tồn chưa xác minh/lỗi tải tồn | “Chưa xác nhận tình trạng hàng” | Không hứa giao hoặc tạo đơn từ dữ liệu cũ |
| EOL/ngừng kinh doanh | “Đã ngừng kinh doanh” và tài liệu còn hữu ích | Không mua; chỉ dẫn mẫu khác nếu quan hệ được duyệt |
| Bảo hành chưa đủ dữ liệu | “Thông tin bảo hành đang được xác nhận” | Liên hệ; điều kiện cho phép publish/mua theo PRD và quyết định nghiệp vụ |

Thuế/phí không ghi “đã gồm VAT”/“miễn phí vận chuyển” nếu chưa có dữ liệu. Tổng tiền cuối phải được xác định và người mua xem trước khi gửi đơn; nếu chưa tính được phí cho địa chỉ đó, giải thích và chuyển sang liên hệ/báo giá theo lựa chọn của khách. Không tự coi phí chưa biết là 0.

Bảo hành PDP gắn đúng SKU/model, thời hạn, đơn vị chịu trách nhiệm, điều kiện và link chính sách có hiệu lực. Không lấy chính sách chung làm lời hứa phủ tất cả SKU. Giá, tồn, thanh toán và trạng thái đơn do hệ thống xác nhận; giao diện không là nguồn quyết định cuối.

### DS08 — Icon, ảnh, chuyển động và nội dung

- Icon nét đơn, nét nhất quán; nhãn bằng chữ cho thao tác chính. Biểu tượng không thể thay thế giải thích lỗi/điều kiện mua.
- Ảnh sản phẩm do doanh nghiệp cung cấp hoặc có quyền dùng; placeholder trung tính khi thiếu ảnh. Alt mô tả đúng thiết bị/góc nhìn nếu có ý nghĩa, ảnh trang trí để alt rỗng ở giai đoạn code.
- Không dùng ảnh AI như bằng chứng ảnh hàng thật, chứng chỉ, logo hãng hoặc bằng chứng nhà phân phối. Không có ảnh sản phẩm thực tế trong bộ wireframe.
- Chuyển trạng thái 120–180 ms; drawer 180–220 ms; không autoplay hero, parallax, marquee, đếm số hay hoạt ảnh gây xê dịch nội dung. Tôn trọng reduced motion; loading có thể dùng chữ/skeleton tĩnh.
- Nội dung tiếng Việt trực tiếp: “Chưa tìm thấy model này”, “Giá đã thay đổi. Vui lòng kiểm tra lại tổng tiền”, “Yêu cầu đã được tiếp nhận”, không dùng “Thanh toán thành công” khi mới nhận đơn chuyển khoản.
- Không tạo khan hiếm giả, countdown giả, review/số lượt mua giả hoặc badge “chính hãng” khi chưa có cơ sở.

## 5. Responsive và điều hướng

| Vùng | Mobile | Desktop |
|---|---|---|
| Header | Logo/tên + menu + giỏ; search ở hàng riêng; menu dạng drawer có nút quay lại từng cấp | Logo, search, hỗ trợ, giỏ; hàng điều hướng danh mục/thương hiệu/báo giá |
| Tìm kiếm | Nhập và submit; kết quả đầy đủ ở P07 | Cùng hành vi; không tự thêm autocomplete nâng cao C15 vào MVP |
| Filter | Nút mở drawer; lựa chọn tạm, Áp dụng/Hủy; badge số filter đang áp dụng | Sidebar và chips rõ ràng; tải kết quả giữ vị trí/focus |
| PDP | Gallery → tên/SKU → giá/trạng thái → mua → thông số/bảo hành/tài liệu | Gallery trái, buy panel phải; các phần thông tin dưới |
| So sánh | 2 cột sản phẩm trong vùng bảng cuộn; cột thuộc tính giữ nhìn thấy; có tín hiệu cuộn | Tối đa 3 cột + tên thuộc tính |
| Cart | Mỗi dòng thành khối, summary sau các món | Danh sách trái, summary phải |
| Checkout | Một cột: liên hệ → giao hàng → phương thức → rà soát/tổng → đặt hàng | Form trái, summary phải; thứ tự đọc và focus vẫn hợp lý |
| RFQ | Thông tin liên hệ + danh sách dòng gọn, không table quá rộng | Form và danh sách ở vùng chính, giải thích quy trình bên cạnh |
| Nội dung | Mục lục thu gọn có nút, văn bản một cột | Mục lục bên cạnh, nội dung không quá rộng |
| Admin | Menu drawer; KPI xếp 1–2 cột; hàng tác vụ thành danh sách hoặc bảng cuộn cục bộ | Sidebar cố định; KPI và bảng có hierarchy |

**Quy tắc sticky**: PDP có thể dùng một thanh mua dưới khi buy panel gốc đã ra ngoài viewport; chứa giá/ngắn gọn và CTA mua, có safe-area. Không đồng thời chồng thanh so sánh, thanh chat và thanh mua. Khi mở bàn phím, drawer hoặc dialog, ẩn/điều chỉnh thanh phụ để không che form. Checkout dùng nút cuối summary trong luồng đọc, không che trường bắt buộc bằng sticky. Header mobile không chiếm hai hàng cố định suốt khi cuộn; search nằm trong luồng trang.

## 6. Accessibility — mục tiêu triển khai

Mục tiêu **WCAG 2.2 AA** cho luồng chính, cần kiểm chứng khi có giao diện chạy. Tài liệu tiêu chuẩn: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

- Chữ thường tối thiểu 4.5:1, chữ lớn 3:1 theo [W3C về tương phản](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Bộ token đang chọn ưu tiên ≥4.5 ngay cả nhiều tiêu đề.
- Dự án chủ động chọn vùng bấm 44–48 px cho các control thường dùng. AA 2.5.8 có mức tối thiểu 24 × 24 CSS px và ngoại lệ; không gọi 44 px là yêu cầu tối thiểu AA. Tham khảo [W3C về kích thước mục tiêu](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Một H1 theo trang, heading có cấp; landmarks header/nav/main/footer; skip link; thứ tự đọc không bị CSS làm ngược ý nghĩa.
- Toàn bộ menu, gallery, filter, so sánh, quantity, submit và bảng admin dùng được bằng bàn phím; không yêu cầu hover/drag. Dialog/drawer quản lý focus, Escape đóng nếu an toàn, trả focus về nút mở.
- Link có mục đích rõ; button có tên và trạng thái; nút icon có accessible name. Không dùng role button cho mọi div thay phần tử phù hợp.
- Field nối nhãn/helper/error; nhóm radio có tên; summary lỗi có liên kết tới trường. Thông báo cập nhật giỏ/kết quả được announce hợp lý, không đọc lại cả danh sách hoặc nhảy focus mỗi lần lọc.
- Bảng có caption, tiêu đề hàng/cột và ngữ nghĩa quan hệ; bảng so sánh cuộn ngang có tên vùng và truy cập bàn phím. Ngoại lệ bảng 2D không cho phép toàn trang bị tràn ngang.
- Reflow ở 320 CSS px, zoom văn bản 200%, kiểm tra zoom trình duyệt 400% với viewport phù hợp; không cắt nút/giá/lỗi. Cho phép text spacing người dùng thay đổi mà không mất nội dung.
- Không có thao tác chỉ dựa vào màu, hướng vuốt hoặc animation; giảm chuyển động khi hệ điều hành yêu cầu.
- Không cấm paste/password manager ở admin; xác thực/khôi phục không yêu cầu người dùng nhớ mã từ trang trước nếu có lựa chọn hỗ trợ. Chi tiết auth vẫn là Giai đoạn 05.
- Hạn giữ hàng nếu có phải hiển thị thời điểm hết hạn đã xác nhận, thông báo trước/phương án tiếp tục phù hợp. Không thiết kế countdown giả hoặc tự gia hạn làm sai tồn.

## 7. Phạm vi và điều kiện dữ liệu

**Trong thiết kế MVP**: C01–C11, A01–A10, S01–S06 theo PRD. 11 màn hình chính có đặc tả và bản vẽ hai kích cỡ. Các trang phụ dùng template/variation được chỉ rõ trong đặc tả.

**Sản phẩm liên quan/phụ kiện**: thiết kế sẵn component và vị trí PDP theo yêu cầu PROMPT 04, đánh dấu C12/V1.1. Chỉ hiển thị quan hệ đã được người có trách nhiệm duyệt; nhãn “Cùng nhóm sản phẩm” không đồng nghĩa “Tương thích”. Không kéo chức năng quản trị/logic C12 vào MVP chỉ vì có chỗ trong bản vẽ. Nếu muốn ra mắt cùng MVP, phải cập nhật phạm vi PRD/backlog/stories trước triển khai.

**Không thêm ngầm**: tài khoản khách, wishlist, review, loyalty, chat realtime, tìm kiếm AI/autocomplete nâng cao, configurator PC, runtime UPS, TCO máy in, thanh toán online, marketplace, blog/CMS mở rộng, nhập CSV/Excel, dark mode toggle. Một hướng giao diện tối ở mục 3 không phải yêu cầu hỗ trợ hai theme.

## 8. Quyết định chờ phê duyệt

| Mã | Đề xuất cụ thể | Nếu chưa chốt |
|---|---|---|
| UI01 | Chọn hướng A; dùng bộ wireframe/DS hiện tại làm baseline | Không viết frontend; B/C vẫn là lựa chọn có thể thay |
| UI02 | Tên/logo thật và màu nhận diện nếu doanh nghiệp đã có | Bản vẽ dùng “Tên website”; chưa tạo logo giả |
| UI03 | Be Vietnam Pro; font fallback Segoe UI | Chưa tải/nhúng; cần kiểm tra glyph/metrics khi triển khai |
| UI04 | Mobile card dạng hàng 1 cột, drawer filter; mua/báo giá tách CTA | Cần duyệt nội dung/bố cục mobile trước giai đoạn code |
| UI05 | RelatedProducts ở C12/V1.1, chỉ dữ liệu đã duyệt | Ẩn module ở MVP; không suy tương thích |
| UI06 | Doanh nghiệp cung cấp ảnh, chính sách, giá/thuế, phí, thời hạn/SLA | Placeholder vẫn là placeholder; không công bố lời hứa thương mại |
| UI07 | Admin ưu tiên xử lý đơn/RFQ/bất thường; số đo có nguồn và thời gian cập nhật | Không hiện dữ liệu KPI mẫu như dữ liệu thật |
| UI08 | Duyệt bản vẽ tĩnh và các tiêu chí UI/UX; nghiệm thu khả dụng khi có frontend | Chưa được gọi là thiết kế đã kiểm thử với người dùng |

Các quyết định nghiệp vụ D02–D12 của PRD và IA01–IA08 của SITEMAP vẫn có hiệu lực. Duyệt màu/bố cục không tự chốt chính sách thanh toán, cơ chế xác thực hoặc dữ liệu catalog.

## 9. Điểm dừng Giai đoạn 04

Đầu ra là bộ thiết kế có thể xem và đối chiếu yêu cầu. Checklist phân biệt **đã rà soát tài liệu/bản vẽ**, **cần người dùng duyệt**, và **chỉ kiểm chứng khi triển khai**. Dừng để người dùng chọn hướng và góp ý; chưa tạo React/Tailwind, chưa thiết kế schema/API và chưa sang Giai đoạn 05.
