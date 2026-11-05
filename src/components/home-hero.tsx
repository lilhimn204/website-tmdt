import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { ClipboardTextIcon } from '@phosphor-icons/react/dist/csr/ClipboardText';

export function HomeHero() {
  return <section aria-labelledby="home-title" className="overflow-hidden rounded-2xl border border-line bg-surface lg:grid lg:grid-cols-[1.8fr_1fr]">
    <div className="p-5 sm:p-8 lg:p-10">
      <p className="text-sm font-semibold text-brand">Thiết bị cho công việc mỗi ngày</p>
      <h1 id="home-title" className="mt-3 text-[2rem] leading-[1.3] font-bold tracking-tight sm:text-[2.5rem]">Chọn đúng thiết bị.<br />Bắt đầu từ nhu cầu.</h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-muted">Từ lưu điện, in ấn đến nâng cấp máy tính và kết nối mạng.</p>
      <a href="#danh-muc-trang-chu" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-hover">Khám phá danh mục<ArrowRightIcon size={19} aria-hidden="true" /></a>
    </div>
    <aside aria-labelledby="business-entry-title" className="flex flex-col justify-center border-t border-line bg-brand-soft p-5 sm:p-8 lg:border-t-0 lg:border-l">
      <ClipboardTextIcon size={32} className="text-brand" weight="duotone" aria-hidden="true" />
      <h2 id="business-entry-title" className="mt-3 text-xl leading-7 font-semibold">Mua cho doanh nghiệp?</h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted">Chuẩn bị model, số lượng và nhu cầu triển khai để trao đổi báo giá.</p>
      <a href="#nhu-cau-doanh-nghiep" className="mt-4 inline-flex min-h-12 items-center gap-2 self-start font-semibold text-brand underline underline-offset-4">Chuẩn bị yêu cầu<ArrowRightIcon size={18} aria-hidden="true" /></a>
      <p className="mt-1 text-xs leading-5 text-muted">Chưa tiếp nhận yêu cầu báo giá trong bản xem trước.</p>
    </aside>
  </section>;
}
