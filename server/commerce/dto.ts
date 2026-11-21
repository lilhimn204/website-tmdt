import { isObject, uuidPattern } from '../auth/types';
import { variantDto } from '../catalog/product-dto';
import { CommerceError, errorStatuses, hashPattern, lineIssues } from './types';
import type { CommerceAction } from './types';
function unavailable(): never { throw new CommerceError(503, 'COMMERCE_UNAVAILABLE'); }
const object = (v: unknown) => { if (!isObject(v)) unavailable(); return v; };
function money(v: unknown): string {
  if (typeof v !== 'string' || !/^(0|[1-9][0-9]{0,18})$/.test(v) || BigInt(v) > 9223372036854775807n) unavailable(); return v;
}
function amounts(value: unknown) {
  const v = object(value), net = money(v.net_vnd), tax = money(v.tax_vnd), total = money(v.total_vnd);
  if (BigInt(net) + BigInt(tax) !== BigInt(total)) unavailable();
  return { net_vnd: net, tax_vnd: tax, total_vnd: total };
}
function date(value: unknown) { if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) unavailable(); return value; }
export function responseDto(value: unknown, action: CommerceAction): { status: number; error?: string; data?: Record<string, unknown> } {
  const envelope = object(value);
  if (envelope.error !== undefined) {
    if (typeof envelope.error !== 'string' || errorStatuses[envelope.error] === undefined || errorStatuses[envelope.error] !== envelope.status) unavailable();
    return { status: envelope.status as number, error: envelope.error,
      ...(envelope.error === 'CHECKOUT_REVIEW_BLOCKED' ? { data: review(envelope.data, false) } : {}) };
  }
  if (envelope.status !== 200) unavailable();
  const data = object(envelope.data);
  if (action === 'session') {
    if (typeof data.reused !== 'boolean') unavailable();
    return { status: 200, data: { reused: data.reused, expires_at: date(data.expires_at) } };
  }
  if (action === 'logout') { if (data.logged_out !== true) unavailable(); return { status: 200, data: { logged_out: true } }; }
  return { status: 200, data: review(data, action === 'preview') };
}
function review(value: unknown, preview: boolean) {
  const v = object(value);
  if (!Array.isArray(v.lines) || v.lines.length > 50 || typeof v.policy_configured !== 'boolean'
    || v.order_created !== false || v.inventory_reserved !== false || v.submission_enabled !== false) unavailable();
  const lines = v.lines.map(item => {
    const i = object(item);
    if (typeof i.variant_id !== 'string' || !uuidPattern.test(i.variant_id) || typeof i.quantity !== 'number'
      || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 10000 || !Array.isArray(i.issues)
      || !i.issues.every(x => typeof x === 'string' && lineIssues.includes(x))) unavailable();
    const variant = i.variant === null ? null : variantDto(i.variant);
    if ((variant && variant.id !== i.variant_id) || (!variant && !i.issues.includes('ITEM_UNAVAILABLE'))) unavailable();
    return { variant_id: i.variant_id, quantity: i.quantity, variant, issues: i.issues as string[], amounts: i.amounts === null ? null : amounts(i.amounts) };
  });
  if (new Set(lines.map(i => i.variant_id)).size !== lines.length) unavailable();
  const base = { lines, policy_configured: v.policy_configured, order_created: false, inventory_reserved: false, submission_enabled: false };
  if (!preview) return base;
  if (!v.policy_configured || !lines.length || lines.some(i => i.issues.length || !i.amounts)
    || typeof v.fingerprint !== 'string' || !hashPattern.test(v.fingerprint) || typeof v.terms_version !== 'string' || !v.terms_version.length
    || typeof v.policy_version !== 'number' || !Number.isInteger(v.policy_version) || v.policy_version < 1) unavailable();
  const t = object(v.totals);
  const totals = { items_net_vnd: money(t.items_net_vnd), items_tax_vnd: money(t.items_tax_vnd), shipping_net_vnd: money(t.shipping_net_vnd),
    shipping_tax_vnd: money(t.shipping_tax_vnd), total_vnd: money(t.total_vnd), currency: 'VND' };
  if (t.currency !== 'VND' || BigInt(totals.total_vnd) !== BigInt(totals.items_net_vnd) + BigInt(totals.items_tax_vnd) + BigInt(totals.shipping_net_vnd) + BigInt(totals.shipping_tax_vnd)
    || lines.reduce((sum, i) => sum + BigInt(i.amounts!.net_vnd), 0n) !== BigInt(totals.items_net_vnd)
    || lines.reduce((sum, i) => sum + BigInt(i.amounts!.tax_vnd), 0n) !== BigInt(totals.items_tax_vnd)) unavailable();
  return { ...base, totals, terms_version: v.terms_version, policy_version: v.policy_version, calculated_at: date(v.calculated_at), fingerprint: v.fingerprint };
}
