import { handlePublicDiscovery } from '../../../../../server/catalog/discovery';
import type { AuthEnv } from '../../../../../server/auth/types';
export const onRequest: PagesFunction<AuthEnv> = ({ request, env, params }) => handlePublicDiscovery(request, env, 'filters', params.code);
