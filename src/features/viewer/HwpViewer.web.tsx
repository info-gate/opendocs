/**
 * HwpViewer.web — Web 환경 안내 (모바일 전용)
 * @ohah/hwpjs + WebView 기반 HWP 렌더링은 모바일 앱(Dev Build)에서만 동작.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ViewerProps } from './types';

export function HwpViewer({ format }: ViewerProps) {
  const { t } = useTranslation();
  const fmt = (format ?? 'HWP').toUpperCase();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32, backgroundColor: '#f9fafb', height: '100%',
    }}>
      <div style={{
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#eef2ff', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 48, marginBottom: 24,
      }}>📱</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12, textAlign: 'center' }}>
        {t('error.web_mobile_only_title')}
      </h2>
      <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 1.6, maxWidth: 400, whiteSpace: 'pre-line' }}>
        {t('error.web_mobile_only_desc', { format: fmt })}
      </p>
    </div>
  );
}
