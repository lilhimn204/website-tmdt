import { describe, expect, it } from 'vitest';
import { catalogItems, demoProducts, findItem } from '../src/components/catalog-data';
import { comparisonState, evaluateCart, restoreCart, resolveComparison, saleIssue, searchRank, selectCatalog, specText } from '../src/components/catalog-model';
import { CART_STORAGE_KEY, createPreviewStore } from '../src/components/preview-store';

function item(sku: string) { const result = findItem(sku); if (!result) throw new Error(sku); return result; }
const select = (query: string, category?: string) => selectCatalog(new URLSearchParams(query), category);

describe('07.3 — catalog queries', () => {
  it('searches Vietnamese names without accents and matches brands separately', () => {
    expect(select('q=may in laser').items[0]?.variant.sku).toBe('DEMO-P100');
    expect(select('q=NHAN MAU B').items.every((entry) => entry.product.brand === 'Nhãn mẫu B')).toBe(true);
  });
  it('ranks exact SKU/model before code prefix and preserves code separators', () => {
    expect(searchRank(item('DEMO-U1000-T'), '  demo-u1000-t ')).toBe(0);
    expect(searchRank(item('DEMO-U1000-T'), 'DEMO-U1000')).toBe(0);
    expect(searchRank(item('DEMO-U1000-T'), 'DEMO-U')).toBe(1);
    expect(searchRank(item('DEMO-U1000-T'), 'DEMOU1000T')).toBe(-1);
    expect(select('q=DEMO-U1000-T').items.map((entry) => entry.variant.sku)).toEqual(['DEMO-U1000-T']);
  });
  it('never includes unpublished products or variants, even for an exact code', () => {
    const source = demoProducts.map((entry) => entry.slug === 'ups-demo-1000' ? { ...entry, variants: entry.variants.map((variant) => ({ ...variant, published: false })) } : { ...entry, published: false });
    expect(catalogItems(source)).toEqual([]);
    expect(selectCatalog(new URLSearchParams('q=DEMO-U1000-T'), undefined, source).items).toEqual([]);
  });
  it('shows only common filters for a mixed parent and rejects foreign technical keys', () => {
    expect(select('', 'linh-kien-phu-kien').definitions).toEqual([]);
    expect(select('va-tu=1000', 'ssd').errors.join(' ')).toMatch(/không áp dụng/);
  });
  it('uses OR within a property, AND across properties, and excludes unknown numeric values', () => {
    const result = select('danh-muc=ram&dung-luong-gb=8&dung-luong-gb=16&ddr=DDR4');
    expect(result.items.map((entry) => entry.variant.sku)).toEqual(['DEMO-R4-16', 'DEMO-R4-8']);
    expect(select('cong-suat-w-tu=900&cong-suat-w-den=1350', 'ups-online-mot-pha').items.map((entry) => entry.variant.sku)).toEqual(['DEMO-U1000-R', 'DEMO-U1000-T', 'DEMO-U1500-T']);
  });
  it('reports invalid ranges, repeated scalar params, outside categories and invalid pages', () => {
    for (const query of ['cong-suat-w-tu=1000&cong-suat-w-den=500', 'cong-suat-w-tu=-1', 'cong-suat-w-tu=1e3', 'q=a&q=b', 'trang=1.5', 'trang=999', 'sap-xep=bad', 'danh-muc=ssd']) expect(select(query, 'ups-online-mot-pha').errors.length).toBeGreaterThan(0);
  });
  it('keeps missing and quote-only prices last in both price directions and paginates deterministically', () => {
    for (const sort of ['gia-tang', 'gia-giam']) {
      const result = select(`sap-xep=${sort}&danh-muc=may-in-vat-tu`);
      expect(result.items.at(-1)?.variant.price).toBeNull();
      const allPages = [1, 2, 3].flatMap((page) => select(`sap-xep=${sort}&trang=${page}`).items);
      expect(allPages.slice(-2).map((entry) => entry.variant.sku)).toEqual(['DEMO-COOL-01', 'DEMO-P200']);
    }
    const first = select(''); const second = select('trang=2');
    expect(first.items).toHaveLength(6);
    expect(second.items).toHaveLength(6);
    expect(first.items.some((entry) => second.items.some((next) => next.variant.sku === entry.variant.sku))).toBe(false);
  });
});

describe('07.4–07.5 — data meaning and compare', () => {
  it('distinguishes zero, false, not-applicable and unknown', () => {
    expect(specText(0)).toBe('0'); expect(specText(false)).toBe('Không'); expect(specText('not-applicable')).toBe('Không áp dụng'); expect(specText(null)).toBe('Chưa xác minh');
  });
  it('never classifies two missing values as a proven equality', () => {
    expect(comparisonState([null, null])).toEqual({ incomplete: true, different: false });
    expect(comparisonState([900, null])).toEqual({ incomplete: true, different: false });
    expect(comparisonState([900, 1350, null])).toEqual({ incomplete: true, different: true });
    expect(comparisonState([false, null])).toEqual({ incomplete: true, different: false });
    expect(comparisonState([false, true])).toEqual({ incomplete: false, different: true });
  });
  it('validates public SKU, family, duplicates and the maximum three columns', () => {
    expect(resolveComparison(['DEMO-U1000-T', 'DEMO-U1500-T']).errors).toEqual([]);
    for (const skus of [['DEMO-U1000-T', 'DEMO-R4-8'], ['NO-SUCH-SKU', 'DEMO-U1500-T'], ['DEMO-U1000-T', 'DEMO-U1000-T'], ['DEMO-U1000-T', 'DEMO-U1000-R', 'DEMO-U1500-T', 'DEMO-U2000-T']]) expect(resolveComparison(skus).errors.length).toBeGreaterThan(0);
  });
  it('blocks EOL, unknown price/stock/warranty, out-of-stock and quote-only variants', () => {
    for (const sku of ['DEMO-UOLD-T', 'DEMO-P200', 'DEMO-PSU-650', 'DEMO-CASE-01', 'DEMO-COOL-01', 'DEMO-NP8']) expect(saleIssue(item(sku))).not.toBeNull();
    expect(saleIssue(item('DEMO-U1000-T'))).toBeNull();
  });
});

describe('07.6 — cart integrity', () => {
  it('restores only SKU and quantity and does not trust cached prices or names', () => {
    const restored = restoreCart(JSON.stringify({ version: 1, lines: [{ sku: 'DEMO-U1000-T', quantity: 2, price: 1, name: 'injected' }] }));
    expect(restored.lines).toEqual([{ sku: 'DEMO-U1000-T', quantity: 2 }]);
    expect(evaluateCart(restored.lines).subtotal).toBe(200000);
  });
  it('survives corrupt/versioned storage and drops malformed rows with a warning', () => {
    for (const raw of ['broken', '{}', '{"version":99,"lines":[]}']) expect(restoreCart(raw).warning).not.toBe('');
    const result = restoreCart(JSON.stringify({ version: 1, lines: [{ sku: 'DEMO-U1000-T', quantity: 1.5 }, { sku: '<bad>', quantity: 1 }, { sku: 'DEMO-P100', quantity: 2 }] }));
    expect(result.lines).toEqual([{ sku: 'DEMO-P100', quantity: 2 }]); expect(result.warning).not.toBe('');
  });
  it('preserves removed/EOL/overstock lines for user correction and withholds an invalid total', () => {
    const lines = [{ sku: 'MISSING-SKU', quantity: 1 }, { sku: 'DEMO-UOLD-T', quantity: 1 }, { sku: 'DEMO-U1000-T', quantity: 6 }];
    const result = evaluateCart(lines);
    expect(result.rows).toHaveLength(3); expect(result.rows.every((row) => row.issue)).toBe(true); expect(result.subtotal).toBeNull();
  });
  it('re-reads current catalog prices instead of any persisted total', () => {
    const old = item('DEMO-U1000-T');
    const result = evaluateCart([{ sku: old.variant.sku, quantity: 2 }], () => ({ ...old, variant: { ...old.variant, price: 130000 } }));
    expect(result.subtotal).toBe(260000);
  });
  it('merges the same SKU while keeping different variants separate and rejects invalid quantities', () => {
    const store = createPreviewStore(); store.initialize();
    expect(store.add('DEMO-U1000-T', 1)).toBe(true); expect(store.add('DEMO-U1000-T', 2)).toBe(true); store.add('DEMO-U1000-R', 1);
    expect(store.getSnapshot().cart).toEqual([{ sku: 'DEMO-U1000-T', quantity: 3 }, { sku: 'DEMO-U1000-R', quantity: 1 }]);
    for (const value of [0, -1, 1.5, NaN, Infinity, 100, 6]) expect(store.update('DEMO-U1000-T', value)).toBe(false);
    expect(store.getSnapshot().cart[0]?.quantity).toBe(3);
    store.remove('DEMO-U1000-T'); store.remove('DEMO-U1000-R'); expect(store.getSnapshot().cart).toEqual([]);
  });
  it('blocks comparison changes beyond three or across families without deleting previous choices', () => {
    const store = createPreviewStore(); store.initialize();
    store.toggleCompare('DEMO-U1000-T');
    expect(store.toggleCompare('DEMO-P100')).toBe(false);
    store.toggleCompare('DEMO-U1500-T'); store.toggleCompare('DEMO-U2000-T');
    expect(store.toggleCompare('DEMO-U1000-R')).toBe(false);
    expect(store.getSnapshot().compare).toEqual(['DEMO-U1000-T', 'DEMO-U1500-T', 'DEMO-U2000-T']);
  });
  it('writes a minimal cart envelope and stays usable when browser storage is blocked', () => {
    let saved = '';
    const store = createPreviewStore(); store.initialize({ getItem: () => null, setItem: (key, value) => { expect(key).toBe(CART_STORAGE_KEY); saved = value; } }); store.add('DEMO-P100');
    expect(JSON.parse(saved)).toEqual({ version: 1, lines: [{ sku: 'DEMO-P100', quantity: 1 }] });
    const blocked = createPreviewStore(); blocked.initialize({ getItem: () => null, setItem: () => { throw new Error('Quota'); } });
    expect(blocked.add('DEMO-P100')).toBe(true); expect(blocked.getSnapshot().storageWarning).toMatch(/Không lưu/);
  });
});
