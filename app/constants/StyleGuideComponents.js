/**
 * 16BitFit Style Guide Components
 * Implementing the official component library from the style guide
 */

import { Colors, Typography, Spacing, Effects, Animations } from './DesignSystem';

// PRIMARY CTA BUTTON COMPONENT STYLE
export const PrimaryCTAButton = {
  container: {
    backgroundColor: Colors.shell.abButtonMagenta,
    borderWidth: 2,
    borderColor: Colors.shell.buttonBlack,
    borderRadius: 4, // Slightly rounded corners
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Effects.buttonShadowDefault,
  },
  text: {
    ...Typography.primaryButtonText,
    color: Colors.shell.lightGray,
    textAlign: 'center',
  },
  pressed: {
    backgroundColor: '#7A1845', // Darker magenta
    transform: [
      { translateX: 2 }, 
      { translateY: 2 },
      { scale: 0.98 } // Subtle depression
    ],
    ...Effects.buttonShadowPressed,
  },
  disabled: {
    backgroundColor: Colors.shell.darkerGray,
    opacity: 0.6,
  },
  disabledText: {
    color: Colors.shell.buttonBlack,
    opacity: 0.4,
  }
};

// SECONDARY BUTTON COMPONENT STYLE
export const SecondaryButton = {
  container: {
    backgroundColor: Colors.shell.darkerGray,
    borderWidth: 2,
    borderColor: Colors.shell.buttonBlack,
    borderRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Effects.buttonShadowDefault,
  },
  text: {
    ...Typography.bodyText,
    color: Colors.shell.accentBlue,
    textAlign: 'center',
  },
  pressed: {
    backgroundColor: '#454545',
    transform: [
      { translateX: 2 }, 
      { translateY: 2 },
      { scale: 0.98 }
    ],
    ...Effects.buttonShadowPressed,
  },
  disabled: {
    backgroundColor: Colors.shell.darkerGray,
    opacity: 0.4,
  }
};

// STAT BAR COMPONENT STYLE
export const StatBar = {
  container: {
    backgroundColor: Colors.shell.darkerGray,
    borderWidth: 1,
    borderColor: Colors.shell.buttonBlack,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.shell.accentBlue, // Default, override per stat type
  },
  label: {
    ...Typography.bodyText,
    color: Colors.shell.buttonBlack,
    marginRight: Spacing.sm,
  },
  value: {
    ...Typography.bodyText,
    color: Colors.shell.buttonBlack,
    marginLeft: Spacing.sm,
  }
};

// PANEL/CARD COMPONENT STYLE
export const Panel = {
  container: {
    backgroundColor: Colors.shell.darkerGray,
    borderWidth: 2,
    borderColor: Colors.shell.buttonBlack,
    padding: Spacing.md, // 16px consistent internal padding
    ...Effects.panelShadow,
  },
  header: {
    ...Typography.panelHeader,
    color: Colors.shell.buttonBlack,
    marginBottom: Spacing.sm,
  },
  content: {
    ...Typography.bodyText,
    color: Colors.shell.buttonBlack,
  }
};

// SCREEN AREA COMPONENT STYLE (for game content)
export const ScreenArea = {
  container: {
    backgroundColor: Colors.screen.lightestGreen,
    borderWidth: 4,
    borderColor: Colors.shell.screenBorderGreen,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  // For text displayed on the green screen
  screenText: {
    ...Typography.bodyText,
    color: Colors.screen.darkestGreen,
  },
  // Scanline overlay effect
  scanlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...Effects.scanlineOverlay,
    pointerEvents: 'none',
  }
};

// ICON STYLES (1-bit/2-bit pixel art style)
export const Icon = {
  small: {
    width: 16,
    height: 16,
    tintColor: Colors.shell.buttonBlack,
  },
  medium: {
    width: 24,
    height: 24,
    tintColor: Colors.shell.buttonBlack,
  },
  large: {
    width: 32,
    height: 32,
    tintColor: Colors.shell.buttonBlack,
  }
};

// NOTIFICATION/POPUP STYLES
export const Notification = {
  container: {
    backgroundColor: Colors.shell.lightGray,
    borderWidth: 2,
    borderColor: Colors.shell.buttonBlack,
    borderRadius: 4,
    padding: Spacing.md,
    ...Effects.cardShadow,
    marginHorizontal: Spacing.md,
  },
  text: {
    ...Typography.bodyText,
    color: Colors.shell.buttonBlack,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
  }
};

// MAIN SCREEN LAYOUT
export const ScreenLayout = {
  container: {
    flex: 1,
    backgroundColor: Colors.shell.lightGray,
  },
  header: {
    height: 60,
    backgroundColor: Colors.shell.lightGray,
    borderBottomWidth: 2,
    borderBottomColor: Colors.shell.buttonBlack,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...Typography.screenTitle,
    color: Colors.shell.buttonBlack,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  }
};

// CHARACTER DISPLAY AREA (Green Screen)
export const CharacterDisplay = {
  container: {
    ...ScreenArea.container,
    height: 240,
    marginVertical: Spacing.md,
  },
  characterSprite: {
    width: 128,
    height: 128,
    resizeMode: 'contain',
  },
  statText: {
    ...Typography.bodyText,
    color: Colors.screen.darkestGreen,
    fontFamily: 'PressStart2P',
  }
};

// NAVIGATION STYLES
export const Navigation = {
  container: {
    height: 80,
    backgroundColor: Colors.shell.darkerGray,
    borderTopWidth: 2,
    borderTopColor: Colors.shell.buttonBlack,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Spacing.sm, // Safe area padding
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
  },
  itemActive: {
    backgroundColor: Colors.shell.abButtonMagenta,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.shell.buttonBlack,
  },
  label: {
    ...Typography.subLabel,
    color: Colors.shell.buttonBlack,
    marginTop: Spacing.xs,
  },
  labelActive: {
    color: Colors.shell.lightGray,
  }
};

// FORM ELEMENTS
export const FormInput = {
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodyText,
    color: Colors.shell.buttonBlack,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.shell.buttonBlack,
    borderRadius: 4,
    padding: Spacing.sm,
    ...Typography.bodyText,
    color: Colors.shell.buttonBlack,
    height: 44, // Touch target minimum
  },
  inputFocused: {
    borderColor: Colors.shell.accentBlue,
    ...Effects.buttonShadowDefault,
  },
  error: {
    ...Typography.subLabel,
    color: Colors.state.health,
    marginTop: Spacing.xs,
  }
};

// LOADING STATES
export const Loading = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.shell.lightGray,
  },
  spinner: {
    width: 32,
    height: 32,
  },
  text: {
    ...Typography.bodyText,
    color: Colors.shell.buttonBlack,
    marginTop: Spacing.md,
  }
};

// BATTLE SCREEN STYLES (Full Green Screen)
export const BattleScreen = {
  container: {
    flex: 1,
    backgroundColor: Colors.screen.lightestGreen,
  },
  battleArea: {
    flex: 1,
    padding: Spacing.sm,
  },
  characterContainer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
  },
  opponentContainer: {
    position: 'absolute',
    top: 40,
    right: 40,
  },
  uiOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.screen.darkGreen,
    borderTopWidth: 2,
    borderTopColor: Colors.screen.darkestGreen,
    padding: Spacing.md,
  },
  battleText: {
    ...Typography.bodyText,
    color: Colors.screen.lightestGreen,
  }
};

// Named export for backward compatibility
export const StyleGuideComponents = {
  PrimaryCTAButton,
  SecondaryButton,
  StatBar,
  Panel,
  ScreenArea,
  Icon,
  Notification,
  ScreenLayout,
  CharacterDisplay,
  Navigation,
  FormInput,
  Loading,
  BattleScreen,
};

// Default export
export default StyleGuideComponents;