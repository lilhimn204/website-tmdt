import { useSyncExternalStore } from 'react';
import { useSearchParams } from 'react-router';

const subscribe = () => () => {};
const empty = new URLSearchParams();
// Prerendered HTML is built without query strings. Match that HTML for the
// first hydration render, then apply the actual browser URL without warnings.
export function usePreviewSearch() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [params, setParams] = useSearchParams();
  return [hydrated ? params : empty, setParams] as const;
}
