/**
 * Sprite Frame Component
 * Displays a single frame from a sprite sheet
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SpriteFrame = ({ 
  source, 
  frameIndex = 0, 
  frameWidth = 64, 
  frameHeight = 64,
  columns = 4,
  rows = 4,
  scale = 1,
  tintColor = null,
  style = {}
}) => {
  // Calculate which frame to show
  const row = Math.floor(frameIndex / columns);
  const col = frameIndex % columns;
  
  // Calculate the position offset
  const offsetX = col * frameWidth;
  const offsetY = row * frameHeight;
  
  // Total sprite sheet dimensions
  const sheetWidth = columns * frameWidth;
  const sheetHeight = rows * frameHeight;
  
  // Debug log
  console.log('SpriteFrame rendering:', { frameIndex, frameWidth, frameHeight, scale });
  
  return (
    <View 
      style={[
        styles.container, 
        {
          width: frameWidth * scale,
          height: frameHeight * scale,
          backgroundColor: 'rgba(0,255,0,0.3)', // Debug: green background
        },
        style
      ]}
    >
      <View style={styles.clipContainer}>
        <Image
          source={source}
          style={[
            styles.sprite,
            {
              width: sheetWidth * scale,
              height: sheetHeight * scale,
              transform: [
                { translateX: -offsetX * scale },
                { translateY: -offsetY * scale }
              ]
            },
            tintColor && { tintColor }
          ]}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  
  clipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  
  sprite: {
    position: 'absolute',
  }
});

export default SpriteFrame;