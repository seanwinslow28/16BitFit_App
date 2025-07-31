/**
 * Fighter Renderer Component
 * Handles rendering of fighter entities with sprite animations
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export const FighterRenderer = (entity) => {
  if (!entity || !entity.position) return null;

  const {
    position,
    width = 64,
    height = 96,
    sprite,
    rotation = 0,
    scale = 1,
    alpha = 1,
    tint,
    flipX = false,
    isPlayer = false,
    animationFrame = 0,
  } = entity;

  // Calculate transform
  const transform = [
    { translateX: position.x - width / 2 },
    { translateY: position.y - height / 2 },
    { rotate: `${rotation}rad` },
    { scaleX: flipX ? -scale : scale },
    { scaleY: scale },
  ];

  // Apply tint if specified
  const tintColor = tint ? `rgba(${(tint >> 16) & 255}, ${(tint >> 8) & 255}, ${tint & 255}, ${alpha})` : undefined;

  return (
    <View
      style={[
        styles.fighter,
        {
          width,
          height,
          opacity: alpha,
          transform,
        },
      ]}
    >
      {sprite && (
        <Image
          source={sprite}
          style={[
            styles.sprite,
            {
              width,
              height,
              tintColor,
            },
          ]}
          resizeMode="contain"
        />
      )}
      
      {/* Debug indicator for player */}
      {__DEV__ && isPlayer && (
        <View style={styles.playerIndicator} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fighter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sprite: {
    position: 'absolute',
  },
  playerIndicator: {
    position: 'absolute',
    top: -10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF00',
  },
});