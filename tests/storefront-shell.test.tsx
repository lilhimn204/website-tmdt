// @vitest-environment jsdom
import './ui-setup';
import type { ReactNode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from '../src/components/app-shell';
import { CategoryMenuState } from '../src/components/category-menu-state';
import { DesktopNavigation } from '../src/components/desktop-navigation';
import { MobileNavigation } from '../src/components/mobile-navigation';
import { previewNavigation } from '../src/components/navigation-data';
import { SearchForm } from '../src/components/search-form';
import { SiteLink } from '../src/components/site-link';
import { StorefrontHeader } from '../src/components/storefront-header';

function LocationProbe() {
  return <output aria-label="Đường dẫn hiện tại">{useLocation().pathname}</output>;
}

function inRouter(children: ReactNode) {
  return render(<MemoryRouter>{children}<LocationProbe /></MemoryRouter>);
}

describe('Storefront shell — module 07.1', () => {
  it('navigates an available destination using a real link', async () => {
    const user = userEvent.setup();
    inRouter(<SiteLink item={{ label: 'Kiểm tra API', to: '/kiem-tra', available: true }} />);
    const link = screen.getByRole('link', { name: 'Kiểm tra API' });
    expect(link.getAttribute('href')).toBe('/kiem-tra');
    await user.click(link);
    expect(screen.getByLabelText('Đường dẫn hiện tại').textContent).toBe('/kiem-tra');
  });

  it('keeps unavailable destinations out of navigation and the tab order', async () => {
    const user = userEvent.setup();
    inRouter(<SiteLink item={{ label: 'Yêu cầu báo giá', to: '/bao-gia/', available: false }} />);
    const unavailable = screen.getByRole('link', { name: 'Yêu cầu báo giá' });
    expect(unavailable.getAttribute('aria-disabled')).toBe('true');
    expect(unavailable.hasAttribute('href')).toBe(false);
    expect(unavailable.hasAttribute('tabindex')).toBe(false);
    await user.click(unavailable);
    expect(screen.getByLabelText('Đường dẫn hiện tại').textContent).toBe('/');
  });

  it('provides semantic landmarks and real skip navigation without unapproved links or claims', () => {
    const { container } = inRouter(<AppShell><h1>Nội dung bản xem trước</h1></AppShell>);
    expect(screen.getAllByRole('banner')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const skip = screen.getByRole('link', { name: 'Đến nội dung chính' });
    expect(skip.getAttribute('href')).toBe('#noi-dung');
    expect(screen.getByRole('main').id).toBe('noi-dung');
    const links = [...container.querySelectorAll<HTMLAnchorElement>('a[href]')];
    expect(links.some((link) => link.getAttribute('href') === '#')).toBe(false);
    expect(links.some((link) => /^(tel:|mailto:)|\/quan-tri\//.test(link.getAttribute('href') || ''))).toBe(false);
    expect(screen.queryByRole('link', { name: /tài khoản/i })).toBeNull();
    expect(screen.getByRole('contentinfo').textContent).not.toMatch(/freeship|chính hãng|24\/7|nhà phân phối chính thức/i);
  });

  it('does not invent a zero cart count when no cart state has been supplied', () => {
    const view = inRouter(<StorefrontHeader name="Website TMĐT" state={previewNavigation} />);
    const cart = screen.getByRole('link', { name: /^Giỏ hàng/i });
    expect(cart.textContent).not.toMatch(/\b0\b/);
    view.rerender(<MemoryRouter><StorefrontHeader name="Website TMĐT" state={previewNavigation} cartCount={5} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /^Giỏ hàng/i }).textContent).toContain('5');
  });

  it('labels the disabled preview search and explains why it is unavailable', () => {
    inRouter(<SearchForm />);
    const input = screen.getByLabelText<HTMLInputElement>('Tìm sản phẩm');
    expect(input.disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /tìm/i }).disabled).toBe(true);
    const descriptionId = input.getAttribute('aria-describedby');
    expect(descriptionId).toBeTruthy();
    const descriptions = descriptionId?.split(/\s+/).map((id) => document.getElementById(id)?.textContent).join(' ');
    expect(descriptions).toMatch(/chưa|xem trước|sẽ mở/i);
  });

  it('announces the loading state without presenting it as an empty catalog', () => {
    inRouter(<CategoryMenuState state={{ status: 'loading' }} />);
    expect(screen.getByText('Đang tải danh mục…')).toBeTruthy();
    expect(screen.queryByText('Chưa có danh mục được công bố.')).toBeNull();
  });

  it('shows an honest empty state when no published categories are available', () => {
    inRouter(<CategoryMenuState state={{ status: 'ready', groups: [] }} />);
    expect(screen.getByText('Chưa có danh mục được công bố.')).toBeTruthy();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('offers retry for a catalog error instead of disguising the error as an empty list', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    inRouter(<CategoryMenuState state={{ status: 'error', onRetry }} />);
    expect(screen.getByText('Không tải được danh mục.')).toBeTruthy();
    expect(screen.queryByText('Chưa có danh mục được công bố.')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('opens the desktop categories by click and closes on Escape or an outside action', async () => {
    const user = userEvent.setup();
    inRouter(<><DesktopNavigation state={previewNavigation} /><button type="button">Ngoài menu</button></>);
    const summary = screen.getByText('Danh mục').closest('summary');
    if (!summary) throw new Error('Category trigger must be a native summary.');
    const disclosure = summary.closest('details');
    expect(disclosure).not.toBeNull();
    await user.click(summary);
    expect(disclosure?.open).toBe(true);
    await user.keyboard('{Escape}');
    expect(disclosure?.open).toBe(false);
    await user.click(summary);
    expect(disclosure?.open).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Ngoài menu' }));
    expect(disclosure?.open).toBe(false);
  });

  it('lets mobile users drill down to product types and return through each level', async () => {
    const user = userEvent.setup();
    inRouter(<MobileNavigation state={previewNavigation} />);
    await user.click(screen.getByRole('button', { name: 'Mở menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Danh mục và điều hướng' });
    await user.click(within(dialog).getByRole('button', { name: 'Danh mục' }));
    await user.click(within(dialog).getByRole('button', { name: 'UPS & thiết bị nguồn' }));
    expect(within(dialog).getByRole('link', { name: 'UPS Online một pha' }).getAttribute('aria-disabled')).toBe('true');
    await user.click(within(dialog).getByRole('button', { name: 'Quay lại' }));
    expect(within(dialog).getByRole('button', { name: 'Máy in & vật tư' })).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Quay lại' }));
    expect(within(dialog).getByRole('button', { name: 'Danh mục' })).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: 'Đóng menu' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('returns focus and restores the prior overflow value when the mobile drawer is cancelled', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'scroll';
    inRouter(<MobileNavigation state={previewNavigation} />);
    const trigger = screen.getByRole('button', { name: 'Mở menu' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Danh mục và điều hướng' });
    expect(document.body.style.overflow).toBe('hidden');
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.activeElement).toBe(trigger);
  });

  it('releases the mobile scroll lock when the shell is unmounted while the drawer is open', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'scroll';
    const view = inRouter(<MobileNavigation state={previewNavigation} />);
    await user.click(screen.getByRole('button', { name: 'Mở menu' }));
    expect(document.body.style.overflow).toBe('hidden');
    view.unmount();
    expect(document.body.style.overflow).toBe('scroll');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.querySelector('dialog[open]')).toBeNull();
  });
});
