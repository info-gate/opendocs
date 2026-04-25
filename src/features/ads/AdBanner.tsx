/**
 * AdBanner — 홈·즐겨찾기 화면 하단 배너 광고
 *
 * 오프라인 시: 광고 슬롯을 빈 여백으로 대체 (오류 메시지 없음, PRD §기능3)
 * 뷰어 화면: 이 컴포넌트를 import하지 않음 (ESLint 권고)
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useNetworkStatus } from '../../shared/hooks/useNetworkStatus';
import { AD_UNITS, BANNER_HEIGHT } from './adConfig';
import { trackEvent, EVENTS } from '../../observability/posthog';

export function AdBanner() {
  const isOnline = useNetworkStatus();
  const [adFailed, setAdFailed] = useState(false);

  // 오프라인이거나 광고 로드 실패 시 → 빈 여백 (오류 UI 없음)
  if (!isOnline || adFailed) {
    return <View style={[styles.placeholder, { height: BANNER_HEIGHT }]} />;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => trackEvent(EVENTS.AD_BANNER_IMPRESSION)}
        onAdFailedToLoad={() => setAdFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  placeholder: {
    backgroundColor: 'transparent',
  },
});
