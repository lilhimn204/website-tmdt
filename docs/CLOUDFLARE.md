# Chuẩn bị Cloudflare Pages

Giai đoạn 06 chỉ chuẩn bị cấu hình và kiểm thử local; chưa tạo Cloudflare project, đăng nhập, mua gói, gắn domain hoặc phát hành website.

## Cấu hình đã đặt trong repo

| Trường | Giá trị |
|---|---|
| Tệp cấu hình | `wrangler.jsonc` |
| Tên dự kiến | `website-tmdt`; đổi nếu tên thật của Pages project khác |
| Output | `build/client` |
| Compatibility date | `2026-11-04` |
| Entry Functions | Thư mục `functions` tại gốc repo |
| API đã có | GET/HEAD `/api/v1/health`; đường API khác trả 404 |
| Runtime | Cloudflare Web APIs; không có server Express hoặc database driver |
| Static routes | `/` và `/kiem-tra` được prerender |
| Unknown page | `public/404.html`; không wildcard rewrite về home |
| Secret | Không cần cho starter; chưa gắn Supabase |

`pages_build_output_dir` làm Wrangler nhận đây là Pages project. Không đặt `main` của Workers hoặc đưa `build/server` lên chạy như SSR. [Cloudflare — Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

## Kiểm thử local

Trong **PowerShell A ở thư mục gốc**:

```powershell
# Build HTML và assets từ React/Vite.
npm.cmd run build
# Kiểm tra biên dịch Functions, chỉ xuất trong .wrangler, không deploy.
npm.cmd run pages:check
# Phục vụ bản build và Functions local tại cổng 8788.
npm.cmd run pages:dev
```

Trong **PowerShell B cùng thư mục**:

```powershell
# Gửi request kiểm tra thực tế tới server đang chạy tại 8788.
npm.cmd run smoke
```

Không dùng `vite preview` làm bằng chứng Functions chạy được. `pages:dev` dùng runtime local của Wrangler; vẫn cần kiểm tra môi trường cloud khi tới giai đoạn triển khai. [Cloudflare — local development](https://developers.cloudflare.com/pages/functions/local-development/).

## Các trường nhập khi triển khai ở giai đoạn sau

Trong Cloudflare dashboard, tạo **Pages project qua Git integration**, chọn đúng GitHub repo và nhánh được duyệt. Không bấm Deploy ở Giai đoạn 06. Cấu hình cần nhập:

| Trường dashboard | Giá trị |
|---|---|
| Framework preset | None, để dùng cấu hình React Router/Vite tùy chỉnh này |
| Production branch | `main`, sau khi đã tạo/commit/push nhánh này |
| Root directory | Gốc repository, không phải `src` |
| Build command | `npm run build` |
| Build output directory | `build/client`, không phải `dist` |
| Build variable `NODE_VERSION` | `24.15.0`, khớp `.node-version` và bản local đã kiểm tra |
| Build variable `NPM_VERSION` | `11.12.1`, nếu cần khóa bản npm giống local |
| Runtime secrets | Chưa cần; chỉ thêm ở dashboard Secrets khi chức năng tương ứng được triển khai |

Pages cài dependencies trong bước build; phải commit cả `package.json` và `package-lock.json`. Trước khi triển khai thực tế, chạy `npm ci` và `npm run check` trong môi trường sạch, xác minh logs cài/build trên Cloudflare. Cấu hình trên chưa chứng minh tài khoản cloud đã build thành công. [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Build image](https://developers.cloudflare.com/pages/configuration/build-image/).

`_routes.json` chỉ gọi Functions cho `/api` và `/api/*`; `_headers` áp dụng static responses. API tự trả các header JSON/no-store/nosniff, không dựa vào `_headers`. Khi thêm SPA routes sau này, phải allowlist route cụ thể và giữ 404 thật; không thêm `/* /index.html 200` một cách mặc định. [Functions routing](https://developers.cloudflare.com/pages/functions/routing/).

Secret server dùng `.dev.vars` khi local và **Secrets** cho mỗi môi trường trên Cloudflare; không đặt trong `vars` của tệp được commit, không dùng tiền tố `VITE_`. Chưa có migrations, RLS, database production hoặc backup trong bản khởi tạo này.
