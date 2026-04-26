/**
 * ConfirmProvider — 앱 전역 ConfirmDialog Provider.
 *
 * 패턴:
 * - app/_layout.tsx 에서 한 번 wrap
 * - 어디서든 confirmAsync({...}) 호출하면 Modal 표시
 * - Promise<boolean> 반환 (true = 확인, false = 취소/dismiss)
 *
 * 내부 동작: _registerConfirm 으로 confirm.ts 의 전역 핸들러를 이 Provider 의 fn 으로 교체.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog, type ConfirmOpts } from './ConfirmDialog';
import { _registerConfirm } from '../utils/confirm';

type PendingState = (ConfirmOpts & { resolve: (v: boolean) => void }) | null;

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingState>(null);
  const pendingRef = useRef<PendingState>(null);
  pendingRef.current = pending;

  const fire = useCallback((opts: ConfirmOpts): Promise<boolean> => {
    return new Promise((resolve) => {
      // 진행 중인 것 있으면 cancel 처리
      if (pendingRef.current) pendingRef.current.resolve(false);
      setPending({ ...opts, resolve });
    });
  }, []);

  useEffect(() => {
    _registerConfirm(fire);
    return () => _registerConfirm(null);
  }, [fire]);

  const handleCancel = () => {
    if (pending) {
      pending.resolve(false);
      setPending(null);
    }
  };
  const handleConfirm = () => {
    if (pending) {
      pending.resolve(true);
      setPending(null);
    }
  };

  return (
    <>
      {children}
      <ConfirmDialog
        visible={!!pending}
        title={pending?.title ?? ''}
        body={pending?.body}
        okText={pending?.okText ?? 'OK'}
        cancelText={pending?.cancelText}
        destructive={pending?.destructive}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}
