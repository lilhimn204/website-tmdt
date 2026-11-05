import type { ReactNode } from 'react';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { Route } from './+types/root';
import { AppShell } from './components/app-shell';
import { PreviewProvider } from './components/preview-provider';
import './app.css';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <PreviewProvider><AppShell><Outlet /></AppShell></PreviewProvider>;
}

export function HydrateFallback() {
  return <p className="p-8" role="status">Đang mở dự án…</p>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold">{missing ? 'Không tìm thấy trang' : 'Chưa thể mở trang'}</h1>
      <p className="mt-4 text-slate-600">{missing ? 'Đường dẫn này chưa có trong dự án khởi tạo.' : 'Vui lòng tải lại trang để thử lại.'}</p>
      <a className="mt-8 inline-flex min-h-11 items-center font-semibold text-teal-800 underline underline-offset-4" href="/">Về trang khởi tạo</a>
    </main>
  );
}
