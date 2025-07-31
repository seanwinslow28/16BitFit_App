import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CharacterPowerUpPreview = ({ stats, isVisible, intensity = 1 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array(6).fill(0).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;
  
  useEffect(() => {
    if (isVisible) {
      // Character scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Glow pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Particle effects
      particleAnims.forEach((anim, index) => {
        const angle = (index * 60) * Math.PI / 180;
        const distance = 50 + Math.random() * 30;
        
        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: Math.cos(angle) * distance,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: Math.sin(angle) * distance,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      glowAnim.setValue(0);
      particleAnims.forEach(anim => {
        anim.x.setValue(0);
        anim.y.setValue(0);
        anim.opacity.setValue(0);
      });
    }
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  const getCharacterEmoji = () => {
    if (intensity >= 3) return '💪🔥';
    if (intensity >= 2) return '💪😤';
    return '💪😊';
  };
  
  const getAuraColor = () => {
    if (intensity >= 3) return '#FFD700'; // Gold for high intensity
    if (intensity >= 2) return '#4ECDC4'; // Cyan for medium
    return '#95E1D3'; // Light green for low
  };
  
  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            backgroundColor: getAuraColor(),
            opacity: glowAnim,
            transform: [
              { scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.5],
              })}
            ],
          }
        ]}
      />
      
      {/* Character */}
      <Animated.View
        style={[
          styles.character,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })}
            ],
          }
        ]}
      >
        <Text style={styles.characterEmoji}>{getCharacterEmoji()}</Text>
      </Animated.View>
      
      {/* Power particles */}
      {particleAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              opacity: anim.opacity,
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
              ],
            }
          ]}
        >
          <Text style={styles.particleEmoji}>✨</Text>
        </Animated.View>
      ))}
      
      {/* Stats preview */}
      {stats && (
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: scaleAnim,
              transform: [
                { translateY: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })}
              ],
            }
          ]}
        >
          <Text style={styles.powerUpText}>POWER UP!</Text>
          <View style={styles.statsList}>
            {Object.entries(stats).map(([stat, value]) => (
              value > 0 && (
                <Text key={stat} style={styles.statText}>
                  +{value} {stat.toUpperCase()}
                </Text>
              )
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.8,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: 20,
  },
  character: {
    position: 'absolute',
    top: 50,
  },
  characterEmoji: {
    fontSize: 60,
  },
  particle: {
    position: 'absolute',
    top: 95,
  },
  particleEmoji: {
    fontSize: 20,
  },
  statsContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  powerUpText: {
    fontSize: 16,
    fontFamily: 'PressStart2P',
    color: '#FFD700',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  statsList: {
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'PressStart2P',
    color: '#0F380F',
  },
});

export default CharacterPowerUpPreview;