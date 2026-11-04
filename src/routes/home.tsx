import { Link } from 'react-router';

export function meta() {
  return [{ title: 'Khởi tạo dự án | Website TMĐT' }, { name: 'description', content: 'Bộ khung phát triển website thương mại điện tử.' }];
}

export default function Home() {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-800">Nền tảng kỹ thuật</p>
      <h1 className="mt-5 max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">Bắt đầu từ một bộ khung rõ ràng.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Dự án đã có cấu trúc frontend và API để tiếp tục phát triển. Đây là màn hình khởi tạo, chưa phải giao diện bán hàng.</p>
      <Link to="/kiem-tra" className="mt-8 inline-flex min-h-12 items-center rounded-md bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900">Kiểm tra kết nối API <span aria-hidden="true" className="ml-3">→</span></Link>
      <dl className="mt-12 grid gap-6 border-t border-slate-200 pt-8 sm:grid-cols-3">
        <div><dt className="text-sm text-slate-600">Giao diện</dt><dd className="mt-2 font-semibold">React + Tailwind</dd><dd className="mt-1 text-sm text-slate-600">Vite · TypeScript · Router</dd></div>
        <div><dt className="text-sm text-slate-600">API</dt><dd className="mt-2 font-semibold">Pages Functions</dd><dd className="mt-1 text-sm text-slate-600">Wrangler để chạy local</dd></div>
        <div><dt className="text-sm text-slate-600">Dữ liệu</dt><dd className="mt-2 font-semibold">Chưa kết nối</dd><dd className="mt-1 text-sm text-slate-600">Không cần secret để mở trang</dd></div>
      </dl>
    </div>
  );
}
