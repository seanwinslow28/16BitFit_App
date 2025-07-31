import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCharacter } from '../contexts/CharacterContext';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';

// Import our components
import { StatCard, ScreenHeader } from '../components/home';

const StatsScreenV2 = () => {
  const { characterStats } = useCharacter();

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <ScreenHeader title="STATS" />
        
      <ScrollView style={styles.scrollContainer}>
        {/* Main Stats Container */}
        <View style={styles.statsContainer}>
          <StatCard
            label="HEALTH"
            value={characterStats?.health || 100}
            maxValue={100}
            color='#4CAF50' // Green
          />
          <StatCard
            label="STRENGTH"
            value={characterStats?.strength || 50}
            maxValue={100}
            color='#FF6B6B' // Red
          />
          <StatCard
            label="STAMINA"
            value={characterStats?.stamina || 50}
            maxValue={100}
            color='#4ECDC4' // Teal
          />
          <StatCard
            label="SPEED"
            value={characterStats?.speed || 50}
            maxValue={100}
            color='#FFD700' // Yellow
          />
        </View>
          
        {/* Level and Experience Section */}
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>LEVEL</Text>
          <Text style={styles.levelValue}>{characterStats?.level || 1}</Text>
          <View style={styles.expBar}>
            <Text style={styles.expLabel}>EXP: {characterStats?.experience || 0}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screen.lightestGreen,
  },
  scrollContainer: {
    flex: 1,
  },
  statsContainer: {
    padding: Spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: Spacing.md,
  },
  levelContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  levelLabel: {
    ...Typography.panelHeader,
    color: Colors.screen.darkestGreen,
    marginBottom: Spacing.sm,
  },
  levelValue: {
    ...Typography.titleExtraLarge,
    fontSize: 32,
    color: Colors.shell.accentBlue,
    textShadowColor: Colors.screen.darkestGreen,
    textShadowOffset: { width: 2, height: 2 },
    marginBottom: Spacing.md,
  },
  expBar: {
    width: '100%',
    backgroundColor: Colors.screen.darkGreen,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.screen.darkestGreen,
    alignItems: 'center',
    borderRadius: 4,
    ...Effects.panelShadow,
  },
  expLabel: {
    ...Typography.bodyText,
    color: Colors.screen.lightestGreen,
  },
});

export default StatsScreenV2;