import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = new URL(process.env.HOME_TEST_URL || 'http://127.0.0.1:8788');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Only localhost is allowed.');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'vi-VN', reducedMotion: 'reduce' });
const errors = [];
const mutations = [];
const checks = [];
const mark = (message) => { checks.push(message); console.log(`PASS ${message}`); };
page.setDefaultTimeout(10_000);
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('request', (request) => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) mutations.push(request.url()); });

try {
  await mkdir('artifacts', { recursive: true });
  assert.equal((await page.goto(base.href))?.status(), 200);
  await page.getByRole('heading', { level: 1 }).waitFor();
  assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
  assert.match(await page.title(), /Thiết bị công nghệ/);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
  assert.equal(await page.getByRole('region', { name: 'Sản phẩm nổi bật', exact: true }).getByRole('article').count(), 4);
  mark('Prerendered home, one h1, preview metadata and four sample products.');

  const products = page.getByRole('region', { name: 'Sản phẩm nổi bật', exact: true });
  for (const width of [1440, 1280, 1024, 768, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    assert.ok(dimensions.content <= dimensions.viewport, `Overflow at ${width}px: ${JSON.stringify(dimensions)}`);
    const columns = await products.getByRole('list').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    assert.equal(columns, width >= 1280 ? 4 : width >= 640 ? 2 : 1);
    if (width < 640) {
      await page.evaluate(() => window.scrollTo(0, 0));
      const cta = await page.getByRole('link', { name: 'Khám phá danh mục', exact: true }).boundingBox();
      assert.ok(cta && cta.y + cta.height <= 844, `Home CTA below first viewport at ${width}px.`);
      assert.ok(cta.height >= 44);
    }
    mark(`Layout ${width}px: no horizontal overflow; ${columns} product column(s).`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/home-current-mobile.png' });
  await page.getByRole('link', { name: 'Khám phá danh mục', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.id === 'danh-muc-trang-chu');
  const categoryRegion = page.getByRole('region', { name: 'Bạn đang tìm thiết bị gì?', exact: true });
  const categoryLinks = await categoryRegion.getByRole('link').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  for (const href of categoryLinks) {
    const link = categoryRegion.locator(`a[href="${href}"]`);
    await link.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL((url) => url.pathname === href);
    await page.getByRole('region', { name: 'Kết quả sản phẩm', exact: true }).waitFor();
    await page.goBack();
    await categoryRegion.waitFor();
  }
  await page.getByRole('link', { name: 'Chuẩn bị yêu cầu', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.id === 'nhu-cau-doanh-nghiep');
  assert.equal(await page.getByRole('region', { name: 'Chuẩn bị nhu cầu doanh nghiệp', exact: true }).locator('form').count(), 0);
  mark('Keyboard category links open implemented catalogs; business CTA reaches focusable on-page content.');

  assert.equal(await page.locator('[aria-disabled="true"][href]').count(), 0);
  assert.equal(await products.getByText('Mẫu DEMO', { exact: true }).count(), 4);
  assert.equal(await products.getByText('Giá kiểm thử · Chưa bán hàng', { exact: true }).count(), 4);
  const featuredLinks = await products.getByRole('link').evaluateAll((links) => links.map((link) => ({ href: link.getAttribute('href'), text: link.textContent })));
  for (const { href, text } of featuredLinks) {
    await products.getByRole('link', { name: text, exact: true }).click();
    await page.waitForURL((url) => url.pathname + url.search === href);
    await page.getByRole('heading', { level: 1, name: text, exact: true }).waitFor();
    assert.equal(await page.getByLabel('Biến thể', { exact: true }).inputValue(), new URL(href, base).searchParams.get('sku'));
    await page.goBack();
    await products.waitFor();
  }
  mark('All four featured cards open the corresponding product and SKU.');
  await products.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/home-current-mobile-products.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/home-current-desktop.png' });
  await page.screenshot({ path: 'artifacts/home-current-desktop-full.png', fullPage: true });
  await products.screenshot({ path: 'artifacts/home-current-featured.png' });
  assert.deepEqual(mutations, []);
  assert.deepEqual(errors, []);
  mark('Synthetic catalog and prices are labeled; no transaction requests, console errors or page errors.');
  await writeFile('artifacts/home-current-browser.json', JSON.stringify({ date: new Date().toISOString(), browser: browser.version(), base: base.href, checks, errors, mutations }, null, 2));
} finally {
  await browser.close();
}
