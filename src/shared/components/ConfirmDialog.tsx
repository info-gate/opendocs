/**
 * ConfirmDialog — 모든 플랫폼 공통 세련된 확인 다이얼로그
 *
 * 디자인 표준 (Nailoop 수준):
 * - 반투명 backdrop (어두운 오버레이)
 * - 라운드 카드 (border-radius 16) + 큰 그림자
 * - 아이콘 서클 (variant 별 색)
 * - 제목 800 + body regular + 두 버튼
 * - destructive 시 빨간 ok 버튼 / default 시 indigo
 * - backdrop 탭 = cancel
 * - fade-in 애니메이션
 *
 * window.confirm / Alert.alert 모두 대체.
 */
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme';

export type ConfirmOpts = {
  title: string;
  body?: string;
  okText: string;
  cancelText?: string;
  destructive?: boolean;
};

type Props = ConfirmOpts & {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  body,
  okText,
  cancelText,
  destructive,
  onCancel,
  onConfirm,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 8, tension: 100, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.94);
    }
  }, [visible, opacity, scale]);

  const okColor = destructive ? '#dc2626' : COLORS.primary;
  const okBg    = destructive ? '#fee2e2' : COLORS.primarySoft;
  const iconBg  = destructive ? '#fee2e2' : COLORS.primarySoft;
  const iconClr = destructive ? '#dc2626' : COLORS.primary;
  const iconName = destructive ? 'alert-circle-outline' : 'help-circle-outline';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={styles.backdropPressable} onPress={onCancel}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
              <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName as any} size={28} color={iconClr} />
              </View>
              <Text style={styles.title}>{title}</Text>
              {body ? <Text style={styles.body}>{body}</Text> : null}
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnCancelText}>{cancelText ?? '취소'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: okBg }]}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.btnOkText, { color: okColor }]}>{okText}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 25, 0.55)',
  },
  backdropPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.fab,
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 17, fontWeight: '800', color: COLORS.textPri,
    textAlign: 'center', letterSpacing: -0.3, marginBottom: 6,
  },
  body: {
    fontSize: 14, color: COLORS.textMute,
    textAlign: 'center', lineHeight: 20, marginBottom: 18,
  },
  row: {
    flexDirection: 'row', gap: 10, width: '100%', marginTop: 4,
  },
  btn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: COLORS.borderSoft,
  },
  btnCancelText: {
    color: COLORS.textSec, fontSize: 14, fontWeight: '700',
  },
  btnOkText: {
    fontSize: 14, fontWeight: '700',
  },
});
