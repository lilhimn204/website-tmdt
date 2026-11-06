import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { evaluateCart, money } from './catalog-model';
import { usePreview } from './preview-context';
import { CatalogFeedback } from './catalog-ui';
import { emptyCheckout, validateCheckout, type CheckoutDraft, type FieldErrors } from './request-model';
import { DraftNotice, PolicyReferences, RequestErrors, RequestField, RequestSection } from './request-fields';

export function CheckoutPage() {
  const store = usePreview();
  const cart = evaluateCart(store.cart);
  const [draft, setDraft] = useState<CheckoutDraft>(emptyCheckout);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [reviewedCart, setReviewedCart] = useState<string | null>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const cartSignature = JSON.stringify(cart.rows.map((row) => [row.sku, row.quantity, row.item?.variant.price, row.issue]));
  const reviewed = reviewedCart === cartSignature;
  useEffect(() => { if (reviewed) reviewHeading.current?.focus(); }, [reviewed]);
  function update<K extends keyof CheckoutDraft>(key: K, value: CheckoutDraft[K]) { setDraft((previous) => ({ ...previous, [key]: value })); setReviewedCart(null); }
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validateCheckout(draft); setErrors(next);
    if (!Object.keys(next).length && cart.subtotal !== null && store.cart.length) setReviewedCart(cartSignature);
  }
  const field = (key: 'name' | 'phone' | 'email' | 'address' | 'notes' | 'invoiceDetails') => ({ id: `checkout-${key}`, value: draft[key], onChange: (value: string) => update(key, value), error: errors[key] });
  return <>
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted"><Link to="/gio-hang/" className="underline">Giỏ hàng</Link><span aria-hidden="true"> / </span>Đặt hàng</nav>
    <h1 className="mb-4 text-3xl font-semibold">Đặt hàng</h1><DraftNotice />
    {!store.ready ? <CatalogFeedback status="loading" message="Đang kiểm tra giỏ trên trình duyệt…" /> : !store.cart.length ? <><CatalogFeedback status="empty" message="Chưa có sản phẩm trong giỏ để rà soát đặt hàng." /><Link to="/san-pham/" className="primary-button mt-5">Chọn sản phẩm mẫu</Link></> : cart.subtotal === null ? <><CatalogFeedback status="error" message="Giỏ có SKU hoặc số lượng cần xử lý. Hãy sửa giỏ trước khi nhập thông tin." /><Link to="/gio-hang/" className="primary-button mt-5">Kiểm tra lại giỏ</Link></> : <form noValidate onSubmit={review} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <RequestErrors prefix="checkout" errors={errors} />
        <RequestSection title="1. Thông tin liên hệ">
          <RequestField {...field('name')} label="Họ và tên" required autoComplete="name" maxLength={100} />
          <div className="grid gap-5 sm:grid-cols-2"><RequestField {...field('phone')} label="Điện thoại" required type="tel" autoComplete="tel" maxLength={30} /><RequestField {...field('email')} label="Email (không bắt buộc)" type="email" autoComplete="email" maxLength={254} /></div>
        </RequestSection>
        <RequestSection title="2. Địa chỉ và giao hàng">
          <RequestField {...field('address')} label="Địa chỉ giao hàng đầy đủ" required multiline autoComplete="street-address" maxLength={500} hint="Ghi số nhà, đường và địa phương hiện tại. Vùng phục vụ, phí và thời gian giao chưa được xác nhận." />
          <RequestField {...field('notes')} label="Ghi chú giao hàng (không bắt buộc)" multiline maxLength={1000} />
          <p className="text-sm leading-7 text-muted">Chưa xác định phí giao hàng. Không coi phí chưa biết là miễn phí; chưa thể xác nhận tổng thanh toán.</p>
        </RequestSection>
        <RequestSection title="3. Nhu cầu hóa đơn">
          <label className="flex min-h-12 items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-brand" checked={draft.invoice} onChange={(event) => update('invoice', event.target.checked)} />Tôi cần hóa đơn</label>
          {draft.invoice && <RequestField {...field('invoiceDetails')} label="Thông tin hóa đơn (không bắt buộc trong bản thử)" multiline maxLength={500} hint="Có thể ghi tên đơn vị, mã số thuế và địa chỉ. Quy tắc xuất hóa đơn đang chờ doanh nghiệp xác nhận." />}
        </RequestSection>
        <RequestSection title="4. Phương thức thanh toán">
          <fieldset id="checkout-payment" tabIndex={-1} aria-describedby="checkout-payment-help checkout-payment-error"><legend className="text-sm font-semibold">Chọn phương thức để thử rà soát *</legend>
            {[['cod', 'COD — thanh toán khi nhận hàng'], ['bank-transfer', 'Chuyển khoản thủ công']].map(([value, label]) => <label key={value} className="mt-3 flex min-h-12 items-center gap-3 rounded-lg border border-line p-3 text-sm"><input type="radio" name="checkout-payment" value={value} checked={draft.payment === value} onChange={() => update('payment', value!)} className="h-5 w-5 shrink-0 accent-brand" required aria-invalid={!!errors.payment || undefined} />{label}</label>)}
            <p id="checkout-payment-help" className="mt-3 text-sm leading-7 text-muted">Chỉ là lựa chọn thử. Điều kiện COD chưa được xác nhận; chưa có tài khoản ngân hàng hoặc hướng dẫn chuyển tiền được công bố.</p>
            <p id="checkout-payment-error" className="mt-2 text-sm text-danger">{errors.payment}</p>
          </fieldset>
        </RequestSection>
        <PolicyReferences />
        <button type="submit" className="primary-button">Rà soát thông tin</button>
        {reviewed && <section aria-labelledby="checkout-review" className="space-y-4 rounded-xl border border-brand bg-surface p-5 sm:p-6">
          <h2 ref={reviewHeading} id="checkout-review" tabIndex={-1} className="text-xl font-semibold">5. Rà soát bản nháp — chưa tạo đơn</h2>
          <dl className="space-y-3 text-sm leading-7 break-words"><div><dt className="text-muted">Người nhận</dt><dd>{draft.name.trim()} · {draft.phone.trim()}</dd></div>{draft.email.trim() && <div><dt className="text-muted">Email</dt><dd>{draft.email.trim()}</dd></div>}<div><dt className="text-muted">Địa chỉ</dt><dd className="whitespace-pre-wrap">{draft.address.trim()}</dd></div><div><dt className="text-muted">Phương thức dự kiến</dt><dd>{draft.payment === 'cod' ? 'COD' : 'Chuyển khoản thủ công'}</dd></div>{draft.notes.trim() && <div><dt className="text-muted">Ghi chú</dt><dd>{draft.notes.trim()}</dd></div>}<div><dt className="text-muted">Hóa đơn</dt><dd>{draft.invoice ? draft.invoiceDetails.trim() || 'Có nhu cầu; chưa cung cấp chi tiết.' : 'Chưa yêu cầu.'}</dd></div></dl>
          <div className="border-y border-line py-4 text-sm leading-7"><h3 className="font-semibold">Rà soát sản phẩm và số tiền</h3><ul className="mt-2 space-y-2">{cart.rows.map((row) => <li key={row.sku}>{row.sku} × {row.quantity} · {money(row.total!)}</li>)}</ul><p className="mt-3 font-semibold">Tiền hàng DEMO: {money(cart.subtotal)}</p><p className="text-muted">Thuế và phí chưa xác định. Tổng tiền: chưa xác nhận.</p></div>
          <p id="checkout-unavailable" role="status" className="text-sm leading-7 text-muted">Hệ thống chưa tiếp nhận đơn. Giá, tồn, thuế, phí giao hàng và chính sách thực chưa được xác nhận; chưa gửi hoặc lưu thông tin này.</p>
          <button type="button" disabled aria-describedby="checkout-unavailable" className="primary-button w-full">Đặt hàng chưa khả dụng</button>
          <button type="button" className="secondary-button" onClick={() => { setReviewedCart(null); document.getElementById('checkout-name')?.focus(); }}>Sửa thông tin</button>
        </section>}
      </div>
      <aside aria-labelledby="checkout-summary" className="order-first rounded-xl border border-line bg-surface p-5 sm:p-6 lg:order-none"><h2 id="checkout-summary" className="text-xl font-semibold">Toàn bộ giỏ hàng DEMO</h2><p className="mt-2 text-sm leading-6 text-muted">Bao gồm các món đã chọn trước đó. Giỏ chưa giữ hàng.</p>
        <ul className="mt-4 divide-y divide-line">{cart.rows.map((row) => <li key={row.sku} className="py-4 text-sm leading-6"><p className="font-semibold">{row.item?.product.name}</p><p className="break-all text-muted">{row.sku} · Số lượng: {row.quantity}</p><p>{money(row.total!)}</p></li>)}</ul>
        <dl className="space-y-3 border-t border-line pt-4 text-sm"><div className="flex justify-between gap-4"><dt>Tạm tính kiểm thử</dt><dd className="font-semibold">{money(cart.subtotal)}</dd></div><div><dt className="text-muted">Thuế và phí giao hàng</dt><dd>Chưa xác định</dd></div><div><dt className="text-muted">Tổng thanh toán</dt><dd className="font-semibold">Chưa thể xác nhận</dd></div></dl>
        <Link to="/gio-hang/" className="secondary-button mt-5 w-full">Sửa giỏ hàng</Link><Link to="/bao-gia/" className="mt-3 inline-flex min-h-12 items-center text-sm font-semibold text-brand underline">Cần báo giá theo nhu cầu?</Link>
      </aside>
    </form>}
  </>;
}
