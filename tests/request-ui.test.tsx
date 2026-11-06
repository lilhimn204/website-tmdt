// @vitest-environment jsdom
import './ui-setup';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CheckoutPage } from '../src/components/checkout-page';
import { QuotePage } from '../src/components/quote-page';
import { InformationPage, PolicyIndex } from '../src/components/information-page';
import { ReceiptPage } from '../src/components/receipt-page';
import { PreviewContext } from '../src/components/preview-context';
import { createPreviewStore } from '../src/components/preview-store';

function checkout(populated = true) {
  const store = createPreviewStore(); store.initialize();
  if (populated) store.add('DEMO-U1000-T', 2);
  render(<PreviewContext value={store}><MemoryRouter><CheckoutPage /></MemoryRouter></PreviewContext>);
  return store;
}
describe('07.7 — checkout interface', () => {
  it('has no checkout form for an empty cart', () => {
    checkout(false);
    expect(screen.getByText(/Chưa có sản phẩm trong giỏ/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Rà soát thông tin' })).toBeNull();
  });
  it('blocks a restored invalid cart before collecting customer details', () => {
    const store = createPreviewStore();
    store.initialize({ getItem: () => JSON.stringify({ version: 1, lines: [{ sku: 'REMOVED', quantity: 1 }] }), setItem: () => {} });
    render(<PreviewContext value={store}><MemoryRouter><CheckoutPage /></MemoryRouter></PreviewContext>);
    expect(screen.getByRole('alert').textContent).toMatch(/Giỏ có SKU/);
    expect(screen.queryByLabelText(/Họ và tên/)).toBeNull();
  });
  it('focuses the error summary and its field links, then reviews without creating an order', async () => {
    const store = checkout(); const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Rà soát thông tin' }));
    expect(document.activeElement).toBe(screen.getByRole('alert'));
    await user.click(within(screen.getByRole('alert')).getByRole('link', { name: /Nhập tên người liên hệ/ }));
    expect(document.activeElement).toBe(screen.getByLabelText(/Họ và tên/));
    await user.type(screen.getByLabelText(/Họ và tên/), 'Người thử');
    await user.type(screen.getByLabelText(/^Điện thoại/), '0900000000');
    await user.type(screen.getByLabelText(/Địa chỉ giao hàng đầy đủ/), 'Địa chỉ thử nghiệm');
    await user.click(screen.getByRole('radio', { name: 'Chuyển khoản thủ công' }));
    await user.click(screen.getByRole('button', { name: 'Rà soát thông tin' }));
    const heading = screen.getByRole('heading', { name: '5. Rà soát bản nháp — chưa tạo đơn' });
    expect(document.activeElement).toBe(heading);
    expect((screen.getByRole('button', { name: 'Đặt hàng chưa khả dụng' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('Chưa thể xác nhận', { exact: true })).toBeTruthy();
    expect(store.getSnapshot().cart).toEqual([{ sku: 'DEMO-U1000-T', quantity: 2 }]);
    act(() => { store.update('DEMO-U1000-T', 1); });
    expect(screen.queryByRole('heading', { name: /Rà soát bản nháp/ })).toBeNull();
  });
});
describe('07.8 — quote interface', () => {
  it('reviews an email-only described need and invalidates review after editing', async () => {
    const user = userEvent.setup(); render(<MemoryRouter><QuotePage /></MemoryRouter>);
    await user.type(screen.getByLabelText(/Tên người liên hệ/), 'Người thử');
    await user.type(screen.getByLabelText('Email liên hệ'), 'tester@example.com');
    await user.type(screen.getByLabelText('Mô tả nhu cầu'), 'Cần tư vấn máy in');
    await user.click(screen.getByRole('button', { name: 'Rà soát yêu cầu' }));
    expect(screen.getByRole('heading', { name: 'Bản nháp yêu cầu — chưa gửi' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Gửi yêu cầu chưa khả dụng' }) as HTMLButtonElement).disabled).toBe(true);
    await user.type(screen.getByLabelText('Mô tả nhu cầu'), ' văn phòng');
    expect(screen.queryByRole('heading', { name: 'Bản nháp yêu cầu — chưa gửi' })).toBeNull();
  });
  it('preserves an invalid URL SKU for correction and lets the user remove it', async () => {
    const user = userEvent.setup(); render(<MemoryRouter initialEntries={['/bao-gia/?sku=REMOVED-SKU']}><QuotePage /></MemoryRouter>);
    expect((screen.getByLabelText('SKU thiết bị 1') as HTMLSelectElement).value).toBe('REMOVED-SKU');
    await user.click(screen.getByRole('button', { name: 'Rà soát yêu cầu' }));
    expect(within(screen.getByRole('alert')).getByRole('link', { name: /Chọn SKU có trong danh mục/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Xóa thiết bị 1' }));
    expect(screen.getByText(/Chưa chọn SKU/)).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Thêm thiết bị' }));
  });
  it('adds a focusable row, retains the selected PDP SKU and never requires stock for bulk quote', async () => {
    const user = userEvent.setup(); render(<MemoryRouter initialEntries={['/bao-gia/?sku=DEMO-U1000-R']}><QuotePage /></MemoryRouter>);
    expect((screen.getByLabelText('SKU thiết bị 1') as HTMLSelectElement).value).toBe('DEMO-U1000-R');
    await user.click(screen.getByRole('button', { name: 'Thêm thiết bị' }));
    expect(document.activeElement).toBe(screen.getByLabelText('SKU thiết bị 2'));
    await user.selectOptions(screen.getByLabelText('SKU thiết bị 2'), 'DEMO-UOLD-T');
    expect(screen.getByText(/Mẫu EOL: chỉ hỏi thông tin/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /thanh toán/i })).toBeNull();
  });
});
describe('07.9–07.10 — content and honest receipt states', () => {
  it('renders all six policies with no invented effective date', () => {
    render(<MemoryRouter><PolicyIndex /></MemoryRouter>);
    expect(screen.getAllByRole('link')).toHaveLength(6);
    expect(screen.getAllByText('Chưa có ngày hiệu lực')).toHaveLength(6);
  });
  it('has accessible contents anchors and no invented warranty promise', async () => {
    const user = userEvent.setup(); render(<MemoryRouter><InformationPage path="/chinh-sach/bao-hanh/" /></MemoryRouter>);
    expect(screen.getByRole('status').textContent).toBe('Chưa công bố thông tin chính thức');
    await user.click(screen.getByRole('link', { name: 'Điều kiện và tiếp nhận' }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Điều kiện và tiếp nhận' }));
    expect(document.body.textContent).not.toMatch(/bảo hành \d+ tháng|miễn phí đổi trả/i);
  });
  it('does not publish fake contact details or duplicate the quote form', () => {
    const { container } = render(<MemoryRouter><InformationPage path="/lien-he/" /></MemoryRouter>);
    expect(container.querySelector('a[href^="tel:"], a[href^="mailto:"], form')).toBeNull();
    expect(screen.getByRole('link', { name: 'Mở form báo giá thử nghiệm' }).getAttribute('href')).toBe('/bao-gia/');
  });
  it.each(['order', 'quote', 'tracking'] as const)('does not derive a receipt or private information from a forged %s URL', (kind) => {
    const { container } = render(<MemoryRouter initialEntries={['/dat-hang/da-tiep-nhan/?id=ORDER-FAKE&phone=0901234567']}><ReceiptPage kind={kind} /></MemoryRouter>);
    expect(screen.getByRole('status').textContent).toMatch(/Chưa có kết quả tiếp nhận đã xác minh/);
    expect(container.textContent).not.toMatch(/ORDER-FAKE|0901234567/);
    expect(container.querySelector('form')).toBeNull();
  });
});
