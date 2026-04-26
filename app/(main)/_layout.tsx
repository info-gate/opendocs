import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/shared/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function makeIcon(name: IconName, focusedName: IconName) {
  return ({ focused, color }: { focused: boolean; color: string }) => (
    <Ionicons name={focused ? focusedName : name} size={24} color={color} />
  );
}

export default function MainTabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 90 : 76,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 30 : 18,
        },
        tabBarItemStyle: { flex: 1, paddingVertical: 2 },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          includeFontPadding: false,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home.recent_files'),
          tabBarIcon: makeIcon('time-outline', 'time'),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('files.title'),
          tabBarIcon: makeIcon('folder-open-outline', 'folder-open'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: makeIcon('settings-outline', 'settings'),
        }}
      />
    </Tabs>
  );
}
