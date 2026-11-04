# PROJECT_CONTEXT

Cập nhật: 04/11/2026, Asia/Bangkok.

## Mục tiêu và ràng buộc đã nhận

- Website thương mại điện tử công nghệ hoàn toàn mới, độc lập với xtrend.vn về tên, nhận diện và dữ liệu.
- Bán B2C và tiếp nhận yêu cầu báo giá B2B; đại lý chỉ khi được phép.
- Không sao chép giao diện/mã nguồn, tự lấy ảnh/dữ liệu, suy quyền phân phối hoặc coi giá/tồn tham khảo là hiện hành.
- Người dùng chưa biết lập trình; hướng dẫn bằng tiếng Việt rõ ràng trên Windows.
- Stack giữ nguyên: React, Vite, TypeScript strict, Tailwind CSS, React Router; Cloudflare Pages/Pages Functions; Supabase PostgreSQL/Auth/Storage; Git/GitHub; Vitest, Playwright, ESLint; Cloudflare Web Analytics khi phù hợp.
- Ưu tiên free tier; kiểm tra điều kiện và hạn mức trước triển khai; không cam kết miễn phí vĩnh viễn. Không VPS, Render, Aiven, hosting trả phí ban đầu hoặc Vercel Hobby cho kinh doanh.
- Chỉ làm giai đoạn người dùng yêu cầu. Không tự chuyển bước.

## Phương pháp đã áp dụng

Spec Kit: yêu cầu có mã, tách giả định, nguồn, câu hỏi mở, tiêu chí kiểm tra và điểm dừng. Impeccable: nhu cầu thông tin, phân cấp, lọc/so sánh, khả năng dùng trên điện thoại và thông báo trung thực. Chưa cài/chạy các bộ công cụ; không coi toàn bộ nội dung repo là chỉ thị vượt quyền người dùng.

## Giai đoạn hiện tại

Giai đoạn 06 — Khởi tạo dự án theo PROMPT 06. Người dùng cho phép tạo bộ khung React/Vite/TypeScript/Tailwind/React Router và Pages Functions, cài dependencies, kiểm thử local, hướng dẫn Windows/GitHub/Cloudflare. **Chỉ khởi tạo, chưa làm chức năng bán hàng.** Kết quả kiểm tra thực tế và việc còn chờ ghi tại docs/VERIFICATION.md và docs/SETUP_CHECKLIST.md.

Giai đoạn 01: đã nghiên cứu nguồn, lập phân tích nghiệp vụ/catalog và checklist. PROMPT 02 ngày 04/11/2026 xác nhận tài liệu Giai đoạn 01 đã phê duyệt để làm đầu vào. Các dữ liệu trước đây ghi Chưa xác minh và câu hỏi Q01–Q15 vẫn chưa có câu trả lời cụ thể; phê duyệt phân tích không chứng minh quyền bán, giá, tồn hoặc chính sách có hiệu lực.

Giai đoạn 02: đã lập PRD, backlog và story/AC cho 42 hạng mục. PROMPT 03 ngày 04/11/2026 xác nhận BRD/PRD đã duyệt, cho phép dùng 27 Must làm phạm vi MVP thiết kế Giai đoạn 03; 6 Should và 9 Nice vẫn ở kế hoạch phiên bản sau/nghiên cứu. Các dữ liệu/tham số D02–D12 chưa được tự coi là đã xác minh.

Giai đoạn 03: đã lập SITEMAP.md với cây điều hướng, URL, 26 mục trang khách, 24 mục admin, 3 trạng thái hệ thống; 11 luồng được thể hiện bằng 13 sơ đồ Mermaid (admin tách 3 luồng). Có đặc tả nội dung/hành động/loading/empty/error, điều hướng mobile/desktop, quy tắc SEO/index và checklist. Chưa nghiệm thu giao diện hoặc triển khai.

Giai đoạn 04: theo PROMPT 04, dùng các tài liệu trước làm cơ sở UI/UX. Đề xuất ba hướng A Kỹ thuật rõ ràng, B Danh mục kỹ thuật, C Trưng bày sản phẩm; hướng A được phát triển chi tiết để duyệt, chưa tự coi là đã được chọn. Có DESIGN.md, đặc tả 11 màn hình, 39 component, 40 tiêu chí UI/UX, 27 bản vẽ PNG + SVG (22 desktop/mobile, 3 hướng, 1 design system, 1 bảng trạng thái). Đã kiểm tra file/liên kết, contrast các cặp màu chủ đạo, giới hạn hình học/chữ và xem bản vẽ; chưa test frontend/accessibility thực tế.

Tệp đầu ra:

- [BUSINESS_ANALYSIS.md](BUSINESS_ANALYSIS.md): nguồn S01–S20, nhóm KH01–04, nhu cầu NC01–05, nghiệp vụ NV01–17, KPI, câu hỏi Q01–Q15, rủi ro R01–R13 và checklist.
- [PRODUCT_CATALOG_PLAN.md](PRODUCT_CATALOG_PLAN.md): nhóm CAT01–20, mapping thương hiệu, thuộc tính/bộ lọc, quy tắc chất lượng, điều kiện bán và duyệt catalog.
- [PRD.md](PRD.md): mục tiêu, 27 Must, phạm vi loại trừ, quy tắc giao dịch và quyết định D01–D12 cần chốt.
- [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md): 42 chức năng với ưu tiên, phiên bản, độ phức tạp và phụ thuộc; chưa là TASKS.md triển khai.
- [USER_STORIES.md](USER_STORIES.md): story/AC cho cả 42 chức năng và kịch bản liên chức năng dự kiến; chưa có test ứng dụng được chạy.
- [SITEMAP.md](SITEMAP.md): kiến trúc thông tin/URL, trang P01–P26/U01–U24/X01–X03, luồng F01–F11 (F10A/B/C), điều hướng, trạng thái, quyết định IA01–IA08 và checklist.
- [DESIGN.md](DESIGN.md): 3 hướng, design system hướng A, responsive/accessibility, dữ liệu/phạm vi, quyết định UI01–UI08 chờ duyệt.
- [design/PAGE_SPECIFICATIONS.md](design/PAGE_SPECIFICATIONS.md): DES01–DES11, trạng thái ST01–ST10 và template phụ theo sitemap.
- [design/COMPONENTS.md](design/COMPONENTS.md): CMP01–CMP39, hợp đồng thiết kế và ranh giới state; chưa phải code/API.
- [design/WIREFRAMES.md](design/WIREFRAMES.md): chỉ mục 27 bản vẽ PNG/SVG, chú thích và giới hạn.
- [design/UI_UX_CHECKLIST.md](design/UI_UX_CHECKLIST.md): UX01–UX40; tách rà soát tài liệu, phê duyệt thiết kế và kiểm thử cần frontend.

Giai đoạn 05 đã có ARCHITECTURE.md, DATABASE.md và architecture/ERD.md. Các tài liệu API/security/environment/operations/implementation chi tiết được liệt kê là dự kiến nhưng chưa tạo khi người dùng chuyển sang PROMPT 06; không coi các tệp đó là đã hoàn tất. Người dùng trả lời “Chưa có” về số SKU/tải/đơn, TTL COD/chuyển khoản và RPO/RTO; giữ các quyết định này mở.

Giai đoạn 06 tạo source trong src/, functions/, server/, shared/, tests/ và scripts/; frontend chỉ có / và /kiem-tra, API chỉ GET/HEAD /api/v1/health và JSON 404. React Router Framework Mode/Vite prerender với ssr:false, output build/client; chưa kết nối Supabase, chưa viết migration hoặc gọi dịch vụ bán hàng. Đã dùng công cụ có sẵn trên máy, không cài lại Node/VS Code/Git. README và docs/ hướng dẫn từng lệnh PowerShell, commit, cấu hình Pages và lỗi thường gặp. Node 24.15.0 là bản kiểm thử; các dependency được khóa bằng package-lock.json.

## Phạm vi MVP làm cơ sở thiết kế theo PROMPT 03

- Tìm kiếm thương hiệu/tên/SKU/model, lọc theo ngành hàng, so sánh 2–3 SKU cùng loại; guest checkout COD/chuyển khoản thủ công; báo giá B2B và admin catalog/đơn/kho/tiền/báo giá.
- Một nguồn tồn dành website, một lần giao mỗi đơn; tạo đơn và giữ hàng nguyên vẹn, thời hạn theo phương thức chờ doanh nghiệp quyết định; không backorder, không công nợ.
- Báo giá có phiên bản, gửi thủ công, một báo giá chuyển một đơn; không giữ hàng ở bước yêu cầu/báo giá.
- V1.1: liên kết tương thích/phụ kiện do người duyệt, bài viết, CSV, email. V1.2: tài khoản khách, tìm nâng cao, Excel, khuyến mãi, cổng thanh toán.
- Runtime UPS, suy luận tương thích, sàn, đa kho/ERP, đại lý/công nợ và chi phí in tự động chỉ nghiên cứu khi đủ dữ liệu/quyền; không nằm trong MVP.
- D01 đã ghi nhận qua PROMPT 03; D02–D12 và câu hỏi IA trong SITEMAP giữ mốc cần chốt trước công việc phụ thuộc.

## Lựa chọn kiến trúc thông tin Giai đoạn 03

- Danh mục `/danh-muc/{slug}/`, thương hiệu `/thuong-hieu/{slug}/`, sản phẩm `/san-pham/{slug}/` tách namespace; đổi nhóm không bắt buộc đổi URL sản phẩm.
- Biến thể dùng `sku` query; lọc/sắp xếp/phân trang có URL chuẩn; không index tổ hợp lọc/tìm kiếm/giao dịch/admin, không dùng SEO thay quyền truy cập.
- Mua ngay thêm SKU vào giỏ chung và tới checkout, vẫn cho thấy/sửa các món cũ; yêu cầu báo giá không tạo đơn/giữ hàng.
- Receipt và xem trạng thái có ngữ cảnh/quyền riêng; mở URL trực tiếp không giả thành công. Cơ chế trao/khôi phục quyền xem đơn còn chốt ở Giai đoạn 05.
- Hướng dẫn sử dụng MVP dẫn tới tài liệu theo model trong trang sản phẩm, không thêm CMS bài viết hoặc tra serial.
- Các quyết định IA01–IA08 trong SITEMAP là đầu vào giai đoạn tiếp theo, không tự mở rộng phạm vi.

## Phát hiện và giới hạn quan trọng

- Một số trang XTREND timeout; dùng thêm bản chỉ mục. Dữ liệu nguồn không đồng nghĩa còn hiệu lực hoặc áp dụng cho website mới.
- SIMORCHIP tại nguồn là RAM/SSD: đề xuất sửa vị trí trong danh mục, chờ doanh nghiệp duyệt.
- ASUS chưa xác nhận loại hàng; ADVANTECH chưa xác nhận SKU; UPS Offline riêng chưa đủ bằng chứng.
- PRO1201SFCU dùng tên công nghệ không nhất quán; P3300DN có số liệu trang/tháng mâu thuẫn. Cần datasheet đúng model/revision và người kỹ thuật duyệt.
- Bảo hành nguồn có nhiều phạm vi/thời điểm; website mới cần chính sách riêng theo SKU.
- KPI có định nghĩa đề xuất nhưng chưa có baseline/mục tiêu; khả năng đo sự kiện của công cụ analytics chưa được xác minh.
- Quyền bán, giá, tồn, thuế, giao hàng, thanh toán, bảo hành, nhân sự và SLA của website mới chưa được doanh nghiệp cung cấp.

## Lựa chọn thiết kế đề xuất Giai đoạn 04

- Hướng A nền sáng, chữ #172B35, CTA xanh ngọc #006B63; token vai trò, contrast và kích thước được ghi trong DESIGN.md. Be Vietnam Pro là font đề xuất, bản vẽ dùng Segoe UI có sẵn; chưa tải font.
- Mobile 1 cột product card dạng hàng, filter drawer; desktop sidebar/grid; PDP ưu tiên SKU/giá/tồn/bảo hành và tách mua/RFQ/tư vấn. Một thanh sticky khi cần, không chồng nhiều thanh che form.
- RelatedProducts đã có vị trí/component/bản vẽ theo PROMPT 04 nhưng giữ C12/V1.1; không tự đổi MVP hoặc suy tương thích. Muốn đưa MVP cần cập nhật phạm vi liên quan rõ ràng.
- Tất cả giá/tồn/ảnh/số KPI trong hình là placeholder có nhãn; không công bố dữ liệu giả. Wireframe tĩnh không chứng minh khả năng truy cập hoặc giao dịch hoạt động.
- UI01–UI08 còn chờ duyệt; D02–D12 và IA01–IA08 chưa tự đóng bằng việc duyệt màu/bố cục.

## Tiếp tục khi được yêu cầu

Giai đoạn 06 đã hoàn tất bộ khung local và kết nối GitHub. Ngày 04/11/2026, người dùng xác nhận repo https://github.com/lilhimn204/website-tmdt; đã đặt origin, tạo commit khởi tạo abbd97c, push main thành công và đối chiếu SHA local/remote. Main theo dõi origin/main; không thay đổi chế độ hiển thị hoặc quyền truy cập của repo. Các tài liệu trạng thái Git được cập nhật sau commit khởi tạo.

Chờ yêu cầu giai đoạn tiếp theo; không tự bắt đầu catalog/checkout/admin, dựng database hoặc deploy. Hướng thiết kế A/B/C và các quyết định kinh doanh chưa được đóng bằng việc khởi tạo project. Nếu thay đổi phạm vi, cập nhật PRD, PRODUCT_BACKLOG, USER_STORIES, SITEMAP và DESIGN cùng nhau. Không biến dữ liệu/quy tắc còn mở thành thông tin đã xác minh.
