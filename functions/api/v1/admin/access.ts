import { handleAdminAuth } from '../../../../server/auth/handlers';
import type { AuthEnv } from '../../../../server/auth/types';

export const onRequest: PagesFunction<AuthEnv> = ({ request, env }) => handleAdminAuth(request, env, 'access');
