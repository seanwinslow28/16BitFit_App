/**
 * Asset Manager for sprite and resource management
 * Handles preloading and caching of game assets
 */

import { Image } from 'react-native';
import imageCache from '../../../services/ImageCache';

export class AssetManager {
  constructor() {
    this.assets = new Map();
    this.loaded = false;
    
    // Asset definitions
    this.assetConfig = {
      sprites: {
        // Player sprites
        player: require('../../../assets/Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png'),
        
        // Boss sprites
        boss_sloth: require('../../../assets/Sprites/BossBattleSpriteSheets/Gym_Bully-Sprite-Sheet.png'),
        boss_junk: require('../../../assets/Sprites/BossBattleSpriteSheets/Fit_Cat-Sprite-Sheet.png'),
        boss_procrastination: require('../../../assets/Sprites/BossBattleSpriteSheets/Buff_Mage-Sprite-Sheet.png'),
        boss_stress: require('../../../assets/Sprites/BossBattleSpriteSheets/Rookie_Ryu-Sprite-Sheet.png'),
        boss_default: require('../../../assets/Sprites/BossBattleSpriteSheets/Rookie_Ryu-Sprite-Sheet.png'),
        
        // Effect sprites
        hit_normal: require('../../../assets/effects/hit_normal.png'),
        hit_heavy: require('../../../assets/effects/hit_heavy.png'),
        dust: require('../../../assets/effects/dust.png'),
        aura: require('../../../assets/effects/aura.png'),
      },
      
      backgrounds: {
        default: require('../../../assets/Backgrounds/Main_Background.png'),
        dojo: require('../../../assets/Backgrounds/Tranquil_Dojo_Backround.png'),
        warehouse: require('../../../assets/Backgrounds/Industrial_Warehouse_at_Dusk.png'),
      },
      
      // Audio assets would go here
      sounds: {
        // punch: require('../../../assets/sounds/punch.mp3'),
        // kick: require('../../../assets/sounds/kick.mp3'),
        // block: require('../../../assets/sounds/block.mp3'),
        // special: require('../../../assets/sounds/special.mp3'),
      },
    };
  }
  
  async loadAssets() {
    if (this.loaded) return;
    
    const loadPromises = [];
    
    // Load sprites
    Object.entries(this.assetConfig.sprites).forEach(([key, source]) => {
      // Check if the asset exists before trying to load
      try {
        const asset = imageCache.getImage(`sprite_${key}`, () => source);
        this.assets.set(`sprite_${key}`, asset);
        
        // Preload image
        const promise = Image.prefetch(Image.resolveAssetSource(asset).uri)
          .catch(err => {
            console.warn(`Failed to prefetch sprite ${key}:`, err);
            // Create placeholder if sprite doesn't exist
            this.createPlaceholderSprite(key);
          });
        
        loadPromises.push(promise);
      } catch (error) {
        console.warn(`Failed to load sprite ${key}:`, error);
        this.createPlaceholderSprite(key);
      }
    });
    
    // Load backgrounds
    Object.entries(this.assetConfig.backgrounds).forEach(([key, source]) => {
      try {
        const asset = imageCache.getImage(`bg_${key}`, () => source);
        this.assets.set(`bg_${key}`, asset);
        
        const promise = Image.prefetch(Image.resolveAssetSource(asset).uri)
          .catch(err => {
            console.warn(`Failed to prefetch background ${key}:`, err);
          });
        
        loadPromises.push(promise);
      } catch (error) {
        console.warn(`Failed to load background ${key}:`, error);
      }
    });
    
    // Wait for all assets to load
    await Promise.all(loadPromises);
    
    this.loaded = true;
  }
  
  createPlaceholderSprite(key) {
    // Create a simple placeholder object that won't crash the renderer
    this.assets.set(`sprite_${key}`, {
      uri: 'placeholder',
      width: 64,
      height: 96,
    });
  }
  
  getSprite(key) {
    // Map boss IDs to sprite keys
    const spriteMap = {
      'sloth_demon': 'boss_sloth',
      'junk_food_monster': 'boss_junk',
      'procrastination_phantom': 'boss_procrastination',
      'stress_titan': 'boss_stress',
    };
    
    const spriteKey = spriteMap[key] || key;
    const asset = this.assets.get(`sprite_${spriteKey}`);
    
    if (!asset) {
      console.warn(`Sprite not found: ${spriteKey}`);
      return this.assets.get('sprite_boss_default');
    }
    
    return asset;
  }
  
  getBackground(key) {
    const bgMap = {
      'sloth_demon': 'warehouse',
      'junk_food_monster': 'dojo',
      'procrastination_phantom': 'default',
      'stress_titan': 'warehouse',
    };
    
    const bgKey = bgMap[key] || key;
    const asset = this.assets.get(`bg_${bgKey}`);
    
    if (!asset) {
      console.warn(`Background not found: ${bgKey}`);
      return this.assets.get('bg_default');
    }
    
    return asset;
  }
  
  getSound(key) {
    return this.assets.get(`sound_${key}`);
  }
  
  cleanup() {
    // Clear references but keep cache
    this.assets.clear();
    this.loaded = false;
  }
  
  // Utility method to check if assets exist
  checkAssetAvailability() {
    const missing = [];
    
    Object.keys(this.assetConfig.sprites).forEach(key => {
      if (!this.assets.has(`sprite_${key}`)) {
        missing.push(`sprite_${key}`);
      }
    });
    
    Object.keys(this.assetConfig.backgrounds).forEach(key => {
      if (!this.assets.has(`bg_${key}`)) {
        missing.push(`bg_${key}`);
      }
    });
    
    if (missing.length > 0) {
      console.warn('Missing assets:', missing);
    }
    
    return missing;
  }
}