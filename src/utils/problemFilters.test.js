import {
  DEFAULT_FILTERS,
  applyFilters,
  collectOptions,
  compareDifficulty,
  hasActiveFilters,
  normalizeDifficulty,
  parseFilters,
  serializeFilters,
} from './problemFilters';

const rows = [
  { id: '1', problem: 'Two Sum', category: 'Array', difficulty: 'Easy', status: 'Solved', tags: ['hash-map'] },
  { id: '2', problem: 'Coin Change', category: '1D DP', difficulty: 'medium', status: 'Unsolved', tags: ['dp'] },
  { id: '3', problem: 'Trapping Rain Water', category: 'Array', difficulty: 'Hard', status: 'Unsolved', tags: ['two-pointers'] },
  { id: '4', problem: 'House Robber', category: '1D DP', status: 'Solved' },
];

const f = (overrides) => ({ ...DEFAULT_FILTERS, ...overrides });

describe('difficulty helpers', () => {
  test('normalizes case and whitespace, rejects unknown values', () => {
    expect(normalizeDifficulty(' MEDIUM ')).toBe('Medium');
    expect(normalizeDifficulty('extreme')).toBeNull();
    expect(normalizeDifficulty(undefined)).toBeNull();
  });

  test('sorts Easy < Medium < Hard < missing', () => {
    const sorted = [undefined, 'Hard', 'easy', 'Medium'].sort(compareDifficulty);
    expect(sorted).toEqual(['easy', 'Medium', 'Hard', undefined]);
  });
});

describe('applyFilters', () => {
  test('returns everything with default filters', () => {
    expect(applyFilters(rows, DEFAULT_FILTERS)).toHaveLength(4);
  });

  test('searches title case-insensitively', () => {
    expect(applyFilters(rows, f({ q: 'coin' })).map((r) => r.id)).toEqual(['2']);
  });

  test('matches any selected value within a group, all groups together', () => {
    const result = applyFilters(rows, f({ category: ['Array'], difficulty: ['Easy', 'Hard'] }));
    expect(result.map((r) => r.id)).toEqual(['1', '3']);
    expect(applyFilters(rows, f({ category: ['1D DP'], difficulty: ['Medium'] })).map((r) => r.id)).toEqual(['2']);
  });

  test('filters by status', () => {
    expect(applyFilters(rows, f({ status: 'solved' })).map((r) => r.id)).toEqual(['1', '4']);
    expect(applyFilters(rows, f({ status: 'unsolved' })).map((r) => r.id)).toEqual(['2', '3']);
  });

  test('filters by tags and skips rows without tags', () => {
    expect(applyFilters(rows, f({ tags: ['dp', 'hash-map'] })).map((r) => r.id)).toEqual(['1', '2']);
  });
});

describe('URL round trip', () => {
  test('serializes only non-default filters and keeps unrelated params', () => {
    const search = serializeFilters(f({ q: ' two ', difficulty: ['Easy', 'Hard'], status: 'solved' }), '?ref=share');
    const params = new URLSearchParams(search);
    expect(params.get('ref')).toBe('share');
    expect(params.get('q')).toBe('two');
    expect(params.get('difficulty')).toBe('Easy,Hard');
    expect(params.get('status')).toBe('solved');
    expect(params.has('category')).toBe(false);
  });

  test('clearing filters removes their params', () => {
    expect(serializeFilters(DEFAULT_FILTERS, '?q=x&status=solved')).toBe('');
  });

  test('parse ignores invalid values', () => {
    const parsed = parseFilters('?difficulty=easy,bogus&status=weird&category=Array,1D%20DP');
    expect(parsed.difficulty).toEqual(['Easy']);
    expect(parsed.status).toBe('all');
    expect(parsed.category).toEqual(['Array', '1D DP']);
  });

  test('parse(serialize(x)) returns x', () => {
    const filters = f({ q: 'rob', category: ['1D DP'], tags: ['dp'], status: 'unsolved' });
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });
});

test('hasActiveFilters and collectOptions', () => {
  expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  expect(hasActiveFilters(f({ tags: ['dp'] }))).toBe(true);
  expect(collectOptions(rows)).toEqual({
    categories: ['1D DP', 'Array'],
    tags: ['dp', 'hash-map', 'two-pointers'],
  });
});
