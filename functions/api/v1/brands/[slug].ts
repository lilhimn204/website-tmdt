import { handlePublicCatalog } from '../../../../server/catalog/handler';
import type { AuthEnv } from '../../../../server/auth/types';
export const onRequest: PagesFunction<AuthEnv> = ({ request, env, params }) => handlePublicCatalog(request, env, 'brands', params.slug);
