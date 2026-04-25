import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { FormatIcon } from '../../shared/components/FormatIcon';
import { getFileFormat, formatFileSize } from '../../shared/utils/fileUtils';
import { formatRelativeTime } from '../../shared/utils/dateUtils';
import type { FileRecord } from '../../db/database';

interface FileCardProps {
  file: FileRecord;
  onPress: (file: FileRecord) => void;
  onFavoriteToggle?: (file: FileRecord) => void;
}

export function FileCard({ file, onPress, onFavoriteToggle }: FileCardProps) {
  const format = getFileFormat(file.file_name);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(file)}
      activeOpacity={0.7}
    >
      <FormatIcon format={format} size={44} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="middle">
          {file.file_name}
        </Text>
        <Text style={styles.meta}>
          {formatRelativeTime(file.last_opened)}
          {file.file_size ? `  ·  ${formatFileSize(file.file_size)}` : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.starBtn}
        onPress={() => onFavoriteToggle?.(file)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.star, file.is_favorite === 1 && styles.starActive]}>
          {file.is_favorite === 1 ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  starBtn: {
    padding: 4,
  },
  star: {
    fontSize: 20,
    color: '#d1d5db',
  },
  starActive: {
    color: '#f59e0b',
  },
});
