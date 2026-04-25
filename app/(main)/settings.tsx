import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_LIST,
  changeAppLanguage,
  type SupportedLanguage,
} from '../../src/i18n';
import { trackEvent, EVENTS } from '../../src/observability/posthog';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await changeAppLanguage(lang);
    trackEvent(EVENTS.LANGUAGE_CHANGED, { language: lang });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Privacy Promise */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>🔒 {t('settings.privacy_title')}</Text>
          <Text style={styles.privacyText}>{t('settings.privacy_note')}</Text>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          {LANGUAGE_LIST.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langRow,
                i18n.language === lang.code && styles.langRowActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text
                style={[
                  styles.langName,
                  i18n.language === lang.code && styles.langNameActive,
                ]}
              >
                {lang.nativeName}
              </Text>
              {i18n.language === lang.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Forever Free note */}
        <View style={styles.section}>
          <Text style={styles.freeText}>{t('settings.forever_free')}</Text>
        </View>

        {/* App info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.app_version')}</Text>
            <Text style={styles.infoValue}>{version}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  scroll: { flex: 1 },
  privacyCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  privacyTitle: { fontSize: 15, fontWeight: '700', color: '#15803d', marginBottom: 6 },
  privacyText: { fontSize: 13, color: '#166534', lineHeight: 20 },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  langRowActive: { backgroundColor: '#eff6ff' },
  langName: { fontSize: 15, color: '#374151' },
  langNameActive: { color: '#1a56db', fontWeight: '600' },
  checkmark: { fontSize: 16, color: '#1a56db', fontWeight: '700' },
  freeText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 16,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 15, color: '#374151' },
  infoValue: { fontSize: 15, color: '#9ca3af' },
});
