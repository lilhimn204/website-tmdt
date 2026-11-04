# Checklist nghiệm thu Giai đoạn 06

`[x]` = đã có tệp/đã kiểm tra tương ứng. `[ ]` = còn chờ hoặc thuộc bước tiếp theo. Bằng chứng chi tiết tại [VERIFICATION.md](VERIFICATION.md).

## Phạm vi khởi tạo

- [x] S06-01: Kiểm tra Node.js, VS Code, Git trên máy; có hướng dẫn cài trên Windows và lỗi PATH/PowerShell.
- [x] S06-02: React + Vite + TypeScript được cài trong workspace hiện tại, giữ nguyên tài liệu/bản vẽ trước đó.
- [x] S06-03: Tailwind 4 qua Vite plugin; React Router Framework Mode có hai route prerender.
- [x] S06-04: TypeScript strict; frontend/Functions/tools có cấu hình riêng; ESLint hoạt động.
- [x] S06-05: Vitest chạy thực tế 12 test của health contract và trạng thái dữ liệu.
- [x] S06-06: `functions/` chuẩn bị cho Cloudflare Pages; backend helper trong `server/`; không đưa module backend vào frontend.
- [x] S06-07: Wrangler config có output/compatibility date; Functions compile và local runtime đã chạy.
- [x] S06-08: `.env.example`, `.dev.vars.example`, `.gitignore`, `.editorconfig`, README và lockfile đầy đủ; không cần secret để chạy.
- [x] S06-09: Git local tồn tại, dùng nhánh main; có hướng dẫn commit đầu tiên và đăng nhập/kết nối GitHub.
- [x] S06-10: Đã nối `origin` tới `lilhimn204/website-tmdt`, push `main` thành công và đối chiếu SHA remote/local ngày 04/11/2026.
- [x] S06-11: Cấu hình build Pages đã chuẩn bị: `npm run build`, output `build/client`, Node được ghi phiên bản.
- [x] S06-12: Kiểm tra localhost 8788 và Vite 5173, API proxy, typecheck, lint, test và production build.
- [x] S06-13: Trang lỗi HTTP 404 thật; API không tồn tại trả JSON 404; method ghi health trả 405.
- [x] S06-14: Hướng dẫn tiếng Việt ghi terminal và giải thích từng lệnh; có cách xử lý lỗi thường gặp.
- [x] S06-15: Bàn giao đầy đủ file nguồn/cấu hình, chỉ mục file và gói ZIP local; không rút gọn thân file.
- [x] S06-16: Ghi rõ audit production và audit công cụ; không tuyên bố tất cả dependencies sạch cảnh báo.
- [x] S06-17: Không triển khai chức năng bán hàng, không tạo dữ liệu giá/tồn giả, không kết nối Supabase hoặc phát hành cloud.

## Chưa nghiệm thu production

- [ ] Hướng thiết kế cuối cùng được người dùng chọn.
- [ ] Hoàn thiện/duyệt API nghiệp vụ, mô hình quyền/RLS, môi trường và vận hành còn thiếu của Giai đoạn 05.
- [ ] Chốt dữ liệu/doanh nghiệp: catalog, giá/thuế, tồn, giao hàng, giữ hàng COD/chuyển khoản, tải dự kiến và RPO/RTO.
- [ ] Database, migrations, auth, giao dịch, chống trùng, kiểm thử bảo mật và backup/restore được triển khai ở đúng giai đoạn.
- [ ] Rà soát/cập nhật dependencies công cụ có advisory trước pipeline nhận nguồn không tin cậy.
- [ ] Build/deploy kiểm chứng trên tài khoản Cloudflare thật, domain và cấu hình môi trường thật.

Hoàn thành bộ khung local và kết nối GitHub không tự đánh dấu các mục production là đã xong.
