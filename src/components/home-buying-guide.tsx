import { homeCategories } from './home-data';
import { CategoryIcon } from './category-icon';
import { SiteLink } from './site-link';
import { destinations, policyLinks } from './navigation-data';

export function HomeBuyingGuide() {
  return <>
    <section aria-labelledby="chon-theo-nhu-cau" className="home-section">
      <h2 id="chon-theo-nhu-cau" className="home-heading">Chọn theo nhu cầu, hiểu rõ thông số</h2>
      <p className="home-intro">Một vài điểm nên đối chiếu trước khi chọn model. Khả năng tương thích cần được xác nhận theo thiết bị cụ thể.</p>
      <div className="divide-y divide-line border-y border-line">{homeCategories.map((category) => <article key={category.id} aria-labelledby={`chon-${category.id}`} className="grid gap-4 py-6 md:grid-cols-[1fr_2fr] md:gap-8">
        <div className="flex items-start gap-3"><span className="mt-1 text-brand"><CategoryIcon categoryId={category.id} size={28} /></span><div>
          <h3 id={`chon-${category.id}`} tabIndex={-1} className="scroll-mt-6 text-lg leading-7 font-semibold">{category.label}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{category.guidance}</p>
        </div></div>
        <ul className="space-y-2 text-sm leading-7 text-muted">{category.questions.map((question) => <li key={question} className="flex gap-3"><span aria-hidden="true" className="mt-3 h-1 w-1 shrink-0 rounded-full bg-brand" />{question}</li>)}</ul>
      </article>)}</div>
    </section>
    <section aria-labelledby="nhu-cau-doanh-nghiep" className="home-section grid gap-6 rounded-2xl border border-line bg-brand-soft p-5 sm:p-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <h2 id="nhu-cau-doanh-nghiep" tabIndex={-1} className="home-heading">Chuẩn bị nhu cầu doanh nghiệp</h2>
        <p className="mt-3 max-w-lg leading-7 text-muted">Một danh sách rõ ràng giúp trao đổi đúng thiết bị, đúng số lượng và điều kiện triển khai.</p>
        <p className="mt-4 text-sm leading-6 text-muted">Kênh tiếp nhận báo giá chưa mở. Nội dung này là hướng dẫn chuẩn bị; chưa gửi hoặc lưu thông tin của bạn.</p>
      </div>
      <ol className="divide-y divide-line text-sm leading-6">
        {['Model hoặc nhu cầu sử dụng, số lượng từng loại.', 'Địa điểm triển khai và thời điểm cần hàng.', 'Yêu cầu hóa đơn, thông tin liên hệ và điều kiện kỹ thuật.'].map((text, index) => <li key={text} className="flex gap-4 py-3 first:pt-0 last:pb-0"><span className="font-semibold text-brand">0{index + 1}</span><span>{text}</span></li>)}
      </ol>
    </section>
    <section aria-labelledby="loi-ich-chinh-sach" className="home-section grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      <div>
        <h2 id="loi-ich-chinh-sach" className="home-heading">Thông tin rõ ràng trước khi mua</h2>
        <p className="mt-3 max-w-lg leading-7 text-muted">Định hướng phục vụ: chọn theo thông số, kiểm tra tương thích và tách rõ mua lẻ với nhu cầu báo giá.</p>
        <p className="mt-3 text-sm leading-6 text-muted">Điều kiện giao hàng, thanh toán, đổi trả và bảo hành đang chờ doanh nghiệp xác nhận. Chưa áp dụng cam kết bán hàng trong bản xem trước.</p>
      </div>
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <h3 className="font-semibold">Chính sách cần xem khi mua hàng</h3>
        <ul className="mt-3 grid gap-x-4 sm:grid-cols-2">{policyLinks.slice(0, 4).map((item) => <li key={item.to}><SiteLink item={item} className="min-h-12 text-sm" /></li>)}</ul>
        <div className="mt-4 border-t border-line pt-3"><SiteLink item={destinations.contact} className="min-h-12 text-sm font-semibold" /><p className="text-xs leading-5 text-muted">Thông tin liên hệ chính thức chưa được công bố.</p></div>
      </div>
    </section>
  </>;
}
