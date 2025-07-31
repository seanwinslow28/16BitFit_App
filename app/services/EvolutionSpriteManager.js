/**
 * Evolution Sprite Manager
 * Handles sprite sheets and animations for different evolution stages
 */

import { Platform } from 'react-native';

export const SpriteSheetConfig = {
  // Base configuration for all sprite sheets
  frameWidth: 64,
  frameHeight: 96,
  columns: 8,
  rows: 8, // 64 frames total per evolution stage
  
  // Animation definitions per evolution stage
  animations: {
    // Basic Fighter (Stage 0) - Simple animations
    0: {
      idle: {
        frames: [0, 1, 2, 1], // 4 frames
        frameRate: 4,
        loop: true,
      },
      walk: {
        frames: [3, 4, 5, 6, 7, 8], // 6 frames
        frameRate: 8,
        loop: true,
      },
      attack: {
        frames: [9, 10, 11], // 3 frames
        frameRate: 10,
        loop: false,
      },
      hurt: {
        frames: [12, 13], // 2 frames
        frameRate: 8,
        loop: false,
      },
      victory: {
        frames: [14, 15, 16, 17], // 4 frames
        frameRate: 6,
        loop: false,
      },
      defeat: {
        frames: [18, 19], // 2 frames
        frameRate: 4,
        loop: false,
      },
    },
    
    // Intermediate Fighter (Stage 1) - More fluid animations
    1: {
      idle: {
        frames: [0, 1, 2, 3, 4, 3, 2, 1], // 8 frames
        frameRate: 6,
        loop: true,
      },
      walk: {
        frames: [5, 6, 7, 8, 9, 10, 11, 12], // 8 frames
        frameRate: 10,
        loop: true,
      },
      attack: {
        frames: [13, 14, 15, 16, 17], // 5 frames
        frameRate: 12,
        loop: false,
      },
      special: {
        frames: [18, 19, 20, 21, 22], // 5 frames - New special move
        frameRate: 10,
        loop: false,
      },
      hurt: {
        frames: [23, 24, 25], // 3 frames
        frameRate: 10,
        loop: false,
      },
      victory: {
        frames: [26, 27, 28, 29, 30, 31], // 6 frames
        frameRate: 8,
        loop: false,
      },
      defeat: {
        frames: [32, 33, 34], // 3 frames
        frameRate: 6,
        loop: false,
      },
      powerUp: {
        frames: [35, 36, 37, 38, 39], // 5 frames - Energy charge
        frameRate: 12,
        loop: true,
      },
    },
    
    // Advanced Fighter (Stage 2) - Complex animations with effects
    2: {
      idle: {
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1], // 16 frames
        frameRate: 8,
        loop: true,
      },
      walk: {
        frames: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], // 10 frames
        frameRate: 12,
        loop: true,
      },
      attack: {
        frames: [19, 20, 21, 22, 23, 24], // 6 frames
        frameRate: 15,
        loop: false,
      },
      special: {
        frames: [25, 26, 27, 28, 29, 30, 31, 32], // 8 frames
        frameRate: 12,
        loop: false,
      },
      ultimate: {
        frames: [33, 34, 35, 36, 37, 38, 39, 40, 41], // 9 frames - New ultimate
        frameRate: 10,
        loop: false,
      },
      hurt: {
        frames: [42, 43, 44, 45], // 4 frames
        frameRate: 12,
        loop: false,
      },
      victory: {
        frames: [46, 47, 48, 49, 50, 51, 52, 53], // 8 frames
        frameRate: 10,
        loop: false,
      },
      defeat: {
        frames: [54, 55, 56, 57], // 4 frames
        frameRate: 8,
        loop: false,
      },
      powerUp: {
        frames: [58, 59, 60, 61, 62, 63], // 6 frames
        frameRate: 15,
        loop: true,
      },
    },
    
    // Master Fighter (Stage 3) - Masterful animations
    3: {
      idle: {
        frames: Array.from({length: 20}, (_, i) => i), // 20 frames
        frameRate: 10,
        loop: true,
      },
      walk: {
        frames: Array.from({length: 12}, (_, i) => i + 20), // 12 frames
        frameRate: 14,
        loop: true,
      },
      attack: {
        frames: [32, 33, 34, 35, 36, 37, 38], // 7 frames
        frameRate: 18,
        loop: false,
      },
      special: {
        frames: [39, 40, 41, 42, 43, 44, 45, 46, 47], // 9 frames
        frameRate: 14,
        loop: false,
      },
      ultimate: {
        frames: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57], // 10 frames
        frameRate: 12,
        loop: false,
      },
      combo: {
        frames: [58, 59, 60, 61, 62, 63], // 6 frames - Combo attack
        frameRate: 20,
        loop: false,
      },
    },
    
    // Legend Fighter (Stage 4) - Epic animations
    4: {
      idle: {
        frames: Array.from({length: 24}, (_, i) => i), // 24 frames - floating idle
        frameRate: 12,
        loop: true,
      },
      walk: {
        frames: Array.from({length: 16}, (_, i) => i + 24), // 16 frames - hovering walk
        frameRate: 16,
        loop: true,
      },
      attack: {
        frames: Array.from({length: 8}, (_, i) => i + 40), // 8 frames
        frameRate: 20,
        loop: false,
      },
      special: {
        frames: Array.from({length: 12}, (_, i) => i + 48), // 12 frames
        frameRate: 16,
        loop: false,
      },
      ultimate: {
        frames: [60, 61, 62, 63, 0, 1, 2, 3, 4, 5, 6, 7], // 12 frames - wraparound
        frameRate: 14,
        loop: false,
      },
      transcendent: {
        frames: Array.from({length: 16}, (_, i) => (i + 8) % 64), // 16 frames - divine move
        frameRate: 12,
        loop: false,
      },
    },
  },
};

class EvolutionSpriteManager {
  constructor() {
    this.loadedSprites = new Map();
    this.animationTimers = new Map();
  }

  /**
   * Get sprite sheet path for evolution stage
   */
  getSpritePath(evolutionStage, variant = 'default') {
    const basePath = Platform.select({
      ios: 'sprites/',
      android: 'sprites/',
      default: '/sprites/',
    });

    const stageNames = ['basic', 'intermediate', 'advanced', 'master', 'legend'];
    const stageName = stageNames[evolutionStage] || 'basic';
    
    return `${basePath}character_${stageName}_${variant}.png`;
  }

  /**
   * Get animation configuration for a specific evolution stage
   */
  getAnimationConfig(evolutionStage, animationName) {
    const stageAnimations = SpriteSheetConfig.animations[evolutionStage];
    if (!stageAnimations) {
      // Fallback to basic animations
      return SpriteSheetConfig.animations[0][animationName];
    }
    return stageAnimations[animationName] || stageAnimations.idle;
  }

  /**
   * Calculate sprite position in sheet
   */
  getFramePosition(frameIndex) {
    const { frameWidth, frameHeight, columns } = SpriteSheetConfig;
    const x = (frameIndex % columns) * frameWidth;
    const y = Math.floor(frameIndex / columns) * frameHeight;
    return { x, y, width: frameWidth, height: frameHeight };
  }

  /**
   * Get all available animations for an evolution stage
   */
  getAvailableAnimations(evolutionStage) {
    return Object.keys(SpriteSheetConfig.animations[evolutionStage] || {});
  }

  /**
   * Create animation sequence
   */
  createAnimationSequence(evolutionStage, animations) {
    const sequences = [];
    
    for (const animName of animations) {
      const config = this.getAnimationConfig(evolutionStage, animName);
      if (config) {
        sequences.push({
          name: animName,
          frames: config.frames,
          frameRate: config.frameRate,
          loop: config.loop,
        });
      }
    }
    
    return sequences;
  }

  /**
   * Calculate frame timing
   */
  getFrameDuration(frameRate) {
    return 1000 / frameRate;
  }

  /**
   * Get special effect overlays for evolution stage
   */
  getEvolutionEffects(evolutionStage) {
    const effects = {
      0: [], // No effects for basic
      1: ['energy_wisps'], // Simple energy effect
      2: ['power_flames', 'energy_wisps'], // Multiple effects
      3: ['golden_aura', 'power_flames', 'energy_orbs'], // Complex effects
      4: ['cosmic_energy', 'divine_light', 'power_stones', 'reality_distortion'], // Epic effects
    };
    
    return effects[evolutionStage] || [];
  }

  /**
   * Get equipment overlay positions
   */
  getEquipmentPositions(evolutionStage) {
    const positions = {
      belt: { x: 32, y: 60, scale: 1 },
      headband: { x: 32, y: 10, scale: 0.8 },
      gloves: { x: 20, y: 45, scale: 0.7 },
      bracers: { x: 44, y: 45, scale: 0.7 },
      crown: { x: 32, y: 5, scale: 1.2 },
      wings: { x: 32, y: 30, scale: 1.5 },
      orbs: { x: 32, y: 48, scale: 1 },
    };
    
    // Scale positions based on evolution stage
    const scaleMultiplier = 1 + (evolutionStage * 0.1);
    
    return Object.entries(positions).reduce((acc, [key, pos]) => {
      acc[key] = {
        ...pos,
        scale: pos.scale * scaleMultiplier,
      };
      return acc;
    }, {});
  }

  /**
   * Preload sprites for evolution stage
   */
  async preloadEvolutionSprites(evolutionStage) {
    const spritePath = this.getSpritePath(evolutionStage);
    // In a real implementation, this would load the actual sprite sheet
    // For now, we'll just mark it as loaded
    this.loadedSprites.set(evolutionStage, true);
    return true;
  }

  /**
   * Clear cached sprites
   */
  clearCache(evolutionStage = null) {
    if (evolutionStage !== null) {
      this.loadedSprites.delete(evolutionStage);
    } else {
      this.loadedSprites.clear();
    }
  }

  /**
   * Stop all animations
   */
  stopAllAnimations() {
    this.animationTimers.forEach(timer => clearInterval(timer));
    this.animationTimers.clear();
  }
}

// Singleton instance
const spriteManager = new EvolutionSpriteManager();
export default spriteManager;