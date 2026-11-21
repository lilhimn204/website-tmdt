import type { AuthEnv } from '../auth/types';
import { isObject, uuidPattern } from '../auth/types';
import { jsonResponse } from '../http/json';
import { CatalogError, isSlug } from './types';
import type { CatalogFetch } from './types';
import { publicRpc, unavailable } from './transport';
import { productDto, variantDto, specificationDto } from './product-dto';

export type ProductRoute = 'products' | 'product' | 'variants' | 'variant' | 'specifications';
export interface ProductParams { slug?: unknown; variantId?: unknown }
const isUuid = (v: unknown): v is string => typeof v === 'string' && uuidPattern.test(v);
const invalid = (): never => { throw new CatalogError(400, 'CATALOG_INVALID_QUERY'); };
const messages: Record<string, string> = {
  CATALOG_INVALID_QUERY: 'Tham số truy vấn không hợp lệ.', CATALOG_INVALID_CURSOR: 'Danh sách đã thay đổi. Hãy tải lại từ trang đầu.',
  CATALOG_NOT_FOUND: 'Không tìm thấy dữ liệu công khai.', CATALOG_NOT_CONFIGURED: 'Dữ liệu danh mục chưa được cấu hình.',
  CATALOG_UNAVAILABLE: 'Chưa tải được dữ liệu. Vui lòng thử lại.', CATALOG_RATE_LIMITED: 'Vui lòng chờ trước khi tải lại.',
};
function queryFor(request: Request, route: ProductRoute, params: ProductParams) {
  const url = new URL(request.url), q = url.searchParams;
  const detail = route === 'product' || route === 'variant';
  if (url.search.length > 1024 || (route !== 'products' && !isSlug(params.slug))
    || (['variant', 'specifications'].includes(route) && !isUuid(params.variantId))) invalid();
  for (const key of q.keys()) if (detail || !['limit', 'after'].includes(key) || q.getAll(key).length !== 1) invalid();
  const rawLimit = q.get('limit') ?? '20';
  if (!/^[1-9][0-9]{0,2}$/.test(rawLimit) || Number(rawLimit) > 100) invalid();
  const limit = Number(rawLimit), after = q.get('after');
  if (after !== null && !(route === 'variants' ? isUuid(after) : isSlug(after))) invalid();
  const scoped = { requested_slug: params.slug }, scopedVariant = { ...scoped, requested_variant_id: typeof params.variantId === 'string' ? params.variantId.toLowerCase() : params.variantId };
  const endpoints = {
    products: { rpc: 'public_products', args: { requested_limit: limit, after_slug: after } },
    product: { rpc: 'public_product', args: scoped },
    variants: { rpc: 'public_product_variants', args: { ...scoped, requested_limit: limit, after_id: after?.toLowerCase() ?? null } },
    variant: { rpc: 'public_product_variant', args: scopedVariant },
    specifications: { rpc: 'public_variant_specifications', args: { ...scopedVariant, requested_limit: limit, after_code: after } },
  };
  return { ...endpoints[route], detail, limit, after: route === 'variants' ? after?.toLowerCase() ?? null : after };
}
export async function handlePublicProducts(request: Request, env: AuthEnv, route: ProductRoute, params: ProductParams = {}, fetcher: CatalogFetch = fetch): Promise<Response> {
  const respond = (body: unknown, status = 200, headers?: HeadersInit) => {
    const result = jsonResponse(body, status, headers);
    return request.method === 'HEAD' ? new Response(null, { status, headers: result.headers }) : result;
  };
  if (!['GET', 'HEAD'].includes(request.method)) return respond({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ GET, HEAD.' } }, 405, { Allow: 'GET, HEAD' });
  try {
    const query = queryFor(request, route, params), data = await publicRpc(env, query.rpc, query.args, fetcher);
    if (route === 'product') {
      const product = productDto(data, true); if (product.slug !== params.slug) unavailable(); return respond({ data: product });
    }
    if (route === 'variant') {
      const variant = variantDto(data); if (variant.id !== String(params.variantId).toLowerCase()) unavailable(); return respond({ data: variant });
    }
    const validCursor = route === 'variants' ? isUuid : isSlug;
    if (!isObject(data) || !Array.isArray(data.items) || data.items.length > query.limit || !(data.next_cursor === null || validCursor(data.next_cursor))) unavailable();
    const items = route === 'products' ? data.items.map(v => productDto(v, false))
      : route === 'variants' ? data.items.map(variantDto) : data.items.map(specificationDto);
    const keys = items.map(i => 'code' in i ? i.code : 'slug' in i ? i.slug : i.id);
    if (new Set(keys).size !== items.length || keys.includes(query.after ?? '')
      || (data.next_cursor !== null && (items.length !== query.limit || keys.at(-1) !== data.next_cursor))) unavailable();
    const ids = items.flatMap(i => 'id' in i ? [i.id] : []);
    if (new Set(ids).size !== ids.length) unavailable();
    return respond({ data: items, page: { limit: query.limit, next_cursor: data.next_cursor, has_more: data.next_cursor !== null } });
  } catch (error) {
    const known = error instanceof CatalogError ? error : new CatalogError(503, 'CATALOG_UNAVAILABLE');
    return respond({ error: { code: known.code, message: messages[known.code] ?? messages.CATALOG_UNAVAILABLE } }, known.status);
  }
}
