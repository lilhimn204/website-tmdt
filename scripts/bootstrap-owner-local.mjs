import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

// Explicit local-only bootstrap. The user enters a confirmed Auth user's public UUID, never a password.
if (process.argv.length !== 2) throw new Error('This script accepts no remote targets or arguments.');
const terminal = createInterface({ input: process.stdin, output: process.stdout });
try {
  const id = (await terminal.question('UUID của tài khoản đã xác nhận trong Supabase Auth LOCAL: ')).trim();
  const name = (await terminal.question('Tên hiển thị của Owner: ')).trim();
  const reason = (await terminal.question('Lý do khởi tạo (không nhập PII hoặc secret): ')).trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || !name || name.length > 100 || reason.length < 3 || reason.length > 500) throw new Error('Thông tin không hợp lệ; chưa thay đổi database.');
  const literal = value => `convert_from(decode('${Buffer.from(value).toString('hex')}','hex'),'UTF8')`;
  const result = spawnSync('docker', ['exec', '-i', 'supabase_db_website-tmdt', 'psql', '-Xq', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'], {
    input: `select private.bootstrap_owner('${id}'::uuid,${literal(name)},${literal(reason)});`, encoding: 'utf8', windowsHide: true,
  });
  if (result.status !== 0) {
    const code = ['OWNER_ALREADY_BOOTSTRAPPED', 'AUTH_USER_NOT_ELIGIBLE', 'INVALID_ACCESS_INPUT'].find(c => result.stderr.includes(c));
    throw new Error(code || 'Không thể bootstrap. Kiểm tra Docker/migrations; không cấp quyền bằng metadata.');
  }
  console.log('Đã bootstrap Owner local và ghi audit. Tài khoản vẫn phải đăng nhập + MFA để dùng admin API.');
} finally { terminal.close(); }
