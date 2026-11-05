# Biên bản kiểm tra Giai đoạn 06

Ngày thực hiện: **04/11/2026**, Windows, thư mục `C:\Users\Minh\Documents\ChatGPT\Website TMDT`. Các kết quả “đạt” bên dưới có output thực tế từ terminal hoặc trạng thái trình duyệt, không suy ra từ việc chỉ tạo file.

## Kiểm tra lại ngày 05/11/2026

Đã rà soát toàn bộ yêu cầu PROMPT 06 trên dự án hiện có và chạy lại các kiểm tra bên dưới. Không thay đổi mã ứng dụng, không cài lại công cụ và không thêm chức năng bán hàng.

| Kiểm tra thực tế | Kết quả ngày 05/11 |
|---|---|
| Node/npm/Git/VS Code | Vẫn là 24.15.0 / 11.12.1 / 2.53.0.windows.2 / 1.125.1 |
| `npm.cmd run check` | Exit 0; typecheck, ESLint, **12/12 test Vitest**, build prerender và compile Pages Functions đều đạt |
| `npm.cmd run smoke` | Exit 0; HTML/CSS, GET/HEAD health, POST 405, API lạ 404 và trang lạ 404 đạt tại 8788 |
| Vite local tại 5173 | `/`, `/kiem-tra`, `/api/v1/health` đều trả 200; health trả database `not_configured` |
| Audit toàn bộ | 12 moderate, 0 high, 0 critical; thuộc cây công cụ phát triển như phân tích bên dưới |
| Audit production | 0 vulnerabilities tại thời điểm kiểm tra |
| GitHub trước cập nhật biên bản | Local/remote `main` cùng SHA `71c80738566814d0c31e1e266ce097b73ee49e3f`, working tree sạch |
| Rà soát tài liệu | Đủ cây thư mục, toàn bộ source/config, hướng dẫn Windows, giải thích lệnh/terminal, GitHub, build Pages, lỗi thường gặp và checklist |

Bằng chứng mới: [check](../artifacts/check-2026-11-05.log), [smoke](../artifacts/smoke-2026-11-05.log), [HTTP qua Vite](../artifacts/vite-local-2026-11-05.json), [audit toàn bộ](../artifacts/audit-2026-11-05.json), [audit production](../artifacts/audit-production-2026-11-05.json). Lần này xác minh localhost bằng HTTP; ảnh/trạng thái trình duyệt ở phần lịch sử dưới đây được ghi nhận ngày 04/11, không coi là ảnh mới.

Các kết quả từ lượt khởi tạo ngày 04/11 được giữ nguyên dưới đây để truy vết.

## Môi trường và kết quả

| Kiểm tra | Kết quả thực tế |
|---|---|
| Công cụ hiện có | Node 24.15.0; npm 11.12.1; Git 2.53.0.windows.2; VS Code 1.125.1 |
| `npm install --include=dev` | Exit 0; thư viện cài được; có cảnh báo audit nêu bên dưới |
| Cài lại theo lockfile: `npm ci --include=dev` | Exit 0; 239 packages được cài, 246 packages được audit |
| `npm run typecheck` | Exit 0; frontend, Pages Functions và config/test đạt strict TypeScript |
| `npm run lint` | Exit 0, không warning theo `--max-warnings 0` |
| `npm test` | **12/12 test đạt**, 1 test file |
| `npm run build` | Exit 0; prerender `/` và `/kiem-tra`, assets trong `build/client`; có SPA fallback do router sinh nhưng chưa rewrite route nào vào đó |
| `npm run pages:check` | Exit 0, Wrangler báo `Compiled Worker successfully` |
| Chuỗi `npm run check` sau clean install | **Exit 0**, chạy đầy đủ typecheck → lint → test → build → Functions compile |
| `npm run pages:dev` | Wrangler 4.157.0 báo sẵn sàng ở `http://127.0.0.1:8788` |
| `npm run dev` | React Router/Vite báo sẵn sàng ở `http://127.0.0.1:5173` |
| `npm run smoke` | Exit 0; HTML/CSS, health, HEAD, 405 và 404 đạt |
| HTTP qua Vite | `/`, `/kiem-tra`, `/api/v1/health` đều trả 200; API được proxy tới Pages |
| Trình duyệt thật | Mở home, click liên kết tới `/kiem-tra`, click nút gọi API; hiển thị “Kết nối thành công. API đang chạy; database chưa cấu hình.” |
| Console trình duyệt | Không có error/warn trong log thu được ở lượt kiểm tra đó |
| Git local | Kho `.git` đã có từ trước; nhánh hiện tại đã đặt thành `main` |
| Commit | Đã tạo commit khởi tạo `abbd97c` với thông tin tác giả Git có sẵn trên máy |
| GitHub | `origin` = `https://github.com/lilhimn204/website-tmdt.git`; `git push --set-upstream origin main` exit 0, sau đó `git ls-remote` xác nhận SHA nhánh main trùng local |
| Cloudflare/Supabase online | Chưa tạo project, chưa deploy, chưa kết nối database |

Bổ sung kết nối GitHub ngày 04/11/2026: đã rà soát 115 tệp trong commit, không đưa secret, node_modules, build/cache hoặc artifacts lên GitHub. Trước commit, toàn bộ 115 tệp có hash trùng bản ZIP đã kiểm thử; không thay đổi mã ứng dụng trong lần kết nối GitHub nên không chạy lại bộ test ứng dụng. Các thay đổi sau push khởi tạo chỉ cập nhật tài liệu trạng thái.

## Nội dung đã kiểm tra bằng HTTP

- `/` và `/kiem-tra` có nội dung tiếng Việt trong HTML trả về trước khi cần JavaScript; stylesheet build trả 200 và đúng Content-Type.
- GET `/api/v1/health` trả 200, JSON `status: ok`, `scope: starter`, `database: not_configured`, header `Cache-Control: no-store`.
- HEAD health trả 200, body rỗng; POST health trả 405 và `Allow: GET, HEAD`.
- API lạ trả JSON 404, đường trang lạ trả HTML 404 thật.
- Vitest còn kiểm tra không phản chiếu tham số query, các method ghi bị từ chối và payload không hợp lệ không bị UI coi là health thành công.

Đây là kiểm chứng bộ khung. Chưa có kiểm thử nghiệp vụ, giao dịch đồng thời, RLS/Auth, thanh toán, tồn kho, backup restore, tải lớn, browser matrix hoặc chứng nhận accessibility toàn bộ website.

## Cảnh báo dependencies

- `npm audit --omit=dev --json`: **0 vulnerabilities**, exit 0 tại thời điểm kiểm tra.
- Audit toàn bộ: **12 moderate**, không có high/critical. Các cảnh báo liên quan cây công cụ ESLint/TypeScript ESLint dùng `minimatch`; 12 là số package bị đánh dấu trực tiếp/gián tiếp, không phải 12 lỗi độc lập trong API ứng dụng.
- Advisory [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) mô tả nguy cơ tiêu tốn tài nguyên khi xử lý glob pattern do bên tấn công kiểm soát. Bản sửa nằm ở minimatch 11; [changelog upstream](https://github.com/isaacs/minimatch/blob/main/changelog.md) có thay đổi API lớn. Các công cụ đang khai báo nhánh 10.
- Không chạy `npm audit fix --force` hoặc cưỡng ép major của thư viện con để chỉ làm sạch báo cáo. Giữ lockfile tương thích đã kiểm tra; cần theo dõi bản công cụ cập nhật và kiểm tra lại trước khi thiết lập pipeline nhận mã từ nguồn không tin cậy.
- Pattern lint hiện tại nằm trong source do dự án kiểm soát; Pages Functions không nhận pattern từ khách hoặc gọi ESLint. Kết quả audit bằng 0 cho production không phải bảo đảm tuyệt đối rằng ứng dụng không có lỗ hổng.

## Lỗi đã gặp và đã xử lý

Lần `typegen` đầu, React Router nhận thiếu `isbot`, tự chạy cài đặt và làm bộ dev dependencies bị prune trong môi trường con. Đã khai báo `isbot: 5.2.2` trực tiếp, cài lại đầy đủ, sau đó chạy clean install từ lockfile và toàn bộ `check` thành công. Những warning EPERM ban đầu xuất hiện khi npm dọn native modules đang được process cũ dùng; clean install sau đó hoàn tất.

Không ghi nhận lượt thất bại đầu tiên là “đạt”. Các dòng “đạt” trong bảng dùng lượt kiểm tra sau khi đã sửa dependency.

## Bằng chứng trên máy

Các tệp dưới đây nằm trong `artifacts/`, được `.gitignore` bỏ qua; chúng là bằng chứng local, không phải source bắt buộc khi clone:

- [Output kiểm tra tổng hợp](../artifacts/check.log).
- [Output smoke HTTP](../artifacts/smoke.log).
- [Ảnh kết nối API thành công](../artifacts/starter-api-success.jpg).
- [Audit toàn bộ dependencies](../artifacts/audit.json) và [audit production](../artifacts/audit-production.json).

![Nút trên giao diện đã gọi được Pages Functions local](../artifacts/starter-api-success.jpg)

Server local chỉ phục vụ máy này tại 127.0.0.1. Khi dừng server hoặc đóng phiên làm việc, cần mở lại bằng các lệnh trong README; đường localhost không phải website đã xuất bản.
