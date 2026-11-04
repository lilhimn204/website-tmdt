export interface HealthResponse {
  status: 'ok';
  scope: 'starter';
  database: 'not_configured';
}

export function isHealthResponse(value: unknown): value is HealthResponse {
  return typeof value === 'object' && value !== null
    && 'status' in value && value.status === 'ok'
    && 'scope' in value && value.scope === 'starter'
    && 'database' in value && value.database === 'not_configured';
}
