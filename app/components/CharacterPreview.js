/**
 * Character Preview Component
 * Displays customized character appearance
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { pixelFont } from '../hooks/useFonts';
import CustomizationDatabase from './CustomizationDatabase';

const { width: screenWidth } = Dimensions.get('window');

// GameBoy color palette
const COLORS = {
  primary: '#92CC41',      // GameBoy green
  dark: '#0D0D0D',         // Deep black
  yellow: '#F7D51D',       // Level badge yellow
  red: '#E53935',          // Negative actions
  blue: '#3498db',         // Rare items
  purple: '#9b59b6',       // Epic items
  orange: '#f39c12',       // Legendary items
};

const CharacterPreview = ({
  appearance = {},
  evolutionStage = 0,
  size = 150,
  animated = true,
  showEffects = true,
}) => {
  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const effectAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Effect animation
    if (showEffects) {
      Animated.loop(
        Animated.timing(effectAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animated, showEffects]);

  // Get item details
  const getItemDetails = (category) => {
    const itemId = appearance[category];
    if (!itemId) return null;
    return CustomizationDatabase.getItemById(itemId);
  };

  const bodyItem = getItemDetails('body');
  const hairItem = getItemDetails('hair');
  const outfitItem = getItemDetails('outfit');
  const gearItem = getItemDetails('accessories');
  const effectItem = getItemDetails('effects');

  // Get evolution name
  const getEvolutionName = () => {
    const names = ['NEWBIE', 'TRAINEE', 'FIGHTER', 'CHAMPION'];
    return names[evolutionStage] || 'NEWBIE';
  };

  // Get evolution-specific modifications
  const getEvolutionModifiers = () => {
    const modifiers = {
      size: 1,
      glow: 0,
      particleEffect: false,
    };

    switch (evolutionStage) {
      case 0: // Newbie
        modifiers.size = 0.9;
        modifiers.glow = 0.1;
        break;
      case 1: // Trainee
        modifiers.size = 1;
        modifiers.glow = 0.2;
        break;
      case 2: // Fighter
        modifiers.size = 1.1;
        modifiers.glow = 0.3;
        modifiers.particleEffect = true;
        break;
      case 3: // Champion
        modifiers.size = 1.2;
        modifiers.glow = 0.5;
        modifiers.particleEffect = true;
        break;
    }

    return modifiers;
  };

  const evolutionModifiers = getEvolutionModifiers();

  // Render character layers
  const renderCharacterBody = () => {
    const bodyStyle = bodyItem?.id || 'body_default';
    const bodyColors = {
      body_default: COLORS.primary,
      body_ninja: '#333',
      body_knight: '#999',
      body_monk: '#f39c12',
      body_robot: '#3498db',
      body_dragon: '#e74c3c',
    };

    // Evolution-based color intensity
    const baseColor = bodyColors[bodyStyle] || COLORS.primary;
    const evolutionIntensity = 1 + (evolutionStage * 0.1);

    return (
      <Animated.View 
        style={[
          styles.characterBody, 
          { 
            backgroundColor: baseColor,
            transform: [{ scale: evolutionModifiers.size }],
            shadowColor: baseColor,
            shadowOpacity: evolutionModifiers.glow,
            shadowRadius: 10 * evolutionModifiers.glow,
          }
        ]}
      >
        <Text style={[styles.bodyIcon, { fontSize: 48 * evolutionModifiers.size }]}>
          {bodyItem?.icon || '👤'}
        </Text>
      </Animated.View>
    );
  };

  const renderHair = () => {
    if (!hairItem || hairItem.id === 'hair_none') return null;

    const hairColors = {
      hair_default: '#333',
      hair_long: '#8b4513',
      hair_mohawk: '#ff1493',
      hair_topknot: '#000',
      hair_afro: '#4b0082',
      hair_rainbow: 'transparent', // Will use gradient
      hair_fire: '#ff4500',
    };

    if (hairItem.id === 'hair_rainbow') {
      return (
        <LinearGradient
          colors={['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']}
          style={styles.hairLayer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.hairIcon}>{hairItem.icon}</Text>
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.hairLayer, { backgroundColor: hairColors[hairItem.id] || '#333' }]}>
        <Text style={styles.hairIcon}>{hairItem.icon}</Text>
      </View>
    );
  };

  const renderOutfit = () => {
    if (!outfitItem) return null;

    const outfitColors = {
      outfit_default: '#666',
      outfit_gi: '#fff',
      outfit_tank: '#00ff00',
      outfit_hoodie: '#333',
      outfit_armor: '#c0c0c0',
      outfit_ninja: '#000',
      outfit_tech: '#00ffff',
      outfit_golden: '#ffd700',
    };

    return (
      <View style={[styles.outfitLayer, { backgroundColor: outfitColors[outfitItem.id] || '#666' }]}>
        <Text style={styles.outfitIcon}>{outfitItem.icon}</Text>
      </View>
    );
  };

  const renderAccessories = () => {
    if (!gearItem || gearItem.id === 'gear_none') return null;

    return (
      <View style={styles.accessoryLayer}>
        <Text style={styles.accessoryIcon}>{gearItem.icon}</Text>
      </View>
    );
  };

  const renderEffects = () => {
    if (!showEffects || !effectItem || effectItem.id === 'effect_none') return null;

    const effectRotation = effectAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View 
        style={[
          styles.effectLayer,
          {
            transform: [{ rotate: effectRotation }],
            opacity: effectItem.id === 'effect_sparkles' ? 0.8 : 1,
          }
        ]}
      >
        <Text style={styles.effectIcon}>{effectItem.icon}</Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { scale: breatheAnim },
            { translateY: floatAnim },
          ],
        }
      ]}
    >
      {/* Background glow based on evolution */}
      <LinearGradient
        colors={[
          `rgba(146, 204, 65, ${0.2 + evolutionModifiers.glow})`,
          `rgba(146, 204, 65, ${0.1 + evolutionModifiers.glow})`,
          'transparent'
        ]}
        style={[styles.glowEffect, { 
          width: size * (1.5 + evolutionModifiers.glow), 
          height: size * (1.5 + evolutionModifiers.glow),
          opacity: 0.5 + evolutionModifiers.glow,
        }]}
      />
      
      {/* Evolution particle effects */}
      {evolutionModifiers.particleEffect && evolutionStage >= 2 && (
        <Animated.View 
          style={[
            styles.particleEffect,
            {
              opacity: effectAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 0.7, 0.3],
              }),
            }
          ]}
        >
          <Text style={styles.particleIcon}>
            {evolutionStage === 3 ? '⭐' : '✨'}
          </Text>
        </Animated.View>
      )}

      {/* Character layers */}
      <View style={styles.characterContainer}>
        {renderEffects()}
        {renderCharacterBody()}
        {renderHair()}
        {renderOutfit()}
        {renderAccessories()}
      </View>

      {/* Evolution badge */}
      <View style={[
        styles.evolutionBadge, 
        { 
          backgroundColor: evolutionStage === 3 ? COLORS.orange : 
                          evolutionStage === 2 ? COLORS.purple : 
                          evolutionStage === 1 ? COLORS.yellow : 
                          COLORS.primary,
          borderColor: COLORS.dark,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
        }
      ]}>
        <Text style={[styles.evolutionText, pixelFont]}>
          {getEvolutionName()}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  glowEffect: {
    position: 'absolute',
    borderRadius: 200,
  },

  characterContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  characterBody: {
    width: '60%',
    height: '60%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.dark,
  },

  bodyIcon: {
    fontSize: 48,
  },

  hairLayer: {
    position: 'absolute',
    top: '10%',
    width: '50%',
    height: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },

  hairIcon: {
    fontSize: 32,
  },

  outfitLayer: {
    position: 'absolute',
    bottom: '15%',
    width: '65%',
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    opacity: 0.9,
  },

  outfitIcon: {
    fontSize: 36,
  },

  accessoryLayer: {
    position: 'absolute',
    top: '5%',
    right: '10%',
  },

  accessoryIcon: {
    fontSize: 28,
  },

  effectLayer: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  effectIcon: {
    fontSize: 64,
    opacity: 0.6,
  },

  particleEffect: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  particleIcon: {
    fontSize: 80,
    opacity: 0.5,
  },

  evolutionBadge: {
    position: 'absolute',
    bottom: -10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  evolutionText: {
    fontSize: 8,
    color: COLORS.dark,
    letterSpacing: 1,
  },
});

export default CharacterPreview;