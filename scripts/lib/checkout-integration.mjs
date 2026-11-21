import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
export async function checkCheckout({ sql, api, origin, publishable, secret, gateway }) {
  let checks = 0;
  const ensure = (condition, name) => { if (!condition) throw new Error(`Checkout: ${name}`); checks++; console.log(`PASS checkout: ${name}`); };
  const id = n => `70000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
  const fixture = readFileSync(new URL('../../supabase/tests/database/08_checkout.test.sql', import.meta.url), 'utf8').split('-- BEGIN CHECKOUT FIXTURE')[1].split('-- END CHECKOUT FIXTURE')[0];
  sql(`begin;${fixture}commit;`);
  let cookie = '', csrf = '';
  const cart = { items: [{ variant_id: id(20), quantity: 2 }] };
  const preview = { ...cart, destination: { province_code: 'TEST-P', ward_code: 'TEST-W' }, payment_method: 'cod', shipping_service: 'standard' };
  const paths = { session: 'guest/session', logout: 'guest/logout', cart: 'cart/review', preview: 'checkout/preview' };
  async function call(action, body = {}, headers = {}) {
    const r = await fetch(`${origin}/api/v1/${paths[action]}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': csrf, ...headers }, body: JSON.stringify(body) });
    return { status: r.status, data: await r.json(), headers: r.headers };
  }
  ensure((await call('cart', cart)).status === 401, 'missing session rejected');
  ensure((await call('session', {}, { Origin: 'https://evil.invalid' })).status === 403, 'cross-origin bootstrap rejected');
  const session = await call('session');
  ensure(session.status === 200 && /^[A-Za-z0-9_-]{43}$/.test(session.data.data?.csrf_token), 'Pages creates real guest session');
  cookie = session.headers.get('Set-Cookie').split(';')[0]; csrf = session.data.data.csrf_token;
  ensure(/HttpOnly/.test(session.headers.get('Set-Cookie')) && /SameSite=Strict/.test(session.headers.get('Set-Cookie')), 'cookie flags');
  const digest = createHash('sha256').update(cookie.split('=')[1]).digest('hex');
  ensure(sql(`select count(*) from app.guest_sessions where token_hash='${digest}';`) === '1', 'only token hash persisted');
  ensure((await call('cart', cart, { 'X-CSRF-Token': 'x'.repeat(43) })).status === 403, 'wrong CSRF denied by database');
  ensure((await call('preview', preview)).data.error?.code === 'CHECKOUT_NOT_CONFIGURED', 'draft policy blocks checkout');
  const reviewed = await call('cart', cart);
  ensure(reviewed.status === 200 && reviewed.data.data.lines[0].variant.price.amount_vnd === '9007199254740993' && reviewed.data.data.lines[0].amounts === null, 'current price exact without guessed taxes');
  sql(`update app.commerce_policy_versions set status='active',approved_by='${id(1)}',approved_at=now() where id='${id(100)}';`);
  const quoted = await call('preview', preview);
  ensure(quoted.status === 200 && quoted.data.data?.totals?.total_vnd === '18014398509482097', 'real preview computes exact VND');
  ensure(quoted.data.data.order_created === false && quoted.data.data.inventory_reserved === false && quoted.data.data.submission_enabled === false, 'no order or reservation promise');
  ensure(quoted.headers.get('Cache-Control') === 'no-store' && !quoted.headers.has('Access-Control-Allow-Origin'), 'private response not cached or CORS exposed');
  ensure(!/PRIVATE|current_price_id|warranty_version_id|token_hash|csrf_hash|on_hand/.test(JSON.stringify(quoted.data)), 'private fields redacted');
  ensure((await call('preview', preview)).data.data.fingerprint === quoted.data.data.fingerprint, 'stable fingerprint');
  ensure((await call('preview', { ...preview, items: [{ variant_id: id(20), quantity: 1 }] })).data.data.fingerprint !== quoted.data.data.fingerprint, 'quantity changes fingerprint');
  ensure((await call('cart', { ...cart, price: 1 })).status === 400, 'client price rejected');
  ensure((await call('cart', { items: [cart.items[0], cart.items[0]] })).status === 400, 'duplicate items rejected');
  ensure((await call('preview', { ...preview, items: [{ variant_id: id(20), quantity: 6 }] })).data.error?.code === 'CHECKOUT_REVIEW_BLOCKED', 'stock and quantity policy enforced');
  ensure((await call('cart', { items: [{ variant_id: id(24), quantity: 1 }] })).data.data.lines[0].variant === null, 'hidden product not exposed');
  ensure((await call('cart', { items: [{ variant_id: id(21), quantity: 1 }] })).data.data.lines[0].issues.includes('NOT_RETAIL'), 'quote-only SKU cannot retail');
  ensure((await call('preview', { ...preview, destination: { ...preview.destination, ward_code: 'UNKNOWN' } })).data.error?.code === 'DESTINATION_UNSUPPORTED', 'shipping destination mapping enforced');
  const oldCsrf = csrf, reused = await call('session'); csrf = reused.data.data.csrf_token;
  ensure(reused.status === 200 && reused.headers.get('Set-Cookie').split(';')[0] === cookie && csrf !== oldCsrf, 'session recovery rotates CSRF preserving session');
  ensure((await call('cart', cart, { 'X-CSRF-Token': oldCsrf })).status === 403, 'old CSRF revoked');
  ensure((await call('cart', cart)).status === 200, 'new CSRF works');
  const direct = async (key, withGateway) => fetch(`${api}/rest/v1/rpc/commerce_request`, { method: 'POST', headers: {
    apikey: key, 'Content-Type': 'application/json', 'Content-Profile': 'api', ...(withGateway ? { 'X-Data-Api-Gateway': gateway } : {}) },
    body: JSON.stringify({ action_name: 'cart', session_hash: digest, csrf_hash: createHash('sha256').update(csrf).digest('hex'), ip_hash: 'c'.repeat(64), body: cart }) });
  ensure(!(await direct(publishable, true)).ok, 'anon cannot invoke service RPC even with gateway');
  ensure(!(await direct(secret, false)).ok, 'service key without gateway rejected');
  const raw = await fetch(`${api}/rest/v1/guest_sessions`, { headers: { apikey: secret, 'Accept-Profile': 'app', 'X-Data-Api-Gateway': gateway } });
  ensure(!raw.ok, 'service key has no raw guest table access');
  sql("delete from app.abuse_counters where action like 'commerce.%';");
  const parallel = await Promise.all(Array.from({ length: 34 }, () => call('cart', { items: [] })));
  ensure(parallel.filter(r => r.status === 200).length === 30 && parallel.filter(r => r.status === 429).length === 4, 'atomic concurrent limit admits exactly 30 of 34');
  ensure(parallel.filter(r => r.status === 429).every(r => r.headers.get('Retry-After') === '60'), 'rate response retry header');
  sql("delete from app.abuse_counters where action like 'commerce.%';");
  const logout = await call('logout'); ensure(logout.status === 200 && logout.headers.get('Set-Cookie').includes('Max-Age=0'), 'logout expires cookie');
  ensure((await call('cart', cart)).status === 401, 'revoked session cannot review');
  ensure(sql('select count(*) from app.orders;') === '0' && sql('select count(*) from app.stock_reservations;') === '0', 'no orders or reservations created');
  console.log(`Checkout integration: ${checks} checks passed with real Pages, cookies, CSRF, service RPC and PostgreSQL.`);
}
