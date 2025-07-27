import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCombatTier, CombatTiers } from '../gameEngine/systems/CombatTierSystem';

const CombatTierIndicator = React.memo(({ totalBattles }) => {
  const tier = getCombatTier(totalBattles);
  
  const getTierInfo = () => {
    switch (tier) {
      case CombatTiers.BEGINNER:
        return {
          label: 'BEGINNER',
          color: '#4CAF50',
          description: 'One-Touch Combat',
          controls: [
            'Tap: Auto-combo',
            'Hold: Charge attack',
            'Double tap: Special',
            'Pinch: Block',
          ],
        };
      case CombatTiers.INTERMEDIATE:
        return {
          label: 'INTERMEDIATE',
          color: '#FFC107',
          description: 'Strategic Combat',
          controls: [
            'Swipe: Move',
            'Tap + Direction: Attack type',
            'Long press: Directional block',
            'Combo timing matters!',
          ],
        };
      case CombatTiers.ADVANCED:
        return {
          label: 'ADVANCED',
          color: '#F44336',
          description: 'Full Fighting System',
          controls: [
            'D-Pad: Full movement',
            'Quarter-circles: Specials',
            'Complex combos',
            'Frame-perfect timing',
          ],
        };
      default:
        return {
          label: 'UNKNOWN',
          color: '#999',
          description: '',
          controls: [],
        };
    }
  };
  
  const tierInfo = getTierInfo();
  
  return (
    <View style={styles.container}>
      <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
        <Text style={styles.tierLabel}>{tierInfo.label}</Text>
      </View>
      <Text style={styles.description}>{tierInfo.description}</Text>
      <View style={styles.controlsList}>
        {tierInfo.controls.map((control, index) => (
          <Text key={index} style={styles.controlItem}>• {control}</Text>
        ))}
      </View>
      <Text style={styles.progress}>
        Battles: {totalBattles} / {tier === CombatTiers.BEGINNER ? '10' : tier === CombatTiers.INTERMEDIATE ? '50' : '∞'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 56, 15, 0.9)',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    borderWidth: 2,
    borderColor: '#0F380F',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  tierLabel: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginBottom: 10,
  },
  controlsList: {
    marginVertical: 10,
  },
  controlItem: {
    fontSize: 9,
    fontFamily: 'PressStart2P',
    color: '#9BBD0F',
    marginVertical: 2,
  },
  progress: {
    fontSize: 10,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginTop: 10,
  },
});

export default CombatTierIndicator;