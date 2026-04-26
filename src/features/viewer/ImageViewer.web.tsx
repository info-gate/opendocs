/**
 * ImageViewer.web — Web 환경 이미지 뷰어
 * react-native-web의 Image는 web에서 nativeEvent.source가 undefined → 원본 ImageViewer 크래시.
 * Web에선 직접 <img> 태그 사용해서 native 브라우저 렌더링.
 */
import React from 'react';
import type { ViewerProps } from './types';

export function ImageViewer({ fileUri, fileName }: ViewerProps) {
  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f1419',
        overflow: 'auto',
      }}
    >
      <img
        src={fileUri}
        alt={fileName || 'Image'}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
