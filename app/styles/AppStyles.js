/**
 * 16BitFit App Styles - Design System Implementation
 * Based on Figma specifications with modern mobile-first approach
 */

import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, Effects, Dimensions as DS, DesignUtils } from '../constants/DesignSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Get responsive values based on screen size
const getResponsiveCharacterArena = () => DesignUtils.getCharacterArenaSize(screenWidth);
const responsivePadding = DesignUtils.getResponsiveValue(screenWidth, {
  small: 16,
  standard: 20,
  large: 24,
  tablet: 32,
});

export const createStyles = (fontsLoaded) => {
  const fontFamily = fontsLoaded ? 'PressStart2P_400Regular' : 'monospace';
  
  return StyleSheet.create({
    // MAIN CONTAINER
    container: {
      flex: 1,
      backgroundColor: Colors.shell.lightGray, // Updated to shell light gray
    },

    // MOBILE-FIRST SCREEN LAYOUTS (replacing GameBoy shell)
    screenContainer: {
      flex: 1,
      backgroundColor: Colors.shell.lightGray, // Shell background
    },

    // HEADER SECTION
    headerSection: {
      height: DS.screen.headerHeight,
      backgroundColor: Colors.shell.lightGray,
      borderBottomWidth: 2,
      borderBottomColor: Colors.shell.buttonBlack,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: responsivePadding,
      paddingTop: Spacing.md,
    },

    headerTitle: {
      ...Typography.screenTitle,
      fontFamily,
      color: Colors.shell.buttonBlack,
    },

    settingsIcon: {
      width: 32,
      height: 32,
      backgroundColor: Colors.shell.darkerGray,
      borderWidth: 2,
      borderColor: Colors.shell.buttonBlack,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // CHARACTER ARENA SYSTEM (Green Screen Area)
    characterArenaSection: {
      height: getResponsiveCharacterArena().height,
      backgroundColor: Colors.transparent,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: responsivePadding,
    },

    characterArena: {
      width: getResponsiveCharacterArena().width,
      height: getResponsiveCharacterArena().height,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: Colors.screen.lightestGreen,
      borderWidth: 4,
      borderColor: Colors.shell.screenBorderGreen,
    },

    // Background layers
    backgroundSky: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: getResponsiveCharacterArena().height * 0.6, // 60% of arena height
      backgroundColor: Colors.environment.skyBlue, // Fallback
    },

    backgroundGround: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: getResponsiveCharacterArena().height * 0.4, // 40% of arena height
      backgroundColor: Colors.environment.dojoBrown, // Fallback
    },

    // Scanline overlay
    scanlineOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      ...Effects.scanlineOverlay,
      // Note: Actual scanline pattern would need to be implemented with a custom component
    },

    // Character container
    characterContainer: {
      position: 'absolute',
      width: DS.characterContainer.width,
      height: DS.characterContainer.height,
      top: '50%',
      left: '50%',
      marginTop: -DS.characterContainer.height / 2,
      marginLeft: -DS.characterContainer.width / 2,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // AVATAR AND SPRITE STYLES
    avatarSpriteContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    spriteFrameContainer: {
      width: DS.characterContainer.width,
      height: DS.characterContainer.height,
      justifyContent: 'center',
      alignItems: 'center',
    },

    fullSizeSpriteContainer: {
      width: DS.characterContainer.width * 1.5,
      height: DS.characterContainer.height * 1.5,
      justifyContent: 'center',
      alignItems: 'center',
    },

    avatarSprite: {
      width: DS.characterContainer.width * 0.8,
      height: DS.characterContainer.height * 0.8,
      resizeMode: 'contain',
    },

    fullSizeAvatarSprite: {
      width: DS.characterContainer.width * 1.2,
      height: DS.characterContainer.height * 1.2,
      resizeMode: 'contain',
    },

    evolutionBadge: {
      ...Typography.microCopy,
      fontFamily,
      color: Colors.primary.logoYellow,
      marginTop: Spacing.xs,
      textAlign: 'center',
    },

    visualStateBadge: {
      ...Typography.microCopy,
      fontFamily,
      color: Colors.primary.success,
      textAlign: 'center',
    },

    // QUICK ACTIONS SECTION
    quickActionsSection: {
      backgroundColor: Colors.transparent,
      paddingHorizontal: responsivePadding,
      paddingVertical: Spacing.lg,
    },

    sectionHeader: {
      ...Typography.titleMedium,
      fontFamily,
      color: Colors.primary.logoYellow,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },

    buttonGrid: {
      flexDirection: 'column',
      gap: Spacing.sm,
    },

    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },

    // ACTION BUTTONS (Primary CTA Style)
    actionButton: {
      width: DS.actionButton.width,
      height: DS.actionButton.height,
      backgroundColor: Colors.shell.abButtonMagenta,
      borderWidth: 2,
      borderColor: Colors.shell.buttonBlack,
      borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
      ...Effects.buttonShadowDefault,
    },

    actionButtonPressed: {
      backgroundColor: '#7A1845', // Darker magenta
      transform: [{ translateX: 2 }, { translateY: 2 }, { scale: 0.98 }],
      ...Effects.buttonShadowPressed,
    },

    actionButtonDisabled: {
      backgroundColor: Colors.shell.darkerGray,
      opacity: 0.6,
      shadowOpacity: 0,
      elevation: 0,
    },

    actionButtonIcon: {
      width: DS.actionButton.iconSize,
      height: DS.actionButton.iconSize,
      resizeMode: 'contain',
      tintColor: Colors.shell.lightGray,
    },

    actionButtonText: {
      ...Typography.primaryButtonText,
      fontFamily,
      color: Colors.shell.lightGray,
    },

    actionButtonTextDisabled: {
      color: Colors.shell.buttonBlack,
      opacity: 0.4,
    },

    // STAT BARS (Style Guide Specification)
    statBarContainer: {
      width: DS.statBar.width,
      height: DS.statBar.height,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs * 1.5, // 12px spacing
      marginBottom: Spacing.md,
    },

    statLabel: {
      ...Typography.bodyText,
      fontFamily,
      color: Colors.shell.buttonBlack,
      width: DS.statBar.labelWidth,
      textAlign: 'left',
    },

    statBarBackground: {
      width: DS.statBar.progressWidth,
      height: DS.statBar.height - 8, // 24px height
      backgroundColor: Colors.shell.darkerGray,
      borderWidth: 1,
      borderColor: Colors.shell.buttonBlack,
      position: 'relative',
      overflow: 'hidden',
    },

    statBarFill: {
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: Colors.shell.accentBlue, // Default, override per stat
    },

    statValue: {
      ...Typography.bodyText,
      fontFamily,
      color: Colors.shell.buttonBlack,
      width: DS.statBar.valueWidth,
      textAlign: 'right',
    },

    // NAVIGATION (Style Guide Specification)
    navigation: {
      height: DS.navigation.height,
      backgroundColor: Colors.shell.darkerGray,
      borderTopWidth: 2,
      borderTopColor: Colors.shell.buttonBlack,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.lg, // Extra padding for home indicator
    },

    navButton: {
      width: DS.navigation.itemWidth,
      height: DS.navigation.itemHeight,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      padding: Spacing.xs,
    },

    navButtonActive: {
      backgroundColor: Colors.shell.abButtonMagenta,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: Colors.shell.buttonBlack,
    },

    navButtonSprite: {
      width: 32,
      height: 32,
      resizeMode: 'contain',
      tintColor: Colors.shell.buttonBlack,
    },

    navLabel: {
      ...Typography.subLabel,
      fontFamily,
      color: Colors.shell.buttonBlack,
      textAlign: 'center',
    },

    navLabelActive: {
      color: Colors.shell.lightGray,
    },

    // STAT PANELS (Style Guide Panels)
    statsPanel: {
      backgroundColor: Colors.shell.darkerGray,
      borderWidth: 2,
      borderColor: Colors.shell.buttonBlack,
      padding: Spacing.md, // Consistent 16px internal padding
      margin: responsivePadding,
      borderRadius: 0, // Keep retro aesthetic
      ...Effects.panelShadow,
    },

    statsPanelTitle: {
      ...Typography.panelHeader,
      fontFamily,
      color: Colors.shell.buttonBlack,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },

    // EVOLUTION PANEL
    evolutionPanel: {
      backgroundColor: Colors.environment.dojoBrown,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      padding: responsivePadding,
      margin: responsivePadding,
      borderRadius: 0,
      ...Effects.cardShadow,
    },

    evolutionTitle: {
      ...Typography.titleMedium,
      fontFamily,
      color: Colors.primary.logoYellow,
      marginBottom: Spacing.sm,
    },

    evolutionStage: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.primary.black,
      marginBottom: Spacing.xs,
    },

    evolutionStreak: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.state.health,
    },

    // SPEECH BUBBLE AND AVATAR INFO
    avatarContainer: {
      alignItems: 'center',
      padding: Spacing.md,
    },

    fullSizeAvatarContainer: {
      alignItems: 'center',
      padding: Spacing.lg,
    },

    avatarName: {
      ...Typography.titleMedium,
      fontFamily,
      color: Colors.primary.logoYellow,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },

    speechBubble: {
      backgroundColor: Colors.primary.success,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      borderRadius: 8,
      padding: Spacing.md,
      marginTop: Spacing.md,
      maxWidth: screenWidth - (responsivePadding * 2),
      ...Effects.buttonShadowDefault,
    },

    speechText: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.primary.black,
      textAlign: 'center',
    },

    avatarGear: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },

    gearItem: {
      fontSize: 20,
    },

    // MISSING PANEL STYLES
    weightPanel: {
      backgroundColor: Colors.environment.groundDark,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      padding: responsivePadding,
      margin: responsivePadding,
      borderRadius: 0,
      ...Effects.cardShadow,
    },

    weightContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    weightText: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.primary.black,
    },

    weightStatus: {
      ...Typography.labelSmall,
      fontFamily,
      fontWeight: 'bold',
    },

    achievementPanel: {
      backgroundColor: Colors.environment.dojoBrown,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      padding: responsivePadding,
      margin: responsivePadding,
      borderRadius: 0,
      ...Effects.cardShadow,
    },

    streakText: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.state.health,
      marginVertical: Spacing.xs,
    },

    moodText: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.primary.black,
    },

    evolutionInfo: {
      backgroundColor: Colors.environment.groundDark,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      padding: responsivePadding,
      margin: responsivePadding,
      borderRadius: 0,
      ...Effects.cardShadow,
    },

    evolutionDescription: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.primary.black,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },

    developmentSection: {
      backgroundColor: Colors.environment.nightPurple,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      padding: responsivePadding,
      margin: responsivePadding,
      borderRadius: 0,
      ...Effects.cardShadow,
    },

    testSquareContainer: {
      alignItems: 'center',
      marginTop: Spacing.md,
    },

    testSquareLabel: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.primary.logoYellow,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },

    healthDataPanel: {
      backgroundColor: Colors.environment.groundDark,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      padding: responsivePadding,
      margin: responsivePadding,
      borderRadius: 0,
      ...Effects.cardShadow,
    },

    healthDataText: {
      ...Typography.labelSmall,
      fontFamily,
      color: Colors.primary.black,
      marginVertical: Spacing.xs,
    },

    healthSyncText: {
      ...Typography.microCopy,
      fontFamily,
      color: Colors.primary.success,
      marginTop: Spacing.sm,
      textAlign: 'center',
    },

    syncButton: {
      backgroundColor: Colors.primary.heroBlue,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      padding: Spacing.sm,
      marginTop: Spacing.md,
      alignItems: 'center',
      ...Effects.buttonShadowDefault,
    },

    syncButtonText: {
      ...Typography.buttonText,
      fontFamily,
      color: Colors.primary.black,
    },

    connectButton: {
      backgroundColor: Colors.primary.success,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      padding: Spacing.sm,
      marginTop: Spacing.md,
      alignItems: 'center',
      ...Effects.buttonShadowDefault,
    },

    connectButtonText: {
      ...Typography.buttonText,
      fontFamily,
      color: Colors.primary.black,
    },

    // UTILITY STYLES
    flexCenter: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    flexRow: {
      flexDirection: 'row',
    },

    flexColumn: {
      flexDirection: 'column',
    },

    spacer: {
      flex: 1,
    },

    // RESPONSIVE ADJUSTMENTS
    smallScreen: {
      paddingHorizontal: 16,
    },

    largeScreen: {
      paddingHorizontal: 32,
    },

    // SCREEN CONTENT STYLES
    screenContent: {
      flex: 1,
      backgroundColor: Colors.shell.lightGray,
      padding: 0,
    },

    screenTitle: {
      ...Typography.screenTitle,
      fontFamily,
      color: Colors.shell.buttonBlack,
      textAlign: 'center',
      marginVertical: Spacing.md,
    },

    // LEGACY GAMEBOY STYLES (for backwards compatibility during transition)
    gameBoyShell: {
      flex: 1,
      backgroundColor: Colors.shell.lightGray,
      margin: 0,
      padding: 0,
    },

    screenArea: {
      flex: 1,
      backgroundColor: Colors.screen.lightestGreen,
      position: 'relative',
      borderWidth: 4,
      borderColor: Colors.shell.screenBorderGreen,
    },

    screen: {
      flex: 1,
      backgroundColor: Colors.screen.lightestGreen,
    },

    // Legacy GameBoy Controls (may not be needed in mobile-first design)
    controlsArea: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 20,
      backgroundColor: Colors.primary.black,
    },

    leftControls: {
      alignItems: 'center',
    },

    rightControls: {
      alignItems: 'center',
      gap: 15,
    },

    dPad: {
      alignItems: 'center',
    },

    dPadMiddle: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    dPadButton: {
      backgroundColor: Colors.environment.groundDark,
      borderWidth: 2,
      borderColor: Colors.primary.black,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },

    dPadUp: {
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      marginBottom: -2,
    },

    dPadDown: {
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      marginTop: -2,
    },

    dPadLeft: {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      marginRight: -2,
    },

    dPadRight: {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      marginLeft: -2,
    },

    buttonA: {
      transform: [{ translateX: 20 }],
    },

    buttonB: {
      transform: [{ translateX: -20 }],
    },

    buttonLabel: {
      ...Typography.buttonText,
      fontFamily,
      color: Colors.primary.black,
    },

    bottomControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 40,
      paddingVertical: 15,
      backgroundColor: Colors.primary.black,
    },

    selectButton: {
      backgroundColor: Colors.environment.groundDark,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: Colors.primary.black,
    },

    startButton: {
      backgroundColor: Colors.environment.groundDark,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: Colors.primary.black,
    },

    selectButtonText: {
      ...Typography.microCopy,
      fontFamily,
      color: Colors.primary.black,
    },
  });
};

export default createStyles;