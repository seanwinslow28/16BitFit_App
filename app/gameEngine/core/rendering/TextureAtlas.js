/**
 * Texture Atlas System for 16BitFit
 * Manages sprite sheets and texture atlases for optimal GPU performance
 */

export class TextureAtlas {
  constructor() {
    // Atlas configuration
    this.atlases = new Map();
    this.frameCache = new Map();
    
    // Define atlas layouts
    this.atlasDefinitions = {
      player: {
        source: require('../../../assets/Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png'),
        width: 1024,
        height: 1024,
        animations: {
          idle: {
            frames: [
              { x: 0, y: 0, w: 128, h: 128 },
              { x: 128, y: 0, w: 128, h: 128 },
              { x: 256, y: 0, w: 128, h: 128 },
              { x: 384, y: 0, w: 128, h: 128 },
            ],
            fps: 8,
            loop: true,
          },
          walk: {
            frames: [
              { x: 0, y: 128, w: 128, h: 128 },
              { x: 128, y: 128, w: 128, h: 128 },
              { x: 256, y: 128, w: 128, h: 128 },
              { x: 384, y: 128, w: 128, h: 128 },
              { x: 512, y: 128, w: 128, h: 128 },
              { x: 640, y: 128, w: 128, h: 128 },
            ],
            fps: 12,
            loop: true,
          },
          punch: {
            frames: [
              { x: 0, y: 256, w: 128, h: 128 },
              { x: 128, y: 256, w: 128, h: 128 },
              { x: 256, y: 256, w: 128, h: 128 },
              { x: 384, y: 256, w: 128, h: 128 },
            ],
            fps: 16,
            loop: false,
          },
          kick: {
            frames: [
              { x: 0, y: 384, w: 128, h: 128 },
              { x: 128, y: 384, w: 128, h: 128 },
              { x: 256, y: 384, w: 128, h: 128 },
              { x: 384, y: 384, w: 128, h: 128 },
            ],
            fps: 16,
            loop: false,
          },
          hurt: {
            frames: [
              { x: 0, y: 512, w: 128, h: 128 },
              { x: 128, y: 512, w: 128, h: 128 },
            ],
            fps: 8,
            loop: false,
          },
          block: {
            frames: [
              { x: 256, y: 512, w: 128, h: 128 },
            ],
            fps: 1,
            loop: false,
          },
          victory: {
            frames: [
              { x: 384, y: 512, w: 128, h: 128 },
              { x: 512, y: 512, w: 128, h: 128 },
              { x: 640, y: 512, w: 128, h: 128 },
            ],
            fps: 6,
            loop: true,
          },
        },
      },
      
      boss_sloth: {
        source: require('../../../assets/Sprites/BossBattleSpriteSheets/Gym_Bully-Sprite-Sheet.png'),
        width: 1024,
        height: 1024,
        animations: {
          idle: {
            frames: [
              { x: 0, y: 0, w: 128, h: 128 },
              { x: 128, y: 0, w: 128, h: 128 },
              { x: 256, y: 0, w: 128, h: 128 },
              { x: 384, y: 0, w: 128, h: 128 },
            ],
            fps: 6,
            loop: true,
          },
          attack: {
            frames: [
              { x: 0, y: 128, w: 128, h: 128 },
              { x: 128, y: 128, w: 128, h: 128 },
              { x: 256, y: 128, w: 128, h: 128 },
              { x: 384, y: 128, w: 128, h: 128 },
              { x: 512, y: 128, w: 128, h: 128 },
            ],
            fps: 12,
            loop: false,
          },
          special: {
            frames: [
              { x: 0, y: 256, w: 128, h: 128 },
              { x: 128, y: 256, w: 128, h: 128 },
              { x: 256, y: 256, w: 128, h: 128 },
              { x: 384, y: 256, w: 128, h: 128 },
              { x: 512, y: 256, w: 128, h: 128 },
              { x: 640, y: 256, w: 128, h: 128 },
            ],
            fps: 10,
            loop: false,
          },
        },
      },
      
      effects: {
        source: require('../../../assets/effects/effects_atlas.png'),
        width: 512,
        height: 512,
        animations: {
          hit_small: {
            frames: [
              { x: 0, y: 0, w: 64, h: 64 },
              { x: 64, y: 0, w: 64, h: 64 },
              { x: 128, y: 0, w: 64, h: 64 },
            ],
            fps: 20,
            loop: false,
          },
          hit_medium: {
            frames: [
              { x: 0, y: 64, w: 96, h: 96 },
              { x: 96, y: 64, w: 96, h: 96 },
              { x: 192, y: 64, w: 96, h: 96 },
              { x: 288, y: 64, w: 96, h: 96 },
            ],
            fps: 24,
            loop: false,
          },
          dust: {
            frames: [
              { x: 0, y: 160, w: 48, h: 48 },
              { x: 48, y: 160, w: 48, h: 48 },
              { x: 96, y: 160, w: 48, h: 48 },
              { x: 144, y: 160, w: 48, h: 48 },
            ],
            fps: 16,
            loop: false,
          },
          aura: {
            frames: [
              { x: 0, y: 208, w: 128, h: 128 },
              { x: 128, y: 208, w: 128, h: 128 },
              { x: 256, y: 208, w: 128, h: 128 },
              { x: 384, y: 208, w: 128, h: 128 },
            ],
            fps: 8,
            loop: true,
          },
        },
      },
    };
    
    // Animation state tracking
    this.animationStates = new Map();
  }
  
  loadAtlas(atlasId) {
    if (this.atlases.has(atlasId)) {
      return this.atlases.get(atlasId);
    }
    
    const definition = this.atlasDefinitions[atlasId];
    if (!definition) {
      console.warn(`Atlas not found: ${atlasId}`);
      return null;
    }
    
    const atlas = {
      id: atlasId,
      source: definition.source,
      width: definition.width,
      height: definition.height,
      animations: definition.animations,
      loaded: true,
    };
    
    this.atlases.set(atlasId, atlas);
    
    // Pre-cache all frames
    this.cacheAtlasFrames(atlasId, atlas);
    
    return atlas;
  }
  
  cacheAtlasFrames(atlasId, atlas) {
    Object.entries(atlas.animations).forEach(([animName, animData]) => {
      animData.frames.forEach((frame, index) => {
        const frameKey = `${atlasId}_${animName}_${index}`;
        this.frameCache.set(frameKey, {
          atlas: atlasId,
          source: atlas.source,
          x: frame.x,
          y: frame.y,
          width: frame.w,
          height: frame.h,
        });
      });
    });
  }
  
  getFrame(atlasId, animationName, frameIndex) {
    const frameKey = `${atlasId}_${animationName}_${frameIndex}`;
    let frame = this.frameCache.get(frameKey);
    
    if (!frame) {
      // Try to load atlas if not loaded
      const atlas = this.loadAtlas(atlasId);
      if (atlas) {
        frame = this.frameCache.get(frameKey);
      }
    }
    
    return frame;
  }
  
  getAnimation(atlasId, animationName) {
    const atlas = this.atlases.get(atlasId) || this.loadAtlas(atlasId);
    if (!atlas) return null;
    
    return atlas.animations[animationName];
  }
  
  createAnimationState(entityId, atlasId, animationName) {
    const animation = this.getAnimation(atlasId, animationName);
    if (!animation) return null;
    
    const state = {
      entityId,
      atlasId,
      animationName,
      currentFrame: 0,
      elapsedTime: 0,
      isPlaying: true,
      loops: 0,
      onComplete: null,
    };
    
    this.animationStates.set(entityId, state);
    return state;
  }
  
  updateAnimation(entityId, deltaTime) {
    const state = this.animationStates.get(entityId);
    if (!state || !state.isPlaying) return null;
    
    const animation = this.getAnimation(state.atlasId, state.animationName);
    if (!animation) return null;
    
    // Update elapsed time
    state.elapsedTime += deltaTime;
    
    // Calculate frame duration
    const frameDuration = 1000 / animation.fps;
    
    // Check if we need to advance frame
    if (state.elapsedTime >= frameDuration) {
      state.elapsedTime -= frameDuration;
      state.currentFrame++;
      
      // Handle animation end
      if (state.currentFrame >= animation.frames.length) {
        if (animation.loop) {
          state.currentFrame = 0;
          state.loops++;
        } else {
          state.currentFrame = animation.frames.length - 1;
          state.isPlaying = false;
          
          if (state.onComplete) {
            state.onComplete();
          }
        }
      }
    }
    
    // Return current frame data
    return this.getFrame(state.atlasId, state.animationName, state.currentFrame);
  }
  
  playAnimation(entityId, atlasId, animationName, onComplete) {
    const state = this.animationStates.get(entityId) || 
                  this.createAnimationState(entityId, atlasId, animationName);
    
    if (!state) return false;
    
    // Reset if switching animations
    if (state.animationName !== animationName || state.atlasId !== atlasId) {
      state.atlasId = atlasId;
      state.animationName = animationName;
      state.currentFrame = 0;
      state.elapsedTime = 0;
      state.loops = 0;
    }
    
    state.isPlaying = true;
    state.onComplete = onComplete;
    
    return true;
  }
  
  stopAnimation(entityId) {
    const state = this.animationStates.get(entityId);
    if (state) {
      state.isPlaying = false;
    }
  }
  
  setAnimationFrame(entityId, frameIndex) {
    const state = this.animationStates.get(entityId);
    if (state) {
      const animation = this.getAnimation(state.atlasId, state.animationName);
      if (animation && frameIndex < animation.frames.length) {
        state.currentFrame = frameIndex;
        state.elapsedTime = 0;
      }
    }
  }
  
  removeAnimationState(entityId) {
    this.animationStates.delete(entityId);
  }
  
  // Batch processing for multiple entities
  updateAnimationBatch(entities, deltaTime) {
    const updates = [];
    
    entities.forEach(entity => {
      if (entity.animationState) {
        const frame = this.updateAnimation(entity.id, deltaTime);
        if (frame) {
          updates.push({
            entityId: entity.id,
            frame,
          });
        }
      }
    });
    
    return updates;
  }
  
  // Memory management
  clearUnusedAtlases() {
    const usedAtlases = new Set();
    
    // Find atlases in use
    this.animationStates.forEach(state => {
      usedAtlases.add(state.atlasId);
    });
    
    // Remove unused atlases
    this.atlases.forEach((atlas, id) => {
      if (!usedAtlases.has(id)) {
        this.atlases.delete(id);
        
        // Clear associated frame cache
        this.frameCache.forEach((frame, key) => {
          if (frame.atlas === id) {
            this.frameCache.delete(key);
          }
        });
      }
    });
  }
  
  getStats() {
    return {
      loadedAtlases: this.atlases.size,
      cachedFrames: this.frameCache.size,
      activeAnimations: this.animationStates.size,
      memoryEstimateMB: this.estimateMemoryUsage(),
    };
  }
  
  estimateMemoryUsage() {
    // Rough estimate: 4 bytes per pixel
    let totalPixels = 0;
    
    this.atlases.forEach(atlas => {
      totalPixels += atlas.width * atlas.height;
    });
    
    return (totalPixels * 4) / (1024 * 1024); // Convert to MB
  }
  
  destroy() {
    this.atlases.clear();
    this.frameCache.clear();
    this.animationStates.clear();
  }
}

// Singleton instance
let textureAtlas = null;

export function getTextureAtlas() {
  if (!textureAtlas) {
    textureAtlas = new TextureAtlas();
  }
  return textureAtlas;
}

// Helper function to create sprite data from atlas frame
export function createSpriteFromAtlas(atlasId, animationName, frameIndex) {
  const atlas = getTextureAtlas();
  const frame = atlas.getFrame(atlasId, animationName, frameIndex);
  
  if (!frame) return null;
  
  return {
    source: frame.source,
    sourceRect: {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
    },
    width: frame.width,
    height: frame.height,
  };
}