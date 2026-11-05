import { useEffect, useRef, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/csr/SquaresFour';
import { destinations, type NavigationState } from './navigation-data';
import { SiteLink } from './site-link';
import { CategoryMenuState } from './category-menu-state';

export function DesktopNavigation({ state }: { state: NavigationState }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !detailsRef.current?.contains(event.target) && detailsRef.current) detailsRef.current.open = false;
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  return (
    <nav aria-label="Điều hướng chính" className="hidden border-t border-line lg:block">
      <div className="storefront-container relative flex min-h-14 items-center gap-8">
        <details ref={detailsRef} className="category-disclosure" onToggle={(event) => setOpen(event.currentTarget.open)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false; }}
          onKeyDown={(event) => { if (event.key === 'Escape' && detailsRef.current?.open) { event.preventDefault(); detailsRef.current.open = false; summaryRef.current?.focus(); } }}>
          <summary ref={summaryRef} className="flex min-h-14 cursor-pointer list-none items-center gap-3 font-semibold text-ink hover:text-brand">
            <SquaresFourIcon size={21} aria-hidden="true" /><span>Danh mục</span><CaretDownIcon size={16} aria-hidden="true" className="category-caret" />
          </summary>
          <div className="category-panel absolute top-full right-0 left-0 z-30 max-h-[min(65dvh,36rem)] overflow-y-auto rounded-b-2xl border border-line bg-surface shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-4">
              <p className="text-sm font-semibold text-ink">Duyệt theo ngành hàng</p>
              <SiteLink item={{ ...destinations.categories, label: 'Xem tất cả danh mục' }} className="text-sm" />
            </div>
            {state.status === 'ready' && state.preview && <p className="px-6 pt-4 text-sm text-muted">Danh mục minh họa, chưa phải danh mục đã công bố.</p>}
            <CategoryMenuState state={state} />
            {state.status === 'ready' && state.groups.length > 0 && <div className="grid grid-cols-4 gap-6 p-6">{state.groups.map((group) => (
              <section key={group.id} aria-labelledby={`desktop-${group.id}`}>
                <h2 id={`desktop-${group.id}`} className="mb-3 text-base font-semibold text-ink">{group.label}</h2>
                <ul className="space-y-1">{group.children.map((item) => <li key={item.to}><SiteLink item={item} className="min-h-11 text-sm" onNavigate={() => { if (detailsRef.current) detailsRef.current.open = false; }} /></li>)}</ul>
                <SiteLink item={{ ...group, label: 'Xem tất cả' }} className="mt-2 min-h-11 text-sm font-semibold" />
              </section>
            ))}</div>}
          </div>
        </details>
        <SiteLink item={destinations.home} className="min-h-14 text-sm font-medium" />
        <SiteLink item={destinations.brands} className="min-h-14 text-sm font-medium" />
        <SiteLink item={destinations.products} className="min-h-14 text-sm font-medium" />
        <SiteLink item={destinations.quote} className="ml-auto min-h-14 text-sm font-semibold" />
      </div>
    </nav>
  );
}
