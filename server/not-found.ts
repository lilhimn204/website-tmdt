import { jsonResponse } from './http/json';

export function handleApiNotFound(): Response {
  return jsonResponse({ error: { code: 'NOT_FOUND', message: 'API này chưa tồn tại.' } }, 404);
}
