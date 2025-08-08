import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../../constants/designTokens';

const GameBoyFrame = ({ children }) => {
  const { height } = useWindowDimensions();

  // Basic scaling to ensure the frame looks good on different screen heights
  const frameHeight = Math.min(height * 0.9, 720); // Max height of 720
  const aspectRatio = 450 / 720;
  const frameWidth = frameHeight * aspectRatio;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.shell.light, colors.shell.dark]}
        style={[
          styles.deviceShell,
          { width: frameWidth, height: frameHeight },
        ]}
      >
        {/* Decorative Header */}
        <View style={styles.deviceHeader}>
          <View style={styles.powerIndicator} />
          <View style={styles.speakerGrille}>
            <View style={[styles.speakerLine, { height: 10 }]} />
            <View style={[styles.speakerLine, { height: 15 }]} />
            <View style={[styles.speakerLine, { height: 20 }]} />
            <View style={[styles.speakerLine, { height: 15 }]} />
            <View style={[styles.speakerLine, { height: 10 }]} />
          </View>
        </View>

        {/* Screen Container */}
        <View style={styles.screenContainer}>
          <View style={styles.screen}>
            {children}
          </View>
        </View>

        {/* Decorative Bottom Area (can be expanded with buttons) */}
        <View style={styles.controlsAreaPlaceholder} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.button.black, // A dark background makes the shell pop
  },
  deviceShell: {
    borderRadius: 25,
    borderWidth: 4,
    borderColor: colors.screen.border,
    padding: spacing.md,
    ...shadows.lg,
    alignItems: 'center',
  },
  deviceHeader: {
    width: '100%',
    height: 60, // Simplified header area
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  powerIndicator: {
    width: 10,
    height: 10,
    backgroundColor: colors.screen.border,
    borderRadius: radius.full,
    shadowColor: colors.screen.border,
    shadowRadius: 10,
    shadowOpacity: 0.8,
    elevation: 10,
  },
  speakerGrille: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  speakerLine: {
    width: 3,
    backgroundColor: colors.button.black,
    borderRadius: 2,
  },
  screenContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.button.black,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 4,
    borderColor: colors.screen.border,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.screen.light,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  controlsAreaPlaceholder: {
    height: 180, // Space for D-pad and buttons
    width: '100%',
  },
});

export default GameBoyFrame;