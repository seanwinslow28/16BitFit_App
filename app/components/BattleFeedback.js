/**
 * Battle Feedback Component - Enhanced battle results display
 * Shows animated battle outcomes, rewards, and boss encounter details
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography, Spacing, Effects } from '../constants/DesignSystem';
import SoundFXManager from '../services/SoundFXManager';

const BattleFeedback = ({
  visible = false,
  battleResult = null, // 'win' | 'lose'
  boss = null,
  rewards = {},
  playerCombatPower = 0,
  bossRequiredPower = 0,
  gameScore = 0,
  onComplete = () => {},
  fontFamily = 'monospace',
}) => {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && battleResult) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);
      celebrationAnim.setValue(0);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start(async () => {
        // Victory celebration animation and sound
        if (battleResult === 'win') {
          await SoundFXManager.playVictory();
          Animated.sequence([
            Animated.timing(celebrationAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
            Animated.timing(celebrationAnim, {
              toValue: 0,
              duration: 400,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          await SoundFXManager.playDefeat();
        }
      });

      // Auto-exit after 4 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -30,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          onComplete();
        });
      }, 4000);
    }
  }, [visible, battleResult]);

  if (!visible || !battleResult || !boss) return null;

  const isVictory = battleResult === 'win';
  const rewardEntries = Object.entries(rewards).filter(([key, value]) => value > 0);

  return (
    <Animated.View
      style={[
        styles.feedbackContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
        isVictory ? styles.victoryBorder : styles.defeatBorder,
      ]}
    >
      {/* Battle Result Header */}
      <View style={[styles.resultHeader, { backgroundColor: isVictory ? Colors.primary.success : Colors.state.health }]}>
        <Animated.Text 
          style={[
            styles.resultEmoji, 
            {
              transform: [{ scale: celebrationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.3],
              }) }]
            }
          ]}
        >
          {isVictory ? '🎉' : '💀'}
        </Animated.Text>
        <View style={styles.resultTitleContainer}>
          <Text style={[styles.resultTitle, { fontFamily }]}>
            {isVictory ? 'VICTORY!' : 'DEFEAT!'}
          </Text>
          <Text style={[styles.resultSubtitle, { fontFamily }]}>
            vs {boss.name} {boss.sprite}
          </Text>
        </View>
      </View>

      {/* Battle Stats */}
      <View style={styles.battleStatsContainer}>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { fontFamily }]}>YOUR POWER:</Text>
          <Text style={[styles.statValue, { fontFamily, color: Colors.primary.logoYellow }]}>
            {playerCombatPower}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { fontFamily }]}>GAME BONUS:</Text>
          <Text style={[styles.statValue, { fontFamily, color: Colors.state.energy }]}>
            +{gameScore * 2}
          </Text>
        </View>
        
        <View style={[styles.statRow, styles.totalRow]}>
          <Text style={[styles.statLabel, { fontFamily }]}>TOTAL POWER:</Text>
          <Text style={[styles.statValue, { fontFamily, color: isVictory ? Colors.primary.success : Colors.state.health }]}>
            {playerCombatPower + (gameScore * 2)}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { fontFamily }]}>BOSS POWER:</Text>
          <Text style={[styles.statValue, { fontFamily, color: Colors.environment.groundDark }]}>
            {bossRequiredPower}
          </Text>
        </View>
      </View>

      {/* Rewards or Consequences */}
      <View style={styles.outcomeContainer}>
        {isVictory ? (
          <>
            <Text style={[styles.outcomeTitle, { fontFamily }]}>BATTLE REWARDS</Text>
            {rewardEntries.map(([rewardType, amount], index) => (
              <RewardRow
                key={rewardType}
                rewardType={rewardType}
                amount={amount}
                fontFamily={fontFamily}
                delay={index * 150}
              />
            ))}
          </>
        ) : (
          <>
            <Text style={[styles.outcomeTitle, { fontFamily, color: Colors.state.health }]}>
              BATTLE CONSEQUENCES
            </Text>
            <View style={styles.consequenceRow}>
              <Text style={[styles.consequenceText, { fontFamily }]}>
                -5 ❤️ HAPPINESS   -3 ⚡ STAMINA
              </Text>
            </View>
            <Text style={[styles.motivationText, { fontFamily }]}>
              Train harder and return stronger!
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
};

// Individual reward row with animation
const RewardRow = ({ rewardType, amount, fontFamily, delay = 0 }) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  const getRewardInfo = (type) => {
    const rewardConfig = {
      xp: { label: 'EXPERIENCE', icon: '⭐', color: Colors.primary.logoYellow },
      health: { label: 'HEALTH', icon: '❤️', color: Colors.state.health },
      strength: { label: 'STRENGTH', icon: '💪', color: Colors.primary.logoYellow },
      stamina: { label: 'STAMINA', icon: '⚡', color: Colors.state.energy },
      happiness: { label: 'HAPPINESS', icon: '😊', color: Colors.primary.success },
      evolutionBonus: { label: 'EVOLUTION BOOST', icon: '🌟', color: Colors.primary.logoYellow },
    };
    return rewardConfig[type] || { label: type.toUpperCase(), icon: '🎁', color: Colors.primary.black };
  };

  const rewardInfo = getRewardInfo(rewardType);

  return (
    <Animated.View
      style={[
        styles.rewardRow,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Text style={styles.rewardIcon}>{rewardInfo.icon}</Text>
      <Text style={[styles.rewardLabel, { fontFamily, color: rewardInfo.color }]}>
        {rewardInfo.label}
      </Text>
      <Text style={[styles.rewardAmount, { fontFamily, color: rewardInfo.color }]}>
        +{amount}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  feedbackContainer: {
    position: 'absolute',
    top: '15%',
    left: '5%',
    right: '5%',
    backgroundColor: Colors.primary.black,
    borderWidth: 4,
    borderRadius: 12,
    zIndex: 1000,
    ...Effects.cardShadow,
  },

  victoryBorder: {
    borderColor: Colors.primary.success,
  },

  defeatBorder: {
    borderColor: Colors.state.health,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  resultEmoji: {
    fontSize: 40,
  },

  resultTitleContainer: {
    flex: 1,
  },

  resultTitle: {
    ...Typography.titleLarge,
    color: Colors.primary.black,
    fontSize: 20,
  },

  resultSubtitle: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    fontSize: 12,
    marginTop: 4,
  },

  battleStatsContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },

  totalRow: {
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary.logoYellow,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.environment.groundDark,
  },

  statLabel: {
    ...Typography.labelSmall,
    color: Colors.primary.black,
    fontSize: 12,
  },

  statValue: {
    ...Typography.labelSmall,
    fontSize: 14,
    fontWeight: 'bold',
  },

  divider: {
    height: 2,
    backgroundColor: Colors.primary.logoYellow,
    marginVertical: Spacing.sm,
  },

  outcomeContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.environment.groundDark,
  },

  outcomeTitle: {
    ...Typography.titleMedium,
    color: Colors.primary.logoYellow,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  rewardIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },

  rewardLabel: {
    ...Typography.labelSmall,
    flex: 1,
    fontSize: 12,
  },

  rewardAmount: {
    ...Typography.labelSmall,
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },

  consequenceRow: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },

  consequenceText: {
    ...Typography.labelSmall,
    color: Colors.state.health,
    textAlign: 'center',
    fontSize: 12,
  },

  motivationText: {
    ...Typography.microCopy,
    color: Colors.environment.groundDark,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});

export default BattleFeedback;