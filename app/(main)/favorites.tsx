/**
 * 파일 관리 (File Manager) — 사용자가 열어본 모든 파일 내림차순 목록
 * (라우트 이름은 favorites 유지하되 UI 명칭만 변경)
 *
 * 변경 (2026-04-26 사용자 피드백):
 * - 기존 "즐겨찾기" → "파일 관리" 로 명칭 변경
 * - is_favorite=1 만 보이던 것 → 전체 열어본 파일 표시 (별표는 토글로 유지)
 * - last_opened DESC 정렬 (서버 SQL 에서 이미 처리)
 * - 비어있을 때 CTA = 직접 파일 열기 (홈으로 이동 X)
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import { useRecentFiles } from '../../src/features/recent/useRecentFiles';
import { useFavorites } from '../../src/features/favorites/useFavorites';
import { FileCard } from '../../src/features/recent/FileCard';
import { AdBannerCard } from '../../src/features/ads/AdBannerCard';
import { getFileFormat } from '../../src/shared/utils/fileUtils';
import { trackEvent, EVENTS } from '../../src/observability/posthog';
import { upsertFileHistory, type FileRecord } from '../../src/db/database';
import { AppHeader } from '../../src/shared/components/AppHeader';
import { COLORS, SHADOWS } from '../../src/shared/theme';

export default function FilesScreen() {
  const { t } = useTranslation();
  const { files, loading, refresh, recordOpen, removeFile } = useRecentFiles();
  const { toggle } = useFavorites();

  const handleDelete = useCallback(async (file: FileRecord) => {
    await removeFile(file.id);
  }, [removeFile]);

  const handleFilePress = (file: FileRecord) => {
    const format = getFileFormat(file.file_name);
    trackEvent(EVENTS.FILE_OPEN_ATTEMPT, { format, source: 'files' });
    void upsertFileHistory(file.file_uri, file.file_name, format, file.file_size ?? undefined);
    router.push({
      pathname: '/viewer/[fileId]',
      params: {
        fileId: encodeURIComponent(file.file_uri),
        fileName: file.file_name,
        format,
      },
    });
  };

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const { uri, name, size } = asset;
      if (!uri || !name) return;
      await recordOpen(uri, name, size);
      const format = getFileFormat(name);
      trackEvent(EVENTS.FILE_OPEN_SUCCESS, { format });
      router.push({
        pathname: '/viewer/[fileId]',
        params: {
          fileId: encodeURIComponent(uri),
          fileName: name,
          format,
        },
      });
    } catch (e) {
      trackEvent(EVENTS.FILE_OPEN_ERROR, { reason: String(e) });
    }
  }, [recordOpen]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader badge={{ icon: '📂', text: t('files.title'), variant: 'amber' }} />
      <AdBannerCard />

      <FlatList
        data={files}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FileCard
            file={item}
            onPress={handleFilePress}
            onFavoriteToggle={toggle}
            onDelete={handleDelete}
          />
        )}
        ListHeaderComponent={
          files.length > 0 ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('files.all')}</Text>
              <Text style={styles.sectionSub}>{t('files.sorted_desc')}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <TouchableOpacity
            style={styles.emptyState}
            onPress={handlePickFile}
            activeOpacity={0.7}
          >
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>📂</Text>
            </View>
            <Text style={styles.emptyText}>{t('files.empty_state')}</Text>
            <View style={styles.emptyCta}>
              <Text style={styles.emptyCtaText}>＋ {t('home.pick_file')}</Text>
            </View>
          </TouchableOpacity>
        }
        style={styles.list}
        contentContainerStyle={files.length === 0 && styles.listEmpty}
        onRefresh={refresh}
        refreshing={loading}
      />

      {/* FAB — 파일 열기 (즐겨찾기 → 파일관리 변경 시 일관성 유지) */}
      <TouchableOpacity style={styles.fab} onPress={handlePickFile} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1 },
  listEmpty: { flexGrow: 1 },
  sectionHeader: {
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6,
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.textMute,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  sectionSub: { fontSize: 11, color: COLORS.textDim },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '15%',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#fef3c7',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: 15, color: COLORS.textMute,
    textAlign: 'center', lineHeight: 22, marginBottom: 20,
  },
  emptyCta: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, ...SHADOWS.card,
  },
  emptyCtaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.fab,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32, marginTop: -2 },
});
