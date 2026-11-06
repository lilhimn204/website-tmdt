import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = new URL(process.env.REQUESTS_TEST_URL || 'http://127.0.0.1:8788');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Only localhost is allowed.');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'vi-VN', reducedMotion: 'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = []; const mutations = []; const checks = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
context.on('request', (request) => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) mutations.push(request.url()); });
const mark = (message) => { checks.push(message); console.log(`PASS ${message}`); };
async function go(path) { assert.equal((await page.goto(new URL(path, base).href))?.status(), 200); await page.getByRole('heading', { level: 1 }).waitFor(); }
async function responsive(name) {
  for (const width of [1440, 1024, 768, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${name} overflow ${width}px`);
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
  }
  await page.screenshot({ path: `artifacts/module-07-7-10-${name}-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: `artifacts/module-07-7-10-${name}.png`, fullPage: true });
}
async function formSemantics() {
  const issues = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('main input, main select, main textarea')];
    const missingLabels = inputs.filter((input) => !input.labels?.length && !input.getAttribute('aria-label'));
    const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
    const missingDescriptions = [...document.querySelectorAll('[aria-describedby]')].flatMap((node) => node.getAttribute('aria-describedby').split(/\s+/)).filter((id) => !document.getElementById(id));
    return { missingLabels: missingLabels.length, duplicateIds: ids.length - new Set(ids).size, missingDescriptions };
  });
  assert.deepEqual(issues, { missingLabels: 0, duplicateIds: 0, missingDescriptions: [] });
}
try {
  await mkdir('artifacts', { recursive: true });
  await go('/dat-hang/');
  await page.getByText(/Chưa có sản phẩm trong giỏ/).waitFor();
  assert.equal(await page.locator('main form').count(), 0);
  await page.evaluate(() => localStorage.setItem('website-tmdt.demo-cart.v1', JSON.stringify({ version: 1, lines: [{ sku: 'DEMO-U1000-T', quantity: 2 }, { sku: 'DEMO-SN-512', quantity: 1 }] })));
  await go('/gio-hang/');
  await page.getByRole('link', { name: 'Tiếp tục đặt hàng thử' }).click();
  await page.waitForFunction(() => document.activeElement?.textContent === 'Đặt hàng');
  await page.getByRole('button', { name: 'Rà soát thông tin' }).click();
  const summary = page.getByRole('alert');
  await summary.waitFor();
  assert.equal(await summary.evaluate((node) => node === document.activeElement), true);
  await summary.getByRole('link', { name: /Nhập tên người liên hệ/ }).click();
  assert.equal(await page.getByLabel('Họ và tên').evaluate((node) => node === document.activeElement), true);
  await page.getByLabel('Họ và tên').fill('TEST-PRIVATE-NAME');
  await page.getByRole('textbox', { name: /^Điện thoại/ }).fill('0900000000');
  await page.getByLabel('Địa chỉ giao hàng đầy đủ').fill('TEST-PRIVATE-ADDRESS');
  await page.getByLabel('Tôi cần hóa đơn').check();
  await page.getByLabel('Thông tin hóa đơn').fill('TEST-PRIVATE-INVOICE');
  await page.getByRole('radio', { name: /COD/ }).check();
  await page.getByRole('button', { name: 'Rà soát thông tin' }).click();
  await page.getByRole('heading', { name: '5. Rà soát bản nháp — chưa tạo đơn' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Đặt hàng chưa khả dụng' }).isDisabled(), true);
  await page.getByRole('complementary', { name: 'Toàn bộ giỏ hàng DEMO' }).getByText('290.000 ₫').waitFor();
  await page.getByText('Chưa thể xác nhận', { exact: true }).waitFor();
  await formSemantics();
  await responsive('checkout');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Điều kiện giao dịch (mở tab mới)', exact: true }).click();
  const popup = await popupPromise;
  await popup.getByRole('heading', { name: 'Điều kiện giao dịch', exact: true }).waitFor();
  await popup.close();
  assert.equal(await page.getByLabel('Họ và tên').inputValue(), 'TEST-PRIVATE-NAME');
  await page.getByRole('button', { name: 'Sửa thông tin', exact: true }).click();
  await page.getByRole('radio', { name: 'Chuyển khoản thủ công' }).check();
  await page.getByRole('button', { name: 'Rà soát thông tin' }).click();
  assert.equal(await page.getByRole('button', { name: 'Đặt hàng chưa khả dụng' }).isDisabled(), true);
  assert.equal(await page.locator('main img').count(), 0);
  const stored = await page.evaluate(() => ({ local: JSON.stringify({ ...localStorage }), session: JSON.stringify({ ...sessionStorage }) }));
  assert.doesNotMatch(stored.local + stored.session + page.url(), /TEST-PRIVATE/);
  await page.reload();
  await page.getByLabel('Họ và tên').waitFor();
  assert.equal(await page.getByLabel('Họ và tên').inputValue(), '');
  assert.equal(await page.getByRole('heading', { name: /Rà soát bản nháp/ }).count(), 0);
  mark('07.7: cart gate, error/field focus, COD/transfer review, all cart items, unknown totals, no order or persisted PII.');

  await go('/san-pham/ups-demo-1000/?sku=DEMO-U1000-R');
  await page.getByRole('link', { name: 'Chuẩn bị yêu cầu báo giá', exact: true }).click();
  await page.waitForURL(/bao-gia.*sku=DEMO-U1000-R/);
  assert.equal(await page.getByLabel('SKU thiết bị 1').inputValue(), 'DEMO-U1000-R');
  await page.getByLabel('Tên người liên hệ').fill('TEST-PRIVATE-RFQ');
  await page.getByLabel('Điện thoại liên hệ').fill('0900000000');
  await page.getByLabel('Số lượng thiết bị 1').fill('500');
  await page.getByRole('button', { name: 'Thêm thiết bị' }).click();
  assert.equal(await page.getByLabel('SKU thiết bị 2').evaluate((node) => node === document.activeElement), true);
  await page.getByLabel('SKU thiết bị 2').selectOption('DEMO-U1000-R');
  await page.getByRole('button', { name: 'Rà soát yêu cầu' }).click();
  await page.getByRole('alert').getByRole('link', { name: /SKU này đã có/ }).waitFor();
  await page.getByLabel('SKU thiết bị 2').selectOption('DEMO-UOLD-T');
  await page.getByRole('button', { name: 'Rà soát yêu cầu' }).click();
  await page.getByRole('heading', { name: 'Bản nháp yêu cầu — chưa gửi' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Gửi yêu cầu chưa khả dụng' }).isDisabled(), true);
  await formSemantics();
  await responsive('quote');
  await page.getByRole('button', { name: 'Xóa thiết bị 2' }).click();
  assert.equal(await page.getByRole('heading', { name: 'Bản nháp yêu cầu — chưa gửi' }).count(), 0);
  await go('/bao-gia/');
  await page.getByLabel('Tên người liên hệ').fill('TEST-PRIVATE-NEED');
  await page.getByLabel('Email liên hệ').fill('tester@example.com');
  await page.getByLabel('Mô tả nhu cầu').fill('Cần tư vấn UPS cho văn phòng');
  await page.getByRole('button', { name: 'Rà soát yêu cầu' }).click();
  await page.getByRole('heading', { name: 'Bản nháp yêu cầu — chưa gửi' }).waitFor();
  assert.doesNotMatch(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage })), /TEST-PRIVATE|tester@example/);
  await page.reload();
  assert.equal(await page.getByLabel('Tên người liên hệ').inputValue(), '');
  mark('07.8: PDP SKU handoff, bulk/EOL inquiry, duplicate guard, add/remove focus, no-SKU/email-only path and no fake RFQ receipt.');

  for (const path of ['/dat-hang/da-tiep-nhan/?id=FORGED', '/bao-gia/da-tiep-nhan/?id=FORGED', '/don-hang/theo-doi/?id=FORGED']) {
    await go(path);
    await page.getByText(/Chưa có kết quả tiếp nhận đã xác minh/).waitFor();
    assert.doesNotMatch(await page.locator('main').innerText(), /FORGED/);
    assert.equal(await page.locator('main form').count(), 0);
  }
  mark('Receipt and tracking URLs cannot invent success, expose query data or provide public order lookup.');

  await go('/chinh-sach/');
  assert.equal(await page.locator('main').getByRole('link').count(), 6);
  for (const slug of ['bao-hanh', 'doi-tra', 'van-chuyen', 'thanh-toan', 'bao-mat', 'dieu-kien-giao-dich']) {
    await go(`/chinh-sach/${slug}/`);
    await page.getByText('Chưa công bố thông tin chính thức', { exact: true }).waitFor();
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
  }
  await go('/chinh-sach/bao-hanh/');
  await page.getByRole('link', { name: 'Điều kiện và tiếp nhận', exact: true }).click();
  assert.equal(await page.getByRole('heading', { name: 'Điều kiện và tiếp nhận', exact: true }).evaluate((node) => node === document.activeElement), true);
  await responsive('policy');
  await go('/lien-he/');
  assert.equal(await page.locator('main form, a[href^="tel:"], a[href^="mailto:"]').count(), 0);
  await responsive('contact');
  for (const path of ['/ho-tro/', '/ho-tro/huong-dan-su-dung/', '/gioi-thieu/']) await go(path);
  mark('07.9: six pending policies, contents keyboard anchors, support/guide/about/contact and no fabricated contact or effective date.');

  await go('/thuong-hieu/nhan-mau-a/');
  const filters = page.getByRole('complementary', { name: 'Bộ lọc desktop' });
  await filters.getByLabel('Loại thiết bị').selectOption('ram');
  await filters.getByRole('button', { name: 'Áp dụng bộ lọc' }).click();
  await page.waitForURL(/danh-muc=ram/);
  const results = page.getByRole('region', { name: 'Kết quả sản phẩm' });
  assert.equal(await results.getByRole('article').count(), 2);
  assert.doesNotMatch(await results.innerText(), /Nhãn mẫu B/);
  await page.reload();
  await results.getByRole('article').first().waitFor();
  assert.equal(await results.getByRole('article').count(), 2);
  await responsive('brand');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
  await page.getByRole('dialog', { name: 'Danh mục và điều hướng' }).getByRole('link', { name: 'Hỗ trợ', exact: true }).click();
  await page.waitForURL(/ho-tro/);
  await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
  assert.equal(await page.getByRole('dialog', { name: 'Danh mục và điều hướng' }).isVisible(), false);
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '');
  await page.setViewportSize({ width: 1280, height: 900 });
  const sizeStyle = await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
  await sizeStyle.evaluate((element) => element.remove());
  for (const path of ['/chinh-sach/no-such-policy/', '/thuong-hieu/no-such-brand/']) assert.equal((await context.request.get(new URL(path, base).href)).status(), 404);
  assert.deepEqual(errors, []); assert.deepEqual(mutations, []);
  mark('07.10: brand scope, 320–1440px layouts, mobile route focus/menu close, 200% support text, 404 and no browser errors or transaction requests.');
  await writeFile('artifacts/module-07-7-10-browser.json', JSON.stringify({ date: new Date().toISOString(), browser: browser.version(), checks, errors, mutations }, null, 2));
} finally { await browser.close(); }
