/**
 * TxtViewer.web — Web 환경 텍스트 / 코드 뷰어
 * fetch + .text() 로 직접 로드 (expo-file-system 은 native 전용).
 * monospace 폰트 + 파일명 기반 syntax 색상 힌트는 Phase 2.
 */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ViewerProps } from './types';

export function TxtViewer({ fileUri, fileName }: ViewerProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(fileUri);
        const text = await r.text();
        if (!cancelled) setContent(text);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [fileUri]);

  if (error) {
    return (
      <div style={errStyles.wrap}>
        <div style={errStyles.icon}>⚠️</div>
        <h2 style={errStyles.title}>{fileName}</h2>
        <p style={errStyles.desc}>{t('error.render_failed_web')}</p>
        <pre style={errStyles.detail}>{error}</pre>
      </div>
    );
  }

  if (content === null) {
    return (
      <div style={loadStyles.wrap}>
        <div style={loadStyles.spinner} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={contentStyles.wrap}>
      <pre style={contentStyles.pre}>{content}</pre>
    </div>
  );
}

const contentStyles = {
  wrap: {
    flex: 1, height: '100%', overflow: 'auto' as const,
    backgroundColor: '#fff', padding: '16px 20px',
  },
  pre: {
    fontFamily: '"JetBrains Mono", Consolas, Menlo, monospace',
    fontSize: 13, lineHeight: 1.55, color: '#1f2937',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    margin: 0,
  },
};

const loadStyles = {
  wrap: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', backgroundColor: '#f9fafb',
  },
  spinner: {
    width: 32, height: 32, borderRadius: 16,
    border: '3px solid #e5e7eb', borderTopColor: '#4f46e5',
    animation: 'spin 0.8s linear infinite',
  },
};

const errStyles = {
  wrap: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center', padding: 32,
    backgroundColor: '#f9fafb', height: '100%',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 700 as const, color: '#111827', marginBottom: 8 },
  desc: { fontSize: 13, color: '#6b7280', textAlign: 'center' as const },
  detail: {
    marginTop: 16, padding: 12, backgroundColor: '#fee', borderRadius: 8,
    fontSize: 11, fontFamily: 'monospace', color: '#991b1b',
    maxWidth: 500, overflow: 'auto' as const,
  },
};
