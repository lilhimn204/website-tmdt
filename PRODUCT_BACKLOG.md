# PRODUCT_BACKLOG — Ưu tiên, phiên bản và phụ thuộc

Phiên bản 0.1 · 04/11/2026 · Giai đoạn 02 · **MVP được chấp thuận làm đầu vào Giai đoạn 03 theo PROMPT 03; chưa triển khai**.

Đọc cùng [PRD.md](PRD.md) và [USER_STORIES.md](USER_STORIES.md). Đây là product backlog, chưa phải TASKS.md triển khai hoặc cam kết thời gian. Mã C = khách hàng, A = quản trị, S = hệ thống. Story và AC dùng cùng mã. NV là nghiệp vụ Giai đoạn 01; D là quyết định còn mở trong PRD.

## 1. Quy ước

- M = Must Have; S = Should Have; N = Nice to Have. Tổng **42 hạng mục: 27 M, 6 S, 9 N**. Chỉ 27 M thuộc MVP đề xuất.
- 27 hạng mục MVP có trạng thái “Đã chấp thuận phạm vi làm cơ sở thiết kế, chưa triển khai”; 15 hạng mục ngoài MVP vẫn là kế hoạch phiên bản sau/nghiên cứu. Hạng mục nghiên cứu không có cam kết xây dựng.
- Độ phức tạp: **Thấp** = logic đơn giản; **Vừa** = nhiều trạng thái/kiểm tra; **Cao** = ảnh hưởng nhiều luồng, quyền hoặc dữ liệu quan trọng; **Rất cao** = cần nghiên cứu/quy tắc hoặc tích hợp bên ngoài. Không quy đổi máy móc thành ngày công.
- “Phụ thuộc trực tiếp” là hạng mục phải cung cấp dữ liệu/hành vi trước để tích hợp, không có nghĩa chờ làm xong toàn bộ giao diện mới phân tích được. Quyền/bảo mật S02, UX S03 và vận hành S05 là điều kiện xuyên suốt cho mọi hạng mục MVP dù không lặp ở mỗi dòng.
- Phê duyệt chức năng không phê duyệt giá, tồn kho hoặc dữ liệu thương mại chưa được cung cấp.

## 2. Chức năng khách hàng

| ID | Hạng mục và giới hạn | Ưu tiên | Phiên bản | Phức tạp | Phụ thuộc trực tiếp | Dữ liệu/quyết định chặn | Truy vết |
|---|---|---|---|---|---|---|---|
| C01 | Trang chủ, danh mục, thương hiệu, danh sách phân trang | M | MVP | Vừa | A02, A03 | D02, thương hiệu mới | NV01–02 |
| C02 | Tìm thương hiệu/tên/SKU/model; thứ tự khớp rõ, không fuzzy | M | MVP | Vừa | C01, C04 | Bộ mã và tên chuẩn | NV02 |
| C03 | Lọc/sắp xếp theo thuộc tính loại hàng, đúng cùng SKU | M | MVP | Cao | A02, C02 | D02, thuộc tính có đơn vị | NV02 |
| C04 | Chi tiết/biến thể, giá/tồn/EOL, bảo hành, tài liệu | M | MVP | Cao | A03, A04, A05, A06 | D02, D05, D09 | NV01, NV04, NV11, NV13–14 |
| C05 | So sánh 2–3 SKU cùng loại, không chấm điểm tự động | M | MVP | Vừa | C04 | Bộ thuộc tính so sánh đã duyệt | NV03 |
| C06 | Giỏ khách, số lượng, xóa, tính lại trước checkout | M | MVP | Vừa | C04 | Đơn vị bán, giới hạn số lượng | NV06 |
| C07 | Guest checkout, vùng/phí giao, tổng tiền, chống gửi trùng | M | MVP | Cao | C06, S01, A07, A08 | D03–D06 | NV04–08 |
| C08 | Chọn COD/chuyển khoản, hướng dẫn đúng trạng thái | M | MVP | Vừa | C07, A08 | D05–D06, tài khoản nhận tiền | NV08 |
| C09 | Yêu cầu báo giá nhiều dòng hoặc mô tả nhu cầu; không upload | M | MVP | Vừa | S02 | D08, nhân sự/kênh liên hệ | NV09 |
| C10 | Xem trạng thái đơn guest bằng quyền riêng; khôi phục qua hỗ trợ | M | MVP | Cao | A07, S02 | D07 | NV07, NV12 |
| C11 | Chính sách, liên hệ, tư vấn và đầu mối sau bán | M | MVP | Thấp | A04 | D09–D10, pháp nhân | NV11, NV13 |
| C12 | Quan hệ tương thích/phụ kiện do người duyệt; không suy luận | S | V1.1 | Vừa | C04, A03 | Bằng chứng quan hệ, người kỹ thuật duyệt | NV03, NV13 |
| C13 | Bài viết tư vấn: soạn/duyệt/xuất bản và liên kết sản phẩm | S | V1.1 | Vừa | A03, A04, S04 | Quyền nội dung, người biên tập | NV13 |
| C14 | Tài khoản khách, lịch sử đơn được xác minh; không tự ghép guest | N | V1.2 | Cao | C10, S02 | Quy tắc xác minh/ghép danh tính và dữ liệu cá nhân | NV06, NV12 |
| C15 | Tìm gần đúng/gợi ý khi gõ sai, đánh giá chất lượng tìm kiếm | S | V1.2 | Cao | C02, S06 | Nhật ký không PII, bộ truy vấn có đáp án | NV02 |
| C16 | Ước lượng runtime UPS có miền áp dụng và sai số | N | Nghiên cứu | Rất cao | C04, A02 | Đường cong tải/ắc quy/revision và kiểm chứng kỹ thuật | NC01 |
| C17 | Gợi ý/kiểm tra tương thích tự động nhiều linh kiện | N | Nghiên cứu | Rất cao | C12, A02 | Quy tắc versioned, dữ liệu hãng và bộ kiểm chứng | NC03–04 |
| C18 | Portal đại lý, giá riêng và công nợ được duyệt | N | Nghiên cứu | Rất cao | C14, A09, A08 | Quyền phục vụ, chính sách tín dụng/đại lý | NV16 |
| C19 | Ước tính chi phí sử dụng máy in | N | Nghiên cứu | Cao | C04, A05 | Mực/trống, năng suất, giá và giả định đã duyệt | NC02 |

## 3. Chức năng quản trị

| ID | Hạng mục và giới hạn | Ưu tiên | Phiên bản | Phức tạp | Phụ thuộc trực tiếp | Dữ liệu/quyết định chặn | Truy vết |
|---|---|---|---|---|---|---|---|
| A01 | Đăng nhập, cấp/thu hồi nhóm quyền có kiểm soát | M | MVP | Cao | — | Q11, danh sách người quản trị | NV12 |
| A02 | Danh mục/thương hiệu, từ điển thuộc tính và bộ lọc | M | MVP | Cao | A01 | D02, CAT01–20, đơn vị/kiểu dữ liệu | NV01–02 |
| A03 | Sản phẩm/biến thể/SKU, nháp–duyệt–công bố, EOL | M | MVP | Cao | A02 | D02, nguồn và người duyệt | NV01, NV14 |
| A04 | Ảnh/tài liệu, quyền sử dụng; chính sách bảo hành và trang chính sách | M | MVP | Cao | A03 | D09, tệp được phép sử dụng | NV11, NV13 |
| A05 | Giá công khai/thuế và lịch sử thay đổi; chưa promo engine | M | MVP | Vừa | A03 | D05 | NV04 |
| A06 | Nhập/điều chỉnh kho, xem lượng giữ/khả dụng, kiểm kê | M | MVP | Cao | S01 | D03–D04, tồn đầu kỳ | NV05 |
| A07 | Đơn, xác nhận, một lần giao, yêu cầu sau bán/đổi trả cơ bản | M | MVP | Cao | S01, A04 | D06, D09–D10 | NV07, NV11 |
| A08 | Đối soát nhận tiền, thiếu/thừa, hoàn tiền thủ công có dấu vết | M | MVP | Cao | S01 | D05, Q07, người xác nhận | NV08 |
| A09 | Yêu cầu/báo giá, phân công, phiên bản, bản in, chuyển đơn một lần | M | MVP | Cao | C09, A04, A05, A07, S01 | D08, thẩm quyền giá và chấp thuận | NV09–10 |
| A10 | Dashboard đơn/tiền hàng thuần/AOV/báo giá, không thay kế toán | M | MVP | Vừa | A07, A08, A09, S06 | D11, quy ước KPI | NV17 |
| A11 | Nhập CSV có xem trước, kiểm lỗi, chọn tạo/cập nhật | S | V1.1 | Cao | A03, A04, A05, A06 | Mẫu dữ liệu ổn định; chính sách ghi đè/khôi phục | NV15 |
| A12 | Nhập Excel theo mẫu, kế thừa quy trình kiểm tra CSV | S | V1.2 | Cao | A11 | Quy định sheet/kiểu ô, giới hạn file, không thực thi công thức | NV15 |
| A13 | Mã/chương trình khuyến mãi có điều kiện và giới hạn | N | V1.2 | Cao | A05, S01, C07 | Quy tắc cộng dồn, ngân sách, thuế/hoàn tiền | NV04 |

## 4. Chức năng hệ thống

| ID | Hạng mục và giới hạn | Ưu tiên | Phiên bản | Phức tạp | Phụ thuộc trực tiếp | Dữ liệu/quyết định chặn | Truy vết |
|---|---|---|---|---|---|---|---|
| S01 | Server kiểm giá/tồn, giao dịch nguyên vẹn, giữ/hết hạn/xuất/hoàn, chống trùng | M | MVP | Cao | A01, A03, A05 | D03–D05, kiểm chứng phương án trong stack | NV04–08, NV10 |
| S02 | Quyền đối tượng, RLS, riêng tư, tệp, chống spam, nhật ký | M | MVP | Cao | A01 | D07, Q13 | NV12 |
| S03 | Responsive, khả năng tiếp cận, lỗi/rỗng/đang tải, hiệu năng | M | MVP | Cao | — | Thiết kế GĐ04, D12, NFR03–06 | KH01–04 |
| S04 | SEO nền tảng cho trang công khai, loại trang riêng khỏi index | M | MVP | Cao | C01, C04, C11 | Quyết định render/crawl trong stack ở GĐ05 | NV13 |
| S05 | Cấu hình môi trường, theo dõi lỗi, sao lưu/khôi phục và hướng dẫn vận hành | M | MVP | Cao | — | D10, D12; điều kiện Free tier kiểm chứng sau | NV12, R09–10 |
| S06 | Mốc nghiệp vụ/KPI, loại thử/trùng/spam, analytics không PII | M | MVP | Vừa | A07, A08, A09 | D11, khả năng đo thực tế | NV17 |
| S07 | Email giao dịch có hàng chờ/retry/trạng thái gửi | S | V1.1 | Cao | A07, A09, S02 | Nhà cung cấp, quyền gửi, quota/chi phí | NV07, NV09 |
| S08 | Tích hợp từng sàn, mapping/đối soát đơn và tồn | N | Nghiên cứu | Rất cao | A06, A07, A08, S01, S02 | Quyền API, tài khoản, sandbox, giới hạn và nguồn tồn chuẩn | Mục tiêu giảm phụ thuộc sàn; chưa có quyền tích hợp |
| S09 | Đa kho/ERP và đồng bộ tồn | N | Nghiên cứu | Rất cao | A06, A07, S01 | Quy trình kho, giao thức/tài khoản ERP, nguồn sự thật | NV05 |
| S10 | Cổng thanh toán tự động | N | V1.2 | Cao | C07, A08, S01, S02 | Hợp đồng/tài khoản, phí, sandbox, webhook | NV08 |

## 5. Chuỗi phụ thuộc cần lưu ý

1. **Dữ liệu:** A01 → A02 → A03 → A04/A05 → nền tảng catalog và giao dịch. Không làm search/filter trước khi thống nhất thuộc tính và SKU.
2. **Bán hàng:** A03/A05 → S01 → A06/A07/A08 → C04/C06/C07/C08. Quy tắc giữ hàng và tiền phải được chốt trước khi nghiệm thu checkout.
3. **B2B:** A01/S02 → C09 → A09 (cùng A04/A05/A07/S01) → chuyển đơn → A10. Báo giá không vượt qua kiểm tra tồn và quyền khi chuyển đơn.
4. **Tìm/chọn:** C01/C04 → C02 → C03; C04 → C05. C12 không là điều kiện của C05 hoặc MVP.
5. **Đo lường:** A07/A08/A09 → S06 → A10. Không yêu cầu có đủ 90 ngày dữ liệu mua lại để mở bán.
6. **Điều kiện ra mắt xuyên suốt:** S02, S03, S04, S05 và các AC tương ứng phải đạt; không coi chúng là việc tùy chọn làm sau.

Các bước trên mô tả phụ thuộc sản phẩm, không cho phép tự bắt đầu triển khai hoặc huy động agent song song.

## 6. Độ bất định và rủi ro ảnh hưởng ước lượng

| Khu vực | Bất định | Hệ quả trước khi ước lượng thời gian |
|---|---|---|
| Catalog/lọc | Số SKU, độ đầy đủ/chuẩn của thông số | Lấy bộ dữ liệu mẫu được phép và duyệt từ điển thuộc tính |
| Tồn/giao dịch | Nguồn tồn, thời hạn giữ, đồng bộ kênh khác | Chốt D03–D04 và thử tính nguyên vẹn/đồng thời ở GĐ05 |
| Phí/thuế/hoàn | Chưa có chính sách doanh nghiệp | Chốt D05–D06; AC dùng quy tắc đã duyệt thay vì tự chọn thuế/phí |
| Guest/privacy | Quyền xem đơn, khôi phục và thời hạn lưu | Chốt D07; kiểm tra lạm dụng và truy cập chéo |
| SEO/runtime hosting | Phương án render và nền tảng tác vụ hết hạn chưa chọn | Kiểm chứng trong stack bắt buộc, không cam kết chỉ cần SPA mặc định |
| B2B | Nhân sự, SLA, hạn báo giá, thẩm quyền giá | Chốt D08–D10; xác nhận quy trình thủ công có thể vận hành |
| Free tier/backup | Chưa kiểm tra hạn mức, phương án phục hồi và tải thật | Chốt D12 trước kế hoạch triển khai; không mặc định sao lưu tự động sẵn có |

## 7. Kiểm soát thay đổi phạm vi

Mọi đề nghị kéo Should/Nice vào MVP cần ghi lý do, dữ liệu/quyền đã có, các phụ thuộc phát sinh và phần dự kiến bỏ/giãn nếu nguồn lực không đủ; cập nhật cả ba tài liệu. Không giảm quyền, kiểm giá/tồn, chống trùng, đối soát hoặc bảo vệ dữ liệu để đổi lấy tính năng trang trí.

Phạm vi MVP được ghi nhận theo PROMPT 03; tham số còn mở giữ nguyên. Việc ghi hạng mục ở đây không phải bằng chứng đã triển khai hay nghiệm thu.
