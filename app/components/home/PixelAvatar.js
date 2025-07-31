import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Spacing } from '../../constants/DesignSystem';

/**
 * PixelAvatar Component - 12x12 pixel grid character representation
 * Optimized version using SVG for better performance
 */
const PixelAvatar = ({ evolutionStage = 1 }) => {
  // Define pixel patterns for different evolution stages
  const getPixelPattern = () => {
    // Basic pattern - can be expanded for different evolution stages
    const patterns = {
      1: [2, 3, 4, 5, 6, 7, 13, 22, 25, 30, 37, 40, 42, 43, 44, 45, 46, 52, 54, 57, 61, 64, 69, 76, 80, 81, 82, 83],
      2: [2, 3, 4, 5, 6, 7, 13, 14, 15, 16, 17, 18, 19, 22, 25, 30, 37, 40, 42, 43, 44, 45, 46, 52, 54, 57, 61, 64, 69, 76, 80, 81, 82, 83, 88, 92, 93, 94, 95],
      3: [2, 3, 4, 5, 6, 7, 13, 14, 15, 16, 17, 18, 19, 21, 22, 25, 26, 29, 30, 31, 36, 37, 38, 40, 42, 43, 44, 45, 46, 51, 52, 54, 55, 57, 61, 64, 66, 68, 69, 70, 75, 76, 80, 81, 82, 83, 88, 92, 93, 94, 95],
    };
    
    const darkPixels = patterns[evolutionStage] || patterns[1];
    const mediumPixels = darkPixels.map(i => i + 12).filter(i => i < 144);
    
    return { darkPixels, mediumPixels };
  };

  const { darkPixels, mediumPixels } = getPixelPattern();
  const pixelSize = 6;
  const gridSize = 12;

  // Generate SVG rectangles for pixels
  const renderPixels = () => {
    const pixels = [];
    
    for (let i = 0; i < 144; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const x = col * pixelSize;
      const y = row * pixelSize;
      
      let color = Colors.screen.lightestGreen;
      if (darkPixels.includes(i)) {
        color = Colors.screen.darkestGreen;
      } else if (mediumPixels.includes(i)) {
        color = Colors.screen.darkGreen;
      }
      
      pixels.push(
        <Rect
          key={i}
          x={x}
          y={y}
          width={pixelSize}
          height={pixelSize}
          fill={color}
        />
      );
    }
    
    return pixels;
  };

  return (
    <View style={styles.avatarContainer}>
      <Svg 
        width={72} 
        height={72} 
        viewBox="0 0 72 72"
      >
        {renderPixels()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 84,
    height: 84,
    backgroundColor: Colors.screen.darkGreen,
    borderRadius: 42,
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.screen.darkestGreen,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default React.memo(PixelAvatar);