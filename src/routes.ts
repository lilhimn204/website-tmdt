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
] satisfies RouteConfig;
