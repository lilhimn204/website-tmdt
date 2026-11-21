import { handlePublicProducts } from '../../../../server/catalog/products';
import type { AuthEnv } from '../../../../server/auth/types';
export const onRequest: PagesFunction<AuthEnv> = ({ request, env }) => handlePublicProducts(request, env, 'products', {});
