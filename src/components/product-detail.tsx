import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { usePreviewSearch } from './use-preview-search';
import { catalogCategories, categoryIconId, demoProducts, specDefinitions, type CatalogItem } from './catalog-data';
import { money, quantityIssue, saleIssue, specText } from './catalog-model';
import { CatalogFeedback, CompareChoice, DemoNotice } from './catalog-ui';
import { ProductGallery } from './product-gallery';
import { usePreview } from './preview-context';

function PurchasePanel({ item }: { item: CatalogItem }) {
  const store = usePreview();
  const [quantity, setQuantity] = useState('1');
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const issue = saleIssue(item);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = /^\d+$/.test(quantity) ? Number(quantity) : NaN;
    const error = quantityIssue(number);
    if (error) { setFeedback({ error: true, text: error }); return; }
    const ok = store.add(item.variant.sku, number);
    setFeedback({ error: !ok, text: store.getNotice() });
  }
  return <div className="mt-6 border-t border-line pt-5">
    <p className="text-3xl font-semibold">{item.variant.quoteOnly ? 'Yêu cầu báo giá' : item.variant.price === null ? 'Chưa có giá' : money(item.variant.price)}</p>
    <p className="mt-1 text-sm text-muted">Giá kiểm thử; chưa xác định thuế và phí giao hàng thực.</p>
    <p className="mt-3 text-sm">Số lượng trong dữ liệu mẫu: <strong>{item.variant.stock ?? 'Chưa xác minh'}</strong></p>
    {item.variant.lifecycle === 'eol' && <p className="mt-2 text-sm font-semibold text-danger">EOL · Trạng thái giả định để kiểm thử</p>}
    {issue && <p id="purchase-unavailable" className="mt-3 text-sm text-danger">{issue}</p>}
    <form onSubmit={add} noValidate className="mt-5">
      <label htmlFor="purchase-quantity" className="mb-2 block text-sm font-semibold">Số lượng</label>
      <div className="flex flex-wrap items-end gap-3"><input id="purchase-quantity" type="number" inputMode="numeric" min="1" max="99" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="field-input max-w-24" aria-invalid={feedback?.error || undefined} aria-describedby={feedback ? 'purchase-feedback' : undefined} />
        <button type="submit" className="primary-button" disabled={!!issue || !store.ready} aria-describedby={issue ? 'purchase-unavailable' : undefined}>Thêm vào giỏ thử</button>
      </div>
      {feedback && <p id="purchase-feedback" role={feedback.error ? 'alert' : 'status'} className={`mt-3 text-sm leading-6 ${feedback.error ? 'text-danger' : 'text-brand'}`}>{feedback.text}</p>}
    </form>
    <div className="mt-3 flex flex-wrap items-center gap-4"><CompareChoice sku={item.variant.sku} /><Link to="/gio-hang/" className="inline-flex min-h-12 items-center text-sm font-semibold text-brand underline underline-offset-4">Xem giỏ thử nghiệm</Link></div>
    <Link to={`/bao-gia/?sku=${encodeURIComponent(item.variant.sku)}`} className="secondary-button mt-3">Chuẩn bị yêu cầu báo giá</Link>
    <p className="mt-2 text-xs leading-6 text-muted">Form báo giá chỉ giúp rà soát nhu cầu, chưa gửi yêu cầu. Thêm giỏ không giữ hàng hoặc tạo đơn.</p>
  </div>;
}

export function ProductDetail() {
  const { slug } = useParams();
  const [params, setParams] = usePreviewSearch();
  const product = demoProducts.find((entry) => entry.slug === slug && entry.published);
  if (!product) return <><h1 className="mb-4 text-3xl font-semibold">Không tìm thấy sản phẩm</h1><CatalogFeedback status="error" message="Sản phẩm không có trong danh mục công khai." /><Link to="/san-pham/" className="secondary-button mt-4">Về danh sách sản phẩm</Link></>;
  const variants = product.variants.filter((entry) => entry.published);
  const skuValues = params.getAll('sku');
  const supplied = skuValues[0];
  const variant = skuValues.length > 1 ? undefined : supplied !== undefined ? variants.find((entry) => entry.sku === supplied) : variants.length === 1 ? variants[0] : undefined;
  const invalid = skuValues.length > 1 || (supplied !== undefined && !variants.some((entry) => entry.sku === supplied));
  const category = catalogCategories.find((entry) => entry.slug === product.category);
  const definitions = specDefinitions[product.family];
  const groups = [...new Set(definitions.map((entry) => entry.group))];
  const related = demoProducts.filter((entry) => product.related.includes(entry.slug) && entry.published);
  return <>
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap gap-2 text-sm text-muted"><Link to="/san-pham/" className="underline">Sản phẩm</Link><span aria-hidden="true">/</span><Link to={`/danh-muc/${product.category}/`} className="underline">{category?.label}</Link><span aria-hidden="true">/</span><span>{product.name}</span></nav>
    <DemoNotice />
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <ProductGallery key={product.slug} images={product.images} icon={categoryIconId(product.category)} />
      <section aria-labelledby="product-title">
        <p className="text-sm text-muted">{product.brand} · Thiết bị DEMO</p><h1 id="product-title" className="mt-2 text-3xl leading-tight font-semibold">{product.name}</h1>
        <p className="mt-3 text-sm leading-7 text-muted">Model: {product.model}<br />SKU: {variant?.sku ?? 'Chưa chọn biến thể hợp lệ'}</p>
        <p className="mt-4 text-sm leading-7 text-muted">{product.description}</p>
        <label htmlFor="product-variant" className="mt-5 mb-2 block text-sm font-semibold">Biến thể</label>
        <select id="product-variant" className="field-input" value={variant?.sku ?? ''} aria-invalid={invalid || undefined} aria-describedby="variant-help" onChange={(event) => { const next = new URLSearchParams(params); next.delete('sku'); if (event.target.value) next.set('sku', event.target.value); setParams(next); }}>
          <option value="" disabled={variants.length === 1}>Chọn biến thể</option>{variants.map((entry) => <option key={entry.sku} value={entry.sku}>{entry.label} · {entry.sku}</option>)}
        </select>
        <p id="variant-help" role={invalid ? 'alert' : undefined} className={`mt-2 text-sm ${invalid ? 'text-danger' : 'text-muted'}`}>{invalid ? 'SKU trong URL không hợp lệ hoặc không thuộc sản phẩm. Chọn lại biến thể; chưa có SKU nào được dùng để mua.' : 'Giá, thông số và bảo hành thay đổi theo SKU được chọn.'}</p>
        {variant ? <PurchasePanel key={variant.sku} item={{ product, variant }} /> : <p className="mt-5 rounded-lg bg-brand-soft p-4 text-sm text-brand">Chọn biến thể để xem giá kiểm thử, thông số và thao tác giỏ hàng.</p>}
      </section>
    </div>
    <nav aria-label="Nội dung sản phẩm" className="my-8 flex flex-wrap gap-3 border-y border-line py-3"><a className="secondary-button" href="#thong-so">Thông số</a><a className="secondary-button" href="#bao-hanh">Bảo hành</a><a className="secondary-button" href="#tai-lieu">Tài liệu</a></nav>
    <section aria-labelledby="thong-so"><h2 id="thong-so" tabIndex={-1} className="home-heading">Thông số theo SKU</h2>
      {variant ? <div className="mt-5 grid gap-6 md:grid-cols-2">{groups.map((group) => <section key={group} className="rounded-xl border border-line bg-surface p-5"><h3 className="mb-4 font-semibold">{group}</h3><dl className="divide-y divide-line">{definitions.filter((entry) => entry.group === group).map((entry) => <div key={entry.key} className="grid grid-cols-2 gap-4 py-3 text-sm leading-6"><dt className="text-muted">{entry.label}</dt><dd className="break-words font-medium">{specText(variant.specs[entry.key], entry)}</dd></div>)}</dl></section>)}</div> : <p className="mt-4 text-muted">Chọn biến thể để xem đúng thông số.</p>}
    </section>
    <div className="mt-10 grid gap-8 md:grid-cols-2">
      <section aria-labelledby="bao-hanh"><h2 id="bao-hanh" tabIndex={-1} className="home-heading">Bảo hành mẫu</h2><p className="mt-4 font-semibold">{variant?.warrantyMonths != null ? `${variant.warrantyMonths} tháng (giả định)` : 'Chưa có thông tin bảo hành cho SKU được chọn.'}</p><p className="mt-3 text-sm leading-7 text-muted">Chỉ mô phỏng hiển thị theo SKU; không phải chính sách có hiệu lực. Đơn vị tiếp nhận, phạm vi và điều kiện thực tế đang chờ doanh nghiệp cung cấp.</p></section>
      <section aria-labelledby="tai-lieu"><h2 id="tai-lieu" tabIndex={-1} className="home-heading">Tài liệu</h2>{product.documents.length ? <ul className="mt-3">{product.documents.map((doc) => <li key={doc.href}><a href={doc.href} download className="inline-flex min-h-12 items-center text-sm font-semibold text-brand underline underline-offset-4">{doc.title}</a></li>)}</ul> : <p className="mt-4 text-sm text-muted">Chưa có tài liệu kỹ thuật được duyệt.</p>}<p className="mt-2 text-xs leading-6 text-muted">Không suy thông số hoặc khả năng tương thích từ hình minh họa.</p></section>
    </div>
    {related.length > 0 && <section aria-labelledby="related-title" className="mt-10"><h2 id="related-title" className="home-heading">Xem thêm mẫu cùng nhóm</h2><p className="mt-2 text-sm text-muted">Danh sách liên quan được khai báo trong bộ DEMO, không phải xác nhận tương thích.</p><ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{related.map((entry) => <li key={entry.slug}><Link to={`/san-pham/${entry.slug}/`} className="flex min-h-16 items-center rounded-xl border border-line bg-surface p-4 font-medium text-brand hover:underline">{entry.name}</Link></li>)}</ul></section>}
  </>;
}
