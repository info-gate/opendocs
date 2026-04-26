/**
 * AdBanner.web — Web stub (Metro 자동 선택)
 * Web 빌드는 react-native-google-mobile-ads 미지원 → null 반환.
 * 실제 광고는 모바일(iOS/Android) Dev Build 에서만 동작.
 */
import React from 'react';
import { View } from 'react-native';
import { BANNER_HEIGHT } from './adConfig';

export function AdBanner() {
  return <View style={{ height: BANNER_HEIGHT, backgroundColor: 'transparent' }} />;
}
