import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/DesignSystem';

/**
 * ScreenHeader Component - Consistent header across all screens
 * Matches the Game Boy aesthetic from UI-UX-Revamp document
 */
const ScreenHeader = ({ title, rightElement }) => {
  return (
    <View style={styles.screenHeader}>
      <Text style={styles.title}>{title}</Text>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  screenHeader: {
    backgroundColor: Colors.screen.darkGreen,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: Colors.screen.darkestGreen,
  },
  title: {
    ...Typography.panelHeader,
    color: Colors.screen.lightestGreen,
    textShadowColor: Colors.screen.darkestGreen,
    textShadowOffset: { width: 1, height: 1 },
  },
  rightElement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ScreenHeader;