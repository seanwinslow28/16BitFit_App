import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';
import { ScreenHeader } from '../components/home';

const BattleMenuScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <ScreenHeader title="BATTLE MODE" />
        
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screen.lightestGreen,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  menuButton: {
    width: '100%',
    backgroundColor: Colors.screen.darkGreen,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.screen.darkestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    ...Effects.buttonShadowDefault,
  },
  menuButtonText: {
    ...Typography.bodyText,
    color: Colors.screen.lightestGreen,
    textAlign: 'center',
  },
  menuButtonDisabled: {
    backgroundColor: Colors.shell.darkerGray,
    borderColor: Colors.shell.buttonBlack,
    opacity: 0.6,
  },
  comingSoonText: {
    ...Typography.subLabel,
    color: Colors.screen.lightestGreen,
    marginTop: Spacing.sm,
  },
});

export default BattleMenuScreen;