import type { NavigationState } from './navigation-data';

export function CategoryMenuState({ state }: { state: NavigationState }) {
  if (state.status === 'loading') {
    return <p role="status" aria-busy="true" className="p-6 text-muted">Đang tải danh mục…</p>;
  }
  if (state.status === 'error') {
    return <div className="p-6"><p role="alert" className="text-danger">Không tải được danh mục.</p><button type="button" className="mt-3 min-h-12 rounded-lg border border-brand px-4 font-semibold text-brand hover:bg-brand-soft" onClick={state.onRetry}>Thử lại</button></div>;
  }
  if (state.groups.length === 0) {
    return <p role="status" className="p-6 text-muted">Chưa có danh mục được công bố.</p>;
  }
  return null;
}
