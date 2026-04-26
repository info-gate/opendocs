import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from 'expo-router';
import {
  getRecentFiles,
  upsertFileHistory,
  markFileDeleted,
  deleteFileHistory,
  type FileRecord,
} from '../../db/database';
import { trackEvent, EVENTS } from '../../observability/posthog';
import { getFileFormat, getFileNameFromUri } from '../../shared/utils/fileUtils';
import { isDemoMode, DEMO_RECENT } from '../../db/_demoSeed';

export function useRecentFiles() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Store screenshot demo mode (web only, localStorage flag) — bypass DB
      if (isDemoMode()) {
        setFiles(DEMO_RECENT);
        return;
      }
      const recent = await getRecentFiles(50);
      // 경로 유효성 체크 — 삭제된 파일 soft-delete
      // (web 에선 file:// 가 아니라 blob: 인 경우가 많아 getInfoAsync 가 throw → skip)
      const validated = Platform.OS === 'web'
        ? recent  // web: 메모리 스토어이므로 항상 유효
        : await Promise.all(
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

  // 탭 진입 시마다 새로고침 (사용자가 다른 탭에서 파일 열고 돌아왔을 때 자동 반영)
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

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
