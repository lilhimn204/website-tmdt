# BUSINESS_ANALYSIS — Phân tích nghiệp vụ Giai đoạn 01

Ngày nghiên cứu: 04/11/2026, múi giờ Asia/Bangkok. Phiên bản: 0.1.

Trạng thái: **Được người dùng phê duyệt làm đầu vào Giai đoạn 02 qua PROMPT 02 ngày 04/11/2026.** Các dữ liệu Chưa xác minh và quyết định doanh nghiệp còn mở vẫn giữ nguyên, không được coi là đã cung cấp/kiểm chứng. Tài liệu ghi kết quả Giai đoạn 01; không có lập trình, cài công cụ, nhập sản phẩm, thiết kế database/API hay triển khai website.

## 1. Phạm vi và cách đọc

Website mới kinh doanh thiết bị công nghệ, phục vụ bán lẻ B2C và tiếp nhận yêu cầu báo giá B2B. Website độc lập về thương hiệu, tên miền, giao diện và dữ liệu so với XTREND. Người phụ trách dự án chưa biết lập trình; các bước triển khai sau này cần hướng dẫn bằng tiếng Việt trên Windows.

### Nhãn dữ liệu

| Nhãn | Ý nghĩa |
|---|---|
| [YC] Yêu cầu đã giao | Nội dung người dùng nêu trong MASTER PROMPT 00/PROMPT 01; không đồng nghĩa năng lực kinh doanh đã được chứng minh |
| [NG] Tìm thấy tại nguồn | Nội dung website tham khảo công bố hoặc bản được công cụ tìm kiếm lập chỉ mục; chỉ chứng minh đã tìm thấy lời công bố |
| [ĐX] Đề xuất của AI | Phân tích, quy trình, chỉ số hoặc hướng tổ chức được đề xuất; chưa là chính sách doanh nghiệp |
| [DN] Doanh nghiệp phải cung cấp | Dữ liệu hoặc quyết định cần người có thẩm quyền cung cấp/phê duyệt |
| [CX] Chưa xác minh | Thiếu bằng chứng, có mâu thuẫn hoặc chưa xác nhận tính hiện hành/khả năng áp dụng cho website mới |

Các phần phân tích khách hàng, journey, quy trình, KPI và tiêu chí dưới đây mặc định là [ĐX], trừ khi có nhãn khác. Không có giá bán, tồn kho hay quyền phân phối nào của website mới được xác lập trong báo cáo này.

### Áp dụng Spec Kit và Impeccable

- **Spec Kit:** phân biệt yêu cầu với giả định; dùng mã nhu cầu/nghiệp vụ để truy vết; ghi câu hỏi còn mở và tiêu chí kiểm tra. Đây là tài liệu đầu vào cho đặc tả/MVP ở Giai đoạn 02, không chạy quy trình implement hoặc tự tạo kiến trúc.
- **Impeccable:** chuyển nhu cầu mua hàng thành nguyên tắc về thông tin dễ hiểu, phân cấp rõ, lọc/so sánh phù hợp và thông báo trạng thái trung thực. Chưa chọn màu, font, layout hay lập DESIGN.md của Giai đoạn 04.
- Chỉ vận dụng phương pháp; chưa cài hoặc thực thi hai bộ công cụ. Tham khảo: [Spec Kit quickstart](https://github.github.io/spec-kit/quickstart.html), [Impeccable — cải thiện thiết kế](https://impeccable.style/docs/improve-design/).

## 2. Phương pháp khảo sát và giới hạn bằng chứng

Đọc chọn lọc trang giới thiệu, danh mục, đối tác, chính sách và một số mẫu sản phẩm. Không crawl toàn bộ website, tải ảnh/tài liệu sản phẩm hàng loạt, tạo tài khoản, gửi biểu mẫu, tra cứu serial hoặc thử đặt đơn.

Một số lần mở trực tiếp trang chủ, giới thiệu và danh mục bị timeout. Báo cáo dùng thêm nội dung đã được công cụ tìm kiếm lập chỉ mục. Ngày nghiên cứu không phải ngày nguồn được cập nhật. Các kết quả có thể phản ánh bản cũ; không lấy số lượng sản phẩm hiển thị làm số SKU còn bán.

Không kiểm thử giao dịch thực tế và không kiểm chứng độc lập hợp đồng phân phối, pháp nhân, tồn kho hoặc thời hạn chính sách. Các tuyên bố của XTREND không chuyển thành quyền hay cam kết của website mới.

### Sổ nguồn khảo sát

| Mã | Nguồn trực tiếp | Phạm vi bằng chứng và cách đọc |
|---|---|---|
| S01 | [Giới thiệu chung](https://xtrend.vn/gioi-thieu-chung/) | Nội dung được lập chỉ mục; mở trực tiếp timeout. Tự giới thiệu hoạt động và khách hàng |
| S02 | [Sản phẩm](https://xtrend.vn/san-pham/) | Đọc được trang/menu; chỉ chứng minh các mục điều hướng hiện diện |
| S03 | [Shop](https://xtrend.vn/shop/) | Bản chỉ mục; các nhóm thương hiệu và ví dụ UPS |
| S04 | [Đối tác cung cấp](https://xtrend.vn/doi-tac-cung-cap/) | Bản chỉ mục; nội dung hỗ trợ đối tác/đại lý |
| S05 | [Đối tác phân phối](https://xtrend.vn/npp/) | Bản chỉ mục; định hướng hợp tác và hỗ trợ bán hàng |
| S06 | [Chính sách bảo hành](https://xtrend.vn/chinh-sach-bao-hanh/) | Đọc được nội dung; nhiều phần theo thương hiệu và một phần chung khó xác định phạm vi |
| S07 | [Kiểm hàng và đổi trả](https://xtrend.vn/chinh-sach-doi-tra-hang/) | Có kết quả mở trang, nội dung chi tiết lấy từ bản chỉ mục sau khi lần mở lại timeout |
| S08 | [Hướng dẫn thanh toán](https://xtrend.vn/huong-dan-thanh-toan/) | Nội dung chi tiết từ bản chỉ mục; chưa kiểm tra giao dịch |
| S09 | [SIMORCHIP](https://xtrend.vn/simorchip/) | Bản chỉ mục có RAM và SSD |
| S10 | [PROLiNK Datacom](https://xtrend.vn/datacom/) | Bản chỉ mục có bộ phát Wi-Fi di động |
| S11 | [TRM](https://xtrend.vn/brand/trm/) | Bản chỉ mục có RAM, SSD SATA và PCIe NVMe |
| S12 | [PANTUM P3300DN](https://xtrend.vn/may-in-don-chac-nang-dao-mat-p3300dn/) | Bản chỉ mục mô tả và bảng thông số có điểm không nhất quán |
| S13 | [PROLiNK PRO1201SFCU](https://xtrend.vn/bo-luu-dien-ups-prolink-pro1201sfcu-1200va/) | Bản chỉ mục; mẫu công suất, dạng sóng và thời gian lưu điện |
| S14 | [Cooler Master](https://xtrend.vn/cooler-master/) | Bản chỉ mục danh mục; mở trực tiếp timeout |
| S15 | [Hyper 212 Spectrum V3](https://xtrend.vn/tan-nhiet-khi-cooler-master-hyper-212-spectrum-v3/) | Bản chỉ mục; mẫu trường socket, kích thước, bảo hành |
| S16 | [Danh sách switch ISON](https://xtrend.vn/shop/page/8/) | Bản chỉ mục một trang kết quả; có Industrial Switch và Industrial PoE Switch |
| S17 | [Danh sách bo mạch chủ](https://xtrend.vn/shop/page/3/) | Bản chỉ mục một trang kết quả; có BIOSTAR |
| S18 | [Danh sách nguồn máy tính](https://xtrend.vn/shop/page/10/) | Bản chỉ mục một trang kết quả; có Antec và Cooler Master |
| S19 | [Máy in đơn năng](https://xtrend.vn/may-in-don-nang-pantum/) / [đa năng](https://xtrend.vn/may-in-da-nang-pantum/) | Bản chỉ mục nhóm sản phẩm |
| S20 | [Trang chủ](https://xtrend.vn/) | Bản chỉ mục có tiêu đề tin về ADVANTECH; mở trực tiếp timeout |

Các nguồn này được tham chiếu trong cả tài liệu này và PRODUCT_CATALOG_PLAN.md. Không sao chép nội dung quảng cáo hoặc dữ liệu thành catalog bán hàng.

## 3. Kết quả về doanh nghiệp và nghiệp vụ tham khảo

### 3.1. Doanh nghiệp

[NG] XTREND tự giới thiệu hoạt động phân phối/hỗ trợ dự án CNTT từ năm 2016, đổi tên năm 2020 và phát triển song song mảng dự án với phân phối. Trang giới thiệu nhắc tới khách hàng SME, cơ quan, ngân hàng và doanh nghiệp viễn thông. Đây là tự công bố, không phải xác nhận độc lập về khách hàng hoặc hợp đồng hiện tại. [S01 — Giới thiệu](https://xtrend.vn/gioi-thieu-chung/)

[NG] Các trang đối tác nêu hỗ trợ tư vấn, đào tạo sản phẩm, nội dung bán hàng và chính sách thương mại cho đại lý. [S04 — Đối tác cung cấp](https://xtrend.vn/doi-tac-cung-cap/), [S05 — Đối tác phân phối](https://xtrend.vn/npp/)

[ĐX] Website mới nên xử lý hai kiểu mua: khách tự chọn sản phẩm đủ thông tin và khách cần tư vấn cấu hình/báo giá. [CX] Chưa biết website mới có đội tư vấn, kho, dịch vụ lắp đặt hoặc quyền phục vụ đại lý nào.

### 3.2. Danh mục và thương hiệu

[NG] Các mục đọc được bao gồm PROLiNK, CyberPower, Pantum, TRM, Dynabook, BIOSTAR, Cooler Master, Antec; danh sách shop còn có ASUS, SIMORCHIP và ISON. ADVANTECH xuất hiện dưới dạng liên kết hãng và tiêu đề tin. [S02 — Menu](https://xtrend.vn/san-pham/), [S03 — Shop](https://xtrend.vn/shop/), [S20 — Trang chủ](https://xtrend.vn/)

[ĐX] Tổ chức website mới theo **loại sản phẩm trước, thương hiệu là chiều lọc**, tránh trộn tên hãng với loại hàng. Phân nhóm dự kiến, bộ thuộc tính và điều kiện xuất bản nằm trong [PRODUCT_CATALOG_PLAN.md](PRODUCT_CATALOG_PLAN.md).

### 3.3. Bảo hành

[NG] Trang bảo hành ghi UPS PROLiNK thuộc phạm vi XTREND phân phối, có mốc áp dụng 01/07/2023; bảng nêu 24 tháng cho một số dòng một pha và 12 tháng cho ba pha/phụ kiện. SSD Dynabook có thời hạn khác nhau theo dòng AE100 và AX3600/AX7600. Cùng trang có đoạn chính sách chung 12 tháng chưa rõ phạm vi. Không thể lấy một giá trị dùng chung. [S06 — Chính sách bảo hành](https://xtrend.vn/chinh-sach-bao-hanh/)

[DN/CX] Website mới cần văn bản xác nhận riêng: đơn vị chịu trách nhiệm, SKU được áp dụng, thời hạn, ngày bắt đầu tính, điều kiện loại trừ, chi phí vận chuyển, nơi tiếp nhận và thời gian dự kiến xử lý. Không kế thừa địa chỉ, hotline, điều kiện đổi mới hay cam kết của nguồn.

### 3.4. Bán hàng, thanh toán và sau bán

[NG] Hướng dẫn nguồn có nhận hàng rồi thanh toán và chuyển khoản trả trước. Trang đổi trả đề cập đồng kiểm ngoại quan, điều kiện đổi trả và phân trách nhiệm chi phí theo nguyên nhân. Chưa kiểm chứng quy trình đang vận hành. [S08 — Thanh toán](https://xtrend.vn/huong-dan-thanh-toan/), [S07 — Đổi trả](https://xtrend.vn/chinh-sach-doi-tra-hang/)

[YC] Website mới dự kiến COD và chuyển khoản xác nhận thủ công. [DN] Doanh nghiệp phải duyệt tài khoản nhận tiền, phạm vi COD, phí giao hàng, xuất hóa đơn, đổi trả và hoàn tiền; không dùng thông tin thanh toán của website tham khảo.

### 3.5. Những điểm dữ liệu cần xử lý trước khi sử dụng

| Mã | Bằng chứng/điểm chưa rõ | Xử lý đề xuất |
|---|---|---|
| DQ01 | [NG] SIMORCHIP được xếp RAM/SSD tại S09, khác vị trí trong nhóm mạng của MASTER PROMPT | Đề xuất đưa vào linh kiện; doanh nghiệp duyệt mapping |
| DQ02 | [NG] PRO1201SFCU có mô tả dùng cả từ Offline và Line Interactive; bảng ghi Line Interactive tại S13 | Không coi đây là bằng chứng cho nhóm UPS Offline riêng; đối chiếu datasheet đúng phiên bản |
| DQ03 | [NG] P3300DN có mô tả 20.000 trang/tháng, bảng lại ghi tối đa 60.000 và khuyến nghị 750–3.500 tại S12 | Gắn Chưa xác minh cho số liệu chu kỳ in; không tự chọn một giá trị để bán hàng |
| DQ04 | [NG] Các nhóm chính sách riêng và chung cùng tồn tại tại S06 | Cần người phụ trách bảo hành xác định thứ tự áp dụng theo SKU/ngày bán |
| DQ05 | [NG] Menu ADVANTECH dẫn ra website hãng tại S02 | Không đủ chứng minh có SKU sẵn bán; giữ nhóm chờ xác nhận |
| DQ06 | [CX] ASUS có tên nhóm ở S03 nhưng chưa xác minh loại sản phẩm trong mẫu nghiên cứu | Không tự đưa ASUS vào mainboard, GPU hay thiết bị mạng |

Chi tiết nguồn kỹ thuật và giới hạn sử dụng nằm ở mục 3 của PRODUCT_CATALOG_PLAN.md.

## 4. Nhóm khách hàng và nhu cầu mua

Đây là giả thuyết phân khúc để xác minh bằng phỏng vấn và dữ liệu bán hàng. Không phải kết quả khảo sát khách hàng thực tế.

| Mã | Nhóm | Người sử dụng/quyết định | Nhu cầu chính | Rào cản và thông tin cần |
|---|---|---|---|---|
| KH01 | Cá nhân | Thường cùng một người | Nâng cấp PC, bảo vệ thiết bị, mua đúng món trong ngân sách | Không biết tương thích; cần giải thích thông số, tổng chi phí, bảo hành, giao hàng |
| KH02 | Văn phòng/hộ kinh doanh | Nhân viên đề xuất, chủ/quản lý duyệt | In ổn định, chống gián đoạn, thay thế nhanh | Cần máy theo sản lượng, mực dễ mua, hướng dẫn sử dụng, hóa đơn nếu cần |
| KH03 | Doanh nghiệp/IT/mua hàng | IT xác định kỹ thuật; mua hàng so giá; quản lý duyệt; kế toán thanh toán | Chuẩn hóa cấu hình, mua số lượng, đúng thời hạn dự án | Cần báo giá có phiên bản, tài liệu, thời hạn hiệu lực, giao nhận/nghiệm thu |
| KH04 | Đại lý/đơn vị tích hợp | Chủ đại lý, sales dự án, kỹ thuật | Nguồn hàng ổn định, thông tin chính xác, hỗ trợ trước và sau bán | Cần duyệt tư cách đại lý, mức giá riêng và phạm vi hỗ trợ; chỉ phục vụ khi được phép |

Khách là doanh nghiệp vẫn có thể mua qua checkout nếu sản phẩm và điều kiện phù hợp. Khách cá nhân cũng có thể yêu cầu tư vấn; không bắt buộc đăng ký doanh nghiệp để hỏi kỹ thuật. Ngưỡng chuyển sang báo giá dựa vào sản phẩm/số lượng/độ phức tạp, chưa tự đặt con số.

### Ma trận nhu cầu theo ngành hàng

| Mã | Nhóm | Thông tin cần hỏi khách | Hỗ trợ quyết định và giới hạn |
|---|---|---|---|
| NC01 | UPS | Thiết bị cần cấp điện; tổng tải và đặc tính tải; thời gian duy trì; điện một/ba pha; vị trí lắp; mục tiêu lưu dữ liệu hay vận hành liên tục | Hiển thị cả VA và W; yêu cầu đường cong runtime/điều kiện đo. Không suy runtime chỉ từ VA, không hứa số phút khi thiếu dữ liệu; cấu hình phức tạp chuyển kỹ thuật |
| NC02 | Máy in | Trang/tháng và thời điểm cao tải; đơn/đa năng; đảo mặt; ADF; mạng; hệ điều hành; nhu cầu mực | So sánh mức in khuyến nghị với nhu cầu; tách khỏi công suất tối đa. Chi phí/trang chỉ tính khi có giá vật tư và sản lượng cùng điều kiện đo; ghi rõ chưa gồm giấy/điện/bảo trì nếu loại trừ |
| NC03 | RAM/SSD | Model máy/mainboard; cấu hình hiện tại; khe trống; nhu cầu dung lượng và ứng dụng | Xác minh chuẩn RAM, dạng thanh, dung lượng hỗ trợ; SSD phải rõ form factor và giao tiếp. Không xác nhận tương thích chỉ dựa vào dung lượng hoặc hình dáng |
| NC04 | Case/PSU/tản nhiệt | Mainboard, CPU, GPU, ổ đĩa, case hiện hữu; không gian; mức tải; tiếng ồn mong muốn | Đối chiếu kích thước lắp, socket, đầu cắm, giới hạn GPU/tản/radiator. Gợi ý mua kèm phải có cơ sở tương thích |
| NC05 | Mạng/công nghiệp | Số thiết bị và cổng; uplink; PoE; quản lý; môi trường; nguồn cấp; phương án lắp | Xác minh tốc độ từng loại cổng và tổng ngân sách PoE; thông số môi trường từ tài liệu. Cấu hình dự án cần kỹ thuật duyệt trước báo giá |

Các dòng trên là yêu cầu thu thập/đối chiếu, không phải tư vấn chọn model hoặc cam kết an toàn cho một hệ thống cụ thể.

## 5. Customer journey B2C

| Bước | Khách làm gì | Website/vận hành cần đáp ứng | Điểm dễ mất khách | Dữ liệu kiểm tra |
|---|---|---|---|---|
| 1. Phát sinh nhu cầu | Tìm model hoặc giải pháp | Nội dung theo nhu cầu, thông tin có nguồn | Bài viết quảng cáo chung chung | Nguồn truy cập, trang đích |
| 2. Tìm và lọc | Tìm tên/SKU/model, lọc danh mục | Kết quả đúng nhóm, đơn vị nhất quán, gỡ lọc dễ | Không có kết quả hoặc lọc sai | Tìm kiếm không kết quả |
| 3. Đánh giá | So sánh và hỏi tương thích | Thông số rõ; thiếu dữ liệu ghi Chưa xác minh; tư vấn khi cần | Không biết mua có dùng được không | Xem chi tiết, yêu cầu tư vấn |
| 4. Quyết định | Chọn SKU và số lượng | Giá/thuế/phí/chính sách rõ theo dữ liệu đã duyệt | Phí phát sinh muộn, trạng thái hàng mơ hồ | Thêm giỏ, rời giỏ |
| 5. Đặt hàng | Nhập liên hệ/địa chỉ, chọn thanh toán | Guest checkout; kiểm tra giá và hàng tại server; chống gửi trùng | Form dài hoặc mất nội dung khi lỗi | Bắt đầu checkout, đơn được server ghi nhận |
| 6. Xác nhận và giao | Chờ xác nhận, nhận hàng | Nhân viên xác nhận khả năng giao; theo dõi trạng thái phù hợp | Nhầm đã đặt với đã thanh toán | Đơn xác nhận, giao thành công, hủy |
| 7. Sau bán | Hỏi sử dụng, bảo hành, mua thêm | Đầu mối hỗ trợ, hướng dẫn đúng SKU, bảo vệ dữ liệu đơn | Không rõ ai chịu trách nhiệm | Yêu cầu hỗ trợ, đơn hoàn tất, mua lại |

### Quy trình bán lẻ đề xuất

1. Khách chọn SKU đủ điều kiện bán trực tiếp. Thiếu giá hoặc cấu hình chưa xác minh thì chuyển tư vấn/báo giá, không đặt giá bằng 0.
2. Checkout thu thông tin tối thiểu phục vụ giao dịch; cho xem tổng tiền và điều kiện trước khi gửi.
3. Hệ thống kiểm tra SKU, giá, số lượng có thể bán và điều kiện vận chuyển; lưu đơn một lần dù khách gửi lại do mạng lỗi.
4. Đơn mới ở trạng thái chờ xác nhận. Quy tắc giữ hàng và thời hạn giữ hàng là quyết định Q05 chưa chốt; dù chọn cách nào, không được bán vượt lượng có thể cấp.
5. Nhân viên kiểm tra thông tin và khả năng giao; thay đổi giá/SKU/thời gian giao cần khách đồng ý, không âm thầm đổi đơn.
6. COD: theo dõi giao và đối soát tiền thu hộ. Chuyển khoản: người được phân quyền xác nhận tiền thực nhận; ảnh biên lai của khách chỉ là thông tin hỗ trợ.
7. Kho giao đúng SKU/số lượng; lưu chứng từ và serial nếu chính sách sản phẩm yêu cầu.
8. Ghi nhận giao hàng, thanh toán và hoàn tất theo các trạng thái riêng. Hủy/hoàn trả/hoàn tiền phải có lý do và lịch sử.

**Tách ba trạng thái:** đơn hàng (chờ xác nhận/đã xác nhận/đã hủy/hoàn tất); giao nhận (chưa giao/đang giao/đã giao/giao thất bại/đã trả); tiền (chưa nhận/chờ đối soát/đã nhận/hoàn một phần/hoàn toàn bộ). Đơn được gửi thành công không đồng nghĩa đã nhận tiền.

### Ngoại lệ phải xử lý

- Hai khách mua món cuối cùng: chỉ lượng hàng hợp lệ được cam kết; khách còn lại nhận lựa chọn rõ ràng.
- Giá hoặc hàng thay đổi trong giỏ: thông báo và yêu cầu xác nhận lại, không nhận tổng tiền từ trình duyệt làm chuẩn.
- Chuyển khoản sai/thiếu/thừa/nội dung không khớp: vào hàng chờ đối soát; nhân viên liên hệ, chưa tự đánh dấu đủ tiền.
- Hủy sau thanh toán: tách quyết định hoàn tiền khỏi thao tác hủy; hoàn tồn chỉ khi hàng đủ điều kiện quay lại bán.
- COD thất bại/khách từ chối: đối soát kiện hàng và phí; không coi hàng đang hoàn về là tồn có thể bán ngay.
- Giao sai/hư hỏng: tiếp nhận bằng chứng cần thiết, xác định trách nhiệm và phương án theo chính sách đã duyệt.
- Khách không có tài khoản: tra cứu đơn bằng cơ chế xác minh phù hợp; mã đơn đơn thuần không đủ để xem dữ liệu cá nhân.

## 6. Customer journey và quy trình B2B

| Bước | Vai trò phía khách | Nhu cầu | Website/đội bán hàng |
|---|---|---|---|
| 1. Xác định bài toán | IT/người sử dụng | Tải UPS, số máy, cấu hình hoặc hệ thống mạng | Nội dung/tài liệu giúp mô tả nhu cầu; không bắt khách biết model |
| 2. Tạo yêu cầu | Mua hàng/IT | Gửi danh sách SKU/số lượng hoặc bài toán | Form liên hệ và nhu cầu; mã yêu cầu riêng, thông báo đã tiếp nhận |
| 3. Làm rõ | Sales + kỹ thuật + khách | Tương thích, số lượng, nơi giao, hạn cần hàng | Ghi trao đổi, người phụ trách; không hứa SLA chưa có nhân lực |
| 4. Báo giá | Mua hàng/người duyệt | Giá, thuế, vận chuyển, bảo hành, tiến độ | Báo giá có phiên bản, hạn hiệu lực, điều kiện và phạm vi |
| 5. Thương lượng | Người có quyền duyệt | Đổi cấu hình, ngân sách, tiến độ | Lưu phiên bản; báo giá cũ được đánh dấu thay thế/hết hạn |
| 6. Chấp thuận | Người mua được ủy quyền | Chốt điều kiện mua | Kiểm tra lại hàng/giá; tạo đơn tham chiếu đúng báo giá |
| 7. Thực hiện | Kho, mua hàng, kế toán | Giao/nhận/nghiệm thu/đối soát | Theo dõi thực hiện đơn và tiền; giao nhiều đợt chỉ khi được duyệt |
| 8. Sau bán | IT, mua hàng | Bảo hành, mở rộng, mua lặp lại | Lưu cấu hình được phép lưu, hỗ trợ đúng thiết bị và điều kiện |

### Hồ sơ yêu cầu báo giá đề xuất

- Bắt buộc tối thiểu: tên người liên hệ, ít nhất một kênh liên lạc hợp lệ, nhu cầu hoặc danh sách hàng/số lượng.
- Tùy nhu cầu: tên doanh nghiệp, tỉnh/thành giao hàng, thời điểm cần, cấu hình đang dùng, yêu cầu hóa đơn, ngân sách tham khảo. Không bắt khai mã số thuế chỉ để hỏi giá; lấy khi cần lập hồ sơ giao dịch.
- Tệp đính kèm: chỉ xem xét khi doanh nghiệp cần và có cách quản lý an toàn; không mặc định bắt buộc.
- Nội bộ: chủ sở hữu yêu cầu, mức độ đầy đủ, nguồn khách, bước tiếp theo, thời điểm hẹn trả lời và lý do mất cơ hội.
- Báo giá: mã/phiên bản, SKU hoặc phạm vi giải pháp, số lượng, đơn giá, thuế và phí, tổng tiền, hiệu lực, điều kiện thanh toán/giao hàng/bảo hành, người duyệt.

Luồng yêu cầu: **Mới nhận → Đang làm rõ → Đủ thông tin → Đã gửi báo giá → Thương lượng → Được chấp thuận / Không thành công / Hết hạn.** Khi chấp thuận, chỉ đánh dấu chuyển thành đơn sau khi kiểm tra lại điều kiện và tạo đơn thực tế. Yêu cầu báo giá không giữ hàng, không phải đơn hàng và không phải doanh thu theo đề xuất ban đầu; ngoại lệ cần doanh nghiệp duyệt.

Khách đại lý dùng quy trình báo giá này ở bước đầu. Không tự cấp giá đại lý, công nợ hoặc quyền xem giá riêng chỉ vì khách tự chọn nhãn “đại lý”. Không tự động gửi thông tin cho hãng/đối tác.

## 7. Danh sách nghiệp vụ và tiêu chí kiểm tra ở mức phân tích

Mức “bắt buộc trước bán” thể hiện ràng buộc an toàn/nghiệp vụ; chưa thay cho quyết định phạm vi MVP ở Giai đoạn 02.

| Mã | Nghiệp vụ | Nhu cầu liên quan | Điều kiện cần đạt khi triển khai | Ưu tiên đề xuất |
|---|---|---|---|---|
| NV01 | Duyệt sản phẩm, quyền nội dung | NC01–05 | Có SKU, nguồn và người duyệt; chưa duyệt không lên bán | Bắt buộc trước bán |
| NV02 | Danh mục, thuộc tính, tìm kiếm | NC01–05 | Tìm theo model/SKU; bộ lọc phù hợp nhóm; không trộn đơn vị | Cốt lõi |
| NV03 | Tư vấn và so sánh | NC01–05 | So các sản phẩm cùng nhóm; thiếu dữ liệu không biến thành Không/0 | Cốt lõi; độ tự động chốt sau |
| NV04 | Giá, thuế và khuyến mãi | KH01–04 | Tổng tiền rõ; thay đổi có người chịu trách nhiệm; không tin giá client | Bắt buộc trước bán |
| NV05 | Tồn kho và giữ hàng | KH01–04 | Không bán vượt tồn; hủy/hoàn không làm cộng hàng trùng | Bắt buộc trước bán |
| NV06 | Guest checkout | KH01–03 | Không bắt tài khoản; gửi lặp không tạo đơn trùng | Cốt lõi |
| NV07 | Xác nhận đơn và giao hàng | KH01–03 | Có trạng thái/lý do và lịch sử; thay thế SKU cần khách đồng ý | Cốt lõi |
| NV08 | COD/chuyển khoản/hoàn tiền | KH01–04 | Người có quyền đối soát; không coi biên lai hoặc trang cảm ơn là đã trả tiền | Bắt buộc trước bán |
| NV09 | Báo giá doanh nghiệp | KH03–04 | Yêu cầu có mã riêng; báo giá có phiên bản và hạn hiệu lực | Cốt lõi |
| NV10 | Chuyển báo giá thành đơn | KH03–04 | Kiểm tra lại hàng/giá; liên kết yêu cầu–báo giá–đơn; không tính trùng KPI | Cốt lõi |
| NV11 | Bảo hành/đổi trả | KH01–04 | Chính sách đúng SKU và ngày bán; hồ sơ có đầu mối xử lý | Bắt buộc trước bán |
| NV12 | Phân quyền và bảo vệ dữ liệu | KH01–04 | Khách không xem đơn người khác; admin không tự cấp quyền; thao tác nhạy cảm được ghi nhận | Bắt buộc trước bán |
| NV13 | Nội dung và tài liệu kỹ thuật | NC01–05 | Có quyền sử dụng và phiên bản; không dùng nội dung tham khảo chưa duyệt | Cốt lõi |
| NV14 | Sản phẩm ngừng bán/EOL | NC01–05 | Không tự kết luận từ nhãn trống; giữ hỗ trợ đơn cũ; gợi ý thay thế được duyệt | Cốt lõi |
| NV15 | Nhập danh mục từ bảng tính | NV01–05 | Kiểm tra SKU trùng, kiểu dữ liệu và quyền nội dung trước nhập | Định hướng mở rộng |
| NV16 | Đại lý, giá hợp đồng, công nợ | KH04 | Có xác minh tư cách và chính sách được phê duyệt | Chờ quyết định |
| NV17 | KPI và đối soát báo cáo | Tất cả | Phân biệt đơn gửi/hoàn tất/báo giá; loại đơn thử và trùng | Cốt lõi |

Vai trò vận hành cần phân công: người duyệt kinh doanh, người quản lý catalog, tư vấn kỹ thuật, sales B2B, kho/giao nhận, kế toán đối soát, hỗ trợ sau bán, người quản trị hệ thống. Một người có thể kiêm nhiệm nhưng quyền xác nhận tiền/giá/hoàn tiền phải rõ.

## 8. Lợi thế có thể xây dựng so với sàn TMĐT

Đây là giả thuyết chiến lược, không phải kết luận rằng mọi sàn thiếu các tính năng này hoặc website mới chắc chắn rẻ hơn.

| Lợi thế đề xuất | Cách thực hiện | Điều kiện doanh nghiệp | Dấu hiệu kiểm chứng |
|---|---|---|---|
| Chọn đúng kỹ thuật | Bộ lọc riêng, bảng so sánh, giải thích tương thích | Dữ liệu chuẩn và nhân sự tư vấn | Giảm yêu cầu đổi do sai cấu hình |
| Tư vấn bài toán | UPS theo tải/runtime; mạng theo triển khai | Kỹ thuật đủ năng lực và tài liệu | Tỷ lệ yêu cầu đủ thông tin, chuyển đổi báo giá |
| Minh bạch sau bán | Chính sách theo SKU, đầu mối và quy trình rõ | Chính sách có khả năng thực hiện | Khiếu nại, thời gian xử lý, mua lại |
| Hỗ trợ mua B2B | Báo giá có phiên bản, hóa đơn, phối hợp giao | Sales/kế toán/kho phối hợp | Tỷ lệ báo giá thành đơn và thời gian phản hồi |
| Nội dung chuyên môn | Hướng dẫn chọn, lắp và sử dụng đúng phiên bản | Chuyên viên duyệt và quyền nội dung | Organic traffic phù hợp, hành động tư vấn/mua |
| Quan hệ khách hàng | Hỗ trợ đơn cũ, gợi ý vật tư/tương thích có căn cứ | Có cơ sở liên hệ và lựa chọn của khách | Tỷ lệ mua lại và hài lòng |

Đổi lại, website mới phải tự tạo nguồn khách, xây niềm tin và vận hành giao dịch. Không mặc định tiết kiệm phí sàn sẽ làm giá thấp hơn: vẫn có chi phí marketing, vận chuyển, hoàn hàng, hỗ trợ và hệ thống. Chưa giả định bất kỳ tích hợp Shopee/Lazada/TikTok Shop nào.

## 9. KPI và quy ước đo lường đề xuất

### Quy ước chung

- Báo cáo theo Asia/Bangkok; ngày/tuần/tháng phải thống nhất. Giá trị tiền dự kiến VND, chờ doanh nghiệp xác nhận cách hiển thị thuế.
- Baseline và mục tiêu số của mọi KPI: **Chưa xác minh**. Thu dữ liệu một chu kỳ vận hành đủ đại diện rồi đặt mục tiêu; không tự đưa benchmark thành cam kết.
- Đơn hợp lệ là đơn thật được server tiếp nhận, loại đơn thử, spam và trùng. Đơn hoàn tất dùng trạng thái giao thành công, đã đối soát đủ tiền và đã đóng nghiệp vụ; hoàn trả sau đó phải điều chỉnh báo cáo.
- Doanh thu KPI là giá trị hàng sau giảm giá, trừ phần hàng hoàn; không gồm phí vận chuyển và thuế theo quy ước đề xuất. Đây là số đo vận hành, không thay báo cáo kế toán.
- Tách đơn B2C, đơn B2B từ báo giá và nguồn chưa phân loại. Một đơn chỉ được ghi nhận một lần.

| KPI | Công thức/định nghĩa | Nguồn dữ liệu dự kiến | Nhịp và người phụ trách |
|---|---|---|---|
| Traffic | Số phiên truy cập hợp lệ trong kỳ; theo kênh, thiết bị, trang đích; tách pageview nếu công cụ chỉ có pageview | Công cụ analytics được chọn và kiểm chứng | Tuần/tháng, marketing |
| CR đặt hàng B2C | Số phiên có ít nhất một đơn B2C hợp lệ / số phiên thuộc phạm vi cửa hàng đo được × 100% | Analytics nối được sự kiện server; chống đếm lại | Tuần/tháng, sản phẩm + marketing |
| AOV hoàn tất | Tổng giá trị hàng thuần của tập đơn hoàn tất trong kỳ / số đơn trong cùng tập | Đơn, chi tiết hàng và điều chỉnh hoàn tiền | Tháng, kinh doanh + kế toán |
| Tỷ lệ mua lại 90 ngày | Số khách có đơn hoàn tất thứ hai trong 90 ngày sau đơn đầu / số khách trong cohort có đủ 90 ngày quan sát × 100% | Khách được định danh hợp lệ và lịch sử đơn | Tháng, kinh doanh |
| Số đơn hàng | Đếm mã đơn hợp lệ được tạo trong kỳ; báo riêng số xác nhận, hoàn tất, hủy, hoàn trả | Sổ đơn hàng; mỗi chỉ số theo timestamp sự kiện tương ứng | Ngày/tuần, vận hành |
| Số yêu cầu báo giá | Đếm mã yêu cầu mới không trùng/spam trong kỳ; tách tổng nhận và đủ điều kiện xử lý | Sổ yêu cầu báo giá | Ngày/tuần, sales B2B |
| CR yêu cầu báo giá | Phiên tạo ít nhất một yêu cầu hợp lệ / phiên trong phạm vi trang B2B đo được × 100% | Analytics và yêu cầu được server ghi nhận | Tháng, marketing + B2B |
| Tỷ lệ báo giá thành đơn | Yêu cầu đủ điều kiện trong cohort có ít nhất một đơn được xác nhận / tổng yêu cầu đủ điều kiện cohort | Liên kết yêu cầu–báo giá–đơn; nêu thời gian quan sát | Tháng, B2B |
| Thời gian phản hồi B2B | Trung vị và P90 thời gian từ nhận yêu cầu đến phản hồi thực chất đầu tiên; tách giờ làm việc | Lịch sử yêu cầu và lịch làm việc | Tuần, B2B |

Không dùng email tự động xác nhận tiếp nhận làm “phản hồi thực chất”. Không gọi số đơn chia phiên là cùng một CR với số phiên có đơn nếu một phiên tạo nhiều đơn. Nếu không nối được phiên và đơn một cách phù hợp, ghi CR chưa đo được và báo riêng hai chỉ số.

### Nhận diện khách mua lại và độ đầy đủ

Guest checkout vẫn cần cách đối chiếu khách đã được xác minh, theo quyền sử dụng dữ liệu. Không ghép khách chỉ bằng tên hoặc địa chỉ; điện thoại dùng chung cũng cần cơ chế xử lý trùng. Theo dõi tỷ lệ khách chưa định danh được. B2B nên báo thêm mua lại theo doanh nghiệp, không trộn với khách cá nhân.

Cohort 90 ngày chỉ gồm khách đã đủ thời gian quan sát; không đánh giá khách mới mua hôm qua là chưa mua lại. Báo cáo doanh thu cần nêu ngày chốt và chính sách điều chỉnh khi có hoàn trả muộn. Đơn hoàn toàn bộ sau hoàn tất vẫn nằm trong tập đơn ban đầu của AOV này với giá trị thuần bằng 0, tránh thay mẫu số tùy ý.

### Sự kiện nghiệp vụ cần ghi nhận sau này

Xem sản phẩm, tìm kiếm, không có kết quả, thêm giỏ, bắt đầu checkout, đơn được ghi nhận, xác nhận đơn, giao thành công, nhận/hoàn tiền, gửi/đủ điều kiện báo giá, gửi báo giá và báo giá chuyển đơn. Không gửi tên, điện thoại, email, địa chỉ hoặc nội dung trao đổi vào analytics hành vi.

[YC] Ưu tiên Cloudflare Web Analytics khi phù hợp. [CX] Chưa xác minh khả năng thu toàn bộ event, nối phiên và đơn của công cụ này; không giả định nó đủ cho tất cả KPI. Nguồn sự thật về đơn/tiền/báo giá là dữ liệu nghiệp vụ. Thiết kế đo lường và kiểm chứng công cụ thuộc giai đoạn sau.

## 10. Dữ liệu và quyết định doanh nghiệp cần cung cấp

Tất cả mục dưới đây đang mở; có thể hoàn thành phân tích với trạng thái này nhưng không được coi chính sách đã được duyệt.

| Mã | Câu hỏi/dữ liệu cần cung cấp | Người xác nhận đề xuất | Thời điểm cần chốt |
|---|---|---|---|
| Q01 | Tên thương hiệu mới, pháp nhân bán hàng, kênh liên hệ và phạm vi thị trường | Chủ doanh nghiệp | Trước nội dung thương hiệu/công bố bán |
| Q02 | Danh sách SKU được bán, nhà cung cấp, quyền sử dụng nội dung/nhãn hiệu và giấy tờ liên quan | Kinh doanh + mua hàng | Trước duyệt catalog |
| Q03 | Nhóm khách ưu tiên; có phục vụ đại lý và dự án không | Chủ doanh nghiệp | Giai đoạn 02 |
| Q04 | Giá, thuế, giảm giá, thẩm quyền thay đổi và mức giá theo khách | Kinh doanh + kế toán | Trước đặc tả giao dịch |
| Q05 | Nguồn tồn kho; cách đồng bộ; thời điểm giữ/trừ/hoàn tồn; hết hạn đơn chờ | Kho + kinh doanh | Trước thiết kế nghiệp vụ đơn |
| Q06 | Địa bàn giao, đối tác giao, phí, giới hạn COD, xử lý hàng nặng/ắc quy/lắp đặt | Vận hành | Trước checkout |
| Q07 | Tài khoản nhận tiền, người đối soát, xử lý tiền thiếu/thừa, hoàn tiền | Kế toán | Trước thanh toán |
| Q08 | Bảo hành theo SKU, mốc áp dụng, đầu mối, đổi trả, kiểm hàng và trách nhiệm chi phí | Sau bán + kinh doanh | Trước xuất bản chính sách |
| Q09 | Ai tư vấn kỹ thuật; danh sách tương thích và tài liệu được duyệt | Kỹ thuật | Trước công bố tư vấn/tương thích |
| Q10 | Quy tắc báo giá: ngưỡng số lượng, hiệu lực, thời gian phản hồi, người duyệt, công nợ nếu có | Sales B2B + kế toán | Trước đặc tả B2B |
| Q11 | Nhân sự vận hành, giờ làm việc và cách phân quyền | Chủ doanh nghiệp | Giai đoạn 02–05 |
| Q12 | Dữ liệu bán hàng tổng hợp hiện có, ngân sách marketing, mục tiêu KPI | Kinh doanh | Trước đặt mục tiêu số |
| Q13 | Dữ liệu cá nhân cần lưu, thời hạn lưu, xử lý yêu cầu khách, trách nhiệm pháp lý | Chủ doanh nghiệp + phụ trách pháp lý | Trước thu dữ liệu thật |
| Q14 | Ngân sách dự phòng, yêu cầu sao lưu/khôi phục, mức gián đoạn chấp nhận | Chủ doanh nghiệp | Trước triển khai |
| Q15 | Phê duyệt các sửa phân loại DQ01–DQ06 và danh mục có điều kiện | Quản lý sản phẩm | Trước nhập dữ liệu |

## 11. Rủi ro và giả định

| Mã | Rủi ro/giả định chưa được xác nhận | Tác động | Hướng xử lý đề xuất |
|---|---|---|---|
| R01 | Sao chép quyền phân phối/nhận diện từ XTREND sang website mới | Sai cam kết, tranh chấp | Phê duyệt pháp nhân, quyền bán và nội dung riêng theo Q01–02 |
| R02 | Dữ liệu nguồn cũ hoặc mâu thuẫn | Tư vấn sai, đổi trả | Đối chiếu tài liệu hãng đúng model/revision; lưu người duyệt |
| R03 | Mua UPS/linh kiện không phù hợp | Không đáp ứng nhu cầu, phát sinh hỗ trợ | Câu hỏi cấu hình và chuyển kỹ thuật; không suy runtime hoặc tương thích |
| R04 | Tồn kho dùng chung nhiều kênh nhưng không có nguồn chuẩn | Bán vượt hàng | Chốt quy tắc tồn, đối soát và xử lý đơn đồng thời |
| R05 | Nhầm yêu cầu báo giá/đơn/tiền đã nhận | Sai doanh thu hoặc giao hàng chưa thanh toán | Tách vòng đời, quyền xác nhận và dữ liệu báo cáo |
| R06 | Thiếu người trả lời B2B | Mất cơ hội, cam kết không thực hiện | Chỉ công bố SLA sau khi xác nhận nhân sự/giờ làm |
| R07 | Phạm vi quá rộng ngay đầu | Chậm ra mắt, catalog không đủ chất lượng | Giai đoạn 02 chọn nhóm đã có dữ liệu/quy trình vận hành |
| R08 | Rò thông tin guest checkout hoặc quyền admin | Mất dữ liệu, gian lận | Xác minh truy cập đơn, quyền tối thiểu, không lộ secret, nhật ký thao tác |
| R09 | Cam kết miễn phí lâu dài | Thiếu ngân sách khi tăng tải hoặc đổi điều kiện gói | Kiểm tra điều kiện Free tier ở giai đoạn kiến trúc/deploy; dự phòng chi phí và khả năng chuyển đổi |
| R10 | Chi phí ngoài hosting bị bỏ sót | Lỗ vận hành | Dự toán tên miền nếu dùng, email/SMS nếu cần, backup, nhân sự, quảng cáo, vận chuyển và hoàn hàng |
| R11 | Điều kiện pháp lý/chính sách bán chưa rà soát | Nội dung công bố không phù hợp | Chủ doanh nghiệp/phụ trách pháp lý xác minh nghĩa vụ TMĐT, dữ liệu cá nhân, hóa đơn, thuế và quyền lợi khách trước ra mắt |
| R12 | Analytics thiếu/trùng dữ liệu | Ra quyết định sai | Đối soát với dữ liệu đơn, không đưa PII vào analytics; báo mức thiếu dữ liệu |
| R13 | Mua lại không cao ở hàng bền | Đặt KPI không thực tế | Tách theo ngành hàng và chu kỳ; không mặc định mọi sản phẩm mua lại trong 90 ngày |

Không có kết luận pháp lý cụ thể hoặc hạn mức Free tier hiện hành nào được xác nhận tại Giai đoạn 01. Những nội dung đó phải được kiểm tra từ nguồn chính thức khi đến giai đoạn liên quan. Không thay đổi stack bắt buộc và không đề xuất tích hợp sàn khi chưa có quyền.

## 12. Checklist nghiệm thu Giai đoạn 01

### Kiểm tra tính đầy đủ của bộ tài liệu — đã tự rà soát

- [x] Có phân tích doanh nghiệp, danh mục, thương hiệu, mẫu thông số, bảo hành và phân phối/bán hàng kèm nguồn.
- [x] Phân biệt [NG], [ĐX], [DN], [CX] và yêu cầu người dùng [YC].
- [x] Ghi giới hạn timeout/bản chỉ mục; không coi thông tin tham khảo là dữ liệu hiện hành của website mới.
- [x] Có bốn nhóm khách hàng và nhu cầu của đủ năm nhóm sản phẩm trong PROMPT 01.
- [x] Có journey B2C/B2B, quy trình bán lẻ/báo giá và các ngoại lệ quan trọng.
- [x] Có danh sách nghiệp vụ với mã, nhu cầu liên quan và điều kiện kiểm tra.
- [x] Có giả thuyết cạnh tranh và cách kiểm chứng, không bảo đảm vượt sàn.
- [x] Có đủ Traffic, CR, AOV, mua lại, số đơn và số yêu cầu báo giá; công thức, nguồn, chủ sở hữu và baseline chưa xác minh.
- [x] Có kế hoạch catalog, bộ thuộc tính, quy tắc chất lượng và điều kiện đưa sản phẩm lên bán.
- [x] Có danh sách quyết định mở, rủi ro và cập nhật PROJECT_CONTEXT.md.
- [x] Không viết code, tạo dữ liệu bán hàng thật, cài công cụ, sao chép ảnh hoặc chuyển giai đoạn.

Các dấu trên xác nhận sự hiện diện và rà soát tài liệu, không phải kiểm thử phần mềm hay phê duyệt của doanh nghiệp.

### Checklist xác nhận chi tiết của doanh nghiệp — các mục còn mở

PROMPT 02 xác nhận phê duyệt kết quả Giai đoạn 01 làm đầu vào. Các ô dưới đây được giữ để theo dõi dữ liệu/quyết định cụ thể; không tự đánh dấu là đã được cung cấp hoặc xác minh chỉ từ phê duyệt tổng thể.

- [ ] Đồng ý phạm vi nghiên cứu và cách sử dụng nguồn.
- [ ] Xác nhận/sửa nhóm khách hàng ưu tiên và hướng bán B2C/B2B.
- [ ] Duyệt danh mục dự kiến, đặc biệt SIMORCHIP, ASUS, ADVANTECH và UPS Offline.
- [ ] Xác nhận danh sách Q01–Q15 là đầy đủ và phân công người trả lời; các mục chưa có dữ liệu được giữ mở.
- [ ] Đồng ý quy trình nghiệp vụ đề xuất hoặc ghi nội dung cần sửa.
- [ ] Đồng ý quy ước KPI hoặc ghi phương án thay thế.
- [ ] Người có thẩm quyền ghi nhận nghiệm thu Giai đoạn 01.

**Bàn giao:** Giai đoạn 02 đã được yêu cầu bằng PROMPT 02; xem PRD.md. Phạm vi MVP mới vẫn chờ phê duyệt riêng.
