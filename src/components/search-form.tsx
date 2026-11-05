import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

export function SearchForm() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="min-w-0 flex-1 lg:max-w-xl">
      <form role="search" aria-label="Tìm kiếm sản phẩm" aria-describedby="search-availability" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get('q'); const next = new URLSearchParams(); if (typeof value === 'string' && value.trim()) next.set('q', value.trim()); navigate(`/tim-kiem/${next.size ? `?${next}` : ''}`); }}>
        <label htmlFor="storefront-search" className="sr-only">Tìm sản phẩm</label>
        <div className="flex h-12 items-center rounded-lg border border-control-border bg-canvas px-3">
          <MagnifyingGlassIcon size={22} className="shrink-0 text-muted" aria-hidden="true" />
          <input key={`${location.pathname}:${location.search}`} id="storefront-search" name="q" type="search" aria-describedby="search-availability" maxLength={200} defaultValue={params.get('q') || ''} placeholder="Tên sản phẩm, model hoặc SKU" className="min-w-0 flex-1 bg-transparent px-3 text-base text-ink placeholder:text-muted" />
          <button type="submit" aria-label="Tìm kiếm" className="min-h-11 shrink-0 px-1 text-sm font-semibold text-brand">Tìm</button>
        </div>
      </form>
      <p id="search-availability" className="mt-1.5 text-xs leading-5 text-muted">Tìm trong bộ dữ liệu DEMO theo tên, nhãn mẫu, model hoặc SKU.</p>
    </div>
  );
}
