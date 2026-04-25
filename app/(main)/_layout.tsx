import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

function TabIcon({ emoji, label }: { emoji: string; label: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function MainTabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a56db',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home.recent_files'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label={t('home.recent_files')} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('favorites.title'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⭐" label={t('favorites.title')} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" label={t('settings.title')} />
          ),
        }}
      />
    </Tabs>
  );
}
