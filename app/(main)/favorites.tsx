import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../../src/features/favorites/useFavorites';
import { FileCard } from '../../src/features/recent/FileCard';
import { AdBanner } from '../../src/features/ads/AdBanner';
import { getFileFormat } from '../../src/shared/utils/fileUtils';
import { trackEvent, EVENTS } from '../../src/observability/posthog';
import { upsertFileHistory } from '../../src/db/database';
import type { FileRecord } from '../../src/db/database';

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const { favorites, loading, refresh, toggle } = useFavorites();

  const handleFilePress = (file: FileRecord) => {
    const format = getFileFormat(file.file_name);
    trackEvent(EVENTS.FILE_OPEN_ATTEMPT, { format, source: 'favorites' });
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

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('favorites.title')}</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FileCard
            file={item}
            onPress={handleFilePress}
            onFavoriteToggle={toggle}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>{t('favorites.empty_state')}</Text>
          </View>
        }
        style={styles.list}
        contentContainerStyle={favorites.length === 0 && styles.listEmpty}
        onRefresh={refresh}
        refreshing={loading}
      />

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  list: { flex: 1 },
  listEmpty: { flexGrow: 1 },
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
});
