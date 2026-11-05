import type { PreviewProduct } from './home-data';
import { CategoryIcon } from './category-icon';

export function PreviewProductCard({ product }: { product: PreviewProduct }) {
  return <article aria-labelledby={`product-${product.id}`} className="flex h-full gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-col sm:gap-0 sm:p-5">
    <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-3 self-start rounded-lg bg-canvas px-2 py-6 text-muted sm:aspect-[4/3] sm:w-full sm:self-auto sm:py-4">
      <CategoryIcon categoryId={product.categoryId} size={44} />
      <span className="text-center text-xs leading-5">Chưa có ảnh</span>
    </div>
    <div className="flex min-w-0 flex-1 flex-col sm:pt-5">
      <p className="text-xs leading-5 text-muted">{product.category}</p>
      <h3 id={`product-${product.id}`} className="mt-1 text-base leading-6 font-semibold text-ink sm:text-lg">{product.name}</h3>
      <p className="mt-2 text-xs leading-5 break-words text-muted">Model: {product.model}<br />SKU: {product.sku}</p>
      <dl className="mt-4 space-y-2 text-sm leading-5">{product.specifications.map((spec) => <div key={spec.label}>
        <dt className="text-muted">{spec.label}</dt><dd className="mt-0.5 font-medium text-ink">{spec.value ?? 'Chưa xác minh'}</dd>
      </div>)}</dl>
      <div className="mt-auto pt-5">
        <p className="font-semibold text-ink">Giá chưa công bố</p>
        <p className="mt-1 text-xs leading-5 text-muted">Tồn kho chưa xác nhận</p>
        <span className="mt-3 inline-block rounded bg-brand-soft px-2 py-1 text-xs font-medium text-brand">Mẫu giao diện</span>
      </div>
    </div>
  </article>;
}
