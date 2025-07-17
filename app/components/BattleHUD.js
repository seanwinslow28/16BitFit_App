/**
 * Battle HUD Component
 * Displays health bars, combo counter, and special meters
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { pixelFont } from '../hooks/useFonts';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Damage color
  blue: '#3498db',         // Special move color
  purple: '#9b59b6',       // Critical hit
};

const BattleHUD = ({
  playerStats = {},
  bossStats = {},
  comboCount = 0,
  roundTime = null,
  showDamage = null,
  style,
}) => {
  // Animation values
  const playerHpAnim = useRef(new Animated.Value(playerStats.hp)).current;
  const bossHpAnim = useRef(new Animated.Value(bossStats.hp)).current;
  const specialMeterAnim = useRef(new Animated.Value(playerStats.specialMeter || 0)).current;
  const comboScaleAnim = useRef(new Animated.Value(1)).current;
  const damageOpacityAnim = useRef(new Animated.Value(0)).current;
  const damageTranslateAnim = useRef(new Animated.Value(0)).current;
  const screenShakeAnim = useRef(new Animated.Value(0)).current;

  // Update health bars with animation
  useEffect(() => {
    Animated.timing(playerHpAnim, {
      toValue: playerStats.hp,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [playerStats.hp]);

  useEffect(() => {
    Animated.timing(bossHpAnim, {
      toValue: bossStats.hp,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [bossStats.hp]);

  // Update special meter
  useEffect(() => {
    Animated.spring(specialMeterAnim, {
      toValue: playerStats.specialMeter || 0,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [playerStats.specialMeter]);

  // Combo animation
  useEffect(() => {
    if (comboCount > 0) {
      Animated.sequence([
        Animated.spring(comboScaleAnim, {
          toValue: 1.3,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(comboScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [comboCount]);

  // Damage number animation
  useEffect(() => {
    if (showDamage) {
      // Reset animations
      damageOpacityAnim.setValue(0);
      damageTranslateAnim.setValue(0);
      
      // Animate damage number
      Animated.parallel([
        Animated.timing(damageOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(damageTranslateAnim, {
          toValue: -30,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(damageOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });

      // Screen shake for high damage
      if (showDamage.amount > 20) {
        Animated.sequence([
          Animated.timing(screenShakeAnim, {
            toValue: 5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(screenShakeAnim, {
            toValue: -5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(screenShakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [showDamage]);

  const getHealthBarColor = (hp, maxHp) => {
    const percentage = (hp / maxHp) * 100;
    if (percentage > 50) return COLORS.primary;
    if (percentage > 25) return COLORS.yellow;
    return COLORS.red;
  };

  const renderHealthBar = (name, hp, maxHp, hpAnim, isPlayer = true) => {
    const percentage = (hp / maxHp) * 100;
    const healthColor = getHealthBarColor(hp, maxHp);
    
    return (
      <View style={[styles.healthBarContainer, !isPlayer && styles.bossHealthBar]}>
        <View style={styles.healthBarHeader}>
          <Text style={[styles.fighterName, pixelFont]}>{name}</Text>
          <Text style={[styles.hpText, pixelFont]}>
            {Math.max(0, Math.floor(hp))}/{maxHp}
          </Text>
        </View>
        
        <View style={styles.healthBarBackground}>
          <Animated.View
            style={[
              styles.healthBarFill,
              {
                width: hpAnim.interpolate({
                  inputRange: [0, maxHp],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: healthColor,
              },
            ]}
          >
            {/* Animated glow effect for low health */}
            {percentage <= 25 && (
              <Animated.View style={styles.healthBarGlow} />
            )}
          </Animated.View>
          
          {/* Health bar segments */}
          <View style={styles.healthBarSegments}>
            {[...Array(10)].map((_, i) => (
              <View key={i} style={styles.segment} />
            ))}
          </View>
        </View>
        
        {/* Critical health warning */}
        {percentage <= 25 && (
          <Text style={[styles.criticalText, pixelFont]}>DANGER!</Text>
        )}
      </View>
    );
  };

  const renderSpecialMeter = () => {
    const meterSegments = 5;
    const filledSegments = Math.floor((playerStats.specialMeter / 100) * meterSegments);
    
    return (
      <View style={styles.specialMeterContainer}>
        <Text style={[styles.specialMeterLabel, pixelFont]}>SPECIAL</Text>
        
        <View style={styles.specialMeterBar}>
          {[...Array(meterSegments)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.specialMeterSegment,
                i < filledSegments && styles.specialMeterSegmentFilled,
                playerStats.specialMeter >= 100 && styles.specialMeterSegmentReady,
              ]}
            />
          ))}
        </View>
        
        {playerStats.specialMeter >= 100 && (
          <Text style={[styles.specialReadyText, pixelFont]}>READY!</Text>
        )}
      </View>
    );
  };

  const renderComboCounter = () => {
    if (comboCount <= 0) return null;
    
    return (
      <Animated.View
        style={[
          styles.comboContainer,
          {
            transform: [{ scale: comboScaleAnim }],
          },
        ]}
      >
        <Text style={[styles.comboText, pixelFont]}>COMBO</Text>
        <Text style={[styles.comboCount, pixelFont]}>x{comboCount}</Text>
        
        {comboCount >= 5 && (
          <Text style={[styles.comboBonus, pixelFont]}>
            {comboCount >= 10 ? 'ULTRA!' : 'SUPER!'}
          </Text>
        )}
      </Animated.View>
    );
  };

  const renderDamageNumber = () => {
    if (!showDamage) return null;
    
    const isCritical = showDamage.critical;
    const damageColor = isCritical ? COLORS.yellow : COLORS.red;
    
    return (
      <Animated.View
        style={[
          styles.damageContainer,
          {
            opacity: damageOpacityAnim,
            transform: [
              { translateY: damageTranslateAnim },
              { translateX: showDamage.x || 0 },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.damageText,
            pixelFont,
            { color: damageColor },
            isCritical && styles.criticalDamageText,
          ]}
        >
          -{showDamage.amount}
        </Text>
        {isCritical && (
          <Text style={[styles.criticalLabel, pixelFont]}>CRITICAL!</Text>
        )}
      </Animated.View>
    );
  };

  const renderRoundTimer = () => {
    if (!roundTime) return null;
    
    const isLowTime = roundTime <= 10;
    
    return (
      <View style={styles.timerContainer}>
        <Text
          style={[
            styles.timerText,
            pixelFont,
            isLowTime && styles.timerTextUrgent,
          ]}
        >
          {Math.floor(roundTime / 60)}:{(roundTime % 60).toString().padStart(2, '0')}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateX: screenShakeAnim }],
        },
      ]}
    >
      {/* Top HUD - Boss Health */}
      <View style={styles.topHUD}>
        {renderHealthBar(
          bossStats.name,
          bossStats.hp,
          bossStats.maxHp,
          bossHpAnim,
          false
        )}
        {renderRoundTimer()}
      </View>

      {/* Bottom HUD - Player Health and Special */}
      <View style={styles.bottomHUD}>
        {renderHealthBar(
          playerStats.name,
          playerStats.hp,
          playerStats.maxHp,
          playerHpAnim,
          true
        )}
        {renderSpecialMeter()}
      </View>

      {/* Combo Counter */}
      {renderComboCounter()}
      
      {/* Damage Numbers */}
      {renderDamageNumber()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },

  topHUD: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },

  bottomHUD: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },

  healthBarContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 12,
  },

  bossHealthBar: {
    marginBottom: 10,
  },

  healthBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  fighterName: {
    fontSize: 12,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  hpText: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
  },

  healthBarBackground: {
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
    position: 'relative',
  },

  healthBarFill: {
    height: '100%',
    borderRadius: 8,
    position: 'relative',
  },

  healthBarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  healthBarSegments: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  segment: {
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  criticalText: {
    position: 'absolute',
    right: 12,
    bottom: -20,
    fontSize: 8,
    color: COLORS.red,
    letterSpacing: 0.5,
  },

  specialMeterContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  specialMeterLabel: {
    fontSize: 10,
    color: COLORS.blue,
    letterSpacing: 0.5,
    marginRight: 12,
  },

  specialMeterBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },

  specialMeterSegment: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    borderWidth: 2,
    borderColor: COLORS.blue,
    borderRadius: 4,
  },

  specialMeterSegmentFilled: {
    backgroundColor: COLORS.blue,
  },

  specialMeterSegmentReady: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
  },

  specialReadyText: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginLeft: 12,
  },

  comboContainer: {
    position: 'absolute',
    top: '50%',
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderWidth: 3,
    borderColor: COLORS.yellow,
    borderRadius: 8,
    padding: 12,
  },

  comboText: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  comboCount: {
    fontSize: 24,
    color: COLORS.yellow,
    letterSpacing: 1,
  },

  comboBonus: {
    fontSize: 8,
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginTop: 4,
  },

  damageContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    alignItems: 'center',
  },

  damageText: {
    fontSize: 32,
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  criticalDamageText: {
    fontSize: 40,
  },

  criticalLabel: {
    fontSize: 10,
    color: COLORS.yellow,
    letterSpacing: 0.5,
    marginTop: 4,
  },

  timerContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 3,
    borderColor: COLORS.dark,
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  timerText: {
    fontSize: 16,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  timerTextUrgent: {
    color: COLORS.red,
  },
});

export default BattleHUD;