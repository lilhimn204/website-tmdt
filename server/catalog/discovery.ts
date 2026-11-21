import type { AuthEnv } from '../auth/types';
import { jsonResponse } from '../http/json';
import { CatalogError, isSlug } from './types';
import type { CatalogFetch } from './types';
import { publicRpc, unavailable } from './transport';
import { discoveryQuery } from './discovery-query';
import type { DiscoveryRoute } from './discovery-query';
import { record, productTypeDto, discoveryItem, filterDto, comparisonRow } from './discovery-dto';

const messages: Record<string, string> = {
  CATALOG_INVALID_QUERY: 'Tham số truy vấn không hợp lệ.', CATALOG_INVALID_CURSOR: 'Danh sách đã thay đổi. Hãy tải lại từ trang đầu.',
  CATALOG_INVALID_FILTER: 'Bộ lọc không phù hợp với loại sản phẩm hoặc dữ liệu hiện có.',
  CATALOG_INCOMPATIBLE_COMPARISON: 'Chỉ so sánh 2–3 SKU thuộc cùng một loại sản phẩm.',
  CATALOG_NOT_FOUND: 'Không tìm thấy dữ liệu công khai.', CATALOG_NOT_CONFIGURED: 'Dữ liệu danh mục chưa được cấu hình.',
  CATALOG_UNAVAILABLE: 'Chưa tải được dữ liệu. Vui lòng thử lại.', CATALOG_RATE_LIMITED: 'Vui lòng chờ trước khi tải lại.',
};
function count(v: unknown): number { if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0 || v > 2147483647) unavailable(); return v; }
function cursorPage(data: Record<string, unknown>, items: { code: string }[], limit: number, after: string | null) {
  if (!(data.next_cursor === null || isSlug(data.next_cursor)) || items.length > limit
    || new Set(items.map(i => i.code)).size !== items.length || items.some(i => i.code === after)
    || (data.next_cursor !== null && (items.length !== limit || items.at(-1)?.code !== data.next_cursor))) unavailable();
  return { limit, next_cursor: data.next_cursor, has_more: data.next_cursor !== null };
}
export async function handlePublicDiscovery(request: Request, env: AuthEnv, route: DiscoveryRoute, typeCode?: unknown, fetcher: CatalogFetch = fetch): Promise<Response> {
  const respond = (body: unknown, status = 200, headers?: HeadersInit) => {
    const result = jsonResponse(body, status, headers);
    return request.method === 'HEAD' ? new Response(null, { status, headers: result.headers }) : result;
  };
  if (!['GET', 'HEAD'].includes(request.method)) return respond({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ GET, HEAD.' } }, 405, { Allow: 'GET, HEAD' });
  try {
    const query = discoveryQuery(request, route, typeCode), data = record(await publicRpc(env, query.rpc, query.args, fetcher));
    if (!Array.isArray(data.items)) unavailable();
    if (query.route === 'search') {
      const items = data.items.map(item => {
        const v = record(item), parsed = discoveryItem(v);
        if (typeof v.match_type !== 'string' || !['exact', 'prefix', 'text', 'browse'].includes(v.match_type)) unavailable();
        if ((query.applied.type !== null && parsed.product.product_type.code !== query.applied.type)
          || (query.applied.brands.length && !query.applied.brands.includes(parsed.product.brand.slug))) unavailable();
        return { ...parsed, match_type: v.match_type };
      });
      const total = count(data.total), totalProducts = count(data.total_products);
      if (totalProducts > total || (total === 0 ? totalProducts !== 0 : totalProducts === 0)
        || items.length !== Math.min(query.limit, Math.max(0, total - query.offset))
        || new Set(items.map(i => i.variant.id)).size !== items.length) unavailable();
      const next = query.offset + items.length, hasMore = next < total, truncated = hasMore && next > 5000;
      return respond({ data: items, query: query.applied,
        page: { limit: query.limit, offset: query.offset, total, total_products: totalProducts, has_more: hasMore, next_offset: hasMore && !truncated ? next : null, truncated } });
    }
    const productType = productTypeDto(data.product_type);
    if (query.route === 'filters') {
      if (productType.code !== query.typeCode) unavailable();
      const items = data.items.map(filterDto), page = cursorPage(data, items, query.limit, query.after);
      return respond({ data: { product_type: productType, filters: items }, page });
    }
    const items = data.items.map(discoveryItem);
    if (items.length !== query.ids.length || items.some((i, index) => i.variant.id !== query.ids[index]
      || i.product.product_type.code !== productType.code || i.product.product_type.name !== productType.name) || !Array.isArray(data.rows)) unavailable();
    const rows = data.rows.map(row => comparisonRow(row, query.ids)), page = cursorPage(data, rows, query.limit, query.after);
    return respond({ data: { product_type: productType, items, rows }, page });
  } catch (error) {
    const known = error instanceof CatalogError ? error : new CatalogError(503, 'CATALOG_UNAVAILABLE');
    return respond({ error: { code: known.code, message: messages[known.code] ?? messages.CATALOG_UNAVAILABLE } }, known.status);
  }
}
