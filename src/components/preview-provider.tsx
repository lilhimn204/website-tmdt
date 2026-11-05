import { useEffect, useState, type ReactNode } from 'react';
import { createPreviewStore } from './preview-store';
import { PreviewContext } from './preview-context';

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createPreviewStore);
  useEffect(() => {
    try { store.initialize(window.localStorage); } catch { store.initialize(); }
  }, [store]);
  return <PreviewContext.Provider value={store}>{children}</PreviewContext.Provider>;
}
