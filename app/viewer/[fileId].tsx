/**
 * 뷰어 화면 — 전체화면, 광고 없음 (PRD §기능5: 읽기 몰입 보장)
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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react-native';
import { ViewerFactory } from '../../src/features/viewer/ViewerFactory';
import type { FileFormat } from '../../src/features/viewer/types';
import { trackEvent, EVENTS } from '../../src/observability/posthog';

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 — 파일명 + 닫기 */}
      <View style={styles.header}>
        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
          {fileName}
        </Text>
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  fileName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
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
