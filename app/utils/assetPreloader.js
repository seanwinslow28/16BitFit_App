import { Asset } from 'expo-asset';

// Preload all character sprites
export const characterSprites = {
  'Idle_Pose': require('../assets/Sprites/Idle_Pose.png'),
  'Flex_Pose': require('../assets/Sprites/Flex_Pose.png'),
  'Post_Workout_Pose': require('../assets/Sprites/Post_Workout_Pose.png'),
  'Thumbs_Up_Pose': require('../assets/Sprites/Thumbs_Up_Pose.png'),
  'Sad_Pose': require('../assets/Sprites/Sad_Pose.png'),
  'Over_Eating_Pose': require('../assets/Sprites/Over_Eating_Pose.png'),
};

// Preload battle sprites
export const battleSprites = {
  'Sean_Fighter': require('../assets/Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png'),
  'Rookie_Ryu': require('../assets/Sprites/BossBattleSpriteSheets/Rookie_Ryu-Sprite-Sheet.png'),
  'Gym_Bully': require('../assets/Sprites/BossBattleSpriteSheets/Gym_Bully-Sprite-Sheet.png'),
  'Fit_Cat': require('../assets/Sprites/BossBattleSpriteSheets/Fit_Cat-Sprite-Sheet.png'),
  'Buff_Mage': require('../assets/Sprites/BossBattleSpriteSheets/Buff_Mage-Sprite-Sheet.png'),
};

// Function to preload all assets
export async function preloadAssets() {
  try {
    // Preload character sprites
    const characterAssets = Object.values(characterSprites).map(asset => 
      Asset.loadAsync(asset)
    );
    
    // Preload battle sprites
    const battleAssets = Object.values(battleSprites).map(asset => 
      Asset.loadAsync(asset)
    );
    
    // Wait for all assets to load
    await Promise.all([...characterAssets, ...battleAssets]);
    
    console.log('All assets preloaded successfully');
    return true;
  } catch (error) {
    console.error('Error preloading assets:', error);
    return false;
  }
}