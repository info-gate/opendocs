import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sentry from '@sentry/react-native';
import { Asset } from 'expo-asset';
import { ViewerProps } from './types';
import { ViewerError } from './ViewerError';

type RenderState = 'loading' | 'loaded' | 'error';

export function HwpViewer({ fileUri, fileName, onError }: ViewerProps) {
  const webViewRef = useRef<WebView>(null);
  const [state, setState] = useState<RenderState>('loading');
  const [htmlUri, setHtmlUri] = useState<string | null>(null);

  // Load the bundled HTML asset
  React.useEffect(() => {
    (async () => {
      try {
        // Use the bundled HTML from assets
        const [asset] = await Asset.loadAsync(
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../../../assets/hwp-renderer/index.html'),
        );
        setHtmlUri(asset.localUri ?? asset.uri);
      } catch {
        setState('error');
      }
    })();
  }, []);

  const sendFile = useCallback(async () => {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });
      webViewRef.current?.postMessage(
        JSON.stringify({ type: 'loadFile', base64, fileName }),
      );
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      Sentry.captureException(err, { tags: { viewer: 'hwp', file_name: fileName } });
      setState('error');
      onError?.(err);
    }
  }, [fileUri, fileName, onError]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type: string; payload: unknown };
        if (data.type === 'ready') {
          sendFile();
        } else if (data.type === 'loaded') {
          setState('loaded');
        } else if (data.type === 'error') {
          Sentry.captureMessage('HWP render error', {
            tags: { viewer: 'hwp', file_name: fileName },
          });
          setState('error');
        }
      } catch {
        // ignore JSON parse errors
      }
    },
    [sendFile, fileName],
  );

  if (state === 'error') {
    return (
      <ViewerError
        messageKey="error.hwp_render_failed"
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
