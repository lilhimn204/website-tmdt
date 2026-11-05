import { Link } from 'react-router';
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart';
import { HeadsetIcon } from '@phosphor-icons/react/dist/csr/Headset';
import { destinations, type NavigationState } from './navigation-data';
import { SiteLink } from './site-link';
import { SearchForm } from './search-form';
import { DesktopNavigation } from './desktop-navigation';
import { MobileNavigation } from './mobile-navigation';

interface StorefrontHeaderProps { name: string; state: NavigationState; cartCount?: number | null }

export function StorefrontHeader({ name, state, cartCount = null }: StorefrontHeaderProps) {
  const knownCount = cartCount !== null && Number.isSafeInteger(cartCount) && cartCount >= 0 ? cartCount : null;
  return (
    <header className="relative z-20 border-b border-line bg-surface">
      <div className="bg-brand-soft text-brand">
        <p className="storefront-container py-2 text-xs leading-5 sm:text-sm"><strong className="font-semibold">Bản xem trước giao diện.</strong> Dữ liệu và giá DEMO; giỏ hàng thử nghiệm, chưa nhận đơn.</p>
      </div>
      <div className="storefront-container flex flex-wrap items-center gap-x-3 gap-y-4 py-4 lg:gap-x-8 lg:py-6">
        <MobileNavigation state={state} />
        <Link id="storefront-brand" to="/" aria-label={`${name} — Trang chủ`} className="min-w-0 flex-1 text-ink lg:flex-none">
          <span className="block text-lg leading-7 font-bold tracking-tight break-words sm:text-2xl">{name}</span>
          <span className="hidden text-xs leading-5 text-muted sm:block">Thiết bị công nghệ</span>
        </Link>
        <div className="order-last w-full lg:order-none lg:w-auto lg:flex-1"><SearchForm /></div>
        <SiteLink item={destinations.support} className="hidden gap-2 text-sm lg:inline-flex"><HeadsetIcon size={23} aria-hidden="true" /><span>Hỗ trợ</span></SiteLink>
        <SiteLink item={destinations.cart} className="flex min-h-12 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium">
          <ShoppingCartIcon size={23} aria-hidden="true" /><span className="hidden sm:inline">Giỏ hàng</span><span className="sr-only sm:hidden">Giỏ hàng</span>
          {knownCount !== null && <span aria-label={`${knownCount} sản phẩm`} className="rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-semibold text-brand">{knownCount > 99 ? '99+' : knownCount}</span>}
        </SiteLink>
      </div>
      <DesktopNavigation state={state} />
    </header>
  );
}
