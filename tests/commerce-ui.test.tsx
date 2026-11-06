// @vitest-environment jsdom
import './ui-setup';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ProductGallery } from '../src/components/product-gallery';
import { ProductDetail } from '../src/components/product-detail';
import { CatalogFeedback } from '../src/components/catalog-ui';
import { CatalogFilters } from '../src/components/catalog-filters';
import { CartPage } from '../src/components/cart-page';
import { PreviewContext } from '../src/components/preview-context';
import { createPreviewStore } from '../src/components/preview-store';

describe('07.3–07.6 — UI recovery and validation', () => {
  it('distinguishes loading, empty and retryable errors without faking data recovery', async () => {
    const retry = vi.fn(); const user = userEvent.setup();
    const { rerender } = render(<CatalogFeedback status="loading" message="Đang tải…" />);
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
    rerender(<CatalogFeedback status="empty" message="Chưa có dữ liệu." />);
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBeNull();
    rerender(<CatalogFeedback status="error" message="Chưa tải được." onRetry={retry} />);
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert').textContent).toBe('Chưa tải được.');
  });
  it('resets the filter schema when navigating to another category with the same empty query', () => {
    const props = { params: new URLSearchParams(), onApply: vi.fn() };
    const { rerender } = render(<CatalogFilters {...props} routeCategory="ram" />);
    const desktop = within(screen.getByRole('complementary', { name: 'Bộ lọc desktop' }));
    expect(desktop.getByRole('group', { name: 'Chuẩn DDR' })).toBeTruthy();
    rerender(<CatalogFilters {...props} routeCategory="ssd" />);
    expect((desktop.getByLabelText('Loại thiết bị') as HTMLSelectElement).value).toBe('ssd');
    expect(desktop.queryByRole('group', { name: 'Chuẩn DDR' })).toBeNull();
    expect(desktop.getByRole('group', { name: 'Giao tiếp' })).toBeTruthy();
  });
  it('retries a failed image and can select another image without claiming an image was loaded', async () => {
    const user = userEvent.setup();
    render(<ProductGallery icon="power" images={[{ src: '/front.svg', alt: 'Mặt trước' }, { src: '/back.svg', alt: 'Mặt sau' }]} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('Không tải được hình minh họa.');
    await user.click(screen.getByRole('button', { name: 'Tải lại hình' }));
    expect(screen.getByRole('img').getAttribute('src')).toBe('/front.svg');
    fireEvent.error(screen.getByRole('img'));
    await user.click(screen.getByRole('button', { name: 'Hình 2' }));
    expect(screen.getByRole('img').getAttribute('src')).toBe('/back.svg');
    expect(screen.getByRole('button', { name: 'Hình 2' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('uses an explicit missing-image state without a remote placeholder', () => {
    render(<ProductGallery icon="power" images={[]} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Chưa có ảnh sản phẩm được duyệt.')).toBeTruthy();
  });
  it.each(['?sku=', '?sku=DEMO-P100&sku=DEMO-P100', '?sku=DEMO-U1000-T'])('blocks invalid explicit single-variant URLs: %s', async (query) => {
    const store = createPreviewStore(); store.initialize();
    const user = userEvent.setup();
    render(<PreviewContext value={store}><MemoryRouter initialEntries={[`/san-pham/may-in-demo-laser/${query}`]}><Routes><Route path="/san-pham/:slug/" element={<ProductDetail />} /></Routes></MemoryRouter></PreviewContext>);
    expect(screen.getByRole('alert').textContent).toMatch(/SKU trong URL không hợp lệ/);
    expect(screen.queryByRole('button', { name: 'Thêm vào giỏ thử' })).toBeNull();
    await user.selectOptions(screen.getByLabelText('Biến thể'), 'DEMO-P100');
    expect(screen.queryByRole('alert')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Thêm vào giỏ thử' }));
    expect(store.getSnapshot().cart).toEqual([{ sku: 'DEMO-P100', quantity: 1 }]);
  });
  it('requires a selection for a product with multiple variants', () => {
    const store = createPreviewStore(); store.initialize();
    render(<PreviewContext value={store}><MemoryRouter initialEntries={['/san-pham/ups-demo-1000/']}><Routes><Route path="/san-pham/:slug/" element={<ProductDetail />} /></Routes></MemoryRouter></PreviewContext>);
    expect(screen.queryByRole('button', { name: 'Thêm vào giỏ thử' })).toBeNull();
    expect((screen.getByLabelText('Biến thể') as HTMLSelectElement).value).toBe('');
    expect(screen.getByText('Chọn biến thể để xem đúng thông số.')).toBeTruthy();
  });
  it('waits for cart restoration and ignores stored prices when rendering the subtotal', () => {
    const store = createPreviewStore();
    render(<PreviewContext value={store}><MemoryRouter><CartPage /></MemoryRouter></PreviewContext>);
    expect(screen.getByText('Đang khôi phục giỏ trên trình duyệt…')).toBeTruthy();
    expect(screen.queryByText(/Giỏ hàng đang trống/)).toBeNull();
    act(() => store.initialize({ getItem: () => JSON.stringify({ version: 1, lines: [{ sku: 'DEMO-U1000-T', quantity: 2, price: 1 }] }), setItem: vi.fn() }));
    expect(within(screen.getByRole('complementary')).getByText('200.000 ₫')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Tiếp tục đặt hàng thử' }).getAttribute('href')).toBe('/dat-hang/');
  });
  it('rejects fractional quantities without changing the cart and supports removing its last line', async () => {
    const store = createPreviewStore(); store.initialize(); store.add('DEMO-U1000-T', 2);
    const user = userEvent.setup();
    render(<PreviewContext value={store}><MemoryRouter><CartPage /></MemoryRouter></PreviewContext>);
    const quantity = screen.getByLabelText('Số lượng DEMO-U1000-T');
    await user.clear(quantity); await user.type(quantity, '1.5');
    await user.click(screen.getByRole('button', { name: 'Cập nhật DEMO-U1000-T' }));
    expect(screen.getByRole('alert').textContent).toMatch(/số nguyên/);
    expect(quantity.getAttribute('aria-invalid')).toBe('true');
    expect(store.getSnapshot().cart).toEqual([{ sku: 'DEMO-U1000-T', quantity: 2 }]);
    await user.click(screen.getByRole('button', { name: 'Xóa DEMO-U1000-T' }));
    expect(screen.getByText(/Giỏ hàng đang trống/)).toBeTruthy();
  });
});
