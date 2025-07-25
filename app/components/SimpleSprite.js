import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SimpleSprite = ({ source, size = 64, tintColor = null, frameIndex = 0 }) => {
  // Sprite sheets are 1024x1024 with 4x4 grid, so each frame is 256x256
  const sheetSize = 1024;
  const gridSize = 4;
  const frameSize = sheetSize / gridSize; // 256x256 per frame
  const scale = size / frameSize; // Scale to fit desired size
  
  // Calculate which frame to show
  const row = Math.floor(frameIndex / gridSize);
  const col = frameIndex % gridSize;
  
  // Calculate pixel offset for the frame
  const offsetX = col * frameSize * scale;
  const offsetY = row * frameSize * scale;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.clipContainer}>
        <Image
          source={source}
          style={[
            styles.sprite,
            { 
              width: sheetSize * scale, // Full sprite sheet scaled
              height: sheetSize * scale,
              left: -offsetX, // Move sheet to show correct frame
              top: -offsetY,
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
    // Debug: uncomment to see sprite boundaries
    // borderWidth: 1,
    // borderColor: 'red',
  },
  clipContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  sprite: {
    position: 'absolute',
  }
});

export default SimpleSprite;