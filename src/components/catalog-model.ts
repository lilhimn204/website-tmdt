import { catalogCategories, catalogItems, demoProducts, findItem, specDefinitions, type CatalogItem, type DemoProduct, type SpecDefinition, type SpecValue } from './catalog-data';

export const PAGE_SIZE = 6;
export const MAX_QUANTITY = 99;
export const money = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
export function specText(value: SpecValue | undefined, definition?: SpecDefinition): string {
  if (value == null || value === '') return 'Chưa xác minh';
  if (value === 'not-applicable') return 'Không áp dụng';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  return `${typeof value === 'number' ? value.toLocaleString('vi-VN') : value}${definition?.unit ? ` ${definition.unit}` : ''}`;
}
export function fold(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLocaleLowerCase('vi').trim().replace(/\s+/g, ' '); }
export function searchRank(item: CatalogItem, query: string): number {
  const code = query.trim().toUpperCase();
  if (!code) return 3;
  if ([item.variant.sku, item.product.model].some((value) => value.toUpperCase() === code)) return 0;
  if ([item.variant.sku, item.product.model].some((value) => value.toUpperCase().startsWith(code))) return 1;
  return fold(`${item.product.name} ${item.product.brand} ${item.variant.label}`).includes(fold(query)) ? 2 : -1;
}
export function inCategory(item: CatalogItem, slug: string) {
  return item.product.category === slug || catalogCategories.find((category) => category.slug === item.product.category)?.parent === slug;
}

export function selectCatalog(params: URLSearchParams, routeCategory?: string, source: readonly DemoProduct[] = demoProducts) {
  const errors: string[] = [];
  const all = catalogItems(source);
  const route = catalogCategories.find((category) => category.slug === routeCategory);
  if (routeCategory && !route) errors.push('Danh mục không tồn tại.');
  const chosen = params.get('danh-muc') || routeCategory || '';
  const category = catalogCategories.find((entry) => entry.slug === chosen);
  if (chosen && !category) errors.push('Bộ lọc danh mục không hợp lệ.');
  if (route && category && route.slug !== category.slug && category.parent !== route.slug) errors.push('Loại hàng được chọn không thuộc danh mục đang xem.');
  const definitions = category?.family ? specDefinitions[category.family] : [];
  const allowed = new Set(['q', 'danh-muc', 'thuong-hieu', 'sap-xep', 'trang']);
  for (const definition of definitions) {
    if (definition.filter === 'choice') allowed.add(definition.key);
    if (definition.filter === 'range') { allowed.add(`${definition.key}-tu`); allowed.add(`${definition.key}-den`); }
  }
  for (const key of new Set(params.keys())) if (!allowed.has(key)) errors.push(`Bộ lọc “${key.slice(0, 60)}” không áp dụng cho nhóm đang chọn.`);
  for (const key of ['q', 'danh-muc', 'sap-xep', 'trang']) if (params.getAll(key).length > 1) errors.push(`Tham số ${key} chỉ được có một giá trị.`);
  const query = params.get('q')?.trim() || '';
  if (query.length > 200) errors.push('Từ khóa dài tối đa 200 ký tự.');
  const sort = params.get('sap-xep') || 'mac-dinh';
  if (!['mac-dinh', 'ten', 'gia-tang', 'gia-giam'].includes(sort)) errors.push('Cách sắp xếp không hợp lệ.');
  const pageValue = params.get('trang') || '1';
  const page = /^\d+$/.test(pageValue) ? Number(pageValue) : NaN;
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) errors.push('Trang phải là số nguyên từ 1 đến 10000.');
  const brands = [...new Set(all.map((item) => item.product.brand))];
  const selectedBrands = [...new Set(params.getAll('thuong-hieu'))];
  if (selectedBrands.some((brand) => !brands.includes(brand))) errors.push('Thương hiệu lọc không có trong bộ dữ liệu mẫu.');
  let items = all.filter((item) => (!routeCategory || inCategory(item, routeCategory)) && (!chosen || inCategory(item, chosen)) && (!selectedBrands.length || selectedBrands.includes(item.product.brand)) && searchRank(item, query) >= 0);
  for (const definition of definitions) {
    if (definition.filter === 'choice') {
      const selected = [...new Set(params.getAll(definition.key))];
      const options = all.filter((item) => item.product.family === category?.family).map((item) => item.variant.specs[definition.key]).filter((value) => value != null).map(String);
      if (selected.some((value) => !options.includes(value))) errors.push(`Giá trị lọc ${definition.label} không hợp lệ.`);
      if (selected.length) items = items.filter((item) => item.variant.specs[definition.key] != null && selected.includes(String(item.variant.specs[definition.key])));
    }
    if (definition.filter === 'range') {
      const parse = (suffix: string) => {
        const values = params.getAll(`${definition.key}-${suffix}`);
        if (values.length > 1) errors.push(`${definition.label}: mỗi giới hạn chỉ nhận một giá trị.`);
        const raw = values[0];
        if (raw === undefined || raw === '') return null;
        const number = Number(raw);
        if (!/^\d+(\.\d+)?$/.test(raw) || !Number.isFinite(number) || number > Number.MAX_SAFE_INTEGER) { errors.push(`${definition.label}: nhập số không âm hợp lệ.`); return null; }
        return number;
      };
      const min = parse('tu'); const max = parse('den');
      if (min !== null && max !== null && min > max) errors.push(`${definition.label}: giá trị từ không được lớn hơn giá trị đến.`);
      if (min !== null || max !== null) items = items.filter((item) => {
        const value = item.variant.specs[definition.key];
        return typeof value === 'number' && (min === null || value >= min) && (max === null || value <= max);
      });
    }
  }
  items.sort((a, b) => {
    if (sort === 'gia-tang' || sort === 'gia-giam') {
      const ap = a.variant.quoteOnly ? null : a.variant.price;
      const bp = b.variant.quoteOnly ? null : b.variant.price;
      if (ap === null && bp !== null) return 1;
      if (ap !== null && bp === null) return -1;
      if (ap !== null && bp !== null && ap !== bp) return sort === 'gia-tang' ? ap - bp : bp - ap;
    } else if (sort === 'ten') {
      const delta = a.product.name.localeCompare(b.product.name, 'vi'); if (delta) return delta;
    } else {
      const delta = searchRank(a, query) - searchRank(b, query); if (delta) return delta;
    }
    return a.variant.sku.localeCompare(b.variant.sku, 'vi');
  });
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  if (Number.isSafeInteger(page) && page > pages && page <= 10000) errors.push('Trang yêu cầu vượt quá số kết quả. Hãy về trang 1.');
  return { items: errors.length ? [] : items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: items.length, page, pages, errors, category, definitions, brands, query, sort };
}

export function paramsFromForm(form: HTMLFormElement): URLSearchParams {
  const params = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (typeof value === 'string' && value.trim() && value !== 'mac-dinh' && !params.getAll(key).includes(value.trim())) params.append(key, value.trim());
  });
  params.delete('trang'); params.sort(); return params;
}
export function saleIssue(item: CatalogItem | undefined): string | null {
  if (!item || !item.product.published || !item.variant.published) return 'SKU không còn trong danh mục công khai.';
  const sku = item.variant;
  if (sku.lifecycle === 'eol') return 'EOL: mẫu này đã ngừng sản xuất, không thể thêm giỏ.';
  if (sku.quoteOnly) return 'Mẫu cần báo giá, không hỗ trợ thêm giỏ.';
  if (sku.price === null || !Number.isSafeInteger(sku.price) || sku.price < 0) return 'Chưa có giá hợp lệ.';
  if (sku.stock === null || !Number.isSafeInteger(sku.stock) || sku.stock < 0) return 'Chưa xác minh số lượng.';
  if (sku.stock === 0) return 'Mẫu hết hàng trong bộ dữ liệu kiểm thử.';
  if (sku.warrantyMonths === null) return 'Chưa có thông tin bảo hành.';
  return null;
}
export interface CartLine { sku: string; quantity: number }
export function quantityIssue(value: number): string | null { return Number.isSafeInteger(value) && value >= 1 && value <= MAX_QUANTITY ? null : `Số lượng phải là số nguyên từ 1 đến ${MAX_QUANTITY}.`; }
export function evaluateCart(lines: readonly CartLine[], lookup: (sku: string) => CatalogItem | undefined = findItem) {
  const rows = lines.map((line) => {
    const item = lookup(line.sku);
    let issue = quantityIssue(line.quantity) ?? saleIssue(item);
    if (!issue && item && line.quantity > (item.variant.stock ?? 0)) issue = `Chỉ có ${item.variant.stock} trong dữ liệu kiểm thử; hãy giảm số lượng.`;
    const total = item?.variant.price != null ? item.variant.price * line.quantity : null;
    if (total !== null && !Number.isSafeInteger(total)) issue = 'Thành tiền vượt giới hạn an toàn.';
    return { ...line, item, issue, total: issue ? null : total };
  });
  const sum = rows.reduce((total, row) => total + (row.total ?? 0), 0);
  return { rows, subtotal: rows.some((row) => row.issue) || !Number.isSafeInteger(sum) ? null : sum };
}
export function restoreCart(raw: string | null): { lines: CartLine[]; warning: string } {
  if (raw === null) return { lines: [], warning: '' };
  try {
    const payload: unknown = JSON.parse(raw);
    if (!payload || typeof payload !== 'object' || !('version' in payload) || payload.version !== 1 || !('lines' in payload) || !Array.isArray(payload.lines)) throw new Error('Invalid cart');
    const lines: CartLine[] = []; let invalid = payload.lines.length > 30;
    for (const entry of payload.lines.slice(0, 30) as unknown[]) {
      if (!entry || typeof entry !== 'object' || !('sku' in entry) || typeof entry.sku !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(entry.sku) || !('quantity' in entry) || typeof entry.quantity !== 'number' || quantityIssue(entry.quantity)) { invalid = true; continue; }
      const old = lines.find((line) => line.sku === entry.sku);
      if (old) { invalid = true; continue; }
      lines.push({ sku: entry.sku, quantity: entry.quantity });
    }
    return { lines, warning: invalid ? 'Bản lưu có dữ liệu không hợp lệ; chỉ các dòng hợp lệ được khôi phục. Vui lòng kiểm tra giỏ.' : '' };
  } catch { return { lines: [], warning: 'Không đọc được giỏ đã lưu. Bạn có thể tạo giỏ thử nghiệm mới.' }; }
}
export function resolveComparison(skus: readonly string[]) {
  const items = skus.map((sku) => findItem(sku)); const errors: string[] = [];
  if (skus.length > 3) errors.push('Chỉ so sánh tối đa 3 SKU. Hãy bỏ bớt lựa chọn.');
  if (new Set(skus).size !== skus.length) errors.push('Danh sách có SKU bị lặp. Hãy bỏ lựa chọn trùng.');
  if (items.some((item) => !item)) errors.push('Có SKU không còn công khai hoặc không tồn tại; hãy bỏ mục không hợp lệ.');
  const valid = items.filter((item): item is CatalogItem => !!item);
  if (new Set(valid.map((item) => item.product.family)).size > 1) errors.push('Chỉ so sánh SKU cùng loại thiết bị. Các lựa chọn hiện tại được giữ để bạn chỉnh lại.');
  return { items: valid, errors };
}
export function comparisonState(values: readonly (SpecValue | undefined)[]) {
  const known = values.filter((value) => value != null && value !== '');
  return { incomplete: known.length !== values.length, different: new Set(known.map((value) => `${typeof value}:${String(value)}`)).size > 1 };
}
export function comparisonHref(skus: readonly string[]) { const params = new URLSearchParams(); skus.forEach((sku) => params.append('sku', sku)); return `/so-sanh/${params.size ? `?${params}` : ''}`; }
