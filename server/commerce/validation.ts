import { isObject, uuidPattern } from '../auth/types';
import { CommerceError } from './types';
import type { CommerceAction } from './types';
function invalid(): never { throw new CommerceError(400, 'INVALID_COMMERCE_INPUT'); }
export function exactKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length === keys.length && Object.keys(value).every(k => keys.includes(k));
}
export function input(value: unknown, action: CommerceAction): Record<string, unknown> {
  if (action === 'session' || action === 'logout') { if (!exactKeys(value, [])) invalid(); return {}; }
  const keys = action === 'cart' ? ['items'] : ['items', 'destination', 'payment_method', 'shipping_service'];
  if (!exactKeys(value, keys) || !Array.isArray(value.items) || value.items.length > 50 || (action === 'preview' && !value.items.length)) invalid();
  const items = value.items.map(i => {
    if (!exactKeys(i, ['variant_id', 'quantity']) || typeof i.variant_id !== 'string' || !uuidPattern.test(i.variant_id)
      || typeof i.quantity !== 'number' || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 10000) invalid();
    return { variant_id: i.variant_id.toLowerCase(), quantity: i.quantity };
  });
  if (new Set(items.map(i => i.variant_id)).size !== items.length) invalid();
  if (action === 'cart') return { items };
  const code = (v: unknown) => typeof v === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(v);
  if (!exactKeys(value.destination, ['province_code', 'ward_code']) || !code(value.destination.province_code) || !code(value.destination.ward_code)
    || !code(value.shipping_service) || !['cod', 'bank_transfer'].includes(String(value.payment_method))) invalid();
  return { items, destination: value.destination, payment_method: value.payment_method, shipping_service: value.shipping_service };
}
export async function readJson(message: Request | Response, maxBytes: number, upstream = false): Promise<unknown> {
  const fail = (status: number, code: string): never => { throw new CommerceError(upstream ? 503 : status, upstream ? 'COMMERCE_UNAVAILABLE' : code); };
  if (message.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json'
    || (!upstream && message.headers.has('Content-Encoding'))) fail(415, 'UNSUPPORTED_MEDIA_TYPE');
  const declared = message.headers.get('Content-Length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) fail(413, 'PAYLOAD_TOO_LARGE');
  const reader = message.body?.getReader(); if (!reader) return fail(400, 'INVALID_COMMERCE_INPUT');
  let size = 0; const parts: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length; if (size > maxBytes) { await reader.cancel(); fail(413, 'PAYLOAD_TOO_LARGE'); } parts.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)); }
  catch { return fail(400, 'INVALID_COMMERCE_INPUT'); }
}
