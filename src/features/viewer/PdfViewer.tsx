import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import Pdf from 'react-native-pdf';
import { ViewerProps } from './types';
import { ViewerError } from './ViewerError';
import * as Sentry from '@sentry/react-native';

export function PdfViewer({ fileUri, fileName, onError }: ViewerProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const source = Platform.OS === 'ios'
    ? { uri: fileUri, cache: true }
    : { uri: fileUri, cache: true };

  const handleError = (error: Error | object) => {
    const err = error instanceof Error ? error : new Error(String(error));
    Sentry.captureException(err, {
      tags: { viewer: 'pdf', file_name: fileName },
    });
    setHasError(true);
    setLoading(false);
    onError?.(err);
  };

  if (hasError) {
    return <ViewerError messageKey="error.render_failed" onRetry={() => setHasError(false)} />;
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a56db" />
        </View>
      )}
      <Pdf
        source={source}
        style={styles.pdf}
        onLoadComplete={() => setLoading(false)}
        onError={handleError}
        enablePaging={false}
        horizontal={false}
        fitPolicy={0}
        trustAllCerts={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    zIndex: 10,
  },
});
