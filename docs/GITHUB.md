# Git và GitHub trên Windows

Chạy từng lệnh trong **PowerShell của VS Code, tại gốc `Website TMDT`**, dùng terminal không đang chạy server. Git lưu lịch sử trên máy; GitHub là nơi lưu bản sao online. Thư mục này đã có `.git`, chưa có commit ở lần kiểm tra ban đầu; không cần khởi tạo lồng một Git repository khác.

## 1. Commit đầu tiên

```powershell
# Xem tệp chưa được Git ghi nhận, trước khi đưa chúng vào commit.
git status --short
# Kiểm tra Git đang ở nhánh nào.
git branch --show-current
```

Nếu dùng bản ZIP trên một máy/thư mục hoàn toàn mới và chưa có `.git`, chạy `git init -b main`: lệnh tạo kho Git local với nhánh main. Không cần chạy lệnh này trên workspace hiện tại.

Git cần tên và email để ghi tác giả. Hai giá trị bên dưới là chỗ bạn thay bằng tên/email của chính mình; dùng email noreply trong GitHub → Settings → Emails nếu muốn. Hai lệnh chỉ đặt thông tin cho dự án này, không đổi cấu hình Git toàn máy:

```powershell
# Thay phần trong ngoặc kép bằng tên hiển thị của bạn.
git config user.name "TEN_HIEN_THI_CUA_BAN"
# Thay bằng email hoặc email noreply của tài khoản GitHub.
git config user.email "EMAIL_GIT_CUA_BAN"
# Đặt tên nhánh hiện tại là main trước commit đầu tiên.
git branch -M main
# Chạy kiểm tra bộ khung trước khi lưu lịch sử.
npm.cmd run check
# Đưa source, tài liệu và lockfile vào vùng chuẩn bị commit; .gitignore loại tệp riêng/bản build.
git add .
# Xem chính xác danh sách tệp sẽ vào commit.
git diff --cached --name-only
# Lưu bản ghi lịch sử đầu tiên trên máy. Chỉ chạy sau khi đã xem danh sách tệp.
git commit -m "chore: initialize React and Cloudflare Pages starter"
```

Không commit `.env.local`, `.dev.vars`, token, bản backup hoặc dữ liệu khách. `package-lock.json`, `.env.example` và `.dev.vars.example` không có secret nên được commit. Những lệnh trên là hướng dẫn; xem VERIFICATION để biết lệnh nào thực tế đã được thực hiện.

## 2. Tạo repository và kết nối

Trên github.com, đăng nhập → **New repository**. Đặt tên bạn chọn; **Private** phù hợp khi repo còn chứa tài liệu nội bộ. Tạo repo rỗng, không thêm README, license hoặc `.gitignore` trên GitHub vì dự án đã có tệp riêng. Copy địa chỉ HTTPS của repo.

Trong **PowerShell cùng thư mục**, thay URL mẫu bằng URL thật. Không nhúng token vào URL:

```powershell
# Chỉ chạy khi chưa có origin; nối kho local với repo bạn vừa tạo.
git remote add origin https://github.com/TAI_KHOAN/TEN_REPO.git
# Xem lại đích fetch/push trước khi gửi source.
git remote -v
# Gửi nhánh main lần đầu, đồng thời ghi nhớ upstream cho các lần sau.
git push -u origin main
```

Git Credential Manager có thể mở trình duyệt để bạn đăng nhập. Tự nhập thông tin đăng nhập trong cửa sổ của GitHub; không đưa password/token vào mã nguồn hay terminal command. Quay lại repo GitHub để kiểm tra các tệp đã xuất hiện. [GitHub — đưa mã local lên GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).

Nếu đã có `origin`, xem bằng `git remote -v`; chỉ khi xác nhận đích sai mới dùng `git remote set-url origin URL_REPO_THAT` để đổi URL. Lệnh này sửa đích kết nối, không push.

## 3. Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `Author identity unknown` | Điền tên/email ở mục 1; không dùng nguyên chuỗi mẫu |
| `src refspec main does not match any` | Chưa có commit hoặc tên nhánh khác; kiểm tra `git status` và `git branch --show-current` |
| `remote origin already exists` | Xem remote hiện có rồi quyết định giữ/đổi URL như mục 2 |
| `Repository not found` / 403 | Kiểm tra URL, quyền repo và tài khoản đang đăng nhập qua Credential Manager |
| `non-fast-forward` | Repo online có lịch sử riêng; không force-push. Giữ nguyên cả hai lịch sử và kiểm tra nội dung repo trước khi hợp nhất |
| GitHub đòi password ở HTTPS | Dùng đăng nhập trình duyệt qua Git Credential Manager; mật khẩu tài khoản không thay cho token Git |

Không có URL repository đã xác nhận thì chưa thể nối/push đúng đích. Không tự tạo một kho public hoặc tự đoán tài khoản.
