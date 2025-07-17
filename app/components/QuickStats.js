/**
 * Quick Stats Component - Floating health/energy indicators
 * Shows critical stats with visual alerts for low values
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/DesignSystem';

const QuickStats = ({ 
  health = 100, 
  stamina = 100, 
  showCritical = false,
  fontFamily = 'monospace',
}) => {
  // Animation for critical health warning
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (health < 30 || stamina < 30) {
      // Critical health pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.9,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Shake animation for very low health
      if (health < 20) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: 3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      // Reset animations for normal health
      pulseAnim.setValue(1);
      shakeAnim.setValue(0);
    }
  }, [health, stamina]);

  const getHealthColor = (value) => {
    if (value < 20) return Colors.state.health;
    if (value < 40) return Colors.primary.logoYellow;
    return Colors.primary.success;
  };

  const getStaminaColor = (value) => {
    if (value < 20) return Colors.state.health;
    if (value < 40) return Colors.primary.logoYellow;
    return Colors.state.energy;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: pulseAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      {/* Health Stat */}
      <View style={styles.statItem}>
        <Text style={styles.statIcon}>❤️</Text>
        <View style={styles.statContent}>
          <Text 
            style={[
              styles.statValue, 
              { fontFamily, color: getHealthColor(health) }
            ]}
          >
            {Math.round(health)}%
          </Text>
          {health < 30 && (
            <Text style={[styles.criticalText, { fontFamily }]}>
              CRITICAL
            </Text>
          )}
        </View>
      </View>

      {/* Stamina Stat */}
      <View style={styles.statItem}>
        <Text style={styles.statIcon}>⚡</Text>
        <View style={styles.statContent}>
          <Text 
            style={[
              styles.statValue, 
              { fontFamily, color: getStaminaColor(stamina) }
            ]}
          >
            {Math.round(stamina)}%
          </Text>
          {stamina < 30 && (
            <Text style={[styles.criticalText, { fontFamily }]}>
              TIRED
            </Text>
          )}
        </View>
      </View>

      {/* Critical warning overlay */}
      {(health < 20 || stamina < 20) && (
        <View style={styles.criticalOverlay}>
          <Text style={[styles.criticalWarning, { fontFamily }]}>
            ⚠️ CRITICAL ⚠️
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.primary.black,
    shadowColor: Colors.primary.logoYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statContent: {
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  statValue: {
    ...Typography.titleMedium,
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 1,
  },

  criticalText: {
    ...Typography.microCopy,
    fontSize: 8,
    color: Colors.state.health,
    marginTop: 2,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },

  criticalOverlay: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    backgroundColor: Colors.state.health,
    borderWidth: 2,
    borderColor: Colors.primary.black,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  criticalWarning: {
    ...Typography.labelSmall,
    fontSize: 10,
    color: Colors.primary.black,
    letterSpacing: 1,
    textAlign: 'center',
  },
});

export default QuickStats;