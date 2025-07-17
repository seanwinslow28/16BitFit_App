/**
 * Animated Stats Display Component
 * Shows player stats with smooth animations
 * Following MetaSystemsAgent patterns for engaging feedback
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { pixelFont } from '../hooks/useFonts';
import { AnimatedNumber, AnimatedProgressBar, BounceIn } from './MicroAnimations';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  gray: '#666',
  white: '#FFFFFF',
};

const STAT_COLORS = {
  health: '#E53935',
  strength: '#F7D51D',
  stamina: '#92CC41',
  happiness: '#4A90E2',
  weight: '#9B59B6',
};

const AnimatedStatsDisplay = ({
  stats = {},
  showChanges = false,
  changes = {},
  style,
}) => {
  const statAnimations = useRef({
    health: new Animated.Value(0),
    strength: new Animated.Value(0),
    stamina: new Animated.Value(0),
    happiness: new Animated.Value(0),
    weight: new Animated.Value(0),
  }).current;

  const changeAnimations = useRef({
    health: new Animated.Value(0),
    strength: new Animated.Value(0),
    stamina: new Animated.Value(0),
    happiness: new Animated.Value(0),
    weight: new Animated.Value(0),
  }).current;

  useEffect(() => {
    // Animate stat changes
    Object.keys(statAnimations).forEach(stat => {
      if (stats[stat] !== undefined) {
        Animated.spring(statAnimations[stat], {
          toValue: stats[stat] / 100,
          friction: 5,
          tension: 40,
          useNativeDriver: false,
        }).start();
      }
    });
  }, [stats]);

  useEffect(() => {
    if (showChanges) {
      // Show change indicators
      Object.keys(changes).forEach(stat => {
        if (changes[stat] && changeAnimations[stat]) {
          // Animate in
          Animated.sequence([
            Animated.timing(changeAnimations[stat], {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(changeAnimations[stat], {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
    }
  }, [showChanges, changes]);

  const renderStat = (statKey, label, icon) => {
    const value = stats[statKey] || 0;
    const change = changes[statKey] || 0;
    const color = STAT_COLORS[statKey];

    return (
      <BounceIn delay={Object.keys(stats).indexOf(statKey) * 100}>
        <View style={styles.statRow}>
          <View style={styles.statHeader}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={[styles.statLabel, pixelFont]}>{label}</Text>
            <Text style={[styles.statValue, pixelFont]}>
              <AnimatedNumber value={value} duration={800} />
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <AnimatedProgressBar
              progress={value / 100}
              backgroundColor={color}
              containerColor={`${color}33`}
              height={8}
              duration={1000}
              style={styles.progressBar}
            />
            
            {/* Change indicator */}
            {change !== 0 && (
              <Animated.View
                style={[
                  styles.changeIndicator,
                  {
                    opacity: changeAnimations[statKey],
                    transform: [
                      {
                        translateY: changeAnimations[statKey].interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, -10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.changeText,
                    pixelFont,
                    { color: change > 0 ? COLORS.primary : COLORS.red },
                  ]}
                >
                  {change > 0 ? '+' : ''}{change}
                </Text>
              </Animated.View>
            )}
          </View>
          
          {/* Stat status indicator */}
          <View style={styles.statusIndicator}>
            {value >= 80 && <Text style={styles.statusEmoji}>💪</Text>}
            {value >= 60 && value < 80 && <Text style={styles.statusEmoji}>👍</Text>}
            {value >= 40 && value < 60 && <Text style={styles.statusEmoji}>😐</Text>}
            {value >= 20 && value < 40 && <Text style={styles.statusEmoji}>😟</Text>}
            {value < 20 && <Text style={styles.statusEmoji}>😰</Text>}
          </View>
        </View>
      </BounceIn>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['rgba(13, 13, 13, 0.95)', 'rgba(13, 13, 13, 0.85)']}
        style={styles.gradient}
      >
        <Text style={[styles.title, pixelFont]}>CHARACTER STATS</Text>
        
        <View style={styles.statsContainer}>
          {renderStat('health', 'HEALTH', '❤️')}
          {renderStat('strength', 'STRENGTH', '💪')}
          {renderStat('stamina', 'STAMINA', '⚡')}
          {renderStat('happiness', 'HAPPINESS', '😊')}
          {renderStat('weight', 'WEIGHT', '⚖️')}
        </View>
        
        {/* Overall status */}
        <View style={styles.overallStatus}>
          <Text style={[styles.overallLabel, pixelFont]}>OVERALL:</Text>
          <Text style={[styles.overallValue, pixelFont]}>
            {getOverallStatus(stats)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const getOverallStatus = (stats) => {
  const average = Object.values(stats).reduce((sum, val) => sum + val, 0) / 
                 Object.keys(stats).length;
  
  if (average >= 80) return 'CHAMPION 👑';
  if (average >= 60) return 'STRONG 💪';
  if (average >= 40) return 'IMPROVING 📈';
  if (average >= 20) return 'STRUGGLING 😓';
  return 'CRITICAL ⚠️';
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },

  gradient: {
    padding: 20,
  },

  title: {
    fontSize: 14,
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },

  statsContainer: {
    gap: 12,
  },

  statRow: {
    marginBottom: 8,
  },

  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  statIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  statLabel: {
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
    flex: 1,
  },

  statValue: {
    fontSize: 12,
    color: COLORS.yellow,
    letterSpacing: 1,
  },

  progressContainer: {
    position: 'relative',
  },

  progressBar: {
    borderRadius: 4,
  },

  changeIndicator: {
    position: 'absolute',
    right: 0,
    top: -20,
  },

  changeText: {
    fontSize: 10,
    letterSpacing: 1,
  },

  statusIndicator: {
    position: 'absolute',
    right: 40,
    top: 0,
  },

  statusEmoji: {
    fontSize: 14,
  },

  overallStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(146, 204, 65, 0.3)',
  },

  overallLabel: {
    fontSize: 10,
    color: COLORS.gray,
    letterSpacing: 1,
    marginRight: 8,
  },

  overallValue: {
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1,
  },
});

export default AnimatedStatsDisplay;