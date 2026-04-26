/**
 * HtmlViewer — HTML/HTM 파일 렌더링
 * 모바일: react-native-webview 로 로드
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { ViewerProps } from './types';

export function HtmlViewer({ fileUri }: ViewerProps) {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: fileUri }}
        style={styles.web}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  web: { flex: 1 },
});
