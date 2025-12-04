import { useState, useEffect, useCallback } from 'react';
import { getUser, favoritesAPI } from '../utils/api';

// Global favorites cache to avoid redundant API calls
let favoritesCache: Record<string, boolean> = {};
let favoritesCacheUserId: string | null = null;
let favoritesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useFavorites = (itemIds: string[]) => {
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!user || itemIds.length === 0) {
      setIsLoading(false);
      return;
    }

    // Check cache
    const now = Date.now();
    if (
      favoritesCacheUserId === user.id &&
      now - favoritesCacheTime < CACHE_DURATION &&
      Object.keys(favoritesCache).length > 0
    ) {
      // Use cached data for items we have
      const cached: Record<string, boolean> = {};
      itemIds.forEach(id => {
        cached[id] = favoritesCache[id] || false;
      });
      setFavoritesMap(cached);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const batchResult = await favoritesAPI.checkFavoritesBatch(itemIds, user.id);
      
      // Update cache
      favoritesCache = { ...favoritesCache, ...batchResult };
      favoritesCacheUserId = user.id;
      favoritesCacheTime = now;
      
      setFavoritesMap(batchResult);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavoritesMap({});
    } finally {
      setIsLoading(false);
    }
  }, [user, itemIds.join(',')]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const updateFavorite = useCallback((itemId: string, isFavorited: boolean) => {
    setFavoritesMap(prev => ({ ...prev, [itemId]: isFavorited }));
    // Update cache
    favoritesCache[itemId] = isFavorited;
  }, []);

  const clearCache = useCallback(() => {
    favoritesCache = {};
    favoritesCacheUserId = null;
    favoritesCacheTime = 0;
  }, []);

  return { favoritesMap, isLoading, user, updateFavorite, clearCache };
};

