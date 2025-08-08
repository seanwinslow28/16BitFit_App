import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCharacter } from '../contexts/CharacterContext';
import designTokens from '../constants/designTokens';

// =================================================================================
// SUB-COMPONENT: StatCard (For consistency with the Home Screen)
// =================================================================================
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

// =================================================================================
// MAIN COMPONENT: StatsScreenV2
// =================================================================================
const StatsScreenV2 = () => {
  const { characterStats } = useCharacter();

  return (
    <View style={styles.container}>
      {/* Screen Header from the prototype design */}
      <View style={styles.screenHeader}>
        <Text style={styles.appTitle}>STATS</Text>
      </View>
        
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
  scrollContainer: {
    flex: 1,
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
  // Stats Section
  statsContainer: {
    padding: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.theme.surfaceDark,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.theme.text,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fonts.pixel,
    color: colors.theme.primary,
    fontSize: typography.styles.base.fontSize,
  },
  statValue: {
    fontFamily: typography.fonts.pixel,
    color: colors.theme.primary,
    fontSize: typography.styles.sm.fontSize,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.theme.text,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.theme.text,
  },
  progressFill: {
    height: '100%',
  },
  // Level Section
  levelContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  levelLabel: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.lg.fontSize,
    color: colors.theme.text,
    marginBottom: spacing.sm,
  },
  levelValue: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.title.fontSize,
    color: colors.accent['steely-blue'],
    textShadowColor: colors.theme.text,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    marginBottom: spacing.md,
  },
  expBar: {
    width: '100%',
    backgroundColor: colors.theme.surfaceDark,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.theme.text,
    alignItems: 'center',
  },
  expLabel: {
    fontFamily: typography.fonts.pixel,
    fontSize: typography.styles.base.fontSize,
    color: colors.theme.primary,
  },
});

export default StatsScreenV2;