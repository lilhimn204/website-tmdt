# PRODUCT_CATALOG_PLAN — Kế hoạch danh mục sản phẩm

Ngày: 04/11/2026, Asia/Bangkok. Phiên bản: 0.1. Giai đoạn 01.

Trạng thái: **Được người dùng phê duyệt làm đầu vào Giai đoạn 02 qua PROMPT 02 ngày 04/11/2026.** Danh sách SKU/quyền bán và các dữ liệu Chưa xác minh vẫn cần doanh nghiệp cung cấp. Đây là kế hoạch nghiệp vụ cho catalog, không phải danh sách hàng sẵn bán, bảng giá, thiết kế database hoặc dữ liệu nhập hệ thống.

Quy ước: [YC] yêu cầu người dùng; [NG] tìm thấy tại nguồn; [ĐX] đề xuất AI; [DN] doanh nghiệp phải cung cấp; [CX] Chưa xác minh. Các bộ thuộc tính, quy tắc và ưu tiên bên dưới là [ĐX] nếu không ghi khác.

Sổ nguồn S01–S20 và giới hạn khảo sát xem [BUSINESS_ANALYSIS.md](BUSINESS_ANALYSIS.md). Khảo sát có sử dụng bản được công cụ tìm kiếm lập chỉ mục; không xác nhận dữ liệu đang có hiệu lực. Không nhập ảnh, giá, tồn kho, SKU hoặc nội dung nguồn vào website mới.

## 1. Nguyên tắc phân loại

1. Ngành hàng → loại sản phẩm → nhóm chức năng; thương hiệu là một chiều riêng. Một thương hiệu có thể xuất hiện ở nhiều ngành hàng khi có sản phẩm được duyệt.
2. Không lấy toàn bộ menu của XTREND làm danh mục bắt buộc. Chỉ công bố nhóm có SKU/nội dung đã được doanh nghiệp phê duyệt.
3. Model là mã của hãng; SKU là mã quản lý đơn vị bán của doanh nghiệp. Không coi chúng luôn giống nhau.
4. Sản phẩm là nội dung/mẫu chung; biến thể là lựa chọn bán được như dung lượng hoặc màu; mỗi biến thể bán độc lập có SKU riêng. Sản phẩm không có lựa chọn vẫn có ít nhất một SKU.
5. Giá, khuyến mãi, thuế và tồn kho là dữ liệu thương mại riêng; không nhét vào trường thông số tùy ý.
6. Thiếu thông tin phải ghi Chưa xác minh. “Không hỗ trợ”, “Không áp dụng” và “Không có dữ liệu” là ba trường hợp khác nhau.
7. Không tự đổi loại hàng theo từ khóa marketing. Mỗi giá trị quan trọng phải có nguồn, phiên bản và người duyệt.

## 2. Danh mục ngành hàng và thương hiệu dự kiến

### A. Bộ lưu điện và thiết bị nguồn

| Mã | Nhóm dự kiến | Thương hiệu tham khảo | Bằng chứng và giới hạn | Hình thức bán đề xuất |
|---|---|---|---|---|
| CAT01 | UPS Line Interactive | PROLiNK, CyberPower | [NG] Có nhóm/sản phẩm trên [S03](https://xtrend.vn/shop/) và [S13](https://xtrend.vn/bo-luu-dien-ups-prolink-pro1201sfcu-1200va/). Quyền bán của website mới [CX] | Bán trực tiếp nếu dữ liệu đủ; tư vấn khi khách chưa xác định tải |
| CAT02 | UPS Online một pha | PROLiNK; CyberPower theo SKU | [NG] Menu PROLiNK có một pha, CyberPower có Online tại [S02](https://xtrend.vn/san-pham/). Số pha từng SKU CyberPower cần kiểm tra | Bán hoặc báo giá theo model/cấu hình |
| CAT03 | UPS Online ba pha | PROLiNK; CyberPower chờ xác nhận danh mục | [NG] Có nhóm PROLiNK tại [S02](https://xtrend.vn/san-pham/). [CX] Chưa lập danh mục ba pha CyberPower trong khảo sát | Báo giá sau tư vấn kỹ thuật |
| CAT04 | IPS/thiết bị chuyển đổi nguồn | PROLiNK | [NG] Có IPS tại [danh mục IPS](https://xtrend.vn/ips/); không mặc định tương đương UPS | Tư vấn trước khi chốt cấu hình |
| CAT05 | Phụ kiện UPS | Theo thiết bị được duyệt | [YC] Có trong phạm vi; [CX] SKU và hãng cụ thể chưa xác minh | Chỉ bán khi có danh sách tương thích |
| CAT06 | UPS Offline | Chưa xác minh | [YC] Chỉ mở nếu có hàng phù hợp. Từ Offline trên một trang không đủ phân loại một dòng sản phẩm độc lập | Chưa công bố nhóm |

Không đề xuất người dùng tự lắp hệ thống điện hoặc tự xác định cấu hình ba pha chỉ từ website. Phạm vi khảo sát, lắp đặt và bảo trì do doanh nghiệp xác nhận.

### B. Máy in và vật tư

| Mã | Nhóm dự kiến | Thương hiệu tham khảo | Bằng chứng và giới hạn | Hình thức bán đề xuất |
|---|---|---|---|---|
| CAT07 | Máy in đơn năng | Pantum | [NG] Có nhóm [S19 đơn năng](https://xtrend.vn/may-in-don-nang-pantum/) | Bán trực tiếp hoặc báo giá số lượng |
| CAT08 | Máy in đa năng | Pantum | [NG] Có nhóm [S19 đa năng](https://xtrend.vn/may-in-da-nang-pantum/) | Bán trực tiếp hoặc tư vấn văn phòng |
| CAT09 | Mực, trống và vật tư liên quan | Chưa xác minh | [YC] Chỉ mở khi có hàng; chưa xác nhận SKU/quyền bán | Mua theo mã vật tư và model tương thích |

Không mở rộng sang thương hiệu máy in khác chỉ vì nguồn còn tài liệu hoặc trang bảo hành cũ.

### C. Linh kiện và phụ kiện máy tính

| Mã | Nhóm dự kiến | Thương hiệu tham khảo | Bằng chứng và giới hạn | Hình thức bán đề xuất |
|---|---|---|---|---|
| CAT10 | RAM desktop/laptop | TRM, SIMORCHIP | [NG] [S11](https://xtrend.vn/brand/trm/) có RAM TRM; [S09](https://xtrend.vn/simorchip/) có RAM SIMORCHIP | Bán trực tiếp khi tương thích được xác nhận |
| CAT11 | SSD | TRM, Dynabook, SIMORCHIP | [NG] TRM/SIMORCHIP tại S11/S09; Dynabook xuất hiện ở danh sách S03 | Theo dung lượng, giao tiếp, form factor |
| CAT12 | Mainboard | BIOSTAR; ASUS chờ xác minh loại hàng | [NG] Có BIOSTAR trên [S17](https://xtrend.vn/shop/page/3/). Không suy danh mục ASUS từ tên hãng | Bán trực tiếp hoặc tư vấn cấu hình |
| CAT13 | PSU — nguồn máy tính | Cooler Master, Antec | [NG] Có mẫu tại [S18](https://xtrend.vn/shop/page/10/) | Theo công suất, kích thước, đầu nối và nhu cầu |
| CAT14 | Case | Cooler Master, Antec | [NG] Nhóm Cooler Master tại [S14](https://xtrend.vn/cooler-master/), Antec tại [S02](https://xtrend.vn/san-pham/) | Theo khả năng lắp đặt và phí vận chuyển |
| CAT15 | Tản nhiệt khí/AIO | Cooler Master | [NG] Có nhóm tại S14 và [mẫu AIO](https://xtrend.vn/tan-nhiet-aio-cooler-master-masterliquid-360-core-si/) | Theo socket, kích thước và phụ kiện lắp |
| CAT16 | Phụ kiện/keo tản nhiệt | Cooler Master; hãng khác chờ duyệt | [NG] Có [mẫu keo tản nhiệt](https://xtrend.vn/keo-tan-nhiet-cooler-master-cryofuze-5/). [CX] Chưa xác minh toàn bộ nhóm phụ kiện | Chỉ mở nhóm có hàng và dữ liệu |

**Điều chỉnh đề xuất:** đặt SIMORCHIP trong RAM/SSD theo bằng chứng S09. Không mặc định SIMORCHIP thuộc mạng/công nghiệp như vị trí tham khảo trong MASTER PROMPT. Chờ doanh nghiệp xác nhận thay đổi này.

### D. Thiết bị mạng và công nghiệp

| Mã | Nhóm dự kiến | Thương hiệu tham khảo | Bằng chứng và giới hạn | Hình thức bán đề xuất |
|---|---|---|---|---|
| CAT17 | Switch công nghiệp | ISON | [NG] Có Industrial Switch tại [S16](https://xtrend.vn/shop/page/8/); chưa kiểm tra từng model | Ưu tiên tư vấn/báo giá dự án |
| CAT18 | Switch PoE công nghiệp | ISON | [NG] Có Industrial PoE Switch tại S16; tổng công suất PoE phải được duyệt theo model | Báo giá hoặc bán khi cấu hình đủ rõ |
| CAT19 | Bộ phát Wi-Fi di động/Datacom | PROLiNK | [NG] Có thiết bị ở [S10](https://xtrend.vn/datacom/); Datacom không phải một loại UPS | Bán trực tiếp khi thông số, quyền bán và điều kiện sử dụng rõ |
| CAT20 | Thiết bị công nghiệp khác | Advantech, chờ xác nhận | [NG] Có liên kết hãng ở S02 và tiêu đề tin ở S20. [CX] Chưa xác nhận nhóm/SKU cho website mới | Giữ ở kế hoạch nội bộ |

ASUS chưa có nhóm hàng đủ bằng chứng để quyết định. Không mở thêm GPU, router, mini PC hoặc ngành hàng khác chỉ dựa vào sản phẩm hãng thường kinh doanh.

## 3. Mẫu dữ liệu tham khảo và vấn đề chất lượng

Các mẫu sau chỉ phục vụ nhận diện trường dữ liệu và vấn đề kiểm chứng; **không phải sản phẩm được chọn bán**.

| Mẫu nguồn | Điều đã tìm thấy [NG] | Vấn đề cần xác minh [CX] và hệ quả đề xuất |
|---|---|---|
| [PROLiNK PRO1201SFCU — S13](https://xtrend.vn/bo-luu-dien-ups-prolink-pro1201sfcu-1200va/) | Trang nêu 1200 VA/600 W, sin mô phỏng, runtime 8–30 phút tùy tải | Thiếu bảng tải tương ứng để đưa ra cam kết runtime. Nội dung dùng cả Offline và Line Interactive; chuẩn hóa bằng datasheet đúng revision |
| [Pantum P3300DN — S12](https://xtrend.vn/may-in-don-chac-nang-dao-mat-p3300dn/) | Bảng có 33 ppm A4, LAN, không Wi-Fi, đảo mặt tự động | Mô tả và bảng có số trang/tháng khác nhau như DQ03. Tách thông số khuyến nghị/tối đa, không tự chọn giá trị |
| [TRM — S11](https://xtrend.vn/brand/trm/) | Có SSD M.2 SATA và M.2 PCIe NVMe trong các dòng khác nhau | M.2 đơn thuần chưa đủ chọn tương thích. Model, form factor và giao tiếp cần tách rõ |
| [Hyper 212 Spectrum V3 — S15](https://xtrend.vn/tan-nhiet-khi-cooler-master-hyper-212-spectrum-v3/) | Có trường socket và kích thước tản | Cần đối chiếu đúng mã/revision, bộ gá đi kèm và khoảng trống case trước xác nhận lắp vừa |
| [Danh sách ISON — S16](https://xtrend.vn/shop/page/8/) | Tên mẫu có số lượng/loại cổng và nhãn PoE | Tên sản phẩm không đủ suy ngân sách PoE, tiêu chuẩn quản lý hoặc môi trường vận hành |

Chưa kiểm chứng lại các thông số trên với tài liệu hãng. Không dùng số liệu này làm cấu hình tư vấn thực tế trước khi có người kỹ thuật duyệt.

## 4. Bộ thông tin chung cần doanh nghiệp cung cấp

Đây là yêu cầu nghiệp vụ, chưa quy định bảng/cột database.

| Nhóm dữ liệu | Thông tin | Quy tắc chất lượng |
|---|---|---|
| Nhận diện | ID nội bộ, SKU, model, part number/revision khi có, tên, thương hiệu, danh mục | SKU duy nhất; model và tên hãng được chuẩn hóa |
| Đơn vị bán | Sản phẩm gốc, biến thể, đơn vị tính, quy cách đóng gói | Không nhầm bộ kit với một thanh RAM; giá và tồn theo đúng đơn vị |
| Thương mại | Giá bán, tiền tệ, thuế, điều kiện khuyến mãi, hình thức bán | Người có quyền duyệt; thiếu giá không biểu diễn thành 0 |
| Kho | Số lượng có thể bán, nguồn kho, thời điểm cập nhật | Không lấy từ web tham khảo; quy tắc giữ/trừ/hoàn hàng chốt riêng |
| Kỹ thuật | Thuộc tính có kiểu dữ liệu và đơn vị, điều kiện đo, tài liệu nguồn | Không dùng chuỗi quảng cáo thay giá trị để lọc |
| Nội dung | Mô tả, ảnh, alt text, tài liệu, SEO metadata | Có quyền sử dụng, đúng model, có người duyệt; không tự sao chép |
| Vận chuyển | Kích thước/trọng lượng kiện, điều kiện giao/lắp đặt | Phân biệt kích thước máy và kiện đóng gói; hàng đặc thù cần vận hành xác nhận |
| Sau bán | Chính sách bảo hành/đổi trả, nơi tiếp nhận, phiên bản/ngày hiệu lực | Theo SKU và ngày giao dịch; không chỉ một số tháng cho mọi sản phẩm |
| Truy vết | URL/tên tài liệu, phiên bản, ngày kiểm tra, người kiểm tra, trạng thái duyệt | Có cách giải quyết nguồn mâu thuẫn và lưu lịch sử |
| Tương thích | Model/SKU tương thích, điều kiện, nguồn xác nhận | Không dùng “tương thích tất cả”; mua kèm phải có căn cứ |

## 5. Thuộc tính theo nhóm và bộ lọc dự kiến

Danh sách là bộ yêu cầu để thu thập, không khẳng định mọi SKU có mọi chức năng. Bộ lọc chỉ xuất hiện khi có dữ liệu đủ và đã kiểm chứng.

### 5.1. UPS/IPS

- Nhận diện kỹ thuật: công nghệ UPS; số pha đầu vào và đầu ra riêng; công suất VA và W; điện áp/dải đầu vào, điện áp đầu ra; dạng sóng ở chế độ ắc quy; tần số và thời gian chuyển mạch nếu áp dụng.
- Runtime: các điểm tải W hoặc % kèm mức nền VA/W, số phút, cấu hình ắc quy, điều kiện đo và nguồn. Không dùng một khoảng phút không điều kiện làm công cụ tự tính runtime.
- Ắc quy: loại, số lượng, điện áp, dung lượng, tích hợp/ngoài, khả năng mở rộng, cấu hình sạc phù hợp; việc thay thế/lắp đặt cần kỹ thuật xác nhận.
- Lắp đặt: Tower/Rack, số U nếu áp dụng, kích thước, trọng lượng, ổ cắm và đầu nối; giao tiếp/quản lý theo model; môi trường và mức ồn nếu có nguồn.
- Bộ lọc đầu tiên: công nghệ, VA, W, số pha, Tower/Rack, thương hiệu. Chưa cung cấp bộ lọc “chạy được X phút” nếu chưa có dữ liệu tải chuẩn hóa.
- IPS giữ bộ thuộc tính riêng theo tài liệu của dòng sản phẩm; không mặc định có khả năng chuyển mạch hoặc tính năng UPS.

### 5.2. Máy in và vật tư

- Công nghệ in, màu/đen trắng; in/scan/copy/fax theo model; tốc độ theo A4/Letter và chế độ một/hai mặt; độ phân giải; thời gian trang đầu.
- Khối lượng in khuyến nghị và tối đa là hai thuộc tính khác nhau; khay vào/ra; khổ/định lượng giấy; ADF và scan hai mặt tách biệt với in hai mặt.
- USB/LAN/Wi-Fi; in di động và hệ điều hành/driver có phiên bản; mã hộp mực/trống, loại đi kèm hay mua riêng, sản lượng và điều kiện đo.
- Bộ lọc đầu tiên: đơn/đa năng, màu/đen trắng, Wi-Fi/LAN, đảo mặt, ADF, khổ giấy, khoảng sản lượng khuyến nghị khi dữ liệu đủ.
- Chi phí sử dụng: mô hình tham khảo gồm giá máy + vật tư + giấy/điện/bảo trì trong kỳ; mỗi giả định phải hiển thị. Chưa tạo giá trị chi phí/trang khi thiếu giá vật tư/sản lượng được duyệt.

### 5.3. RAM

- Dung lượng tổng, số thanh và dung lượng mỗi thanh; DDR generation; DIMM/SO-DIMM; tốc độ với đơn vị theo tài liệu; độ trễ, điện áp; ECC/non-ECC và registered/unbuffered nếu có.
- Model/revision, profile hiệu năng nếu có; danh sách hỗ trợ của hệ thống/mainboard khi có căn cứ.
- Bộ lọc: dung lượng, loại DDR, dạng thanh, tốc độ và thương hiệu. Không tự đổi MHz sang MT/s mà không kiểm tra nguồn và quy ước.

### 5.4. SSD

- Dung lượng; form factor như 2.5 inch hoặc M.2 kèm kích thước; giao tiếp SATA/PCIe; giao thức; thế hệ và số lane nếu có; loại key nếu cần tương thích.
- Tốc độ đọc/ghi kèm điều kiện và phiên bản dung lượng; độ bền TBW khi có; giới hạn bảo hành theo thời gian/độ ghi do hãng công bố; kích thước, heatsink và phụ kiện.
- Bộ lọc: dung lượng, form factor, giao tiếp, thế hệ PCIe nếu đủ dữ liệu, thương hiệu. Không gộp SATA và NVMe chỉ vì cùng dạng M.2.

### 5.5. Mainboard

- Socket, chipset, form factor; danh sách CPU và BIOS yêu cầu; DDR generation, số khe, dung lượng hỗ trợ; PCIe; M.2/SATA; cổng I/O; mạng và đầu cấp điện.
- Bộ lọc: socket, chipset, loại RAM, kích thước, thương hiệu. Không suy “cùng socket là hỗ trợ mọi CPU”; cần danh sách hỗ trợ/revision/BIOS.

### 5.6. Case, PSU và tản nhiệt

| Loại | Thuộc tính quyết định mua | Bộ lọc ưu tiên |
|---|---|---|
| Case | Form factor mainboard; giới hạn chiều dài GPU/chiều cao tản; PSU hỗ trợ; vị trí/kích thước radiator; khay ổ; cổng trước; quạt đi kèm; kích thước kiện | Mainboard hỗ trợ, giới hạn tản/GPU, màu, thương hiệu |
| PSU | Công suất định mức, form factor/kích thước, điện áp, đầu nối/số lượng, chuẩn ATX theo model, dây rời/liền, chứng nhận hiệu suất có bằng chứng, bảo vệ và bảo hành | Công suất, kích thước, đầu nối cần thiết, dây rời, thương hiệu |
| Tản khí | Socket/bộ gá, kích thước tổng và chiều cao, khoảng trống RAM, quạt/độ ồn theo điều kiện, đầu nguồn/đèn | Socket, chiều cao, thương hiệu |
| Tản AIO | Socket/bộ gá, kích thước radiator thực, quạt và bơm, chiều dài ống, vị trí lắp và điều kiện bảo hành | Socket, cỡ radiator, thương hiệu |
| Phụ kiện | Loại, quy cách, mục đích, thiết bị áp dụng, cảnh báo của nhà sản xuất | Loại sản phẩm và tương thích đã duyệt |

Không xếp chứng nhận hiệu suất thành bảo đảm duy nhất về chất lượng PSU. Không dùng một con số TDP khác phương pháp đo giữa các hãng để kết luận tản nhiệt phù hợp.

### 5.7. Mạng/công nghiệp và Datacom

- Switch: số cổng theo loại, tốc độ từng cổng/uplink, đồng/quang, SFP/SFP+ và module đi kèm hay tùy chọn; managed/unmanaged và chức năng được xác nhận.
- PoE: tiêu chuẩn, số cổng cấp nguồn, giới hạn mỗi cổng và tổng ngân sách; nguồn đi kèm/ngoài.
- Công nghiệp: dải nhiệt độ, độ ẩm, cấp bảo vệ/chứng nhận nếu có, nguồn cấp, DIN rail/rack/desktop và điều kiện môi trường theo hãng.
- Datacom: loại thiết bị, chuẩn mạng di động/Wi-Fi, băng tần và nhà mạng tương thích khi có bằng chứng, SIM, nguồn/pin, số kết nối theo model. Không sao chép bộ thuộc tính switch cho Wi-Fi di động.
- Bộ lọc: loại thiết bị, số/tốc độ cổng, PoE, quản lý, kiểu lắp; Datacom có bộ lọc riêng theo dữ liệu thực tế.

## 6. Quy tắc bán, tồn kho và vòng đời

Tách ba chiều để tránh một nhãn “trạng thái” gây hiểu sai:

1. **Duyệt nội dung:** bản nháp → chờ kiểm tra → được duyệt → công bố/ẩn.
2. **Vòng đời:** đang kinh doanh, ngừng kinh doanh, EOL do hãng xác nhận; có nguồn và ngày xác nhận. Không suy EOL chỉ vì hết hàng hoặc xuất hiện tên tab EOL trên trang.
3. **Khả năng mua:** bán trực tiếp, cần báo giá, tạm hết hàng; phụ thuộc dữ liệu thương mại và điều kiện vận hành. Đặt trước chưa được mặc định hỗ trợ.

| Tình huống | Xử lý đề xuất |
|---|---|
| Có đủ dữ liệu, giá được duyệt và hàng có thể bán | Cho mua trực tiếp nếu không thuộc nhóm cần kỹ thuật xác nhận |
| Chưa có giá hoặc cần cấu hình/dự án | Hiển thị yêu cầu báo giá/tư vấn; không đưa vào checkout như hàng giá 0 |
| Hết hàng | Ghi đúng trạng thái; không tự tạo thời gian về hàng |
| Thông số quan trọng đang tranh chấp | Giữ nháp hoặc khóa mua đến khi xác minh; không chọn ngẫu nhiên giá trị |
| EOL/ngừng bán | Mặc định không cho đặt mới; lưu thông tin hỗ trợ đơn cũ, sản phẩm thay thế được duyệt. Bán hàng tồn EOL là ngoại lệ cần xác nhận riêng |
| Đổi trả về kho | Kiểm tra tình trạng trước khi tăng lượng có thể bán; không tự tái bán hàng đã qua sử dụng như hàng mới |

Bảo hành gắn với điều kiện có hiệu lực tại giao dịch; sửa chính sách hiện tại không được âm thầm thay cam kết của đơn cũ. Thông số, giá và chính sách đã chốt trong báo giá/đơn cần được lưu lại để đối soát.

## 7. Quy trình chuẩn bị catalog

1. **Doanh nghiệp chọn phạm vi:** xác nhận ngành hàng, thương hiệu, SKU, quyền bán và quyền sử dụng nội dung. Không bắt đầu bằng nhập toàn bộ XTREND.
2. **Nhận dữ liệu được phép:** bảng hàng và hồ sơ từ doanh nghiệp/hãng; mọi mục chưa có nguồn giữ Chưa xác minh.
3. **Chuẩn hóa:** tên hãng, model, đơn vị bán, phân loại; tách biến thể/SKU; chuẩn hóa đơn vị và kiểu thuộc tính.
4. **Kiểm tra kỹ thuật:** người có chuyên môn đối chiếu đúng model/revision và tài liệu, giải quyết DQ01–DQ06; lưu nguồn quyết định.
5. **Kiểm tra thương mại:** giá/thuế, tồn, điều kiện giao, bảo hành và nội dung được duyệt độc lập với thông số.
6. **Duyệt xuất bản:** kiểm tra đủ dữ liệu cho hình thức bán; có người chịu trách nhiệm phê duyệt.
7. **Rà soát định kỳ:** thay đổi giá/hàng/chính sách có dấu thời gian và người sửa; kiểm tra EOL và tài liệu mới. Nhịp rà soát do doanh nghiệp quyết định.

### Chuẩn bị cho CSV/Excel sau này

Chưa tạo hoặc nhập bảng tính ở giai đoạn này. Khi triển khai cần các nhóm thông tin: SKU/model/biến thể, danh mục và thương hiệu, thương mại/kho, thuộc tính theo nhóm, chính sách, tệp/nội dung và quyền sử dụng, trạng thái duyệt. Chốt mẫu sau khi biết dữ liệu thật.

Điều kiện kiểm tra dự kiến: không trùng SKU; danh mục hợp lệ; giá/số lượng đúng kiểu và quy tắc; đơn vị rõ; thiếu không thành 0; hàng chưa duyệt không xuất bản; có xem trước lỗi và cách xử lý trước ghi đè dữ liệu cũ. Danh sách có lỗi không được tự động coi là nhập thành công.

## 8. Hướng ưu tiên catalog để xem xét ở Giai đoạn 02

Đây là tiêu chí lựa chọn, **chưa chốt MVP hoặc số lượng SKU**.

- Ưu tiên nhóm có quyền bán rõ, dữ liệu kỹ thuật đủ, nguồn tồn đáng tin, bảo hành có đầu mối và nhân sự hỗ trợ.
- Các nhóm có thể xét bán trực tiếp trước: RAM/SSD, máy in, một số linh kiện và UPS có cấu hình rõ. Mỗi nhóm vẫn phải vượt kiểm tra dữ liệu; không có cam kết tất cả sẽ vào MVP.
- Nhóm nên xem xét báo giá trước: UPS ba pha/cấu hình mở rộng, mạng công nghiệp, đơn số lượng lớn hoặc điều kiện giao/lắp đặc biệt.
- Giữ chờ xác minh: ASUS theo loại hàng, Advantech theo SKU, UPS Offline riêng, phụ kiện và vật tư chưa có catalog được duyệt.
- Không đưa cấu hình tự động, tính runtime, cấu hình PC tự động hoặc gợi ý tương thích tự động vào cam kết ban đầu khi chưa có dữ liệu kiểm chứng.

## 9. Yêu cầu trải nghiệm xuất phát từ nghiệp vụ

Áp dụng nguyên tắc Impeccable ở mức nội dung/chức năng, chưa thiết kế giao diện:

- Tìm kiếm model/SKU rõ và dễ thấy; giữ bối cảnh khi chuyển từ kết quả sang sản phẩm.
- Thông số quyết định mua được ưu tiên theo ngành hàng, không dùng cùng một bộ thông tin cho UPS và RAM.
- Bảng so sánh có đơn vị, nguồn/điều kiện cần thiết và trạng thái thiếu dữ liệu; không lấy số 0 thay thông số chưa biết.
- Hành động chính phù hợp khả năng giao dịch: mua hàng hoặc yêu cầu báo giá; không hứa mua ngay khi còn phải xác nhận cấu hình.
- Giá, thuế/phí, trạng thái và bảo hành dễ đọc; không tạo khan hiếm giả, đánh giá giả hoặc logo chứng nhận chưa có quyền.
- Trên điện thoại vẫn đọc được thông số và sử dụng bộ lọc/so sánh; thiết kế chi tiết và tiêu chuẩn kiểm tra được xác định ở giai đoạn UI/UX.
- Nhãn và lỗi dùng tiếng Việt rõ; form có thông báo đã tiếp nhận, lỗi có hướng sửa và giữ dữ liệu đã nhập khi phù hợp.

## 10. Checklist duyệt kế hoạch catalog

### Đã rà soát nội dung tài liệu

- [x] Bao phủ các ngành hàng trong MASTER PROMPT 00 và yêu cầu PROMPT 01.
- [x] Có mapping thương hiệu–loại hàng kèm nguồn hoặc trạng thái Chưa xác minh.
- [x] Ghi rõ đề xuất sửa vị trí SIMORCHIP; chưa tự duyệt.
- [x] Không suy ngành hàng ASUS, SKU Advantech hoặc nhóm Offline khi thiếu bằng chứng.
- [x] Có bộ thuộc tính và bộ lọc theo từng loại sản phẩm; phân biệt đơn vị/điều kiện đo.
- [x] Có quy tắc sản phẩm–biến thể–SKU, giá/tồn riêng, bảo hành và EOL.
- [x] Có quy trình chuẩn bị dữ liệu và điều kiện xuất bản; chưa nhập dữ liệu thật.

### Cần doanh nghiệp phê duyệt

- [ ] Xác nhận ngành hàng và thương hiệu thực sự được kinh doanh.
- [ ] Cung cấp SKU và nguồn dữ liệu có quyền sử dụng.
- [ ] Duyệt người chịu trách nhiệm kỹ thuật, thương mại, kho và bảo hành.
- [ ] Chốt nhóm bán trực tiếp, cần báo giá và giữ chờ xác minh.
- [ ] Chấp nhận hoặc sửa các đề xuất DQ01–DQ06.
- [ ] Duyệt kế hoạch này làm đầu vào Giai đoạn 02, khi người dùng yêu cầu thực hiện.

Phê duyệt tổng thể Giai đoạn 01 đã được ghi nhận theo PROMPT 02. Các ô trên tiếp tục theo dõi xác nhận chi tiết; không tự đánh dấu rằng SKU, quyền nội dung hoặc dữ liệu kỹ thuật đã được doanh nghiệp cung cấp.
