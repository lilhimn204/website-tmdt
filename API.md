# API — trạng thái module 08.6

Cập nhật 21/11/2026. Có health, ba endpoint Auth quản trị, chín endpoint đọc navigation/sản phẩm/SKU/thông số và ba endpoint discovery bên dưới. Chưa có giỏ/checkout/đơn/RFQ/upload backend. Frontend vẫn DEMO, chưa nối catalog thật và khóa gửi đơn/báo giá thật. [Hướng dẫn 08.6](docs/MODULE_08_6.md).

## Tìm kiếm, bộ lọc và so sánh — 08.6

| GET, HEAD URL | Chức năng |
|---|---|
| /api/v1/search | Tìm và lọc danh sách SKU công khai, phân trang/count/sort |
| /api/v1/product-types/{code}/filters | Định nghĩa bộ lọc của một loại kỹ thuật active |
| /api/v1/compare | So sánh 2–3 SKU cùng loại, phân trang hàng thông số |

Đây là các API riêng; contract của `/products` ở 08.5 giữ nguyên. Mọi quy tắc visibility, gateway, no-store, DTO whitelist, timeout 8 giây, giới hạn JSON upstream 256 KiB và GET/HEAD-only tiếp tục áp dụng. Không nhận/gửi bearer hoặc cookie khách tới public RPC. Không mở CORS, raw-table ACL, service secret hay API ghi catalog.

### Search: query và thứ tự

| Query | Quy tắc |
|---|---|
| q | Tùy chọn, tối đa 200 ký tự trước/sau chuẩn hóa. Bỏ q để duyệt; không truyền q rỗng. Không ký tự control |
| brands | 1–10 slug active phân tách dấu phẩy; không trùng. OR giữa các hãng |
| category | Slug danh mục công khai; gồm chính nó và các nhánh con công khai, tính cả membership phụ |
| type | Code loại kỹ thuật active; bắt buộc khi có bộ lọc kỹ thuật |
| filters | JSON object đã URL-encode; tối đa 4096 byte/10 thuộc tính, cấu trúc bên dưới |
| sort | relevance (mặc định), price_asc hoặc price_desc |
| limit | Số nguyên 1–100, mặc định 20 |
| offset | Số nguyên 0–5000, mặc định 0 |

Query URL tối đa 16384 ký tự; cấm tham số lạ, trùng hoặc giá trị rỗng. SQL kiểm độc lập bound/type/scope/active metadata; không ghép SQL từ client. Brand/category/type không công khai hoặc không tồn tại cùng 404. API không tự bỏ bộ lọc cũ khi đổi loại: trả 400 CATALOG_INVALID_FILTER để frontend sau này thông báo và cho người dùng gỡ/chọn lại.

q được chuẩn hóa Unicode NFKC và khoảng trắng. SKU/model khớp chính xác không phân biệt hoa/thường đứng trước; tiếp theo tiền tố nguyên mã; tiếp theo tên sản phẩm/thương hiệu. Giữ dấu phân cách của mã: UPS-100 không tự trở thành UPS100. Ký tự `%`/`_` không là wildcard. Tên/hãng dùng unaccent và PostgreSQL full-text `simple`, AND giữa các từ; có/không dấu tiếng Việt tương đương. Không có fuzzy typo, stemming tiếng Việt, synonym, semantic search hoặc tìm thông số bằng văn bản tự do.

Đơn vị kết quả là **một SKU**, không phải một sản phẩm gộp; mỗi kết quả chỉ rõ product và variant thỏa tất cả điều kiện. Cùng sản phẩm có hai SKU phù hợp thì có hai kết quả. Sort relevance theo nhóm exact → prefix → text; nếu không q là browse. Trong cùng nhóm, slug sản phẩm collation C rồi UUID SKU làm thứ tự ổn định.

Sort giá theo **amount_vnd công khai đang hiển thị**, bigint chính xác; null đứng cuối ở cả hai chiều, tie-breaker slug/UUID. NET/GROSS và tax_status vẫn trả nguyên vẹn: phép sắp này chưa quy đổi các cơ sở thuế khác nhau thành tổng tiền phải trả. Client phải giữ nhãn thuế; không gọi đây là so sánh tổng chi phí hay báo giá checkout. Quy tắc thuế/làm tròn/phí vẫn cần doanh nghiệp chốt trước giao dịch.

Ví dụ chỉ mô tả request:

```text
GET /api/v1/search?q=UPS-100&brands=hang-a,hang-b&limit=20&offset=0
```

Response rỗng khi chưa có catalog thật:

```json
{"data":[],"query":{"q":"UPS-100","brands":[],"category":null,"type":null,"filters":{},"sort":"relevance"},"page":{"limit":20,"offset":0,"total":0,"total_products":0,"has_more":false,"next_offset":null,"truncated":false}}
```

Khi có kết quả, mỗi data item có `{product,variant,match_type}`. Product dùng DTO list 08.5; variant dùng DTO chi tiết 08.5; match_type là exact/prefix/text/browse. Không trả search document, source revision hoặc nội dung nháp. `query` là các điều kiện đã áp dụng, dùng đối chiếu phản hồi; xử lý response cũ về trễ thuộc frontend khi nối API.

total là số SKU phù hợp, total_products là số product khác nhau. Count và page cùng truy vấn/snapshot. Trang vượt số kết quả trả [] và count thật. next_offset là offset trang tiếp theo khi còn kết quả và không vượt 5000. Nếu còn kết quả nhưng vượt trần, truncated=true, has_more=true, next_offset=null: yêu cầu thu hẹp từ khóa/bộ lọc. Không có snapshot giữa nhiều request; khi catalog thay đổi, tải lại từ đầu, không cam kết offset không dịch chuyển.

### Filters: giá trị và metadata

Trước URL-encode, filters có cấu trúc như ví dụ minh họa sau; code thực tế lấy từ endpoint filters, không hardcode bộ UPS cho RAM:

```json
{"power":{"min":"500","max":"1000"},"wifi":{"values":[false]},"interfaces":{"values":["usb","lan"]}}
```

- number: min và/hoặc max là **chuỗi decimal** trong numeric(20,6); inclusive, min≤max. Không nhận JSON number, NaN, exponent hoặc tự đổi đơn vị. Giá trị theo canonical unit trong metadata.
- boolean: values chứa true/false đúng kiểu, tối đa hai giá trị khác nhau.
- enum/multi_enum: values gồm 1–10 code option active, không trùng. OR giữa lựa chọn trong cùng thuộc tính; AND giữa thuộc tính. Multi-enum khớp khi có ít nhất một lựa chọn được yêu cầu.
- Không lọc text tự do, definition không filterable, nháp/archived hoặc thuộc loại khác. Mọi rule đều áp lên **cùng một SKU**. Missing/unverified/unknown/NA/not_supported không đáp ứng lọc số/boolean/option cụ thể. Multi-enum có một lựa chọn archived thì toàn bộ giá trị unknown, không lọc trên tập đã bị cắt.

`GET /api/v1/product-types/{code}/filters?limit=20&after={code}`: limit 1–100, after là code cuối trang trước; sắp display_order rồi code C. Chỉ definitions active + filterable của loại đang chọn, thuộc number/boolean/enum/multi_enum; không có đếm facet động hoặc suy ra cấu hình ngành hàng. Loại active chưa có definition trả filters=[]; loại ẩn/không có trả 404.

Response `{data:{product_type:{code,name},filters:[...]},page:{limit,next_cursor,has_more}}`. Mỗi filter gồm code/label/group_code/data_type/unit nullable/display_order/min_value/max_value/options. min/max chỉ number, dạng decimal string hoặc null. options chỉ enum/multi_enum, mảng `{code,label}` từ options active, có thể rỗng; các kiểu khác options=null. Metadata không bảo đảm mọi option đều có sản phẩm phù hợp. Option list quá 1000 hoặc response quá 256 KiB bị chặn 503, không cắt mảng âm thầm; giảm limit không giải quyết một definition quá lớn, cần rà soát taxonomy.

### Compare: cột, hàng và dữ liệu thiếu

`GET /api/v1/compare?ids={uuid1},{uuid2}[,{uuid3}]&limit=20&after={definition-code}`. Phải có 2–3 UUID khác nhau, cùng product_type, tất cả đang công khai. Giữ đúng thứ tự IDs làm thứ tự cột, không tự thay SKU. Sai số lượng/duplicate/UUID trả 400 CATALOG_INVALID_QUERY; khác loại trả 400 CATALOG_INCOMPATIBLE_COMPARISON; bất kỳ SKU nháp/ẩn/mất trả 404 CATALOG_NOT_FOUND cho cả yêu cầu, không trả bảng thiếu cột như thành công. Client cần làm mới lựa chọn và giải thích SKU không còn công khai, không tiếp tục dùng bảng cũ.

Response `{data:{product_type,items:[{product,variant}],rows:[...]},page:{limit,next_cursor,has_more}}`. items gồm DTO hiện hành từ 08.5, kể cả EOL/not_for_sale/purchase_enabled=false; không tự cho mua vì cột có giá hoặc còn tồn. Rows chỉ active definitions được đánh comparable của loại hàng, sắp display_order/code, limit 1–100. Không có comparable definition thì rows=[] kèm các cột hợp lệ.

Một hàng có code/label/group_code/data_type/unit/display_order, cells theo thứ tự IDs, và comparison. Cell gồm variant_id/value_status/value với kiểu và ý nghĩa 08.5. Ví dụ:

```json
{"code":"wifi","label":"Wi-Fi","group_code":"connection","data_type":"boolean","unit":null,"display_order":0,"cells":[{"variant_id":"60000000-0000-0000-0000-000000000030","value_status":"known","value":false},{"variant_id":"60000000-0000-0000-0000-000000000031","value_status":"unknown","value":null}],"comparison":"incomplete"}
```

comparison=equal khi mọi trạng thái/giá trị đã xác minh bằng nhau; different khi các giá trị/trạng thái đã xác minh khác nhau; incomplete khi có ít nhất một unknown. Hai unknown luôn incomplete, không phải equal. false/0 vẫn known, not_supported và not_applicable vẫn trạng thái riêng. BFF kiểm lại nhãn comparison; không tin nhãn equal trái với dữ liệu. Multi-enum so theo tập code, không thứ tự lựa chọn; số so chính xác decimal. Không xếp hạng “tốt nhất”, đánh giá tương thích hoặc tính runtime UPS. Frontend lọc “khác biệt” sau này cần giữ cả hàng incomplete để người mua thấy thiếu dữ liệu.

### RPC và projection

RPC mới: public_search_products(requested_query text='',brand_slugs text[]='{}',category_slug text=null,type_code text=null,spec_filters jsonb='{}',requested_sort text='relevance',requested_limit integer=20,requested_offset integer=0); public_product_filters(requested_type text,requested_limit integer=20,after_code text=null); public_compare_products(variant_ids uuid[],requested_limit integer=20,after_code text=null). Chỉ cấp EXECUTE cho anon; các helper không cấp cho API roles. Transport thêm hai lỗi 22023 có kiểm soát CATALOG_INVALID_FILTER/CATALOG_INCOMPATIBLE_COMPARISON vào nhóm 400; các lỗi khác giữ contract 08.5.

catalog_search_documents là projection nội bộ của tên product + brand đã chuẩn hóa, không chứa giá/tồn/chính sách và không là nguồn quyết định quyền. Trigger đồng bộ khi thêm/sửa SKU, đổi tên/hãng product hoặc tên brand; xóa SKU dọn document. Các cập nhật cùng giao dịch. Brand/variant dùng cùng khóa cấu trúc catalog đã có để serialize chỉnh sửa; dưới REPEATABLE READ có thể nhận serialization failure, transaction viết phải retry. Public visibility/giá/tồn/verification luôn đọc nguồn hiện hành, kể cả khi document nháp còn tồn tại nội bộ. Search lọc/count IDs trước, enrich DTO cho page có giới hạn; typed filter dùng EXISTS trên đúng variant.

## Sản phẩm, biến thể, thông số công khai — 08.5

| GET, HEAD URL | Query | Nội dung / thứ tự |
|---|---|---|
| /api/v1/products | limit, after | Danh sách sản phẩm, slug theo collation C |
| /api/v1/products/{slug} | Không | Chi tiết sản phẩm |
| /api/v1/products/{slug}/variants | limit, after | SKU của đúng sản phẩm, UUID tăng |
| /api/v1/products/{slug}/variants/{variantId} | Không | SKU, model, giá công khai, trạng thái tồn và bảo hành |
| /api/v1/products/{slug}/variants/{variantId}/specifications | limit, after | Định nghĩa và giá trị riêng SKU, display_order rồi code C |

`limit` mặc định 20, nguyên 1–100. `after` là next_cursor từ response trước: slug cho products, UUID cho variants, code cho specifications. Cursor phải còn công khai và đúng phạm vi; không nhận offset, search, sort hoặc bộ lọc trong 08.5. Query không quá 1024 ký tự, cấm tên lạ, trùng hoặc rỗng. Detail cấm mọi query. Slug/code dùng a–z, 0–9, gạch nối ở giữa, tối đa 160; variantId là UUID, không dùng SKU làm đường dẫn vì SKU có thể chứa dấu `/` hoặc khoảng trắng. UUID được chuẩn hóa chữ thường.

List có `{data: [...], page: {limit, next_cursor, has_more}}`; detail có `{data: object}`. Không có tổng số suy đoán. Database trống trả danh sách trống; detail không tồn tại trả 404. Cursor bị thu hồi trả 400 `CATALOG_INVALID_CURSOR`, client tải lại trang đầu. Phân trang ổn định khi dữ liệu không đổi, chưa có snapshot xuyên nhiều request.

**Điều kiện công khai:** product published; brand và technical type active; primary category cùng mọi tổ tiên/type của nhánh active; có ít nhất một SKU ready. Chỉ SKU ready được trả. Nháp, ẩn, thiếu SKU ready, sai sản phẩm hoặc không tồn tại cùng 404 `CATALOG_NOT_FOUND`. Lifecycle không phải publication: EOL/discontinued vẫn tra cứu được. `ready`/`published` là cờ duyệt dữ liệu đang có trong schema, không tự chứng minh quyền phân phối, tính đầy đủ để checkout hay thay thế workflow duyệt của 08.10.

Product list có id/name/slug/model_family (nullable)/lifecycle_status, brand `{id,name,slug}`, product_type `{code,name}`, primary_category `{id,name,slug}`. Detail thêm description. Không nhúng danh sách SKU không giới hạn. Category dùng API 08.4 để đọc breadcrumb. Mô tả là plain text; frontend không được đưa thẳng vào HTML.

Ví dụ cấu trúc SKU dưới đây **chỉ minh họa, không phải dữ liệu kinh doanh**:

```json
{
  "data": {
    "id": "50000000-0000-0000-0000-000000000020",
    "product_id": "50000000-0000-0000-0000-000000000010",
    "sku": "TEST/sku 20",
    "model": "TEST model",
    "variant_label": "",
    "lifecycle_status": "active",
    "sales_mode": "retail",
    "price": {"amount_vnd":"1250000","basis":"GROSS","tax_status":"taxable","tax_rate_bps":0},
    "availability": "unknown",
    "warranty": null,
    "purchase_enabled": false
  }
}
```

- `lifecycle_status` hiệu lực: eol nếu product hoặc SKU eol; tiếp theo discontinued nếu một trong hai ngừng bán; còn lại active. EOL/discontinued ép `sales_mode=not_for_sale`; active giữ retail/quote_only/not_for_sale đã cấu hình.
- `purchase_enabled` luôn false trong 08.5 vì API checkout chưa triển khai. Không dùng in_stock hoặc retail để tự bật giao dịch. Sau này checkout vẫn phải kiểm tra lại giá/tồn/chính sách server-side trong giao dịch.
- `price` chỉ từ current_price_id cùng SKU, sales_mode cấu hình retail, approved_at không nằm tương lai. Không lấy giá lịch sử “mới nhất” làm fallback. Quote-only/not_for_sale cấu hình không công bố giá. EOL của SKU từng retail có thể giữ giá để tham khảo, vẫn bị chặn bán.
- amount_vnd là chuỗi số nguyên dương trong miền bigint PostgreSQL, không Number/float. basis NET/GROSS thể hiện chưa/đã gồm thuế; không tự tính thêm thuế. taxable có tax_rate_bps nguyên 0–10000; exempt/not_applicable/unknown có rate=null. unknown không phải miễn thuế hay thuế 0; chưa đủ để checkout. Không có giá phù hợp thì price=null, không dùng 0.
- availability chỉ phản ánh tồn: in_stock khi available>0, out_of_stock khi có inventory và available=0, unknown khi chưa có hàng inventory. Không lộ on_hand/reserved/số lượng hoặc coi đây là giữ hàng; inventory.available do database tính on_hand−reserved.
- warranty chỉ lấy warranty_version_id của SKU, policy active, phiên bản đã duyệt và có hiệu lực tại statement_timestamp. Null nghĩa chưa có chính sách công khai phù hợp, không phải bảo hành 0 tháng. Không kế thừa theo brand/model chưa duyệt. Object gồm policy_code/name/duration_months (nullable, nguyên ≥0)/start_rule/provider_name/coverage/exclusions/process; không có reviewer hoặc ID nội bộ phiên bản.

Specifications trả mọi definition active được gắn với loại kỹ thuật của SKU, kể cả chưa có giá trị. Ví dụ một phần tử:

```json
{"code":"power","label":"Công suất","group_code":"technical","data_type":"number","unit":{"code":"W","name":"Watt"},"display_order":0,"required_for_publish":true,"value_status":"known","value":"0.000000"}
```

| data_type | value khi known |
|---|---|
| number | Chuỗi decimal numeric(20,6); giữ số 0, không dùng float |
| boolean | true hoặc false; false vẫn là dữ liệu known |
| text | Text không rỗng, render như text |
| enum | `{code,label}` của option active |
| multi_enum | Mảng không rỗng `{code,label}`, sắp sort_order rồi code |

value_status còn có unknown/not_applicable/not_supported, luôn value=null. Missing value, thiếu verified_at, verified_at tương lai, numeric ngoài bounds hoặc option đã archived đều trả unknown. Nếu một lựa chọn multi_enum archived thì **toàn bộ giá trị unknown**, không trả mảng bị cắt như thể đầy đủ. Không kế thừa thông số giữa SKU. unit nullable, chỉ number có unit. required_for_publish là metadata cho quy trình duyệt, không phải bằng chứng rằng mọi điều kiện bán đã đạt. Không lộ source_note/source_asset_id/verified_by.

Các endpoint dùng transport an toàn chung với 08.4: publishable key + server gateway, không forward caller bearer/cookie, không service secret, timeout 8 giây, tối đa 256 KiB JSON upstream và chặn redirect. DTO validate rồi whitelist từng trường/nested object. Text mô tả/exclusions/value tối đa 128000 ký tự ở BFF; label/identifier tối đa 2000. Dữ liệu quá lớn/sai kiểu trả 503, không cắt giá trị âm thầm; giảm limit hoặc chỉnh dữ liệu đã duyệt. Header no-store/nosniff/noindex; HEAD giữ status/header và không body. POST/PUT/PATCH/DELETE/OPTIONS trả 405 với Allow: GET, HEAD.

Lỗi JSON `{error:{code,message}}`: 400 CATALOG_INVALID_QUERY/CATALOG_INVALID_CURSOR; 404 CATALOG_NOT_FOUND; 405 METHOD_NOT_ALLOWED; 429 CATALOG_RATE_LIMITED khi upstream giới hạn; 503 CATALOG_NOT_CONFIGURED khi thiếu binding/gateway, hoặc CATALOG_UNAVAILABLE khi kết nối/DTO lỗi. Không có data giả khi lỗi, không trả SQL diagnostic. Giới hạn query/timeout/payload không thay thế WAF/rate limit production.

RPC internal tương ứng: public_products(requested_limit integer=20,after_slug text=null); public_product(requested_slug text); public_product_variants(requested_slug text,requested_limit integer=20,after_id uuid=null); public_product_variant(requested_slug text,requested_variant_id uuid); public_variant_specifications(requested_slug text,requested_variant_id uuid,requested_limit integer=20,after_code text=null). Tất cả chỉ EXECUTE cho anon sau gateway; SQL kiểm độc lập publication/scope/cursor/limit. Ba private helpers không cho API roles EXECUTE. Không có table grants mới.

Endpoint 08.5 chưa trả ảnh/tài liệu hoặc Storage URL (quyền media/phát hành file ở 08.10), danh mục phụ, phụ kiện, quan hệ tương thích, admin CRUD hoặc frontend integration. Tìm kiếm/lọc/so sánh đã có ở các endpoint 08.6 bên trên. Không suy [] là “không có tài liệu”: trường media chưa thuộc contract.

## Thương hiệu và danh mục công khai — 08.4

| Phương thức / URL | Nội dung |
|---|---|
| GET, HEAD /api/v1/brands | Phân trang thương hiệu active |
| GET, HEAD /api/v1/brands/{slug} | Chi tiết thương hiệu active |
| GET, HEAD /api/v1/categories | Danh mục gốc hoặc con trực tiếp của parent |
| GET, HEAD /api/v1/categories/{slug} | Chi tiết, loại kỹ thuật và breadcrumb công khai |

Khách không cần đăng nhập. Pages gọi Supabase bằng publishable key + gateway, **không chuyển tiếp Authorization/Cookie của người gọi**. Public RPC chỉ cấp EXECUTE cho anon; signed-in client vẫn đọc qua các URL Pages này. Không mở CORS; cùng origin với frontend. GET/HEAD không cần Origin hay CSRF token vì không ghi dữ liệu. POST/PUT/PATCH/DELETE/OPTIONS trả 405, Allow: GET, HEAD.

**Danh sách:** hỗ trợ `limit` (mặc định 20, số nguyên 1–100), `after` (slug cuối của trang trước). Categories hỗ trợ thêm `parent` (slug danh mục cha); thiếu parent là lấy gốc, không trả toàn cây trong một response. Không chấp nhận tham số rỗng, trùng, ngoài whitelist hoặc query quá 1024 ký tự. Detail không nhận query. Slug 1–160 ký tự a–z/0–9, dấu gạch nối ở giữa; không tự chuẩn hóa URL sai.

Brand sắp theo slug với collation C. Category sắp sort_order tăng rồi slug C; cursor lấy từ last item, ràng buộc cùng parent. Không có offset, tổng số giả, giá, tồn hoặc số lượng sản phẩm. Dữ liệu không đổi thì phân trang không lặp/bỏ sót. Nếu danh mục đổi giữa các request, client nên quay về trang đầu; cursor bị ẩn/xóa/chuyển parent trả 400, không có snapshot xuyên request.

GET `/api/v1/brands?limit=2`, ví dụ cấu trúc (mọi giá trị dưới đây là minh họa):

```json
{
  "data":[{"id":"00000000-0000-0000-0000-000000000001","name":"Thương hiệu mẫu","slug":"thuong-hieu-mau"}],
  "page":{"limit":2,"next_cursor":null,"has_more":false}
}
```

Khi còn trang, next_cursor là slug phần tử cuối và has_more=true. Dùng `?limit=2&after={next_cursor}`; với danh mục giữ nguyên `parent`. Database chưa có dữ liệu thật sẽ trả `data: []`, next_cursor=null, has_more=false. Đây không phải lỗi.

GET `/api/v1/brands/thuong-hieu-mau`:

```json
{"data":{"id":"00000000-0000-0000-0000-000000000001","name":"Thương hiệu mẫu","slug":"thuong-hieu-mau","description":"Mô tả đã được duyệt"}}
```

Brand list chỉ có id/name/slug. Detail thêm description dạng text; frontend phải render text an toàn, không đưa vào HTML thô. Chưa trả logo URL, object key, trạng thái nội bộ hoặc version; media/upload thuộc 08.10.

GET `/api/v1/categories/ups`:

```json
{"data":{"id":"00000000-0000-0000-0000-000000000002","name":"UPS","slug":"ups","parent_slug":"nguon-dien","sort_order":0,"product_type":{"code":"ups","name":"Bộ lưu điện"},"breadcrumbs":[{"name":"Nguồn điện","slug":"nguon-dien"},{"name":"UPS","slug":"ups"}]}}
```

Category list dùng cùng các trường trừ breadcrumbs. Root có parent_slug=null; node điều hướng chưa gắn loại kỹ thuật có product_type=null, không suy thành loại khác. Breadcrumb đi từ gốc đến chính node. Lấy các con bằng `/api/v1/categories?parent=ups`. Danh mục công khai không có con trả [] còn cha không tồn tại/không công khai trả 404.

**Quy tắc công bố:** brand/category phải active; mọi tổ tiên của category phải active. Nếu category gắn product_type thì type cũng phải active. Nhánh vi phạm bị ẩn toàn bộ, kể cả truy cập URL con trực tiếp. Draft/archived/không tồn tại dùng cùng 404. Active là trạng thái cho phép công bố metadata, không chứng minh có SKU đang bán, quyền phân phối hoặc tồn hàng.

Mọi response no-store và noindex; HEAD giữ status/headers, không body kể cả lỗi. Ẩn dữ liệu có hiệu lực ở request tiếp theo. Timeout upstream 8 giây; giới hạn JSON upstream 256 KiB; chỉ trả DTO whitelist, không thông báo SQL hoặc credential. Không cache để tránh giữ metadata vừa bị thu hồi. Giới hạn này chưa thay thế WAF/rate limit phân tán trước production.

| HTTP | Code | Ý nghĩa |
|---|---|---|
| 400 | CATALOG_INVALID_QUERY | Query/slug/limit không hợp lệ |
| 400 | CATALOG_INVALID_CURSOR | Cursor không tồn tại, không công khai hoặc khác parent; quay lại trang đầu |
| 404 | CATALOG_NOT_FOUND | Không có metadata công khai tương ứng |
| 405 | METHOD_NOT_ALLOWED | Endpoint chỉ đọc |
| 429 | CATALOG_RATE_LIMITED | Upstream giới hạn truy cập; chờ rồi thử lại |
| 503 | CATALOG_NOT_CONFIGURED | Thiếu/sai bindings hoặc gateway |
| 503 | CATALOG_UNAVAILABLE | Lỗi kết nối, timeout, redirect, payload quá lớn/sai hợp đồng; không coi là catalog rỗng |

Body lỗi: `{"error":{"code":"CATALOG_NOT_FOUND","message":"Không tìm thấy thương hiệu hoặc danh mục công khai."}}`.

SQL RPC tương ứng: public_brands(requested_limit integer=20, after_slug text=null), public_brand(requested_slug text), public_categories(requested_limit integer=20, after_slug text=null, parent_slug text=null), public_category(requested_slug text). RPC list trả `{items,next_cursor}`; Pages chuẩn hóa thành `{data,page}`. SQL cũng kiểm limit/slug/cursor, không chỉ dựa vào BFF. 08.4 chưa có CRUD admin; giữ cho 08.10.

## Health

`GET /api/v1/health` trả 200: `{"status":"ok","scope":"starter","database":"not_configured"}`. HEAD trả 200 không body; phương thức khác trả 405, Allow: GET, HEAD. Đây chỉ là health bộ khung; không probe Supabase hoặc xác nhận giao dịch hoạt động.

Đường dẫn chưa triển khai trả 404: `{"error":{"code":"NOT_FOUND","message":"API này chưa tồn tại."}}`.

## Quy tắc chung cho admin

- Cùng origin với website; HTTPS khi online. Local mặc định http://127.0.0.1:8788.
- `Authorization: Bearer <access_token>` từ Supabase Auth. Không nhận token qua cookie, query hoặc body. Không gửi refresh token vào ba endpoint này.
- Pages gọi Auth `/user` xác minh chính bearer đó trước khi kiểm claims. Database kiểm profile/role/session/factor sống; không lấy quyền từ metadata.
- POST bắt buộc Origin đúng APP_ORIGIN. GET cho phép không có Origin nhưng từ chối Origin sai. Không mở CORS; từ chối Sec-Fetch-Site: cross-site.
- POST JSON tối đa 4096 byte, không body nén hoặc query string. Response no-store; không trả token, email Auth, gateway hoặc lỗi SQL thô.
- Chưa cung cấp UI đăng nhập/MFA/nhân sự. Mật khẩu và TOTP gửi trực tiếp tới Supabase Auth bằng SDK/API chính thức; backend không lưu mật khẩu.

## GET /api/v1/admin/session

Không body. HTTP 200, ví dụ cấu trúc (UUID/tên/version chỉ minh họa):

```json
{"data":{"user_id":"00000000-0000-0000-0000-000000000001","display_name":"Nhân sự mẫu","authz_version":"2","roles":["sales"],"permissions":["catalog.read","inventory.read","orders.contact.read","orders.process","orders.read","quotes.read","quotes.write"]}}
```

Chỉ trả chính người đăng nhập. Version là chuỗi bigint, client không tự cộng/trừ hoặc đoán. Quyền đọc lại mỗi request, không cache theo JWT cũ.

## POST /api/v1/admin/access

Chỉ Owner có security.manage, phiên MFA sống. Đúng bảy trường; không nhận trường ngoài hợp đồng:

```json
{
  "user_id":"00000000-0000-0000-0000-000000000002",
  "display_name":"Nhân sự mẫu",
  "roles":["sales"],
  "active":true,
  "expected_version":"0",
  "reason":"Phân công nhân sự đã được duyệt",
  "request_id":"00000000-0000-0000-0000-000000000003"
}
```

- Target phải là Auth user đã xác nhận, không anonymous/deleted/banned. Endpoint không tự tạo tài khoản.
- display_name: 1–100 ký tự sau trim; reason: 3–500, không nhập secret hoặc thông tin khách.
- roles: tập duy nhất từ owner/catalog/sales/warehouse/finance/support, tối đa 6. Active cần ít nhất một vai trò. Đây là thay toàn bộ tập vai trò.
- expected_version: "0" cho profile chưa tồn tại; nếu có, lấy version tin cậy hiện tại. Chưa có API liệt kê nhân sự; operator local xem profile trong Studio. Không expose bảng public để lấy version.
- request_id: UUID liên kết audit, **không phải idempotency key**. Gửi lại với version cũ bị 409. Nếu mất response, đọc trạng thái/version/audit trước khi quyết định gửi lại.

200 trả `{"data":{"user_id":"00000000-0000-0000-0000-000000000002","active":true,"roles":["sales"],"authz_version":"2"}}` (version phụ thuộc lịch sử). Một transaction thực hiện kiểm quyền, CAS version, profile, assignments và audit. Hàng khóa chung tuần tự hóa thay quyền; kiểm quyền lại sau chờ khóa. Deferred trigger bảo vệ ít nhất một Owner hoạt động có security.manage, kể cả request đồng thời.

## POST /api/v1/admin/logout

Không body hoặc JSON {}. Chấp nhận bearer hợp lệ ở aal1 để người chưa MFA cũng thoát được. Gọi Supabase logout scope=local; thành công trả **204 không body**, không giả thành công khi Auth lỗi. Không đăng xuất các phiên khác. Phiên vừa xóa không vượt qua kiểm tra auth.sessions dù JWT chưa hết hạn.

## Lỗi admin

Body: `{"error":{"code":"MFA_REQUIRED","message":"Cần xác thực MFA trước khi truy cập quản trị."}}`.

| HTTP | Code | Cách xử lý |
|---|---|---|
| 400 | INVALID_ACCESS_INPUT | Kiểm tra trường, query, JSON và kiểu dữ liệu |
| 401 | UNAUTHENTICATED | Đăng nhập lại; có WWW-Authenticate: Bearer |
| 403 | MFA_REQUIRED | Hoàn tất TOTP challenge/verify, dùng token aal2 mới |
| 403 | FORBIDDEN | Thiếu quyền, bị vô hiệu hóa hoặc session/factor hết hiệu lực |
| 403 | ORIGIN_NOT_ALLOWED | Dùng origin đúng, không mở CORS tùy tiện |
| 405 | METHOD_NOT_ALLOWED | Dùng phương thức trong Allow |
| 409 | ACCESS_VERSION_CONFLICT | Đọc lại trạng thái/version |
| 409 | LAST_OWNER_REQUIRED | Giữ ít nhất một Owner hoạt động |
| 413 | PAYLOAD_TOO_LARGE | Vượt 4096 byte hoặc Content-Length sai |
| 415 | UNSUPPORTED_MEDIA_TYPE | Dùng JSON, không Content-Encoding |
| 429 | TOO_MANY_REQUESTS | Auth đang rate limit; chờ rồi thử lại |
| 503 | AUTH_NOT_CONFIGURED | Operator kiểm tra bindings/gateway hash |
| 503 | AUTH_UNAVAILABLE | Không xác nhận thay đổi thành công; kiểm tra trạng thái |

## Supabase bên trong

Data API chỉ expose api: admin_context/set_admin_access cấp EXECUTE cho authenticated, mười hai public_* catalog RPC cấp cho anon. Không cấp các RPC này cho service_role. Admin dùng publishable key + JWT gốc + gateway; public chỉ publishable key + gateway. Pre-request hook so hash server-only. Thiếu/sai gateway → 403 GATEWAY_REQUIRED; không tắt hook để sửa kết nối. app/private/public không expose. Hook không áp dụng Auth/Storage.

08.5–08.10 tiếp tục DTO/nghiệp vụ riêng. Quyền guest xem đơn, giá/tồn server-side, transaction giữ hàng, idempotency checkout, chống spam khách và Storage signed URL chưa làm. Xem [bảo mật](architecture/SECURITY.md), [hướng dẫn Auth](docs/MODULE_08_3.md).
