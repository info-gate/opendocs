/**
 * useInterstitialAd — 전면 광고 훅
 *
 * 동작 정책 (PRD §기능5):
 *  - 파일 뷰어 종료 → 홈 복귀 시 AppState(background→active) 변화 감지
 *  - 쿨다운 3분 이내 재노출 금지 (INTERSTITIAL_COOLDOWN_MS)
 *  - 뷰어 화면 내에는 절대 표시 안 함 (이 훅은 _layout에서만 사용)
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AD_UNITS, INTERSTITIAL_COOLDOWN_MS } from './adConfig';
import { trackEvent, EVENTS } from '../../observability/posthog';

const LAST_SHOWN_KEY = 'opendocs.ad.interstitial.lastShown';

async function canShowAd(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SHOWN_KEY);
    if (!raw) return true;
    return Date.now() - Number(raw) >= INTERSTITIAL_COOLDOWN_MS;
  } catch {
    return false;  // 스토리지 실패 시 광고 스킵 (UX 블로킹 방지)
  }
}

async function recordShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
  } catch { /* noop */ }
}

export function useInterstitialAd() {
  const adRef = useRef<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(AD_UNITS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const unsubError  = ad.addAdEventListener(AdEventType.ERROR,  () => setLoaded(false));

    ad.load();

    return () => {
      unsubLoaded();
      unsubError();
      adRef.current = null;
    };
  }, []);

  // AppState 변화 감지: background → active (파일 뷰어 닫고 홈 복귀)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (
        appState.current === 'background' &&
        nextState === 'active'
      ) {
        await tryShowAd();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryShowAd = useCallback(async () => {
    const ad = adRef.current;
    if (!ad || !loaded) return;

    const allowed = await canShowAd();
    if (!allowed) return;

    setLoaded(false);
    trackEvent(EVENTS.AD_INTERSTITIAL_SHOWN);

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      unsubClosed();
      trackEvent(EVENTS.AD_INTERSTITIAL_COMPLETED);
      // 다음 광고 preload
      ad.load();
      setLoaded(false);
    });

    try {
      await ad.show();
      await recordShown();
    } catch {
      unsubClosed();
      trackEvent(EVENTS.AD_INTERSTITIAL_SKIPPED);
    }
  }, [loaded]);

  return { loaded, tryShowAd };
}
