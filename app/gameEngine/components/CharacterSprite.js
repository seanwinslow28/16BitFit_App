import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Animated } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

const CharacterSprite = ({ spriteSheet, animation, stats, isPlayer }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animatedScale = useRef(new Animated.Value(1)).current;
  
  // Sprite sheet configuration for 16-bit characters
  const SPRITE_CONFIG = {
    frameWidth: 64,
    frameHeight: 96,
    animations: {
      idle: { 
        frames: [0, 1, 2, 1], 
        frameRate: 4, 
        loop: true 
      },
      walk: { 
        frames: [3, 4, 5, 6, 7, 8], 
        frameRate: 8, 
        loop: true 
      },
      jump: { 
        frames: [9, 10], 
        frameRate: 6, 
        loop: false 
      },
      punch: { 
        frames: [11, 12, 13], 
        frameRate: 12, 
        loop: false 
      },
      kick: { 
        frames: [14, 15, 16, 17], 
        frameRate: 10, 
        loop: false 
      },
      block: { 
        frames: [18, 19], 
        frameRate: 6, 
        loop: true 
      },
      hurt: { 
        frames: [20, 21], 
        frameRate: 8, 
        loop: false 
      },
      victory: { 
        frames: [22, 23, 24, 25], 
        frameRate: 6, 
        loop: false 
      },
      defeat: { 
        frames: [26, 27], 
        frameRate: 4, 
        loop: false 
      },
      special: {
        frames: [28, 29, 30, 31, 32],
        frameRate: 15,
        loop: false
      }
    }
  };

  useEffect(() => {
    const animConfig = SPRITE_CONFIG.animations[animation] || SPRITE_CONFIG.animations.idle;
    let frameIndex = 0;
    let animationComplete = false;

    const animationTimer = setInterval(() => {
      if (animationComplete) return;
      
      if (frameIndex < animConfig.frames.length - 1) {
        frameIndex++;
      } else if (animConfig.loop) {
        frameIndex = 0;
      } else {
        animationComplete = true;
        clearInterval(animationTimer);
        return;
      }
      
      setCurrentFrame(animConfig.frames[frameIndex]);
    }, 1000 / animConfig.frameRate);

    // Trigger scale animation for attacks
    if (['punch', 'kick', 'special'].includes(animation)) {
      Animated.sequence([
        Animated.timing(animatedScale, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => clearInterval(animationTimer);
  }, [animation]);

  // Calculate sprite position in sheet
  const columns = 8; // 8 frames per row
  const frameX = (currentFrame % columns) * SPRITE_CONFIG.frameWidth;
  const frameY = Math.floor(currentFrame / columns) * SPRITE_CONFIG.frameHeight;

  // Get power level for visual effects
  const getPowerLevel = () => {
    const total = stats.attackPower + stats.defense + stats.moveSpeed * 10;
    if (total > 250) return 'legendary';
    if (total > 200) return 'epic';
    if (total > 150) return 'rare';
    return 'common';
  };

  const powerLevel = getPowerLevel();
  
  return (
    <Animated.View 
      style={{
        width: SPRITE_CONFIG.frameWidth,
        height: SPRITE_CONFIG.frameHeight,
        transform: [{ scale: animatedScale }],
      }}
    >
      {/* Character sprite */}
      <View style={{ 
        width: SPRITE_CONFIG.frameWidth, 
        height: SPRITE_CONFIG.frameHeight, 
        overflow: 'hidden',
      }}>
        <ExpoImage
          source={spriteSheet}
          style={{
            width: SPRITE_CONFIG.frameWidth * columns,
            height: SPRITE_CONFIG.frameHeight * 4, // 4 rows
            transform: [
              { translateX: -frameX },
              { translateY: -frameY }
            ]
          }}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
      </View>
      
      {/* Power effects overlay */}
      {powerLevel !== 'common' && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 32,
            borderWidth: powerLevel === 'legendary' ? 3 : 2,
            borderColor: 
              powerLevel === 'legendary' ? '#FFD700' :
              powerLevel === 'epic' ? '#9C27B0' :
              '#2196F3',
            opacity: 0.6,
          }}
        />
      )}
      
      {/* Player indicator */}
      {isPlayer && (
        <View style={{
          position: 'absolute',
          top: -30,
          left: SPRITE_CONFIG.frameWidth / 2 - 10,
          width: 20,
          height: 10,
        }}>
          <View style={{
            width: 0,
            height: 0,
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderTopWidth: 10,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#4CAF50',
          }} />
        </View>
      )}
    </Animated.View>
  );
};

export default CharacterSprite;