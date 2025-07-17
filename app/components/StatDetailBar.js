/**
 * Stat Detail Bar Component
 * Enhanced stat visualization with animations and GameBoy styling
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { pixelFont } from '../hooks/useFonts';

const COLORS = {
  primary: '#92CC41',
  dark: '#0D0D0D',
  yellow: '#F7D51D',
  red: '#E53935',
  blue: '#3498db',
  purple: '#9b59b6',
};

const StatDetailBar = ({
  icon,
  label,
  value = 0,
  maxValue = 100,
  color = COLORS.primary,
  showDetails = false,
  trend = null, // 'up', 'down', or null
  previousValue = null,
  onPress,
  style,
}) => {
  // Animation values
  const fillAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Calculate percentage
  const percentage = Math.min((value / maxValue) * 100, 100);

  // Determine color based on value
  const getBarColor = () => {
    if (color) return color;
    if (percentage >= 80) return COLORS.primary;
    if (percentage >= 50) return COLORS.yellow;
    return COLORS.red;
  };

  useEffect(() => {
    // Animate fill width
    Animated.spring(fillAnim, {
      toValue: percentage,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();

    // Pulse animation for low values
    if (percentage < 30) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Glow animation for high values
    if (percentage >= 80) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Shake animation for critical values
    if (percentage < 20) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -2,
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
  }, [percentage]);

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const barColor = getBarColor();

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <Animated.View
        style={[
          styles.content,
          {
            transform: [
              { translateX: shakeAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.labelContainer}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[styles.label, pixelFont]}>{label}</Text>
          </View>
          
          <View style={styles.valueContainer}>
            <Text style={[styles.value, pixelFont, { color: barColor }]}>
              {value}
            </Text>
            <Text style={[styles.maxValue, pixelFont]}>/{maxValue}</Text>
            {trend && (
              <Text style={[styles.trend, { color: trend === 'up' ? COLORS.primary : COLORS.red }]}>
                {trend === 'up' ? '↑' : '↓'}
              </Text>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.barContainer}>
          <View style={styles.barBackground}>
            <Animated.View
              style={[
                styles.barFill,
                {
                  width: fillAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: barColor,
                },
              ]}
            >
              {/* Animated glow effect */}
              {percentage >= 80 && (
                <Animated.View
                  style={[
                    styles.glowEffect,
                    {
                      opacity: glowAnim,
                    },
                  ]}
                />
              )}
            </Animated.View>

            {/* Notches for visual reference */}
            <View style={[styles.notch, { left: '25%' }]} />
            <View style={[styles.notch, { left: '50%' }]} />
            <View style={[styles.notch, { left: '75%' }]} />
          </View>

          {/* Percentage text overlay */}
          <Text style={[styles.percentageText, pixelFont]}>
            {Math.round(percentage)}%
          </Text>
        </View>

        {/* Details section */}
        {showDetails && (
          <View style={styles.details}>
            {previousValue !== null && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, pixelFont]}>CHANGE:</Text>
                <Text 
                  style={[
                    styles.detailValue, 
                    pixelFont,
                    { color: value > previousValue ? COLORS.primary : COLORS.red }
                  ]}
                >
                  {value > previousValue ? '+' : ''}{value - previousValue}
                </Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, pixelFont]}>STATUS:</Text>
              <Text style={[styles.detailValue, pixelFont, { color: barColor }]}>
                {percentage >= 80 ? 'EXCELLENT' : 
                 percentage >= 50 ? 'GOOD' : 
                 percentage >= 30 ? 'LOW' : 'CRITICAL'}
              </Text>
            </View>
          </View>
        )}

        {/* Critical warning */}
        {percentage < 20 && (
          <View style={styles.warningBadge}>
            <Text style={[styles.warningText, pixelFont]}>⚠️ CRITICAL</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },

  content: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  icon: {
    fontSize: 20,
    marginRight: 8,
  },

  label: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  value: {
    fontSize: 18,
    letterSpacing: 1,
  },

  maxValue: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.5,
  },

  trend: {
    fontSize: 16,
    marginLeft: 8,
  },

  barContainer: {
    position: 'relative',
  },

  barBackground: {
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
    position: 'relative',
  },

  barFill: {
    height: '100%',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },

  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  notch: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  percentageText: {
    position: 'absolute',
    top: 2,
    right: 8,
    fontSize: 10,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(146, 204, 65, 0.3)',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  detailLabel: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 0.5,
  },

  detailValue: {
    fontSize: 10,
    letterSpacing: 0.5,
  },

  warningBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: COLORS.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  warningText: {
    fontSize: 8,
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default StatDetailBar;