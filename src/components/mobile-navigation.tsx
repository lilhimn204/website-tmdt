import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ListIcon } from '@phosphor-icons/react/dist/csr/List';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { destinations, type NavigationState } from './navigation-data';
import { SiteLink } from './site-link';
import { CategoryMenuState } from './category-menu-state';

export function MobileNavigation({ state }: { state: NavigationState }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState('root');
  const selectedGroup = state.status === 'ready' ? state.groups.find((group) => group.id === level) : undefined;
  const title = level === 'root' ? 'Khám phá sản phẩm' : level === 'categories' ? 'Danh mục' : selectedGroup?.label ?? 'Danh mục';

  useEffect(() => {
    if (!open) return;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) dialogRef.current?.close(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);

  useEffect(() => { if (open) headingRef.current?.focus(); }, [level, open]);

  function closeMenu() { dialogRef.current?.close(); }
  function keepTabInMenu(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
      .filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) { event.preventDefault(); headingRef.current?.focus(); return; }
    // Native dialog makes the page inert. Explicit wrapping also prevents Tab
    // at the boundary from moving focus into the browser's address bar.
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  function afterClose() {
    setOpen(false);
    if (window.matchMedia('(min-width: 1024px)').matches) document.getElementById('storefront-brand')?.focus();
    else triggerRef.current?.focus();
  }

  return (
    <>
      <button ref={triggerRef} type="button" aria-label="Mở menu" aria-expanded={open} aria-controls="mobile-navigation" aria-haspopup="dialog" className="icon-control -ml-2 lg:hidden"
        onClick={() => { setLevel('root'); dialogRef.current?.showModal(); setOpen(true); }}><ListIcon size={25} aria-hidden="true" /></button>
      <dialog ref={dialogRef} id="mobile-navigation" aria-label="Danh mục và điều hướng" className="mobile-menu" onClose={afterClose} onKeyDown={keepTabInMenu}
        onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}>
        <div className="flex h-full min-h-0 flex-col bg-surface">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
            <span className="text-sm font-semibold text-brand">Menu sản phẩm</span>
            <button type="button" className="icon-control" aria-label="Đóng menu" onClick={closeMenu}><XIcon size={23} aria-hidden="true" /></button>
          </div>
          <nav aria-label="Điều hướng trên điện thoại" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
            {level !== 'root' && <button type="button" className="mb-4 flex min-h-12 items-center gap-2 text-sm font-semibold text-brand" onClick={() => setLevel(level === 'categories' ? 'root' : 'categories')}><ArrowLeftIcon size={18} aria-hidden="true" />Quay lại</button>}
            <h2 ref={headingRef} tabIndex={-1} className="mb-5 text-xl font-semibold text-ink">{title}</h2>
            {level === 'root' ? <ul className="space-y-1">
              <li><SiteLink item={destinations.home} className="mobile-nav-row" onNavigate={closeMenu} /></li>
              <li><button type="button" className="mobile-nav-row w-full justify-between" onClick={() => setLevel('categories')}>Danh mục<CaretRightIcon size={18} aria-hidden="true" /></button></li>
              {[destinations.products, destinations.brands, destinations.quote, destinations.support].map((item) => <li key={item.to}><SiteLink item={item} className="mobile-nav-row" onNavigate={closeMenu} /></li>)}
            </ul> : <>
              {state.status === 'ready' && state.preview && <p className="mb-4 text-sm leading-6 text-muted">Danh mục minh họa, chưa phải danh mục đã công bố.</p>}
              <CategoryMenuState state={state} />
              {state.status === 'ready' && (selectedGroup ? <>
                <SiteLink item={{ ...selectedGroup, label: 'Xem tất cả' }} className="mb-3 min-h-12 font-semibold" onNavigate={closeMenu} />
                <ul className="space-y-1">{selectedGroup.children.map((item) => <li key={item.to}><SiteLink item={item} className="mobile-nav-row" onNavigate={closeMenu} /></li>)}</ul>
              </> : state.groups.length > 0 && <>
                <SiteLink item={{ ...destinations.categories, label: 'Xem tất cả danh mục' }} className="mb-3 min-h-12 font-semibold" />
                <ul className="space-y-1">{state.groups.map((group) => <li key={group.id}><button type="button" className="mobile-nav-row w-full justify-between gap-4" onClick={() => setLevel(group.id)}>{group.label}<CaretRightIcon size={18} className="shrink-0" aria-hidden="true" /></button></li>)}</ul>
              </>)}
            </>}
          </nav>
          <p className="shrink-0 border-t border-line px-4 py-4 text-sm leading-6 text-muted">Catalog và giỏ dùng dữ liệu DEMO. Đặt hàng, báo giá và hỗ trợ chưa mở.</p>
        </div>
      </dialog>
    </>
  );
}
