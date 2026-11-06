import { Link, useLocation } from 'react-router';
import { usePreview } from './preview-context';
import { comparisonHref, money, saleIssue, specText } from './catalog-model';
import { categoryIconId, productHref, specDefinitions, type CatalogItem } from './catalog-data';
import { CategoryIcon } from './category-icon';

export function DemoNotice() {
  return <p className="mb-6 rounded-lg border border-line bg-brand-soft px-4 py-3 text-sm leading-6 text-brand"><strong>Dữ liệu DEMO.</strong> Giá, số lượng, thông số và bảo hành đều là dữ liệu kiểm thử. Không phải đề nghị bán hàng; chưa tạo đơn hoặc giữ hàng.</p>;
}
export function CatalogFeedback({ status, message, onRetry }: { status: 'loading' | 'error' | 'empty'; message: string; onRetry?: () => void }) {
  return <div className="rounded-xl border border-line bg-surface p-6">
    <p role={status === 'error' ? 'alert' : 'status'} aria-busy={status === 'loading' ? true : undefined} className={status === 'error' ? 'text-danger' : 'text-muted'}>{message}</p>
    {status === 'loading' && <div aria-hidden="true" className="mt-4 h-24 rounded bg-canvas motion-safe:animate-pulse" />}
    {onRetry && <button type="button" onClick={onRetry} className="secondary-button mt-4">Thử lại</button>}
  </div>;
}
export function CompareChoice({ sku }: { sku: string }) {
  const store = usePreview();
  return <label className="flex min-h-12 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5 accent-brand" checked={store.compare.includes(sku)} onChange={() => store.toggleCompare(sku)} />So sánh <span className="sr-only">{sku}</span></label>;
}
export function CompareTray() {
  const { compare, clearCompare } = usePreview();
  const location = useLocation();
  if (!compare.length || ['/so-sanh', '/dat-hang', '/bao-gia'].some((path) => location.pathname.startsWith(path))) return null;
  return <aside aria-label="Danh sách so sánh" className="storefront-container w-full pb-6"><div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand bg-brand-soft p-4">
    <p className="mr-auto text-sm text-ink">Đã chọn {compare.length}/3 SKU để so sánh</p>
    <Link to={comparisonHref(compare)} className="primary-button">Xem so sánh</Link>
    <button type="button" onClick={clearCompare} className="secondary-button">Bỏ lựa chọn</button>
  </div></aside>;
}
export function CatalogCard({ item }: { item: CatalogItem }) {
  const { product, variant } = item;
  const issue = saleIssue(item);
  return <article className="grid h-full grid-cols-[64px_minmax(0,1fr)] gap-x-3 rounded-xl border border-line bg-surface p-4 sm:flex sm:flex-col">
    <div aria-hidden="true" className="row-span-3 flex h-20 items-center justify-center rounded-lg bg-canvas text-brand sm:mb-4 sm:aspect-[4/3] sm:h-auto"><CategoryIcon categoryId={categoryIconId(product.category)} size={44} /></div>
    <Link to={productHref(item)} className="group col-start-2 block min-w-0 text-ink">
      <p className="text-xs text-muted">{product.brand} · Mẫu DEMO</p>
      <h2 className="mt-1 text-lg leading-7 font-semibold group-hover:text-brand group-hover:underline">{product.name}</h2>
      <p className="mt-1 text-sm text-muted">{variant.label}</p>
      <p className="mt-2 text-xs leading-5 break-words text-muted">{product.model}<br />SKU: {variant.sku}</p>
    </Link>
    <dl className="col-start-2 my-4 space-y-2 text-sm">{specDefinitions[product.family].slice(0, 2).map((definition) => <div key={definition.key}><dt className="text-muted">{definition.label}</dt><dd>{specText(variant.specs[definition.key], definition)}</dd></div>)}</dl>
    <div className="col-start-2 mt-auto">
      <p className="text-lg font-semibold">{variant.quoteOnly ? 'Yêu cầu báo giá' : variant.price === null ? 'Chưa có giá' : money(variant.price)}</p><p className="text-xs leading-5 text-muted">Giá kiểm thử</p>
      <p className={`mt-2 text-xs leading-5 ${issue ? 'text-danger' : 'text-muted'}`}>{issue ?? 'Có thể thêm vào giỏ thử nghiệm'}</p>
      <CompareChoice sku={variant.sku} />
    </div>
  </article>;
}
