import type { HealthResponse } from '../shared/health';
import { jsonResponse } from './http/json';

export function handleHealth(request: Request): Response {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonResponse({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ GET và HEAD.' } }, 405, { Allow: 'GET, HEAD' });
  }

  const body: HealthResponse = { status: 'ok', scope: 'starter', database: 'not_configured' };
  const response = jsonResponse(body);
  return request.method === 'HEAD' ? new Response(null, { status: response.status, headers: response.headers }) : response;
}
