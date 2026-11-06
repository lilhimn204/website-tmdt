import { Link, useParams, useNavigation } from 'react-router';
import { usePreviewSearch } from './use-preview-search';
import { CatalogCard, CatalogFeedback, DemoNotice } from './catalog-ui';
import { CatalogFilters } from './catalog-filters';
import { catalogCategories, demoBrands, demoProducts } from './catalog-data';
import { selectCatalog, specText } from './catalog-model';

export function CatalogPage({ mode }: { mode: 'all' | 'category' | 'search' | 'brand' }) {
  const { category: categorySlug, brand: brandSlug } = useParams();
  const [params, setParams] = usePreviewSearch();
  const navigation = useNavigation();
  const routeCategory = mode === 'category' ? categorySlug : undefined;
  const brand = mode === 'brand' ? demoBrands.find((entry) => entry.slug === brandSlug) : undefined;
  const result = selectCatalog(params, routeCategory, brand ? demoProducts.filter((entry) => entry.brand === brand.name) : demoProducts);
  const category = catalogCategories.find((entry) => entry.slug === routeCategory);
  const title = brand?.name ?? (mode === 'search' ? 'Tìm kiếm sản phẩm' : category?.label ?? (mode === 'category' ? 'Danh mục sản phẩm' : 'Tất cả sản phẩm'));
  if (mode === 'brand' && !brand) return <><h1 className="mb-4 text-3xl font-semibold">Không tìm thấy nhãn hàng</h1><Link to="/thuong-hieu/" className="primary-button">Xem danh sách nhãn DEMO</Link></>;
  if (routeCategory && !category) return <><h1 className="mb-4 text-3xl font-semibold">Không tìm thấy danh mục</h1><CatalogFeedback status="error" message="Hãy dùng menu để chọn lại danh mục." /></>;
  const emptySearch = mode === 'search' && !result.query;
  const children = catalogCategories.filter((entry) => entry.parent === (routeCategory || null));
  function reset() { const next = new URLSearchParams(); if (result.query) next.set('q', result.query); setParams(next); }
  const active = [...new Set(params.keys())].filter((key) => !['q', 'sap-xep', 'trang'].includes(key));
  function filterLabel(key: string) {
    const values = params.getAll(key);
    if (key === 'danh-muc') return `Loại: ${catalogCategories.find((entry) => entry.slug === values[0])?.label ?? values[0]}`;
    if (key === 'thuong-hieu') return `Nhãn: ${values.join(', ')}`;
    const definition = result.definitions.find((entry) => entry.key === key || `${entry.key}-tu` === key || `${entry.key}-den` === key);
    const suffix = definition && key !== definition.key ? (key.endsWith('-tu') ? ' từ' : ' đến') : '';
    return `${definition?.label ?? key}${suffix}: ${values.map((value) => specText(value === 'true' ? true : value === 'false' ? false : value, definition)).join(', ')}`;
  }
  return <>
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted"><Link to="/" className="underline underline-offset-4">Trang chủ</Link><span aria-hidden="true"> / </span>{title}</nav>
    <h1 id="catalog-title" tabIndex={-1} className="mb-4 text-3xl leading-tight font-semibold">{title}</h1>
    <DemoNotice />
    {children.length > 0 && <nav aria-label="Nhóm danh mục" className="mb-6 flex flex-wrap gap-2">{children.map((entry) => <Link key={entry.slug} to={brand ? `/thuong-hieu/${brand.slug}/?danh-muc=${entry.slug}` : `/danh-muc/${entry.slug}/`} className="secondary-button">{entry.label}</Link>)}</nav>}
    <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-6">
      <CatalogFilters key={brandSlug} params={params} {...(routeCategory ? { routeCategory } : {})} {...(brand ? { fixedBrand: brand.name } : {})} onApply={setParams} />
      <section aria-label="Kết quả sản phẩm" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <p role="status" className="text-sm leading-6 text-muted">{emptySearch ? 'Nhập từ khóa để bắt đầu.' : `${result.total} SKU mẫu${result.query ? ` cho “${result.query}”` : ''}`}</p>
          <div><label htmlFor="catalog-sort" className="mr-2 text-sm">Sắp xếp</label><select id="catalog-sort" value={result.sort} className="min-h-12 rounded-lg border border-control-border bg-surface px-3 text-sm" onChange={(event) => { const next = new URLSearchParams(params); if (event.target.value === 'mac-dinh') next.delete('sap-xep'); else next.set('sap-xep', event.target.value); next.delete('trang'); setParams(next); }}>
            <option value="mac-dinh">Phù hợp nhất</option><option value="ten">Tên A–Z</option><option value="gia-tang">Giá kiểm thử tăng</option><option value="gia-giam">Giá kiểm thử giảm</option>
          </select></div>
        </div>
        {active.length > 0 && <div aria-label="Bộ lọc đã áp dụng" className="mb-5 flex flex-wrap gap-2">{active.map((key) => <button type="button" className="secondary-button break-all" key={key} onClick={() => {
          const next = new URLSearchParams(params); next.delete(key); next.delete('trang');
          if (key === 'danh-muc') for (const current of [...next.keys()]) if (!['q', 'thuong-hieu', 'sap-xep'].includes(current)) next.delete(current);
          setParams(next);
        }}>Bỏ {filterLabel(key)}</button>)}<button type="button" className="secondary-button" onClick={reset}>Xóa bộ lọc</button></div>}
        {navigation.state !== 'idle' ? <CatalogFeedback status="loading" message="Đang mở kết quả…" /> : result.errors.length ? <div className="rounded-xl border border-line bg-surface p-6"><div role="alert"><h2 className="font-semibold text-danger">Cần kiểm tra lại bộ lọc</h2><ul className="mt-3 list-inside list-disc text-sm leading-7">{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div><button type="button" className="secondary-button mt-4" onClick={reset}>Đặt lại bộ lọc và trang</button></div> : emptySearch ? <CatalogFeedback status="empty" message="Tìm bằng tên, nhãn mẫu, model hoặc SKU. Ví dụ: DEMO-U1000-T." /> : result.items.length ? <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{result.items.map((item) => <li key={item.variant.sku}><CatalogCard item={item} /></li>)}</ul>
          {result.pages > 1 && <nav aria-label="Phân trang" className="mt-6 flex flex-wrap gap-2">{Array.from({ length: result.pages }, (_, index) => index + 1).map((page) => <button key={page} type="button" aria-current={page === result.page ? 'page' : undefined} className={page === result.page ? 'primary-button' : 'secondary-button'} onClick={() => { const next = new URLSearchParams(params); if (page === 1) next.delete('trang'); else next.set('trang', String(page)); setParams(next); document.getElementById('catalog-title')?.focus(); }}>Trang {page}</button>)}</nav>}
        </> : <div><CatalogFeedback status="empty" message={params.size ? 'Không tìm thấy SKU phù hợp. Hãy sửa từ khóa hoặc bỏ bớt bộ lọc.' : 'Nhóm này chưa có sản phẩm mẫu. Bạn có thể xem nhóm khác.'} /><Link to="/san-pham/" className="secondary-button mt-4">Xem tất cả sản phẩm</Link></div>}
      </section>
    </div>
  </>;
}
