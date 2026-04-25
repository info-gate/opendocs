// OpenDocs i18n — Expo-localization + i18next
// MVP 지원: ko, en | Phase 2: ja, zh, es, pt
import i18n, { type LanguageDetectorModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;  // Phase 2: 'ja','zh','es','pt' 추가
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageDescriptor {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
}

export const LANGUAGE_LIST: readonly LanguageDescriptor[] = [
  { code: 'ko', nativeName: '한국어', englishName: 'Korean' },
  { code: 'en', nativeName: 'English', englishName: 'English' },
] as const;

const SUPPORTED_SET = new Set<string>(SUPPORTED_LANGUAGES);

function detectDeviceLanguage(): SupportedLanguage {
  const locales = Localization.getLocales();

  // 한국 우선
  const isKorean = locales.some(
    (l) =>
      l.languageCode?.toLowerCase() === 'ko' ||
      l.regionCode?.toUpperCase() === 'KR',
  );
  if (isKorean) return 'ko';

  // 지원 언어 매칭
  for (const l of locales) {
    const code = l.languageCode?.toLowerCase();
    if (code && SUPPORTED_SET.has(code)) return code as SupportedLanguage;
  }

  return 'en';
}

const deviceLanguageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  init: () => { /* noop */ },
  detect: () => detectDeviceLanguage(),
  cacheUserLanguage: () => { /* Phase 2: AsyncStorage 연동 */ },
};

void i18n
  .use(deviceLanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      ja: { translation: ja },
    },
    supportedLngs: [...SUPPORTED_LANGUAGES] as string[],
    fallbackLng: 'en',
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v4',
  });

export async function changeAppLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
}

export default i18n;
