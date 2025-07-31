/**
 * Asset Manager - Handles sprite sheets, audio, and resource optimization
 * Implements texture atlasing and lazy loading for mobile performance
 */

export default class AssetManager {
  constructor(scene) {
    this.scene = scene;
    this.loadedAssets = new Map();
    this.textureAtlases = new Map();
    this.audioBuffers = new Map();
    this.loadQueue = [];
    this.isLoading = false;
    
    // Performance settings
    this.maxTextureSize = 2048;
    this.compressionQuality = 0.8;
    this.audioFormat = this.detectAudioFormat();
    
    // Asset priorities
    this.priorities = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
  }

  detectAudioFormat() {
    const audio = document.createElement('audio');
    
    if (audio.canPlayType('audio/webm')) {
      return 'webm';
    } else if (audio.canPlayType('audio/mp3')) {
      return 'mp3';
    } else if (audio.canPlayType('audio/ogg')) {
      return 'ogg';
    }
    
    return 'mp3'; // Fallback
  }

  // Asset manifest for organized loading
  createAssetManifest() {
    return {
      critical: {
        sprites: [
          { key: 'brawler-idle', path: 'characters/brawler/idle.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
          { key: 'speedster-idle', path: 'characters/speedster/idle.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
          { key: 'technician-idle', path: 'characters/technician/idle.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 }
        ],
        audio: [
          { key: 'hit1', path: 'audio/sfx/hit1' },
          { key: 'block1', path: 'audio/sfx/block1' },
          { key: 'voice-fight', path: 'audio/voice/fight' }
        ],
        ui: [
          { key: 'healthbar-bg', path: 'ui/healthbar-bg.png' },
          { key: 'healthbar-fill', path: 'ui/healthbar-fill.png' },
          { key: 'touch-button', path: 'ui/touch-button.png' }
        ]
      },
      high: {
        sprites: [
          { key: 'brawler-walk', path: 'characters/brawler/walk.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
          { key: 'brawler-attack', path: 'characters/brawler/attack.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 }
        ],
        effects: [
          { key: 'hit-spark', path: 'effects/hit-spark.png', type: 'spritesheet', frameWidth: 64, frameHeight: 64 },
          { key: 'block-spark', path: 'effects/block-spark.png', type: 'spritesheet', frameWidth: 64, frameHeight: 64 }
        ]
      },
      medium: {
        backgrounds: [
          { key: 'bg-gym', path: 'backgrounds/gym.png' },
          { key: 'bg-gym-far', path: 'backgrounds/gym-far.png' },
          { key: 'bg-gym-mid', path: 'backgrounds/gym-mid.png' }
        ],
        audio: [
          { key: 'music-battle', path: 'audio/music/battle' },
          { key: 'music-menu', path: 'audio/music/menu' }
        ]
      },
      low: {
        sprites: [
          { key: 'boss-sedentary', path: 'bosses/sedentary/spritesheet.png', type: 'spritesheet', frameWidth: 192, frameHeight: 192 }
        ],
        particles: [
          { key: 'particle-star', path: 'effects/particle-star.png' },
          { key: 'particle-dust', path: 'effects/particle-dust.png' }
        ]
      }
    };
  }

  // Priority-based loading
  loadAssetsByPriority(priority = 'critical') {
    const manifest = this.createAssetManifest();
    const assets = manifest[priority];
    
    if (!assets) return Promise.resolve();
    
    const loadPromises = [];
    
    // Load each asset type
    Object.entries(assets).forEach(([type, items]) => {
      items.forEach(item => {
        loadPromises.push(this.loadAsset(item, type));
      });
    });
    
    return Promise.all(loadPromises);
  }

  loadAsset(item, type) {
    return new Promise((resolve, reject) => {
      const loader = this.scene.load;
      
      // Add to load queue
      switch (item.type || type) {
        case 'spritesheet':
          loader.spritesheet(item.key, item.path, {
            frameWidth: item.frameWidth,
            frameHeight: item.frameHeight
          });
          break;
          
        case 'image':
        case 'sprites':
        case 'backgrounds':
        case 'particles':
        case 'ui':
          loader.image(item.key, item.path);
          break;
          
        case 'audio':
          loader.audio(item.key, `${item.path}.${this.audioFormat}`);
          break;
          
        case 'atlas':
          loader.atlas(item.key, item.texture, item.atlas);
          break;
      }
      
      // Set up callbacks
      loader.once(`filecomplete-${item.type || type}-${item.key}`, () => {
        this.loadedAssets.set(item.key, item);
        resolve(item);
      });
      
      loader.once(`loaderror`, (file) => {
        if (file.key === item.key) {
          console.error(`Failed to load asset: ${item.key}`);
          reject(new Error(`Failed to load ${item.key}`));
        }
      });
    });
  }

  // Texture atlas creation for better batching
  createTextureAtlas(atlasKey, textures) {
    const canvas = document.createElement('canvas');
    canvas.width = this.maxTextureSize;
    canvas.height = this.maxTextureSize;
    const ctx = canvas.getContext('2d');
    
    const atlas = {
      frames: {},
      meta: {
        app: '16BitFit',
        version: '1.0',
        image: atlasKey,
        size: { w: canvas.width, h: canvas.height },
        scale: '1'
      }
    };
    
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    
    textures.forEach(textureKey => {
      const texture = this.scene.textures.get(textureKey);
      const frame = texture.get();
      
      // Check if texture fits in current row
      if (x + frame.width > canvas.width) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }
      
      // Draw texture to atlas
      ctx.drawImage(frame.source.image, x, y);
      
      // Add frame data
      atlas.frames[textureKey] = {
        frame: { x, y, w: frame.width, h: frame.height },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height },
        sourceSize: { w: frame.width, h: frame.height }
      };
      
      // Update position
      x += frame.width;
      rowHeight = Math.max(rowHeight, frame.height);
    });
    
    // Create texture from canvas
    this.scene.textures.addCanvas(atlasKey, canvas);
    this.textureAtlases.set(atlasKey, atlas);
    
    return atlas;
  }

  // Sprite sheet optimization
  optimizeSpriteSheet(key, frameWidth, frameHeight) {
    const texture = this.scene.textures.get(key);
    if (!texture) return;
    
    const source = texture.source[0];
    const width = source.width;
    const height = source.height;
    
    // Calculate optimal frame layout
    const framesX = Math.floor(width / frameWidth);
    const framesY = Math.floor(height / frameHeight);
    const totalFrames = framesX * framesY;
    
    // Generate frame data
    const frames = [];
    for (let y = 0; y < framesY; y++) {
      for (let x = 0; x < framesX; x++) {
        frames.push({
          x: x * frameWidth,
          y: y * frameHeight,
          width: frameWidth,
          height: frameHeight
        });
      }
    }
    
    return {
      key,
      frames,
      totalFrames,
      frameWidth,
      frameHeight
    };
  }

  // Audio management
  preloadAudio(keys) {
    const promises = keys.map(key => {
      return new Promise((resolve) => {
        const audio = this.scene.sound.add(key);
        
        // Pre-decode audio for better performance
        if (audio.source) {
          this.audioBuffers.set(key, audio);
          resolve(audio);
        } else {
          // Fallback for failed audio
          resolve(null);
        }
      });
    });
    
    return Promise.all(promises);
  }

  // Memory management
  unloadAsset(key) {
    if (this.loadedAssets.has(key)) {
      // Remove from texture cache
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
      }
      
      // Remove from sound cache
      if (this.scene.cache.audio.exists(key)) {
        this.scene.cache.audio.remove(key);
      }
      
      // Remove from tracking
      this.loadedAssets.delete(key);
      this.audioBuffers.delete(key);
    }
  }

  // Batch unloading for scene transitions
  unloadAssetGroup(group) {
    const manifest = this.createAssetManifest();
    const assets = manifest[group];
    
    if (!assets) return;
    
    Object.values(assets).flat().forEach(item => {
      this.unloadAsset(item.key);
    });
  }

  // Get memory usage estimation
  getMemoryUsage() {
    let textureMemory = 0;
    let audioMemory = 0;
    
    // Calculate texture memory
    this.loadedAssets.forEach((asset, key) => {
      if (this.scene.textures.exists(key)) {
        const texture = this.scene.textures.get(key);
        const source = texture.source[0];
        textureMemory += source.width * source.height * 4; // 4 bytes per pixel
      }
    });
    
    // Estimate audio memory
    audioMemory = this.audioBuffers.size * 100000; // Rough estimate
    
    return {
      textures: Math.round(textureMemory / 1024 / 1024), // MB
      audio: Math.round(audioMemory / 1024 / 1024), // MB
      total: Math.round((textureMemory + audioMemory) / 1024 / 1024) // MB
    };
  }

  // Dynamic quality adjustment
  adjustQualityForPerformance(fps) {
    if (fps < 30) {
      // Reduce texture quality
      this.compressionQuality = Math.max(0.5, this.compressionQuality - 0.1);
      
      // Unload non-critical assets
      this.unloadAssetGroup('low');
      
      return 'low';
    } else if (fps < 45) {
      this.compressionQuality = 0.7;
      return 'medium';
    } else {
      this.compressionQuality = 0.8;
      return 'high';
    }
  }

  // Preload essential combat assets
  preloadCombatAssets(characterType) {
    const essentialAssets = [
      `${characterType}-idle`,
      `${characterType}-walk`,
      `${characterType}-attack`,
      `${characterType}-hit`,
      'hit-spark',
      'block-spark',
      'hit1',
      'hit2',
      'block1'
    ];
    
    return this.preloadAssets(essentialAssets);
  }

  preloadAssets(keys) {
    const promises = keys.map(key => {
      if (this.loadedAssets.has(key)) {
        return Promise.resolve(); // Already loaded
      }
      
      // Find asset in manifest
      const manifest = this.createAssetManifest();
      for (const [priority, assets] of Object.entries(manifest)) {
        for (const [type, items] of Object.entries(assets)) {
          const item = items.find(i => i.key === key);
          if (item) {
            return this.loadAsset(item, type);
          }
        }
      }
      
      return Promise.reject(new Error(`Asset ${key} not found in manifest`));
    });
    
    return Promise.all(promises);
  }
}