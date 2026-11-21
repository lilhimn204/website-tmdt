import { isObject, uuidPattern } from '../auth/types';
import { CatalogError, isSlug } from './types';

export type DiscoveryRoute = 'search' | 'filters' | 'compare';
export const decimalPattern = /^-?(0|[1-9][0-9]{0,13})(\.[0-9]{1,6})?$/;
export function decimalUnits(value: string): bigint {
  const negative = value.startsWith('-'), parts = value.replace(/^-/, '').split('.');
  return (BigInt(parts[0]!) * 1000000n + BigInt((parts[1] ?? '').padEnd(6, '0'))) * (negative ? -1n : 1n);
}
export function invalidFilter(): never { throw new CatalogError(400, 'CATALOG_INVALID_FILTER'); }
function invalid(): never { throw new CatalogError(400, 'CATALOG_INVALID_QUERY'); }
function list(value: string | null, validate: (v: string) => boolean, max: number): string[] {
  if (value === null) return [];
  const values = value.split(',');
  if (!values.length || values.length > max || values.some(v => !validate(v)) || new Set(values).size !== values.length) invalid();
  return values;
}
function specFilters(raw: string | null) {
  if (raw === null) return {};
  if (new TextEncoder().encode(raw).length > 4096) invalidFilter();
  let value: unknown; try { value = JSON.parse(raw); } catch { invalidFilter(); }
  if (!isObject(value) || Object.keys(value).length > 10) invalidFilter();
  for (const [code, rule] of Object.entries(value)) {
    if (!isSlug(code) || !isObject(rule)) invalidFilter();
    const keys = Object.keys(rule);
    if ('values' in rule) {
      if (keys.length !== 1 || !Array.isArray(rule.values) || !rule.values.length || rule.values.length > 10
        || rule.values.some(v => typeof v !== 'boolean' && !isSlug(v)) || new Set(rule.values).size !== rule.values.length) invalidFilter();
    } else {
      if (!keys.length || keys.some(k => !['min', 'max'].includes(k))
        || Object.values(rule).some(v => typeof v !== 'string' || !decimalPattern.test(v))) invalidFilter();
      if (typeof rule.min === 'string' && typeof rule.max === 'string' && decimalUnits(rule.min) > decimalUnits(rule.max)) invalidFilter();
    }
  }
  return value;
}
export function discoveryQuery(request: Request, route: DiscoveryRoute, typeCode?: unknown) {
  const url = new URL(request.url), q = url.searchParams;
  if (url.search.length > 16384) invalid();
  const allowed = route === 'search' ? ['q', 'brands', 'category', 'type', 'filters', 'sort', 'limit', 'offset']
    : route === 'compare' ? ['ids', 'limit', 'after'] : ['limit', 'after'];
  for (const key of q.keys()) if (!allowed.includes(key) || q.getAll(key).length !== 1 || q.get(key) === '') invalid();
  const rawLimit = q.get('limit') ?? '20';
  if (!/^[1-9][0-9]{0,2}$/.test(rawLimit) || Number(rawLimit) > 100) invalid();
  const limit = Number(rawLimit), after = q.get('after');
  if (after !== null && !isSlug(after)) invalid();
  if (route === 'filters') {
    if (!isSlug(typeCode)) invalid();
    return { route, rpc: 'public_product_filters', args: { requested_type: typeCode, requested_limit: limit, after_code: after }, limit, after, typeCode } as const;
  }
  if (route === 'compare') {
    const ids = list(q.get('ids')?.toLowerCase() ?? null, v => uuidPattern.test(v), 3);
    if (ids.length < 2) invalid();
    return { route, rpc: 'public_compare_products', args: { variant_ids: ids, requested_limit: limit, after_code: after }, limit, after, ids } as const;
  }
  const rawQuery = q.get('q') ?? '', rawOffset = q.get('offset') ?? '0', category = q.get('category'), type = q.get('type');
  if (rawQuery.length > 200 || /\p{Cc}/u.test(rawQuery) || !/^(0|[1-9][0-9]{0,3})$/.test(rawOffset) || Number(rawOffset) > 5000
    || (category !== null && !isSlug(category)) || (type !== null && !isSlug(type))) invalid();
  const query = rawQuery.normalize('NFKC').trim().replace(/\s+/g, ' '), brands = list(q.get('brands'), isSlug, 10), filters = specFilters(q.get('filters'));
  if (query.length > 200) invalid();
  if (Object.keys(filters).length && type === null) invalidFilter();
  const sort = q.get('sort') ?? 'relevance'; if (!['relevance', 'price_asc', 'price_desc'].includes(sort)) invalid();
  const offset = Number(rawOffset);
  return { route, rpc: 'public_search_products', args: { requested_query: query, brand_slugs: brands, category_slug: category,
    type_code: type, spec_filters: filters, requested_sort: sort, requested_limit: limit, requested_offset: offset }, limit, offset,
    applied: { q: query, brands, category, type, filters, sort } } as const;
}
