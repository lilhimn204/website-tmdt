import { HomeHero } from '../components/home-hero';
import { HomeCategories } from '../components/home-categories';
import { HomeFeaturedProducts } from '../components/home-featured-products';
import { HomeBrands } from '../components/home-brands';
import { HomeBuyingGuide } from '../components/home-buying-guide';
import { homeCategories, previewProducts, referenceBrands } from '../components/home-data';

export function meta() {
  const name = import.meta.env.VITE_APP_NAME?.trim() || 'Website TMĐT';
  return [{ title: `Thiết bị công nghệ cho công việc | ${name}` }, { name: 'description', content: 'Bản xem trước danh mục UPS, máy in, linh kiện và thiết bị mạng. Tìm hiểu cách chọn thiết bị theo nhu cầu và thông số.' }];
}

export default function Home() {
  return <div className="space-y-12 sm:space-y-16">
    <HomeHero />
    <HomeCategories state={{ status: 'ready', items: homeCategories }} />
    <HomeFeaturedProducts state={{ status: 'ready', items: previewProducts }} />
    <HomeBrands state={{ status: 'ready', items: referenceBrands }} />
    <HomeBuyingGuide />
  </div>;
}
