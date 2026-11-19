import { jsonResponse } from '../http/json';
import { adminContext, authConfig, readBearer, rpc, upstream, verifyUser } from './supabase';
import type { AuthFetch } from './supabase';
import { AuthError, isObject, staffRoles, uuidPattern } from './types';
import type { AuthEnv } from './types';

const messages: Record<string, string> = {
  UNAUTHENTICATED: 'Vui lòng đăng nhập lại.', MFA_REQUIRED: 'Cần xác thực MFA trước khi truy cập quản trị.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.', ORIGIN_NOT_ALLOWED: 'Nguồn gửi yêu cầu không hợp lệ.',
  AUTH_NOT_CONFIGURED: 'Xác thực quản trị chưa được cấu hình.', AUTH_UNAVAILABLE: 'Dịch vụ xác thực tạm thời không khả dụng.',
  INVALID_ACCESS_INPUT: 'Thông tin cấp quyền không hợp lệ.', ACCESS_VERSION_CONFLICT: 'Quyền đã thay đổi. Hãy tải lại trước khi sửa.',
  LAST_OWNER_REQUIRED: 'Phải giữ ít nhất một Owner đang hoạt động.', PAYLOAD_TOO_LARGE: 'Yêu cầu vượt kích thước cho phép.',
  UNSUPPORTED_MEDIA_TYPE: 'Chỉ chấp nhận JSON.', TOO_MANY_REQUESTS: 'Vui lòng chờ trước khi thử lại.',
};
async function limitedJson(request: Request, allowEmpty = false): Promise<unknown> {
  const jsonType = request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() === 'application/json';
  if (!allowEmpty && !jsonType) throw new AuthError(415, 'UNSUPPORTED_MEDIA_TYPE');
  if (request.headers.has('Content-Encoding')) throw new AuthError(415, 'UNSUPPORTED_MEDIA_TYPE');
  const declared = request.headers.get('Content-Length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > 4096)) throw new AuthError(413, 'PAYLOAD_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) {
    if (allowEmpty) return {};
    throw new AuthError(400, 'INVALID_ACCESS_INPUT');
  }
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) { await reader.cancel(); throw new AuthError(413, 'PAYLOAD_TOO_LARGE'); }
    chunks.push(value);
  }
  // Incoming Workers POST requests can have an empty stream instead of body=null.
  if (allowEmpty && size === 0) return {};
  if (!jsonType) throw new AuthError(415, 'UNSUPPORTED_MEDIA_TYPE');
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)); }
  catch { throw new AuthError(400, 'INVALID_ACCESS_INPUT'); }
}
function validateAccess(value: unknown) {
  const keys = ['user_id', 'display_name', 'roles', 'active', 'expected_version', 'reason', 'request_id'];
  if (!isObject(value) || Object.keys(value).some(key => !keys.includes(key)) || Object.keys(value).length !== keys.length
    || typeof value.user_id !== 'string' || !uuidPattern.test(value.user_id)
    || typeof value.display_name !== 'string' || value.display_name.trim().length < 1 || value.display_name.trim().length > 100
    || typeof value.active !== 'boolean' || !Array.isArray(value.roles) || value.roles.length > 6 || (value.active && !value.roles.length)
    || new Set(value.roles).size !== value.roles.length || !value.roles.every(r => typeof r === 'string' && (staffRoles as readonly string[]).includes(r))
    || typeof value.expected_version !== 'string' || !/^(0|[1-9][0-9]{0,18})$/.test(value.expected_version) || BigInt(value.expected_version) > 9223372036854775807n
    || typeof value.reason !== 'string' || value.reason.trim().length < 3 || value.reason.trim().length > 500
    || typeof value.request_id !== 'string' || !uuidPattern.test(value.request_id)) throw new AuthError(400, 'INVALID_ACCESS_INPUT');
  return { target_user: value.user_id, staff_name: value.display_name.trim(), role_codes: value.roles, enabled: value.active,
    expected_version: value.expected_version, reason: value.reason.trim(), operation_id: value.request_id };
}

export async function handleAdminAuth(request: Request, env: AuthEnv, action: 'session' | 'access' | 'logout', fetcher: AuthFetch = fetch): Promise<Response> {
  const allowed = action === 'session' ? 'GET' : 'POST';
  if (request.method !== allowed) return jsonResponse({ error: { code: 'METHOD_NOT_ALLOWED', message: `Chỉ hỗ trợ ${allowed}.` } }, 405, { Allow: allowed });
  try {
    if (new URL(request.url).search) throw new AuthError(400, 'INVALID_ACCESS_INPUT');
    const config = authConfig(env);
    const origin = request.headers.get('Origin');
    if ((origin !== null && origin !== config.origin) || (allowed === 'POST' && origin !== config.origin)
      || request.headers.get('Sec-Fetch-Site') === 'cross-site') throw new AuthError(403, 'ORIGIN_NOT_ALLOWED');
    const token = readBearer(request);
    const input = action === 'access' ? validateAccess(await limitedJson(request)) : null;
    if (action === 'logout') {
      const body = await limitedJson(request, true);
      if (!isObject(body) || Object.keys(body).length) throw new AuthError(400, 'INVALID_ACCESS_INPUT');
    }
    const userId = await verifyUser(config, token, fetcher, action !== 'logout');
    if (action === 'logout') {
      const response = await upstream(config, fetcher, '/auth/v1/logout?scope=local', token, 'POST');
      if (!response.ok) throw new AuthError(response.status === 401 ? 401 : 503, response.status === 401 ? 'UNAUTHENTICATED' : 'AUTH_UNAVAILABLE');
      return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
    }
    const context = await adminContext(config, token, fetcher, userId);
    if (action === 'session') return jsonResponse({ data: context });
    if (!context.permissions.includes('security.manage')) throw new AuthError(403, 'FORBIDDEN');
    const result = await rpc(config, token, fetcher, 'set_admin_access', input);
    if (!isObject(result) || result.user_id !== input?.target_user || typeof result.active !== 'boolean'
      || typeof result.authz_version !== 'string' || !/^[1-9][0-9]*$/.test(result.authz_version)
      || !Array.isArray(result.roles) || result.roles.length > 6 || !result.roles.every(r => (staffRoles as readonly unknown[]).includes(r))) throw new AuthError(503, 'AUTH_UNAVAILABLE');
    return jsonResponse({ data: { user_id: result.user_id, active: result.active, roles: result.roles, authz_version: result.authz_version } });
  } catch (error) {
    const known = error instanceof AuthError ? error : new AuthError(503, 'AUTH_UNAVAILABLE');
    return jsonResponse({ error: { code: known.code, message: messages[known.code] ?? messages.AUTH_UNAVAILABLE } }, known.status,
      known.status === 401 ? { 'WWW-Authenticate': 'Bearer' } : undefined);
  }
}
