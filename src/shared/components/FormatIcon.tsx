import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { FileFormat } from '../../features/viewer/types';

interface FormatIconProps {
  format: FileFormat;
  size?: number;
}

const FORMAT_CONFIG: Record<FileFormat, { label: string; bg: string; color: string }> = {
  pdf:     { label: 'PDF',  bg: '#fee2e2', color: '#dc2626' },
  hwp:     { label: 'HWP', bg: '#dbeafe', color: '#1d4ed8' },
  hwpx:    { label: 'HWP', bg: '#dbeafe', color: '#1d4ed8' },
  docx:    { label: 'DOC', bg: '#eff6ff', color: '#3b82f6' },
  pptx:    { label: 'PPT', bg: '#fff7ed', color: '#ea580c' },
  xlsx:    { label: 'XLS', bg: '#f0fdf4', color: '#16a34a' },
  epub:    { label: 'EPB', bg: '#f5f3ff', color: '#7c3aed' },
  txt:     { label: 'TXT', bg: '#f9fafb', color: '#6b7280' },
  jpg:     { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  jpeg:    { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  png:     { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  heic:    { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  webp:    { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  unknown: { label: '?',   bg: '#f3f4f6', color: '#9ca3af' },
};

export function FormatIcon({ format, size = 44 }: FormatIconProps) {
  const config = FORMAT_CONFIG[format] ?? FORMAT_CONFIG.unknown;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, backgroundColor: config.bg, borderRadius: size * 0.2 },
      ]}
    >
      <Text style={[styles.label, { color: config.color, fontSize: size * 0.25 }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
