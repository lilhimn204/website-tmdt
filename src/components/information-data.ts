export interface InformationSection { id: string; title: string; text: string; links?: readonly { label: string; to: string }[] }
export interface InformationPageData { path: string; title: string; intro: string; pending: boolean; sections: readonly InformationSection[] }
const catalogLink = { label: 'Tìm model hoặc SKU', to: '/san-pham/' };
const contactLink = { label: 'Thông tin liên hệ', to: '/lien-he/' };
export const informationPages: readonly InformationPageData[] = [
  { path: '/ho-tro/', title: 'Hỗ trợ khách hàng', pending: false, intro: 'Tìm thông tin đúng sản phẩm và chọn hướng hỗ trợ phù hợp.', sections: [
    { id: 'tai-lieu', title: 'Tài liệu theo model', text: 'Đối chiếu model và SKU, sau đó xem mục Tài liệu trên trang chi tiết. Bộ DEMO chỉ có ghi chú minh họa, không dùng để lắp đặt hoặc vận hành thiết bị thật.', links: [{ label: 'Hướng dẫn tìm tài liệu', to: '/ho-tro/huong-dan-su-dung/' }, catalogLink] },
    { id: 'sau-ban', title: 'Bảo hành và sau bán', text: 'Thông tin bảo hành, đổi trả và đầu mối tiếp nhận chính thức chưa được công bố. Không gửi thiết bị hoặc chuyển khoản dựa trên dữ liệu mẫu.', links: [{ label: 'Thông tin bảo hành', to: '/chinh-sach/bao-hanh/' }, contactLink] },
    { id: 'nhu-cau', title: 'Tư vấn trước khi mua', text: 'Bạn có thể chuẩn bị model, số lượng hoặc mô tả bài toán trong form báo giá thử nghiệm. Kênh gửi yêu cầu thật chưa mở.', links: [{ label: 'Chuẩn bị yêu cầu báo giá', to: '/bao-gia/' }] },
  ] },
  { path: '/ho-tro/huong-dan-su-dung/', title: 'Hướng dẫn tìm tài liệu sản phẩm', pending: false, intro: 'Tìm đúng model trước khi đọc tài liệu. Không dùng thông số của sản phẩm gần giống để thay thế.', sections: [
    { id: 'tim-model', title: '1. Xác định model và SKU', text: 'Đối chiếu tên và model trên nhãn thiết bị hoặc chứng từ. Dùng ô tìm kiếm, rồi chọn đúng biến thể trên trang sản phẩm.', links: [catalogLink] },
    { id: 'doc-tai-lieu', title: '2. Mở mục Tài liệu', text: 'Tại trang chi tiết, chọn mục Tài liệu để xem tệp được gắn với sản phẩm. Ghi chú DEMO hiện tại không phải datasheet, hướng dẫn điện hoặc hướng dẫn lắp đặt.' },
    { id: 'thieu-tai-lieu', title: '3. Khi thiếu tài liệu', text: 'Không suy cấu hình hoặc cách sử dụng từ ảnh minh họa. Chuẩn bị model và phiên bản thiết bị để hỏi qua đầu mối chính thức khi được công bố.', links: [contactLink] },
  ] },
  { path: '/lien-he/', title: 'Liên hệ', pending: true, intro: 'Tên pháp nhân, địa chỉ, số điện thoại, email và giờ phục vụ chính thức chưa được công bố.', sections: [
    { id: 'mua-le', title: 'Tìm sản phẩm', text: 'Catalog hiện dùng sản phẩm và giá giả định để thử giao diện. Chưa nhận thanh toán hoặc đơn hàng.', links: [catalogLink] },
    { id: 'bao-gia', title: 'Nhu cầu doanh nghiệp', text: 'Chuẩn bị model, số lượng hoặc mô tả nhu cầu trong form báo giá. Form hiện chỉ giúp rà soát nội dung, chưa gửi cho nhân viên.', links: [{ label: 'Mở form báo giá thử nghiệm', to: '/bao-gia/' }] },
    { id: 'bao-hanh', title: 'Hỗ trợ sau bán', text: 'Đầu mối tiếp nhận, thời gian và quy trình xử lý đang chờ công bố. Không có số điện thoại, email hoặc địa chỉ mẫu để gửi thiết bị.', links: [{ label: 'Xem thông tin hỗ trợ', to: '/ho-tro/' }] },
  ] },
  { path: '/gioi-thieu/', title: 'Giới thiệu website', pending: true, intro: 'Website TMĐT là tên tạm cho bản thử nghiệm cửa hàng thiết bị công nghệ. Thông tin doanh nghiệp và nhận diện chính thức chưa được công bố.', sections: [
    { id: 'pham-vi', title: 'Phạm vi bản xem trước', text: 'Giao diện giúp thử tìm kiếm theo model, lọc thông số, so sánh SKU, giỏ hàng và chuẩn bị nhu cầu mua lẻ hoặc doanh nghiệp.', links: [catalogLink] },
    { id: 'du-lieu', title: 'Dữ liệu có nhãn DEMO', text: 'Sản phẩm, giá, số lượng và bảo hành mẫu không đại diện hàng đang bán. Tên hãng tham khảo trong kế hoạch không xác nhận quan hệ đối tác hoặc quyền phân phối.' },
    { id: 'thong-tin', title: 'Thông tin chính thức', text: 'Chưa công bố pháp nhân, thành tích kinh doanh, chứng nhận, địa chỉ hoặc cam kết dịch vụ. Website mới độc lập với nguồn tham khảo.', links: [contactLink] },
  ] },
  { path: '/chinh-sach/bao-hanh/', title: 'Chính sách bảo hành', pending: true, intro: 'Chính sách bảo hành chính thức chưa được công bố. Các số tháng có nhãn DEMO trên sản phẩm chỉ phục vụ thử giao diện.', sections: [
    { id: 'theo-sku', title: 'Thông tin theo model và SKU', text: 'Bảo hành cần được xác nhận cho đúng sản phẩm và biến thể. Không coi một số tháng mẫu là thời hạn chung của hãng hoặc của mọi sản phẩm.', links: [catalogLink] },
    { id: 'dieu-kien', title: 'Điều kiện và tiếp nhận', text: 'Phạm vi, điều kiện, trường hợp loại trừ, chứng từ, chi phí và nơi tiếp nhận đang chờ doanh nghiệp công bố. Chưa có ngày hiệu lực.' },
    { id: 'tro-giup', title: 'Trao đổi về bảo hành', text: 'Đối chiếu SKU và chứng từ trước khi trao đổi qua đầu mối chính thức. Bản xem trước chưa nhận thiết bị bảo hành.', links: [contactLink] },
  ] },
  { path: '/chinh-sach/doi-tra/', title: 'Kiểm hàng và đổi trả', pending: true, intro: 'Điều kiện kiểm hàng và đổi trả chưa được công bố; chưa có cam kết áp dụng cho giao dịch.', sections: [
    { id: 'kiem-hang', title: 'Kiểm tra khi nhận', text: 'Hướng dẫn kiểm hàng, cách ghi nhận tình trạng và chứng từ cần thiết đang chờ xác nhận.' },
    { id: 'doi-tra', title: 'Điều kiện đổi hoặc trả', text: 'Thời hạn, phạm vi, chi phí và phương thức xử lý chưa được công bố. Trang này không chấp thuận đổi, trả hoặc hoàn tiền tự động.' },
    { id: 'lien-he', title: 'Đầu mối xử lý', text: 'Chưa có kênh tiếp nhận chính thức. Không gửi thiết bị tới địa chỉ của nguồn tham khảo.', links: [contactLink] },
  ] },
  { path: '/chinh-sach/van-chuyen/', title: 'Giao hàng và vận chuyển', pending: true, intro: 'Vùng phục vụ, phí vận chuyển và thời gian giao hàng chưa được công bố.', sections: [
    { id: 'dia-ban', title: 'Địa bàn và điều kiện giao', text: 'Chưa xác nhận khu vực phục vụ hoặc điều kiện giao thiết bị nặng, cồng kềnh hay cần lắp đặt.' },
    { id: 'phi', title: 'Phí và thời gian', text: 'Phí chưa biết không được coi là 0 đồng. Bản thử không cam kết miễn phí vận chuyển hoặc thời gian giao dự kiến.' },
    { id: 'nhu-cau', title: 'Nhu cầu triển khai riêng', text: 'Có thể chuẩn bị địa điểm, số lượng và thời điểm cần trong bản nháp báo giá; kênh tiếp nhận thật chưa mở.', links: [{ label: 'Chuẩn bị nhu cầu', to: '/bao-gia/' }] },
  ] },
  { path: '/chinh-sach/thanh-toan/', title: 'Phương thức thanh toán', pending: true, intro: 'COD và chuyển khoản thủ công hiện chỉ là lựa chọn thử trên form, chưa được mở cho giao dịch.', sections: [
    { id: 'cod', title: 'COD', text: 'Điều kiện về địa bàn, loại hàng và giá trị đơn chưa được xác nhận. Chọn COD trong bản nháp không tạo đơn hoặc xác nhận có thể giao.' },
    { id: 'chuyen-khoan', title: 'Chuyển khoản', text: 'Chưa công bố tài khoản ngân hàng, mã QR, nội dung chuyển tiền hoặc thời hạn thanh toán. Không chuyển tiền dựa trên nội dung minh họa.' },
    { id: 'xac-nhan', title: 'Xác nhận thanh toán', text: 'Bản xem trước không nhận hoặc đối soát tiền và không phát hành trạng thái đã thanh toán.', links: [contactLink] },
  ] },
  { path: '/chinh-sach/bao-mat/', title: 'Bảo vệ thông tin', pending: true, intro: 'Chính sách bảo vệ thông tin chính thức đang chờ phê duyệt. Dưới đây chỉ mô tả cách hoạt động của bản thử hiện tại.', sections: [
    { id: 'form', title: 'Thông tin trong form thử', text: 'Ứng dụng giữ nội dung checkout và báo giá trong trang đang mở để bạn rà soát. Ứng dụng không gửi các form này lên máy chủ hoặc lưu vào localStorage; rời hay tải lại trang sẽ mất phần nhập. Nên dùng thông tin mẫu.' },
    { id: 'gio', title: 'Giỏ hàng trên thiết bị', text: 'Giỏ DEMO lưu mã SKU và số lượng trên trình duyệt. Không lưu tên, điện thoại, email, địa chỉ hoặc giá trong bản lưu giỏ. Có thể xóa các dòng ở trang giỏ; trình duyệt có thể tự lưu thông tin autofill theo cài đặt riêng của bạn.', links: [{ label: 'Xem giỏ thử nghiệm', to: '/gio-hang/' }] },
    { id: 'chinh-thuc', title: 'Trước khi tiếp nhận dữ liệu thật', text: 'Mục đích xử lý, bên tiếp nhận, thời hạn lưu, quyền và đầu mối yêu cầu phải được công bố trong chính sách chính thức. Chưa áp dụng nội dung mẫu như một cam kết pháp lý.', links: [contactLink] },
  ] },
  { path: '/chinh-sach/dieu-kien-giao-dich/', title: 'Điều kiện giao dịch', pending: true, intro: 'Điều kiện giao dịch chính thức chưa được công bố. Website hiện chưa tiếp nhận đơn hàng.', sections: [
    { id: 'ban-nhap', title: 'Giỏ và bản nháp', text: 'Thêm giỏ, chọn phương thức thanh toán hoặc rà soát form không tạo đơn, không giữ hàng và không xác nhận thanh toán.' },
    { id: 'bao-gia', title: 'Yêu cầu báo giá', text: 'Bản nháp báo giá tách khỏi đặt hàng. Chưa có mã yêu cầu, giá cuối, cam kết cung cấp hoặc thời gian phản hồi.' },
    { id: 'cong-bo', title: 'Thông tin trước giao dịch', text: 'Chủ thể bán, giá/thuế/phí, điều kiện hình thành đơn và trách nhiệm các bên đang chờ công bố. Không dùng dữ liệu DEMO làm căn cứ giao dịch.', links: [contactLink] },
  ] },
];
export function findInformation(path: string) { return informationPages.find((page) => page.path === `${path.replace(/\/+$/, '')}/`); }
export const policyPages = informationPages.filter((page) => page.path.startsWith('/chinh-sach/'));
