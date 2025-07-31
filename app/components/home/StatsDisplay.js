import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedStatBar } from '../ui';
import { Colors, Spacing } from '../../constants/DesignSystem';
import { StatConfigs } from '../../constants/DesignSystem';

const StatsDisplay = React.memo(({ characterStats }) => {
  return (
    <View style={styles.container}>
      <AnimatedStatBar 
        label="HEALTH" 
        value={characterStats?.health || 100} 
        maxValue={100} 
        color={StatConfigs.health.color}
        showParticles={true}
      />
      <AnimatedStatBar 
        label="STRENGTH" 
        value={characterStats?.strength || 50} 
        maxValue={100} 
        color={StatConfigs.strength.color}
        showParticles={true}
      />
      <AnimatedStatBar 
        label="ENERGY" 
        value={characterStats?.stamina || 50} 
        maxValue={100} 
        color={StatConfigs.energy.color}
        showParticles={true}
      />
      <AnimatedStatBar 
        label="HAPPINESS" 
        value={characterStats?.happiness || 75} 
        maxValue={100} 
        color={StatConfigs.happiness.color}
        showParticles={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.shell.darkerGray,
    borderWidth: 2,
    borderColor: Colors.shell.buttonBlack,
    marginVertical: Spacing.sm,
  },
});

export default StatsDisplay;