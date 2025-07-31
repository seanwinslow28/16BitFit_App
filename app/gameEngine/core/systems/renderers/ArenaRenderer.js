/**
 * Arena Renderer Component
 * Handles rendering of the battle arena/background
 */

import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ArenaRenderer = (entity) => {
  if (!entity || entity.type !== 'arena') return null;

  const {
    backgroundImage,
    backgroundColor = '#1a1a1a',
    floorY = SCREEN_HEIGHT * 0.75,
    floorColor = '#333333',
    parallaxLayers = [],
  } = entity;

  return (
    <View style={styles.arena}>
      {/* Sky/Background */}
      <View
        style={[
          styles.background,
          {
            backgroundColor,
          },
        ]}
      />
      
      {/* Background image if provided */}
      {backgroundImage && (
        <Image
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      
      {/* Parallax layers */}
      {parallaxLayers.map((layer, index) => (
        <View
          key={`parallax-${index}`}
          style={[
            styles.parallaxLayer,
            {
              transform: [
                { translateX: layer.offsetX || 0 },
                { translateY: layer.offsetY || 0 },
              ],
              opacity: layer.opacity || 1,
              zIndex: layer.zIndex || index,
            },
          ]}
        >
          {layer.image && (
            <Image
              source={layer.image}
              style={[
                styles.parallaxImage,
                {
                  width: layer.width || SCREEN_WIDTH,
                  height: layer.height || SCREEN_HEIGHT * 0.5,
                },
              ]}
              resizeMode={layer.resizeMode || 'cover'}
            />
          )}
        </View>
      ))}
      
      {/* Floor */}
      <View
        style={[
          styles.floor,
          {
            top: floorY,
            height: SCREEN_HEIGHT - floorY,
            backgroundColor: floorColor,
          },
        ]}
      >
        {/* Floor pattern/texture */}
        <View style={styles.floorPattern} />
      </View>
      
      {/* Stage boundaries (visual indicators) */}
      {__DEV__ && (
        <>
          <View style={[styles.boundary, styles.leftBoundary]} />
          <View style={[styles.boundary, styles.rightBoundary]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  arena: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  parallaxLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  parallaxImage: {
    position: 'absolute',
  },
  floor: {
    position: 'absolute',
    left: 0,
    width: '100%',
    borderTopWidth: 2,
    borderTopColor: '#222222',
  },
  floorPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1,
    backgroundColor: '#000000',
  },
  boundary: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  leftBoundary: {
    left: 50,
  },
  rightBoundary: {
    right: 50,
  },
});