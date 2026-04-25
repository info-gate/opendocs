import { useState, useEffect, useCallback } from 'react';
import { getFavoriteFiles, toggleFavorite, type FileRecord } from '../../db/database';
import { trackEvent, EVENTS } from '../../observability/posthog';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFavoriteFiles();
      setFavorites(data);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return { favorites, loading, refresh, toggle };
}
