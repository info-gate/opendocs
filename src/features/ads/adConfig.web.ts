/**
 * adConfig.web — Web 스텁 (TestIds 의존 제거)
 * Web 빌드는 광고 미사용 → placeholder 값만 export.
 */
export const AD_UNITS = {
  banner: 'web-no-banner',
  interstitial: 'web-no-interstitial',
} as const;

export const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000;
export const BANNER_HEIGHT = 60;
