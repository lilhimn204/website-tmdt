import { Fragment } from 'react';
import { Link } from 'react-router';
import { usePreviewSearch } from './use-preview-search';
import { familyLabels, productHref, specDefinitions, type SpecDefinition, type SpecValue } from './catalog-data';
import { comparisonHref, comparisonState, money, resolveComparison, saleIssue, specText } from './catalog-model';
import { DemoNotice } from './catalog-ui';
import { usePreview } from './preview-context';

function ComparisonRow({ label, values, definition, currency = false }: { label: string; values: readonly (SpecValue | undefined)[]; definition?: SpecDefinition; currency?: boolean }) {
  const state = comparisonState(values);
  return <tr className={state.different ? 'bg-brand-soft' : 'bg-surface'}>
    <th scope="row" className="sticky left-0 z-10 w-28 min-w-28 border-b border-line bg-inherit p-3 text-left align-top text-sm font-semibold">{label}{state.different && <span className="mt-1 block text-xs font-medium text-brand">Khác nhau</span>}{state.incomplete && <span className="mt-1 block text-xs font-normal text-muted">Chưa đủ dữ liệu</span>}</th>
    {values.map((value, index) => <td key={index} className="min-w-48 border-b border-line p-4 align-top text-sm leading-6">{currency && typeof value === 'number' ? money(value) : specText(value, definition)}</td>)}
  </tr>;
}
export function ComparisonPage() {
  const [params, setParams] = usePreviewSearch();
  const store = usePreview();
  const skus = params.getAll('sku');
  const result = resolveComparison(skus);
  const unknownParams = [...params.keys()].some((key) => key !== 'sku');
  const errors = [...result.errors, ...(unknownParams ? ['URL so sánh có tham số không hỗ trợ.'] : [])];
  const first = result.items[0];
  const definitions = first ? specDefinitions[first.product.family] : [];
  const groups = [...new Set(definitions.map((entry) => entry.group))];
  function remove(index: number) { const next = new URLSearchParams(); skus.filter((_, current) => index !== current).forEach((sku) => next.append('sku', sku)); setParams(next); }
  return <>
    <h1 className="mb-4 text-3xl font-semibold">So sánh sản phẩm</h1><DemoNotice />
    <p className="mb-5 text-sm leading-7 text-muted">Chọn 2–3 SKU cùng loại. Dữ liệu thiếu được ghi riêng; không xếp hạng hoặc suy khả năng tương thích.</p>
    {skus.length > 0 && <ul className="mb-5 flex flex-wrap gap-3">{skus.map((sku, index) => <li key={`${sku}-${index}`}><button type="button" className="secondary-button break-all" onClick={() => remove(index)}>Bỏ {sku.slice(0, 80)}</button></li>)}</ul>}
    {errors.length > 0 && <div role="alert" className="mb-5 rounded-xl border border-line bg-surface p-5 text-danger"><ul className="space-y-2">{errors.map((error) => <li key={error}>{error}</li>)}</ul><button type="button" className="secondary-button mt-4" onClick={() => setParams({})}>Xóa danh sách trong URL</button></div>}
    {skus.length < 2 && <p role="status" className="mb-5 rounded-xl border border-line bg-surface p-5 text-muted">{skus.length ? 'Cần chọn thêm ít nhất một SKU cùng loại.' : 'Chưa có sản phẩm để so sánh.'}</p>}
    <div className="mb-6 flex flex-wrap gap-3"><Link to={first && !errors.length ? `/danh-muc/${first.product.category}/` : '/san-pham/'} onClick={() => { if (!errors.length) store.adoptCompare(skus); }} className="secondary-button">Tiếp tục chọn sản phẩm</Link>{!skus.length && store.compare.length > 0 && <Link to={comparisonHref(store.compare)} className="primary-button">Dùng {store.compare.length} SKU đã chọn</Link>}</div>
    {skus.length >= 2 && !errors.length && first && <>
      <h2 className="mb-3 text-xl font-semibold">Nhóm {familyLabels[first.product.family]}</h2><p id="compare-scroll-help" className="mb-3 text-sm text-muted">Cuộn ngang hoặc dùng phím mũi tên trong vùng bảng để xem đủ các cột.</p>
      <div role="region" aria-label="Bảng so sánh thông số" aria-describedby="compare-scroll-help" tabIndex={0} className="max-w-full overflow-x-auto rounded-xl border border-line">
        <table className="w-full border-separate border-spacing-0"><caption className="sr-only">So sánh {skus.join(', ')}. Các hàng khác biệt có nhãn; giá trị thiếu không được coi là giống nhau.</caption>
          <thead><tr><th scope="col" className="sticky left-0 z-10 min-w-28 bg-canvas p-3 text-left text-sm">Thuộc tính</th>{result.items.map((item) => <th key={item.variant.sku} scope="col" className="min-w-48 bg-canvas p-4 text-left align-top"><Link to={productHref(item)} className="text-sm font-semibold text-brand underline underline-offset-4">{item.product.name}</Link><p className="mt-2 text-xs font-normal text-muted">{item.variant.sku}<br />{item.variant.label}</p></th>)}</tr></thead>
          <tbody>
            <ComparisonRow label="Giá kiểm thử" values={result.items.map((item) => item.variant.quoteOnly ? 'Yêu cầu báo giá' : item.variant.price)} currency />
            <ComparisonRow label="Khả dụng" values={result.items.map((item) => saleIssue(item) ?? 'Có thể thử thêm giỏ')} />
            <ComparisonRow label="Bảo hành mẫu" values={result.items.map((item) => item.variant.warrantyMonths)} definition={{ key: 'warranty', label: 'Bảo hành mẫu', group: 'Bảo hành', unit: 'tháng' }} />
            {groups.map((group) => <Fragment key={group}><tr><th colSpan={skus.length + 1} className="bg-canvas p-3 text-left text-sm font-semibold">{group}</th></tr>{definitions.filter((entry) => entry.group === group).map((entry) => <ComparisonRow key={entry.key} label={entry.label} definition={entry} values={result.items.map((item) => item.variant.specs[entry.key])} />)}</Fragment>)}
          </tbody>
        </table>
      </div>
    </>}
  </>;
}
