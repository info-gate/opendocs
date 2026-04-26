import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getFavoriteFiles, toggleFavorite, type FileRecord } from '../../db/database';
import { trackEvent, EVENTS } from '../../observability/posthog';
import { isDemoMode, DEMO_FAVORITES } from '../../db/_demoSeed';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setFavorites(DEMO_FAVORITES);
        return;
      }
      const data = await getFavoriteFiles();
      setFavorites(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // 탭 전환 시 자동 새로고침 — 다른 탭에서 별표 토글된 결과 즉시 반영
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (file: FileRecord) => {
      await toggleFavorite(file.id, file.is_favorite);
      const isNowFavorite = file.is_favorite !== 1;
      trackEvent(isNowFavorite ? EVENTS.FILE_FAVORITED : EVENTS.FILE_UNFAVORITED, {
        format: file.file_format,
      });
      void refresh();
    },
    [refresh],
  );

  const removeFavorite = useCallback(
    async (file: FileRecord) => {
      await toggle(file);
    },
    [toggle],
  );

  return { favorites, loading, refresh, toggle, removeFavorite };
}
