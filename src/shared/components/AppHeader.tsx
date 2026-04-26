/**
 * AppHeader — 모든 탭의 상단 브랜드 헤더 (1라인 레이아웃)
 *
 * 좌측: 📑 로고 박스 + "Open" gray + "Docs" indigo wordmark
 * 우측: badge (trust 또는 context) — 같은 라인 우측 정렬
 * 모든 탭에서 동일 높이.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

type BadgeVariant = 'success' | 'info' | 'amber';

type AppHeaderProps = {
  badge?: { icon: string; text: string; variant?: BadgeVariant };
};

export function AppHeader({ badge }: AppHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.logoBox}>
        <Text style={styles.logoEmoji}>📑</Text>
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.wordmark}>
          <Text style={styles.wordmarkOpen}>Open</Text>
          <Text style={styles.wordmarkDocs}>Docs</Text>
        </Text>
      </View>
      {badge ? (
        <View
          style={[
            styles.badge,
            badge.variant === 'info' && styles.badgeInfo,
            badge.variant === 'amber' && styles.badgeAmber,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              badge.variant === 'info' && styles.badgeTextInfo,
              badge.variant === 'amber' && styles.badgeTextAmber,
            ]}
          >
            {badge.icon} {badge.text}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    minHeight: 60,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  logoEmoji: { fontSize: 20 },
  titleBlock: { flex: 1 },
  wordmark: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  wordmarkOpen: { color: '#1f2937' },
  wordmarkDocs: { color: COLORS.primary },
  badge: {
    flexShrink: 0,
    backgroundColor: COLORS.successSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '50%',
  },
  badgeInfo: { backgroundColor: COLORS.primarySoft },
  badgeAmber: { backgroundColor: '#fef3c7' },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
    letterSpacing: 0.1,
  },
  badgeTextInfo: { color: COLORS.primary },
  badgeTextAmber: { color: '#b45309' },
});
