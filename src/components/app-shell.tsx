import type { ReactNode } from 'react';
import { StorefrontHeader } from './storefront-header';
import { StorefrontFooter } from './storefront-footer';
import { previewNavigation, type NavigationState } from './navigation-data';

interface AppShellProps { children: ReactNode; navigationState?: NavigationState; cartCount?: number | null }

export function AppShell({ children, navigationState = previewNavigation, cartCount = null }: AppShellProps) {
  const appName = import.meta.env.VITE_APP_NAME?.trim() || 'Website TMĐT';
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
      <StorefrontHeader name={appName} state={navigationState} cartCount={cartCount} />
      <main id="noi-dung" tabIndex={-1} className="storefront-container w-full flex-1 py-12 sm:py-16">{children}</main>
      <StorefrontFooter name={appName} />
    </div>
  );
}
