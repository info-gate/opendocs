/**
 * DocxPptxViewer.web — Web 환경 Office 문서 뷰어
 *
 * 형식별 분기:
 * - DOCX:        mammoth.js → HTML 변환 후 렌더 (이미 dependency)
 * - XLSX/XLS:    SheetJS xlsx → HTML 테이블 변환 후 렌더 (이미 dependency)
 * - PPT/PPTX:    웹 미지원 — "모바일 전용" 안내
 * - DOC/RTF:     mammoth 미지원 (구 포맷) — "모바일 전용" 안내
 */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import type { ViewerProps } from './types';

export function DocxPptxViewer({ fileUri, fileName, format }: ViewerProps) {
  const { t } = useTranslation();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fmt = (format ?? '').toLowerCase();
  const isXlsx = fmt === 'xlsx' || fmt === 'xls';
  const isDocx = fmt === 'docx';
  const isMobileOnly = !isXlsx && !isDocx;  // PPT/PPTX/DOC/RTF

  useEffect(() => {
    if (isMobileOnly) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const blob = await fetch(fileUri).then(r => r.blob());
        const buffer = await blob.arrayBuffer();
        let out = '';
        if (isXlsx) {
          const wb = XLSX.read(buffer, { type: 'array' });
          // 시트 모두 표시 (탭처럼)
          const parts: string[] = [];
          for (const name of wb.SheetNames) {
            const sheetHtml = XLSX.utils.sheet_to_html(wb.Sheets[name], { editable: false });
            parts.push(`<h2 class="sheet-name">${escape(name)}</h2>${sheetHtml}`);
          }
          out = parts.join('<hr/>');
        } else if (isDocx) {
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          out = result.value;
        }
        if (!cancelled) {
          setHtml(out);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || String(e));
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [fileUri, isXlsx, isDocx, isMobileOnly]);

  if (isMobileOnly) {
    return (
      <div style={mobileOnlyStyles.wrap}>
        <div style={mobileOnlyStyles.iconCircle}>📱</div>
        <h2 style={mobileOnlyStyles.title}>{t('error.web_mobile_only_title')}</h2>
        <p style={mobileOnlyStyles.desc}>
          {t('error.web_mobile_only_desc', { format: fmt.toUpperCase() })}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={loadingStyles.wrap}>
        <div style={loadingStyles.spinner} />
        <p style={loadingStyles.text}>{t('error.loading_doc')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={mobileOnlyStyles.wrap}>
        <div style={mobileOnlyStyles.iconCircle}>⚠️</div>
        <h2 style={mobileOnlyStyles.title}>{fileName}</h2>
        <p style={mobileOnlyStyles.desc}>{t('error.render_failed_web')}</p>
        <pre style={errorStyles.detail}>{error}</pre>
      </div>
    );
  }

  return (
    <div style={contentStyles.wrap}>
      <style>{contentStyles.css}</style>
      <div style={contentStyles.inner} dangerouslySetInnerHTML={{ __html: html || '' }} />
    </div>
  );
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as any)[c]);
}

const mobileOnlyStyles = {
  wrap: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    padding: 32, backgroundColor: '#f9fafb', height: '100%',
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#eef2ff', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 48, marginBottom: 24,
  },
  title: { fontSize: 18, fontWeight: 700 as const, color: '#111827', marginBottom: 12, textAlign: 'center' as const },
  desc:  { fontSize: 14, color: '#6b7280', textAlign: 'center' as const, lineHeight: 1.6, maxWidth: 400, whiteSpace: 'pre-line' as const },
};

const loadingStyles = {
  wrap: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center', padding: 40,
    backgroundColor: '#f9fafb', height: '100%',
  },
  spinner: {
    width: 32, height: 32, borderRadius: 16,
    border: '3px solid #e5e7eb', borderTopColor: '#4f46e5',
    animation: 'spin 0.8s linear infinite',
  },
  text: { fontSize: 13, color: '#6b7280', marginTop: 12 },
};

const errorStyles = {
  detail: {
    marginTop: 16, padding: 12, backgroundColor: '#fee', borderRadius: 8,
    fontSize: 11, fontFamily: 'monospace', color: '#991b1b',
    maxWidth: 500, overflow: 'auto' as const,
  },
};

const contentStyles = {
  wrap: { flex: 1, height: '100%', overflow: 'auto' as const, backgroundColor: '#fff' },
  inner: {
    maxWidth: 800, margin: '0 auto', padding: '24px 32px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif',
    fontSize: 14, lineHeight: 1.6, color: '#111827',
  },
  css: `
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: 24px; margin: 16px 0; font-weight: 800; }
    h2 { font-size: 20px; margin: 14px 0; font-weight: 700; }
    .sheet-name { font-size: 16px; color: #4f46e5; margin-top: 24px; padding-bottom: 6px; border-bottom: 2px solid #eef2ff; }
    h3 { font-size: 16px; margin: 12px 0; font-weight: 700; }
    p  { margin: 8px 0; }
    table { border-collapse: collapse; margin: 12px 0; width: 100%; font-size: 13px; }
    th, td { border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) td { background: #fafafa; }
    img { max-width: 100%; height: auto; }
    ul, ol { margin: 8px 0 8px 24px; }
    a { color: #4f46e5; }
    pre, code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    pre { padding: 12px; overflow: auto; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  `,
};
