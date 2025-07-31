import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Spacing, Effects } from '../../constants/DesignSystem';
import { StyleGuideComponents } from '../../constants/StyleGuideComponents';

// Sprite mapping object (Metro bundler requires static paths)
const SPRITE_MAP = {
  'Idle_Pose': require('../../assets/Sprites/Idle_Pose.png'),
  'Flex_Pose': require('../../assets/Sprites/Flex_Pose.png'),
  'Post_Workout_Pose': require('../../assets/Sprites/Post_Workout_Pose.png'),
  'Thumbs_Up_Pose': require('../../assets/Sprites/Thumbs_Up_Pose.png'),
  'Sad_Pose': require('../../assets/Sprites/Sad_Pose.png'),
  'Over_Eating_Pose': require('../../assets/Sprites/Over_Eating_Pose.png')
};

const CharacterDisplay = React.memo(({ characterStats }) => {
  const characterScale = useRef(new Animated.Value(1)).current;

  // Character breathing animation
  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(characterScale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(characterScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();
    
    return () => breathingAnimation.stop();
  }, [characterScale]);

  const getCharacterPose = () => {
    if (!characterStats) return 'Idle_Pose';
    
    const totalStats = characterStats.strength + characterStats.stamina + characterStats.health;
    
    if (totalStats > 250) return 'Flex_Pose';
    if (totalStats > 200) return 'Post_Workout_Pose';
    if (totalStats > 150) return 'Thumbs_Up_Pose';
    if (totalStats < 100) return 'Sad_Pose';
    return 'Idle_Pose';
  };

  // Get sprite source using static mapping
  const getCharacterSpriteSource = () => {
    const pose = getCharacterPose();
    return SPRITE_MAP[pose] || SPRITE_MAP['Idle_Pose'];
  };

  return (
    <View style={styles.container}>
      {/* Green screen area for character */}
      <View style={styles.screenArea}>
        {/* Scanline overlay effect */}
        <View style={styles.scanlineOverlay} />
        
        <Animated.View style={[styles.characterContainer, { transform: [{ scale: characterScale }] }]}>
          <Image
            source={getCharacterSpriteSource()}
            style={styles.characterSprite}
            contentFit="contain"
            transition={300}
          />
        </Animated.View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  screenArea: {
    ...StyleGuideComponents.ScreenArea.container,
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanlineOverlay: {
    ...StyleGuideComponents.ScreenArea.scanlineOverlay,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterSprite: {
    width: 128,
    height: 128,
    // Apply screen-appropriate styling for sprites
    tintColor: undefined, // Preserve original sprite colors
  },
});

export default CharacterDisplay;