/**
 * 16BitFit Design System
 * Based on Figma Implementation Specifications
 * Comprehensive color palette, typography, spacing, and effects
 */

// COLORS - Complete Figma Color Palette
export const Colors = {
  // Primary Colors
  primary: {
    heroBlue: '#2C76C8',      // RGB: 44, 118, 200
    logoYellow: '#F7D51D',    // RGB: 247, 213, 29
    black: '#0D0D0D',         // RGB: 13, 13, 13
    success: '#92CC41',       // RGB: 146, 204, 65
  },

  // Game State Colors
  state: {
    health: '#E53935',        // RGB: 229, 57, 53
    energy: '#FB8C00',        // RGB: 251, 140, 0
    characterPink: '#FCB9B2', // RGB: 252, 185, 178
    gameboyGreen: '#9BBC0F',  // RGB: 155, 188, 15 (legacy)
  },

  // Environment Colors
  environment: {
    skyBlue: '#5C94FC',       // RGB: 92, 148, 252
    skyLight: '#7BA7FC',      // RGB: 123, 167, 252
    dojoBrown: '#8B5A3C',     // RGB: 139, 90, 60
    groundDark: '#6B5745',    // RGB: 107, 87, 69
    nightPurple: '#2E1A47',   // RGB: 46, 26, 71
  },

  // Button States (derived)
  button: {
    default: '#92CC41',
    pressed: '#7FB032',       // 10% darker success
    disabled: '#6B7280',
    disabledText: '#9CA3AF',
    shadowDefault: '#6B9431', // Success green darkened
  },

  // Utility Colors
  white: '#FFFFFF',
  transparent: 'transparent',
};

// TYPOGRAPHY - Press Start 2P Font System
export const Typography = {
  fontFamily: 'Press Start 2P', // Note: Need to install this font
  
  // Text Styles from Figma
  titleExtraLarge: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: Colors.primary.logoYellow,
    fontFamily: 'Press Start 2P',
  },
  
  titleLarge: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: Colors.primary.black,
    fontFamily: 'Press Start 2P',
  },
  
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: Colors.primary.black,
    fontFamily: 'Press Start 2P',
  },
  
  buttonText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: Colors.primary.black,
    fontFamily: 'Press Start 2P',
  },
  
  labelSmall: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0,
    textTransform: 'none',
    color: Colors.primary.black,
    fontFamily: 'Press Start 2P',
  },
  
  microCopy: {
    fontSize: 8,
    lineHeight: 12,
    letterSpacing: 0,
    textTransform: 'none',
    color: Colors.primary.black,
    fontFamily: 'Press Start 2P',
  },
};

// SPACING - 8px Base Grid System
export const Spacing = {
  // Base unit
  base: 8,
  
  // Grid multipliers
  xs: 4,    // 0.5x
  sm: 8,    // 1x
  md: 16,   // 2x - Component spacing
  lg: 24,   // 3x - Section spacing
  xl: 32,   // 4x
  xxl: 40,  // 5x
  
  // Page margins
  pageMargins: 20,
  
  // Touch targets
  touchTarget: {
    minimum: 44,
    comfortable: 56,
  },
};

// SHADOWS & EFFECTS
export const Effects = {
  // Button Shadows
  buttonShadowDefault: {
    shadowColor: Colors.button.shadowDefault,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, // Android
  },
  
  buttonShadowPressed: {
    shadowColor: Colors.button.shadowDefault,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2, // Android
  },
  
  cardShadow: {
    shadowColor: Colors.primary.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4, // Android
  },
  
  // Scanline overlay
  scanlineOverlay: {
    backgroundColor: Colors.primary.black,
    opacity: 0.15,
  },
};

// COMPONENT DIMENSIONS
export const Dimensions = {
  // Character Arena
  characterArena: {
    width: 400,
    height: 240,
  },
  
  // Character Container
  characterContainer: {
    width: 128,
    height: 128,
  },
  
  // Buttons
  actionButton: {
    width: 140,
    height: 56,
    iconSize: 32,
  },
  
  // Stat Bars
  statBar: {
    width: 280,
    height: 32,
    labelWidth: 60,
    progressWidth: 180,
    valueWidth: 40,
  },
  
  // Navigation
  navigation: {
    height: 88,
    itemWidth: 67,
    itemHeight: 56,
  },
  
  // Screen dimensions (iPhone standard)
  screen: {
    width: 375,
    height: 812,
    statusBarHeight: 44,
    headerHeight: 80,
  },
};

// ANIMATION TIMINGS
export const Animations = {
  // Button press
  buttonPress: {
    duration: 100,
    easing: 'ease-out',
  },
  
  // Stat bar fill
  statBarFill: {
    duration: 800,
    easing: 'ease-out',
  },
  
  // Character state transitions
  characterTransition: {
    anticipation: 100,
    transition: 200,
    hold: 1500,
    return: 200,
  },
  
  // Sprite animations
  spriteAnimation: {
    breathing: {
      duration: 2000,
      frames: [800, 400, 800], // idle → movement → idle
    },
  },
};

// GRADIENTS
export const Gradients = {
  // Character Arena backgrounds
  skyGradient: {
    colors: [Colors.environment.skyBlue, Colors.environment.skyLight],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  
  groundGradient: {
    colors: [Colors.environment.dojoBrown, Colors.environment.groundDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};

// RESPONSIVE BREAKPOINTS
export const Breakpoints = {
  smallPhone: {
    min: 320,
    max: 374,
    padding: 16,
    characterArena: { width: 300, height: 180 },
  },
  
  standardPhone: {
    min: 375,
    max: 414,
    padding: 20,
    characterArena: { width: 375, height: 240 },
  },
  
  largePhone: {
    min: 415,
    max: 768,
    padding: 24,
    characterArena: { width: 415, height: 260 },
  },
  
  tablet: {
    min: 769,
    padding: 32,
    characterArena: { width: 600, height: 380 },
  },
};

// STAT BAR CONFIGURATIONS
export const StatConfigs = {
  health: {
    color: Colors.state.health,
    label: 'HEALTH',
    pattern: 'diagonal-stripes',
  },
  
  energy: {
    color: Colors.state.energy,
    label: 'ENERGY',
    pattern: 'diagonal-stripes',
  },
  
  strength: {
    color: Colors.primary.logoYellow,
    label: 'STRENGTH',
    pattern: 'diagonal-stripes',
  },
  
  happiness: {
    color: Colors.primary.success,
    label: 'HAPPINESS',
    pattern: 'diagonal-stripes',
  },
};

// BUTTON CONFIGURATIONS
export const ButtonConfigs = {
  workout: {
    icon: 'dumbbell',
    label: 'WORKOUT',
  },
  
  food: {
    icon: 'apple',
    label: 'FOOD',
  },
  
  battle: {
    icon: 'sword',
    label: 'BATTLE',
  },
  
  stats: {
    icon: 'chart',
    label: 'STATS',
  },
};

// UTILITY FUNCTIONS
export const DesignUtils = {
  // Get responsive value based on screen width
  getResponsiveValue: (screenWidth, values) => {
    if (screenWidth <= Breakpoints.smallPhone.max) return values.small;
    if (screenWidth <= Breakpoints.standardPhone.max) return values.standard;
    if (screenWidth <= Breakpoints.largePhone.max) return values.large;
    return values.tablet || values.large;
  },
  
  // Get spacing value
  spacing: (multiplier) => Spacing.base * multiplier,
  
  // Get color with opacity
  colorWithOpacity: (color, opacity) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  
  // Get responsive character arena size
  getCharacterArenaSize: (screenWidth) => {
    if (screenWidth <= Breakpoints.smallPhone.max) return Breakpoints.smallPhone.characterArena;
    if (screenWidth <= Breakpoints.standardPhone.max) return Breakpoints.standardPhone.characterArena;
    if (screenWidth <= Breakpoints.largePhone.max) return Breakpoints.largePhone.characterArena;
    return Breakpoints.tablet.characterArena;
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  Effects,
  Dimensions,
  Animations,
  Gradients,
  Breakpoints,
  StatConfigs,
  ButtonConfigs,
  DesignUtils,
};