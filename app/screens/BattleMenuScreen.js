import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import designTokens from '../constants/designTokens';

// =================================================================================
// MAIN COMPONENT: BattleMenuScreen
// This is the new, revamped Battle Menu Screen.
// =================================================================================
const BattleMenuScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.appTitle}>BATTLE MODE</Text>
      </View>
      
      {/* Menu Options Container */}
      <View style={styles.menuContainer}>
        {/* QUICK BATTLE Button (Active) */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('BattleScreen')}
        >
          <Text style={styles.menuButtonText}>QUICK BATTLE</Text>
        </TouchableOpacity>
        
        {/* BOSS FIGHT Button (Disabled) */}
        <View style={[styles.menuButton, styles.menuButtonDisabled]}>
          <Text style={styles.menuButtonText}>BOSS FIGHT</Text>
          <Text style={styles.comingSoonText}>COMING SOON</Text>
        </View>
      </View>
    </View>
  );
};

// =================================================================================
// STYLESHEET
// All styles now reference our `designTokens.js` file.
// =================================================================================
const { colors, typography, spacing, radius } = designTokens;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.theme.background,
  },
  // Screen Header
  screenHeader: {
    backgroundColor: colors.theme.surfaceDark,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.theme.text,
  },
  appTitle: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.lg.fontSize,
    color: colors.theme.primary,
    textShadowColor: colors.theme.text,
    textShadowOffset: { width: 1, height: 1 },
  },
  // Menu Container
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  // Menu Buttons
  menuButton: {
    width: '100%',
    backgroundColor: colors.theme.surfaceDark,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 2,
    borderColor: colors.theme.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.base.fontSize,
    color: colors.theme.primary,
    textAlign: 'center',
  },
  // Disabled State
  menuButtonDisabled: {
    backgroundColor: colors.shell.dark,
    borderColor: colors.button.black,
    opacity: 0.6,
  },
  comingSoonText: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.sm.fontSize,
    color: colors.theme.primary,
    marginTop: spacing.sm,
  },
});

export default BattleMenuScreen;