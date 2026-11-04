import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

export function AppShell({ children }: { children: ReactNode }) {
  const appName = import.meta.env.VITE_APP_NAME?.trim() || 'Website TMĐT';
  return (
    <>
      <a href="#noi-dung" className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-white focus:p-4">Đến nội dung chính</a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <a href="/" className="text-lg font-semibold tracking-tight">{appName}</a>
          <nav aria-label="Điều hướng dự án" className="flex gap-5 text-sm">
            <NavLink to="/" end className="inline-flex min-h-11 items-center text-slate-700 aria-[current=page]:font-semibold aria-[current=page]:text-teal-800">Khởi tạo</NavLink>
            <NavLink to="/kiem-tra" className="inline-flex min-h-11 items-center text-slate-700 aria-[current=page]:font-semibold aria-[current=page]:text-teal-800">Kiểm tra API</NavLink>
          </nav>
        </div>
      </header>
      <main id="noi-dung" className="mx-auto max-w-5xl px-6 py-12 sm:py-20">{children}</main>
      <footer className="mx-auto max-w-5xl border-t border-slate-200 px-6 py-6 text-sm text-slate-600">Giai đoạn 06 · Bộ khung phát triển</footer>
    </>
  );
}
