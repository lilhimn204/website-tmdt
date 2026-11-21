import { isObject, uuidPattern } from '../auth/types';
import { isSlug } from './types';
import { unavailable } from './transport';

type ObjectValue = Record<string, unknown>;
function object(value: unknown): ObjectValue { if (!isObject(value)) unavailable(); return value; }
function string(value: unknown, max = 2000, empty = false): string {
  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim())) unavailable(); return value;
}
function uuid(value: unknown): string { const v = string(value, 36); if (!uuidPattern.test(v)) unavailable(); return v.toLowerCase(); }
function slug(value: unknown): string { if (!isSlug(value)) unavailable(); return value; }
function choice<T extends string>(value: unknown, options: readonly T[]): T {
  if (typeof value !== 'string' || !options.includes(value as T)) unavailable(); return value as T;
}
function integer(value: unknown, min: number, max = 2147483647): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) unavailable(); return value;
}
function named(value: unknown) { const v = object(value); return { id: uuid(v.id), name: string(v.name), slug: slug(v.slug) }; }
function type(value: unknown) { const v = object(value); return { code: slug(v.code), name: string(v.name) }; }
const lifecycles = ['active', 'discontinued', 'eol'] as const;

export function productDto(value: unknown, detail: boolean) {
  const v = object(value);
  const base = { ...named(v), model_family: v.model_family === null ? null : string(v.model_family, 2000, true),
    lifecycle_status: choice(v.lifecycle_status, lifecycles), brand: named(v.brand), product_type: type(v.product_type), primary_category: named(v.primary_category) };
  return detail ? { ...base, description: string(v.description, 128000, true) } : base;
}
function priceDto(value: unknown) {
  if (value === null) return null;
  const v = object(value), amount = string(v.amount_vnd, 19);
  if (!/^[1-9][0-9]{0,18}$/.test(amount) || BigInt(amount) > 9223372036854775807n) unavailable();
  const status = choice(v.tax_status, ['taxable', 'exempt', 'not_applicable', 'unknown']);
  const rate = v.tax_rate_bps === null ? null : integer(v.tax_rate_bps, 0, 10000);
  if ((status === 'taxable' && rate === null) || (status !== 'taxable' && rate !== null)) unavailable();
  return { amount_vnd: amount, basis: choice(v.basis, ['NET', 'GROSS']), tax_status: status, tax_rate_bps: rate };
}
function warrantyDto(value: unknown) {
  if (value === null) return null;
  const v = object(value);
  return { policy_code: slug(v.policy_code), name: string(v.name), duration_months: v.duration_months === null ? null : integer(v.duration_months, 0),
    start_rule: string(v.start_rule), provider_name: string(v.provider_name), coverage: string(v.coverage),
    exclusions: string(v.exclusions, 128000, true), process: string(v.process) };
}
export function variantDto(value: unknown) {
  const v = object(value), lifecycle = choice(v.lifecycle_status, lifecycles), mode = choice(v.sales_mode, ['retail', 'quote_only', 'not_for_sale']);
  if (v.purchase_enabled !== false || (lifecycle !== 'active' && mode !== 'not_for_sale')) unavailable();
  const price = priceDto(v.price);
  if (mode === 'quote_only' && price !== null) unavailable();
  return { id: uuid(v.id), product_id: uuid(v.product_id), sku: string(v.sku), model: string(v.model), variant_label: string(v.variant_label, 2000, true),
    lifecycle_status: lifecycle, sales_mode: mode, price,
    availability: choice(v.availability, ['unknown', 'in_stock', 'out_of_stock']), warranty: warrantyDto(v.warranty), purchase_enabled: false as const };
}
function option(value: unknown) { const v = object(value); return { code: slug(v.code), label: string(v.label) }; }
export function specificationDto(value: unknown) {
  const v = object(value), dataType = choice(v.data_type, ['number', 'boolean', 'text', 'enum', 'multi_enum']);
  const status = choice(v.value_status, ['known', 'unknown', 'not_applicable', 'not_supported']);
  let unit: { code: string; name: string } | null = null;
  if (v.unit !== null) { const u = object(v.unit); unit = { code: string(u.code), name: string(u.name) }; if (dataType !== 'number') unavailable(); }
  if (typeof v.required_for_publish !== 'boolean') unavailable();
  let parsed: string | boolean | ReturnType<typeof option> | ReturnType<typeof option>[] | null = null;
  if (status !== 'known') { if (v.value !== null) unavailable(); }
  else switch (dataType) {
    case 'number': {
      const number = string(v.value, 22);
      if (!/^-?(0|[1-9][0-9]{0,13})(\.[0-9]{1,6})?$/.test(number)) unavailable(); parsed = number; break;
    }
    case 'boolean': if (typeof v.value !== 'boolean') unavailable(); parsed = v.value; break;
    case 'text': parsed = string(v.value, 128000); break;
    case 'enum': parsed = option(v.value); break;
    case 'multi_enum': {
      if (!Array.isArray(v.value) || !v.value.length || v.value.length > 1000) unavailable();
      parsed = v.value.map(option); if (new Set(parsed.map(o => o.code)).size !== parsed.length) unavailable(); break;
    }
  }
  return { code: slug(v.code), label: string(v.label), group_code: slug(v.group_code), data_type: dataType, unit,
    display_order: integer(v.display_order, -2147483648), required_for_publish: v.required_for_publish, value_status: status, value: parsed };
}
