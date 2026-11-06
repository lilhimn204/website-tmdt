import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { catalogItems, findItem } from './catalog-data';
import { emptyQuote, validateQuote, type FieldErrors, type QuoteDraft, type QuoteLine } from './request-model';
import { DraftNotice, PolicyReferences, RequestErrors, RequestField, RequestSection } from './request-fields';
import { usePreviewSearch } from './use-preview-search';

function QuoteForm({ initialSkus }: { initialSkus: readonly string[] }) {
  const [draft, setDraft] = useState<QuoteDraft>(emptyQuote);
  const [lines, setLines] = useState<QuoteLine[]>(() => initialSkus.slice(0, 30).map((sku, id) => ({ id, sku, quantity: '1' })));
  const nextId = useRef(30);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [reviewed, setReviewed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<number | null>(null);
  useEffect(() => { if (reviewed) heading.current?.focus(); }, [reviewed]);
  useEffect(() => { if (pendingFocus.current !== null) { document.getElementById(`quote-sku-${pendingFocus.current}`)?.focus(); pendingFocus.current = null; } }, [lines]);
  function update(key: keyof QuoteDraft, value: string) { setDraft((previous) => ({ ...previous, [key]: value })); setReviewed(false); }
  function editLine(id: number, key: 'sku' | 'quantity', value: string) { setLines((previous) => previous.map((line) => line.id === id ? { ...line, [key]: value } : line)); setReviewed(false); }
  function review(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const next = validateQuote(draft, lines); setErrors(next); setReviewed(!Object.keys(next).length); }
  const field = (key: keyof QuoteDraft) => ({ id: `quote-${key}`, value: draft[key], onChange: (value: string) => update(key, value), error: errors[key] });
  return <form onSubmit={review} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <div className="min-w-0 space-y-6">
      <RequestErrors errors={errors} prefix="quote" />
      {initialSkus.length > 30 && <p role="status" className="text-sm text-danger">Liên kết có quá 30 SKU; chỉ nạp 30 dòng đầu vào bản nháp. Kiểm tra và mô tả các mục còn lại trong nhu cầu.</p>}
      <RequestSection title="1. Người liên hệ">
        <RequestField {...field('name')} label="Tên người liên hệ" required maxLength={100} autoComplete="name" />
        <p className="text-sm leading-6 text-muted">Cần ít nhất một kênh: điện thoại hoặc email. Không yêu cầu tài khoản hay mã số thuế.</p>
        <div className="grid gap-5 sm:grid-cols-2"><RequestField {...field('phone')} label="Điện thoại liên hệ" type="tel" autoComplete="tel" maxLength={30} /><RequestField {...field('email')} label="Email liên hệ" type="email" autoComplete="email" maxLength={254} /></div>
        <RequestField {...field('company')} label="Công ty (không bắt buộc)" autoComplete="organization" maxLength={200} />
      </RequestSection>
      <RequestSection title="2. Thiết bị và nhu cầu">
        <p className="text-sm leading-7 text-muted">Có thể chọn SKU hoặc mô tả bài toán khi chưa biết model. Số lượng hỏi báo giá có thể lớn hơn lượng hàng DEMO; yêu cầu không giữ hàng.</p>
        <div id="quote-lines" tabIndex={-1} className="space-y-4">
          {!lines.length && <p className="text-sm text-muted">Chưa chọn SKU. Hãy mô tả nhu cầu bên dưới.</p>}
          {lines.map((line, index) => <fieldset key={line.id} className="min-w-0 rounded-lg border border-line p-4"><legend className="px-1 text-sm font-semibold">Thiết bị {index + 1}</legend>
            <label htmlFor={`quote-sku-${line.id}`} className="mb-2 block text-sm font-semibold">SKU thiết bị {index + 1}</label>
            <select id={`quote-sku-${line.id}`} className="field-input" value={line.sku} onChange={(event) => editLine(line.id, 'sku', event.target.value)} aria-invalid={!!errors[`sku-${line.id}`] || undefined} aria-describedby={errors[`sku-${line.id}`] ? `quote-sku-${line.id}-error` : undefined}>
              <option value="">Chọn SKU DEMO</option>{line.sku && !findItem(line.sku) && <option value={line.sku}>SKU không xác định: {line.sku.slice(0, 80)}</option>}{catalogItems().map((item) => <option key={item.variant.sku} value={item.variant.sku}>{item.variant.sku} · {item.product.name}</option>)}
            </select>
            {errors[`sku-${line.id}`] && <p id={`quote-sku-${line.id}-error`} className="mt-2 text-sm leading-6 text-danger">{errors[`sku-${line.id}`]}</p>}
            {findItem(line.sku)?.variant.lifecycle === 'eol' && <p className="mt-2 text-sm text-muted">Mẫu EOL: chỉ hỏi thông tin hoặc giải pháp thay thế, chưa xác nhận có thể cung cấp.</p>}
            <div className="mt-4 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><RequestField id={`quote-quantity-${line.id}`} label={`Số lượng thiết bị ${index + 1}`} value={line.quantity} onChange={(value) => editLine(line.id, 'quantity', value)} error={errors[`quantity-${line.id}`]} required maxLength={6} inputMode="numeric" /><button type="button" className="secondary-button" aria-label={`Xóa thiết bị ${index + 1}`} onClick={() => { setLines((previous) => previous.filter((entry) => entry.id !== line.id)); setErrors({}); setReviewed(false); addButton.current?.focus(); }}>Xóa dòng</button></div>
          </fieldset>)}
        </div>
        <button ref={addButton} type="button" disabled={lines.length >= 30} className="secondary-button" onClick={() => { const id = nextId.current++; pendingFocus.current = id; setLines((previous) => [...previous, { id, sku: '', quantity: '1' }]); setReviewed(false); }}>Thêm thiết bị</button>
        <RequestField {...field('needs')} label="Mô tả nhu cầu" multiline maxLength={2000} hint="Bắt buộc khi chưa chọn SKU. Có thể ghi model cần tìm, cấu hình, số lượng và môi trường sử dụng." />
        <RequestField {...field('destination')} label="Nơi giao hoặc triển khai (không bắt buộc)" maxLength={500} />
        <RequestField {...field('timing')} label="Thời điểm cần (không bắt buộc)" maxLength={200} />
      </RequestSection>
      <PolicyReferences />
      <button type="submit" className="primary-button">Rà soát yêu cầu</button>
      {reviewed && <section aria-labelledby="quote-review" className="space-y-4 rounded-xl border border-brand bg-surface p-5"><h2 ref={heading} tabIndex={-1} id="quote-review" className="text-xl font-semibold">Bản nháp yêu cầu — chưa gửi</h2>
        <dl className="space-y-3 text-sm leading-7 break-words"><div><dt className="text-muted">Liên hệ</dt><dd>{draft.name.trim()} · {[draft.phone.trim(), draft.email.trim()].filter(Boolean).join(' · ')}</dd></div>{draft.company.trim() && <div><dt className="text-muted">Công ty</dt><dd>{draft.company.trim()}</dd></div>}<div><dt className="text-muted">Nhu cầu</dt><dd className="whitespace-pre-wrap">{draft.needs.trim() || 'Theo danh sách SKU bên dưới.'}</dd></div>{draft.destination.trim() && <div><dt className="text-muted">Nơi triển khai</dt><dd>{draft.destination.trim()}</dd></div>}{draft.timing.trim() && <div><dt className="text-muted">Thời điểm cần</dt><dd>{draft.timing.trim()}</dd></div>}</dl>
        {lines.length > 0 && <ul className="divide-y divide-line text-sm">{lines.map((line) => <li key={line.id} className="py-3">{line.sku} · Số lượng: {Number(line.quantity).toLocaleString('vi-VN')}</li>)}</ul>}
        <p id="quote-unavailable" role="status" className="text-sm leading-7 text-muted">Kênh tiếp nhận chưa mở. Nội dung này chưa được gửi hoặc lưu; chưa có mã yêu cầu, báo giá hay cam kết thời gian phản hồi.</p>
        <button type="button" disabled aria-describedby="quote-unavailable" className="primary-button w-full">Gửi yêu cầu chưa khả dụng</button><button type="button" className="secondary-button" onClick={() => { setReviewed(false); document.getElementById('quote-name')?.focus(); }}>Sửa yêu cầu</button>
      </section>}
    </div>
    <aside className="rounded-xl border border-line bg-surface p-5"><h2 className="text-xl font-semibold">Từ nhu cầu đến báo giá</h2><ol className="mt-4 list-inside list-decimal space-y-4 text-sm leading-7"><li>Chuẩn bị model hoặc bài toán cần giải quyết.</li><li>Trao đổi cấu hình, số lượng và điều kiện cung cấp khi kênh tiếp nhận mở.</li><li>Nhận báo giá được xác nhận trước khi quyết định đặt hàng.</li></ol><p className="mt-5 text-sm leading-7 text-muted">Yêu cầu báo giá không phải đơn hàng, không giữ kho và không có giá cuối ở bước này.</p><Link to="/lien-he/" className="secondary-button mt-5">Thông tin liên hệ</Link></aside>
  </form>;
}
export function QuotePage() {
  const [params] = usePreviewSearch();
  const skus = params.getAll('sku');
  return <><h1 className="mb-4 text-3xl font-semibold">Yêu cầu báo giá</h1><p className="mb-5 max-w-3xl leading-7 text-muted">Chuẩn bị danh sách thiết bị hoặc mô tả nhu cầu của bạn. Yêu cầu báo giá không phải đơn hàng và không giữ hàng.</p><DraftNotice /><QuoteForm key={JSON.stringify(skus)} initialSkus={skus} /></>;
}
