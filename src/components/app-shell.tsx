import type { ReactNode } from 'react';
import { StorefrontHeader } from './storefront-header';
import { StorefrontFooter } from './storefront-footer';
import { previewNavigation, type NavigationState } from './navigation-data';
import { usePreview } from './preview-context';
import { CompareTray } from './catalog-ui';

interface AppShellProps { children: ReactNode; navigationState?: NavigationState; cartCount?: number | null }

export function AppShell({ children, navigationState = previewNavigation, cartCount = null }: AppShellProps) {
  const appName = import.meta.env.VITE_APP_NAME?.trim() || 'Website TMĐT';
  const store = usePreview();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
      <StorefrontHeader name={appName} state={navigationState} cartCount={cartCount ?? (store.ready ? store.cart.reduce((count, line) => count + line.quantity, 0) : null)} />
      <p role="status" aria-live="polite" aria-atomic="true" className={`storefront-container w-full text-sm leading-6 text-brand ${store.notice ? 'pt-4' : 'sr-only'}`}>{store.notice}</p>
      {store.storageWarning && <p role="status" className="storefront-container w-full pt-3 text-sm text-muted">{store.storageWarning}</p>}
      <main id="noi-dung" tabIndex={-1} className="storefront-container w-full flex-1 py-12 sm:py-16">{children}</main>
      <CompareTray />
      <StorefrontFooter name={appName} />
    </div>
  );
}
