/**
 * OpenDocs 가 지원하는 파일 형식 목록 — 설정 화면 노출용
 *
 * status:
 * - 'web':        웹 + 모바일 모두 동작
 * - 'mobile':     모바일 앱(iOS/Android Dev Build) 전용 — 웹 미지원
 */

export type FormatStatus = 'web' | 'mobile';

export type FormatCategory = {
  emoji: string;
  titleKo: string;
  titleEn: string;
  exts: string[];
  status: FormatStatus;
};

export const SUPPORTED_FORMATS: FormatCategory[] = [
  {
    emoji: '📄',
    titleKo: 'PDF · TXT',
    titleEn: 'PDF · TXT',
    exts: ['PDF', 'TXT'],
    status: 'web',
  },
  {
    emoji: '🖼',
    titleKo: '이미지',
    titleEn: 'Images',
    exts: ['JPG', 'PNG', 'HEIC', 'WEBP'],
    status: 'web',
  },
  {
    emoji: '📊',
    titleKo: 'Excel',
    titleEn: 'Excel',
    exts: ['XLSX', 'XLS'],
    status: 'web',
  },
  {
    emoji: '📝',
    titleKo: 'Word',
    titleEn: 'Word',
    exts: ['DOCX'],
    status: 'web',
  },
  {
    emoji: '📑',
    titleKo: 'PowerPoint · 구버전 Word',
    titleEn: 'PowerPoint · Legacy Word',
    exts: ['PPT', 'PPTX', 'DOC', 'RTF'],
    status: 'mobile',
  },
  {
    emoji: '🇰🇷',
    titleKo: '한글 (한국 전용)',
    titleEn: 'Hangul (Korean)',
    exts: ['HWP', 'HWPX'],
    status: 'mobile',
  },
  {
    emoji: '📚',
    titleKo: '전자책',
    titleEn: 'eBooks',
    exts: ['EPUB'],
    status: 'mobile',
  },
];

export function statusLabel(s: FormatStatus, locale: 'ko' | 'en' = 'ko'): { text: string; color: string } {
  if (locale === 'en') {
    switch (s) {
      case 'web':    return { text: 'Web + Mobile', color: '#059669' };
      case 'mobile': return { text: 'Mobile only',  color: '#6B7280' };
    }
  }
  switch (s) {
    case 'web':    return { text: '웹·모바일',    color: '#059669' };
    case 'mobile': return { text: '모바일 전용',  color: '#6B7280' };
  }
}
