import { Link } from 'react-router';
import { destinations, policyLinks } from './navigation-data';
import { SiteLink } from './site-link';

export function StorefrontFooter({ name }: { name: string }) {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="storefront-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-10 lg:py-12">
        <div>
          <Link to="/" className="text-xl font-bold tracking-tight text-ink">{name}</Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">Không gian tìm hiểu thiết bị công nghệ cho cá nhân và doanh nghiệp.</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">Thông tin pháp nhân và liên hệ đang chờ doanh nghiệp cung cấp.</p>
        </div>
        <nav aria-labelledby="footer-about">
          <h2 id="footer-about" className="mb-3 text-sm font-semibold text-ink">Về website</h2>
          <ul><li><SiteLink item={destinations.about} className="min-h-11 text-sm" /></li><li><SiteLink item={destinations.contact} className="min-h-11 text-sm" /></li></ul>
        </nav>
        <nav aria-labelledby="footer-support">
          <h2 id="footer-support" className="mb-3 text-sm font-semibold text-ink">Hỗ trợ khách hàng</h2>
          <ul>{[destinations.support, destinations.guide, destinations.quote].map((item) => <li key={item.to}><SiteLink item={item} className="min-h-11 text-sm" /></li>)}</ul>
        </nav>
        <nav aria-labelledby="footer-policies">
          <h2 id="footer-policies" className="mb-3 text-sm font-semibold text-ink">Chính sách</h2>
          <ul>{policyLinks.map((item) => <li key={item.to}><SiteLink item={item} className="min-h-11 text-sm" /></li>)}</ul>
        </nav>
      </div>
      <div className="border-t border-line"><p className="storefront-container py-5 text-xs leading-5 text-muted">Giao diện xem trước. Nội dung chính sách chưa được công bố; chưa tiếp nhận đơn hàng hoặc yêu cầu báo giá.</p></div>
    </footer>
  );
}
