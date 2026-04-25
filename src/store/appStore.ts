import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedLanguage } from '../i18n';

interface AppState {
  // Settings
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;

  // Ad cooldown
  lastInterstitialShown: number;
  setLastInterstitialShown: (ts: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      lastInterstitialShown: 0,
      setLastInterstitialShown: (ts) => set({ lastInterstitialShown: ts }),
    }),
    {
      name: 'opendocs-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        lastInterstitialShown: state.lastInterstitialShown,
      }),
    },
  ),
);
