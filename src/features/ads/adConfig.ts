import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const isDev = __DEV__;

export const AD_UNITS = {
  banner: isDev
    ? TestIds.ADAPTIVE_BANNER
    : Platform.select({
        ios:     process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_IOS     ?? TestIds.ADAPTIVE_BANNER,
        android: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID_ANDROID ?? TestIds.ADAPTIVE_BANNER,
        default: TestIds.ADAPTIVE_BANNER,
      })!,

  interstitial: isDev
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios:     process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_IOS     ?? TestIds.INTERSTITIAL,
        android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID_ANDROID ?? TestIds.INTERSTITIAL,
        default: TestIds.INTERSTITIAL,
      })!,
} as const;

// 전면 광고 최소 쿨다운: 3분 (PRD §4 — 연속 광고 이탈 방지)
export const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000;  // 180_000

export const BANNER_HEIGHT = 60;
