import type { Config } from '@react-router/dev/config';
import { catalogCategories, demoBrands, demoProducts } from './src/components/catalog-data';
import { informationPages } from './src/components/information-data';

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/', '/kiem-tra', '/danh-muc/', '/san-pham/', '/tim-kiem/', '/so-sanh/', '/gio-hang/',
    '/dat-hang/', '/dat-hang/da-tiep-nhan/', '/don-hang/theo-doi/', '/bao-gia/', '/bao-gia/da-tiep-nhan/', '/chinh-sach/', '/thuong-hieu/',
    ...informationPages.map((page) => page.path),
    ...demoBrands.map((brand) => `/thuong-hieu/${brand.slug}/`),
    ...catalogCategories.map((entry) => `/danh-muc/${entry.slug}/`),
    ...demoProducts.filter((entry) => entry.published).map((entry) => `/san-pham/${entry.slug}/`),
  ],
} satisfies Config;
