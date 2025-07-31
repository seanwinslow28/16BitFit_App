/**
 * Combo Display Component
 * Shows combo counter, damage, and visual feedback
 * Optimized for 60fps mobile performance
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ComboDisplay = ({ comboData, position = 'top-right' }) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  
  // Track previous hits for animation triggers
  const prevHits = useRef(0);
  
  useEffect(() => {
    if (!comboData || comboData.hits === 0) {
      // Fade out combo display
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }).start(() => setVisible(false));
      prevHits.current = 0;
      return;
    }
    
    setVisible(true);
    
    // New hit detected
    if (comboData.hits > prevHits.current) {
      // Hit impact animation
      animateHitImpact();
      
      // Milestone animations
      if (comboData.hits % 5 === 0) {
        animateMilestone();
      }
    }
    
    // Fade in if not visible
    if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
    
    prevHits.current = comboData.hits;
  }, [comboData]);
  
  const animateHitImpact = () => {
    // Scale bounce
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Shake effect
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: { x: 5, y: 0 },
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnim, {
        toValue: { x: -5, y: 0 },
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnim, {
        toValue: { x: 0, y: 0 },
        duration: 50,
        useNativeDriver: true
      })
    ]).start();
  };
  
  const animateMilestone = () => {
    // Extra dramatic animation for milestones
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 80,
          useNativeDriver: true
        })
      ]),
      Animated.timing(fadeAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };
  
  if (!visible || !comboData) return null;
  
  const getStyleForCombo = () => {
    const baseStyle = styles.comboContainer;
    
    switch (comboData.style) {
      case 'legendary':
        return [baseStyle, styles.legendaryCombo];
      case 'epic':
        return [baseStyle, styles.epicCombo];
      case 'super':
        return [baseStyle, styles.superCombo];
      case 'great':
        return [baseStyle, styles.greatCombo];
      default:
        return baseStyle;
    }
  };
  
  const getPositionStyle = () => {
    switch (position) {
      case 'top-left':
        return styles.topLeft;
      case 'top-right':
        return styles.topRight;
      case 'bottom-left':
        return styles.bottomLeft;
      case 'bottom-right':
        return styles.bottomRight;
      default:
        return styles.topRight;
    }
  };
  
  return (
    <Animated.View
      style={[
        getStyleForCombo(),
        getPositionStyle(),
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateX: shakeAnim.x },
            { translateY: shakeAnim.y }
          ]
        }
      ]}
    >
      {/* Hit Counter */}
      <View style={styles.hitCounter}>
        <Text style={styles.hitNumber}>{comboData.hits}</Text>
        <Text style={styles.hitLabel}>HITS</Text>
      </View>
      
      {/* Damage Display */}
      <View style={styles.damageContainer}>
        <Text style={styles.damageNumber}>{comboData.damage}</Text>
        {comboData.scaled && (
          <Text style={styles.scaledIndicator}>SCALED</Text>
        )}
      </View>
      
      {/* Special Effects */}
      {comboData.effects && comboData.effects.map((effect, index) => (
        <ComboEffect key={index} type={effect} />
      ))}
      
      {/* Perfect Combo Indicator */}
      {comboData.perfect && (
        <View style={styles.perfectIndicator}>
          <Text style={styles.perfectText}>PERFECT!</Text>
        </View>
      )}
    </Animated.View>
  );
};

// Individual effect components
const ComboEffect = ({ type }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        delay: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  const getEffectText = () => {
    switch (type) {
      case 'milestone_5': return 'Nice!';
      case 'milestone_10': return 'Great!';
      case 'milestone_15': return 'Amazing!';
      case 'milestone_20': return 'Legendary!';
      case 'damage_scaled': return 'Damage Scaling';
      case 'perfect_glow': return '★';
      default: return '';
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.effectContainer,
        { opacity: fadeAnim }
      ]}
    >
      <Text style={styles.effectText}>{getEffectText()}</Text>
    </Animated.View>
  );
};

// Damage number that pops up on hits
export const DamageNumber = ({ damage, position, critical = false }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -50,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        delay: 200,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.damageNumber,
        {
          position: 'absolute',
          left: position.x,
          top: position.y,
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <Text style={[
        styles.damageText,
        critical && styles.criticalDamage
      ]}>
        {damage}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Container styles
  comboContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
    minWidth: 150,
    alignItems: 'center',
    zIndex: 1000
  },
  
  // Position styles
  topLeft: {
    top: 50,
    left: 20
  },
  topRight: {
    top: 50,
    right: 20
  },
  bottomLeft: {
    bottom: 100,
    left: 20
  },
  bottomRight: {
    bottom: 100,
    right: 20
  },
  
  // Hit counter styles
  hitCounter: {
    alignItems: 'center',
    marginBottom: 10
  },
  hitNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4
  },
  hitLabel: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    letterSpacing: 2
  },
  
  // Damage styles
  damageContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  damageNumber: {
    fontSize: 24,
    color: '#FF6B6B',
    fontWeight: 'bold'
  },
  scaledIndicator: {
    fontSize: 12,
    color: '#FFA500',
    marginLeft: 10,
    fontStyle: 'italic'
  },
  
  // Style variations
  greatCombo: {
    borderColor: '#00FF00'
  },
  superCombo: {
    borderColor: '#00FFFF',
    borderWidth: 3
  },
  epicCombo: {
    borderColor: '#FF00FF',
    borderWidth: 3,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10
  },
  legendaryCombo: {
    borderColor: '#FFD700',
    borderWidth: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.2)'
  },
  
  // Effect styles
  effectContainer: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center'
  },
  effectText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFF00',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  
  // Perfect combo
  perfectIndicator: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15
  },
  perfectText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14
  },
  
  // Floating damage
  damageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFF00',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4
  },
  criticalDamage: {
    color: '#FF0000',
    fontSize: 40
  }
});