import { useCallback, useEffect, useState } from 'react';

const getStorageKey = (userId?: string) => `kindred_favorites_${userId || 'guest'}`;

export function useFavorites(userId?: string) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const key = getStorageKey(userId);
    try {
      const stored = window.localStorage.getItem(key);
      setFavoriteIds(stored ? JSON.parse(stored) : []);
    } catch {
      setFavoriteIds([]);
    }
  }, [userId]);

  const updateStorage = useCallback((newIds: string[]) => {
    const key = getStorageKey(userId);
    setFavoriteIds(newIds);
    try {
      window.localStorage.setItem(key, JSON.stringify(newIds));
    } catch {
      // ignore localStorage errors
    }
  }, [userId]);

  const toggleFavorite = useCallback((orphanageId: string) => {
    const nextIds = favoriteIds.includes(orphanageId)
      ? favoriteIds.filter((id) => id !== orphanageId)
      : [...favoriteIds, orphanageId];
    updateStorage(nextIds);
  }, [favoriteIds, updateStorage]);

  const isFavorite = useCallback((orphanageId: string) => favoriteIds.includes(orphanageId), [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite };
}
