// Root layout — i18n + Sentry 초기화
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// wowpia 표준 — Sentry + PostHog + i18n 초기화
import '../src/i18n';
import { initSentry } from '../src/observability/sentry';
import { initPostHog } from '../src/observability/posthog';

// Sentry DSN 있을 때만 활성화
initSentry();
initPostHog();

SplashScreen.preventAutoHideAsync().catch(() => { /* noop */ });

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => { /* noop */ });
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen
            name="viewer/[fileId]"
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
