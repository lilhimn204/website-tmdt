# Security baseline — 08.1–08.2

Đây là nền bảo vệ đã triển khai cho schema, không phải hoàn thành module 08.3 hoặc security sign-off production. Trạng thái/kiểm thử chi tiết ở [bàn giao](../docs/MODULE_08_1_2.md).

- `app`: 52 bảng nghiệp vụ; RLS bật. `private`: helper và hàng khóa cây; không expose. `api`: schema Data API duy nhất, hiện rỗng.
- PUBLIC/anon/authenticated/service_role không có quyền DML trực tiếp lên bảng nghiệp vụ và không EXECUTE helper. Không có SECURITY DEFINER, view hoặc policy mở.
- Default table privileges bị thu hồi; global default EXECUTE của migration owner cũng bị thu hồi vì per-schema REVOKE không loại được global grant. Bảng mới vẫn phải bật RLS rõ trong migration và có negative tests.
- `service_role` có BYPASSRLS ở nền tảng nhưng vẫn bị schema/table ACL của bộ này chặn truy cập trực tiếp. Khi cấp RPC cho trusted server sau này, không được coi RLS là bảo vệ cho client đặc quyền; phải validate/authorize bên trong RPC.
- Không tạo tài khoản admin, không signup trigger tự cấp quyền; profile mặc định inactive. Roles/permissions chưa seed, JWT/user metadata không cấp quyền kinh doanh. Chưa có quy trình Owner/MFA, đó là đầu việc 08.3.
- Contact đơn tách bảng PII; guest credential chỉ hash, có thời hạn/scope. API chỉ trả masked DTO sau xác minh grant ở module sau; public_reference không đủ quyền xem. Chưa lưu bất kỳ PII thật nào.
- Docker local dùng volume riêng và cổng loopback được kiểm tra. Khóa dev nằm trong runtime/cache CLI bị Git ignore; script trạng thái không in khóa. Không đưa secret vào frontend hoặc `.env` có `VITE_`.
- PostgreSQL owner vẫn có quyền bypass phục vụ migrations; đây không phải tài khoản ứng dụng/admin. SQL tests chạy owner và SET ROLE trong transaction rollback, không nới ACL thật sau test.

81 test schema có kiểm phủ ACL, denied roles, self-promotion, default privileges và RLS sau khi cấp SELECT tạm trong transaction. HTTP kiểm schema exposure/signup disabled. Chưa kiểm quyền theo user/admin action/MFA/cross-user grants thực vì module đó chưa được triển khai.

Trước mở giao dịch: thiết kế policy/grants hẹp, gateway pre-request hook, Auth/JWT, CSRF/Origin, validation/limits, Turnstile/rate limit, logs đã che, secret rotation, Storage policies và concurrency business RPC. Trước production: backup/restore đã thử, RPO/RTO/retention đã chốt. Không mở public schema hoặc tắt RLS để sửa lỗi kết nối.
