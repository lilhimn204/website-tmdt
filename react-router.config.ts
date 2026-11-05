import type { Config } from '@react-router/dev/config';
import { catalogCategories, demoProducts } from './src/components/catalog-data';

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/', '/kiem-tra', '/danh-muc/', '/san-pham/', '/tim-kiem/', '/so-sanh/', '/gio-hang/',
    ...catalogCategories.map((entry) => `/danh-muc/${entry.slug}/`),
    ...demoProducts.filter((entry) => entry.published).map((entry) => `/san-pham/${entry.slug}/`),
  ],
} satisfies Config;
