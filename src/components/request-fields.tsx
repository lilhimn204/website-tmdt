import { useEffect, useRef, type HTMLInputTypeAttribute, type ReactNode } from 'react';
import { Link } from 'react-router';
import type { FieldErrors } from './request-model';

interface FieldProps {
  id: string; label: string; value: string; onChange: (value: string) => void;
  error?: string | undefined; hint?: string; required?: boolean; multiline?: boolean;
  type?: HTMLInputTypeAttribute; autoComplete?: string; maxLength?: number;
  inputMode?: 'text' | 'numeric' | 'email' | 'tel';
}
export function RequestField({ id, label, value, onChange, error, hint, required, multiline, type = 'text', autoComplete, maxLength, inputMode }: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const shared = { id, value, maxLength, autoComplete, inputMode, required, 'aria-invalid': !!error || undefined, 'aria-describedby': describedBy, className: 'field-input' };
  return <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}{required && <span aria-hidden="true"> *</span>}</label>
    {hint && <p id={`${id}-hint`} className="mb-2 text-xs leading-6 text-muted">{hint}</p>}
    {multiline ? <textarea {...shared} rows={3} onChange={(event) => onChange(event.target.value)} /> : <input {...shared} type={type} onChange={(event) => onChange(event.target.value)} />}
    {error && <p id={`${id}-error`} className="mt-2 text-sm leading-6 text-danger">{error}</p>}
  </div>;
}
export function RequestErrors({ errors, prefix }: { errors: FieldErrors; prefix: string }) {
  const summary = useRef<HTMLDivElement>(null);
  const count = Object.keys(errors).length;
  useEffect(() => { if (count) summary.current?.focus(); }, [errors, count]);
  if (!count) return null;
  return <div ref={summary} tabIndex={-1} role="alert" className="rounded-xl border border-danger bg-surface p-5">
    <h2 className="font-semibold text-danger">Cần kiểm tra {count} mục</h2>
    <ul className="mt-2 space-y-1 text-sm leading-6">{Object.entries(errors).map(([key, message]) => <li key={key}><a className="inline-flex min-h-11 items-center text-danger underline underline-offset-4" href={`#${prefix}-${key}`} onClick={(event) => { event.preventDefault(); document.getElementById(`${prefix}-${key}`)?.focus(); }}>{message}</a></li>)}</ul>
  </div>;
}
export function RequestSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-5 rounded-xl border border-line bg-surface p-5 sm:p-6"><h2 className="text-xl font-semibold">{title}</h2>{children}</section>;
}
export function DraftNotice() {
  return <p className="mb-6 rounded-xl border border-line bg-brand-soft p-4 text-sm leading-7 text-brand"><strong>Bản thử nghiệm, chưa tiếp nhận giao dịch.</strong> Có thể dùng thông tin mẫu để thử form. Nội dung chỉ ở trang đang mở, không gửi đi hoặc lưu trên thiết bị; rời hay tải lại trang sẽ xóa phần đã nhập.</p>;
}
export function PolicyReferences() {
  return <div className="text-sm leading-7"><p className="text-muted">Các chính sách đang chờ công bố. Liên kết mở tab mới để giữ nội dung đang nhập:</p><ul className="mt-2 flex flex-wrap gap-x-5">{[
    ['Điều kiện giao dịch', 'dieu-kien-giao-dich'], ['Bảo vệ thông tin', 'bao-mat'], ['Giao hàng', 'van-chuyen'], ['Thanh toán', 'thanh-toan'], ['Bảo hành', 'bao-hanh'],
  ].map(([label, slug]) => <li key={slug}><Link to={`/chinh-sach/${slug}/`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-brand underline">{label}<span className="sr-only"> (mở tab mới)</span></Link></li>)}</ul></div>;
}
