/**
 * wowpia 앱 포트폴리오 — 모든 앱의 설정에 노출되는 cross-promotion 데이터
 * 출처: c:/app/.autopus/apps.yaml + c:/app/wowpia-site/apps.json
 *
 * autopus shared 모듈로 추출 후보 (Phase 11)
 */

export type WowpiaApp = {
  id: string;
  name: string;
  tagEn: string;
  tagKo: string;
  emoji: string;
  href: string | null;
  status: 'live' | 'beta' | 'review' | 'soon';
  badge: string;
};

export const WOWPIA_APPS: WowpiaApp[] = [
  {
    id: 'barolingo',
    name: 'Barolingo',
    tagEn: 'Hear English in order.',
    tagKo: '들리는 순서 그대로 영어를.',
    emoji: '🎧',
    href: 'https://play.google.com/store/apps/details?id=com.barolingo.app',
    status: 'live',
    badge: 'Live',
  },
  {
    id: 'nailva',
    name: 'Nailva',
    tagEn: 'Nail salon CRM.',
    tagKo: '네일샵 사장님 CRM.',
    emoji: '💅',
    href: 'https://play.google.com/store/apps/details?id=com.wowpia.nailshopmanager',
    status: 'live',
    badge: 'Live',
  },
  {
    id: 'nailoop',
    name: 'Nailoop',
    tagEn: 'Show off your nails.',
    tagKo: '내 네일 자랑 + 샵 예약.',
    emoji: '✨',
    href: 'https://info-gate.github.io/nailoop/',
    status: 'review',
    badge: 'In Review',
  },
  {
    id: 'canvly',
    name: 'Canvly.art',
    tagEn: 'CRM for art galleries.',
    tagKo: '갤러리를 위한 CRM.',
    emoji: '🎨',
    href: 'https://canvly.art',
    status: 'live',
    badge: 'Live',
  },
  {
    id: 'moodva',
    name: 'Moodva',
    tagEn: 'Habits that grow you.',
    tagKo: '좋은 습관이 쌓이는 하루.',
    emoji: '🌱',
    href: null,
    status: 'beta',
    badge: 'Beta',
  },
  {
    id: 'eqquest',
    name: 'EQ-Quest',
    tagEn: 'Little quests for emotional skill.',
    tagKo: '감정을 다루는 작은 퀘스트.',
    emoji: '💚',
    href: null,
    status: 'soon',
    badge: 'Soon',
  },
  {
    id: 'pawfriend',
    name: 'Pawfriend',
    tagEn: 'A friend by your pet\'s side.',
    tagKo: '반려동물의 곁을 지키는 친구.',
    emoji: '🐾',
    href: null,
    status: 'soon',
    badge: 'Soon',
  },
];

export const WOWPIA_HUB_URL = 'https://wowpia.kr';
