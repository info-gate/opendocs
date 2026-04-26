/**
 * useInterstitialAd.web — Web stub
 * Web 환경에선 전면 광고 미지원 → no-op.
 */
export function useInterstitialAd() {
  return {
    loaded: false,
    tryShowAd: async () => { /* no-op on web */ },
  };
}
