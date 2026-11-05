import { useEffect, useRef, useState, type FormEvent } from 'react';
import { catalogCategories, catalogItems, specDefinitions } from './catalog-data';
import { paramsFromForm, specText } from './catalog-model';

interface FilterProps { params: URLSearchParams; routeCategory?: string; onApply: (params: URLSearchParams) => void }

function FilterForm({ params, routeCategory, onApply, prefix }: FilterProps & { prefix: string }) {
  const initialCategory = params.get('danh-muc') || routeCategory || '';
  const [chosen, setChosen] = useState(initialCategory);
  const [changed, setChanged] = useState(false);
  const category = catalogCategories.find((entry) => entry.slug === chosen);
  const definitions = category?.family ? specDefinitions[category.family] : [];
  const items = catalogItems();
  const brands = [...new Set(items.map((entry) => entry.product.brand))];
  const scope = catalogCategories.filter((entry) => !routeCategory || entry.slug === routeCategory || entry.parent === routeCategory);
  const filterParams = changed ? new URLSearchParams() : params;
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onApply(paramsFromForm(event.currentTarget)); }
  return <form onSubmit={submit} className="space-y-6">
    <div><label htmlFor={`${prefix}-q`} className="mb-2 block text-sm font-semibold">Từ khóa</label><input id={`${prefix}-q`} type="search" name="q" defaultValue={params.get('q') || ''} maxLength={200} className="field-input" placeholder="Tên, model, SKU, nhãn mẫu" /></div>
    <div><label htmlFor={`${prefix}-category`} className="mb-2 block text-sm font-semibold">Loại thiết bị</label>
      <select id={`${prefix}-category`} name="danh-muc" value={chosen} className="field-input" onChange={(event) => { setChosen(event.target.value); setChanged(true); }}>
        {!routeCategory && <option value="">Tất cả loại</option>}
        {scope.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.parent ? '– ' : ''}{entry.label}</option>)}
      </select>
    </div>
    {changed && <p role="status" className="text-xs leading-6 text-muted">Đã đổi loại thiết bị. Các lựa chọn thông số cũ được bỏ; hãy chọn bộ lọc mới rồi áp dụng.</p>}
    <fieldset><legend className="mb-2 text-sm font-semibold">Nhãn hàng kiểm thử</legend>{brands.map((brand) => <label key={brand} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="thuong-hieu" value={brand} defaultChecked={params.getAll('thuong-hieu').includes(brand)} className="h-4 w-4 accent-brand" />{brand}</label>)}</fieldset>
    {!category?.family && <p className="text-xs leading-6 text-muted">Chọn một loại cụ thể để lọc thông số riêng. Danh mục hỗn hợp chỉ có bộ lọc chung.</p>}
    {definitions.filter((definition) => definition.filter).map((definition) => <fieldset key={`${chosen}-${definition.key}`}>
      <legend className="mb-2 text-sm font-semibold">{definition.label}{definition.unit ? ` (${definition.unit})` : ''}</legend>
      {definition.filter === 'choice' ? [...new Set(items.filter((item) => item.product.family === category?.family).map((item) => item.variant.specs[definition.key]).filter((value) => value != null))].map((value) => <label key={String(value)} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name={definition.key} value={String(value)} defaultChecked={filterParams.getAll(definition.key).includes(String(value))} className="h-4 w-4 accent-brand" />{specText(value, definition)}</label>) : <div className="grid grid-cols-2 gap-2">{['tu', 'den'].map((suffix) => <div key={suffix}>
        <label htmlFor={`${prefix}-${definition.key}-${suffix}`} className="mb-1 block text-xs text-muted">{suffix === 'tu' ? 'Từ' : 'Đến'}</label><input id={`${prefix}-${definition.key}-${suffix}`} name={`${definition.key}-${suffix}`} type="number" min="0" step="any" defaultValue={filterParams.get(`${definition.key}-${suffix}`) ?? ''} className="field-input" />
      </div>)}</div>}
    </fieldset>)}
    <input type="hidden" name="sap-xep" value={params.get('sap-xep') || ''} />
    <button type="submit" className="primary-button w-full">Áp dụng bộ lọc</button>
  </form>;
}

export function CatalogFilters(props: FilterProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden'; heading.current?.focus();
    const desktop = window.matchMedia('(min-width: 1024px)');
    const close = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener('change', close);
    return () => { document.documentElement.style.overflow = previous; desktop.removeEventListener('change', close); };
  }, [open]);
  return <>
    <aside aria-label="Bộ lọc desktop" className="hidden self-start rounded-xl border border-line bg-surface p-5 lg:block"><h2 className="mb-5 text-lg font-semibold">Lọc sản phẩm</h2><FilterForm key={`${props.routeCategory}-${props.params}`} {...props} prefix="desktop-filter" /></aside>
    <button ref={trigger} type="button" className="secondary-button mb-4 lg:hidden" aria-haspopup="dialog" aria-expanded={open} aria-controls="catalog-filter-dialog" onClick={() => { setGeneration((value) => value + 1); dialog.current?.showModal(); setOpen(true); }}>Mở bộ lọc</button>
    <dialog ref={dialog} id="catalog-filter-dialog" className="mobile-menu" aria-label="Bộ lọc sản phẩm" onClose={() => { setOpen(false); if (window.matchMedia('(min-width: 1024px)').matches) document.getElementById('catalog-title')?.focus(); else trigger.current?.focus(); }}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not([type="hidden"]):not(:disabled), select:not(:disabled)')];
        const first = controls[0]; const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
      <div className="flex h-full flex-col bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line p-4"><h2 ref={heading} tabIndex={-1} className="text-lg font-semibold">Bộ lọc sản phẩm</h2><button type="button" className="secondary-button" onClick={() => dialog.current?.close()}>Hủy / Đóng</button></div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5"><FilterForm key={`${generation}-${props.routeCategory}-${props.params}`} {...props} prefix="mobile-filter" onApply={(params) => { props.onApply(params); dialog.current?.close(); }} /></div>
      </div>
    </dialog>
  </>;
}
