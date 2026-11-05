import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

// Run against the local production build with `npm run pages:dev` already active.
const base = new URL(process.env.NAVIGATION_URL || 'http://127.0.0.1:8788');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Only localhost is allowed.');
const channel = process.env.BROWSER_CHANNEL || 'msedge';
const browser = await chromium.launch({ channel, headless: true });
const checks = [];
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN', reducedMotion: 'reduce' });
page.setDefaultTimeout(10_000);
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
const mark = (message) => { checks.push(message); console.log(`PASS ${message}`); };

try {
  await mkdir('artifacts', { recursive: true });
  const response = await page.goto(base.href);
  assert.equal(response?.status(), 200);
  // The storefront shell must continue working around the current home page.
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.waitForFunction(() => typeof document.querySelector('button[aria-label="Mở menu"]')?.onclick === 'function');
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    assert.ok(dimensions.content <= dimensions.viewport, `Horizontal overflow at ${width}px: ${JSON.stringify(dimensions)}`);
    assert.equal(await page.getByRole('button', { name: 'Mở menu', exact: true }).isVisible(), width < 1024);
    assert.equal(await page.getByRole('navigation', { name: 'Điều hướng chính', exact: true }).isVisible(), width >= 1024);
    mark(`Responsive ${width}px: no horizontal overflow; correct navigation.`);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base.href);
  await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('link', { name: 'Đến nội dung chính' }).evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.id === 'noi-dung');
  mark('Skip link moves keyboard focus to main content.');
  await page.evaluate(() => window.scrollTo(0, 0));

  const summary = page.locator('.category-disclosure > summary');
  const panel = page.locator('.category-panel');
  await summary.focus();
  await page.keyboard.press('Enter');
  await panel.waitFor({ state: 'visible' });
  await page.screenshot({ path: 'artifacts/navigation-current-desktop-menu.png', fullPage: true });
  await page.keyboard.press('Escape');
  await panel.waitFor({ state: 'hidden' });
  assert.equal(await summary.evaluate((element) => element === document.activeElement), true);
  await summary.click();
  await panel.waitFor({ state: 'visible' });
  await page.getByText('Bản xem trước giao diện.', { exact: true }).click();
  await panel.waitFor({ state: 'hidden' });
  await summary.click();
  await panel.waitFor({ state: 'visible' });
  await page.getByRole('navigation', { name: 'Điều hướng chính', exact: true }).getByRole('link', { name: 'Trang chủ', exact: true }).focus();
  await panel.waitFor({ state: 'hidden' });
  mark('Desktop disclosure: keyboard open, Escape, outside click and focus leave close it.');
  assert.equal(await page.getByLabel('Tìm sản phẩm', { exact: true }).isDisabled(), false);
  assert.equal(await page.locator('[aria-disabled="true"][href]').count(), 0);
  await page.screenshot({ path: 'artifacts/navigation-current-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base.href);
  const trigger = page.getByRole('button', { name: 'Mở menu', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Danh mục và điều hướng', exact: true });
  await trigger.click();
  await dialog.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.activeElement?.tagName === 'H2');
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  assert.equal(await dialog.evaluate((element) => getComputedStyle(element).animationName), 'none');
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.move(388, 700);
  await page.mouse.wheel(0, 600);
  assert.equal(await page.evaluate(() => window.scrollY), scrollBefore);
  await page.locator('#storefront-brand').evaluate((element) => element.focus());
  assert.equal(await dialog.evaluate((element) => element.contains(document.activeElement)), true);
  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press(index < 5 ? 'Tab' : 'Shift+Tab');
    assert.equal(await dialog.evaluate((element) => element.contains(document.activeElement)), true, 'Focus escaped modal.');
  }
  await dialog.getByRole('button', { name: 'Danh mục', exact: true }).click();
  await dialog.getByRole('button', { name: 'Linh kiện & phụ kiện', exact: true }).click();
  await dialog.getByRole('heading', { name: 'Linh kiện & phụ kiện', exact: true }).waitFor();
  assert.equal(await dialog.getByRole('link', { name: 'RAM', exact: true }).getAttribute('href'), '/danh-muc/ram/');
  await page.screenshot({ path: 'artifacts/navigation-current-mobile-menu.png' });
  await dialog.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await dialog.getByRole('heading', { name: 'Danh mục', exact: true }).waitFor();
  await dialog.getByRole('button', { name: 'Quay lại', exact: true }).click();
  await dialog.getByRole('heading', { name: 'Khám phá sản phẩm', exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.body.style.overflow === '');
  assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
  mark('Mobile drawer: drilldown/back, native focus containment, scroll lock, reduced motion, Escape/focus return.');

  await trigger.click();
  await dialog.getByRole('button', { name: 'Đóng menu' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await trigger.click();
  await dialog.getByRole('link', { name: 'Trang chủ', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  // At 390px the drawer fills the available content width; use a tablet
  // viewport to exercise the visible backdrop rather than the scrollbar.
  await page.setViewportSize({ width: 768, height: 900 });
  await trigger.click();
  await page.mouse.click(600, 400);
  await dialog.waitFor({ state: 'hidden' });
  await trigger.click();
  await page.setViewportSize({ width: 1024, height: 900 });
  await dialog.waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement?.id === 'storefront-brand' && document.body.style.overflow === '');
  mark('Mobile drawer closes with close button, home link, backdrop and desktop resize.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/navigation-current-mobile.png', fullPage: true });
  await page.goto(new URL('/kiem-tra', base).href);
  await page.getByRole('button', { name: 'Kiểm tra kết nối' }).waitFor();
  assert.equal(await page.getByRole('banner').count(), 1);
  assert.equal(await page.getByRole('contentinfo').count(), 1);
  assert.deepEqual(errors, []);
  mark('Shared shell on /kiem-tra; no browser console or page errors.');
  await writeFile('artifacts/navigation-current-browser.json', JSON.stringify({ date: new Date().toISOString(), browser: browser.version(), channel, base: base.href, checks, errors }, null, 2));
} finally {
  await browser.close();
}
