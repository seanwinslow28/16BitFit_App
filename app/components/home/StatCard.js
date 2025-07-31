import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Effects } from '../../constants/DesignSystem';

/**
 * StatCard Component - Displays a single stat with progress bar
 * Matches the Game Boy aesthetic from UI-UX-Revamp document
 */
const StatCard = ({ label, value, maxValue, color }) => {
  const fillWidth = (value / maxValue) * 100;

  return (
    <View style={styles.statCard}>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{`${value}/${maxValue}`}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${fillWidth}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: Colors.screen.darkGreen,
    borderRadius: 8,
    padding: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.screen.darkestGreen,
    marginBottom: Spacing.sm,
    ...Effects.panelShadow,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.bodyText,
    color: Colors.screen.lightestGreen,
    fontSize: Typography.bodyText.fontSize,
  },
  statValue: {
    ...Typography.subLabel,
    color: Colors.screen.lightestGreen,
    fontSize: Typography.subLabel.fontSize,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.screen.darkestGreen,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default StatCard;