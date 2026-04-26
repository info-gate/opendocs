/**
 * 뷰어 화면 — 전체화면, 광고 없음 (PRD §기능5: 읽기 몰입 보장)
 *
 * 헤더 액션:
 * - 🖨 인쇄 (expo-print) — iOS/Android 시스템 인쇄 다이얼로그
 * - 📤 공유 (expo-sharing) — Share Sheet (카톡/메일 등)
 * - ✕ 닫기
 *
 * ⚠️ 절대 <AdBanner> 컴포넌트를 이 파일에 import하지 말 것.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Sentry from '@sentry/react-native';
import { ViewerFactory } from '../../src/features/viewer/ViewerFactory';
import type { FileFormat } from '../../src/features/viewer/types';
import { trackEvent, EVENTS } from '../../src/observability/posthog';
import { COLORS } from '../../src/shared/theme';

export default function ViewerScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    fileId: string;
    fileName: string;
    format: string;
  }>();

  const fileUri = decodeURIComponent(params.fileId ?? '');
  const fileName = params.fileName ?? 'Document';
  const format = (params.format ?? 'unknown') as FileFormat;

  const handleError = useCallback(
    (error: Error) => {
      Sentry.captureException(error, {
        tags: { viewer: format, file_name: fileName },
      });
      trackEvent(EVENTS.FILE_OPEN_ERROR, { format, reason: error.message });
    },
    [format, fileName],
  );

  const handleClose = useCallback(() => {
    trackEvent(EVENTS.FILE_OPEN_SUCCESS, { format });
    router.back();
  }, [format]);

  const handlePrint = useCallback(async () => {
    try {
      trackEvent(EVENTS.FILE_PRINT_ATTEMPT, { format });
      // expo-print 는 PDF/HTML 만 직접 인쇄 지원. 다른 형식은 시스템 share sheet 의 "프린트" 옵션 사용 권장.
      if (format === 'pdf' || format === 'html') {
        await Print.printAsync({ uri: fileUri });
        trackEvent(EVENTS.FILE_PRINT_SUCCESS, { format });
      } else {
        // 다른 형식은 share sheet 통해 인쇄 유도
        const ok = await Sharing.isAvailableAsync();
        if (ok) {
          await Sharing.shareAsync(fileUri, {
            dialogTitle: t('viewer.print_via_share'),
          });
        } else {
          Alert.alert(t('viewer.print_unsupported'));
        }
      }
    } catch (e: any) {
      // 사용자가 취소하면 throw 됨 — 에러 알림 X
      if (!String(e?.message).includes('cancel')) {
        Sentry.captureException(e, { tags: { action: 'print', format } });
      }
    }
  }, [fileUri, format, t]);

  const handleShare = useCallback(async () => {
    try {
      trackEvent(EVENTS.FILE_SHARE_ATTEMPT, { format });
      const ok = await Sharing.isAvailableAsync();
      if (!ok) {
        Alert.alert(t('viewer.share_unsupported'));
        return;
      }
      await Sharing.shareAsync(fileUri, {
        dialogTitle: fileName,
      });
      trackEvent(EVENTS.FILE_SHARE_SUCCESS, { format });
    } catch (e: any) {
      if (!String(e?.message).includes('cancel')) {
        Sentry.captureException(e, { tags: { action: 'share', format } });
      }
    }
  }, [fileUri, fileName, format, t]);

  // 웹에선 share/print 버튼 모두 숨김 (브라우저 자체 기능 사용)
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 — 파일명 + 액션 버튼들 + 닫기 */}
      <View style={styles.header}>
        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
          {fileName}
        </Text>
        {!isWeb ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handlePrint}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="print-outline" size={22} color={COLORS.textSec} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleShare}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="share-outline" size={22} color={COLORS.textSec} />
            </TouchableOpacity>
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeText}>{t('viewer.close')}</Text>
        </TouchableOpacity>
      </View>

      {/* 뷰어 — 포맷별 렌더링 (이 화면에는 광고 없음) */}
      <View style={styles.viewerContainer}>
        <ViewerFactory
          fileUri={fileUri}
          fileName={fileName}
          format={format}
          onError={handleError}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  actionRow: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8, borderRadius: 8 },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  closeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  viewerContainer: { flex: 1 },
});
