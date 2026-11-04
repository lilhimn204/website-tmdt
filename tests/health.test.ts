import { describe, expect, it } from 'vitest';
import { handleHealth } from '../server/health';
import { handleApiNotFound } from '../server/not-found';
import { isHealthResponse } from '../shared/health';

describe('Starter API contract', () => {
  it('returns a truthful, non-cacheable health result without echoing query data', async () => {
    const response = handleHealth(new Request('https://example.test/api/v1/health?secret=must-not-echo'));
    const body: unknown = await response.json();
    expect(response.status).toBe(200);
    expect(isHealthResponse(body)).toBe(true);
    expect(JSON.stringify(body)).not.toContain('must-not-echo');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('supports HEAD without a response body', async () => {
    const response = handleHealth(new Request('https://example.test/api/v1/health', { method: 'HEAD' }));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('rejects %s on the read-only health route', async (method) => {
    const response = handleHealth(new Request('https://example.test/api/v1/health', { method }));
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET, HEAD');
    expect(await response.json()).toHaveProperty('error.code', 'METHOD_NOT_ALLOWED');
  });

  it('returns a JSON 404 for unknown APIs rather than a successful HTML page', async () => {
    const response = handleApiNotFound();
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(await response.json()).toHaveProperty('error.code', 'NOT_FOUND');
  });

  it.each([null, {}, { status: 'ok' }, '<html></html>', { status: 'ok', scope: 'starter', database: 'connected' }])('does not report success for an invalid health payload: %j', (value) => {
    expect(isHealthResponse(value)).toBe(false);
  });
});
