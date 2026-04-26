/**
 * Demo data for store screenshot mode (web only).
 *
 * 활성화: localStorage.setItem('opendocs_demo', '1') (web only)
 * 사용처: useRecentFiles / useFavorites hook 이 demo 활성화 시 이 데이터 사용
 *
 * 출시 빌드/네이티브에서는 무관 (Platform.OS 가 'web' 이고 flag 가 있어야만).
 */
import { Platform } from 'react-native';
import type { FileRecord } from './database';

const NOW = Date.now();

export const DEMO_RECENT: FileRecord[] = [
  // 최근 파일 (홈 "이어보기" + 파일 탭 표시)
  { id: 1, file_uri: 'demo://1', file_name: '2025_연간보고서.pdf',
    file_format: 'pdf', file_size: 2_450_000,
    last_opened: NOW - 45 * 60_000, open_count: 4, is_favorite: 1, is_deleted: 0 },
  { id: 2, file_uri: 'demo://2', file_name: '프로젝트_기획서_v3.hwp',
    file_format: 'hwp', file_size: 1_120_000,
    last_opened: NOW - 180 * 60_000, open_count: 3, is_favorite: 0, is_deleted: 0 },
  { id: 3, file_uri: 'demo://3', file_name: '거래처_계약서_초안.docx',
    file_format: 'docx', file_size: 430_000,
    last_opened: NOW - 360 * 60_000, open_count: 2, is_favorite: 1, is_deleted: 0 },
  { id: 4, file_uri: 'demo://4', file_name: 'Q3_매출_분석.xlsx',
    file_format: 'xlsx', file_size: 680_000,
    last_opened: NOW - 1_440 * 60_000, open_count: 5, is_favorite: 0, is_deleted: 0 },
  { id: 5, file_uri: 'demo://5', file_name: 'Marketing_Roadmap_2026.pptx',
    file_format: 'pptx', file_size: 4_200_000,
    last_opened: NOW - 2_880 * 60_000, open_count: 1, is_favorite: 0, is_deleted: 0 },
  { id: 6, file_uri: 'demo://6', file_name: '해리포터_3권.epub',
    file_format: 'epub', file_size: 1_850_000,
    last_opened: NOW - 4_320 * 60_000, open_count: 7, is_favorite: 1, is_deleted: 0 },
  { id: 7, file_uri: 'demo://7', file_name: '회의록_2026-04-26.txt',
    file_format: 'txt', file_size: 12_400,
    last_opened: NOW - 5_760 * 60_000, open_count: 1, is_favorite: 0, is_deleted: 0 },
  { id: 8, file_uri: 'demo://8', file_name: 'IMG_3401.jpg',
    file_format: 'jpg', file_size: 3_280_000,
    last_opened: NOW - 10_080 * 60_000, open_count: 2, is_favorite: 0, is_deleted: 0 },
];

export const DEMO_FAVORITES: FileRecord[] = DEMO_RECENT.filter(f => f.is_favorite === 1);

export function isDemoMode(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  return localStorage.getItem('opendocs_demo') === '1';
}
