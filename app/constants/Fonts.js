/**
 * Font Configuration for 16BitFit
 * Handles Press Start 2P font loading and fallbacks
 */

import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { Platform } from 'react-native';

// Font family constants
export const FONT_FAMILY = {
  primary: 'PressStart2P_400Regular',
  fallback: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Hook for loading fonts
export const useFontLoader = () => {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return { fontsLoaded, onLayoutRootView };
};

// Font utility function
export const getFontFamily = (fontsLoaded) => {
  return fontsLoaded ? FONT_FAMILY.primary : FONT_FAMILY.fallback;
};