/**
 * 홈 화면 — 최근 파일 목록 + 파일 열기 FAB + 배너 광고
 *
 * ⚠️ 뷰어 화면에서 돌아올 때 AppState background→active 전환으로
 *    useInterstitialAd가 전면 광고를 조건부 트리거함 (_layout에서 처리)
 */
import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { useRecentFiles } from '../../src/features/recent/useRecentFiles';
import { useFavorites } from '../../src/features/favorites/useFavorites';
import { FileCard } from '../../src/features/recent/FileCard';
import { AdBanner } from '../../src/features/ads/AdBanner';
import { useInterstitialAd } from '../../src/features/ads/useInterstitialAd';
import { trackEvent, EVENTS } from '../../src/observability/posthog';
import { getFileFormat } from '../../src/shared/utils/fileUtils';
import type { FileRecord } from '../../src/db/database';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { files, loading, refresh, recordOpen } = useRecentFiles();
  const { toggle: toggleFavorite } = useFavorites();
  // 전면 광고 — AppState 변화 감지 (뷰어 종료 후 홈 복귀 시 쿨다운 체크)
  useInterstitialAd();

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

  const handleFilePress = useCallback(
    (file: FileRecord) => {
      const format = getFileFormat(file.file_name);
      trackEvent(EVENTS.FILE_OPEN_ATTEMPT, { format, source: 'recent' });
      void recordOpen(file.file_uri, file.file_name, file.file_size ?? undefined);
      router.push({
        pathname: '/viewer/[fileId]',
        params: {
          fileId: encodeURIComponent(file.file_uri),
          fileName: file.file_name,
          format,
        },
      });
    },
    [recordOpen],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('home.title')}</Text>
        <View style={styles.privacyBadge}>
          <Text style={styles.privacyText}>🔒 {t('home.privacy_badge')}</Text>
        </View>
      </View>

      {/* File list */}
      <FlatList
        data={files}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FileCard
            file={item}
            onPress={handleFilePress}
            onFavoriteToggle={toggleFavorite}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>{t('home.empty_state')}</Text>
          </View>
        }
        ListHeaderComponent={
          files.length > 0 ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.recent_files')}</Text>
            </View>
          ) : null
        }
        style={styles.list}
        contentContainerStyle={files.length === 0 && styles.listEmpty}
        onRefresh={refresh}
        refreshing={loading}
      />

      {/* FAB — 파일 열기 */}
      <TouchableOpacity style={styles.fab} onPress={handlePickFile} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      {/* 배너 광고 — 하단 고정 (뷰어 화면에는 없음) */}
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  privacyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  privacyText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '500',
  },
  list: { flex: 1 },
  listEmpty: { flexGrow: 1 },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,  // 배너 광고 위
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a56db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
