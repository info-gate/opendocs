import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { FileFormat } from '../../features/viewer/types';

interface FormatIconProps {
  format: FileFormat;
  size?: number;
  /** 파일명 — 'txt' 형식에서 실제 확장자 추출용 (예: .mjs, .json 라벨 표시) */
  fileName?: string;
}

const FORMAT_CONFIG: Record<FileFormat, { label: string; bg: string; color: string }> = {
  pdf:     { label: 'PDF', bg: '#fee2e2', color: '#dc2626' },
  hwp:     { label: 'HWP', bg: '#dbeafe', color: '#1d4ed8' },
  hwpx:    { label: 'HWP', bg: '#dbeafe', color: '#1d4ed8' },
  docx:    { label: 'DOC', bg: '#eff6ff', color: '#3b82f6' },
  doc:     { label: 'DOC', bg: '#eff6ff', color: '#3b82f6' },
  pptx:    { label: 'PPT', bg: '#fff7ed', color: '#ea580c' },
  ppt:     { label: 'PPT', bg: '#fff7ed', color: '#ea580c' },
  xlsx:    { label: 'XLS', bg: '#f0fdf4', color: '#16a34a' },
  xls:     { label: 'XLS', bg: '#f0fdf4', color: '#16a34a' },
  epub:    { label: 'EPB', bg: '#f5f3ff', color: '#7c3aed' },
  txt:     { label: 'TXT', bg: '#f9fafb', color: '#6b7280' },
  html:    { label: 'WEB', bg: '#fff1f2', color: '#e11d48' },
  jpg:     { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  jpeg:    { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  png:     { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  heic:    { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  webp:    { label: 'IMG', bg: '#fef3c7', color: '#d97706' },
  unknown: { label: '?',   bg: '#f3f4f6', color: '#9ca3af' },
};

// txt 형식 안에서 확장자별 색상 (코드 vs 일반 텍스트)
const TXT_EXT_OVERRIDE: Record<string, { label: string; bg: string; color: string }> = {
  json: { label: 'JSON', bg: '#fef9c3', color: '#854d0e' },
  jsonc: { label: 'JSON', bg: '#fef9c3', color: '#854d0e' },
  yml:  { label: 'YML',  bg: '#fef9c3', color: '#854d0e' },
  yaml: { label: 'YML',  bg: '#fef9c3', color: '#854d0e' },
  md:   { label: 'MD',   bg: '#f1f5f9', color: '#475569' },
  markdown: { label: 'MD', bg: '#f1f5f9', color: '#475569' },
  csv:  { label: 'CSV',  bg: '#dcfce7', color: '#166534' },
  log:  { label: 'LOG',  bg: '#f1f5f9', color: '#475569' },
  xml:  { label: 'XML',  bg: '#fce7f3', color: '#9d174d' },
  js:   { label: 'JS',   bg: '#fef3c7', color: '#a16207' },
  mjs:  { label: 'JS',   bg: '#fef3c7', color: '#a16207' },
  cjs:  { label: 'JS',   bg: '#fef3c7', color: '#a16207' },
  ts:   { label: 'TS',   bg: '#dbeafe', color: '#1e40af' },
  tsx:  { label: 'TSX',  bg: '#dbeafe', color: '#1e40af' },
  jsx:  { label: 'JSX',  bg: '#fef3c7', color: '#a16207' },
  py:   { label: 'PY',   bg: '#fce7f3', color: '#9d174d' },
  css:  { label: 'CSS',  bg: '#dbeafe', color: '#1e40af' },
  scss: { label: 'CSS',  bg: '#dbeafe', color: '#1e40af' },
  sh:   { label: 'SH',   bg: '#1f2937', color: '#fef3c7' },
  bash: { label: 'SH',   bg: '#1f2937', color: '#fef3c7' },
  sql:  { label: 'SQL',  bg: '#fce7f3', color: '#9d174d' },
};

function pickConfig(format: FileFormat, fileName?: string) {
  if (format === 'txt' && fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (TXT_EXT_OVERRIDE[ext]) return TXT_EXT_OVERRIDE[ext];
  }
  return FORMAT_CONFIG[format] ?? FORMAT_CONFIG.unknown;
}

export function FormatIcon({ format, size = 44, fileName }: FormatIconProps) {
  const config = pickConfig(format, fileName);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, backgroundColor: config.bg, borderRadius: size * 0.2 },
      ]}
    >
      <Text style={[styles.label, { color: config.color, fontSize: size * 0.22 }]} numberOfLines={1}>
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
    letterSpacing: 0.3,
  },
});
