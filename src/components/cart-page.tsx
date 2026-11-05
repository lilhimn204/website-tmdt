import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { productHref } from './catalog-data';
import { evaluateCart, money, quantityIssue } from './catalog-model';
import { CatalogFeedback, DemoNotice } from './catalog-ui';
import { usePreview } from './preview-context';

function QuantityForm({ sku, quantity }: { sku: string; quantity: number }) {
  const store = usePreview();
  const [draft, setDraft] = useState(String(quantity));
  const [error, setError] = useState('');
  function update(value: number) {
    const issue = quantityIssue(value);
    if (issue) { setError(issue); return; }
    if (!store.update(sku, value)) setError(store.getNotice()); else setError('');
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); update(/^\d+$/.test(draft) ? Number(draft) : NaN); }
  return <form onSubmit={submit} noValidate className="mt-4">
    <label htmlFor={`qty-${sku}`} className="mb-2 block text-sm">Số lượng <span className="sr-only">{sku}</span></label>
    <div className="flex flex-wrap gap-2"><button type="button" className="secondary-button px-3" aria-label={`Giảm số lượng ${sku}`} disabled={quantity <= 1} onClick={() => update(quantity - 1)}>−</button>
      <input id={`qty-${sku}`} type="number" min="1" max="99" step="1" inputMode="numeric" value={draft} onChange={(event) => setDraft(event.target.value)} aria-invalid={!!error || undefined} aria-describedby={error ? `qty-error-${sku}` : undefined} className="field-input max-w-20" />
      <button type="button" className="secondary-button px-3" aria-label={`Tăng số lượng ${sku}`} disabled={quantity >= 99} onClick={() => update(quantity + 1)}>+</button>
      <button type="submit" className="secondary-button" aria-label={`Cập nhật ${sku}`}>Cập nhật</button>
    </div>
    {error && <p id={`qty-error-${sku}`} role="alert" className="mt-2 text-sm text-danger">{error}</p>}
  </form>;
}
export function CartPage() {
  const store = usePreview();
  const result = evaluateCart(store.cart);
  return <>
    <h1 className="mb-4 text-3xl font-semibold">Giỏ hàng thử nghiệm</h1><DemoNotice />
    {!store.ready ? <CatalogFeedback status="loading" message="Đang khôi phục giỏ trên trình duyệt…" /> : !store.cart.length ? <><CatalogFeedback status="empty" message="Giỏ hàng đang trống. Bạn có thể chọn một SKU DEMO để thử thao tác." /><Link to="/san-pham/" className="primary-button mt-5">Chọn sản phẩm mẫu</Link></> : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <ul className="space-y-4">{result.rows.map((row) => <li key={row.sku} className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div>{row.item ? <h2 className="text-lg font-semibold"><Link to={productHref(row.item)} className="text-brand hover:underline">{row.item.product.name}</Link></h2> : <h2 className="text-lg font-semibold">SKU không còn trong danh mục</h2>}<p className="mt-1 text-sm leading-6 break-all text-muted">{row.sku}{row.item ? ` · ${row.item.variant.label}` : ''}</p></div><button type="button" className="secondary-button" aria-label={`Xóa ${row.sku}`} onClick={() => store.remove(row.sku)}>Xóa</button></div>
        {row.issue && <p role="alert" className="mt-3 text-sm leading-6 text-danger">Cần xử lý: {row.issue}</p>}
        <QuantityForm key={`${row.sku}:${row.quantity}`} sku={row.sku} quantity={row.quantity} />
        <dl className="mt-4 flex flex-wrap justify-between gap-4 border-t border-line pt-4 text-sm"><div><dt className="text-muted">Đơn giá kiểm thử hiện tại</dt><dd className="mt-1 font-medium">{row.item?.variant.quoteOnly ? 'Yêu cầu báo giá' : row.item?.variant.price != null ? money(row.item.variant.price) : 'Chưa có giá'}</dd></div><div><dt className="text-muted">Thành tiền hợp lệ</dt><dd className="mt-1 font-semibold">{row.total === null ? 'Chưa thể tính' : money(row.total)}</dd></div></dl>
      </li>)}</ul>
      <aside aria-labelledby="cart-summary" className="self-start rounded-xl border border-line bg-surface p-6"><h2 id="cart-summary" className="text-xl font-semibold">Tạm tính minh họa</h2>
        <p className="mt-4 text-2xl font-semibold" role="status" aria-live="polite">{result.subtotal === null ? 'Chưa thể tính toàn bộ' : money(result.subtotal)}</p>
        <p className="mt-3 text-sm leading-7 text-muted">{store.cart.length} dòng SKU. Giá được đọc lại từ bộ DEMO hiện tại, không lấy từ bộ nhớ giỏ.</p>
        <p className="mt-3 text-sm leading-7 text-muted">Thuế và phí giao hàng thực chưa xác định. Đây không phải tổng tiền để thanh toán.</p>
        {result.subtotal === null && <p className="mt-3 text-sm text-danger">Sửa hoặc xóa các dòng cần xử lý trước khi tiếp tục thử.</p>}
        <button type="button" disabled className="primary-button mt-5 w-full" aria-describedby="checkout-not-ready">Đặt hàng chưa mở</button>
        <p id="checkout-not-ready" className="mt-3 text-xs leading-6 text-muted">Chưa kết nối API, không giữ hàng hoặc tạo đơn. Báo giá số lượng cũng chưa mở.</p>
        <Link to="/san-pham/" className="secondary-button mt-4 w-full">Tiếp tục chọn sản phẩm</Link>
      </aside>
    </div>}
  </>;
}
