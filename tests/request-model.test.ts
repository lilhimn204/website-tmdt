import { describe, expect, it } from 'vitest';
import { emptyCheckout, emptyQuote, validateCheckout, validateQuote } from '../src/components/request-model';

describe('07.7 — checkout draft validation', () => {
  it('requires contact, address and a recognized payment choice', () => {
    expect(Object.keys(validateCheckout(emptyCheckout))).toEqual(['name', 'phone', 'address', 'payment']);
    expect(validateCheckout({ ...emptyCheckout, payment: 'crypto' }).payment).toBeTruthy();
  });
  it('accepts optional email and free-form address without inventing administrative divisions', () => {
    expect(validateCheckout({ ...emptyCheckout, name: ' Người thử ', phone: '+84 (900) 000-000', address: 'Địa chỉ thử nghiệm', payment: 'cod' })).toEqual({});
  });
  it('rejects invalid supplied contact data and excessive text while leaving inactive invoice fields alone', () => {
    const errors = validateCheckout({ ...emptyCheckout, name: '  ', phone: '123', email: 'invalid', notes: 'x'.repeat(1001), invoice: true, invoiceDetails: 'x'.repeat(501) });
    expect(Object.keys(errors)).toEqual(['name', 'phone', 'email', 'address', 'payment', 'notes', 'invoiceDetails']);
    expect(validateCheckout({ ...emptyCheckout, invoiceDetails: 'x'.repeat(501) }).invoiceDetails).toBeUndefined();
  });
});
describe('07.8 — quote draft validation', () => {
  it('accepts a described need without SKU, company, phone or tax id when email is supplied', () => {
    expect(validateQuote({ ...emptyQuote, name: 'Người thử', email: 'tester@example.com', needs: 'Cần tư vấn UPS cho văn phòng' }, [])).toEqual({});
  });
  it('accepts only a valid SKU list and contact, including bulk quantities above demo stock', () => {
    expect(validateQuote({ ...emptyQuote, name: 'Người thử', phone: '0900000000' }, [{ id: 0, sku: 'DEMO-U1000-T', quantity: '500' }])).toEqual({});
  });
  it('requires a need or SKU and at least one valid channel, validating supplied optional values too', () => {
    expect(Object.keys(validateQuote(emptyQuote, []))).toEqual(['name', 'phone', 'needs']);
    expect(validateQuote({ ...emptyQuote, phone: 'wrong', email: 'ok@example.com' }, []).phone).toBeTruthy();
  });
  it('rejects unknown/duplicate SKUs, zero, fractional or excessive quantities', () => {
    const errors = validateQuote(emptyQuote, [{ id: 1, sku: 'DEMO-U1000-T', quantity: '0' }, { id: 2, sku: 'DEMO-U1000-T', quantity: '1.5' }, { id: 3, sku: 'UNKNOWN', quantity: '1000000' }]);
    for (const key of ['quantity-1', 'sku-2', 'quantity-2', 'sku-3', 'quantity-3']) expect(errors[key]).toBeTruthy();
  });
  it('allows asking about EOL without claiming stock or price and limits line count', () => {
    const draft = { ...emptyQuote, name: 'Người thử', email: 'tester@example.com' };
    expect(validateQuote(draft, [{ id: 0, sku: 'DEMO-UOLD-T', quantity: '1' }])).toEqual({});
    expect(validateQuote(draft, Array.from({ length: 31 }, (_, id) => ({ id, sku: 'DEMO-UOLD-T', quantity: '1' }))).lines).toBeTruthy();
  });
});
