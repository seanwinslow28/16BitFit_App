/**
 * Font Configuration for 16BitFit
 * Handles Press Start 2P font loading and fallbacks
 */

import { Platform } from 'react-native';

// Font family constants
export const FONT_FAMILY = {
  primary: 'PressStart2P',
  fallback: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Font loading configuration
export const FONT_CONFIG = {
  'PressStart2P': require('../assets/fonts/Press_Start_2P/PressStart2P-Regular.ttf'),
};

// Get the font family name with fallback
export const getFontFamily = (loaded = true) => {
  if (loaded) {
    return FONT_FAMILY.primary;
  }
  return FONT_FAMILY.fallback;
};

// Font styles
export const FONT_SIZES = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
};

// Text styles using the retro font
export const getTextStyle = (size = 'medium', loaded = true) => ({
  fontFamily: getFontFamily(loaded),
  fontSize: FONT_SIZES[size] || FONT_SIZES.medium,
  color: '#000000',
});