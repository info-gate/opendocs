import PostHog from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

let _posthog: PostHog | null = null;

export function initPostHog(): PostHog | null {
  if (!POSTHOG_API_KEY) return null;

  _posthog = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    enableSessionReplay: false,  // 문서 내용 녹화 절대 금지 (개인정보 약속)
  });

  return _posthog;
}

export function getPostHog(): PostHog | null {
  return _posthog;
}

// ─── KPI 이벤트 상수 (PRD §6) ─────────────────────────────────────────────────

export const EVENTS = {
  // 파일 열람 성공률 측정 (목표: 92% 이상)
  FILE_OPEN_ATTEMPT:   'file_open_attempt',
  FILE_OPEN_SUCCESS:   'file_open_success',
  FILE_OPEN_ERROR:     'file_open_error',

  // 광고 측정 (PRD §4 전면광고 완료율 50% 목표)
  AD_BANNER_IMPRESSION:        'ad_banner_impression',
  AD_INTERSTITIAL_SHOWN:       'ad_interstitial_shown',
  AD_INTERSTITIAL_COMPLETED:   'ad_interstitial_completed',
  AD_INTERSTITIAL_SKIPPED:     'ad_interstitial_skipped',

  // 파일 관리
  FILE_FAVORITED:   'file_favorited',
  FILE_UNFAVORITED: 'file_unfavorited',

  // 설정
  LANGUAGE_CHANGED: 'language_changed',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export function trackEvent(
  event: EventName,
  properties?: Record<string, string | number | boolean>,
): void {
  _posthog?.capture(event, properties);
}
