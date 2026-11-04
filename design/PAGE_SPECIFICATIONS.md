# Đặc tả màn hình — Giai đoạn 04

Đề xuất hướng A · 04/11/2026 · Chờ duyệt. Đọc cùng [DESIGN.md](../DESIGN.md), [wireframe](WIREFRAMES.md) và [SITEMAP.md](../SITEMAP.md). Mã P/U/C/A/S kế thừa tài liệu trước; DES là mã màn hình thiết kế. Các tên, ảnh, giá và số liệu trong bản vẽ đều là nhãn giữ chỗ.

## 1. Shell dùng chung

Storefront: skip link → header → breadcrumb nếu không phải trang chủ → main → footer. Header desktop có search, danh mục, thương hiệu, báo giá, hỗ trợ, giỏ; mobile có menu drawer, tên website, giỏ và ô tìm kiếm một hàng riêng. Logo chưa được tạo; dùng chữ “Tên website” trong bản vẽ.

Footer chỉ công bố pháp nhân/địa chỉ/kênh/chính sách đã duyệt. Không tự thêm hotline mẫu, chứng nhận, logo nhà phân phối hoặc cam kết giao hàng. Link về trang chủ, danh mục, thương hiệu, hỗ trợ/chính sách là phần điều hướng ổn định.

Checkout có header gọn với nhận diện, quay lại giỏ và hỗ trợ; giữ footer chính sách tối giản để tập trung điền thông tin. Admin có shell riêng và chỉ hiển thị mục được phép; ẩn menu không thay kiểm soát quyền thực tế.

## 2. DES01 — Trang chủ

**Mapping:** P01 · C01/C09/C11 · F01. **URL:** `/`.

**Mục tiêu:** người mới hiểu cửa hàng bán gì; người biết model tìm ngay; người mua doanh nghiệp thấy lối báo giá.

Thứ tự nội dung:

1. Header/search; nội dung gợi ý nhập “Tên sản phẩm, model hoặc SKU”. Submit tới P07, không yêu cầu autocomplete nâng cao.
2. Hero ngắn: “Chọn thiết bị theo nhu cầu và thông số” là copy đề xuất, CTA “Khám phá sản phẩm”. Lối báo giá hiển thị riêng: “Cần mua cho doanh nghiệp?” → “Yêu cầu báo giá”. Không có ảnh trang trí nặng hoặc carousel.
3. Danh mục: UPS/nguồn, máy in/vật tư, linh kiện, mạng/công nghiệp; chỉ hiện nhóm đủ dữ liệu để công bố.
4. Sản phẩm do biên tập chọn trong catalog đã duyệt. Tên khối “Sản phẩm nổi bật” chỉ phản ánh lựa chọn biên tập; không ghi bán chạy nếu chưa có thống kê.
5. Lối duyệt thương hiệu có tên/logo được phép dùng; không gắn “đối tác chính thức”.
6. Hướng dẫn chọn hàng cơ bản dẫn đến danh mục/thông số hoặc P17; không thêm blog C13 vào MVP.
7. Footer chính sách và liên hệ đã xác nhận.

**Desktop:** hero 2 vùng không cân bằng, nội dung chính khoảng 2/3; vùng B2B 1/3. Danh mục là một dải; sản phẩm tối đa 4 card mỗi hàng khi không có filter. **Mobile:** hero một cột, CTA duyệt hàng hiện sớm; RFQ thành khối ngắn ngay sau; 4 nhóm hàng dạng 2 × 2; sản phẩm dạng hàng một cột.

**Trạng thái:** skeleton chỉ ở danh sách đang tải; không làm header biến mất. Nhóm chưa có sản phẩm được ẩn hoặc dẫn tới trạng thái có giải thích theo quy tắc xuất bản. Lỗi một khối có retry tại khối, không làm cả trang trắng. Không có dữ liệu thương hiệu thì bỏ khối, không điền logo hãng tự lấy.

**Tiêu chí UX-DES01:** trong viewport mobile đầu tiên phải nhận ra tên website, search và cách duyệt hàng; lối RFQ rõ ngay sau vùng giới thiệu; không có nút vô nghĩa hoặc lời hứa chưa được duyệt.

## 3. DES02 — Trang danh mục

**Mapping:** P03/P04; P02 dùng variation chỉ mục · C01/C03/C04/C05 · F02/F05/F06. **URL:** `/danh-muc/{category-slug}/` hoặc `/san-pham/`.

Thứ tự: breadcrumb → H1/mô tả ngắn → nhóm con nếu có → toolbar tổng kết quả/sắp xếp/lọc → chips đã áp dụng → danh sách → phân trang. Sidebar desktop có nhóm filter theo ngành; mobile dùng drawer.

Ví dụ filter UPS: công nghệ, VA, W, dạng lắp đặt, hãng; runtime chỉ lọc khi có dữ liệu có điều kiện chuẩn hóa. Máy in: tính năng/màu/đảo mặt/kết nối; RAM/SSD: giao tiếp/form factor/dung lượng đúng schema. Trang “Tất cả sản phẩm” chỉ có filter chung, chọn ngành rồi mới mở bộ thuộc tính đặc thù.

**Tương tác:** số kết quả và nhãn filter cập nhật từ phản hồi hệ thống; chips có nút xóa có tên. Mobile chỉnh filter trong bản tạm, “Áp dụng” mới đổi URL/kết quả, “Hủy” trả trạng thái trước; mở lại giữ lựa chọn đã áp dụng. Không xóa filter khi đổi trang; đổi filter về trang đầu theo quy tắc sitemap. Back/Forward phục hồi bối cảnh.

**Card:** ảnh, tên, model/SKU, 2–3 thông số, giá/trạng thái, “Xem sản phẩm”, checkbox so sánh. Không hiển thị quantity hoặc nút mua khi model có nhiều biến thể chưa chọn. Compare tray xuất hiện khi có lựa chọn; báo cần ít nhất 2 và tối đa 3 SKU cùng loại; luôn có xóa danh sách.

**Desktop:** sidebar 240 px ở container ≥1280 và grid 3 cột. **Mobile:** toolbar 2 nút lớn, chips xuống dòng, card dạng hàng; không thu card thành cột hẹp 170 px khiến SKU/giá không đọc được.

**Trạng thái:** skeleton giữ layout; empty không có hàng khác zero-result do filter. Zero-result có “Xóa bộ lọc”; lỗi tải có retry giữ query/filter. SKU EOL có nhãn và link thông tin khi được phép công bố, không có nút mua. Tồn chưa rõ khác hết hàng.

**UX-DES02:** từ URL đã lọc mở lại thấy cùng điều kiện; dùng bàn phím mở/đóng filter, chọn SKU và chuyển so sánh; trường thiếu dữ liệu không bị coi là “Không hỗ trợ”.

## 4. DES03 — Trang thương hiệu

**Mapping:** P06; P05 chỉ mục · C01/C03 · F03. **URL:** `/thuong-hieu/{brand-slug}/`.

Thứ tự: breadcrumb → tên/logo được phép và giới thiệu có nguồn đã duyệt → nhóm sản phẩm của thương hiệu → toolbar/filter/list → liên kết hỗ trợ phù hợp. Tên thương hiệu là dữ liệu catalog, không chứng minh website có quyền phân phối.

**Khác trang danh mục:** thương hiệu được cố định theo URL, không giả thành một filter có thể gỡ khiến trang mất ý nghĩa; CTA “Xem tất cả thương hiệu” quay P05. Khi hãng có nhiều nhóm, chọn nhóm rồi mới có filter kỹ thuật tương ứng. Không đặt thông số RAM cạnh thông số UPS trong cùng bộ lọc.

**Desktop:** brand intro thấp, panel tóm tắt nhóm ở đầu; dưới dùng ProductCollection chung. **Mobile:** logo nhỏ + tên; không dùng banner chiếm toàn màn hình. Danh mục con thành link/chips xuống dòng.

**Trạng thái:** không có logo dùng tên chữ; không có mô tả thì bỏ đoạn mô tả, không tự viết thành tích. Không có SKU đang bán giải thích và dẫn tới danh mục khác hoặc RFQ, không cam kết có thể nhập hàng. Slug không hợp lệ dùng 404, không tự redirect sang hãng gần giống.

**UX-DES03:** người dùng thấy rõ đang lọc một thương hiệu; không có nhãn phân phối chính thức chưa duyệt; quay lại danh sách hãng không làm mất khả năng định hướng.

## 5. DES04 — Kết quả tìm kiếm

**Mapping:** P07 · C02/C03 · F04/F05. **URL:** `/tim-kiem/?q={tu-khoa}`.

Hiển thị từ khóa nguyên nghĩa do người dùng nhập, số kết quả từ hệ thống, toolbar và danh sách. Ô search giữ nội dung để sửa. Không lấy từ khóa thô đưa vào nội dung nguy hiểm ở giai đoạn code; chi tiết bảo vệ thuộc S02.

- Model/SKU khớp chính xác có thể được nhận diện bằng nhãn “Khớp model/SKU” nếu hệ thống thực sự xác định; không suy bằng tên gần giống.
- Kết quả nhiều ngành chỉ có filter chung và nhóm loại hàng; filter kỹ thuật xuất hiện sau khi đã chọn nhóm phù hợp.
- Không hứa sửa lỗi chính tả, tìm ngữ nghĩa, autocomplete hoặc gợi ý AI của C15 ở MVP.
- Không tìm thấy: gợi ý kiểm tra ký tự model, bỏ bớt từ khóa, duyệt nhóm hàng, hoặc gửi nhu cầu báo giá. Từ khóa rỗng: hướng dẫn nhập hoặc duyệt hàng; không hiển thị màn hình “lỗi”.

**Desktop:** grid như danh mục; vùng tổng kết từ khóa ở đầu. **Mobile:** ô nhập rộng đầy đủ, không cắt cụm từ dài; kết quả dạng hàng, nhóm/filter trong drawer.

**Trạng thái:** loading theo lần submit; giữ nội dung cũ với trạng thái cập nhật khi phù hợp, không announce liên tục mỗi phím. Lỗi mạng có retry; kết quả cũ không giả là kết quả mới. SKU ngừng bán có nhãn EOL, không nút mua.

**UX-DES04:** search theo tên/hãng/model/SKU được truy vết tới C02; nhãn số kết quả và query khớp nhau; zero-result có đường đi tiếp.

## 6. DES05 — Chi tiết sản phẩm

**Mapping:** P08 · C04/C05/C06/C09/C11; module liên quan C12/V1.1 · F06/F07/F11. **URL:** `/san-pham/{product-slug}/?sku={public-sku}`.

| Vùng | Nội dung và hành vi |
|---|---|
| Breadcrumb | Danh mục chính → sản phẩm; không biến URL thành cây nhiều cấp |
| Gallery | Ảnh chính, thumbnails nếu có, alt đúng ảnh; placeholder nếu thiếu; zoom có điều khiển bàn phím khi triển khai |
| Danh tính | Tên đầy đủ, thương hiệu, model, SKU, biến thể đang chọn; không giấu SKU trong tab |
| Tóm tắt chọn hàng | 3–5 thông số quan trọng theo ngành; link “Xem đầy đủ thông số” |
| Giá và hàng | Giá/thuế theo dữ liệu; trạng thái khả dụng, vòng đời riêng; không bịa số lượng còn lại hoặc ngày giao |
| Buy panel | Chọn SKU nếu cần, quantity, “Mua ngay”, “Thêm vào giỏ”, so sánh; báo giá và tư vấn tách rõ |
| Bảo hành tóm tắt | Thời hạn, đơn vị, điều kiện theo SKU và link đọc đầy đủ; không dùng chung một số tháng cho tất cả hàng |
| Thông số nhóm | Bảng nhóm Điện/Hiệu năng/Kết nối/Kích thước... tùy schema; đơn vị thống nhất, dữ liệu thiếu có nhãn |
| Tài liệu | Tên tài liệu, model/revision, ngôn ngữ, loại và dung lượng file khi có; chỉ link nguồn/file đã duyệt |
| Bảo hành chi tiết | Phạm vi, loại trừ, cách tiếp nhận, link chính sách có hiệu lực |
| Liên quan | Module đã thiết kế C12/V1.1, dữ liệu curator duyệt; không có quan hệ thì ẩn, không tự suy tương thích |

**Desktop:** gallery trái khoảng 48%, buy panel phải; phía dưới là thanh anchor và section, không buộc đọc thông số trong modal. Panel mua chỉ sticky nếu còn đủ chiều cao viewport và không che nội dung.

**Mobile:** gallery → tên/model/SKU → tóm tắt → giá/tình trạng/biến thể → mua → bảo hành tóm tắt → anchors → thông số/tài liệu/bảo hành. Bản vẽ mô tả đầy đủ toàn trang; khi mua panel đã cuộn khỏi màn hình, có thể hiện một bottom action theo DS responsive. Section thông số có heading/accordion theo nhóm, thông tin then chốt vẫn mở. Link anchor cuộn đúng vùng và không bị header che.

**Hành động mua:** Mua ngay thêm SKU hiện tại vào giỏ chung rồi tới checkout, báo nếu giỏ có món khác. Thêm giỏ cập nhật giỏ nhưng chưa giữ hàng/tạo đơn. Chọn sai/thiếu biến thể: đưa focus tới trường cần chọn; không tự dùng SKU rẻ nhất. RFQ có thể nạp một dòng SKU để người dùng xác nhận, chưa gửi tự động.

**Trạng thái:**

- Giá thay đổi sau khi xem: thông báo tại buy panel/checkout, người mua rà soát lại. Không giữ nút với giá cũ làm cam kết.
- Hết hàng/EOL/ẩn/giá hoặc tồn chưa xác minh: chặn hành động mua theo điều kiện PRD, giải thích tại panel, lối tư vấn/báo giá khi phù hợp.
- SKU query sai: yêu cầu chọn biến thể hợp lệ, không đổi im lặng sang sản phẩm khác.
- Ảnh lỗi: placeholder không làm layout nhảy; tài liệu lỗi: báo riêng và liên hệ hỗ trợ, không mất thông số.
- Mất toàn dữ liệu: trang lỗi/404 tùy nguyên nhân, không dùng dữ liệu giả để lấp.

**UX-DES05:** có đủ ảnh/tên/SKU/model/giá/hàng/thông số/bảo hành/mua/tư vấn/tài liệu/liên quan có điều kiện; mọi CTA giải thích đúng kết quả; không gắn “Tương thích” từ việc cùng nhóm hàng.

## 7. DES06 — Bảng so sánh

**Mapping:** P09 · C05 · F06. **URL:** `/so-sanh/?sku=a&sku=b` (tối đa 3 SKU).

Đầu trang: H1, nhãn cùng loại hàng, số mục, cách thêm/xóa. Bảng có cột thuộc tính + mỗi cột SKU; hàng đầu ảnh nhỏ/tên/model/giá/trạng thái/link PDP. Tiếp theo các nhóm thông số, bảo hành và tài liệu. Thuộc tính thiếu giữ chữ giải thích, không tô đỏ như lỗi của sản phẩm.

**Desktop:** 2–3 cột SKU, header bảng có thể giữ nhìn thấy khi cuộn dọc. **Mobile:** giữ cột thuộc tính rộng khoảng 104–112 px, mỗi sản phẩm tối thiểu 176–192 px trong vùng cuộn ngang có nhãn “Vuốt hoặc cuộn để xem các sản phẩm”; có cách cuộn bằng bàn phím. Cột/heading không che button; toàn body không tràn ngang. Bản vẽ mobile biểu diễn phần nhìn thấy và mép cột kế tiếp để báo còn nội dung.

Không chọn “người thắng”, không tự tính UPS runtime hoặc đánh giá tương thích. Có thể dùng nền nhẹ tại ô khác nhau nếu triển khai vẫn bảo toàn ngữ nghĩa; nút “Chỉ xem khác biệt” là tùy chọn thiết kế cần xác nhận scope trước thêm, không mặc định ở MVP.

**Trạng thái:** 0 mục hướng quay catalog; 1 mục nhắc chọn thêm; thêm mục thứ tư bị chặn với giải thích. Khác loại hỏi người dùng thay danh sách/giữ danh sách, không tự xóa. SKU đã ẩn/không còn hợp lệ báo tại cột và cho xóa, không đổ lỗi cả bảng. Lỗi tải một cột không làm mất các cột còn lại nếu hệ thống phân biệt được.

**UX-DES06:** đối chiếu đúng đơn vị và tên thuộc tính; xóa một SKU không làm mất lựa chọn còn lại; bảng usable ở 320 px bằng cuộn cục bộ và bàn phím.

## 8. DES07 — Giỏ hàng

**Mapping:** P10 · C06 · F07/F08. **URL:** `/gio-hang/`.

Mỗi dòng: ảnh nhỏ, tên/model/SKU, biến thể, giá đơn vị, quantity, thành tiền, tình trạng và xóa. Summary: số món, tạm tính, thông tin thuế nếu biết, “Phí vận chuyển xác định tại bước đặt hàng”, CTA “Tiếp tục đặt hàng”. Không ghi tổng cuối khi phí chưa có. Nhắc giỏ chưa giữ hàng bằng câu ngắn gần CTA.

**Desktop:** các dòng trái, summary phải. **Mobile:** danh sách theo khối, quantity dễ chạm, giá không bị đẩy ra ngoài; summary cuối danh sách. Link quay mua tiếp và lối “Cần báo giá theo số lượng?” tách khỏi checkout; không tự chuyển cả giỏ thành RFQ.

**Tương tác:** sửa số lượng kiểm tra định dạng rồi cập nhật; báo thay đổi thành tiền và lỗi ngay dòng. Xóa có hoàn tác nếu phù hợp ở UI, không cần modal nặng cho mọi lần xóa hàng khỏi giỏ. Chuyển checkout kiểm tra lại toàn giỏ.

**Trạng thái:** giỏ trống có CTA danh mục; SKU hết hàng/EOL/không bán đánh dấu cần xử lý, không âm thầm xóa; giá mới nêu rõ thay đổi. Lỗi mạng giữ dòng nhưng ghi chưa cập nhật; không cho đi tiếp bằng tổng cũ khi chưa xác minh điều kiện mua.

**UX-DES07:** có thể sửa/xóa bằng bàn phím; không giấu phí; không giữ hàng từ lúc thêm giỏ; lỗi một dòng chỉ rõ cách sửa.

## 9. DES08 — Checkout

**Mapping:** P11, variation receipt P12 và status P13 · C07/C08/C10/S01/S02 · F08. **URL:** `/dat-hang/`.

Checkout một trang gồm các section có đánh số, không yêu cầu tài khoản:

1. Liên hệ: họ tên, điện thoại bắt buộc; email tùy chọn.
2. Địa chỉ giao hàng theo tập dữ liệu/địa bàn được duyệt; ghi chú tùy chọn. Không cố định một cấu trúc tỉnh/huyện/xã lỗi thời trong bản thiết kế; chi tiết danh mục địa giới thuộc dữ liệu cần kiểm tra khi triển khai.
3. Xuất hóa đơn: chỉ mở trường khi khách yêu cầu, dữ liệu bắt buộc theo quy tắc doanh nghiệp đã chốt.
4. Giao hàng/phí: lựa chọn trong vùng hỗ trợ, phí/điều kiện rõ. MVP một lần giao; không có chọn chia kho/giao nhiều đợt.
5. Thanh toán: radio COD hoặc chuyển khoản thủ công, chỉ các phương thức hợp lệ với đơn/địa chỉ. Chưa có gateway, upload biên lai hoặc nút “Tôi đã thanh toán” tự xác nhận tiền.
6. Rà soát: toàn bộ SKU/số lượng, liên hệ/địa chỉ, phương thức, thuế/phí/tổng cuối; link chỉnh sửa. Nếu Mua ngay dẫn tới giỏ có các món cũ, hiện thông báo và đầy đủ các món.
7. Chính sách/điều kiện giao dịch với liên kết đọc; CTA “Đặt hàng”. Cách ghi nhận đồng ý cần bám nội dung đã duyệt; không tick sẵn marketing hoặc bắt nhận quảng cáo.

**Desktop:** form khoảng 2/3, summary 1/3; nút đặt trong summary sau tổng và điều kiện. **Mobile:** form một cột; tóm tắt giỏ ban đầu có thể thu gọn nhưng phần tổng cuối và nút đặt luôn nằm sau các trường; không yêu cầu người dùng tìm lỗi phía trên thanh CTA che màn hình.

**Trạng thái giao dịch:**

| Tình huống | UI và hành động |
|---|---|
| Sai/thiếu trường | Summary lỗi + lỗi gần field; giữ toàn dữ liệu hợp lệ |
| Không xác định được phí/ngoài vùng | Giải thích tại giao hàng, không lấy 0; sửa địa chỉ hoặc tự chọn RFQ/liên hệ |
| Giá/tồn/điều kiện đổi | Đánh dấu dòng, hiển thị tổng mới nếu đủ dữ liệu; yêu cầu rà soát và gửi lại chủ động |
| Đang gửi | Nhãn đang xử lý, giữ layout, không điều hướng sang receipt khi chưa có kết quả |
| Mất mạng/timeout chưa biết kết quả | “Chưa xác nhận được kết quả. Đang kiểm tra lại…”; retry/khôi phục cùng thao tác theo S01, không mời đặt đơn mới ngay |
| Xác nhận tạo đơn thành công | Sang P12 với ngữ cảnh hợp lệ; mã đơn, trạng thái tiếp nhận, tổng/phương thức, hướng theo dõi riêng |
| Chuyển khoản | Chỉ P12/trang quyền hợp lệ hiển thị tài khoản, nội dung, số tiền, hạn từ dữ liệu đã duyệt; trạng thái chờ đối soát |
| Hết hạn giữ hàng/tiền đến muộn | Hiển thị trạng thái cần xử lý đã xác nhận, liên hệ hỗ trợ; không tự hứa còn hàng/hoàn tiền tức thì |

P12 không phải “thanh toán thành công” mặc định. P13 chỉ mở khi có quyền xem riêng, che dữ liệu cá nhân cần thiết; mã đơn hoặc điện thoại riêng lẻ không đủ. Mở URL receipt trống ngữ cảnh hiển thị hướng quay về/khôi phục phù hợp, không dựng mã đơn giả. Cơ chế quyền/token không được quyết định trong bản UI này.

**UX-DES08:** không tạo đơn/giữ hàng từ nút xem tổng; tạo đơn và giữ hàng nguyên vẹn khi hệ thống chấp nhận; submit lặp không tạo đơn trùng; khách thấy tổng hợp lệ trước submit; không biến RFQ thành đơn hoặc chuyển khoản thành đã trả.

## 10. DES09 — Yêu cầu báo giá

**Mapping:** P14/P15 · C09/A09 · F09. **URL:** `/bao-gia/`.

H1 “Yêu cầu báo giá”; mô tả “Gửi nhu cầu để được tư vấn và báo giá. Yêu cầu này chưa phải đơn hàng và chưa giữ hàng.” Đây là nội dung nghiệp vụ hữu ích, không là ghi chú kỹ thuật.

Nội dung:

- Tên người liên hệ; ít nhất một kênh điện thoại/email có thể dùng; công ty tùy chọn.
- Dòng SKU/model và số lượng khi đã biết sản phẩm; có thêm/xóa dòng rõ ràng. SKU chuyển từ PDP cần được người gửi kiểm tra.
- Nội dung nhu cầu bắt buộc; cho phép bài toán chưa có model, không ép nhập SKU giả.
- Nơi giao và thời điểm cần tùy chọn; không tự cam kết SLA phản hồi hoặc giao hàng.
- Thông tin bảo mật/liên hệ đúng phạm vi; CTA “Gửi yêu cầu báo giá”. Không yêu cầu đăng ký, mã số thuế hoặc upload tài liệu ở MVP.

**Desktop:** form ở trái, panel phải trình bày ba bước tiếp nhận → trao đổi → gửi báo giá đã duyệt. **Mobile:** giải thích ngắn trước form, panel quy trình thành đoạn gọn sau form; dòng SKU là card thay vì bảng nhiều cột.

**Trạng thái:** lỗi tên/kênh liên hệ/nhu cầu đặt tại field và summary; SKU không hợp lệ báo dòng nhưng vẫn cho mô tả nhu cầu thay thế; số lượng phải hợp lệ nếu có dòng. Anti-spam/rate limit cần báo cách chờ/thử lại, không mất form. Mạng timeout xử lý không tạo yêu cầu trùng theo S01. Thành công sang P15 hiển thị mã tiếp nhận và kênh liên hệ đã che phù hợp; không hiển thị giá cuối hoặc hứa thời gian chưa được duyệt.

Không có portal để khách bấm chấp thuận báo giá ở MVP. Nhân viên ghi nhận trao đổi/chấp thuận theo A09; phiên bản báo giá đã gửi bất biến, chuyển đơn phải xác nhận giá/tồn/điều kiện lại.

**UX-DES09:** người chưa có model vẫn gửi được nhu cầu; RFQ và checkout có tên, trường, CTA và kết quả riêng; không giữ hàng hoặc ghi doanh thu lúc gửi yêu cầu.

## 11. DES10 — Nội dung/bảo hành

**Mapping:** P16–P26, nhấn P18 · C11 · F11. **URL chính:** `/chinh-sach/bao-hanh/`.

Template gồm breadcrumb, tiêu đề, thời điểm hiệu lực/cập nhật nếu có căn cứ, mục lục, nội dung có heading, link sang PDP/tài liệu theo model và đầu mối hỗ trợ đã duyệt. Nội dung mẫu trong wireframe chỉ biểu diễn cấu trúc, chưa phải chính sách pháp lý hoặc cam kết thương mại.

Trang bảo hành cần có: phạm vi và đối tượng, cách xác định theo SKU/model, thời hạn/điều kiện, trường hợp loại trừ, thông tin cần chuẩn bị, các bước liên hệ/tiếp nhận, chi phí/trách nhiệm và đầu mối khi doanh nghiệp đã chốt. Không dùng nội dung của XTREND làm chính sách website mới.

**Desktop:** mục lục trái khoảng 240 px, nội dung phải tối đa khoảng 720–800 px; panel liên hệ cuối. **Mobile:** mục lục thu gọn ở đầu, nội dung một cột, bảng dài thành hàng rõ hoặc cuộn cục bộ, không PDF-only cho chính sách cần đọc.

Variation:

- P16/P26: index các hướng dẫn/chính sách, nhóm link có mô tả.
- P17: tìm model rồi dẫn tới tài liệu tại PDP; không có CMS bài viết hoặc tra serial mới.
- P19–P23: cùng template nhưng heading/nội dung riêng đúng đổi trả/giao hàng/thanh toán/quyền riêng tư/điều kiện giao dịch.
- P24: thông tin liên hệ và điều hướng bán lẻ/báo giá/sau bán, không thêm form lead trùng.
- P25: giới thiệu doanh nghiệp mới bằng dữ liệu được xác nhận, không lấy thành tích/quyền phân phối nguồn tham khảo.

**Trạng thái:** nội dung chưa được phê duyệt không xuất bản như chính sách có hiệu lực; lỗi tải có retry/đầu mối hỗ trợ đã được duyệt. Link tài liệu mất hiển thị lỗi có cách liên hệ; mục lục hoạt động với bàn phím và anchor không bị che.

**UX-DES10:** người mua phân biệt chính sách chung với điều kiện riêng của SKU; tìm được bước liên hệ tiếp theo; không có tài liệu giả hoặc nội dung chưa duyệt gắn ngày hiệu lực tự tạo.

## 12. DES11 — Admin Dashboard

**Mapping:** U03 và shell U01–U24 · A10/S02/S06 · F10A/F10B/F10C. **URL:** `/quan-tri/`.

Mục tiêu chính là hàng chờ cần xử lý, sau đó mới đến chỉ số. Không dùng biểu đồ trang trí thiếu dữ liệu.

1. Header: tên khu vực, tài khoản/vai trò, ngày/khoảng thời gian, thời điểm dữ liệu được cập nhật; trạng thái đang làm mới/lỗi rõ.
2. KPI vận hành có định nghĩa: đơn cần xử lý, RFQ cần phản hồi, thanh toán cần đối soát, vấn đề tồn. Nguồn phải phân biệt số bản ghi với doanh thu.
3. Hàng chờ đơn: mã, thời điểm, trạng thái đơn, trạng thái tiền, người phụ trách nếu có, mở chi tiết; không đưa dữ liệu cá nhân đầy đủ vào bảng tổng quan.
4. Hàng chờ báo giá: mã yêu cầu, thời điểm, trạng thái, người xử lý, thao tác mở. Không gọi tổng giá trị báo giá là doanh thu.
5. Cảnh báo vận hành: SKU thiếu dữ liệu/giá, vấn đề tồn, đơn quá hạn xử lý theo cấu hình được duyệt. Chỉ liệt kê loại cảnh báo có dữ liệu/rule đáng tin cậy.
6. Chỉ số tài chính/chuyển đổi nếu có quyền và nguồn tin cậy. Traffic/CR/AOV không có dữ liệu thì hiển thị “Chưa có dữ liệu”, không vẽ trend giả hoặc 0 gây hiểu nhầm.

**Desktop:** sidebar 224 px; KPI 4 cột khi đủ chiều rộng; hàng chờ đơn chiếm vùng chính, RFQ/bất thường là vùng thứ hai. **Mobile:** drawer thay sidebar; KPI 1–2 cột; hàng chờ dạng card với trường trọng yếu, mở chi tiết để xử lý. Không ép bảng 10 cột vào màn hình nhỏ; nếu cần bảng thật thì cuộn riêng có chỉ báo.

**Quyền:** người không có quyền dashboard/tài chính được đưa tới khu tác nghiệp được phép, không chỉ giấu số trên cùng trang; 403 không lộ dữ liệu. Dashboard không là nơi tự đổi trạng thái tiền chỉ bằng một click. Hành động nhạy cảm dẫn tới chi tiết có context/xác nhận/quyền phù hợp.

**Trạng thái:** skeleton từng widget; 0 thật ghi “Không có đơn cần xử lý”; lỗi/không thu thập dữ liệu ghi khác 0. Hết phiên thông báo và về login theo quy tắc; không để dữ liệu nhạy cảm của phiên trước trên màn hình dùng chung. Refresh không xóa lựa chọn khoảng thời gian/focus vô cớ.

**UX-DES11:** phân biệt đơn/tiền/giao hàng/báo giá; số KPI có khoảng thời gian/định nghĩa/nguồn; RFQ không giữ hàng/ghi doanh thu; hành động theo quyền.

## 13. Các template phụ kế thừa, không bỏ sót sitemap

11 bản vẽ là các màn hình chính được yêu cầu, không thay thế đặc tả 26 trang khách/24 trang admin trong SITEMAP. Các biến thể sau dùng design system chung; chưa có bản vẽ riêng cho mỗi URL.

| Trang | Template/component và yêu cầu bổ sung |
|---|---|
| P02/P05 | Index danh mục/thương hiệu, liên kết có tên rõ và empty state |
| P04 | ProductCollection từ DES02, chỉ filter chung trước khi chọn ngành |
| P12/P15 | ReceiptPanel: mã tiếp nhận thực, nội dung bước tiếp theo, không giả xác nhận thanh toán |
| P13 | OrderTimeline: quyền riêng, dữ liệu che; phân biệt đơn/tiền/giao/hạn giữ hàng |
| U01/U02 | Form đăng nhập/khôi phục, quản lý focus, password manager/paste, không lộ account enumeration |
| U04–U12 | AdminDataTable + editor; publish khác save draft; review giá/thuế/tồn; lỗi field giữ dữ liệu |
| U13/U14 | Danh sách/chi tiết đơn; timeline; các trạng thái độc lập; hành động quyền hợp lệ và phản hồi xung đột |
| U15–U18 | RFQ/báo giá phiên bản; bản đã gửi chỉ đọc, sửa tạo phiên bản; print preview không thêm gửi email tự động |
| U19/U20 | Đối soát/hoàn tiền/sau bán: số tiền, bằng chứng và xác nhận có context; không đánh dấu đã trả từ biên lai khách |
| U21–U24 | Nội dung cơ bản/nhân sự/cấu hình/audit theo quyền; audit không có nút sửa lịch sử |
| X01–X03 | Not found/permission/system errors theo sitemap; thông báo có lối đi, không tiết lộ stack trace hoặc dữ liệu riêng |

Admin form rời trang khi có chỉnh sửa chưa lưu cần cảnh báo; lưu xung đột không ghi đè âm thầm. Điều chỉnh tồn là thao tác có lý do/lịch sử, không đổi trực tiếp bằng cell không kiểm soát. Chuyển báo giá thành đơn có bước rà soát lại; double submit mở lại cùng đơn khi hệ thống đã tạo.

## 14. Ma trận trạng thái xuyên suốt

| State ID | Phạm vi | Thiết kế |
|---|---|---|
| ST01 Loading | Tất cả khu vực có dữ liệu | Skeleton theo kích thước; aria-busy khi triển khai; reduced motion; có lỗi/retry khi tải thất bại |
| ST02 Empty | Danh sách/giỏ/dashboard | Giải thích chưa có dữ liệu hoặc 0 thật, CTA phù hợp; không nhầm với lỗi |
| ST03 No result | Search/filter | Giữ từ khóa/filter; sửa/xóa điều kiện; không tự thay bộ lọc |
| ST04 Error | Toàn trang/khối | Thông báo người dùng hiểu, retry/cách đi tiếp; không show stack/internal IDs |
| ST05 Field error | Form | Summary + message tại field + focus/link tới field; giữ input |
| ST06 Submitting/unknown | Checkout/RFQ/admin write | Phân biệt đang gửi và chưa biết kết quả; kiểm tra lại/idempotency; chưa thông báo thất bại/thành công sai |
| ST07 Success | Cart/receipt/save | Chỉ sau phản hồi xác nhận; mã/ngữ cảnh thật; vị trí phù hợp với tác động |
| ST08 Conflict/stale | Giá/tồn/quote/admin edit | Hiện phần thay đổi, yêu cầu rà soát lại, không ghi đè hoặc mua giá cũ |
| ST09 Access/session | Private/admin | Không hiển thị dữ liệu trước kiểm tra quyền; hướng đăng nhập/hỗ trợ thích hợp |
| ST10 Unavailable/EOL | Catalog/PDP/cart | Nhãn rõ; CTA mua không hoạt động; tư vấn/tài liệu khi phù hợp |

Các trạng thái này là đặc tả cho triển khai và QA; bộ PNG mặc định không phải prototype mô phỏng tất cả các trạng thái.
