import type { AuthEnv } from '../auth/types';
export interface CommerceEnv extends AuthEnv {
  SUPABASE_SECRET_KEY?: string;
  REQUEST_HASH_SECRET?: string;
  GUEST_SESSION_TTL_SECONDS?: string;
}
export type CommerceAction = 'session' | 'logout' | 'cart' | 'preview';
export class CommerceError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
export const errorStatuses: Record<string, number> = {
  INVALID_COMMERCE_INPUT: 400, GUEST_SESSION_REQUIRED: 401, CSRF_INVALID: 403,
  CHECKOUT_REVIEW_BLOCKED: 422, PAYMENT_UNSUPPORTED: 422, DESTINATION_UNSUPPORTED: 422,
  SHIPPING_UNSUPPORTED: 422, AMOUNT_OVERFLOW: 422, COD_LIMIT_EXCEEDED: 422,
  TOO_MANY_REQUESTS: 429, CHECKOUT_NOT_CONFIGURED: 503,
};
export const lineIssues = ['ITEM_UNAVAILABLE', 'NOT_RETAIL', 'PRICE_UNAVAILABLE', 'TAX_UNKNOWN',
  'WARRANTY_UNAVAILABLE', 'STOCK_UNKNOWN', 'INSUFFICIENT_STOCK', 'SPECIFICATION_UNVERIFIED', 'QUANTITY_LIMIT', 'AMOUNT_OVERFLOW'];
export const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
export const hashPattern = /^[a-f0-9]{64}$/;
