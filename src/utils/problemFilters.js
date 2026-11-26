// Pure helpers for filtering, sorting and URL-encoding the problem list.

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const STATUS_OPTIONS = ['all', 'solved', 'unsolved'];

export const DEFAULT_FILTERS = Object.freeze({
  q: '',
  category: [],
  difficulty: [],
  status: 'all',
  tags: [],
});

const LIST_KEYS = ['category', 'difficulty', 'tags'];

/** Normalizes 'easy', ' EASY ' etc. to 'Easy'; returns null for unknown or missing values. */
export function normalizeDifficulty(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  return DIFFICULTIES.find((d) => d.toLowerCase() === v) || null;
}

/** Sorts Easy < Medium < Hard; unknown or missing difficulties go last. */
export function compareDifficulty(a, b) {
  const rank = (v) => {
    const i = DIFFICULTIES.indexOf(normalizeDifficulty(v));
    return i === -1 ? DIFFICULTIES.length : i;
  };
  return rank(a) - rank(b);
}

/** Reads filters from a query string such as "?q=two&difficulty=Easy,Hard". */
export function parseFilters(search) {
  const params = new URLSearchParams(search);
  const filters = { ...DEFAULT_FILTERS };
  filters.q = params.get('q') || '';
  for (const key of LIST_KEYS) {
    const raw = params.get(key);
    filters[key] = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  }
  filters.difficulty = filters.difficulty.map(normalizeDifficulty).filter(Boolean);
  const status = params.get('status');
  filters.status = STATUS_OPTIONS.includes(status) ? status : 'all';
  return filters;
}

/**
 * Writes filters into an existing query string. Unrelated params are kept, and
 * filters at their default value are removed so a clean list has a clean URL.
 */
export function serializeFilters(filters, existingSearch = '') {
  const params = new URLSearchParams(existingSearch);
  const q = filters.q.trim();
  if (q) params.set('q', q); else params.delete('q');
  for (const key of LIST_KEYS) {
    if (filters[key].length) params.set(key, filters[key].join(','));
    else params.delete(key);
  }
  if (filters.status !== 'all') params.set('status', filters.status);
  else params.delete('status');
  const str = params.toString();
  return str ? `?${str}` : '';
}

export function hasActiveFilters(filters) {
  return (
    filters.q.trim() !== '' ||
    filters.status !== 'all' ||
    LIST_KEYS.some((key) => filters[key].length > 0)
  );
}

/**
 * Filters rows. Each filter group must match (AND); inside a multi-select
 * group, any selected value matches (OR).
 */
export function applyFilters(rows, filters) {
  const q = filters.q.trim().toLowerCase();
  return rows.filter((row) => {
    if (q && !(row.problem || '').toLowerCase().includes(q)) return false;
    if (filters.category.length && !filters.category.includes(row.category)) return false;
    if (
      filters.difficulty.length &&
      !filters.difficulty.includes(normalizeDifficulty(row.difficulty))
    ) {
      return false;
    }
    if (filters.status === 'solved' && row.status !== 'Solved') return false;
    if (filters.status === 'unsolved' && row.status === 'Solved') return false;
    if (filters.tags.length && !(row.tags || []).some((t) => filters.tags.includes(t))) {
      return false;
    }
    return true;
  });
}

/** Builds the sorted option lists for the filter dropdowns from the loaded rows. */
export function collectOptions(rows) {
  const categories = new Set();
  const tags = new Set();
  for (const row of rows) {
    if (row.category) categories.add(row.category);
    for (const t of row.tags || []) tags.add(t);
  }
  return {
    categories: [...categories].sort((a, b) => a.localeCompare(b)),
    tags: [...tags].sort((a, b) => a.localeCompare(b)),
  };
}
