/**
 * useWowpiaApps — wowpia.kr/apps.json 에서 포트폴리오를 fetch + cache.
 *
 * 패턴 (autopus 표준 — Phase 11 후보):
 * - 24h 캐시 (AsyncStorage)
 * - 백그라운드 refresh (캐시 즉시 표시 + 백그라운드 fetch)
 * - 오프라인 fallback (cached → bundled local 데이터)
 *
 * 이 패턴은 모든 wowpia 앱에 적용 가능 (cross-promotion 자동 동기화)
 */
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WOWPIA_APPS as LOCAL_FALLBACK, type WowpiaApp } from './wowpiaApps';

const REMOTE_URL = 'https://wowpia.kr/apps.json';
const CACHE_KEY = 'opendocs.wowpia_apps.v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;  // 24h

type RemoteApp = {
  id: string;
  name: string;
  tagEn?: string;
  tagKo?: string;
  iconLetter?: string;
  iconClass?: string;
  status: 'live' | 'beta' | 'review' | 'soon' | 'design' | 'discontinued';
  statusLabel?: string;
  href?: string | null;
  footerText?: string;
};

const CURRENT_APP_ID = 'opendocs';

// id → emoji 매핑 (서버에 emoji 필드 없음 — 로컬 매핑)
const EMOJI_BY_ID: Record<string, string> = {
  barolingo: '🎧',
  nailva: '💅',
  nailoop: '✨',
  canvly: '🎨',
  moodva: '🌱',
  eqquest: '💚',
  pawfriend: '🐾',
  opendocs: '📑',
};

function normalize(remote: RemoteApp): WowpiaApp {
  const fallbackByStatus = (s: string) => ({
    live: 'Live',
    beta: 'Beta',
    review: 'In Review',
    soon: 'Soon',
    design: 'Design',
    discontinued: 'Discontinued',
  }[s] ?? s);
  // status 매핑: design/discontinued 도 적절히 처리
  const status = (['live', 'beta', 'review', 'soon'].includes(remote.status)
    ? remote.status
    : 'soon') as WowpiaApp['status'];
  return {
    id: remote.id,
    name: remote.name,
    tagEn: remote.tagEn ?? '',
    tagKo: remote.tagKo ?? '',
    emoji: EMOJI_BY_ID[remote.id] ?? '✨',
    href: remote.href ?? null,
    status,
    badge: remote.statusLabel ?? fallbackByStatus(remote.status),
  };
}

async function readCache(): Promise<{ apps: WowpiaApp[]; ts: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

async function writeCache(apps: WowpiaApp[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ apps, ts: Date.now() }));
  } catch { /* noop */ }
}

async function fetchRemote(): Promise<WowpiaApp[]> {
  const r = await fetch(REMOTE_URL, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  const list = (data?.apps || []) as RemoteApp[];
  return list
    .filter(a => a.id !== CURRENT_APP_ID)   // 자기 자신은 제외
    .map(normalize);
}

export function useWowpiaApps() {
  const [apps, setApps] = useState<WowpiaApp[]>(LOCAL_FALLBACK);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // 1) 캐시 즉시 표시 (있으면)
      const cached = await readCache();
      if (cached?.apps?.length && mounted) {
        setApps(cached.apps);
        setLoading(false);
      }

      // 2) 캐시 만료 시 또는 캐시 없을 때 → 원격 fetch
      const fresh = !cached || Date.now() - cached.ts > CACHE_TTL_MS;
      if (fresh) {
        try {
          const remote = await fetchRemote();
          if (mounted && remote.length) {
            setApps(remote);
            await writeCache(remote);
          }
        } catch {
          // 오프라인 등 — 캐시 또는 fallback 유지
        } finally {
          if (mounted) setLoading(false);
        }
      } else if (mounted) {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { apps, loading };
}
