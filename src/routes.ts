import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('kiem-tra', 'routes/system-check.tsx'),
] satisfies RouteConfig;
