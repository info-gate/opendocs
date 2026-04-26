/**
 * AdBannerCard — Barolingo 표준 광고 컨테이너
 *
 * AdBanner를 그대로 쓰는 게 아니라 카드 wrapper 로 감싸 디자인 통일:
 * - 라운드 카드 (border-radius 12)
 * - 미세 그림자 (Nailoop 디자인 표준)
 * - 좌우 padding 16, 상하 margin 12
 * - 광고 미로딩/오프라인 시 placeholder 도 동일 카드 스타일 유지 (UI 흔들림 방지)
 *
 * 사용처: 모든 탭의 상단 (홈/즐겨찾기/설정)
 */
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { AdBanner } from './AdBanner';
import { COLORS, SHADOWS } from '../../shared/theme';
import { BANNER_HEIGHT } from './adConfig';

export function AdBannerCard() {
  // 웹 환경에서는 AdMob 미지원 → 빈 카드 노이즈 제거
  if (Platform.OS === 'web') return null;

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <AdBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: COLORS.bg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: BANNER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
});
