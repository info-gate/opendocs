import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  Platform,
  Modal,
} from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  LANGUAGE_LIST,
  changeAppLanguage,
  type SupportedLanguage,
} from '../../src/i18n';
import { trackEvent, EVENTS } from '../../src/observability/posthog';
import { AppHeader } from '../../src/shared/components/AppHeader';
import { AdBannerCard } from '../../src/features/ads/AdBannerCard';
import { COLORS } from '../../src/shared/theme';
import { WOWPIA_HUB_URL } from '../../src/shared/wowpiaApps';
import { useWowpiaApps } from '../../src/shared/useWowpiaApps';
import { SUPPORTED_FORMATS, statusLabel } from '../../src/shared/supportedFormats';

const FEEDBACK_EMAIL = 'wowpia0127@gmail.com';
const STORE_URL_IOS     = 'https://apps.apple.com/app/idXXXXXXXXX';
const STORE_URL_ANDROID = 'market://details?id=com.opendocs.app';

// 출시 전 placeholder — 실제 게시 후 외부 URL로 교체
const PRIVACY_TEXT = {
  ko: `OpenDocs 개인정보 처리 방침 (요약)

1. 수집하는 정보: 없음. OpenDocs는 사용자 계정·이메일·전화번호 등 어떤 개인정보도 수집하지 않습니다.

2. 파일 처리: 모든 문서는 사용자 기기 내에서만 처리됩니다. 어떤 파일도 외부 서버로 전송되지 않습니다.

3. 광고: AdMob 배너·전면 광고를 표시합니다. Google이 광고 게재를 위한 비식별 데이터(광고 ID, 기기 정보 등)를 처리할 수 있습니다.

4. 분석 / 에러 트래킹: PostHog (사용 패턴 익명 통계) + Sentry (앱 오류 로그). 개인 식별 정보 미수집.

5. 문의: ${FEEDBACK_EMAIL}

* 정식 페이지는 출시 시 https://info-gate.github.io/opendocs/privacy/ 에서 제공됩니다.`,
  en: `OpenDocs Privacy Policy (Summary)

1. Information we collect: None. OpenDocs does not collect user accounts, emails, phone numbers, or any personal information.

2. File handling: All documents are processed on your device only. No file is ever sent to any external server.

3. Advertising: We show AdMob banner and interstitial ads. Google may process non-identifying data (ad ID, device info) for ad delivery.

4. Analytics / error tracking: PostHog (anonymous usage stats) + Sentry (app error logs). No personally identifiable information collected.

5. Contact: ${FEEDBACK_EMAIL}

* Official page will be available at https://info-gate.github.io/opendocs/privacy/ after release.`,
};

const TERMS_TEXT = {
  ko: `OpenDocs 이용약관 (요약)

1. 본 앱은 무료로 제공되며, 앱 내 결제·구독이 일절 없습니다.

2. 사용자가 OpenDocs로 연 모든 파일에 대한 권리·책임은 사용자에게 있습니다.

3. 광고로 운영비를 충당합니다. 광고 차단 시 앱 기능에 제약은 없으나, 향후 운영 지속에 영향을 줄 수 있습니다.

4. 앱 사용 중 발생한 데이터 손실·기기 이슈에 대해 개발자는 책임지지 않습니다.

5. 본 약관은 사전 통지 후 변경될 수 있습니다.

* 정식 페이지는 출시 시 https://info-gate.github.io/opendocs/terms/ 에서 제공됩니다.`,
  en: `OpenDocs Terms of Service (Summary)

1. This app is provided free of charge. There are no in-app purchases or subscriptions of any kind.

2. The user holds all rights and responsibility for any file opened with OpenDocs.

3. The app is supported by advertising. Blocking ads does not limit functionality, but may affect long-term sustainability.

4. The developer is not liable for any data loss or device issue arising from use of the app.

5. These terms may change with prior notice.

* Official page will be available at https://info-gate.github.io/opendocs/terms/ after release.`,
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const buildNo = Constants.expoConfig?.ios?.buildNumber
    ?? Constants.expoConfig?.android?.versionCode
    ?? '—';

  const [legalModal, setLegalModal] = useState<null | 'privacy' | 'terms'>(null);
  const { apps: wowpiaApps } = useWowpiaApps();
  const lang: 'ko' | 'en' = i18n.language === 'ko' ? 'ko' : 'en';

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await changeAppLanguage(lang);
    trackEvent(EVENTS.LANGUAGE_CHANGED, { language: lang });
  };

  const openLink = async (url: string) => {
    try { await Linking.openURL(url); }
    catch { Alert.alert(t('settings.common_open_link_failed')); }
  };

  const sendFeedback = () => {
    const subject = encodeURIComponent(t('settings.feedback_subject'));
    const body = encodeURIComponent(`\n\n---\nApp Version: ${version}\nPlatform: ${Platform.OS}\n`);
    openLink(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`);
  };

  const rateApp = () => {
    openLink(Platform.OS === 'ios' ? STORE_URL_IOS : STORE_URL_ANDROID);
  };

  const clearCache = () => {
    Alert.alert(
      t('settings.clear_cache_title'),
      t('settings.clear_cache_desc'),
      [
        { text: t('settings.common_cancel'), style: 'cancel' },
        {
          text: t('settings.common_delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const cacheDir = FileSystem.cacheDirectory;
              if (cacheDir) {
                const files = await FileSystem.readDirectoryAsync(cacheDir);
                for (const f of files) {
                  await FileSystem.deleteAsync(`${cacheDir}${f}`, { idempotent: true });
                }
              }
              Alert.alert(t('settings.clear_cache_done'));
            } catch (e) {
              Alert.alert(t('settings.clear_cache_failed'), String(e));
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader badge={{ icon: '⚙', text: t('settings.title'), variant: 'info' }} />
      <AdBannerCard />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* 1. 개인정보 약속 카드 */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <View style={styles.privacyIconCircle}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.privacyTitle}>{t('settings.privacy_title')}</Text>
          </View>
          <Text style={styles.privacyText}>{t('settings.privacy_note')}</Text>
        </View>

        {/* 2. 언어 */}
        <Section title={`🌐  ${t('settings.language_section')}`}>
          {LANGUAGE_LIST.map((lang, idx) => (
            <React.Fragment key={lang.code}>
              {idx > 0 && <View style={styles.rowDivider} />}
              <TouchableOpacity
                style={[styles.row, i18n.language === lang.code && styles.rowActive]}
                onPress={() => handleLanguageChange(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={[styles.rowLabel, i18n.language === lang.code && styles.rowLabelActive]}>
                  {lang.nativeName}
                </Text>
                {i18n.language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </Section>

        {/* 3. 지원 파일 형식 */}
        <Section title={`📁  ${t('settings.formats_section')}`}>
          <View style={styles.formatsHeader}>
            <Text style={styles.formatsDesc}>{t('settings.formats_desc')}</Text>
          </View>
          {SUPPORTED_FORMATS.map((cat, idx) => {
            const status = statusLabel(cat.status, lang);
            return (
              <React.Fragment key={cat.titleEn}>
                {idx > 0 && <View style={styles.rowDivider} />}
                <View style={styles.formatRow}>
                  <Text style={styles.formatEmoji}>{cat.emoji}</Text>
                  <View style={styles.formatBlock}>
                    <View style={styles.formatTitleRow}>
                      <Text style={styles.formatTitle}>
                        {lang === 'ko' ? cat.titleKo : cat.titleEn}
                      </Text>
                      <View style={[styles.statusPill, { backgroundColor: status.color + '22' }]}>
                        <Text style={[styles.statusPillText, { color: status.color }]}>
                          {status.text}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.formatExts}>{cat.exts.join('  ·  ')}</Text>
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </Section>

        {/* 4. 데이터 관리 */}
        <Section title={`📂  ${t('settings.data_section')}`}>
          <TouchableOpacity style={styles.row} onPress={clearCache} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="trash-outline" size={20} color={COLORS.textSec} />
              <Text style={styles.rowLabel}>{t('settings.clear_cache')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
          </TouchableOpacity>
        </Section>

        {/* 5. 피드백 */}
        <Section title={`💌  ${t('settings.feedback_section')}`}>
          <TouchableOpacity style={styles.row} onPress={rateApp} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="star-outline" size={20} color={COLORS.accent} />
              <Text style={styles.rowLabel}>{t('settings.rate_app')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.row} onPress={sendFeedback} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={styles.rowLabel}>{t('settings.send_email')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
          </TouchableOpacity>
        </Section>

        {/* 6. 법적 정보 — in-app modal (404 방지) */}
        <Section title={`📜  ${t('settings.legal_section')}`}>
          <TouchableOpacity style={styles.row} onPress={() => setLegalModal('privacy')} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.textSec} />
              <Text style={styles.rowLabel}>{t('settings.privacy_policy')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.row} onPress={() => setLegalModal('terms')} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.textSec} />
              <Text style={styles.rowLabel}>{t('settings.terms_of_service')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
          </TouchableOpacity>
          <View style={styles.rowDivider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert(t('settings.open_source'), t('settings.open_source_coming'))}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="code-slash-outline" size={20} color={COLORS.textSec} />
              <Text style={styles.rowLabel}>{t('settings.open_source')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />
          </TouchableOpacity>
        </Section>

        {/* 7. wowpia 앱들 — Cross promotion */}
        <Section title={`🌟  ${t('settings.wowpia_section')}`}>
          {wowpiaApps.map((app, idx) => (
            <React.Fragment key={app.id}>
              {idx > 0 && <View style={styles.rowDivider} />}
              <TouchableOpacity
                style={styles.appRow}
                onPress={() => app.href ? openLink(app.href) : null}
                activeOpacity={app.href ? 0.7 : 1}
                disabled={!app.href}
              >
                <Text style={styles.appEmoji}>{app.emoji}</Text>
                <View style={styles.appBlock}>
                  <View style={styles.appTitleRow}>
                    <Text style={styles.appName}>{app.name}</Text>
                    <View style={[styles.appBadge, statusBadge(app.status)]}>
                      <Text style={[styles.appBadgeText, statusBadgeText(app.status)]}>{app.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.appTagline}>
                    {lang === 'ko' ? app.tagKo : app.tagEn}
                  </Text>
                </View>
                {app.href && <Ionicons name="chevron-forward" size={18} color={COLORS.textDim} />}
              </TouchableOpacity>
            </React.Fragment>
          ))}
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.row} onPress={() => openLink(WOWPIA_HUB_URL)} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <Ionicons name="planet-outline" size={20} color={COLORS.primary} />
              <Text style={[styles.rowLabel, { color: COLORS.primary, fontWeight: '700' }]}>
                {t('settings.wowpia_visit_hub')}
              </Text>
            </View>
          </TouchableOpacity>
        </Section>

        {/* 8. 앱 정보 */}
        <Section title={`ℹ️  ${t('settings.info_section')}`}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.app_version')}</Text>
            <Text style={styles.rowValue}>{version} ({buildNo})</Text>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.developer')}</Text>
            <Text style={styles.rowValue}>{t('settings.developer_name')}</Text>
          </View>
        </Section>

        {/* Forever Free 마무리 */}
        <View style={styles.foreverFreeFooter}>
          <Text style={styles.foreverFreeText}>{t('settings.forever_free')}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Legal Modal — privacy / terms in-app 표시 */}
      <Modal
        visible={legalModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLegalModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {legalModal === 'privacy' ? t('settings.privacy_policy') : t('settings.terms_of_service')}
            </Text>
            <TouchableOpacity onPress={() => setLegalModal(null)} hitSlop={8}>
              <Ionicons name="close" size={24} color={COLORS.textSec} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.modalBody}>
              {legalModal === 'privacy' ? PRIVACY_TEXT[lang] : TERMS_TEXT[lang]}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function statusBadge(status: string) {
  switch (status) {
    case 'live':   return { backgroundColor: COLORS.successSoft };
    case 'review': return { backgroundColor: '#fef3c7' };
    case 'beta':   return { backgroundColor: COLORS.primarySoft };
    default:       return { backgroundColor: COLORS.borderSoft };
  }
}
function statusBadgeText(status: string) {
  switch (status) {
    case 'live':   return { color: COLORS.success };
    case 'review': return { color: '#b45309' };
    case 'beta':   return { color: COLORS.primary };
    default:       return { color: COLORS.textMute };
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8 },

  privacyCard: {
    marginHorizontal: 16, marginBottom: 20, padding: 14,
    backgroundColor: COLORS.successSoft, borderRadius: 14,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
  privacyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  privacyIconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  privacyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.success },
  privacyText: { fontSize: 13, color: '#065F46', lineHeight: 19 },

  section: { marginBottom: 18, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.textMute,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 8, paddingHorizontal: 4,
  },
  sectionBody: {
    backgroundColor: COLORS.surface, borderRadius: 12, overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.border,
  },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  rowActive: { backgroundColor: COLORS.primarySoft },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 14, color: COLORS.textSec, fontWeight: '500' },
  rowLabelActive: { color: COLORS.primary, fontWeight: '700' },
  rowValue: { fontSize: 13, color: COLORS.textDim, fontWeight: '500' },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.borderSoft, marginLeft: 14 },

  // Format rows
  formatsHeader: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.borderSoft },
  formatsDesc: { fontSize: 12, color: COLORS.textMute, lineHeight: 18 },
  formatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 12 },
  formatEmoji: { fontSize: 22, width: 28, textAlign: 'center' },
  formatBlock: { flex: 1 },
  formatTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  formatTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPri },
  formatExts: { fontSize: 11, color: COLORS.textMute, marginTop: 2, fontVariant: ['tabular-nums'] },
  statusPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  statusPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },

  // wowpia app rows
  appRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  appEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  appBlock: { flex: 1 },
  appTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  appName: { fontSize: 14, fontWeight: '700', color: COLORS.textPri },
  appBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  appBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  appTagline: { fontSize: 12, color: COLORS.textMute, lineHeight: 16 },

  foreverFreeFooter: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },
  foreverFreeText: { fontSize: 13, color: COLORS.textMute, textAlign: 'center', fontWeight: '600', letterSpacing: 0.2 },

  // Legal modal
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPri },
  modalBody: { fontSize: 14, lineHeight: 22, color: COLORS.textSec },
});
