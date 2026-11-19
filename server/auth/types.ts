export interface AuthEnv {
  APP_ENV?: string;
  APP_ORIGIN?: string;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  DATA_API_GATEWAY_SECRET?: string;
}

export const staffRoles = ['owner', 'catalog', 'sales', 'warehouse', 'finance', 'support'] as const;
export const permissionCodes = ['security.manage', 'catalog.read', 'catalog.write', 'catalog.publish', 'pricing.write',
  'inventory.read', 'inventory.adjust', 'fulfillment.write', 'orders.read', 'orders.process', 'orders.contact.read',
  'quotes.read', 'quotes.write', 'quotes.approve', 'finance.read', 'finance.record', 'finance.refund',
  'support.read', 'support.write', 'content.write', 'media.write', 'audit.read', 'operations.manage'] as const;
export interface AdminContext {
  user_id: string;
  display_name: string;
  authz_version: string;
  roles: string[];
  permissions: string[];
}
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export class AuthError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
