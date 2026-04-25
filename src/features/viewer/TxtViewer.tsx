import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sentry from '@sentry/react-native';
import { ViewerProps } from './types';
import { ViewerError } from './ViewerError';

export function TxtViewer({ fileUri, fileName, onError }: ViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const text = await FileSystem.readAsStringAsync(fileUri, {
          encoding: 'utf8',
        });
        setContent(text);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Sentry.captureException(err, { tags: { viewer: 'txt', file_name: fileName } });
        setHasError(true);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [fileUri, fileName, onError]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  if (hasError) {
    return <ViewerError messageKey="error.render_failed" onRetry={() => {
      setHasError(false);
      setLoading(true);
    }} />;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.text} selectable>
        {content ?? ''}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  text: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 22,
    color: '#1f2937',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
