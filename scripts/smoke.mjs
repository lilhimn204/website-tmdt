import assert from 'node:assert/strict';

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8788';
const baseUrl = new URL(base);
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname), 'Smoke checks are restricted to localhost.');

async function request(path, init = {}) {
  return fetch(new URL(path, base), { ...init, signal: AbortSignal.timeout(10_000) });
}

for (const [path, heading] of [['/', 'Bắt đầu từ một bộ khung rõ ràng.'], ['/kiem-tra', 'Frontend đã gọi được API chưa?']]) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.includes(heading), `Missing prerendered content: ${path}`);
  assert.ok(html.includes('lang="vi"'), `Missing Vietnamese document language: ${path}`);
  assert.ok(html.includes('noindex'), `Starter must not be indexed: ${path}`);
  const cssPath = html.match(/href="([^"\s]+\.css)"/)?.[1];
  assert.ok(cssPath, `Missing built CSS: ${path}`);
  const css = await request(cssPath);
  assert.equal(css.status, 200, 'Built CSS should be served as an asset');
  assert.match(css.headers.get('Content-Type') || '', /text\/css/);
  console.log(`PASS HTML + CSS: ${path}`);
}

const health = await request('/api/v1/health');
assert.equal(health.status, 200);
assert.equal(health.headers.get('Cache-Control'), 'no-store');
assert.deepEqual(await health.json(), { status: 'ok', scope: 'starter', database: 'not_configured' });
console.log('PASS API: GET /api/v1/health');

const head = await request('/api/v1/health', { method: 'HEAD' });
assert.equal(head.status, 200);
assert.equal(await head.text(), '');
const post = await request('/api/v1/health', { method: 'POST' });
assert.equal(post.status, 405);
assert.equal(post.headers.get('Allow'), 'GET, HEAD');
console.log('PASS API: HEAD and unsupported POST');

const missingApi = await request('/api/v1/does-not-exist');
assert.equal(missingApi.status, 404);
assert.equal((await missingApi.json()).error.code, 'NOT_FOUND');
const missingPage = await request('/duong-dan-khong-ton-tai');
assert.equal(missingPage.status, 404);
assert.ok((await missingPage.text()).includes('Không tìm thấy trang'));
console.log('PASS real 404: API and page');
console.log('All local Pages smoke checks passed.');
