import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Reader, useReader, ReaderProvider } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { ViewerProps } from './types';
import { ViewerError } from './ViewerError';

function EpubReaderInner({ fileUri, onError }: ViewerProps) {
  const { theme } = useReader();
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ViewerError messageKey="error.epub_render_failed" onRetry={() => setHasError(false)} />;
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a56db" />
        </View>
      )}
      <Reader
        src={fileUri}
        fileSystem={useFileSystem}
        onReady={() => setLoading(false)}
        onDisplayError={(error) => {
          const err = new Error(String(error));
          setHasError(true);
          onError?.(err);
        }}
        defaultTheme={theme}
      />
    </View>
  );
}

export function EpubViewer(props: ViewerProps) {
  return (
    <ReaderProvider>
      <EpubReaderInner {...props} />
    </ReaderProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
});
