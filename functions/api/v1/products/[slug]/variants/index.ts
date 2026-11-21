import { handlePublicProducts } from '../../../../../../server/catalog/products';
import type { AuthEnv } from '../../../../../../server/auth/types';
export const onRequest: PagesFunction<AuthEnv> = ({ request, env, params }) => handlePublicProducts(request, env, 'variants', { slug: params.slug });
