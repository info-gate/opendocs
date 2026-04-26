/**
 * confirmAsync — Cross-platform 세련된 확인 다이얼로그 (Promise 기반)
 *
 * Provider 패턴: ConfirmProvider 가 _registerConfirm 으로 fn 등록.
 * 이후 어디서든 confirmAsync({...}) 호출 가능.
 *
 * Provider 미등록 시 fallback: Alert.alert (mobile) / window.confirm (web 임시)
 */
import { Platform, Alert } from 'react-native';

export type ConfirmOpts = {
  title: string;
  body?: string;
  okText: string;
  cancelText?: string;
  destructive?: boolean;
};

type ConfirmFn = (opts: ConfirmOpts) => Promise<boolean>;

let _confirmFn: ConfirmFn | null = null;

/** ConfirmProvider 가 mount 시 호출 */
export function _registerConfirm(fn: ConfirmFn | null): void {
  _confirmFn = fn;
}

export function confirmAsync(opts: ConfirmOpts): Promise<boolean> {
  if (_confirmFn) return _confirmFn(opts);

  // Fallback: Provider 미등록 (개발 중 안전망)
  if (Platform.OS === 'web') {
    const text = opts.body ? `${opts.title}\n\n${opts.body}` : opts.title;
    // eslint-disable-next-line no-alert
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(text));
  }
  return new Promise((resolve) => {
    Alert.alert(
      opts.title,
      opts.body,
      [
        { text: opts.cancelText ?? '취소', style: 'cancel', onPress: () => resolve(false) },
        {
          text: opts.okText,
          style: opts.destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ],
      { onDismiss: () => resolve(false) },
    );
  });
}
