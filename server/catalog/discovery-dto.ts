import { isObject } from '../auth/types';
import { isSlug } from './types';
import { unavailable } from './transport';
import { productDto, variantDto, specificationDto } from './product-dto';
import { decimalPattern, decimalUnits } from './discovery-query';

export function record(v: unknown): Record<string, unknown> { if (!isObject(v)) unavailable(); return v; }
function text(v: unknown): string { if (typeof v !== 'string' || !v.trim() || v.length > 2000) unavailable(); return v; }
export function productTypeDto(value: unknown) { const v = record(value); if (!isSlug(v.code)) unavailable(); return { code: v.code, name: text(v.name) }; }
export function discoveryItem(value: unknown) {
  const v = record(value), product = productDto(v.product, false), variant = variantDto(v.variant);
  if (product.id !== variant.product_id || (product.lifecycle_status !== 'active' && variant.sales_mode !== 'not_for_sale')) unavailable();
  return { product, variant };
}
function metadata(value: unknown) {
  const v = record(value);
  const parsed = specificationDto({ ...v, required_for_publish: false, value_status: 'unknown', value: null });
  return { code: parsed.code, label: parsed.label, group_code: parsed.group_code, data_type: parsed.data_type, unit: parsed.unit, display_order: parsed.display_order };
}
function decimal(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || !decimalPattern.test(value)) unavailable(); return value;
}
export function filterDto(value: unknown) {
  const v = record(value), base = metadata(v);
  if (base.data_type === 'text') unavailable();
  const min = decimal(v.min_value), max = decimal(v.max_value);
  if (min !== null && max !== null && decimalUnits(min) > decimalUnits(max)) unavailable();
  let options: { code: string; label: string }[] | null = null;
  if (['enum', 'multi_enum'].includes(base.data_type)) {
    if (!Array.isArray(v.options) || v.options.length > 1000) unavailable();
    options = v.options.map(o => { const r = record(o); if (!isSlug(r.code)) unavailable(); return { code: r.code, label: text(r.label) }; });
    if (new Set(options.map(o => o.code)).size !== options.length) unavailable();
  } else if (v.options !== null) unavailable();
  if (base.data_type !== 'number' && (min !== null || max !== null)) unavailable();
  return { ...base, min_value: min, max_value: max, options };
}
export function comparisonRow(value: unknown, ids: string[]) {
  const v = record(value), base = metadata(v);
  if (!Array.isArray(v.cells) || v.cells.length !== ids.length) unavailable();
  const cells = v.cells.map((cell, i) => {
    const c = record(cell); if (c.variant_id !== ids[i]) unavailable();
    const parsed = specificationDto({ ...base, required_for_publish: false, value_status: c.value_status, value: c.value });
    return { variant_id: ids[i]!, value_status: parsed.value_status, value: parsed.value };
  });
  const canonical = cells.map(c => {
    if (c.value_status !== 'known') return c.value_status;
    let value = c.value;
    if (base.data_type === 'number') value = decimalUnits(String(value)).toString();
    if (base.data_type === 'enum') value = record(value).code as string;
    if (base.data_type === 'multi_enum' && Array.isArray(value)) value = JSON.stringify(value.map(o => o.code).sort());
    return JSON.stringify([c.value_status, value]);
  });
  const comparison = cells.some(c => c.value_status === 'unknown') ? 'incomplete' : new Set(canonical).size === 1 ? 'equal' : 'different';
  if (v.comparison !== comparison) unavailable();
  return { ...base, cells, comparison };
}
