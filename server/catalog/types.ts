export interface PublicBrand { id: string; name: string; slug: string }
export interface PublicBrandDetail extends PublicBrand { description: string }
export interface PublicCategory extends PublicBrand {
  parent_slug: string | null;
  sort_order: number;
  product_type: { code: string; name: string } | null;
}
export interface PublicCategoryDetail extends PublicCategory { breadcrumbs: { name: string; slug: string }[] }
export type CatalogKind = 'brands' | 'categories';
export type CatalogFetch = (url: string, init: RequestInit) => Promise<Response>;
export class CatalogError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
export function isSlug(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= 160 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}
