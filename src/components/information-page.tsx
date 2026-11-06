import { Link } from 'react-router';
import { findInformation, policyPages } from './information-data';

export function InformationPage({ path }: { path: string }) {
  const page = findInformation(path);
  if (!page) return <><h1 className="text-3xl font-semibold">Không tìm thấy nội dung</h1><p className="mt-4 text-muted">Đường dẫn này không có trong bộ nội dung hiện tại.</p><Link to="/ho-tro/" className="primary-button mt-6">Về trang hỗ trợ</Link></>;
  return <>
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted"><Link to="/" className="underline">Trang chủ</Link><span aria-hidden="true"> / </span>{page.title}</nav>
    <h1 className="mb-4 max-w-3xl text-3xl leading-tight font-semibold">{page.title}</h1>
    {page.pending && <p role="status" className="mb-4 inline-block rounded-lg bg-brand-soft px-3 py-2 text-sm font-semibold text-brand">Chưa công bố thông tin chính thức</p>}
    <p className="mb-8 max-w-3xl text-base leading-8 text-muted">{page.intro}</p>
    <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,760px)]">
      <nav aria-label="Mục lục" className="rounded-xl border border-line bg-surface p-4"><h2 className="mb-2 font-semibold">Trong trang này</h2><ul>{page.sections.map((section) => <li key={section.id}><a className="inline-flex min-h-12 items-center py-2 text-sm leading-6 text-brand underline underline-offset-4" href={`#${section.id}`} onClick={() => document.getElementById(section.id)?.focus()}>{section.title}</a></li>)}</ul></nav>
      <div className="min-w-0 space-y-8">{page.sections.map((section) => <section key={section.id} aria-labelledby={section.id} className="border-b border-line pb-7"><h2 id={section.id} tabIndex={-1} className="home-heading">{section.title}</h2><p className="mt-4 leading-8 text-muted">{section.text}</p>{section.links && <ul className="mt-4 flex flex-wrap gap-3">{section.links.map((link) => <li key={link.to}><Link to={link.to} className="secondary-button">{link.label}</Link></li>)}</ul>}</section>)}
        {page.path.startsWith('/chinh-sach/') && <Link to="/chinh-sach/" className="secondary-button">Tất cả chính sách</Link>}
      </div>
    </div>
  </>;
}
export function PolicyIndex() {
  return <><h1 className="mb-4 text-3xl font-semibold">Chính sách và thông tin giao dịch</h1><p className="mb-8 max-w-3xl leading-8 text-muted">Các chính sách chưa được công bố hoặc có ngày hiệu lực. Những trang dưới đây cho biết trạng thái thông tin, chưa phải cam kết bán hàng.</p><ul className="grid gap-4 sm:grid-cols-2">{policyPages.map((page) => <li key={page.path} className="rounded-xl border border-line bg-surface p-5"><h2 className="text-lg font-semibold"><Link to={page.path} className="inline-flex min-h-12 items-center text-brand underline underline-offset-4">{page.title}</Link></h2><p className="mt-2 text-sm leading-7 text-muted">{page.intro}</p><p className="mt-3 text-xs text-muted">Chưa có ngày hiệu lực</p></li>)}</ul></>;
}
