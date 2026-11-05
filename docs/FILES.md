# Toàn bộ tệp bàn giao Giai đoạn 06

48 tệp nguồn/cấu hình/tài liệu được tạo hoặc thay đổi trong giai đoạn này. Mỗi liên kết mở **nguyên tệp đầy đủ**, gồm cả lockfile; không phải đoạn mã rút gọn. Các tệp đã nằm trực tiếp trong workspace.

| Tệp | Thao tác |
|---|---|
| [.dev.vars.example](../.dev.vars.example) | Tạo mới |
| [.editorconfig](../.editorconfig) | Tạo mới |
| [.env.example](../.env.example) | Tạo mới |
| [.gitattributes](../.gitattributes) | Tạo mới |
| [.gitignore](../.gitignore) | Tạo mới |
| [.node-version](../.node-version) | Tạo mới |
| [.npmrc](../.npmrc) | Tạo mới |
| [.nvmrc](../.nvmrc) | Tạo mới |
| [.vscode/extensions.json](../.vscode/extensions.json) | Tạo mới |
| [.vscode/settings.json](../.vscode/settings.json) | Tạo mới |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Cập nhật trạng thái/phạm vi |
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Cập nhật trạng thái/phạm vi |
| [README.md](../README.md) | Tạo mới |
| [docs/CLOUDFLARE.md](../docs/CLOUDFLARE.md) | Tạo mới |
| [docs/FILES.md](../docs/FILES.md) | Tạo mới |
| [docs/GITHUB.md](../docs/GITHUB.md) | Tạo mới |
| [docs/SETUP_CHECKLIST.md](../docs/SETUP_CHECKLIST.md) | Tạo mới |
| [docs/VERIFICATION.md](../docs/VERIFICATION.md) | Tạo mới |
| [eslint.config.js](../eslint.config.js) | Tạo mới |
| [functions/api/[[path]].ts](../functions/api/[[path]].ts) | Tạo mới |
| [functions/api/v1/health.ts](../functions/api/v1/health.ts) | Tạo mới |
| [package-lock.json](../package-lock.json) | Tạo mới |
| [package.json](../package.json) | Tạo mới |
| [public/404.html](../public/404.html) | Tạo mới |
| [public/_headers](../public/_headers) | Tạo mới |
| [public/_routes.json](../public/_routes.json) | Tạo mới |
| [public/robots.txt](../public/robots.txt) | Tạo mới |
| [react-router.config.ts](../react-router.config.ts) | Tạo mới |
| [scripts/smoke.mjs](../scripts/smoke.mjs) | Tạo mới |
| [server/health.ts](../server/health.ts) | Tạo mới |
| [server/http/json.ts](../server/http/json.ts) | Tạo mới |
| [server/not-found.ts](../server/not-found.ts) | Tạo mới |
| [shared/health.ts](../shared/health.ts) | Tạo mới |
| [src/app.css](../src/app.css) | Tạo mới |
| [src/components/app-shell.tsx](../src/components/app-shell.tsx) | Tạo mới |
| [src/root.tsx](../src/root.tsx) | Tạo mới |
| [src/routes.ts](../src/routes.ts) | Tạo mới |
| [src/routes/home.tsx](../src/routes/home.tsx) | Tạo mới |
| [src/routes/system-check.tsx](../src/routes/system-check.tsx) | Tạo mới |
| [src/vite-env.d.ts](../src/vite-env.d.ts) | Tạo mới |
| [tests/health.test.ts](../tests/health.test.ts) | Tạo mới |
| [tsconfig.base.json](../tsconfig.base.json) | Tạo mới |
| [tsconfig.functions.json](../tsconfig.functions.json) | Tạo mới |
| [tsconfig.json](../tsconfig.json) | Tạo mới |
| [tsconfig.tools.json](../tsconfig.tools.json) | Tạo mới |
| [vite.config.ts](../vite.config.ts) | Tạo mới |
| [vitest.config.ts](../vitest.config.ts) | Tạo mới |
| [wrangler.jsonc](../wrangler.jsonc) | Tạo mới |

## Gói bàn giao

**Bản bàn giao mới nhất ngày 05/11/2026:** [tải toàn bộ mã nguồn, tài liệu và bằng chứng kiểm tra](../artifacts/website-tmdt-stage06-2026-11-05.zip), kèm [SHA-256](../artifacts/website-tmdt-stage06-2026-11-05.sha256). Bản này chứa đủ 115 tệp đang quản lý bằng Git, gồm 48 tệp Giai đoạn 06 liệt kê ở trên và tài liệu/bản vẽ đã có, cùng bằng chứng kiểm tra local ngày 04/11 và 05/11. Không có node_modules, .git, build/cache hoặc tệp secret. Source và hướng dẫn cũng có tại [repository GitHub](https://github.com/lilhimn204/website-tmdt).

[Gói ZIP ngày 04/11](../artifacts/website-tmdt-stage06.zip) và [SHA-256 cũ](../artifacts/website-tmdt-stage06.sha256) được giữ làm bản lưu trước khi kết nối GitHub. Dùng gói ngày 05/11 để nhận cả tài liệu trạng thái Git và kết quả kiểm tra mới nhất. Sau giải nén vào một thư mục mới, dùng hướng dẫn npm ci trong README để cài lại thư viện; không giải nén đè lên workspace đang có thay đổi riêng.

SHA-256 giúp kiểm tra tệp tải về còn nguyên. Các tệp trong artifacts được bỏ qua trong Git; khi clone từ GitHub sẽ không có gói ZIP/log/ảnh local này. Các liên kết bằng chứng local chỉ mở trên máy làm việc hoặc sau khi giải nén bản bàn giao, không phải tệp được upload lên repo.

## Những thay đổi không phải tệp source

- Git HEAD local dùng nhánh main, đã commit và push tới `origin/main` tại repo `lilhimn204/website-tmdt` do người dùng xác nhận.
- node_modules được cài và kiểm tra lại từ lockfile; .react-router, .wrangler và build là output có thể sinh lại.
- Không đổi dữ liệu kinh doanh, không tạo cloud project, không cài GitHub CLI và không nâng cấp phần mềm toàn máy.
