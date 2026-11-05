// @vitest-environment jsdom
import './ui-setup';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import Home, { meta } from '../src/routes/home';
import { HomeCategories } from '../src/components/home-categories';
import { HomeFeaturedProducts } from '../src/components/home-featured-products';
import { HomeBrands } from '../src/components/home-brands';
import { homeCategories, previewProducts, referenceBrands } from '../src/components/home-data';

describe('Home page — module 07.2', () => {
  it('has one h1 and all requested sections without technical starter copy', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    for (const name of ['Bạn đang tìm thiết bị gì?', 'Sản phẩm nổi bật', 'Thương hiệu trong danh mục dự kiến', 'Thông tin rõ ràng trước khi mua', 'Mua cho doanh nghiệp?']) {
      expect(screen.getByRole('heading', { name })).toBeTruthy();
    }
    expect(screen.queryByText('Nền tảng kỹ thuật')).toBeNull();
    expect(screen.queryByRole('link', { name: /kiểm tra.*API/i })).toBeNull();
    expect(meta()[0]?.title).toContain('Thiết bị công nghệ');
  });

  it('gives each working home action a real in-page target and never links to missing sales routes', () => {
    const { container } = render(<MemoryRouter><Home /></MemoryRouter>);
    const links = [...container.querySelectorAll<HTMLAnchorElement>('a[href]')];
    expect(links).toHaveLength(6);
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href.startsWith('#')).toBe(true);
      const target = document.getElementById(href.slice(1));
      expect(target).not.toBeNull();
      expect(target?.getAttribute('tabindex')).toBe('-1');
    }
    expect(screen.getByRole('link', { name: 'Khám phá danh mục' }).getAttribute('href')).toBe('#danh-muc-trang-chu');
    expect(screen.getByRole('link', { name: 'Chuẩn bị yêu cầu' }).getAttribute('href')).toBe('#nhu-cau-doanh-nghiep');
  });

  it('labels every preview product and keeps unknown values distinct from zero, out of stock or unsupported', () => {
    render(<HomeFeaturedProducts state={{ status: 'ready', items: previewProducts }} />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      const scope = within(card);
      expect(scope.getByText('Mẫu giao diện')).toBeTruthy();
      expect(scope.getByText('Giá chưa công bố')).toBeTruthy();
      expect(scope.getByText('Tồn kho chưa xác nhận')).toBeTruthy();
      expect(scope.getByText('Chưa xác minh')).toBeTruthy();
      expect(scope.getByText('Chưa có ảnh')).toBeTruthy();
      expect(scope.queryByRole('button')).toBeNull();
      expect(card.textContent).not.toMatch(/0\s*₫|hết hàng|không hỗ trợ|đã thêm/i);
    }
  });

  it('identifies brand references without importing logos or inventing partnerships', () => {
    const { container } = render(<HomeBrands state={{ status: 'ready', items: referenceBrands }} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByText(/quyền phân phối.*chưa được xác nhận/)).toBeTruthy();
    expect(screen.getByText('Pantum')).toBeTruthy();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.textContent).not.toMatch(/đối tác chính thức|nhà phân phối chính hãng/i);
  });

  it('does not create an RFQ form, purchase control or unapproved sales promise', () => {
    const { container } = render(<MemoryRouter><Home /></MemoryRouter>);
    expect(container.querySelector('form')).toBeNull();
    expect(screen.queryByRole('button', { name: /mua|gửi|thêm vào giỏ/i })).toBeNull();
    expect(screen.getByText(/chưa gửi hoặc lưu thông tin của bạn/)).toBeTruthy();
    expect(screen.getByText(/Chưa áp dụng cam kết bán hàng/)).toBeTruthy();
    expect(container.textContent).not.toMatch(/freeship|miễn phí vận chuyển|đã nhận yêu cầu|bảo hành \d+/i);
  });

  it('distinguishes loading products from an empty list and hides skeletons from assistive output', () => {
    const { container } = render(<HomeFeaturedProducts state={{ status: 'loading' }} />);
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Đang tải sản phẩm nổi bật…')).toBeTruthy();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.queryByText(/Chưa có sản phẩm nổi bật được công bố/)).toBeNull();
  });

  it('shows an empty product message without falling back to invented products', () => {
    render(<HomeFeaturedProducts state={{ status: 'ready', items: [] }} />);
    expect(screen.getByRole('status').textContent).toMatch(/Chưa có sản phẩm nổi bật/);
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.queryByText('Mẫu giao diện')).toBeNull();
  });

  it('isolates a product failure and delegates retry without faking recovery', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    render(<><HomeCategories state={{ status: 'ready', items: homeCategories }} /><HomeFeaturedProducts state={{ status: 'error', onRetry: retry }} /><HomeBrands state={{ status: 'ready', items: referenceBrands }} /></>);
    expect(screen.getByRole('alert').textContent).toBe('Không tải được sản phẩm nổi bật.');
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('link', { name: /UPS.*Gợi ý chọn/ })).toBeTruthy();
    expect(screen.getByText('PROLiNK')).toBeTruthy();
  });

  it('handles empty categories and does not manufacture links', () => {
    render(<HomeCategories state={{ status: 'ready', items: [] }} />);
    expect(screen.getByRole('status').textContent).toMatch(/Danh mục đang được chuẩn bị/);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('handles empty brands without a made-up logo wall', () => {
    render(<HomeBrands state={{ status: 'ready', items: [] }} />);
    expect(screen.getByRole('status').textContent).toBe('Danh sách thương hiệu đang chờ xác nhận.');
    expect(screen.queryByRole('list')).toBeNull();
  });
});
