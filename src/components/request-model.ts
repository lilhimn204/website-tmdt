import { findItem } from './catalog-data';

export type FieldErrors = Record<string, string>;
export interface CheckoutDraft {
  name: string; phone: string; email: string; address: string; notes: string;
  payment: string; invoice: boolean; invoiceDetails: string;
}
export const emptyCheckout: CheckoutDraft = { name: '', phone: '', email: '', address: '', notes: '', payment: '', invoice: false, invoiceDetails: '' };
export interface QuoteLine { id: number; sku: string; quantity: string }
export interface QuoteDraft { name: string; phone: string; email: string; company: string; needs: string; destination: string; timing: string }
export const emptyQuote: QuoteDraft = { name: '', phone: '', email: '', company: '', needs: '', destination: '', timing: '' };

const validPhone = (value: string) => /^\+?\d{8,15}$/.test(value.replace(/[\s().-]/g, ''));
const validEmail = (value: string) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
function contactErrors(draft: { name: string; phone: string; email: string }, phoneRequired: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.name.trim() || draft.name.trim().length > 100) errors.name = 'Nhập tên người liên hệ, tối đa 100 ký tự.';
  if (phoneRequired && !draft.phone.trim()) errors.phone = 'Nhập số điện thoại để liên hệ giao hàng.';
  if (!phoneRequired && !draft.phone.trim() && !draft.email.trim()) errors.phone = 'Nhập ít nhất một kênh liên hệ: điện thoại hoặc email.';
  if (draft.phone.trim() && !validPhone(draft.phone.trim())) errors.phone = 'Kiểm tra số điện thoại: 8–15 chữ số, có thể có dấu + ở đầu.';
  if (draft.email.trim() && !validEmail(draft.email.trim())) errors.email = 'Nhập email đúng định dạng, ví dụ ten@example.com.';
  return errors;
}
export function validateCheckout(draft: CheckoutDraft): FieldErrors {
  const errors = contactErrors(draft, true);
  if (!draft.address.trim() || draft.address.length > 500) errors.address = 'Nhập địa chỉ giao hàng đầy đủ, tối đa 500 ký tự.';
  if (!['cod', 'bank-transfer'].includes(draft.payment)) errors.payment = 'Chọn phương thức để xem bước rà soát thử nghiệm.';
  if (draft.notes.length > 1000) errors.notes = 'Ghi chú tối đa 1.000 ký tự.';
  if (draft.invoice && draft.invoiceDetails.length > 500) errors.invoiceDetails = 'Thông tin hóa đơn tối đa 500 ký tự.';
  return errors;
}
export function validateQuote(draft: QuoteDraft, lines: readonly QuoteLine[]): FieldErrors {
  const errors = contactErrors(draft, false);
  if (!lines.length && !draft.needs.trim()) errors.needs = 'Mô tả nhu cầu hoặc thêm ít nhất một SKU để hỏi báo giá.';
  if (draft.needs.length > 2000) errors.needs = 'Nội dung nhu cầu tối đa 2.000 ký tự.';
  if (draft.company.length > 200) errors.company = 'Tên công ty tối đa 200 ký tự.';
  if (draft.destination.length > 500) errors.destination = 'Nơi giao tối đa 500 ký tự.';
  if (draft.timing.length > 200) errors.timing = 'Thời điểm cần tối đa 200 ký tự.';
  if (lines.length > 30) errors.lines = 'Bản thử hỗ trợ tối đa 30 dòng SKU.';
  const seen = new Set<string>();
  for (const line of lines) {
    if (!findItem(line.sku)) errors[`sku-${line.id}`] = 'Chọn SKU có trong danh mục DEMO, hoặc xóa dòng và mô tả model trong nhu cầu.';
    else if (seen.has(line.sku)) errors[`sku-${line.id}`] = 'SKU này đã có trong yêu cầu. Gộp số lượng vào một dòng.';
    seen.add(line.sku);
    const quantity = Number(line.quantity);
    if (!/^\d+$/.test(line.quantity) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 999999) errors[`quantity-${line.id}`] = 'Nhập số lượng nguyên từ 1 đến 999.999 trong bản thử.';
  }
  return errors;
}
