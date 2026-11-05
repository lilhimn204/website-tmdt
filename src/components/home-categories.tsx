import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { Link } from 'react-router';
import { CategoryIcon } from './category-icon';
import { HomeSectionState } from './home-section-state';
import type { HomeCategory, HomeListState } from './home-data';

export function HomeCategories({ state }: { state: HomeListState<HomeCategory> }) {
  return <section aria-labelledby="danh-muc-trang-chu" className="home-section">
    <h2 id="danh-muc-trang-chu" tabIndex={-1} className="home-heading">Bạn đang tìm thiết bị gì?</h2>
    <p className="home-intro">Chọn nhóm để duyệt danh mục DEMO và lọc theo thông số của từng loại thiết bị.</p>
    <HomeSectionState state={state} label="danh mục" emptyMessage="Danh mục đang được chuẩn bị. Các nhóm hàng sẽ xuất hiện sau khi được xác nhận." />
    {state.status === 'ready' && state.items.length > 0 && <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">{state.items.map((category) => <li key={category.id}>
      <Link to={category.to} className="group flex h-full flex-col rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand hover:bg-brand-soft sm:p-6">
        <span className="mb-4 text-brand"><CategoryIcon categoryId={category.id} /></span>
        <h3 className="text-base leading-6 font-semibold text-ink sm:text-lg">{category.label}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{category.description}</p>
        <span className="mt-auto flex items-center justify-between gap-2 pt-5 text-sm font-semibold text-brand">Xem danh mục<ArrowRightIcon size={18} aria-hidden="true" className="shrink-0" /></span>
      </Link>
    </li>)}</ul>}
  </section>;
}
