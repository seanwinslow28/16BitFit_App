/**
 * 16BitFit Design System
 * Based on Figma Implementation Specifications
 * Comprehensive color palette, typography, spacing, and effects
 */

// COLORS - 16BitFit Style Guide Implementation
export const Colors = {
  // UI/Shell Palette - For app interface
  shell: {
    lightGray: '#C4BEBB',     // Primary background (plastic shell)
    darkerGray: '#545454',    // Secondary panels, inactive items
    buttonBlack: '#272929',   // Default text, icons, outlines
    abButtonMagenta: '#9A2257', // Primary CTA color (START, BATTLE, TRAIN)
    screenBorderGreen: '#84D07D', // Border/header for screen areas
    accentBlue: '#5577AA',    // Secondary button text, less important elements
  },

  // Green Screen Palette - Exclusively for simulated screen content
  screen: {
    lightestGreen: '#9BBC0F', // Default screen background
    lightGreen: '#8BAC0F',    // Fills, highlights, secondary details
    darkGreen: '#306230',     // Primary sprite details and UI elements
    darkestGreen: '#0F380F',  // Outlines, shadows, and text on screen
  },

  // Legacy mapping for backward compatibility
  primary: {
    heroBlue: '#5577AA',      // Maps to shell.accentBlue
    logoYellow: '#F7D51D',    // Keep for branding
    black: '#272929',         // Maps to shell.buttonBlack
    success: '#92CC41',       // Keep for positive states
  },

  // Game State Colors (keeping for game mechanics)
  state: {
    health: '#E53935',        // Health bars
    energy: '#FB8C00',        // Energy bars
    characterPink: '#FCB9B2', // Character highlights
    gameboyGreen: '#9BBC0F',  // Maps to screen.lightestGreen
  },

  // Environment Colors (for in-game backgrounds)
  environment: {
    skyBlue: '#5C94FC',       // Battle backgrounds
    skyLight: '#7BA7FC',      // Battle backgrounds
    dojoBrown: '#8B5A3C',     // Arena floors
    groundDark: '#6B5745',    // Arena shadows
    nightPurple: '#2E1A47',   // Night scenes
  },

  // Button States (updated with new palette)
  button: {
    default: '#9A2257',       // shell.abButtonMagenta
    pressed: '#7A1845',       // Darker magenta
    disabled: '#545454',      // shell.darkerGray
    disabledText: '#272929',  // shell.buttonBlack at 40% opacity
    shadowDefault: '#272929', // shell.buttonBlack
  },

  // Utility Colors
  white: '#FFFFFF',
  transparent: 'transparent',
};

// TYPOGRAPHY - 16BitFit Style Guide Typography
export const Typography = {
  fontFamily: 'PressStart2P', // Primary font for all text
  
  // Style Guide Typography Scale
  screenTitle: { // H1
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    color: Colors.shell.buttonBlack,
    fontFamily: 'PressStart2P',
  },
  
  panelHeader: { // H2
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    color: Colors.shell.buttonBlack,
    fontFamily: 'PressStart2P',
  },
  
  primaryButtonText: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    color: Colors.shell.lightGray, // On magenta background
    fontFamily: 'PressStart2P',
  },
  
  bodyText: { // Labels
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: Colors.shell.buttonBlack,
    fontFamily: 'PressStart2P',
  },
  
  subLabel: { // Hints
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
    color: Colors.shell.darkerGray,
    fontFamily: 'PressStart2P',
  },
  
  // Legacy mappings for backward compatibility
  titleExtraLarge: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: Colors.primary.logoYellow,
    fontFamily: 'PressStart2P',
  },
  
  titleLarge: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: Colors.shell.buttonBlack,
    fontFamily: 'PressStart2P',
  },
  
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: Colors.shell.buttonBlack,
    fontFamily: 'PressStart2P',
  },
  
  buttonText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: Colors.shell.buttonBlack,
    fontFamily: 'PressStart2P',
  },
  
  labelSmall: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0,
    textTransform: 'none',
    color: Colors.shell.buttonBlack,
    fontFamily: 'PressStart2P',
  },
  
  microCopy: {
    fontSize: 8,
    lineHeight: 12,
    letterSpacing: 0,
    textTransform: 'none',
    color: Colors.shell.buttonBlack,
    fontFamily: 'PressStart2P',
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

// SHADOWS & EFFECTS - Style Guide Implementation
export const Effects = {
  // Button Shadows (sharp pixel-perfect)
  buttonShadowDefault: {
    shadowColor: Colors.shell.buttonBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0, // Sharp shadow
    elevation: 4, // Android
  },
  
  buttonShadowPressed: {
    shadowColor: Colors.shell.buttonBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0, // Sharp shadow
    elevation: 2, // Android
  },
  
  // Panel/Card shadows
  panelShadow: {
    shadowColor: Colors.shell.buttonBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0, // Sharp retro shadow
    elevation: 2, // Android
  },
  
  cardShadow: {
    shadowColor: Colors.shell.buttonBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 4, // Android
  },
  
  // Scanline overlay for screen areas
  scanlineOverlay: {
    backgroundColor: Colors.shell.buttonBlack,
    opacity: 0.15,
  },
  
  // Screen border effect
  screenBorder: {
    borderWidth: 4,
    borderColor: Colors.shell.screenBorderGreen,
    backgroundColor: Colors.screen.lightestGreen,
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

// ANIMATION TIMINGS - "Fluid Retro" Motion Design
export const Animations = {
  // Button interactions with physics-based feel
  buttonPress: {
    duration: 100,
    easing: 'ease-in-out', // Natural acceleration/deceleration
    scale: 0.95, // Subtle depression
    overshoot: 1.02, // Tiny bounce on release
  },
  
  // Stat bar animations with particle effects
  statBarFill: {
    duration: 400, // 300-400ms as per style guide
    easing: 'ease-out',
    particleDuration: 600,
    flashDuration: 200,
  },
  
  // Screen transitions
  screenTransition: {
    duration: 300,
    easing: 'ease-in-out',
    blurAmount: 10,
    bounceAmount: 0.03, // Subtle settle bounce
  },
  
  // Notification animations
  notification: {
    slideIn: {
      duration: 250,
      easing: 'ease-out',
      overshoot: 1.05,
    },
    slideOut: {
      duration: 200,
      easing: 'ease-in',
    },
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