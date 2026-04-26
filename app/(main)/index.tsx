/**
 * 홈 — Quick Action Hub (Option A 디자인)
 *
 * 구성:
 * 1. 헤더 (OpenDocs + Forever Free badge)
 * 2. AdBanner
 * 3. 큰 액션 카드: "+ 파일 열기" (메인 CTA)
 * 4. 이어보기: 마지막 본 파일 1개 (있을 때만)
 * 5. 즐겨찾기 가로 스크롤 (있을 때만)
 * 6. 사용 가이드: 3가지 약속 (Forever Free / 100% Local / All Formats) — 항상 표시
 *
 * vs 파일 탭 차별화: 홈 = Action 허브 / 파일 = 전체 history archive
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { confirmAsync } from '../../src/shared/utils/confirm';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRecentFiles } from '../../src/features/recent/useRecentFiles';
import { useFavorites } from '../../src/features/favorites/useFavorites';
import { AdBannerCard } from '../../src/features/ads/AdBannerCard';
import { useInterstitialAd } from '../../src/features/ads/useInterstitialAd';
import { trackEvent, EVENTS } from '../../src/observability/posthog';
import { getFileFormat } from '../../src/shared/utils/fileUtils';
import { formatRelativeTime } from '../../src/shared/utils/dateUtils';
import { FormatIcon } from '../../src/shared/components/FormatIcon';
import type { FileRecord } from '../../src/db/database';
import { AppHeader } from '../../src/shared/components/AppHeader';
import { Toast } from '../../src/shared/components/Toast';
import { COLORS, SHADOWS } from '../../src/shared/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { files, recordOpen } = useRecentFiles();
  const { favorites, removeFavorite } = useFavorites();
  useInterstitialAd();

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const handleLongPressFav = useCallback(
    async (fav: FileRecord) => {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const ok = await confirmAsync({
        title: t('home.unfav_confirm_title'),
        body: t('home.unfav_confirm_body', { fileName: fav.file_name }),
        okText: t('favorites.remove'),
        cancelText: t('settings.common_cancel'),
        destructive: true,
      });
      if (ok) {
        await removeFavorite(fav);
        showToast(t('home.unfav_toast'));
      }
    },
    [t, removeFavorite, showToast],
  );

  const lastOpened = files[0];
  const restFavorites = favorites.slice(0, 8);  // 가로 스크롤 최대 8개

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
      trackEvent(EVENTS.FILE_OPEN_ATTEMPT, { format, source: 'home' });
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

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader badge={{ icon: '🔒', text: '100% Local · Forever Free', variant: 'success' }} />
      <AdBannerCard />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* 1. 메인 액션 카드 */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handlePickFile}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="document-attach" size={32} color="#fff" />
          </View>
          <View style={styles.actionTextBlock}>
            <Text style={styles.actionTitle}>{t('home.action_card_title')}</Text>
            <Text style={styles.actionDesc}>{t('home.action_card_desc')}</Text>
          </View>
        </TouchableOpacity>

        {/* 2. 이어보기 — 마지막 본 파일 1개 */}
        {lastOpened ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📌 {t('home.resume_section')}</Text>
              <Text style={styles.sectionSub}>{t('home.resume_subtitle')}</Text>
            </View>
            <TouchableOpacity
              style={styles.resumeCard}
              onPress={() => handleFilePress(lastOpened)}
              activeOpacity={0.7}
            >
              <FormatIcon format={getFileFormat(lastOpened.file_name)} size={48} fileName={lastOpened.file_name} />
              <View style={styles.resumeText}>
                <Text style={styles.resumeName} numberOfLines={1} ellipsizeMode="middle">
                  {lastOpened.file_name}
                </Text>
                <Text style={styles.resumeMeta}>
                  {formatRelativeTime(lastOpened.last_opened)}
                </Text>
              </View>
              <View style={styles.resumeBtn}>
                <Text style={styles.resumeBtnText}>{t('home.resume_open')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 3. 즐겨찾기 가로 스크롤 */}
        {restFavorites.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ {t('home.favorites_section')}</Text>
              <TouchableOpacity onPress={() => router.push('/favorites')}>
                <Text style={styles.sectionLink}>{t('home.favorites_view_all')} →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favScrollContent}
            >
              {restFavorites.map((fav) => (
                <TouchableOpacity
                  key={fav.id}
                  style={styles.favCard}
                  onPress={() => handleFilePress(fav)}
                  onLongPress={() => handleLongPressFav(fav)}
                  delayLongPress={500}
                  activeOpacity={0.7}
                >
                  <FormatIcon format={getFileFormat(fav.file_name)} size={40} fileName={fav.file_name} />
                  <Text style={styles.favName} numberOfLines={2} ellipsizeMode="middle">
                    {fav.file_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* 4. 사용 가이드 — 항상 표시 (브랜드 약속 강조) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ {t('home.guide_title')}</Text>
          </View>
          <View style={styles.guideGrid}>
            <GuideCard
              icon="🆓"
              iconBg={COLORS.successSoft}
              iconColor={COLORS.success}
              title={t('home.guide_free_title')}
              desc={t('home.guide_free_desc')}
            />
            <GuideCard
              icon="🔒"
              iconBg={COLORS.primarySoft}
              iconColor={COLORS.primary}
              title={t('home.guide_local_title')}
              desc={t('home.guide_local_desc')}
            />
            <GuideCard
              icon="📚"
              iconBg="#fef3c7"
              iconColor="#b45309"
              title={t('home.guide_formats_title')}
              desc={t('home.guide_formats_desc')}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB — 빠른 + 파일 열기 */}
      <TouchableOpacity style={styles.fab} onPress={handlePickFile} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
      <Toast message={toastMessage} visible={toastVisible} />
    </SafeAreaView>
  );
}

function GuideCard({
  icon, iconBg, iconColor, title, desc,
}: {
  icon: string; iconBg: string; iconColor: string; title: string; desc: string;
}) {
  return (
    <View style={styles.guideCard}>
      <View style={[styles.guideIconCircle, { backgroundColor: iconBg }]}>
        <Text style={styles.guideIcon}>{icon}</Text>
      </View>
      <Text style={styles.guideCardTitle}>{title}</Text>
      <Text style={styles.guideCardDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 4, paddingBottom: 80 },

  // 1. 액션 카드 (메인 CTA)
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 18,
    padding: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    gap: 14,
    ...SHADOWS.fab,
  },
  actionIconWrap: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  actionTextBlock: { flex: 1 },
  actionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  actionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 17 },

  // 섹션 공통
  section: { marginBottom: 18, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: 4, marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPri, letterSpacing: -0.2 },
  sectionSub:   { fontSize: 11, color: COLORS.textDim },
  sectionLink:  { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // 2. 이어보기 카드
  resumeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 12, gap: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  resumeText: { flex: 1 },
  resumeName: { fontSize: 14, fontWeight: '700', color: COLORS.textPri },
  resumeMeta: { fontSize: 11, color: COLORS.textDim, marginTop: 3 },
  resumeBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: COLORS.primarySoft, borderRadius: 8,
  },
  resumeBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // 3. 즐겨찾기 가로 스크롤
  favScrollContent: { gap: 10, paddingHorizontal: 4 },
  favCard: {
    width: 110,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  favName: {
    fontSize: 11, fontWeight: '600', color: COLORS.textSec,
    textAlign: 'center', marginTop: 8, lineHeight: 14, height: 28,
  },

  // 4. 가이드 카드 (3개 그리드)
  guideGrid: { flexDirection: 'row', gap: 8 },
  guideCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  guideIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  guideIcon: { fontSize: 22 },
  guideCardTitle: { fontSize: 12, fontWeight: '800', color: COLORS.textPri, marginBottom: 3, textAlign: 'center' },
  guideCardDesc: { fontSize: 10, color: COLORS.textMute, textAlign: 'center', lineHeight: 14 },

  // FAB
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.fab,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32, marginTop: -2 },
});
