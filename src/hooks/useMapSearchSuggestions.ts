import { useMemo } from 'react';
import { fuzzyScore } from '../utils/search';

export function useMapSearchSuggestions<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string,
  limit = 5
): T[] {
  return useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    return items
      .map((item) => ({
        item,
        score: fuzzyScore(getSearchText(item), trimmed),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item }) => item);
  }, [items, query, getSearchText, limit]);
}
