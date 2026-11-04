# USER_STORIES — Câu chuyện người dùng và tiêu chí chấp nhận

Phiên bản 0.1 · 04/11/2026 · Giai đoạn 02 · **Phạm vi MVP được chấp thuận làm đầu vào Giai đoạn 03 theo PROMPT 03; chưa kiểm thử ứng dụng**.

Đọc cùng [PRD.md](PRD.md) và [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md). ID và phiên bản là thống nhất giữa ba tài liệu. AC là điều kiện kiểm tra trong tương lai, **chưa phải kết quả test đã chạy**. Các dữ liệu thử bên dưới phải được gắn nhãn dữ liệu kiểm thử và tách khỏi dữ liệu bán hàng thật.

Mỗi tiêu chí mô tả điều kiện ban đầu, hành động và kết quả quan sát được. Các giá trị thuế/phí/thời hạn theo cấu hình doanh nghiệp đã duyệt, không dùng số liệu tự suy. Tiêu chí tham chiếu quyết định D còn mở chỉ có thể nghiệm thu sau khi quyết định đó được chốt.

## 1. Khách hàng — MVP

### C01 — Khám phá danh mục và thương hiệu

**Story:** Là khách mua, tôi muốn xem sản phẩm theo loại hàng hoặc thương hiệu để bắt đầu từ cách tìm quen thuộc.

- **C01.1:** Khi catalog có sản phẩm nháp, ẩn và công bố, khách chỉ thấy sản phẩm công bố trên trang chủ/danh mục/thương hiệu; nhập URL hoặc chuyển trang không làm lộ bản nháp.
- **C01.2:** Khi chọn thương hiệu và loại hàng, danh sách chỉ gồm sản phẩm đáp ứng cả hai; phân trang không lặp hoặc bỏ sót bản ghi trong tập dữ liệu không thay đổi.
- **C01.3:** Khi nhóm không có sản phẩm công bố, trang giải thích chưa có sản phẩm và cho quay lại/chọn nhóm khác; lỗi tải được thông báo riêng, không giả làm danh mục trống.

### C02 — Tìm kiếm tên, thương hiệu, SKU và model

**Story:** Là khách đã biết hãng hoặc mã thiết bị, tôi muốn tìm nhanh đúng lựa chọn để tránh mua nhầm.

- **C02.1:** Với một SKU/model công bố khớp chính xác và các kết quả khớp một phần, tìm mã đó đặt kết quả chính xác trước; SKU biến thể mở/đánh dấu đúng lựa chọn, không tự chọn biến thể khác.
- **C02.2:** Với tên tiếng Việt và tên hãng đã chuẩn hóa, truy vấn có/không dấu, hoa/thường hoặc khoảng trắng dư trả tập kết quả tương đương; SKU có dấu phân cách không bị tự gộp với mã khác.
- **C02.3:** Khi nhập tên thương hiệu, tìm được sản phẩm của hãng dù tên hãng không nằm trong tên sản phẩm. SKU ẩn/nháp không được tìm thấy; EOL tìm thấy có nhãn và không có hành động mua hợp lệ.
- **C02.4:** Khi truy vấn nhanh A rồi B và phản hồi A về sau, giao diện vẫn hiển thị kết quả B. Không có kết quả giữ từ khóa và cách gỡ lọc; lỗi mạng có thử lại và không thông báo không tìm thấy.

### C03 — Lọc thuộc tính theo loại hàng

**Story:** Là khách cần thông số phù hợp, tôi muốn lọc đúng đặc tính của ngành hàng để thu hẹp lựa chọn.

- **C03.1:** Khi chuyển từ UPS sang RAM, bộ lọc VA/W không còn áp dụng; có thông báo nếu lọc cũ bị bỏ, bộ lọc DDR/dung lượng hiện đúng dữ liệu công bố.
- **C03.2:** Với lựa chọn hai thương hiệu và một mức dung lượng, kết quả đáp ứng (hãng A OR hãng B) AND dung lượng. Khoảng số gồm hai đầu; thiếu dữ liệu không được coi là 0 hoặc Không.
- **C03.3:** Với hai biến thể có cặp thuộc tính khác nhau, bộ lọc không ghép thuộc tính từ hai biến thể để tạo một kết quả không có SKU nào đáp ứng; SKU thỏa điều kiện được xác định rõ.
- **C03.4:** Khi mở lại URL có bộ lọc hợp lệ, trạng thái/kết quả được tái lập; gỡ từng lọc/xóa hết hoạt động. Bộ lọc không còn hợp lệ được bỏ có giải thích, không gây lỗi trang.
- **C03.5:** Khi sắp xếp theo giá, sản phẩm “Yêu cầu báo giá” không bị xem là giá 0; nằm sau nhóm có giá. Mỗi thuộc tính số dùng đơn vị chuẩn và không trộn VA/W hoặc SATA/NVMe.

### C04 — Chi tiết sản phẩm và biến thể

**Story:** Là khách đang cân nhắc, tôi muốn biết đúng SKU, điều kiện bán và bảo hành trước khi chọn mua.

- **C04.1:** Khi đổi biến thể, mã, đơn vị bán, thông số khác nhau, giá, tồn và bảo hành đổi đồng bộ; thêm giỏ gửi đúng SKU đang chọn.
- **C04.2:** Khi SKU không có giá/đủ dữ liệu, cần báo giá, hết hàng, ngừng bán hoặc EOL, hành động mua bị chặn đúng quy tắc và có lý do; không hiển thị “0 đồng” hay hứa ngày về hàng không có nguồn.
- **C04.3:** Chính sách SKU được ưu tiên trước chính sách model đã duyệt; phần kế thừa được xác định rõ. Không có chính sách hợp lệ thì không bán trực tiếp, dù phía client cố gửi yêu cầu.
- **C04.4:** Thông số thiếu hiện “Chưa xác minh”; tài liệu/ảnh đúng model và có quyền sử dụng; không có đánh giá/chứng nhận/khuyến mãi tự tạo.
- **C04.5:** Sau khi giá hoặc chính sách hiện tại thay đổi, chi tiết catalog có giá trị mới nhưng bản chốt trong đơn cũ không đổi.

### C05 — So sánh cơ bản

**Story:** Là khách phân vân giữa vài thiết bị, tôi muốn so sánh thông số cùng loại để tự quyết định.

- **C05.1:** Khách chọn được 2–3 SKU cùng loại và bộ thuộc tính. Chọn thứ tư hoặc khác loại bị từ chối có giải thích; không làm mất lựa chọn đang có.
- **C05.2:** Bảng hiển thị đúng đơn vị, giá/khả năng mua và giá trị theo SKU; phân biệt Không, Không áp dụng và Chưa xác minh; không tự xếp hạng “tốt nhất”.
- **C05.3:** Khi một SKU hết hàng/EOL hoặc bị ẩn sau lúc chọn, trạng thái được cập nhật hoặc cột bị loại có thông báo; không cho mua bản lỗi thời. Trên điện thoại đọc được tên SKU và từng hàng khi cuộn bảng.

### C06 — Giỏ hàng

**Story:** Là khách mua nhiều món, tôi muốn chỉnh giỏ và hiểu tổng dự kiến trước khi đặt.

- **C06.1:** Thêm lại cùng SKU gộp số lượng, biến thể khác là dòng khác; chỉ nhận số nguyên dương theo đơn vị bán; có thể xóa một dòng và thấy trạng thái giỏ trống.
- **C06.2:** Khôi phục giỏ trên cùng trình duyệt chỉ khôi phục SKU/số lượng, không coi giá lưu cũ là giá hiện hành; giỏ không giữ tồn kho.
- **C06.3:** Khi hàng/giá thay đổi, giỏ đánh dấu dòng cần xử lý và server kiểm tra lại trước đặt; không âm thầm đổi SKU, không dùng tổng client làm chuẩn.

### C07 — Đặt hàng không tài khoản

**Story:** Là khách sẵn sàng mua, tôi muốn đặt đơn với thông tin cần thiết mà không bị bắt đăng ký.

- **C07.1:** Với giỏ hợp lệ và thông tin giao hàng bắt buộc, khách tạo đơn không tài khoản; email/marketing không bắt buộc. Lỗi trường cho biết cách sửa và giữ phần nhập phù hợp.
- **C07.2:** Trước xác nhận cuối, khách thấy tiền hàng, thuế/phí và tổng theo cấu hình đã duyệt. Vùng chưa hỗ trợ hoặc chưa tính được phí không tạo đơn tổng tiền tạm bằng 0; hướng khách sang tư vấn.
- **C07.3:** Nếu giá/tồn thay đổi sau khi khách xem tổng, server trả thông tin mới để xác nhận lại hoặc báo thiếu hàng; chỉ tạo đơn/giữ hàng khi toàn bộ điều kiện thỏa.
- **C07.4:** Nhấn hai lần hoặc mất phản hồi rồi gửi lại cùng yêu cầu tạo đúng một mã đơn và một lần giữ hàng. Lỗi giữa giao dịch không để lại đơn không có lượng giữ tương ứng.
- **C07.5:** Màn hình thành công hiện “đã tiếp nhận đơn/chờ xác nhận”, số tiền và bước tiếp theo; không gọi đơn đã thanh toán khi chưa có đối soát.

### C08 — COD và chuyển khoản thủ công

**Story:** Là khách đặt hàng, tôi muốn chọn cách trả tiền và biết giao dịch đang ở bước nào.

- **C08.1:** COD chỉ được chọn khi đơn/vùng/giá trị đủ điều kiện đã duyệt. Gửi giá trị COD trái điều kiện trực tiếp lên backend vẫn bị từ chối.
- **C08.2:** Với chuyển khoản, khách thấy tài khoản doanh nghiệp đã duyệt, số tiền, mã tham chiếu và thời hạn; không có tài khoản cấu hình hợp lệ thì phương thức này không nhận đơn.
- **C08.3:** Khách bấm đã chuyển hoặc gửi thông tin cho nhân viên không tự đổi trạng thái đã nhận tiền. COD giao xong nhưng chưa đối soát vẫn có trạng thái tiền đang chờ riêng.
- **C08.4:** Khi hết hạn giữ hàng, trang thông báo cần liên hệ/xử lý lại; tiền đến muộn không tự phục hồi đơn/hàng đã giải phóng.

### C09 — Gửi yêu cầu báo giá

**Story:** Là người mua doanh nghiệp hoặc khách cần tư vấn, tôi muốn gửi danh sách hàng hay bài toán để nhận báo giá phù hợp.

- **C09.1:** Form chấp nhận danh sách SKU/số lượng hoặc mô tả nhu cầu chưa có model; yêu cầu tên và ít nhất một kênh liên hệ hợp lệ, không bắt tài khoản/mã số thuế.
- **C09.2:** Thiếu dữ liệu bắt buộc được báo đúng trường; số lượng sai không được nhận; chưa cho upload tệp trong MVP.
- **C09.3:** Gửi lại cùng yêu cầu không tạo hồ sơ trùng; phản hồi có mã yêu cầu và bước tiếp theo. Hồ sơ xuất hiện trong hàng chờ quản trị, không tạo đơn/giữ tồn/doanh thu.
- **C09.4:** Chỉ hiển thị thời gian phản hồi nếu doanh nghiệp đã duyệt SLA; thông báo xác nhận tiếp nhận không được tính là phản hồi tư vấn thực chất.

### C10 — Xem trạng thái đơn guest

**Story:** Là khách không có tài khoản, tôi muốn biết đơn đang ở đâu mà thông tin của mình vẫn được bảo vệ.

- **C10.1:** Quyền truy cập riêng còn hiệu lực chỉ xem được trạng thái đơn tương ứng và dữ liệu đã che; thử mã đơn khác hoặc số điện thoại đơn lẻ không đọc được đơn.
- **C10.2:** Quyền hết hạn/thu hồi bị từ chối mà không lộ danh tính, giá trị hay sự tồn tại của đơn khác; có hướng liên hệ xác minh lại, không cho tự khôi phục bằng thông tin dễ đoán.
- **C10.3:** Quyền xem không sửa địa chỉ, hủy đơn hoặc lấy đầy đủ dữ liệu cá nhân. Trình duyệt không đưa token vào analytics hoặc điều hướng ra ngoài; hệ thống log không lưu token truy cập dạng thô.
- **C10.4:** Khi trạng thái giao và tiền khác nhau, giao diện hiển thị riêng, không coi “đã giao” đồng nghĩa “đã thanh toán”.

### C11 — Chính sách, liên hệ và sau bán

**Story:** Là khách cần sự tin cậy, tôi muốn đọc chính sách và biết người tiếp nhận vấn đề trước/sau khi mua.

- **C11.1:** Trước checkout có thể đọc chính sách bán, bảo hành/đổi trả, giao hàng và riêng tư phiên bản đã duyệt; không sao chép cam kết/địa chỉ XTREND vào thương hiệu mới.
- **C11.2:** Kênh liên hệ và giờ phục vụ đúng cấu hình được duyệt; chưa có SLA thì không hứa thời gian. Tư vấn kỹ thuật dẫn tới C09 hoặc kênh hỗ trợ đã xác nhận.
- **C11.3:** Nội dung chính sách chung không ghi đè điều kiện bảo hành riêng của SKU. Thiếu thông tin bắt buộc trước bán phải ngăn xuất bản giao dịch của phạm vi bị ảnh hưởng, không dùng nội dung mẫu làm thật.

## 2. Quản trị — MVP

### A01 — Đăng nhập và phân quyền

**Story:** Là chủ hệ thống, tôi muốn chỉ người được phân công mới thao tác quản trị.

- **A01.1:** Tài khoản khách hoặc tài khoản chưa được cấp quyền không truy cập được admin/API quản trị; tự sửa metadata/profile không nâng được quyền.
- **A01.2:** Chủ hệ thống cấp/thu hồi quyền qua quy trình có kiểm soát; sau thu hồi, yêu cầu được bảo vệ tiếp theo bị từ chối dù tab admin vẫn mở.
- **A01.3:** Ma trận quyền PRD được kiểm tra ở backend/database: quyền kho không sửa giá, sales không xác nhận tiền nếu chưa được cấp thêm quyền; hành động cấp quyền có nhật ký.
- **A01.4:** Đăng xuất/phiên hết hạn chặn thao tác ghi, cho đăng nhập lại không tự gửi lặp thao tác tài chính. Quy trình khôi phục admin không cho bất kỳ người dùng công khai nào tự trở thành chủ hệ thống.

### A02 — Danh mục và thuộc tính

**Story:** Là người quản lý catalog, tôi muốn định nghĩa thông số theo loại hàng để dữ liệu có thể lọc và so sánh đúng.

- **A02.1:** Tạo/sửa danh mục và thương hiệu không tạo chu trình danh mục hoặc mã trùng; không xóa làm mất liên kết sản phẩm/giao dịch đã có.
- **A02.2:** Mỗi thuộc tính có loại dữ liệu, đơn vị nếu có, danh sách giá trị khi cần và phạm vi áp dụng; gán VA cho trường W hoặc text bất kỳ vào số phải bị phát hiện trước duyệt.
- **A02.3:** Thay kiểu/đơn vị thuộc tính đang được sử dụng yêu cầu xử lý dữ liệu liên quan, không âm thầm diễn giải lại số cũ; bộ lọc chỉ dùng giá trị đã duyệt.

### A03 — Sản phẩm, SKU, xuất bản và EOL

**Story:** Là người phụ trách sản phẩm, tôi muốn nhập và duyệt catalog trước khi khách nhìn thấy hoặc mua.

- **A03.1:** Mỗi đơn vị bán có SKU duy nhất, biến thể gắn sản phẩm gốc; nhập mã trùng bị từ chối, model không bị buộc duy nhất như SKU nếu các biến thể hợp lệ dùng chung model.
- **A03.2:** Bản nháp thiếu ảnh/nguồn/quyền nội dung hoặc thông số bắt buộc không được công bố; SKU bán trực tiếp thiếu giá/tồn/chính sách hợp lệ không được bật mua.
- **A03.3:** Chuyển EOL/ngừng bán ghi nguồn, ngày và người thực hiện; khách đang giữ giỏ cũ vẫn bị server chặn đơn mới. Giữ hồ sơ các đơn cũ và thông tin hỗ trợ phù hợp.
- **A03.4:** Hai quản trị sửa cùng bản ghi không âm thầm ghi đè phiên bản mới; người thao tác sau được báo cần tải lại/giải quyết thay đổi. SKU có giao dịch không xóa cứng.

### A04 — Tệp và chính sách bảo hành

**Story:** Là người quản lý nội dung/sau bán, tôi muốn gắn đúng tài liệu và chính sách vào sản phẩm.

- **A04.1:** Ảnh/tài liệu có model/nguồn/quyền sử dụng; file vượt loại/kích thước được cấu hình hoặc chứa nội dung không được phép bị từ chối. Tệp công khai không làm lộ tài liệu riêng của đơn/báo giá.
- **A04.2:** Gán chính sách theo SKU hoặc model có phiên bản, ngày hiệu lực, thời hạn/mốc tính/điều kiện và nơi tiếp nhận. Trùng/xung đột phạm vi hiệu lực phải được giải quyết trước công bố.
- **A04.3:** Cập nhật chính sách tạo phiên bản mới; đơn/báo giá đã chốt vẫn truy được bản cũ. Không tự coi số tháng của cả thương hiệu là chính sách của mọi SKU.
- **A04.4:** Người có quyền sửa trang chính sách/liên hệ, xem trước và xuất bản; khách chỉ thấy bản được duyệt, nội dung HTML không được thực thi mã nguy hiểm.

### A05 — Giá và thuế

**Story:** Là người quản lý kinh doanh, tôi muốn đặt giá hợp lệ và biết ai đã thay đổi.

- **A05.1:** Giá công khai theo SKU/đơn vị bán với tiền tệ và cách tính thuế đã duyệt; giá âm/sai kiểu bị từ chối. Chưa có giá không tự chuyển thành 0.
- **A05.2:** Sửa giá lưu người, thời gian và giá trước/sau; khách đang checkout phải xác nhận lại giá mới nếu chưa tạo đơn. Không sửa đơn cũ hoặc giá báo giá đã gửi.
- **A05.3:** Người không có quyền sửa giá bị backend từ chối. Tổng tiền/thuế/làm tròn của màn hình và server đối chiếu theo cùng quy tắc; MVP không nhận mã giảm giá client tự gửi.

### A06 — Kho và kiểm kê

**Story:** Là nhân viên kho, tôi muốn biết tồn thực, lượng giữ và lượng còn bán để xử lý đơn chính xác.

- **A06.1:** Nhập/điều chỉnh tồn cần lý do và quyền; lịch sử ghi lượng trước/sau, không sửa số tồn bằng thay thông số sản phẩm.
- **A06.2:** Tồn vật lý bán được trừ lượng giữ cho đúng khả dụng. Điều chỉnh giảm xuống dưới lượng đã cam kết phải bị chặn hoặc mở xử lý thiếu hụt có kiểm soát, không âm thầm để đơn thiếu hàng.
- **A06.3:** Xuất kho/giải phóng giữ/nhận lại hàng lặp cùng sự kiện chỉ tác động một lần. Hàng đang trả hoặc chưa kiểm tra không tăng tồn có thể bán.
- **A06.4:** Nếu không có nguồn hàng được phân bổ đáng tin cậy, SKU không bật mua trực tiếp. Đối soát kênh khác chưa tự động; người phụ trách phải xem được lịch sử điều chỉnh.

### A07 — Đơn, giao và sau bán

**Story:** Là nhân viên vận hành, tôi muốn xử lý đơn và yêu cầu sau bán theo trạng thái rõ ràng.

- **A07.1:** Xem/lọc đơn theo thời gian/trạng thái/nguồn B2C/B2B, mở đúng snapshot SKU/giá/chính sách; người không có quyền không đọc dữ liệu riêng.
- **A07.2:** Chỉ chuyển trạng thái hợp lệ theo PRD: đơn hủy không xuất hàng; chuyển khoản chưa đủ tiền không xuất; COD đủ điều kiện có thể xuất trước đối soát. Hoàn tất phải đủ điều kiện giao và tiền.
- **A07.3:** Thay điều kiện đơn đã chốt cần ghi thỏa thuận của khách và cách sửa có kiểm soát; không thay SKU bằng món khác không có sự đồng ý.
- **A07.4:** Yêu cầu sau bán có mã/liên kết đơn, lý do, người xử lý và kết quả; chấp thuận hoàn tiền không tự cộng kho, nhận lại hàng không tự khẳng định đã hoàn tiền.
- **A07.5:** Hủy trước xuất giải phóng giữ một lần; sau xuất đi theo luồng nhận hàng trả/đối soát, không làm tăng tồn ngay khi bấm hủy. MVP không chia giao nhiều đợt.

### A08 — Đối soát và hoàn tiền

**Story:** Là người đối soát, tôi muốn ghi đúng tiền nhận/hoàn để đơn không được coi là trả tiền chỉ dựa vào lời báo.

- **A08.1:** Xác nhận nhận tiền cần quyền, số tiền, thời điểm, tham chiếu/bằng chứng theo quy trình đã duyệt; khách gửi ảnh/lời báo không tự tạo xác nhận này.
- **A08.2:** Tiền thiếu/thừa hoặc đến sau hết hạn được đưa vào hàng cần xử lý; không tự ghi đủ tiền hoặc cấp lại hàng. Thu hộ COD có đối soát riêng với tình trạng giao.
- **A08.3:** Hoàn một phần/toàn bộ không vượt số đã nhận còn có thể hoàn, có lý do và bằng chứng thực hiện ngoài hệ thống; chỉ yêu cầu hoàn chưa được hiển thị đã hoàn.
- **A08.4:** Gửi lại cùng thao tác hoặc cùng giao dịch đã ghi nhận không cộng/trừ tiền hai lần. Sửa sai bằng điều chỉnh có dấu vết, không xóa lịch sử để làm số dư khớp.

### A09 — Xử lý và chuyển đổi báo giá

**Story:** Là sales B2B, tôi muốn theo dõi yêu cầu, gửi báo giá đúng phiên bản và chuyển đơn khi khách chấp thuận.

- **A09.1:** Yêu cầu mới có người phụ trách, trạng thái, ghi chú và thời điểm phản hồi thực chất; spam/trùng được đánh dấu với lý do, không tự xóa lịch sử phục vụ đối soát.
- **A09.2:** Báo giá thiếu dòng hàng/phạm vi, số lượng, giá/thuế/phí, hiệu lực hoặc điều kiện bắt buộc không được đánh dấu đã duyệt/gửi. Bản in chứa đúng phiên bản; việc gửi thủ công được ghi thời gian/kênh.
- **A09.3:** Sửa bản đã gửi tạo phiên bản mới; bản cũ còn tra được và có trạng thái bị thay thế. Khách chấp thuận bản hết hạn/thay thế không được chuyển đơn mà không duyệt lại.
- **A09.4:** Bản hợp lệ có ghi nhận chấp thuận được kiểm tra SKU/tồn/điều kiện rồi tạo một đơn liên kết và giữ hàng. Giá theo báo giá đã duyệt; thao tác lặp trả cùng mã đơn.
- **A09.5:** Không đủ hàng hoặc giao dịch lỗi thì không tạo đơn dở dang/giữ hàng một phần. Yêu cầu/báo giá chưa chuyển đơn không tác động tồn hoặc doanh thu. Nhân viên chưa có quyền giá không được tự duyệt giá báo.

### A10 — Dashboard vận hành

**Story:** Là chủ kinh doanh, tôi muốn biết đơn, tiền hàng thuần và cơ hội báo giá theo cùng một cách tính.

- **A10.1:** Trên bộ dữ liệu thử có đơn thật, đơn thử, spam, hủy, hoàn tất và hoàn tiền, các chỉ số khớp phép đối soát theo định nghĩa Giai đoạn 01; đơn thử/trùng/spam không vào KPI hợp lệ.
- **A10.2:** Chọn khoảng ngày theo Asia/Bangkok và B2C/B2B cho kết quả đúng timestamp sự kiện; một đơn từ báo giá không bị đếm lần nữa như đơn bán lẻ.
- **A10.3:** AOV có mẫu số 0, CR chưa có phiên hoặc mua lại chưa đủ cohort phải hiện “Chưa đủ dữ liệu”/không áp dụng, không hiện số 0% gây hiểu sai. Tiền chờ đối soát và yêu cầu báo giá không hiện như doanh thu đã thu.
- **A10.4:** Chỉ người có quyền xem dashboard tài chính; việc lọc/xuất dữ liệu nếu được bổ sung phải giữ cùng quyền và công thức, không lộ thông tin khách qua báo cáo công khai.

## 3. Hệ thống — MVP

### S01 — Tính nguyên vẹn giao dịch

**Story:** Là người vận hành, tôi muốn tồn, đơn và tiền luôn nhất quán dù có yêu cầu đồng thời hoặc retry.

- **S01.1:** Với một đơn vị tồn khả dụng, hai yêu cầu mua đồng thời chỉ tối đa một yêu cầu tạo đơn/giữ thành công; không có tồn âm, đơn còn lại nhận lỗi có thể xử lý.
- **S01.2:** Giả lập lỗi giữa tạo đơn và giữ hàng không để lại một bên thành công riêng. Với yêu cầu gửi lại hợp lệ, trả cùng kết quả; cùng khóa nhưng nội dung khác phải từ chối.
- **S01.3:** Hết hạn/hủy/xuất/hoàn hàng chạy lại không làm thay đổi tồn hai lần. Giải phóng giữ chỉ giảm lượng giữ; xuất hàng giảm tồn thực và giữ tương ứng; trả đã kiểm tra mới cộng lại tồn bán được.
- **S01.4:** Tác vụ hết hạn chạy chậm hoặc đồng thời với thanh toán/xác nhận vẫn giữ quy tắc nhất quán; tiền đến muộn không tự mở đơn hết hạn khi không còn hàng. Không gia hạn giữ hàng chỉ vì client retry.
- **S01.5:** Sửa giá/tổng/số lượng/status trên client không vượt kiểm tra server; các luồng B2C và chuyển báo giá cùng tuân thủ nguyên tắc giao dịch. Kiểm tra quyền áp dụng cả endpoint nội bộ lẫn thao tác từ giao diện.

### S02 — Bảo mật, riêng tư và chống lạm dụng

**Story:** Là khách và doanh nghiệp, tôi muốn thông tin riêng và thao tác nhạy cảm chỉ đến đúng người có quyền.

- **S02.1:** Bộ thử truy cập trực tiếp/API/database/storage xác nhận khách không đọc đơn người khác, không đọc giá báo riêng/tệp riêng và không sửa quyền; không dựa vào việc ẩn nút giao diện.
- **S02.2:** Bundle frontend/repo công khai không chứa service role key hoặc secrets. Log/analytics không chứa token xem đơn, địa chỉ, email, điện thoại hay nội dung báo giá riêng.
- **S02.3:** Yêu cầu checkout/báo giá hàng loạt vượt quy tắc đã cấu hình bị hạn chế, trả thông báo phù hợp và không tạo loạt đơn/giữ hàng; người dùng hợp lệ có cách thử lại hoặc liên hệ.
- **S02.4:** Nội dung/file đầu vào được kiểm tra, không thực thi mã được chèn. Nhân viên chỉ đọc dữ liệu phục vụ công việc; thao tác quan trọng có audit log và không thể bị xóa qua chức năng quản trị thông thường.
- **S02.5:** Chính sách lưu/xóa/ẩn dữ liệu được thực hiện theo quyết định đã duyệt; yêu cầu xóa không phá nghĩa vụ lưu chứng từ chưa được giải quyết. Không bật tracking riêng tư chưa được duyệt.

### S03 — Trải nghiệm và chất lượng giao diện

**Story:** Là khách dùng điện thoại hoặc bàn phím, tôi muốn hoàn thành tìm/mua/báo giá mà không bị bố cục hoặc lỗi cản trở.

- **S03.1:** Tại 360/768/1280 px, hoàn thành tìm–lọc–so sánh–đặt đơn và gửi báo giá; không có nút bị che hoặc cuộn ngang toàn trang; bảng rộng có cơ chế cuộn hiểu được.
- **S03.2:** Dùng bàn phím tới và kích hoạt mọi điều khiển chính; focus nhìn thấy, nhãn và lỗi gắn đúng trường; trạng thái không chỉ phân biệt bằng màu; phóng to 200% không làm mất thao tác chính.
- **S03.3:** Mỗi màn hình dữ liệu có đang tải/rỗng/lỗi/thành công khác nhau; retry không gửi trùng, form không báo thành công khi server thất bại. Nội dung tiếng Việt giải thích bước tiếp theo.
- **S03.4:** Đo NFR05 trên môi trường/khối lượng được duyệt và lưu kết quả; không tuyên bố đạt nếu chưa đo. Thiết kế typography/spacing/motion được kiểm tra theo chức năng, không tạo chuyển động gây cản trở nhập liệu.

### S04 — SEO nền tảng

**Story:** Là người phụ trách kinh doanh, tôi muốn công cụ tìm kiếm hiểu các trang công khai mà không lập chỉ mục thông tin riêng.

- **S04.1:** Trang sản phẩm/danh mục có URL ổn định, title/description phù hợp và nội dung chính đọc được bằng phương án crawler đã kiểm chứng; đổi slug có xử lý chuyển hướng theo thiết kế, không mất liên kết tùy tiện.
- **S04.2:** Sitemap/canonical chỉ đưa trang công khai phù hợp; các URL lọc trùng có quy tắc, admin/checkout/quyền xem đơn không được đưa vào sitemap hoặc index. Chặn index không thay cho phân quyền truy cập.
- **S04.3:** Metadata/dữ liệu có cấu trúc nếu dùng không công bố giá, tồn, đánh giá hoặc chứng nhận không có thật; sản phẩm chưa giá không khai giá 0. Trang EOL/ẩn được xử lý nhất quán với chính sách nội dung.

### S05 — Vận hành và phục hồi

**Story:** Là người quản lý không chuyên lập trình, tôi muốn có hướng dẫn vận hành và khôi phục khi hệ thống gặp lỗi.

- **S05.1:** Có hướng dẫn tiếng Việt trên Windows cho các thao tác được giao, cấu hình môi trường/secret và đầu mối hỗ trợ; dữ liệu test được tách khỏi dữ liệu thật, không đưa secrets vào source.
- **S05.2:** Trước ra mắt có lịch sao lưu, người chịu trách nhiệm, RPO/RTO đã duyệt và thử khôi phục thành công trong môi trường riêng; khôi phục gồm dữ liệu cần thiết và liên kết tệp, không chỉ có file backup chưa thử.
- **S05.3:** Lỗi hệ thống quan trọng/giữ hàng hết hạn tồn đọng được phát hiện theo cơ chế đã chọn; có hướng xử lý, hạn mức Free tier được kiểm tra và ghi ngày nguồn. Không tự nâng gói trả phí.
- **S05.4:** Quy trình thay đổi/revert không làm mất đơn đã tiếp nhận. Nếu xảy ra sự cố giao dịch, có thể tạm dừng nhận đơn mới và đối soát trước mở lại, không tiếp tục cam kết hàng khi nguồn tồn không đáng tin.

### S06 — Dữ liệu đo lường

**Story:** Là người quyết định sản phẩm, tôi muốn biết chỉ số nào đo được và đối chiếu được với giao dịch thật.

- **S06.1:** Mốc tạo/xác nhận/giao/nhận tiền/hoàn và yêu cầu–báo giá–đơn được ghi với timestamp/ID ổn định; replay không nhân đôi sự kiện nghiệp vụ dùng để tính KPI.
- **S06.2:** Định nghĩa/loại trừ đơn thử, spam, trùng và phân loại B2C/B2B được dùng nhất quán ở dashboard; kiểm tra được nguồn dữ liệu của mỗi chỉ số.
- **S06.3:** Analytics hành vi chỉ bật theo khả năng công cụ đã kiểm chứng và quyết định riêng tư; không gửi PII. Không đo được phiên liên kết thì không hiển thị CR giả; không gộp khách mua lại chỉ bằng tên.
- **S06.4:** AOV/hoàn tiền/cohort theo Giai đoạn 01 có ngày chốt và cách điều chỉnh rõ; cohort chưa đủ 90 ngày không nằm trong mẫu đánh giá mua lại 90 ngày.

## 4. Phiên bản sau — tiêu chí dự kiến, không thuộc MVP

Các mục dưới đây phải được tái xác nhận phạm vi và phụ thuộc trước thực hiện. AC không cho phép tự thêm vào MVP.

### C12 — Tương thích và phụ kiện do người duyệt · Should · V1.1

**Story:** Là khách, tôi muốn biết phụ kiện nào đã được kiểm tra cho thiết bị đang xem.

- **C12.1:** Chỉ hiện quan hệ đã được kỹ thuật duyệt, có model/revision, nguồn và điều kiện; không có dữ liệu thì ẩn mục, không tự sinh gợi ý.
- **C12.2:** Phân biệt “tương thích” với “mua kèm”; quan hệ một chiều không tự thành hai chiều. SKU phụ kiện không công bố không lộ; hết hàng/EOL không thêm được giỏ.
- **C12.3:** Thay revision hoặc rút nguồn xác nhận đưa quan hệ vào kiểm tra lại; không tiếp tục cam kết tương thích vô điều kiện.

### C13 — Bài viết tư vấn · Should · V1.1

**Story:** Là khách, tôi muốn đọc hướng dẫn có căn cứ trước khi chọn sản phẩm.

- **C13.1:** Bài có người soạn/duyệt, ngày cập nhật và nguồn/quyền nội dung; bản nháp không xuất hiện công khai.
- **C13.2:** Liên kết sản phẩm phản ánh trạng thái hiện tại; bài không quảng cáo hàng EOL như đang sẵn bán, không dùng ảnh chưa có quyền.
- **C13.3:** Sửa bài giữ lịch sử; nội dung có cấu trúc tiêu đề và metadata, không chèn mã nguy hiểm.

### C14 — Tài khoản khách · Nice · V1.2

**Story:** Là khách mua lại, tôi muốn xem các đơn thực sự thuộc về mình sau đăng nhập.

- **C14.1:** Đăng ký/khôi phục có xác minh phù hợp; tài khoản A không truy cập lịch sử hoặc địa chỉ tài khoản B.
- **C14.2:** Đơn guest chỉ được ghép khi chứng minh quyền sở hữu qua quy trình đã duyệt; trùng tên/email khai báo chưa xác minh không đủ để ghép.
- **C14.3:** Guest checkout vẫn hoạt động; việc có tài khoản không tự đồng ý marketing, không tạo quyền đại lý hoặc admin.

### C15 — Tìm kiếm nâng cao · Should · V1.2

**Story:** Là khách nhớ chưa chính xác tên thiết bị, tôi muốn nhận gợi ý có ích mà không bị đưa sang model sai.

- **C15.1:** Có bộ truy vấn chuẩn gồm tên đúng, lỗi gõ, mã gần nhau và không có đáp án; đo chất lượng trước/sau theo ngưỡng được duyệt trước xây.
- **C15.2:** Kết quả gần đúng được ghi rõ, không thay vị trí SKU khớp chính xác; không tự sửa model ở hành động mua.
- **C15.3:** Không giảm bảo vệ bản nháp/giá riêng hoặc mục tiêu hiệu năng; truy vấn chứa thông tin riêng không bị đưa vào báo cáo công khai.

### C16 — Runtime UPS · Nice · Chỉ nghiên cứu

**Story:** Là khách đã biết cấu hình tải, tôi muốn một ước lượng có điều kiện thay vì số phút không có căn cứ.

- **C16.1:** Trước phát triển phải có dữ liệu tải/runtime theo model, revision, ắc quy, điều kiện đo và người kỹ thuật duyệt; thiếu một yếu tố quyết định thì chưa mở tính năng.
- **C16.2:** Có miền áp dụng và sai số được duyệt bằng tập kiểm chứng độc lập; đầu vào ngoài miền/không rõ cấu hình trả “Chưa đủ dữ liệu” và hướng tư vấn, không ngoại suy tự động.
- **C16.3:** Kết quả ghi ước lượng, điều kiện và phiên bản dữ liệu; không suy runtime chỉ từ VA/W, không biến ước lượng thành cam kết vận hành.

### C17 — Tương thích tự động · Nice · Chỉ nghiên cứu

**Story:** Là khách chọn nhiều linh kiện, tôi muốn được phát hiện xung đột và biết phần nào chưa đủ dữ liệu.

- **C17.1:** Có bộ quy tắc versioned và nguồn cho các yếu tố liên quan như socket/BIOS, RAM, kích thước, đầu nối; không dùng một tiêu chí đơn để kết luận toàn cấu hình.
- **C17.2:** Bộ kiểm chứng bao gồm hợp, không hợp, thiếu dữ liệu; người kỹ thuật duyệt ngưỡng đánh giá trước triển khai. Thiếu dữ liệu trả trạng thái chưa xác minh, không mặc định hợp.
- **C17.3:** Mỗi kết luận có lý do/điều kiện và revision; quy tắc thay đổi làm kiểm tra lại cấu hình, không tự thêm món vào giỏ.

### C18 — Đại lý và công nợ · Nice · Chỉ nghiên cứu

**Story:** Là đại lý được doanh nghiệp chấp thuận, tôi muốn truy cập điều kiện thương mại đúng hợp đồng.

- **C18.1:** Có bằng chứng phê duyệt tư cách và chính sách; người tự đăng ký đại lý không thấy giá riêng hoặc hạn mức.
- **C18.2:** Giá riêng chỉ đúng khách/hợp đồng/hiệu lực; không xuất hiện trong cache công khai, search hoặc analytics.
- **C18.3:** Công nợ có quyền duyệt, hạn mức/ngày đến hạn và đối soát; vượt hạn mức hoặc quá hạn được xử lý theo chính sách, không đi tắt qua checkout bán lẻ.

### C19 — Chi phí sử dụng máy in · Nice · Chỉ nghiên cứu

**Story:** Là người mua cho văn phòng, tôi muốn so tổng chi phí theo nhu cầu in và giả định rõ ràng.

- **C19.1:** Có giá vật tư, mã tương thích, sản lượng theo điều kiện đo và phạm vi chi phí được duyệt; thiếu dữ liệu không tính số chi phí/trang giả.
- **C19.2:** Khách xem và chỉnh được các giả định cho phép; kết quả nêu khoản đã gồm/chưa gồm và kỳ tính, không so các model theo điều kiện khác mà không giải thích.
- **C19.3:** Kết quả được đối chiếu phép tính độc lập và bộ trường hợp biên; thay giá/giả định cập nhật kết quả, không trở thành báo giá chính thức.

### A11 — Nhập CSV · Should · V1.1

**Story:** Là quản lý catalog, tôi muốn nhập nhiều sản phẩm có kiểm soát thay vì sửa từng mục.

- **A11.1:** File theo mẫu UTF-8 được kiểm tra schema, SKU trùng trong file/trong hệ thống, danh mục, đơn vị, kiểu dữ liệu và quyền nội dung; xem trước lỗi theo dòng trước ghi dữ liệu.
- **A11.2:** Người có quyền chọn rõ tạo mới/cập nhật, khóa đối chiếu và trường được ghi đè; ô trống không tự xóa giá trị cũ hoặc biến thành 0. Lô có lỗi không tự ghi một phần mà không có quyết định rõ.
- **A11.3:** Chỉ lô được xác nhận mới ghi; retry không nhân đôi; có báo cáo kết quả, người nhập và cách khôi phục thay đổi. Nhập catalog không tự công bố hoặc ghi đè tồn đang biến động; điều chỉnh tồn đi qua A06.
- **A11.4:** Văn bản bắt đầu bằng ký tự công thức không được thực thi hoặc xuất sang định dạng bảng tính gây chạy công thức ngoài ý muốn; file quá lớn/sai loại có lỗi rõ và không làm dừng dịch vụ.

### A12 — Nhập Excel · Should · V1.2

**Story:** Là người chuẩn bị dữ liệu, tôi muốn dùng mẫu Excel quen thuộc mà giữ nguyên kiểm soát chất lượng.

- **A12.1:** Chỉ đọc định dạng/sheet/cột được hỗ trợ đã công bố; giữ đúng SKU có số 0 đầu, đơn vị và kiểu số/ngày. File không đúng mẫu được báo lỗi, không đoán cột để ghi.
- **A12.2:** Không chạy macro, công thức hoặc liên kết ngoài; ô công thức ở trường cần giá trị được từ chối hoặc yêu cầu người dùng cung cấp giá trị theo quy tắc rõ.
- **A12.3:** Đi qua cùng bước xem trước/kiểm lỗi/phê duyệt/chống trùng/khôi phục của A11; file nhiều sheet/ẩn/nén quá lớn có xử lý giới hạn, không vượt quyền người nhập.

### A13 — Khuyến mãi · Nice · V1.2

**Story:** Là quản lý kinh doanh, tôi muốn chạy ưu đãi có giới hạn mà không làm sai tổng tiền hoặc lỗ ngoài dự kiến.

- **A13.1:** Có quy tắc hiệu lực, SKU/khách đủ điều kiện, giới hạn sử dụng và cộng dồn được duyệt; chưa đủ quy tắc không kích hoạt.
- **A13.2:** Server tính lại, ngăn lượt dùng vượt giới hạn khi đồng thời; mã hết hạn/sai đối tượng bị từ chối rõ, client không tự đặt số giảm.
- **A13.3:** Hoàn/hủy và giá báo B2B có quy tắc xử lý riêng; lưu bản ưu đãi tại đơn để thay chiến dịch không sửa lịch sử.

### S07 — Email giao dịch · Should · V1.1

**Story:** Là khách và sales, tôi muốn nhận thông báo đúng sự kiện mà việc gửi thư lỗi không làm mất đơn.

- **S07.1:** Nhà cung cấp/quyền gửi/chi phí được duyệt trước bật; nội dung thư dùng đúng trạng thái, không lộ thông tin của khách khác.
- **S07.2:** Thư được đưa vào hàng chờ sau khi giao dịch đã ghi nhận; lỗi gửi được ghi nhận và thử lại có giới hạn, không rollback đơn hoặc tạo đơn mới.
- **S07.3:** Replay sự kiện không chủ động tạo nhiều email cho cùng một lần thông báo; theo dõi gửi lỗi và kênh hỗ trợ thủ công. Không hứa giao thư chính xác một lần nếu nhà cung cấp không bảo đảm.

### S08 — Tích hợp sàn · Nice · Chỉ nghiên cứu

**Story:** Là người vận hành nhiều kênh được phép, tôi muốn đồng bộ và đối soát mà không bán vượt hàng.

- **S08.1:** Mỗi sàn phải có quyền API/tài khoản và điều kiện sử dụng được xác nhận; chưa có quyền thì tính năng không bật, không thay bằng scraping trái phạm vi.
- **S08.2:** Mapping SKU, nguồn tồn và chính sách xung đột được duyệt; webhook trùng/sai thứ tự và lỗi đồng bộ được thử trong sandbox trước dữ liệu thật.
- **S08.3:** Đơn/hủy/hoàn/phí được đối soát; token được bảo vệ và có quy trình thu hồi. Phát hiện lệch tồn phải chặn cam kết sai thay vì tiếp tục bán không kiểm soát.

### S09 — Đa kho/ERP · Nice · Chỉ nghiên cứu

**Story:** Là quản lý kho, tôi muốn biết hàng được phân bổ từ đâu và giải quyết lệch giữa các hệ thống.

- **S09.1:** Có nguồn dữ liệu chuẩn và quyền tích hợp; định nghĩa kho, lượng khả dụng, giữ, điều chuyển và hàng đang đi trước khi triển khai.
- **S09.2:** Lỗi/retry/sự kiện đến sai thứ tự không cộng tồn hai lần; có cơ chế đối soát và xử lý xung đột, không mặc định giá trị đến sau luôn đúng.
- **S09.3:** Việc phân bổ/giao nhiều kho không được tự đưa vào MVP một lần giao; phải cập nhật phạm vi đơn, vận chuyển, phí và AC liên quan trước phát hành.

### S10 — Cổng thanh toán · Nice · V1.2

**Story:** Là khách, tôi muốn trả tiền trực tuyến và nhận trạng thái chính xác kể cả khi đóng trình duyệt.

- **S10.1:** Có tài khoản/hợp đồng, phí và phương án bảo mật được duyệt; môi trường sandbox và dữ liệu thử tách thật.
- **S10.2:** Chỉ xác nhận thanh toán từ kết quả server được xác thực và đối chiếu mã đơn/số tiền/tiền tệ; không tin URL quay về hoặc thông báo từ client.
- **S10.3:** Callback trùng/sai thứ tự/đến muộn, thanh toán thất bại và hoàn tiền được thử; không xác nhận hai lần hoặc tái cấp hàng hết hạn trái quy tắc. Đối soát vận hành vẫn tồn tại.

## 5. Kịch bản liên chức năng bắt buộc trước ra mắt MVP

| Mã | Kịch bản kiểm tra dự kiến | AC liên quan |
|---|---|---|
| E2E01 | Tìm SKU → lọc → chọn biến thể → giỏ → COD → xác nhận → giao → đối soát → dashboard | C02–C08, A06–A08, A10, S01, S06 |
| E2E02 | Chuyển khoản → thiếu tiền/đủ tiền → hết hạn/tiền muộn → xử lý có quyền | C08, C10, A07–A08, S01 |
| E2E03 | Yêu cầu B2B → báo giá v1 → v2 → chấp thuận v2 → chuyển một đơn → đối soát | C09, A09, A07–A08, A10 |
| E2E04 | Hai khách mua tồn cuối; một yêu cầu retry sau mất phản hồi | C07, A06, S01 |
| E2E05 | Giá/EOL/chính sách đổi trong lúc khách đang ở giỏ; đơn cũ giữ nguyên | C04, C06–C07, A03–A05 |
| E2E06 | Khách cố đọc đơn khác; sales cố xác nhận tiền; tài khoản tự nâng quyền | C10, A01, A08, S02 |
| E2E07 | Hủy trước giao; trả sau giao; hoàn một phần; sự kiện hoàn gửi lại | A06–A08, A10, S01, S06 |
| E2E08 | Thực hiện các luồng chính trên mobile/bàn phím; lỗi mạng/lỗi dữ liệu | C01–C11, S03 |
| E2E09 | Khôi phục dữ liệu thử và đối soát đơn–giữ hàng–tiền–tệp sau phục hồi | S05, S01, A06–A09 |

Đây là danh sách kiểm chứng cho các giai đoạn triển khai/kiểm thử sau. Chưa tạo code test, chưa chạy các kịch bản và chưa đánh dấu đạt.
