import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import {
  getRecentFiles,
  upsertFileHistory,
  markFileDeleted,
  deleteFileHistory,
  type FileRecord,
} from '../../db/database';
import { trackEvent, EVENTS } from '../../observability/posthog';
import { getFileFormat, getFileNameFromUri } from '../../shared/utils/fileUtils';

export function useRecentFiles() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const recent = await getRecentFiles(20);
      // 경로 유효성 체크 — 삭제된 파일 soft-delete
      const validated = await Promise.all(
        recent.map(async (f) => {
          try {
            const info = await FileSystem.getInfoAsync(f.file_uri);
            if (!info.exists) {
              await markFileDeleted(f.file_uri);
              return null;
            }
          } catch {
            return null;
          }
          return f;
        }),
      );
      setFiles(validated.filter(Boolean) as FileRecord[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordOpen = useCallback(
    async (fileUri: string, fileName: string, fileSize?: number) => {
      const format = getFileFormat(fileName);
      trackEvent(EVENTS.FILE_OPEN_ATTEMPT, { format, file_name: fileName });
      await upsertFileHistory(fileUri, fileName, format, fileSize);
      void refresh();
    },
    [refresh],
  );

  const removeFile = useCallback(
    async (id: number) => {
      await deleteFileHistory(id);
      void refresh();
    },
    [refresh],
  );

  return { files, loading, refresh, recordOpen, removeFile };
}
