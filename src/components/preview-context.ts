import { createContext, useContext, useSyncExternalStore } from 'react';
import type { PreviewStore } from './preview-store';

export const PreviewContext = createContext<PreviewStore | null>(null);
export function usePreview() {
  const store = useContext(PreviewContext);
  if (!store) throw new Error('PreviewProvider is required.');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { ...snapshot, add: store.add, update: store.update, remove: store.remove, toggleCompare: store.toggleCompare, clearCompare: store.clearCompare, adoptCompare: store.adoptCompare, getNotice: store.getNotice };
}
