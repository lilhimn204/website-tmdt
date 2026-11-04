# Component inventory — hợp đồng thiết kế

Giai đoạn 04 · Đề xuất React + Tailwind CSS · **Không phải code, API hoặc lựa chọn thư viện đã cài đặt**. Tên dưới đây giúp chia trách nhiệm UI; cấu trúc kỹ thuật và thư viện primitives sẽ được quyết định ở giai đoạn phù hợp.

Tham chiếu [design system](../DESIGN.md), [đặc tả trang](PAGE_SPECIFICATIONS.md) và [PRD](../PRD.md). “Sự kiện” là ý định của người dùng; không hàm ý mutation đã thành công. Giá/tồn/quyền/trạng thái tiền phải được hệ thống xác nhận.

## 1. Quy tắc tái sử dụng

- Một nguồn token ngữ nghĩa cho màu, chữ, spacing, radius, focus; mapping sang Tailwind ở bước frontend. Không rải giá trị màu khác nhau theo từng trang.
- Tách primitive (button/field), component miền nghiệp vụ (PriceBlock/BuyPanel), template (ProductCollection/CheckoutLayout). Không tạo một component khổng lồ quyết định mọi quy tắc kinh doanh.
- Responsive thay bố cục theo không gian, giữ dữ liệu/thứ tự đọc/hành động; không duy trì hai bản logic mobile và desktop độc lập.
- Có trạng thái controlled rõ khi cần: filter đang sửa khác filter đã áp dụng; quantity người dùng nhập khác số lượng được hệ thống chấp nhận; gửi yêu cầu khác đã nhận thành công.
- Hiển thị text theo tiếng Việt, định dạng giá VND và đơn vị theo dữ liệu; không biến null thành 0/“Không hỗ trợ”.
- Mọi control có tên truy cập, focus, trạng thái và phản hồi. Phần tử điều hướng dùng link; thao tác tại chỗ dùng button. Không lồng button vào link phủ card.
- Chỉ thêm package sau khi kiểm tra phù hợp stack/phiên bản/giấy phép và phạm vi. Chưa chọn UI kit, icon package hoặc phiên bản Tailwind trong tài liệu này.

## 2. Primitive và layout

| ID / Component | Đầu vào thiết kế | Ý định/sự kiện | States và điều kiện |
|---|---|---|---|
| CMP01 Button / IconButton | Nhãn, kiểu primary/secondary/link/destructive, kích thước, lý do disabled | Bấm hành động được đặt tên | Default/hover/pressed/focus/disabled/loading; không đổi chiều rộng khi tải |
| CMP02 TextField / TextArea | Label, giá trị, helper, required, error, kiểu dữ liệu | Nhập/blur/submit form | Error nối nhãn; input 16 px mobile; không thay nhãn bằng placeholder |
| CMP03 Checkbox / RadioGroup | Nhãn, lựa chọn, mô tả/điều kiện | Chọn/bỏ; chọn phương thức | Vùng nhãn bấm được; trạng thái selected không chỉ đổi màu |
| CMP04 Select / QuantityControl | Giá trị/options/min/max theo dữ liệu, bước, nhãn SKU | Chọn hoặc đổi số | Nhập tay + tăng/giảm; không ép giá trị sai im lặng |
| CMP05 StatusBadge / InlineNotice | Loại trạng thái, chữ, mô tả/hành động | Retry/xem chi tiết nếu có | Chữ + biểu tượng khi cần; phân biệt unknown/0/EOL/unavailable |
| CMP06 Dialog / Drawer | Tiêu đề, nội dung, hành động, dirty state | Mở/đóng/xác nhận/hủy | Focus trong lớp mở, Escape khi an toàn, trả focus; không chồng modal tùy tiện |
| CMP07 Accordion / SectionNav | Heading/id, expanded, nội dung | Mở/đóng/đi tới section | Button có trạng thái mở; anchor và heading không bị sticky che |
| CMP08 Loading / Empty / Error | Ngữ cảnh, lý do, hướng tiếp tục | Retry/reset/navigate | Có kích thước ổn định; lỗi không giả empty; không spinner vô hạn không giải thích |
| CMP09 Toast / ErrorSummary | Nội dung, mức ưu tiên, liên kết hành động/trường | Undo/focus field | Toast không thay lỗi giao dịch inline; không tự biến mất thông tin bắt buộc |
| CMP10 Breadcrumb / Pagination | Cấu trúc trang/URL đã chuẩn hóa, trang hiện tại | Điều hướng | Có tên vùng, current state, URL thật; không reset filter |
| CMP11 StorefrontShell | Nhận diện, menu đã duyệt, cart count | Tìm kiếm/menu/giỏ/RFQ | Drawer mobile; header không chiếm quá nhiều viewport; skip link |
| CMP12 AdminShell | Người dùng/quyền, menu cho phép, trạng thái phiên | Điều hướng/đăng xuất | Loading quyền/403/session; không xem quyền ẩn menu là bảo mật |

## 3. Catalog và mua hàng

| ID / Component | Dữ liệu đầu vào | Ý định/sự kiện | States/điều kiện | Trang |
|---|---|---|---|---|
| CMP13 SearchForm | Query, trạng thái submit | Tìm; sửa query | Rỗng/loading/error; không yêu cầu autocomplete MVP | DES01–04 |
| CMP14 FilterPanel / AppliedFilters | Schema ngành, values tạm/đã áp dụng, số kết quả đáng tin cậy | Sửa/áp dụng/hủy/xóa filter | Drawer mobile; thiếu schema; lỗi query; reset có chủ đích | DES02–04 |
| CMP15 ProductCard | Tên/ảnh/brand/model/SKU/attrs/giá/trạng thái hợp lệ | Mở PDP; chọn so sánh | Placeholder ảnh, nhiều biến thể, quote-only/EOL; không link lồng button | DES01–04/05 |
| CMP16 ProductCollection | Danh sách + pagination + sort/filter context | Đổi trang/sort | Loading/empty/no-result/partial-error | DES01–04 |
| CMP17 PriceBlock | Tiền tệ, giá/thuế đã duyệt, điều kiện/báo giá | Đi RFQ nếu cần | Unknown không là 0; không tự hiển thị giảm giá/giá gạch | DES02–09 |
| CMP18 AvailabilityStatus | Khả dụng, lifecycle, thời điểm/điều kiện xác nhận nếu có | Xem điều kiện/tư vấn | Tồn riêng EOL; không dự đoán ngày giao | DES02–09 |
| CMP19 ProductGallery | Assets đã duyệt, alt, thứ tự | Đổi ảnh/phóng to/đóng | Thiếu/lỗi ảnh; keyboard; không dùng ảnh AI như ảnh hàng thật | DES05 |
| CMP20 SKUSelector | SKU hợp lệ, thuộc tính biến thể, SKU đang chọn | Chọn SKU | Thiếu/sai/không bán; cập nhật đúng thông số/giá/bảo hành | DES05 |
| CMP21 BuyPanel | SKU, quantity, điều kiện mua, tình trạng giỏ và dữ liệu xác nhận | Thêm giỏ/mua ngay/RFQ/tư vấn | Pending/invalid/unavailable; mua ngay vẫn giữ món cũ | DES05 |
| CMP22 SpecTable | Nhóm, label, value, unit, metadata kỹ thuật | Mở nhóm/link tài liệu | Thiếu/không áp dụng/không hỗ trợ phân biệt; semantic table hoặc description list phù hợp | DES05/06 |
| CMP23 WarrantySummary / PolicyLink | Điều kiện SKU, thời hạn, bên chịu trách nhiệm, chính sách | Đọc chi tiết/liên hệ | Chưa xác minh không biến thành cam kết | DES05/10 |
| CMP24 DocumentList | Tên/model/revision/ngôn ngữ/type/size/nguồn hợp lệ | Mở/tải tài liệu | Không có/lỗi/không được phép; cảnh báo định dạng mở ngoài khi cần | DES05/10 |
| CMP25 RelatedProducts | Quan hệ đã duyệt, loại cùng nhóm/phụ kiện/tương thích, danh sách SKU | Xem sản phẩm | **C12/V1.1**, ẩn nếu thiếu; không suy tương thích | DES05 |
| CMP26 CompareTray / CompareTable | 2–3 SKU cùng loại, schema chung, selection | Thêm/xóa/xem PDP | 0/1/>3/khác loại/ẩn/lỗi cột; cuộn cục bộ mobile | DES02–06 |
| CMP27 CartLine / CartList | SKU/quantity/giá/trạng thái mới xác nhận | Đổi số/xóa/undo nếu có | Dirty/pending/conflict/unavailable; không âm thầm bỏ dòng | DES07/08 |
| CMP28 OrderSummary | Dòng hàng, thuế/phí/tổng, mức độ xác nhận, phương thức | Chỉnh giỏ/đặt | Tạm tính khác tổng cuối; thiếu phí chặn submit hợp lệ | DES07/08 |
| CMP29 CheckoutForm | Form liên hệ/địa chỉ/hóa đơn, phương thức/điều kiện hợp lệ | Sửa/rà soát/gửi | Field error/network/unknown/conflict; không tự tạo tài khoản | DES08 |
| CMP30 PaymentMethodChoice / BankInstructions | Phương thức đủ điều kiện; hướng dẫn nhận tiền được duyệt trong ngữ cảnh riêng | Chọn/sao chép nội dung chuyển khoản | Chờ đối soát; không tự xác nhận tiền từ ý định khách | DES08/P12 |
| CMP31 ReceiptPanel / OrderTimeline | Kết quả xác nhận, mã/ngữ cảnh/quyền, các trạng thái độc lập | Xem đơn/liên hệ | Context missing/expired/unauthorized; PII che; không tạo success giả | P12/P13/P15 |
| CMP32 RFQForm / RFQLineEditor | Nhu cầu, tên/kênh liên hệ, SKU và số lượng tùy trường hợp | Thêm/xóa dòng/gửi | Không model vẫn được; no-upload; retry không nhân bản yêu cầu | DES09 |
| CMP33 ContentLayout / PolicyTOC | Nội dung đã duyệt, headings, hiệu lực, liên kết | Anchor/liên hệ | Draft không công bố; mục lục mobile; nội dung rộng vừa đọc | DES10 |

## 4. Quản trị

| ID / Component | Dữ liệu và hành động | Điều kiện quan trọng |
|---|---|---|
| CMP34 MetricTile | Nhãn, giá trị/đơn vị, khoảng thời gian, nguồn/thời điểm, quyền; mở hàng chờ liên quan | Unknown/error khác 0; không lấy RFQ/báo giá làm doanh thu |
| CMP35 AdminDataTable / WorkQueue | Cột theo nghiệp vụ, rows, filter/sort/page, row action được phép | Keyboard, empty/error; mobile list hoặc cuộn cục bộ; không lộ PII quá mức |
| CMP36 AdminEditor / PublishReview | Field schema, bản nháp, kết quả validation, trạng thái lưu/xuất bản | Save draft khác publish; cảnh báo rời khi chưa lưu; xung đột không ghi đè |
| CMP37 OrderDetail / ActionReview | Đơn/tiền/giao hàng, hành động cho phép, lý do/bằng chứng | Xác nhận theo tác động; giữ context; hủy/hoàn không đổi sai tồn |
| CMP38 QuoteVersionView / ConversionReview | Phiên bản/hiệu lực/chấp thuận, giá/tồn/điều kiện kiểm tra lại | Bản gửi chỉ đọc; sửa tạo bản mới; một quote→một order; retry không nhân đôi |
| CMP39 AuditTimeline | Sự kiện, thời gian, tác nhân, thay đổi được phép xem | Chỉ đọc; ẩn dữ liệu nhạy cảm không cần thiết; không có nút sửa log |

## 5. Quyền sở hữu state và ranh giới

| Loại state | Nơi quản lý theo thiết kế | Không được làm |
|---|---|---|
| Menu/dialog đang mở, ảnh đang xem | UI cục bộ | Dùng như bằng chứng quyền hoặc giao dịch |
| Filter/sort/page, query, selection so sánh | Trạng thái điều hướng theo SITEMAP | Ghi PII/token quyền riêng vào URL công khai/analytics |
| Draft form, quantity đang sửa | Form/session theo kiến trúc sẽ chốt | Lưu PII lâu dài mặc định hoặc giả submit thành công |
| Catalog, giá, tồn, quyền, order/payment/RFQ | Dữ liệu có thẩm quyền do hệ thống xác nhận | Suy kết quả từ màu nút, URL hoặc local storage |
| Quote versions / audit | Bản ghi được quản lý nghiệp vụ | Đổi bản đã gửi hoặc sửa lịch sử trên UI |

## 6. Rà soát trước khi viết component ở Giai đoạn 07

- Duyệt hướng A và token; chốt dữ liệu/rule còn mở ở đúng giai đoạn.
- Chọn primitives accessible phù hợp React/Vite/Tailwind; kiểm chứng phiên bản tại thời điểm triển khai.
- Xác định semantics/keyboard/focus trước lớp trang trí; chuẩn bị biến thể loading/empty/error/unknown cùng component chính.
- Không dựng bản desktop trước rồi thu nhỏ; triển khai thứ tự mobile như đặc tả.
- Component contract không phải API contract; schema/auth/idempotency cần Giai đoạn 05. Không thay đổi backend scope để hợp một mẫu UI.
