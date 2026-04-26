/**
 * 앱 디자인 토큰 (Nailoop 표준 적용 — primary/accent 시스템)
 * OpenDocs 브랜드: indigo + emerald (신뢰 + 무료 강조)
 */

export const COLORS = {
  // Primary — Indigo (전문성, 신뢰)
  primary:     '#4F46E5',
  primaryDark: '#4338CA',
  primarySoft: '#EEF2FF',

  // Success — Emerald (Forever Free / 100% Local 강조)
  success:     '#059669',
  successSoft: '#ECFDF5',

  // Accent — Amber (CTA 강조 시)
  accent:      '#F59E0B',
  accentDark:  '#D97706',

  // Neutrals
  bg:        '#F9FAFB',
  surface:   '#FFFFFF',
  border:    '#E5E7EB',
  borderSoft:'#F3F4F6',
  textPri:   '#111827',
  textSec:   '#374151',
  textMute:  '#6B7280',
  textDim:   '#9CA3AF',

  // Tabbar
  tabActive:   '#4F46E5',
  tabInactive: '#9CA3AF',
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  fab: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
