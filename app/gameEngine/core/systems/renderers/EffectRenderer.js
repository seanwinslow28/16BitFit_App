/**
 * Effect Renderer Component
 * Handles rendering of visual effects like particles, flashes, etc.
 */

import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const EffectRenderer = (entity) => {
  if (!entity || !entity.position) return null;

  const {
    position,
    width = 32,
    height = 32,
    effectType = 'particle',
    color = '#FFFFFF',
    alpha = 1,
    scale = 1,
    rotation = 0,
    blendMode = 'normal',
  } = entity;

  // Different render methods based on effect type
  switch (effectType) {
    case 'particle':
      return renderParticle(entity);
    case 'flash':
      return renderFlash(entity);
    case 'trail':
      return renderTrail(entity);
    default:
      return renderBasicEffect(entity);
  }
};

function renderParticle(entity) {
  const {
    position,
    size = 8,
    color = '#FFFF00',
    alpha = 1,
  } = entity;

  return (
    <View
      style={[
        styles.particle,
        {
          left: position.x - size / 2,
          top: position.y - size / 2,
          width: size,
          height: size,
          backgroundColor: color,
          opacity: alpha,
          borderRadius: size / 2,
        },
      ]}
    />
  );
}

function renderFlash(entity) {
  const {
    position,
    width = 100,
    height = 100,
    color = '#FFFFFF',
    alpha = 0.5,
  } = entity;

  return (
    <View
      style={[
        styles.flash,
        {
          left: position.x - width / 2,
          top: position.y - height / 2,
          width,
          height,
          backgroundColor: color,
          opacity: alpha,
        },
      ]}
    />
  );
}

function renderTrail(entity) {
  const {
    position,
    length = 50,
    width = 4,
    color = '#00FFFF',
    alpha = 0.7,
    angle = 0,
  } = entity;

  return (
    <View
      style={[
        styles.trail,
        {
          left: position.x,
          top: position.y - width / 2,
          width: length,
          height: width,
          backgroundColor: color,
          opacity: alpha,
          transform: [
            { rotate: `${angle}rad` },
          ],
        },
      ]}
    />
  );
}

function renderBasicEffect(entity) {
  const {
    position,
    width = 32,
    height = 32,
    color = '#FFFFFF',
    alpha = 1,
    scale = 1,
  } = entity;

  return (
    <View
      style={[
        styles.effect,
        {
          left: position.x - width / 2,
          top: position.y - height / 2,
          width,
          height,
          backgroundColor: color,
          opacity: alpha,
          transform: [
            { scale },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
  flash: {
    position: 'absolute',
    borderRadius: 8,
  },
  trail: {
    position: 'absolute',
    borderRadius: 2,
  },
  effect: {
    position: 'absolute',
    borderRadius: 4,
  },
});