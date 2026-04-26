/**
 * HtmlViewer.web — Web 환경 HTML 뷰어
 * iframe 으로 브라우저 native 렌더링.
 */
import React from 'react';
import type { ViewerProps } from './types';

export function HtmlViewer({ fileUri, fileName }: ViewerProps) {
  return (
    <iframe
      src={fileUri}
      title={fileName || 'HTML Document'}
      sandbox="allow-same-origin allow-popups"
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: '#fff',
      }}
    />
  );
}
