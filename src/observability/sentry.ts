import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry(): void {
  if (!SENTRY_DSN || __DEV__) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    // 파일 열람 성공률 역산: KPI 92% 이상 (PRD §6)
    // viewer.*.render_failed 이벤트 수 / file_open_attempt 이벤트 수
    beforeSend(event) {
      // 민감 정보 스크럽 (파일 경로에서 파일명만 유지)
      if (event.extra?.file_uri) {
        const uri = String(event.extra.file_uri);
        event.extra.file_uri = uri.split('/').pop() ?? 'unknown';
      }
      return event;
    },
  });
}

export { Sentry };
