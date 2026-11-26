import { useCallback, useEffect, useState } from 'react';
import { parseFilters, serializeFilters } from '../utils/problemFilters';

/**
 * Keeps the problem-list filters in the URL query string so a filtered view
 * can be bookmarked or shared. Uses replaceState, so typing in the search box
 * doesn't add a history entry for every keystroke.
 */
export default function useUrlFilters() {
  const [filters, setFiltersState] = useState(() => parseFilters(window.location.search));

  const setFilters = useCallback((updater) => {
    setFiltersState((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const next = serializeFilters(filters, search);
    if (next !== search) {
      window.history.replaceState(window.history.state, '', `${pathname}${next}${hash}`);
    }
  }, [filters]);

  // Pick up changes made through back/forward navigation.
  useEffect(() => {
    const onPopState = () => setFiltersState(parseFilters(window.location.search));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return [filters, setFilters];
}
