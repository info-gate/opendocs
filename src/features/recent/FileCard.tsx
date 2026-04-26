import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FormatIcon } from '../../shared/components/FormatIcon';
import { getFileFormat, formatFileSize } from '../../shared/utils/fileUtils';
import { formatRelativeTime } from '../../shared/utils/dateUtils';
import { confirmAsync } from '../../shared/utils/confirm';
import { COLORS } from '../../shared/theme';
import type { FileRecord } from '../../db/database';

interface FileCardProps {
  file: FileRecord;
  onPress: (file: FileRecord) => void;
  onFavoriteToggle?: (file: FileRecord) => void;
  onDelete?: (file: FileRecord) => void;
}

export function FileCard({ file, onPress, onFavoriteToggle, onDelete }: FileCardProps) {
  const { t } = useTranslation();
  const format = getFileFormat(file.file_name);

  const handleDelete = async () => {
    if (!onDelete) return;
    const ok = await confirmAsync({
      title: t('files.delete_title'),
      body: file.file_name,
      okText: t('settings.common_delete'),
      cancelText: t('settings.common_cancel'),
      destructive: true,
    });
    if (ok) onDelete(file);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(file)}
      activeOpacity={0.7}
    >
      <FormatIcon format={format} size={44} fileName={file.file_name} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="middle">
          {file.file_name}
        </Text>
        <Text style={styles.meta}>
          {formatRelativeTime(file.last_opened)}
          {file.file_size ? `  ·  ${formatFileSize(file.file_size)}` : ''}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => onFavoriteToggle?.(file)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={file.is_favorite === 1 ? 'star' : 'star-outline'}
            size={20}
            color={file.is_favorite === 1 ? COLORS.accent : '#d1d5db'}
          />
        </TouchableOpacity>
        {onDelete ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color="#d1d5db" />
          </TouchableOpacity>
        ) : null}
      </View>
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
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '500', color: '#111827' },
  meta: { fontSize: 12, color: '#9ca3af' },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
});
