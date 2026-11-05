import { HomeSectionState } from './home-section-state';
import { PreviewProductCard } from './preview-product-card';
import type { HomeListState, PreviewProduct } from './home-data';

export function HomeFeaturedProducts({ state }: { state: HomeListState<PreviewProduct> }) {
  return <section aria-labelledby="san-pham-noi-bat" className="home-section">
    <h2 id="san-pham-noi-bat" className="home-heading">Sản phẩm nổi bật</h2>
    <p className="home-intro">Mẫu trình bày giao diện. Tên, model, SKU và thuộc tính dưới đây là ví dụ, chưa phải sản phẩm đang bán.</p>
    <HomeSectionState state={state} label="sản phẩm nổi bật" emptyMessage="Chưa có sản phẩm nổi bật được công bố. Bạn vẫn có thể xem gợi ý chọn thiết bị bên dưới." />
    {state.status === 'ready' && state.items.length > 0 && <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{state.items.map((product) => <li key={product.id}><PreviewProductCard product={product} /></li>)}</ul>}
  </section>;
}
