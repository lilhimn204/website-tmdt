import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('kiem-tra', 'routes/system-check.tsx'),
  route('danh-muc/:category?', 'routes/catalog.tsx'),
  route('san-pham', 'routes/products.tsx'),
  route('san-pham/:slug', 'routes/product.tsx'),
  route('tim-kiem', 'routes/search.tsx'),
  route('so-sanh', 'routes/compare.tsx'),
  route('gio-hang', 'routes/cart.tsx'),
  route('thuong-hieu/:brand?', 'routes/brands.tsx'),
  route('dat-hang', 'routes/checkout.tsx'),
  route('dat-hang/da-tiep-nhan', 'routes/order-receipt.tsx'),
  route('don-hang/theo-doi', 'routes/order-tracking.tsx'),
  route('bao-gia', 'routes/quote.tsx'),
  route('bao-gia/da-tiep-nhan', 'routes/quote-receipt.tsx'),
  route('ho-tro', 'routes/support.tsx'),
  route('ho-tro/huong-dan-su-dung', 'routes/guide.tsx'),
  route('lien-he', 'routes/contact.tsx'),
  route('gioi-thieu', 'routes/about.tsx'),
  route('chinh-sach/:policy?', 'routes/policies.tsx'),
] satisfies RouteConfig;
