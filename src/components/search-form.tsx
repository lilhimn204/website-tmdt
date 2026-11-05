import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';

export function SearchForm() {
  return (
    <div className="min-w-0 flex-1 lg:max-w-xl">
      <form role="search" aria-label="Tìm kiếm sản phẩm" aria-describedby="search-availability" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="storefront-search" className="sr-only">Tìm sản phẩm</label>
        <div className="flex h-12 items-center rounded-lg border border-control-border bg-canvas px-3">
          <MagnifyingGlassIcon size={22} className="shrink-0 text-muted" aria-hidden="true" />
          <input id="storefront-search" name="q" type="search" aria-describedby="search-availability" disabled placeholder="Tên sản phẩm, model hoặc SKU" className="min-w-0 flex-1 bg-transparent px-3 text-base text-ink placeholder:text-muted disabled:cursor-not-allowed" />
          <button type="submit" disabled aria-label="Tìm kiếm" className="min-h-11 shrink-0 px-1 text-sm font-semibold text-muted disabled:cursor-not-allowed">Tìm</button>
        </div>
      </form>
      <p id="search-availability" className="mt-1.5 text-xs leading-5 text-muted">Tìm kiếm sẽ mở khi có danh mục sản phẩm.</p>
    </div>
  );
}
