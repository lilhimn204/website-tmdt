# Checklist UI/UX — Giai đoạn 04

04/11/2026 · **Chờ người dùng phê duyệt thiết kế**. Checkbox đã đánh dấu chỉ là kiểm tra bộ tài liệu/bản vẽ tĩnh; không đồng nghĩa đã chạy test ứng dụng, audit trình đọc màn hình hoặc nghiệm thu website.

## 1. Phạm vi, phương pháp và bàn giao

- [x] UX01 — Có 3 hướng khác nhau về cấu trúc ưu tiên nội dung, mật độ và hình ảnh; chọn A làm phương án đề xuất chi tiết, chưa coi người dùng đã chọn.
- [x] UX02 — Giữ website mới độc lập với XTREND; không lấy nhận diện, ảnh hoặc lời hứa phân phối của nguồn tham khảo.
- [x] UX03 — Truy vết 11 DES tới P/U và C/A/S của PRD/SITEMAP; ứng dụng phương pháp Spec Kit và Impeccable được chỉ rõ.
- [x] UX04 — Design system có màu/font/spacing/grid/button/form/card/state/focus; tỷ lệ contrast của các cặp sử dụng chính đã tính.
- [x] UX05 — Đặc tả đủ 11 màn hình và các template phụ; có index wireframe desktop/mobile.
- [x] UX06 — Danh sách component nêu đầu vào, ý định người dùng, trạng thái và ranh giới dữ liệu; chưa tạo React/Tailwind hoặc API/schema.
- [x] UX07 — Phân biệt đề xuất thiết kế, đầu vào hiện có, dữ liệu doanh nghiệp cung cấp và chưa xác minh.
- [x] UX08 — Không thêm nâng cao vào MVP; RelatedProducts đã thiết kế nhưng giữ C12/V1.1 trừ khi đổi phạm vi rõ ràng.

## 2. Rà soát thiết kế từng màn hình

| Tiêu chí | Kịch bản cần duyệt | Bằng chứng thiết kế | Trạng thái |
|---|---|---|---|
| UX09 Trang chủ | Tìm model hoặc chọn nhóm; thấy lối RFQ | DES01, 2 wireframe | Có thiết kế; chờ duyệt |
| UX10 Danh mục | Lọc đúng nhóm, bỏ filter, chọn so sánh | DES02, CMP14–16/26 | Có thiết kế; chờ duyệt |
| UX11 Thương hiệu | Biết đang xem hãng nào; chọn ngành trong hãng | DES03 | Có thiết kế; chờ duyệt |
| UX12 Search | Tìm theo tên/hãng/model/SKU; zero-result có lối đi | DES04, ST03 | Có thiết kế; chờ duyệt |
| UX13 PDP | Đọc đủ ảnh/tên/model/SKU/giá/hàng/thông số/bảo hành/tài liệu; mua hoặc RFQ | DES05, CMP17–25 | Có thiết kế; dữ liệu thật còn thiếu |
| UX14 So sánh | 2–3 SKU cùng loại; đơn vị và missing data rõ | DES06, CMP26 | Có thiết kế; cuộn/keyboard chưa test |
| UX15 Giỏ | Đổi số/xóa; nhận biết tạm tính, chưa giữ hàng | DES07 | Có thiết kế; chưa test giao dịch |
| UX16 Checkout | Guest; COD/chuyển khoản; phí/tổng rõ; receipt đúng nghĩa | DES08/P12/P13 | Có thiết kế; nghiệp vụ D còn mở |
| UX17 RFQ | Chưa biết model vẫn gửi nhu cầu; không giữ hàng | DES09/P15 | Có thiết kế; chưa test submit |
| UX18 Chính sách | Tìm điều kiện SKU và cách liên hệ | DES10 | Có cấu trúc; nội dung doanh nghiệp cần duyệt |
| UX19 Admin | Ưu tiên hàng chờ; quyền đúng; unknown khác 0 | DES11, CMP34–39 | Có thiết kế; chưa test quyền |

## 3. Điều kiện nghiệm thu khi có frontend — chưa thực hiện

- [ ] UX20 — Kiểm tra 320, 390, 768, 1024, 1280 và 1440 px: body không tràn ngang; bảng cuộn riêng có chỉ báo; không mất CTA/giá/SKU/lỗi.
- [ ] UX21 — Zoom text 200%, browser 400% với viewport phù hợp và text-spacing override: không cắt nội dung/hành động; các ngoại lệ bảng được xử lý cục bộ.
- [ ] UX22 — Bàn phím hoàn thành search → filter → PDP → giỏ → checkout và RFQ; thứ tự focus hợp lý, nhìn thấy focus, không kẹt ngoài dialog hoặc focus bị sticky che.
- [ ] UX23 — Trình đọc màn hình đọc đúng headings/landmarks/label/error/table/status; thông báo giỏ và kết quả không đọc lặp gây phiền.
- [ ] UX24 — Modal/drawer có tên, đóng/return focus, thao tác hủy giữ trạng thái đã áp dụng; menu không phụ thuộc hover.
- [ ] UX25 — Contrast trên giao diện thực với font, nền, icon, viền và mọi state đạt vai trò; không chỉ dựa vào bảng màu trong tài liệu.
- [ ] UX26 — Vùng bấm thực tế ≥44 px với control chính; khoảng cách đủ; input mobile 16 px; reduced motion được tôn trọng.
- [ ] UX27 — Gallery/ảnh thiếu/ảnh lỗi/SKU dài/nội dung tiếng Việt dài giữ layout; không dùng ảnh, giá, tồn hoặc logo thiếu quyền.
- [ ] UX28 — Các loading/empty/no-result/error/unknown/conflict/EOL/session states có UI và hướng tiếp tục; lỗi không xóa form hoặc bị toast che mất.
- [ ] UX29 — Mua ngay giữ và hiển thị các món cũ; thay SKU cập nhật đúng giá/thông số/bảo hành; SKU sai không tự đổi âm thầm.
- [ ] UX30 — Giá/tồn/phí đổi trong checkout buộc rà soát lại; phí chưa tính được không là 0; mạng timeout và submit lặp không tạo đơn/yêu cầu trùng.
- [ ] UX31 — Receipt có mã thật/ngữ cảnh hợp lệ; COD và chuyển khoản không bị ghi nhầm đã thanh toán; quyền xem đơn không dựa riêng mã đơn/điện thoại.
- [ ] UX32 — RFQ không giữ hàng/ghi doanh thu; quote version đã gửi chỉ đọc; chuyển đơn revalidate và xử lý lặp đúng.
- [ ] UX33 — Admin permissions được kiểm soát thật; số liệu có nguồn/khoảng thời gian; không show dữ liệu nhạy cảm trước auth hoặc qua widget lỗi.
- [ ] UX34 — Hiệu năng và độ ổn định layout trên thiết bị/mạng thực tế được đo theo ngân sách PRD; không tuyên bố Core Web Vitals đạt từ wireframe.
- [ ] UX35 — Walkthrough với đại diện khách cá nhân, mua hàng doanh nghiệp và nhân viên vận hành: quan sát chọn model, hiểu bảo hành, mua/gửi RFQ và xử lý hàng chờ; ghi lỗi/điểm cần chỉnh. Chưa tuyển người hoặc thực hiện nghiên cứu.

## 4. Nội dung cần người dùng duyệt ở giai đoạn này

- [ ] UX36 — Chọn hướng A, B hoặc C; nếu chọn A, duyệt palette và định hướng Be Vietnam Pro.
- [ ] UX37 — Duyệt bố cục 11 màn hình, thứ tự mobile và CTA mua/báo giá/tư vấn.
- [ ] UX38 — Xác nhận giữ C12 ở V1.1 hoặc yêu cầu đổi phạm vi có cập nhật PRD/backlog/stories.
- [ ] UX39 — Xác nhận tên/logo/ảnh và người chịu trách nhiệm cung cấp nội dung kinh doanh; không coi nhãn giữ chỗ là dữ liệu xuất bản.
- [ ] UX40 — Chấp nhận checklist triển khai còn mở và điều kiện chốt dữ liệu D02–D12; không coi phê duyệt UI là nghiệm thu giao dịch/an toàn/accessibility.

**Điều kiện qua Giai đoạn 04:** người dùng duyệt hướng và bố cục hoặc đưa danh sách chỉnh sửa; mọi điểm ảnh hưởng phạm vi được ghi lại. Việc kiểm thử ứng dụng ở mục 3 thực hiện sau khi có frontend/backend, không được đánh dấu hoàn thành ở đây.
