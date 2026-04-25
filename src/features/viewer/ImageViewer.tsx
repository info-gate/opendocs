import React, { useState } from 'react';
import { Image, StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { ViewerProps } from './types';
import { ViewerError } from './ViewerError';

export function ImageViewer({ fileUri, fileName, onError }: ViewerProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  if (hasError) {
    return <ViewerError messageKey="error.image_render_failed" onRetry={() => setHasError(false)} />;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      maximumZoomScale={4}
      minimumZoomScale={0.5}
      bouncesZoom
    >
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1a56db" />
        </View>
      )}
      <Image
        source={{ uri: fileUri }}
        style={[
          styles.image,
          dimensions ? { width: dimensions.width, height: dimensions.height } : {},
        ]}
        resizeMode="contain"
        onLoad={(e) => {
          const { width, height } = e.nativeEvent.source;
          setDimensions({ width, height });
          setLoading(false);
        }}
        onError={() => {
          const err = new Error(`Image load failed: ${fileName}`);
          setHasError(true);
          onError?.(err);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#000' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', minHeight: 200 },
  loading: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 200,
  },
});
