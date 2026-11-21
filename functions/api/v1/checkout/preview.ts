import { handleCommerce } from '../../../../server/commerce/handler';
import type { CommerceEnv } from '../../../../server/commerce/types';
export const onRequest: PagesFunction<CommerceEnv> = ({ request, env }) => handleCommerce(request, env, 'preview');
