import { HomeSectionState } from './home-section-state';
import type { HomeListState, ReferenceBrand } from './home-data';

export function HomeBrands({ state }: { state: HomeListState<ReferenceBrand> }) {
  return <section aria-labelledby="thuong-hieu-tham-khao" className="home-section">
    <h2 id="thuong-hieu-tham-khao" className="home-heading">Thương hiệu trong danh mục dự kiến</h2>
    <p className="home-intro">Tên tham khảo từ kế hoạch danh mục. Danh sách kinh doanh và quyền phân phối của website chưa được xác nhận.</p>
    <HomeSectionState state={state} label="thương hiệu" emptyMessage="Danh sách thương hiệu đang chờ xác nhận." />
    {state.status === 'ready' && state.items.length > 0 && <ul className="grid grid-cols-2 gap-y-6 border-y border-line py-6 sm:grid-cols-3 xl:grid-cols-6">{state.items.map((brand) => <li key={brand.name} className="px-3 text-center">
      <p className="text-lg font-semibold tracking-tight text-ink">{brand.name}</p><p className="mt-1 text-xs leading-5 text-muted">{brand.category}</p>
    </li>)}</ul>}
  </section>;
}
