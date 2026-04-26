/**
 * PdfViewer.web — Web 환경 PDF 뷰어
 * 브라우저 native PDF 렌더러를 iframe으로 사용 (Chrome/Edge/Firefox/Safari 모두 지원)
 *
 * fileUri 가 file:// 또는 blob: URL 이면 iframe 으로 그대로 로드.
 * react-native-web 에서 HTML iframe 직접 사용 가능 (.web.tsx 는 web 전용)
 */
import React from 'react';
import type { ViewerProps } from './types';

export function PdfViewer({ fileUri, fileName }: ViewerProps) {
  return (
    <iframe
      src={fileUri}
      title={fileName || 'PDF Document'}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: '#f3f4f6',
      }}
    />
  );
}
