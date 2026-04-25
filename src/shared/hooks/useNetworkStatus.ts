import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** 현재 네트워크 연결 상태 반환. 오프라인 시 false. */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // 초기 상태 확인
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  return isOnline;
}
