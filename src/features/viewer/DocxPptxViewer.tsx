import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as Sentry from '@sentry/react-native';
import { ViewerProps } from './types';
import { ViewerError } from './ViewerError';

type RenderState = 'loading' | 'loaded' | 'error';

export function DocxPptxViewer({ fileUri, fileName, format, onError }: ViewerProps) {
  const webViewRef = useRef<WebView>(null);
  const [state, setState] = useState<RenderState>('loading');
  const [htmlUri, setHtmlUri] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [asset] = await Asset.loadAsync(
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../../../assets/docx-renderer/index.html'),
        );
        setHtmlUri(asset.localUri ?? asset.uri);
      } catch {
        setState('error');
      }
    })();
  }, []);

  const sendFile = useCallback(async () => {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });
      const msgType = format === 'xlsx' ? 'loadXlsx' : 'loadDocx';
      webViewRef.current?.postMessage(
        JSON.stringify({ type: msgType, base64, fileName }),
      );
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      Sentry.captureException(err, { tags: { viewer: format, file_name: fileName } });
      setState('error');
      onError?.(err);
    }
  }, [fileUri, fileName, format, onError]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type: string };
        if (data.type === 'ready') {
          sendFile();
        } else if (data.type === 'loaded') {
          setState('loaded');
        } else if (data.type === 'error') {
          Sentry.captureMessage('DocxPptx render error', {
            tags: { viewer: format, file_name: fileName },
          });
          setState('error');
        }
      } catch {
        // ignore
      }
    },
    [sendFile, format, fileName],
  );

  if (state === 'error') {
    return (
      <ViewerError
        messageKey="error.docx_render_failed"
        onRetry={() => setState('loading')}
      />
    );
  }

  if (!htmlUri) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {state === 'loading' && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a56db" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: htmlUri }}
        style={styles.webview}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        originWhitelist={['*']}
        onError={() => setState('error')}
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
});
