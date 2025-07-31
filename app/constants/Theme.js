/**
 * 16BitFit Theme Configuration
 * Central theme file implementing the Style Guide
 * This file consolidates all theme-related configurations
 */

import { Colors, Typography, Spacing, Effects, Animations } from './DesignSystem';
import StyleGuideComponents from './StyleGuideComponents';

// Font configuration
export const fonts = {
  primary: 'PressStart2P_400Regular',
  fallback: 'monospace',
};

// Screen backgrounds
export const screenBackgrounds = {
  primary: Colors.shell.lightGray,
  secondary: Colors.shell.darkerGray,
  battle: Colors.screen.lightestGreen,
};

// Component themes
export const componentThemes = {
  button: {
    primary: StyleGuideComponents.PrimaryCTAButton,
    secondary: StyleGuideComponents.SecondaryButton,
  },
  panel: StyleGuideComponents.Panel,
  statBar: StyleGuideComponents.StatBar,
  screen: StyleGuideComponents.ScreenArea,
  navigation: StyleGuideComponents.Navigation,
  form: StyleGuideComponents.FormInput,
};

// Status bar configuration
export const statusBarTheme = {
  style: 'dark-content',
  backgroundColor: Colors.shell.lightGray,
};

// Navigation theme
export const navigationTheme = {
  dark: false,
  colors: {
    primary: Colors.shell.abButtonMagenta,
    background: Colors.shell.lightGray,
    card: Colors.shell.darkerGray,
    text: Colors.shell.buttonBlack,
    border: Colors.shell.buttonBlack,
    notification: Colors.shell.abButtonMagenta,
  },
};

// Modal theme
export const modalTheme = {
  backdrop: {
    backgroundColor: Colors.shell.buttonBlack,
    opacity: 0.5,
  },
  container: {
    backgroundColor: Colors.shell.lightGray,
    borderWidth: 2,
    borderColor: Colors.shell.buttonBlack,
    borderRadius: 4,
    ...Effects.cardShadow,
  },
};

// Toast/Notification theme
export const notificationTheme = {
  success: {
    backgroundColor: Colors.primary.success,
    borderColor: Colors.shell.buttonBlack,
    textColor: Colors.shell.buttonBlack,
  },
  error: {
    backgroundColor: Colors.state.health,
    borderColor: Colors.shell.buttonBlack,
    textColor: Colors.white,
  },
  info: {
    backgroundColor: Colors.shell.accentBlue,
    borderColor: Colors.shell.buttonBlack,
    textColor: Colors.white,
  },
};

// Loading states theme
export const loadingTheme = {
  spinner: {
    color: Colors.shell.abButtonMagenta,
    size: 'large',
  },
  text: {
    ...Typography.bodyText,
    color: Colors.shell.buttonBlack,
  },
  background: Colors.shell.lightGray,
};

// Tab bar theme
export const tabBarTheme = {
  activeTintColor: Colors.shell.lightGray,
  inactiveTintColor: Colors.shell.buttonBlack,
  activeBackgroundColor: Colors.shell.abButtonMagenta,
  inactiveBackgroundColor: 'transparent',
  style: {
    backgroundColor: Colors.shell.darkerGray,
    borderTopWidth: 2,
    borderTopColor: Colors.shell.buttonBlack,
    height: 80,
  },
  labelStyle: Typography.subLabel,
};

// Input theme
export const inputTheme = {
  backgroundColor: Colors.white,
  borderColor: Colors.shell.buttonBlack,
  borderWidth: 2,
  borderRadius: 4,
  textColor: Colors.shell.buttonBlack,
  placeholderColor: Colors.shell.darkerGray,
  focusBorderColor: Colors.shell.accentBlue,
  errorBorderColor: Colors.state.health,
  ...Typography.bodyText,
};

// Avatar/Character theme
export const characterTheme = {
  screenBackground: Colors.screen.lightestGreen,
  screenBorder: Colors.shell.screenBorderGreen,
  spriteSize: {
    small: 64,
    medium: 128,
    large: 256,
  },
};

// Battle screen theme
export const battleTheme = {
  background: Colors.screen.lightestGreen,
  ui: {
    background: Colors.screen.darkGreen,
    text: Colors.screen.lightestGreen,
    border: Colors.screen.darkestGreen,
  },
  healthBar: {
    background: Colors.screen.darkGreen,
    fill: Colors.state.health,
    border: Colors.screen.darkestGreen,
  },
};

// Stat colors mapping
export const statColors = {
  health: Colors.state.health,
  energy: Colors.state.energy,
  strength: Colors.primary.logoYellow,
  happiness: Colors.primary.success,
  stamina: Colors.state.energy,
};

// Shadow presets
export const shadows = {
  button: Effects.buttonShadowDefault,
  buttonPressed: Effects.buttonShadowPressed,
  panel: Effects.panelShadow,
  card: Effects.cardShadow,
};

// Animation presets
export const animations = {
  button: Animations.buttonPress,
  statBar: Animations.statBarFill,
  screen: Animations.screenTransition,
  notification: Animations.notification,
  character: Animations.characterTransition,
};

// Responsive helpers
export const responsive = {
  isSmallDevice: (width) => width < 375,
  isMediumDevice: (width) => width >= 375 && width < 414,
  isLargeDevice: (width) => width >= 414,
  
  getFontSize: (base, screenWidth) => {
    if (screenWidth < 375) return base * 0.9;
    if (screenWidth >= 414) return base * 1.1;
    return base;
  },
  
  getSpacing: (base, screenWidth) => {
    if (screenWidth < 375) return base * 0.8;
    if (screenWidth >= 414) return base * 1.2;
    return base;
  },
};

// Export consolidated theme
const Theme = {
  fonts,
  screenBackgrounds,
  componentThemes,
  statusBarTheme,
  navigationTheme,
  modalTheme,
  notificationTheme,
  loadingTheme,
  tabBarTheme,
  inputTheme,
  characterTheme,
  battleTheme,
  statColors,
  shadows,
  animations,
  responsive,
  
  // Direct exports for convenience
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  effects: Effects,
};

export default Theme;