import { authConfig } from '../auth/supabase';
import type { AuthFetch } from '../auth/supabase';
import { isObject } from '../auth/types';
import { jsonResponse } from '../http/json';
import { responseDto } from './dto';
import { CommerceError, tokenPattern } from './types';
import type { CommerceAction, CommerceEnv } from './types';
import { input, readJson } from './validation';

const encoder = new TextEncoder();
function token() { return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', ''); }
function hex(bytes: ArrayBuffer) { return Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join(''); }
async function hash(value: string) { return hex(await crypto.subtle.digest('SHA-256', encoder.encode(value))); }
function sessionCookie(request: Request, name: string) {
  const header = request.headers.get('Cookie') ?? '';
  if (header.length > 8192) throw new CommerceError(400, 'INVALID_COMMERCE_INPUT');
  const values = header.split(';').map(s => s.trim()).filter(s => s.startsWith(`${name}=`));
  if (values.length > 1) throw new CommerceError(400, 'INVALID_COMMERCE_INPUT');
  const value = values[0]?.slice(name.length + 1);
  if (value !== undefined && !tokenPattern.test(value)) throw new CommerceError(401, 'GUEST_SESSION_REQUIRED');
  return value;
}
function config(env: CommerceEnv) {
  try {
    const auth = authConfig(env);
    if (!/^sb_secret_[A-Za-z0-9_-]+$/.test(env.SUPABASE_SECRET_KEY ?? '') || !tokenPattern.test(env.REQUEST_HASH_SECRET ?? '')
      || !/^[1-9][0-9]{1,4}$/.test(env.GUEST_SESSION_TTL_SECONDS ?? '')) throw new Error();
    const ttl = Number(env.GUEST_SESSION_TTL_SECONDS); if (ttl < 60 || ttl > 86400) throw new Error();
    const local = env.APP_ENV === 'local';
    if (local && !['127.0.0.1', 'localhost'].includes(new URL(auth.origin).hostname)) throw new Error();
    return { ...auth, secret: env.SUPABASE_SECRET_KEY!, hashing: env.REQUEST_HASH_SECRET!, ttl, local,
      cookie: local ? 'tmdt_guest_local' : '__Host-tmdt_guest' };
  } catch { throw new CommerceError(503, 'COMMERCE_NOT_CONFIGURED'); }
}
const messages: Record<string, string> = {
  CHECKOUT_NOT_CONFIGURED: 'Chưa có đủ chính sách bán hàng được duyệt để tính tổng.',
  CHECKOUT_REVIEW_BLOCKED: 'Giỏ hàng có sản phẩm cần kiểm tra lại.', GUEST_SESSION_REQUIRED: 'Vui lòng tạo lại phiên khách.',
  CSRF_INVALID: 'Phiên xác nhận đã thay đổi. Vui lòng tải lại.', TOO_MANY_REQUESTS: 'Vui lòng chờ trước khi thử lại.',
  COMMERCE_NOT_CONFIGURED: 'Dịch vụ giỏ hàng chưa được cấu hình.', COMMERCE_UNAVAILABLE: 'Dịch vụ giỏ hàng tạm thời không khả dụng.',
};
export async function handleCommerce(request: Request, env: CommerceEnv, action: CommerceAction, fetcher: AuthFetch = fetch): Promise<Response> {
  if (request.method !== 'POST') return jsonResponse({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ POST.' } }, 405, { Allow: 'POST' });
  try {
    const cfg = config(env);
    if (new URL(request.url).search) throw new CommerceError(400, 'INVALID_COMMERCE_INPUT');
    if (request.headers.get('Origin') !== cfg.origin || ['cross-site', 'same-site'].includes(request.headers.get('Sec-Fetch-Site') ?? '')) throw new CommerceError(403, 'ORIGIN_NOT_ALLOWED');
    const body = input(await readJson(request, 65536), action);
    const current = sessionCookie(request, cfg.cookie), fresh = token(), csrf = action === 'session' ? token() : request.headers.get('X-CSRF-Token');
    if (action !== 'session' && !current) throw new CommerceError(401, 'GUEST_SESSION_REQUIRED');
    if (!csrf || !tokenPattern.test(csrf)) throw new CommerceError(403, 'CSRF_INVALID');
    // This deployment is Cloudflare Pages only. Never accept X-Forwarded-For.
    // Local tests ignore spoofed CF headers and share one loopback bucket.
    const ip = cfg.local ? '127.0.0.1' : request.headers.get('CF-Connecting-IP');
    if (!ip || ip.length > 45 || !/^[0-9a-fA-F:.]+$/.test(ip)) throw new CommerceError(503, 'COMMERCE_NOT_CONFIGURED');
    const key = await crypto.subtle.importKey('raw', encoder.encode(cfg.hashing), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const ipHash = hex(await crypto.subtle.sign('HMAC', key, encoder.encode(`commerce-ip:${ip}`)));
    const args = { action_name: action, session_hash: await hash(current ?? fresh), csrf_hash: await hash(csrf), ip_hash: ipHash,
      body: action === 'session' ? { new_session_hash: await hash(fresh), ttl_seconds: cfg.ttl } : body };
    const upstream = await fetcher(`${cfg.url}/rest/v1/rpc/commerce_request`, {
      method: 'POST', headers: { apikey: cfg.secret, 'X-Data-Api-Gateway': cfg.gateway, 'Content-Type': 'application/json',
        Accept: 'application/json', 'Content-Profile': 'api', 'Accept-Profile': 'api' },
      body: JSON.stringify(args), redirect: 'manual', signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) throw new CommerceError(upstream.status === 429 ? 429 : 503, upstream.status === 429 ? 'TOO_MANY_REQUESTS' : 'COMMERCE_UNAVAILABLE');
    const result = responseDto(await readJson(upstream, 1024 * 1024, true), action);
    if ((action === 'cart' || action === 'preview') && result.data) {
      const lines = result.data.lines;
      const expected = body.items as { variant_id: string; quantity: number }[];
      if (!Array.isArray(lines) || lines.length !== expected.length || lines.some((line, index) => !isObject(line)
        || line.variant_id !== expected[index]!.variant_id || line.quantity !== expected[index]!.quantity)) throw new CommerceError(503, 'COMMERCE_UNAVAILABLE');
    }
    const headers: Record<string, string> = {};
    if (result.error) {
      if (result.status === 429) headers['Retry-After'] = '60';
      return jsonResponse({ error: { code: result.error, message: messages[result.error] ?? 'Không thể rà soát yêu cầu. Vui lòng kiểm tra dữ liệu.' }, ...(result.data ? { data: result.data } : {}) }, result.status, headers);
    }
    let data = result.data;
    if (action === 'session') {
      if (!isObject(data) || typeof data.expires_at !== 'string' || typeof data.reused !== 'boolean') throw new CommerceError(503, 'COMMERCE_UNAVAILABLE');
      const seconds = Math.floor((Date.parse(data.expires_at) - Date.now()) / 1000);
      // Reuse preserves the original expiry even if an operator lowers the TTL
      // for newly issued sessions. The database caps all sessions at one day.
      if (seconds < 1 || seconds > (data.reused ? 86400 : cfg.ttl + 2) || (data.reused && !current)) throw new CommerceError(503, 'COMMERCE_UNAVAILABLE');
      headers['Set-Cookie'] = `${cfg.cookie}=${data.reused ? current : fresh}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${cfg.local ? '' : '; Secure'}`;
      // Synchronizer token is returned only to the same-origin caller, never in URLs.
      data = { expires_at: data.expires_at, csrf_token: csrf };
    }
    if (action === 'logout') headers['Set-Cookie'] = `${cfg.cookie}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${cfg.local ? '' : '; Secure'}`;
    return jsonResponse({ data }, 200, headers);
  } catch (error) {
    const e = error instanceof CommerceError ? error : new CommerceError(503, 'COMMERCE_UNAVAILABLE');
    return jsonResponse({ error: { code: e.code, message: messages[e.code] ?? 'Yêu cầu không hợp lệ hoặc chưa thể xử lý.' } }, e.status,
      e.status === 429 ? { 'Retry-After': '60' } : {});
  }
}
