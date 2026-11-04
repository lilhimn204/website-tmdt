import { handleApiNotFound } from '../../server/not-found';

export const onRequest: PagesFunction = () => handleApiNotFound();
