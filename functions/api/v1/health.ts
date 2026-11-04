import { handleHealth } from '../../../server/health';

export const onRequest: PagesFunction = ({ request }) => handleHealth(request);
