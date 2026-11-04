# Website TMĐT — dự án khởi tạo

Giai đoạn 06. React + Vite + TypeScript strict + Tailwind CSS + React Router, cùng Cloudflare Pages Functions. Chỉ có màn hình khởi tạo, màn hình kiểm tra API và endpoint health. Chưa có catalog, giỏ hàng, đơn hàng, thanh toán, đăng nhập hoặc kết nối Supabase.

Các tệp mã nguồn đã được tạo đầy đủ trong thư mục này. Không chạy lại công cụ tạo template trên thư mục đang có tài liệu. Xem [danh sách tệp bàn giao](docs/FILES.md), [kết quả kiểm tra thực tế](docs/VERIFICATION.md) và [checklist nghiệm thu](docs/SETUP_CHECKLIST.md).

## 1. Công cụ trên Windows

Đã kiểm tra trên máy này: Node.js **24.15.0**, npm **11.12.1**, VS Code **1.125.1**, Git **2.53.0.windows.2**. Không cài lại hoặc nâng cấp phần mềm toàn máy trong lần khởi tạo này. GitHub CLI chưa có; hướng dẫn Git bên dưới không cần CLI đó.

Nếu dùng máy mới:

1. Tải **Node.js 24 LTS**, Windows Installer `.msi` đúng kiến trúc máy, từ [Node.js](https://nodejs.org/en/download). Cài theo trình hướng dẫn, giữ npm và Add to PATH. Dự án kiểm thử với 24.15.0 và giới hạn nhánh 24.x; khi cập nhật bản vá, cập nhật `.node-version`, `.nvmrc` và chạy lại kiểm tra. Node 26 cũng đang là LTS tại ngày tra cứu nhưng chưa là phiên bản kiểm thử của dự án này. [Lịch phát hành Node](https://nodejs.org/en/about/previous-releases).
2. Tải **VS Code User Installer** từ [hướng dẫn chính thức](https://code.visualstudio.com/docs/setup/windows). Chọn Add to PATH; mở lại terminal sau cài đặt.
3. Tải **Git for Windows** từ [Git chính thức](https://git-scm.com/install/windows). Giữ Git Credential Manager để đăng nhập GitHub qua trình duyệt khi push; chọn dùng Git từ terminal.
4. Mở VS Code → **File → Open Folder** → chọn `C:\Users\Minh\Documents\ChatGPT\Website TMDT`.
5. Chọn **Terminal → New Terminal**. Menu cạnh dấu `+` → **PowerShell**. Mọi lệnh trong README chạy ở PowerShell của VS Code, không phải ô chat, không phải Python hoặc cửa sổ trình duyệt. Không cần Run as administrator.

Chạy từng dòng trong **terminal A**. Phần bắt đầu bằng `#` chỉ giải thích, PowerShell bỏ qua:

```powershell
# Đi vào đúng thư mục dự án; dấu ngoặc kép giữ đường dẫn có khoảng trắng.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Xem phiên bản Node đang được terminal sử dụng.
node --version
# Xem phiên bản npm; .cmd tránh lỗi PowerShell chặn npm.ps1.
npm.cmd --version
# Xem phiên bản Git.
git --version
# Xem phiên bản VS Code nếu lệnh code đã có trong PATH.
code --version
```

## 2. Cài thư viện và chạy lần đầu

Thư viện được khóa bằng phiên bản cụ thể trong `package.json` và `package-lock.json`. Lần tạo này dùng React 19.3.1, React Router 8.5.1, Vite 8.3.5, Tailwind 4.3.4, TypeScript 5.9.3, ESLint 10.14.0, Vitest 5.1.0 và Wrangler 4.157.0. TypeScript 5.9.3 được chọn trong khoảng hỗ trợ của toolchain, không tự nâng lên major mới.

Trong **terminal A**, tại thư mục gốc dự án:

```powershell
# Cài đúng các phiên bản đã khóa. Chỉ cần chạy lần đầu hoặc khi nhận lockfile mới.
npm.cmd ci
# Kiểm tra kiểu dữ liệu, lint, test, build HTML và biên dịch Pages Functions.
npm.cmd run check
# Chạy bản đã build và API bằng Cloudflare runtime local ở cổng 8788.
npm.cmd run pages:dev
```

Chỉ chạy dòng sau khi dòng trước thành công. Mở **http://127.0.0.1:8788** trong trình duyệt → **Kiểm tra API** → **Kiểm tra kết nối**. Thông báo thành công chỉ xác nhận API health, không xác nhận Supabase hoạt động.

Giữ terminal A mở khi dùng website. Nhấn **Ctrl+C** ở terminal đó để dừng. Không cần tài khoản Cloudflare, Supabase hoặc nhập secret để chạy các màn hình hiện tại.

Sau khi sửa mã nguồn, muốn xem bản build mới trong **terminal A**: dừng bằng Ctrl+C rồi chạy lệnh sau. Lệnh `preview` tự build trước khi bật Pages local:

```powershell
# Tạo bản build mới rồi phục vụ frontend và API tại 127.0.0.1:8788.
npm.cmd run preview
```

## 3. Chế độ phát triển: hai terminal

Chế độ này tự cập nhật giao diện khi lưu tệp.

**Terminal A:** chạy `npm.cmd run pages:dev` như mục 2 để API hoạt động tại 8788. Nếu thư mục `build/client` chưa tồn tại, chạy `npm.cmd run build` trước; lệnh build tạo HTML/assets cần cho Pages.

**Terminal B:** bấm dấu `+` trong bảng Terminal để mở thêm PowerShell. Đảm bảo đang ở cùng thư mục dự án:

```powershell
# Đặt thư mục làm việc của terminal B.
Set-Location "C:\Users\Minh\Documents\ChatGPT\Website TMDT"
# Chạy Vite + React Router, cập nhật frontend khi lưu file, cổng 5173.
npm.cmd run dev
```

Mở **http://127.0.0.1:5173**. Vite chuyển request `/api` tới Pages ở 8788. Nếu chỉ mở Vite, giao diện vẫn xem được nhưng nút kiểm tra API sẽ báo chưa kết nối. Đây là trạng thái đúng, không có API giả.

`npm.cmd run test:watch` chạy Vitest theo dõi thay đổi; dùng **terminal C** nếu A/B đang chạy server. Nhấn Ctrl+C để thoát.

## 4. Các lệnh kiểm tra

Chạy trong một PowerShell còn trống tại gốc dự án. Các script đã tự lấy công cụ trong `node_modules`, không cần cài toàn máy.

| Lệnh | Giải thích |
|---|---|
| `npm.cmd run typecheck` | Sinh kiểu route và kiểm tra TypeScript cho frontend, Functions, test/config; không xuất mã JS |
| `npm.cmd run lint` | Kiểm tra quy tắc mã, React Hooks và ranh giới import frontend/backend |
| `npm.cmd test` | Chạy Vitest một lần; lỗi trả exit code khác 0 |
| `npm.cmd run build` | Dùng Vite qua React Router để tạo HTML/assets tại `build/client` |
| `npm.cmd run pages:check` | Biên dịch Pages Functions local, không upload hoặc deploy |
| `npm.cmd run check` | Chạy lần lượt toàn bộ năm kiểm tra trên, dừng khi có lỗi |
| `npm.cmd run smoke` | Gửi HTTP tới Pages đang chạy ở 8788: HTML có sẵn, CSS, API health, HEAD/405 và 404 thật |

Để chạy `smoke`, giữ `pages:dev` ở terminal A và chạy lệnh trong terminal B/C. Smoke chỉ cho phép localhost. Bộ test hiện tại kiểm tra bộ khung, không chứng minh giao dịch bán hàng hay bảo mật production.

## 5. Cấu trúc thư mục

```text
Website TMDT/
├── src/                         Frontend; React Router dùng src làm appDirectory
│   ├── components/app-shell.tsx Khung điều hướng của trang khởi tạo
│   ├── routes/home.tsx          Trang /, HTML được prerender
│   ├── routes/system-check.tsx  Trang /kiem-tra, nút gọi API thật
│   ├── app.css                  Tailwind 4 và nền tảng CSS
│   ├── root.tsx                 Tài liệu HTML, layout và error boundary
│   ├── routes.ts                Khai báo đường dẫn
│   └── vite-env.d.ts            Kiểu biến công khai của Vite
├── functions/api/               Entrypoints Cloudflare Pages Functions
│   ├── v1/health.ts             GET/HEAD /api/v1/health
│   └── [[path]].ts              JSON 404 cho API chưa tồn tại
├── server/                     Mã chỉ dành cho backend, không import vào src
│   ├── health.ts
│   ├── not-found.ts
│   └── http/json.ts
├── shared/health.ts             Hợp đồng dữ liệu health; không chứa secret
├── public/                     Tệp static được chép vào bản build
│   ├── 404.html
│   ├── _headers
│   ├── _routes.json
│   └── robots.txt
├── tests/health.test.ts         Test HTTP contract bằng Vitest
├── scripts/smoke.mjs            Kiểm tra HTTP trên runtime local
├── docs/                       Hướng dẫn và bằng chứng Giai đoạn 06
│   ├── CLOUDFLARE.md
│   ├── FILES.md
│   ├── GITHUB.md
│   ├── SETUP_CHECKLIST.md
│   └── VERIFICATION.md
├── .vscode/                    Gợi ý extension và cấu hình editor
├── .env.example                Biến công khai, không có secret
├── .dev.vars.example           Mẫu biến server local, không có secret
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .node-version
├── .npmrc
├── .nvmrc
├── package.json
├── package-lock.json
├── react-router.config.ts
├── vite.config.ts
├── vitest.config.ts
├── eslint.config.js
├── tsconfig.base.json
├── tsconfig.json
├── tsconfig.functions.json
├── tsconfig.tools.json
├── wrangler.jsonc
├── README.md
├── ARCHITECTURE.md              Tài liệu kiến trúc và ghi chú phạm vi khởi tạo
├── PROJECT_CONTEXT.md           Trạng thái công việc
├── architecture/ERD.md          Tài liệu đã có từ Giai đoạn 05
└── design/                     Tài liệu/bản vẽ Giai đoạn 04 được giữ nguyên
```

Các tài liệu nghiệp vụ/PRD/database/sitemap gốc vẫn được giữ. `node_modules`, `.react-router`, `.wrangler`, `build`, `artifacts` được sinh trên máy và bỏ qua trong Git. `build/client` là thư mục phát hành; `dist` không phải output của cấu hình React Router này.

## 6. Biến môi trường và secret

Bản khởi tạo chạy được khi chưa tạo `.env.local` hoặc `.dev.vars`. Muốn đổi tên hiển thị, dùng **terminal PowerShell trống tại gốc**:

```powershell
# Chỉ tạo tệp riêng cho máy nếu chưa có; không ghi đè tệp cấu hình đang tồn tại.
if (-not (Test-Path -LiteralPath '.env.local')) { Copy-Item -LiteralPath '.env.example' -Destination '.env.local' }
```

Mở `.env.local` trong VS Code, sửa `VITE_APP_NAME`, rồi khởi động lại Vite/build. Tên bắt đầu `VITE_` sẽ nằm trong bundle trình duyệt: **không đặt password, Supabase secret/service-role key, database URL chứa password hoặc token deploy ở đây**. [Vite — biến môi trường](https://vite.dev/guide/env-and-mode.html).

Khi giai đoạn backend cần secret, `.dev.vars` dùng cho Wrangler local; Cloudflare dashboard **Secrets** dùng cho runtime online. Các dòng Supabase đang comment trong tệp mẫu chỉ là vị trí dự kiến, chưa được ứng dụng đọc và chưa cần điền. Không gửi secret qua chat hoặc commit Git.

## 7. GitHub, commit đầu tiên và Cloudflare

- Repository đã kết nối: [lilhimn204/website-tmdt](https://github.com/lilhimn204/website-tmdt), nhánh `main`. Bộ khung đã được commit/push; bạn không cần tạo lại repo hoặc commit khởi tạo.
- [Hướng dẫn commit đầu tiên và nối GitHub](docs/GITHUB.md): giải thích từng lệnh PowerShell, đăng nhập qua Git Credential Manager, xử lý lỗi push.
- [Cấu hình Cloudflare Pages](docs/CLOUDFLARE.md): build command, output, Node, Functions routing và những việc chưa triển khai online.
- Trạng thái remote/push thực tế nằm trong [biên bản kiểm tra](docs/VERIFICATION.md). Tệp cấu hình local không đồng nghĩa đã tạo repository hoặc triển khai cloud.

## 8. Lỗi cài đặt thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| `node` / `git` / `code` không được nhận diện | Đóng VS Code, mở lại sau cài đặt. Kiểm tra tùy chọn Add to PATH. Nếu riêng `code` thiếu, mở VS Code từ Start Menu và Open Folder; không cản chạy dự án |
| `npm.ps1 cannot be loaded` | Dùng `npm.cmd` như hướng dẫn; không cần tắt chính sách bảo vệ PowerShell toàn máy |
| `EBADENGINE` | Kiểm tra `node --version`; cài nhánh Node 24 LTS phù hợp `engines`. `.nvmrc` chỉ ghi phiên bản, không tự cài Node khi chưa có version manager |
| `ENOENT ... package.json` | Terminal đang sai thư mục; chạy lại `Set-Location` ở mục 1 |
| `npm ci` báo package/lockfile không đồng bộ | Giữ lại lỗi, kiểm tra thay đổi `package.json`; nếu chủ ý đổi thư viện, dùng `npm.cmd install` để cập nhật lockfile rồi `npm.cmd run check`. Không xóa lockfile để bỏ qua lỗi |
| Mạng/proxy làm npm timeout | Kiểm tra mạng; thử lại `npm.cmd ci`. Dùng proxy đúng của đơn vị nếu có; không tắt kiểm tra SSL |
| Cổng 5173/8788 đã được dùng | Dừng terminal server cũ bằng Ctrl+C. Không tắt tiến trình không rõ nguồn gốc. Vite dùng strictPort để tránh âm thầm đổi cổng/proxy |
| `build/client` chưa tồn tại | Chạy `npm.cmd run build` trước `pages:dev` |
| Trang mở được nhưng API lỗi | Giữ terminal A chạy `pages:dev`, kiểm tra http://127.0.0.1:8788/api/v1/health. Khi dùng Vite, cần cả A và B |
| Thay tệp mà Pages chưa đổi giao diện | Pages phục vụ bản build; Ctrl+C rồi `npm.cmd run preview`, hoặc dùng Vite ở 5173 để sửa giao diện |
| `Cannot find module ./+types/...` | Chạy `npm.cmd run typecheck`; React Router sinh kiểu route. Nếu VS Code còn báo đỏ, dùng lệnh “TypeScript: Restart TS Server” trong Command Palette |
| `EPERM` / tệp bị khóa trên Windows | Dừng các server liên quan, đóng tác vụ đang giữ file và thử lại; không xóa thư mục ngoài dự án hoặc tắt antivirus toàn máy |
| `workerd`/Wrangler không khởi động | Đọc lỗi trong terminal, dùng Windows 64-bit được hỗ trợ và Node đúng phiên bản; `pages:check` chỉ biên dịch, chưa chứng minh runtime. Không bỏ qua lỗi rồi coi API đã chạy |

## 9. Quyết định triển khai bộ khung

React Router Framework Mode dùng Vite với `ssr: false` và prerender hai trang. Không có server Node/Express phải chạy trên Cloudflare. Tailwind dùng plugin Vite của phiên bản 4, không cần lệnh `tailwindcss init -p` của hướng dẫn cũ. [React Router — prerender](https://reactrouter.com/how-to/pre-rendering), [Tailwind — Vite](https://tailwindcss.com/docs/installation/using-vite).

`404.html` giữ HTTP 404 thật; chưa có route bán hàng cần SPA rewrite. `_routes.json` chỉ gọi Functions cho `/api`, giúp static assets không đi qua API. Mọi trang starter có noindex; khi phát triển SEO thật phải đổi cả meta và `_headers`, không chỉ robots.txt. [Cloudflare — serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/), [Functions routing](https://developers.cloudflare.com/pages/functions/routing/).

Spec Kit được áp dụng qua phạm vi, checklist, ghi nhận quyết định và bằng chứng kiểm tra. Impeccable được áp dụng vào trạng thái chưa kiểm tra/đang chờ/thành công/lỗi rõ ràng, keyboard focus và bố cục nhỏ gọn. Hai bộ công cụ không được cài tự động. Hướng nhận diện A/B/C và các quy tắc tiền/tồn/giữ hàng chưa được tự chốt trong lần khởi tạo.
