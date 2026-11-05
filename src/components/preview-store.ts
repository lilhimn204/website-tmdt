import { findItem } from './catalog-data';
import { quantityIssue, restoreCart, saleIssue, resolveComparison, type CartLine } from './catalog-model';

export const CART_STORAGE_KEY = 'website-tmdt.demo-cart.v1';
export interface PreviewSnapshot { cart: readonly CartLine[]; compare: readonly string[]; ready: boolean; notice: string; storageWarning: string }
type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>;

export function createPreviewStore() {
  const initial: PreviewSnapshot = { cart: [], compare: [], ready: false, notice: '', storageWarning: '' };
  let snapshot = initial;
  let storage: StorageAccess | undefined;
  const listeners = new Set<() => void>();
  function publish(patch: Partial<PreviewSnapshot>, saveCart = false) {
    snapshot = { ...snapshot, ...patch };
    if (saveCart && storage) {
      try { storage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, lines: snapshot.cart.map(({ sku, quantity }) => ({ sku, quantity })) })); }
      catch { snapshot = { ...snapshot, storageWarning: 'Không lưu được trên trình duyệt. Giỏ chỉ được giữ trong phiên đang mở.' }; }
    }
    listeners.forEach((listener) => listener());
  }
  function fail(notice: string) { publish({ notice }); return false; }
  function setQuantity(sku: string, quantity: number, add: boolean): boolean {
    if (!snapshot.ready) return fail('Đang khôi phục giỏ. Vui lòng thử lại sau.');
    const item = findItem(sku);
    const issue = quantityIssue(quantity) ?? saleIssue(item);
    if (issue) return fail(issue);
    const previous = snapshot.cart.find((line) => line.sku === sku);
    const next = quantity + (add ? previous?.quantity ?? 0 : 0);
    const nextIssue = quantityIssue(next);
    if (nextIssue) return fail(nextIssue);
    if (next > (item?.variant.stock ?? 0)) return fail(`Số lượng vượt mức ${item?.variant.stock} của dữ liệu kiểm thử.`);
    if (!previous && snapshot.cart.length >= 30) return fail('Giỏ thử nghiệm nhận tối đa 30 SKU.');
    const cart = previous ? snapshot.cart.map((line) => line.sku === sku ? { sku, quantity: next } : line) : [...snapshot.cart, { sku, quantity: next }];
    publish({ cart, notice: add ? `Đã thêm ${sku} vào giỏ thử nghiệm. Chưa tạo đơn hoặc giữ hàng.` : `Đã cập nhật số lượng ${sku}.` }, true);
    return true;
  }
  return {
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    getNotice: () => snapshot.notice,
    initialize(access?: StorageAccess) {
      if (snapshot.ready) return;
      storage = access;
      try {
        const restored = restoreCart(storage?.getItem(CART_STORAGE_KEY) ?? null);
        publish({ cart: restored.lines, ready: true, storageWarning: access ? restored.warning : 'Trình duyệt không cho lưu dữ liệu. Giỏ chỉ được giữ trong phiên đang mở.' });
      } catch { storage = undefined; publish({ ready: true, storageWarning: 'Không đọc được bộ nhớ trình duyệt. Giỏ chỉ được giữ trong phiên đang mở.' }); }
    },
    add: (sku: string, quantity = 1) => setQuantity(sku, quantity, true),
    update: (sku: string, quantity: number) => setQuantity(sku, quantity, false),
    remove(sku: string) { publish({ cart: snapshot.cart.filter((line) => line.sku !== sku), notice: `Đã xóa ${sku} khỏi giỏ thử nghiệm.` }, true); },
    toggleCompare(sku: string) {
      if (snapshot.compare.includes(sku)) { publish({ compare: snapshot.compare.filter((entry) => entry !== sku), notice: 'Đã bỏ một SKU khỏi so sánh.' }); return true; }
      const item = findItem(sku);
      if (!item) return fail('SKU không tồn tại hoặc không công khai.');
      if (snapshot.compare.length >= 3) return fail('Chỉ so sánh tối đa 3 SKU. Hãy bỏ một lựa chọn trước.');
      if (snapshot.compare.some((entry) => findItem(entry)?.product.family !== item.product.family)) return fail('Chỉ chọn SKU cùng loại để so sánh. Các lựa chọn cũ vẫn được giữ.');
      publish({ compare: [...snapshot.compare, sku], notice: `Đã chọn ${sku} để so sánh.` }); return true;
    },
    clearCompare() { publish({ compare: [], notice: 'Đã xóa danh sách so sánh.' }); },
    adoptCompare(skus: readonly string[]) {
      const result = resolveComparison(skus);
      if (result.errors.length) return fail(result.errors.join(' '));
      publish({ compare: [...skus] }); return true;
    },
  };
}
export type PreviewStore = ReturnType<typeof createPreviewStore>;
