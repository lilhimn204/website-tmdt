import { authConfig } from '../auth/supabase';
import type { AuthEnv } from '../auth/types';
import { isObject, uuidPattern } from '../auth/types';
import { jsonResponse } from '../http/json';
import { CatalogError, isSlug } from './types';
import type { CatalogFetch, CatalogKind, PublicBrand, PublicBrandDetail, PublicCategory, PublicCategoryDetail } from './types';

const messages: Record<string, string> = {
  CATALOG_INVALID_QUERY: 'Tham số truy vấn không hợp lệ.', CATALOG_INVALID_CURSOR: 'Danh sách đã thay đổi. Hãy tải lại từ trang đầu.',
  CATALOG_NOT_FOUND: 'Không tìm thấy thương hiệu hoặc danh mục công khai.', CATALOG_NOT_CONFIGURED: 'Dữ liệu danh mục chưa được cấu hình.',
  CATALOG_UNAVAILABLE: 'Chưa tải được dữ liệu. Vui lòng thử lại.', CATALOG_RATE_LIMITED: 'Vui lòng chờ trước khi tải lại.',
};
function unavailable(): never { throw new CatalogError(503, 'CATALOG_UNAVAILABLE'); }
function queryFor(request: Request, kind: CatalogKind, slug: unknown) {
  const params = new URL(request.url).searchParams;
  if (new URL(request.url).search.length > 1024) throw new CatalogError(400, 'CATALOG_INVALID_QUERY');
  if (slug !== undefined) {
    if (!isSlug(slug) || params.size) throw new CatalogError(400, 'CATALOG_INVALID_QUERY');
    return { rpc: kind === 'brands' ? 'public_brand' : 'public_category', args: { requested_slug: slug }, limit: 1, detail: true as const };
  }
  const allowed = kind === 'brands' ? ['limit', 'after'] : ['limit', 'after', 'parent'];
  for (const key of params.keys()) if (!allowed.includes(key) || params.getAll(key).length !== 1) throw new CatalogError(400, 'CATALOG_INVALID_QUERY');
  const rawLimit = params.get('limit') ?? '20';
  if (!/^[1-9][0-9]{0,2}$/.test(rawLimit) || Number(rawLimit) > 100) throw new CatalogError(400, 'CATALOG_INVALID_QUERY');
  const after = params.get('after'), parent = params.get('parent');
  if ((after !== null && !isSlug(after)) || (parent !== null && !isSlug(parent))) throw new CatalogError(400, 'CATALOG_INVALID_QUERY');
  return { rpc: kind === 'brands' ? 'public_brands' : 'public_categories',
    args: { requested_limit: Number(rawLimit), after_slug: after, ...(kind === 'categories' ? { parent_slug: parent } : {}) }, limit: Number(rawLimit), detail: false as const };
}

async function boundedJson(response: Response): Promise<unknown> {
  if (!response.headers.get('Content-Type')?.toLowerCase().includes('application/json')) unavailable();
  const maxBytes = 256 * 1024;
  const declared = response.headers.get('Content-Length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) unavailable();
  const reader = response.body?.getReader();
  if (!reader) unavailable();
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) { await reader.cancel(); unavailable(); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)); } catch { return unavailable(); }
}
function brand(value: unknown): PublicBrand {
  if (!isObject(value) || typeof value.id !== 'string' || !uuidPattern.test(value.id) || typeof value.name !== 'string'
    || !value.name.trim() || value.name.length > 2000 || !isSlug(value.slug)) unavailable();
  return { id: value.id, name: value.name, slug: value.slug };
}
function item(value: unknown, kind: CatalogKind, detail: boolean): PublicBrand | PublicBrandDetail | PublicCategory | PublicCategoryDetail {
  const base = brand(value);
  if (!isObject(value)) return unavailable();
  if (kind === 'brands') {
    if (!detail) return base;
    if (typeof value.description !== 'string') unavailable();
    return { ...base, description: value.description };
  }
  if (!(value.parent_slug === null || isSlug(value.parent_slug)) || typeof value.sort_order !== 'number' || !Number.isInteger(value.sort_order)
    || value.sort_order < -2147483648 || value.sort_order > 2147483647) unavailable();
  let productType: PublicCategory['product_type'] = null;
  if (value.product_type !== null) {
    if (!isObject(value.product_type) || !isSlug(value.product_type.code) || typeof value.product_type.name !== 'string'
      || !value.product_type.name.trim() || value.product_type.name.length > 2000) unavailable();
    productType = { code: value.product_type.code, name: value.product_type.name };
  }
  const category: PublicCategory = { ...base, parent_slug: value.parent_slug, sort_order: value.sort_order, product_type: productType };
  if (!detail) return category;
  if (!Array.isArray(value.breadcrumbs) || !value.breadcrumbs.length) unavailable();
  const breadcrumbs = value.breadcrumbs.map(b => {
    if (!isObject(b) || !isSlug(b.slug) || typeof b.name !== 'string' || !b.name.trim() || b.name.length > 2000) unavailable();
    return { name: b.name, slug: b.slug };
  });
  const last = breadcrumbs.at(-1)!;
  if (last.slug !== category.slug || last.name !== category.name || new Set(breadcrumbs.map(b => b.slug)).size !== breadcrumbs.length
    || (category.parent_slug === null ? breadcrumbs.length !== 1 : breadcrumbs.at(-2)?.slug !== category.parent_slug)) unavailable();
  return { ...category, breadcrumbs };
}

export async function handlePublicCatalog(request: Request, env: AuthEnv, kind: CatalogKind, slug?: unknown, fetcher: CatalogFetch = fetch): Promise<Response> {
  const respond = (body: unknown, status = 200, headers?: HeadersInit) => {
    const result = jsonResponse(body, status, headers);
    return request.method === 'HEAD' ? new Response(null, { status: result.status, headers: result.headers }) : result;
  };
  if (!['GET', 'HEAD'].includes(request.method)) return respond({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ GET, HEAD.' } }, 405, { Allow: 'GET, HEAD' });
  try {
    const query = queryFor(request, kind, slug);
    let config;
    try { config = authConfig(env); } catch { throw new CatalogError(503, 'CATALOG_NOT_CONFIGURED'); }
    // No caller JWT/cookie is forwarded. Public projections always run as anon.
    const response = await fetcher(`${config.url}/rest/v1/rpc/${query.rpc}`, {
      method: 'POST', headers: { apikey: config.key, 'X-Data-Api-Gateway': config.gateway,
        'Content-Type': 'application/json', Accept: 'application/json', 'Content-Profile': 'api', 'Accept-Profile': 'api' },
      body: JSON.stringify(query.args), redirect: 'manual', signal: AbortSignal.timeout(8000),
    });
    if (response.status === 429) throw new CatalogError(429, 'CATALOG_RATE_LIMITED');
    if (response.status >= 300 && response.status < 400) unavailable();
    const data = await boundedJson(response);
    if (!response.ok) {
      if (isObject(data)) {
        if (data.message === 'GATEWAY_REQUIRED') throw new CatalogError(503, 'CATALOG_NOT_CONFIGURED');
        if (data.code === 'PT404' && data.message === 'CATALOG_NOT_FOUND') throw new CatalogError(404, 'CATALOG_NOT_FOUND');
        if (data.code === '22023' && ['CATALOG_INVALID_QUERY', 'CATALOG_INVALID_CURSOR'].includes(String(data.message))) throw new CatalogError(400, String(data.message));
      }
      unavailable();
    }
    if (query.detail) {
      const dto = item(data, kind, true);
      if (dto.slug !== slug) unavailable();
      return respond({ data: dto });
    }
    if (!isObject(data) || !Array.isArray(data.items) || data.items.length > query.limit || !(data.next_cursor === null || isSlug(data.next_cursor))) unavailable();
    const items = data.items.map(value => item(value, kind, false));
    if (new Set(items.map(i => i.id)).size !== items.length || new Set(items.map(i => i.slug)).size !== items.length
      || (data.next_cursor !== null && (items.length !== query.limit || items.at(-1)?.slug !== data.next_cursor))) unavailable();
    if (kind === 'categories' && items.some(i => (i as PublicCategory).parent_slug !== query.args.parent_slug)) unavailable();
    return respond({ data: items, page: { limit: query.limit, next_cursor: data.next_cursor, has_more: data.next_cursor !== null } });
  } catch (error) {
    const known = error instanceof CatalogError ? error : new CatalogError(503, 'CATALOG_UNAVAILABLE');
    return respond({ error: { code: known.code, message: messages[known.code] ?? messages.CATALOG_UNAVAILABLE } }, known.status);
  }
}
