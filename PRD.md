# PRD — Website thương mại điện tử sản phẩm công nghệ

Phiên bản 0.1 · Giai đoạn 02 · 04/11/2026 · Asia/Bangkok.

**Trạng thái: Phạm vi MVP được người dùng chấp thuận làm đầu vào Giai đoạn 03 qua PROMPT 03 ngày 04/11/2026.** Các tham số/dữ liệu D02–D12 chưa xác minh vẫn giữ mở. Phê duyệt phạm vi không cho phép tự bắt đầu lập trình.

## 1. Cơ sở, quyền quyết định và tài liệu liên quan

PROMPT 02 xác nhận sử dụng tài liệu Giai đoạn 01 đã phê duyệt làm đầu vào. Ghi nhận phê duyệt ở mức kết quả phân tích; những dữ liệu trước đó ghi “Chưa xác minh” vẫn chưa trở thành dữ liệu đã kiểm chứng. Các câu hỏi Q01–Q15 và vấn đề DQ01–DQ06 trong [BUSINESS_ANALYSIS.md](BUSINESS_ANALYSIS.md) tiếp tục được theo dõi.

Đầu vào: MASTER PROMPT 00, PROMPT 01, PROMPT 02, [BUSINESS_ANALYSIS.md](BUSINESS_ANALYSIS.md), [PRODUCT_CATALOG_PLAN.md](PRODUCT_CATALOG_PLAN.md).

Bộ đầu ra Giai đoạn 02:

- **PRD.md:** mục tiêu, giới hạn, quy tắc sản phẩm, yêu cầu chất lượng và quyết định phạm vi.
- [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md): danh sách chức năng, ưu tiên, phiên bản, độ phức tạp, phụ thuộc và truy vết nghiệp vụ.
- [USER_STORIES.md](USER_STORIES.md): user stories và acceptance criteria (AC — điều kiện kiểm tra để chấp nhận chức năng), dùng cùng mã chức năng.
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): trạng thái dự án và điểm dừng.

Các quyết định được lập ở Giai đoạn 02 và phạm vi MVP nay được chấp thuận làm cơ sở thiết kế Giai đoạn 03 theo PROMPT 03; dữ liệu kinh doanh/tham số còn mở chưa được tự điền hoặc xác minh. Yêu cầu bắt buộc trong MASTER PROMPT vẫn giữ nguyên. Không cài/chạy Spec Kit hoặc Impeccable: áp dụng phương pháp đặc tả có truy vết của Spec Kit và nguyên tắc thông tin rõ, tương tác dễ dùng của Impeccable. PRD không bao gồm thiết kế visual, schema, API hoặc kế hoạch lập trình.

## 2. Vấn đề, mục tiêu và đối tượng

Khách mua công nghệ cần chọn đúng model/cấu hình, hiểu giá và bảo hành, đặt hàng dễ hoặc nhận tư vấn cho nhu cầu phức tạp. Doanh nghiệp cần quản lý dữ liệu và thực hiện đơn/báo giá nhất quán.

| Mã mục tiêu | Kết quả mong muốn | Liên quan |
|---|---|---|
| MT01 | Tìm đúng sản phẩm, phân biệt thông số và biết thông tin nào chưa được xác minh | NC01–05, NV01–03 |
| MT02 | Đặt đơn guest bằng COD/chuyển khoản với giá và tồn được kiểm tra đáng tin cậy | NV04–08 |
| MT03 | Tiếp nhận nhu cầu B2B, lập báo giá có phiên bản và chuyển sang đơn có kiểm soát | NV09–10 |
| MT04 | Vận hành catalog, kho, đơn, tiền và sau bán có người chịu trách nhiệm | NV01, NV05, NV07–14 |
| MT05 | Đo kết quả theo định nghĩa thống nhất và không làm lộ dữ liệu khách hàng | NV12, NV17 |

Người dùng: KH01 cá nhân; KH02 văn phòng/hộ kinh doanh; KH03 IT/mua hàng doanh nghiệp; KH04 đại lý/đơn vị tích hợp chỉ trong phạm vi được phép. Khách doanh nghiệp có thể checkout theo điều kiện bán lẻ; yêu cầu báo giá không bắt buộc phải có tài khoản hoặc tư cách đại lý.

Không có mục tiêu CR/AOV/doanh thu số cụ thể được xác nhận. Dùng công thức Giai đoạn 01; baseline là Chưa xác minh, không gán doanh thu giả hay cam kết tăng trưởng.

## 3. Phạm vi sản phẩm và cách phân loại ưu tiên

- **Must Have:** cần để hoàn thành vòng mua/báo giá và vận hành an toàn trong phạm vi MVP đề xuất. Nếu chưa đạt, chưa được ra mắt giao dịch thật.
- **Should Have:** có giá trị nhưng có phương án thủ công/giới hạn thay thế; đưa vào phiên bản sau, không âm thầm thêm vào MVP.
- **Nice to Have:** chỉ xem xét sau khi có dữ liệu nhu cầu, nguồn lực và điều kiện kỹ thuật.
- **MVP:** phiên bản đầu có thể bán hàng và tiếp nhận/xử lý báo giá trong phạm vi đã duyệt. Không đồng nghĩa bản mô phỏng chỉ có giao diện.
- **V1.1, V1.2:** thứ tự phát triển đề xuất, không phải ngày giao hàng. “Nghiên cứu” không phải cam kết sẽ triển khai.

### 3.1. MVP đã chấp thuận làm cơ sở Giai đoạn 03 — 27 hạng mục Must Have

| Nhóm | Chức năng có trong MVP |
|---|---|
| Khách hàng C01–C05 | Trang chủ/danh mục/thương hiệu; tìm tên/thương hiệu/SKU/model; lọc theo ngành hàng; chi tiết/biến thể/thông số/giá/tồn/EOL/bảo hành/tài liệu; so sánh cơ bản |
| Khách hàng C06–C11 | Giỏ hàng; guest checkout; COD/chuyển khoản thủ công; form yêu cầu báo giá; xem trạng thái đơn bằng quyền truy cập riêng; chính sách/liên hệ/tư vấn |
| Quản trị A01–A05 | Đăng nhập/phân quyền; danh mục/thương hiệu/định nghĩa thuộc tính; sản phẩm/SKU/duyệt/EOL; ảnh/tài liệu/chính sách bảo hành; giá/thuế |
| Quản trị A06–A10 | Kho và lịch sử điều chỉnh; đơn/giao/đổi trả cơ bản; đối soát tiền/hoàn tiền thủ công; báo giá phiên bản/chuyển đơn; dashboard vận hành |
| Hệ thống S01–S06 | Giao dịch nguyên vẹn/chống trùng/giữ hàng; kiểm soát truy cập/dữ liệu/chống spam/nhật ký; trải nghiệm responsive/truy cập được; SEO nền tảng; vận hành/sao lưu/khôi phục; dữ liệu đo lường tối thiểu |

So sánh cơ bản được giữ trong MVP vì nhu cầu kỹ thuật; chỉ so 2–3 lựa chọn cùng loại hàng, không tự chấm điểm hoặc chọn “tốt nhất”. Liên kết phụ kiện/tương thích có cấu trúc được tách thành C12 ở V1.1; MVP hiển thị thông số/tài liệu đã duyệt và nhận tư vấn thủ công.

### 3.2. Giới hạn để MVP khả thi

- Một website tiếng Việt, đề xuất tiền tệ VND và thị trường giao hàng Việt Nam; doanh nghiệp duyệt địa bàn cụ thể.
- Chỉ công bố danh mục/SKU được duyệt. Số SKU và ngành hàng ra mắt chưa chốt; không mở tất cả CAT01–20 chỉ vì hệ thống hỗ trợ.
- Một nguồn tồn khả dụng dành cho website, quản lý thủ công có lịch sử. Nếu cùng bán ở kênh khác, phải có lượng phân bổ riêng và quy trình đối soát; chưa đồng bộ đa kênh.
- Một đơn giao một đợt trong MVP; không đặt trước, không bán vượt tồn, không công nợ, không nhiều địa chỉ giao trong một đơn.
- Giá công khai theo SKU và giá báo riêng theo phiên bản báo giá. Không có mã giảm giá, điểm thưởng, flash sale hay máy tính khuyến mãi trong MVP.
- COD/chuyển khoản thủ công. Hoàn tiền là ghi nhận giao dịch ngoài hệ thống có bằng chứng, không phải tự động chuyển tiền.
- B2B: nhận yêu cầu, phân công, ghi trao đổi, lập/lưu/in báo giá, ghi nhận khách chấp thuận, chuyển thành đơn. Nhân viên gửi báo giá và liên hệ qua kênh doanh nghiệp đã duyệt; chưa tự gửi email/SMS, ký điện tử hoặc cổng khách doanh nghiệp.
- Catalog nhập/sửa từng sản phẩm bằng admin. CSV/Excel có xem trước và kiểm tra thuộc V1.1/V1.2.
- Chính sách và thông tin liên hệ sửa trong admin ở mức nội dung đơn giản; hệ thống bài viết tư vấn đầy đủ thuộc V1.1.
- Tiếp nhận sau bán và ghi hồ sơ xử lý trong admin ở mức cơ bản; chưa portal bảo hành/tra cứu serial tự phục vụ.

MVP không có công cụ bán EOL ngoại lệ. EOL/ngừng bán bị chặn giao dịch mới; thông tin hỗ trợ đơn cũ được giữ. Không áp dụng luật “có tồn là được bán”.

### 3.3. Phiên bản tiếp theo

| Phiên bản | Phạm vi dự kiến | Điều kiện vào phiên bản |
|---|---|---|
| V1.1 | C12 liên kết tương thích/phụ kiện được duyệt; C13 bài viết; A11 nhập CSV; S07 email giao dịch | Quy tắc catalog ổn định; có người duyệt quan hệ kỹ thuật/nội dung; chọn dịch vụ gửi thư và ngân sách |
| V1.2 | C14 tài khoản khách; C15 tìm kiếm nâng cao; A12 Excel; A13 khuyến mãi; S10 cổng thanh toán | Có nhu cầu đo được, xử lý dữ liệu/quyền truy cập và chi phí được duyệt; hợp đồng tích hợp nếu cần |
| Nghiên cứu, chưa ấn định | C16 runtime UPS; C17 suy luận tương thích; C18 portal đại lý/công nợ; C19 tính chi phí máy in; S08 sàn TMĐT; S09 đa kho/ERP | Vượt điều kiện riêng ở mục 8; người dùng duyệt phạm vi mới |

## 4. Quy tắc chức năng khách hàng

### 4.1. Tìm kiếm — C02

- Một ô tìm kiếm cho thương hiệu, tên, SKU và model trên catalog đã công bố; không truy vấn nháp hoặc dữ liệu giá nội bộ.
- Tên/thương hiệu hỗ trợ không phân biệt hoa thường, tìm có/không dấu tiếng Việt và khoảng trắng dư. SKU/model hỗ trợ khớp chính xác và tiền tố, không tự xóa mọi dấu phân cách làm nhập nhằng mã.
- Thứ tự: SKU/model khớp chính xác trước; tiền tố mã sau; tên/thương hiệu sau nữa. Thứ tự trong cùng nhóm phải ổn định.
- Kết quả từ SKU phải chỉ rõ biến thể tương ứng. Tìm theo thương hiệu là lọc sản phẩm của thương hiệu đó, không chỉ tìm chữ trong tiêu đề.
- Hết hàng vẫn có thể tìm thấy với nhãn rõ. EOL/ngừng bán có thể tìm thấy để hỗ trợ nhưng không được thêm giỏ. SKU nháp/ẩn không lộ dù gõ chính xác.
- Không có kết quả: giữ từ khóa, cho sửa/gỡ lọc và liên hệ; lỗi mạng khác với không có kết quả. Không trả kết quả cũ của từ khóa trước khi phản hồi về sai thứ tự.
- Chưa fuzzy typo, tìm ngữ nghĩa, giọng nói, hình ảnh hoặc tìm runtime UPS. C15 mở rộng sau.

### 4.2. Bộ lọc riêng — C03

| Loại hàng | Bộ lọc ban đầu khi dữ liệu có đủ |
|---|---|
| UPS | Công nghệ, VA, W, số pha đầu vào/ra, Tower/Rack, thương hiệu |
| Máy in | Đơn/đa năng, màu/đen trắng, Wi-Fi/LAN, đảo mặt, ADF, khổ giấy |
| RAM | Dung lượng, số thanh/kit khi có, DDR, DIMM/SO-DIMM, tốc độ có đơn vị |
| SSD | Dung lượng, form factor, giao tiếp SATA/PCIe, thế hệ PCIe nếu có |
| Mainboard | Socket, chipset, DDR, form factor |
| Case/PSU/tản | Mỗi loại có bộ riêng: khả năng lắp; công suất/đầu nối; socket/kích thước tản |
| Switch công nghiệp | Số/tốc độ cổng, PoE, quản lý, kiểu lắp, điều kiện môi trường có dữ liệu |
| Datacom | Loại thiết bị và chuẩn kết nối được xác minh; không dùng bộ lọc UPS/switch |

Logic: nhiều lựa chọn trong một thuộc tính là OR; giữa các thuộc tính là AND. Khoảng số gồm hai đầu mút. Giá trị Chưa xác minh không đáp ứng một lựa chọn số/boolean cụ thể. Đơn vị phải được chuẩn hóa trước khi lọc; VA không thay W, M.2 không thay giao tiếp.

Lọc trên thuộc tính của cùng một SKU: không ghép dung lượng của biến thể A với giao tiếp của biến thể B để trả một sản phẩm không tồn tại. Chuyển danh mục thì loại lọc không áp dụng và thông báo; tìm toàn site chỉ có lọc chung, bộ kỹ thuật xuất hiện sau khi chọn loại hàng. Có gỡ từng lọc, xóa hết, số kết quả và URL tái lập trạng thái hợp lệ. Sắp xếp giá không coi “liên hệ” là giá 0; nhóm không có giá đặt sau nhóm có giá.

### 4.3. Chi tiết, so sánh, phụ kiện — C04, C05, C12

- Chi tiết tách sản phẩm và SKU: chọn biến thể cập nhật đúng thông số, giá, khả năng bán và bảo hành. Hiển thị đơn vị bán, nguồn/điều kiện cần thiết, tài liệu đúng phiên bản.
- So sánh 2–3 SKU thuộc cùng **loại** và bộ thuộc tính; một biến thể là một lựa chọn. Không so UPS với RAM hoặc coi mọi linh kiện là cùng nhóm.
- Giá trị có số 0 hợp lệ, “Không”, “Không áp dụng” và “Chưa xác minh” khác nhau. Không tạo xếp hạng hiệu năng hoặc bảo đảm tương thích từ bảng so sánh.
- Quan hệ phụ kiện C12 là danh sách được người kỹ thuật duyệt, có nguồn/điều kiện và hiệu lực; “mua kèm” không mặc nhiên nghĩa là “tương thích”. Không có quan hệ thì ẩn mục, không sinh gợi ý ngẫu nhiên.

### 4.4. Giá, hàng, EOL, bảo hành

- Giá cuối cho SKU phải do server xác định. Giỏ hàng chỉ giữ lựa chọn/số lượng; không phải cam kết giá hoặc giữ hàng.
- Hiển thị rõ giá đã/chưa gồm thuế theo cấu hình được duyệt; checkout có tiền hàng, giảm giá nếu áp dụng theo giá đã duyệt, thuế, phí giao và tổng. Giá trị tiền được tính nhất quán, không tự dùng thuế suất suy đoán.
- Thiếu giá, thiếu phí giao xác định, SKU yêu cầu cấu hình hoặc chưa đủ điều kiện bán: chuyển tư vấn/báo giá, không ghi tổng tiền giả để nhận đơn trả tiền.
- Tách trạng thái xuất bản, vòng đời và khả năng mua theo catalog plan. Nhãn EOL cần nguồn/ngày xác nhận; hết hàng không đồng nghĩa EOL.
- Bảo hành có ưu tiên SKU cụ thể → model/sản phẩm; chỉ cho phép giá trị kế thừa đã duyệt. Chính sách thương hiệu không tự áp cho mọi model. Xung đột/chưa có chính sách thì chưa cho bán trực tiếp.
- Lưu bản chốt tên/model/SKU, giá/thuế và chính sách tại đơn/báo giá để sửa catalog không làm đổi giao dịch cũ. Không xóa hẳn sản phẩm đã phát sinh giao dịch.

## 5. Checkout, đơn hàng, tồn và tiền

### 5.1. Quy tắc giao dịch đề xuất — cần phê duyệt D03–D06

1. Guest checkout nhận tên, số điện thoại, địa chỉ giao hàng, phương thức nhận/thanh toán phù hợp; email tùy chọn. Thông tin xuất hóa đơn chỉ yêu cầu khi khách cần. Không bắt tạo tài khoản hoặc đồng ý marketing để mua.
2. Server xác thực SKU, khả năng bán, số lượng nguyên dương, giá/thuế và phí giao. Nếu khác thông tin khách vừa xác nhận, trả nội dung thay đổi để khách chấp thuận lại trước tạo đơn.
3. Đề xuất tạo đơn chờ xác nhận và giữ hàng cùng một giao dịch: hoặc cả hai thành công, hoặc không có phần dở dang. Hai người mua món cuối chỉ một người nhận cam kết giữ hàng.
4. Tồn có thể bán = tồn vật lý đủ điều kiện bán − lượng đang giữ. Khi xuất kho, giảm tồn vật lý và giải phóng phần giữ tương ứng một lần. Hủy trước xuất giải phóng giữ; trả hàng chỉ tăng tồn bán được sau kiểm tra kho.
5. Giữ hàng có hạn theo phương thức thanh toán, do doanh nghiệp duyệt. Khi hết hạn, đơn/giữ hàng được xử lý nhất quán; hệ thống không được bán vượt tồn do tác vụ dọn dẹp chậm. Tiền đến sau hết hạn vào hàng đối soát, không tự kích hoạt đơn khi đã hết hàng.
6. Gửi lại cùng một yêu cầu do double-click/mất phản hồi chỉ trả lại cùng mã đơn; dùng lại khóa yêu cầu với nội dung khác phải bị từ chối. Đơn mới thật cần ý định gửi mới. Cơ chế kỹ thuật cụ thể thuộc Giai đoạn 05.
7. Nhân viên xác nhận đơn; thay SKU, giá hoặc thời gian giao đã chốt cần ghi nhận sự đồng ý của khách. MVP không sửa âm thầm đơn đã xác nhận: hủy/tạo lại có liên kết hoặc quy trình sửa có kiểm soát được chốt trước triển khai.
8. Chuyển khoản chỉ được chuyển sang đủ tiền khi người có quyền đối chiếu tiền thực nhận. COD có thể giao trước nhận tiền nhưng chỉ ghi đã thu sau đối soát. Chuyển khoản chưa đủ tiền không xuất hàng trong MVP; không hỗ trợ trả góp/công nợ.

### 5.2. Vòng đời và ngoại lệ

| Đối tượng | Trạng thái/chuyển trạng thái chính | Điều kiện |
|---|---|---|
| Đơn | Chờ xác nhận → Xác nhận → Hoàn tất; có nhánh Hủy/Hết hạn | Hoàn tất khi giao thành công và đủ tiền đã đối soát; lý do và người thao tác được lưu |
| Giao hàng | Chưa giao → Đang giao → Đã giao hoặc Giao thất bại → Đang hoàn/Đã nhận lại | Đơn hủy chưa xuất không được tạo vận chuyển; đã xuất không hủy tồn như chưa xuất |
| Tiền | Chưa nhận → Chờ đối soát → Đã nhận; nhận thiếu/thừa cần xử lý; hoàn một phần/toàn bộ | Tách bút toán nhận/hoàn để biết số dư, không ghi đè xóa lịch sử |
| Sau bán | Tiếp nhận → Đánh giá → Chấp nhận/Từ chối → Đang xử lý → Đóng | Đổi/trả, hoàn tiền và hoàn tồn có quyết định riêng, không một nút làm cả ba vô điều kiện |

MVP một lần giao mỗi đơn; hoàn một phần vẫn cần ghi số lượng, số tiền và lý do chính xác. Tiền hoàn không vượt số đã nhận trừ hoàn trước đó. Giá trị giảm giá/thuế/phí khi hoàn dùng bản chốt đơn và chính sách đã duyệt, không dùng giá catalog hiện tại. Yêu cầu lặp không hoàn tiền/hoàn tồn hai lần.

### 5.3. Theo dõi đơn không tài khoản — C10

Đề xuất khách nhận quyền xem trạng thái riêng ở màn hình đặt thành công và có thể lưu liên kết. Quyền này phải khó đoán, giới hạn thời gian, có thể thu hồi và không xuất hiện trong analytics/log công khai. Chỉ hiển thị thông tin tối thiểu, che dữ liệu liên hệ; không cho sửa đơn hoặc lấy toàn bộ dữ liệu cá nhân chỉ bằng quyền xem trạng thái.

Mã đơn hoặc số điện thoại đơn lẻ không đủ truy cập. Mất liên kết: liên hệ bộ phận hỗ trợ để xác minh, không dò đơn công khai. Kênh khôi phục và thời hạn quyền xem là D07; không mặc định cần email/SMS trả phí. Phương án bảo mật chi tiết phải được đánh giá ở Giai đoạn 05.

## 6. Báo giá và quản trị

### 6.1. Yêu cầu báo giá C09 và A09

- Có thể gửi nhiều dòng SKU/số lượng hoặc bài toán chưa có model. Tên liên hệ, ít nhất một kênh liên lạc và nội dung nhu cầu là bắt buộc; công ty, nơi giao, thời điểm cần là tùy chọn theo bối cảnh.
- MVP không nhận upload tệp từ khách. Không tự áp ngưỡng số lượng để cấp chiết khấu; ngưỡng định tuyến theo sản phẩm chỉ cấu hình sau doanh nghiệp duyệt.
- Yêu cầu có mã riêng, chống gửi lặp, trạng thái và người phụ trách. Hiển thị “đã tiếp nhận yêu cầu”, không nói “đã đặt hàng” hoặc hứa thời gian trả lời chưa được duyệt.
- Báo giá lưu dòng hàng/phạm vi, số lượng, giá, thuế, phí, tổng, điều kiện, hiệu lực, bảo hành và người duyệt. Xuất bản in để nhân viên gửi thủ công; hệ thống không tự gửi ra ngoài trong MVP.
- Phiên bản đã gửi được giữ nguyên; sửa tạo bản mới và đánh dấu bản thay thế. Ghi nhận ngày/kênh gửi và bằng chứng khách chấp thuận qua thao tác nhân viên có quyền.
- Chấp thuận không đồng nghĩa có đơn: kiểm tra bản hiện hành, hạn, SKU/tồn, điều kiện giao và thanh toán rồi tạo đơn liên kết. Giá dùng bản báo giá hợp lệ được duyệt, không tự đổi sang giá công khai.
- Một báo giá được chuyển tối đa một đơn trong MVP; thao tác lặp trả cùng đơn. Nếu cần nhiều lần giao/đơn thì ngoài MVP. Thay đổi điều kiện hoặc hết hạn phải làm rõ/phê duyệt lại, không tự gia hạn.
- Yêu cầu và báo giá không giữ hàng; chỉ đơn được tạo mới giữ hàng theo quy tắc chung. Không có quyền đại lý hoặc công nợ tự động.

### 6.2. Quyền vận hành tối thiểu

Đây là nhóm quyền để phân công, không yêu cầu mỗi nhóm phải có một nhân sự riêng. Một người kiêm nhiệm được cấp rõ từng quyền và vẫn có nhật ký.

| Nhóm quyền | Được làm | Không được mặc định làm |
|---|---|---|
| Chủ hệ thống | Cấp/thu hồi quyền theo quy trình, cấu hình vận hành | Xóa dấu vết giao dịch hoặc cho phép khách tự cấp quyền |
| Catalog/kỹ thuật | Sửa dữ liệu, kiểm tra thông số, duyệt xuất bản theo quyền được cấp | Xác nhận tiền hoặc tự đổi tồn |
| Sales | Xử lý đơn/báo giá, ghi trao đổi, đề xuất giá báo | Xác nhận thanh toán hoặc đổi quyền người dùng |
| Kho | Ghi nhận nhập/điều chỉnh/xuất/nhận hàng trả theo quyền | Sửa giá hoặc hoàn tiền |
| Kế toán/người đối soát | Xác nhận nhận/hoàn tiền có chứng từ | Thay đổi SKU hoặc tồn trực tiếp |
| Hỗ trợ | Xem thông tin cần thiết, ghi yêu cầu sau bán | Xem toàn bộ thông tin không phục vụ công việc hoặc sửa tài chính |

Backend/database phải kiểm tra quyền trên từng hành động và đối tượng, không chỉ ẩn nút. Tài khoản quản trị cấp có kiểm soát qua Supabase Auth, không mở tự đăng ký admin. Thay đổi quan trọng có người, thời gian, lý do, giá trị trước/sau phù hợp; không ghi secrets.

### 6.3. Dashboard MVP

Số đơn theo trạng thái, giá trị hàng thuần của đơn hoàn tất, AOV theo định nghĩa đã chọn, số yêu cầu báo giá và danh sách đang chờ xử lý; bộ lọc thời gian và B2C/B2B. Tiền chưa đối soát không gọi là doanh thu đã thu. Đơn từ báo giá chỉ tính một lần. Đây là báo cáo vận hành, không thay phần mềm kế toán.

Traffic lấy từ công cụ analytics phù hợp; CR theo phiên và mua lại 90 ngày chỉ hiển thị khi có dữ liệu đủ và định danh phù hợp. Nếu chưa có, hiển thị “Chưa đủ dữ liệu”, không 0%. Bản MVP vẫn phải lưu mốc nghiệp vụ cần thiết; dashboard phễu/CRM nâng cao không phải điều kiện ra mắt.

## 7. Ràng buộc kỹ thuật và chất lượng

### 7.1. Stack bắt buộc và phụ thuộc cần kiểm chứng

| Thành phần đã được yêu cầu | Vai trò dự kiến và giới hạn đặc tả |
|---|---|
| React, Vite, TypeScript strict, Tailwind CSS, React Router | Giao diện khách/admin; không thay stack. Cần giải pháp SEO cho trang công khai phù hợp stack, chưa chọn cách render ở PRD |
| Cloudflare Pages và Pages Functions | Hosting và xử lý API tin cậy; cần chứng minh luồng giao dịch, tác vụ hết hạn giữ hàng và kết nối dữ liệu phù hợp trước triển khai |
| Supabase PostgreSQL, Auth, Storage | Dữ liệu, xác thực, tệp; quyền RLS/backend và vùng công khai/riêng phải được thiết kế; không đưa service role key ra frontend |
| Git/GitHub | Lưu source và lịch sử; không đưa bí mật/dữ liệu khách vào repo |
| Vitest, Playwright, ESLint | Kiểm tra nghiệp vụ trọng yếu, luồng người dùng, kiểu/lint ở giai đoạn lập trình; chưa chạy trong giai đoạn tài liệu |
| Cloudflare Web Analytics khi phù hợp | Phải kiểm chứng khả năng đo; không giả định có custom events/đối chiếu phiên đầy đủ |

Không xác nhận hạn mức hoặc khả năng Free tier hiện hành trong PRD. Giai đoạn 05 phải kiểm tra nguồn chính thức, thử phương án kết nối, giao dịch đồng thời, xử lý hết hạn giữ hàng, SEO, sao lưu và tải dự kiến. Nếu không đáp ứng, quay lại điều chỉnh thiết kế/phạm vi hoặc xin quyết định ngân sách; không âm thầm dùng dịch vụ khác/hosting trả phí.

### 7.2. Yêu cầu chất lượng nghiệm thu MVP

| Mã | Yêu cầu | Bằng chứng cần có khi triển khai |
|---|---|---|
| NFR01 | Không rò quyền hoặc dữ liệu riêng | Thử quyền khách/admin/sales/kho/kế toán; truy cập chéo đơn và tệp bị chặn; secrets không có trong bundle |
| NFR02 | Giao dịch chính xác khi lặp/đồng thời | Hai yêu cầu giành tồn cuối; retry đơn/tiền/hoàn; lỗi giữa chừng không để tồn hoặc số tiền lệch |
| NFR03 | Responsive và thao tác rõ | Luồng chính ở rộng 360, 768, 1280 px; không cuộn ngang toàn trang, bảng so sánh có vùng cuộn rõ; điều khiển dùng được bằng bàn phím, nhãn/lỗi/focus rõ |
| NFR04 | Đọc hiểu và khả năng tiếp cận | Nội dung không chỉ dựa vào màu; thứ tự tiêu đề hợp lý, alt cho ảnh cần thiết, thông báo lỗi gắn trường; thiết kế mục tiêu tương phản chữ thường ít nhất 4,5:1 và không che nội dung khi phóng to 200% |
| NFR05 | Hiệu năng có điều kiện đo | Mục tiêu đề xuất: tìm/lọc phản hồi p95 ≤ 2 giây với 500 SKU dữ liệu thử được gắn nhãn, 10 người dùng đồng thời trong 5 phút, môi trường và cache ghi rõ. Phải xác nhận tải thực D12 trước chốt kế hoạch; không tuyên bố SLA free tier |
| NFR06 | Xử lý lỗi có thể phục hồi | Mất mạng không báo thành công giả; retry không trùng; lỗi tải khác không có dữ liệu; giữ nội dung form không nhạy cảm khi có thể |
| NFR07 | SEO trung thực | URL trang công khai ổn định, metadata/canonical đúng, sitemap chỉ trang phù hợp; nội dung quan trọng được crawler đọc; không index admin/giỏ/checkout/quyền xem đơn; không khai structured data giá/tồn giả |
| NFR08 | Vận hành và phục hồi | Có hướng dẫn cấu hình secrets/khôi phục; bằng chứng phục hồi bản sao thử; người chịu trách nhiệm, chu kỳ backup và thời gian phục hồi được duyệt trước go-live |
| NFR09 | Riêng tư, chống lạm dụng | Thu tối thiểu, thời hạn lưu được duyệt; analytics không chứa PII; giới hạn/chống spam không tạo đơn rác hàng loạt; log không chứa token tra cứu hoặc dữ liệu thanh toán nhạy cảm |

Các con số trong NFR03–05 là tiêu chí đề xuất của sản phẩm, không kết quả đo hoặc khẳng định tuân thủ chứng nhận. Kiểm thử cụ thể sẽ được lập sau khi có thiết kế và yêu cầu được duyệt.

## 8. Đánh giá tính năng nâng cao và điều kiện mở khóa

| Tính năng | Vì sao không đưa MVP | Dữ liệu/quyền và kiểm tra bắt buộc trước khi cam kết |
|---|---|---|
| C16 Tính runtime UPS | VA/W hoặc dung lượng ắc quy không đủ để cam kết số phút | Dữ liệu runtime theo tải/model/revision/cấu hình ắc quy; miền áp dụng, điều kiện đo và sai số được kỹ thuật duyệt; bộ kiểm chứng độc lập; không ngoại suy ngoài miền; có từ chối tính khi thiếu dữ liệu |
| C17 Gợi ý tương thích tự động | Cùng socket/form factor không chứng minh mọi cấu hình lắp/chạy được | Quy tắc versioned theo CPU/BIOS/RAM/kích thước/đầu nối; dữ liệu hãng; ví dụ hợp/không hợp/không rõ; xác định trách nhiệm duyệt và cách cập nhật |
| S08 Tích hợp sàn | Chưa có quyền truy cập/tài khoản/hợp đồng/API; rủi ro sai tồn/đơn | Quyền chính thức từng sàn; mapping SKU, nguồn tồn chuẩn, chống trùng, đối soát phí/hoàn, bảo mật token, sandbox và kiểm tra thay đổi API |
| C19 Chi phí sử dụng máy in | Chưa có giá vật tư/sản lượng và giả định đủ tin cậy | Giá được duyệt, mã mực/trống tương thích, điều kiện năng suất, phạm vi giấy/điện/bảo trì, độ nhạy và cách hiển thị giả định |
| C18 Đại lý/công nợ | Chưa có chính sách duyệt tư cách, giá hay hạn mức | Quy trình duyệt, quyền xem giá, điều kiện tín dụng, hạn mức, nợ quá hạn và kế toán |
| S09 Đa kho/ERP | Nguồn tồn và cơ chế điều phối chưa xác minh | Nguồn sự thật, phân bổ/điều chuyển, quyền tích hợp, đồng bộ lỗi và đối soát |

Thay thế trong MVP: thu nhu cầu và chuyển tư vấn kỹ thuật; hiển thị tài liệu đã duyệt; đơn/báo giá xử lý thủ công có dấu vết. C12 ở V1.1 chỉ hiển thị quan hệ do người duyệt, không được biến thành C17 tự suy luận.

## 9. Dữ liệu đầu vào, câu hỏi và điểm phải chốt

| Mã quyết định | Đề xuất trong PRD | Cần người dùng/doanh nghiệp duyệt | Mốc chặn |
|---|---|---|---|
| D01 | 27 Must trong MVP; Should/Nice tách khỏi MVP | Đã chấp thuận làm đầu vào theo PROMPT 03 | Đã ghi nhận ngày 04/11/2026 |
| D02 | Chỉ ngành hàng/SKU đủ dữ liệu; SIMORCHIP ở RAM/SSD | Danh mục ra mắt, số lượng, quyền nội dung; Q02/Q15 | Trước chuẩn bị dữ liệu thật |
| D03 | Một nguồn tồn dành riêng website; không backorder | Nguồn tồn, phân bổ kênh, người đối soát; Q05 | Trước Giai đoạn 05 |
| D04 | Giữ hàng cùng lúc tạo đơn; hết hạn theo phương thức | Thời hạn COD/chuyển khoản, gia hạn, thông báo, tiền đến muộn; Q05/Q07 | Trước Giai đoạn 05 |
| D05 | VND, giá/thuế rõ, không mã khuyến mãi MVP | Quy tắc thuế/làm tròn/giá và hoàn tiền; Q04/Q07 | Trước Giai đoạn 05 |
| D06 | Một lần giao, COD/chuyển khoản; vùng/phí xác định trước đơn | Địa bàn, ngưỡng COD, phí hàng nặng/lắp đặt; Q06 | Trước Giai đoạn 05 |
| D07 | Quyền xem trạng thái riêng, dữ liệu che; mất quyền liên hệ hỗ trợ | Thời hạn, khôi phục/xác minh, kênh liên hệ; Q13 | Trước Giai đoạn 05 |
| D08 | Báo giá thủ công có phiên bản, một báo giá → một đơn | Hiệu lực/SLA/quyền duyệt, cách ghi chấp thuận; Q10/Q11 | Trước đặc tả B2B chi tiết |
| D09 | Chính sách bảo hành theo SKU/model, lưu bản chốt | Điều kiện, nơi tiếp nhận, đổi trả, nghĩa vụ công bố; Q08/Q13 | Trước xuất bản/bán thật |
| D10 | Chưa tự gửi email/SMS; admin là hàng chờ vận hành | Nhân sự/kênh trả lời, tần suất kiểm tra hàng chờ; Q11 | Trước ra mắt |
| D11 | KPI theo Giai đoạn 01, chỉ báo dữ liệu đo được | Định danh mua lại, mục tiêu, thời hạn lưu; Q12/Q13 | Trước thu dữ liệu thật |
| D12 | Kiểm chứng tải/SEO/free tier/khôi phục trong stack đã chọn | Tải dự kiến, ngân sách dự phòng, RPO/RTO; Q14 | Trước chốt kiến trúc và go-live |

RPO là lượng dữ liệu có thể chấp nhận mất theo thời gian; RTO là thời gian phục hồi mục tiêu. Chưa gán số giả cho hai giá trị này. Các mục D02–D12 có thể còn mở khi duyệt phạm vi, nhưng phải đóng trước mốc chặn tương ứng. Q01 thương hiệu/pháp nhân và các quyền kinh doanh vẫn phải được xác nhận riêng.

## 10. Những việc chưa làm trong MVP

- Nhập CSV/Excel, tự lấy dữ liệu từ XTREND hoặc hãng, thu thập hàng loạt.
- Quan hệ phụ kiện có cấu trúc, cấu hình PC tự động, tính runtime UPS, tính chi phí in tự động.
- Tích hợp sàn, ERP, nhiều kho, mua trước khi có hàng, chia đơn/giao nhiều đợt.
- Cổng thanh toán tự động, webhook ngân hàng, trả góp, công nợ, ký điện tử, xuất hóa đơn điện tử tự động. MVP chỉ thu thông tin và ghi nhận quy trình hóa đơn ngoài hệ thống.
- Tài khoản khách, wishlist, đánh giá sản phẩm, điểm thưởng, giá đại lý tự phục vụ, mã giảm giá/chương trình khuyến mãi.
- Email/SMS giao dịch tự động, chatbot, upload file từ khách, portal bảo hành/tra serial.
- CMS bài viết đầy đủ, cá nhân hóa nội dung, search AI/fuzzy, dashboard phễu hoặc CRM nâng cao.
- Đa ngôn ngữ, đa tiền tệ, tên miền/nhận diện sao chép XTREND.

Không loại khỏi MVP các kiểm soát tối thiểu về tiền/tồn/quyền/bảo vệ khách chỉ để giảm số chức năng.

## 11. Điều kiện hoàn thành và phê duyệt

### Bộ đặc tả Giai đoạn 02

- Có 42 hạng mục backlog với ưu tiên, phiên bản, độ phức tạp và phụ thuộc; 27 hạng mục MVP đều Must Have.
- Mỗi hạng mục có story/AC trong USER_STORIES.md. AC tương lai là điều kiện mở nghiên cứu/nghiệm thu khi được chọn, không là yêu cầu lập trình hiện tại.
- Có phạm vi loại trừ, quyết định còn mở và truy vết sang nghiệp vụ Giai đoạn 01.
- Không có kết quả kiểm thử ứng dụng trong bộ tài liệu này.

### Gate ra mắt MVP sau này

Chỉ ra mắt khi tất cả AC của 27 Must và NFR áp dụng có bằng chứng đạt; dữ liệu ra mắt được duyệt; chính sách/nhân sự và các D đến hạn được chốt; kiểm tra bảo mật và giao dịch trọng yếu không còn lỗi chặn; có phục hồi đã thử. Lỗi còn lại phải được ghi mức ảnh hưởng và người có quyền chấp nhận. Hạn mức miễn phí phải được kiểm chứng trước deploy.

### Ghi nhận phê duyệt phạm vi

- [x] Ghi nhận 27 hạng mục Must và giới hạn mục 3.2 là cơ sở Giai đoạn 03 theo PROMPT 03.
- [x] Giữ các hạng mục ngoài MVP ở kế hoạch V1.1/V1.2 hoặc nghiên cứu; chưa cho phép triển khai.
- [x] Giữ D02–D12 còn mở và mốc phải chốt; không coi phê duyệt PRD là đã cung cấp dữ liệu.

Thay đổi phạm vi sau này cần ghi lý do và cập nhật đồng thời PRD, backlog, story/AC và sitemap liên quan.

Người phê duyệt làm đầu vào thiết kế: người dùng qua PROMPT 03. Ngày ghi nhận: 04/11/2026. Chưa có kết quả nghiệm thu phần mềm.

**Bàn giao:** Giai đoạn 03 đã được người dùng yêu cầu; xem SITEMAP.md. Không tự viết code hoặc chuyển Giai đoạn 04.
