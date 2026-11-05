import type { HomeListState } from './home-data';

interface HomeSectionStateProps<T> { state: HomeListState<T>; label: string; emptyMessage: string }

export function HomeSectionState<T>({ state, label, emptyMessage }: HomeSectionStateProps<T>) {
  if (state.status === 'loading') {
    return <div role="status" aria-busy="true" className="rounded-xl border border-line bg-surface p-6">
      <p className="text-muted">Đang tải {label}…</p>
      <div aria-hidden="true" className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((key) => <div key={key} className="h-28 rounded-lg bg-canvas motion-safe:animate-pulse" />)}
      </div>
    </div>;
  }
  if (state.status === 'error') {
    return <div className="rounded-xl border border-line bg-surface p-6">
      <p role="alert" className="text-danger">Không tải được {label}.</p>
      <button type="button" onClick={state.onRetry} className="mt-4 min-h-12 rounded-lg border border-brand px-5 font-semibold text-brand hover:bg-brand-soft">Thử lại</button>
    </div>;
  }
  if (state.items.length === 0) return <p role="status" className="rounded-xl border border-line bg-surface p-6 leading-7 text-muted">{emptyMessage}</p>;
  return null;
}
