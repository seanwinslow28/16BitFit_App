/**
 * Projectile Renderer Component
 * Handles rendering of projectiles like hadoukens, energy blasts, etc.
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export const ProjectileRenderer = (entity) => {
  if (!entity || !entity.position) return null;

  const {
    position,
    width = 32,
    height = 32,
    projectileType = 'energy',
    sprite,
    color = '#00FFFF',
    alpha = 1,
    scale = 1,
    rotation = 0,
    glowIntensity = 0.5,
  } = entity;

  const transform = [
    { translateX: position.x - width / 2 },
    { translateY: position.y - height / 2 },
    { rotate: `${rotation}rad` },
    { scale },
  ];

  return (
    <View
      style={[
        styles.projectile,
        {
          width,
          height,
          opacity: alpha,
          transform,
        },
      ]}
    >
      {/* Glow effect */}
      {glowIntensity > 0 && (
        <View
          style={[
            styles.glow,
            {
              backgroundColor: color,
              opacity: glowIntensity * 0.5,
              transform: [{ scale: 1.5 }],
            },
          ]}
        />
      )}
      
      {/* Main projectile body */}
      {sprite ? (
        <Image
          source={sprite}
          style={[styles.sprite, { width, height }]}
          resizeMode="contain"
        />
      ) : (
        <View
          style={[
            styles.energyBall,
            {
              width: width * 0.8,
              height: height * 0.8,
              backgroundColor: color,
              borderRadius: Math.min(width, height) * 0.4,
            },
          ]}
        />
      )}
      
      {/* Trail effect for motion */}
      {entity.velocity && Math.abs(entity.velocity.x) > 2 && (
        <View
          style={[
            styles.trail,
            {
              width: width * 2,
              height: height * 0.5,
              backgroundColor: color,
              opacity: 0.3,
              left: entity.velocity.x > 0 ? -width : width,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  projectile: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sprite: {
    position: 'absolute',
  },
  energyBall: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  trail: {
    position: 'absolute',
    top: '25%',
    height: '50%',
    borderRadius: 4,
  },
});