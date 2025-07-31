/**
 * Asset Manager for 16BitFit
 * Handles progressive loading, texture atlasing, and memory optimization
 */

import { bridge } from '../bridge/WebViewBridge';

export class AssetManager {
  constructor(scene) {
    this.scene = scene;
    this.loadedAssets = new Map();
    this.textureAtlases = new Map();
    this.audioBuffers = new Map();
    this.loadProgress = 0;
    this.priorityQueue = [];
    this.isLoading = false;
    
    // Memory management
    this.maxTextureMemory = 100 * 1024 * 1024; // 100MB limit
    this.currentTextureMemory = 0;
    
    // Performance tracking
    this.loadTimes = new Map();
    
    this.setupLoadHandlers();
  }

  setupLoadHandlers() {
    this.scene.load.on('progress', (value) => {
      this.loadProgress = value;
      bridge.send('ASSET_LOAD_PROGRESS', { 
        progress: value,
        phase: this.currentLoadPhase 
      });
    });

    this.scene.load.on('complete', () => {
      this.onLoadComplete();
    });

    this.scene.load.on('loaderror', (file) => {
      console.error('Asset load error:', file.key);
      bridge.send('ASSET_LOAD_ERROR', { 
        asset: file.key,
        type: file.type 
      });
    });
  }

  // Priority-based asset loading
  loadAssets(assetManifest) {
    this.currentLoadPhase = 'initial';
    
    // Sort assets by priority
    const prioritizedAssets = this.prioritizeAssets(assetManifest);
    
    // Load critical assets first
    this.loadCriticalAssets(prioritizedAssets.critical);
    
    // Queue other assets for progressive loading
    this.priorityQueue = [
      ...prioritizedAssets.high,
      ...prioritizedAssets.medium,
      ...prioritizedAssets.low
    ];
    
    this.scene.load.start();
  }

  prioritizeAssets(manifest) {
    return {
      critical: manifest.filter(a => a.priority === 'critical'),
      high: manifest.filter(a => a.priority === 'high'),
      medium: manifest.filter(a => a.priority === 'medium'),
      low: manifest.filter(a => a.priority === 'low' || !a.priority)
    };
  }

  loadCriticalAssets(assets) {
    assets.forEach(asset => {
      const startTime = performance.now();
      
      switch (asset.type) {
        case 'atlas':
          this.loadTextureAtlas(asset);
          break;
        case 'sprite':
          this.loadSprite(asset);
          break;
        case 'audio':
          this.loadAudio(asset);
          break;
        case 'json':
          this.loadJSON(asset);
          break;
      }
      
      this.loadTimes.set(asset.key, performance.now() - startTime);
    });
  }

  loadTextureAtlas(asset) {
    // Optimize texture atlas loading for mobile
    this.scene.load.atlas(
      asset.key,
      asset.texture,
      asset.atlas,
      {
        // WebView optimizations
        crossOrigin: 'anonymous',
        // Progressive loading
        onProgress: (loaded, total) => {
          this.updateAssetProgress(asset.key, loaded / total);
        }
      }
    );
  }

  loadSprite(asset) {
    // Load individual sprites with frame configuration
    if (asset.frameConfig) {
      this.scene.load.spritesheet(asset.key, asset.url, asset.frameConfig);
    } else {
      this.scene.load.image(asset.key, asset.url);
    }
  }

  loadAudio(asset) {
    // Load audio with format fallbacks
    const audioConfig = {
      instances: asset.instances || 1,
      // Use Web Audio API for lower latency
      context: this.scene.sound.context
    };
    
    if (Array.isArray(asset.url)) {
      this.scene.load.audio(asset.key, asset.url, audioConfig);
    } else {
      // Single format
      this.scene.load.audio(asset.key, [asset.url], audioConfig);
    }
  }

  loadJSON(asset) {
    this.scene.load.json(asset.key, asset.url);
  }

  // Progressive loading for non-critical assets
  loadNextBatch(batchSize = 5) {
    if (this.isLoading || this.priorityQueue.length === 0) return;
    
    this.isLoading = true;
    this.currentLoadPhase = 'progressive';
    
    const batch = this.priorityQueue.splice(0, batchSize);
    batch.forEach(asset => this.loadAsset(asset));
    
    this.scene.load.start();
  }

  loadAsset(asset) {
    // Check memory before loading textures
    if ((asset.type === 'atlas' || asset.type === 'sprite') && 
        !this.canLoadTexture(asset.estimatedSize)) {
      this.performMemoryCleanup();
    }
    
    switch (asset.type) {
      case 'atlas':
        this.loadTextureAtlas(asset);
        break;
      case 'sprite':
        this.loadSprite(asset);
        break;
      case 'audio':
        this.loadAudio(asset);
        break;
      case 'json':
        this.loadJSON(asset);
        break;
    }
  }

  // Memory management
  canLoadTexture(estimatedSize) {
    return this.currentTextureMemory + estimatedSize < this.maxTextureMemory;
  }

  performMemoryCleanup() {
    // Remove least recently used textures
    const textures = Array.from(this.loadedAssets.entries())
      .filter(([_, asset]) => asset.type === 'texture')
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    
    let freedMemory = 0;
    const targetFree = this.maxTextureMemory * 0.2; // Free 20%
    
    for (const [key, asset] of textures) {
      if (freedMemory >= targetFree) break;
      
      if (!asset.critical) {
        this.unloadAsset(key);
        freedMemory += asset.size;
      }
    }
    
    bridge.send('MEMORY_CLEANUP', {
      freed: freedMemory,
      current: this.currentTextureMemory
    });
  }

  unloadAsset(key) {
    const asset = this.loadedAssets.get(key);
    if (!asset) return;
    
    switch (asset.type) {
      case 'texture':
      case 'atlas':
        this.scene.textures.remove(key);
        this.currentTextureMemory -= asset.size;
        break;
      case 'audio':
        this.scene.cache.audio.remove(key);
        break;
    }
    
    this.loadedAssets.delete(key);
  }

  // Character sprite management
  loadCharacterSprites(characterData) {
    const spritesToLoad = [];
    
    // Evolution stages
    characterData.evolutionStages.forEach((stage, index) => {
      spritesToLoad.push({
        key: `${characterData.id}_stage_${index}`,
        type: 'atlas',
        texture: stage.texture,
        atlas: stage.atlas,
        priority: index === characterData.currentStage ? 'critical' : 'high',
        estimatedSize: stage.size || 2 * 1024 * 1024 // 2MB default
      });
    });
    
    // Load sprites based on current evolution
    this.loadAssets(spritesToLoad);
  }

  // Combat asset loading
  loadCombatAssets(battleData) {
    const assets = [
      // Stage background
      {
        key: `stage_${battleData.stageId}`,
        type: 'sprite',
        url: `assets/stages/${battleData.stageId}/background.png`,
        priority: 'critical'
      },
      // Boss sprites
      {
        key: `boss_${battleData.bossId}`,
        type: 'atlas',
        texture: `assets/bosses/${battleData.bossId}/sprites.png`,
        atlas: `assets/bosses/${battleData.bossId}/sprites.json`,
        priority: 'critical'
      },
      // Combat sounds
      {
        key: 'hit_sounds',
        type: 'audio',
        url: ['assets/audio/combat/hits.ogg', 'assets/audio/combat/hits.mp3'],
        priority: 'high'
      }
    ];
    
    this.loadAssets(assets);
  }

  // Get loaded asset
  getAsset(key) {
    const asset = this.loadedAssets.get(key);
    if (asset) {
      asset.lastUsed = Date.now();
      return asset.data;
    }
    return null;
  }

  // Callbacks
  onLoadComplete() {
    this.isLoading = false;
    
    bridge.send('ASSETS_LOADED', {
      phase: this.currentLoadPhase,
      loadedCount: this.loadedAssets.size,
      memoryUsage: this.currentTextureMemory,
      loadTimes: Object.fromEntries(this.loadTimes)
    });
    
    // Continue progressive loading
    if (this.priorityQueue.length > 0) {
      setTimeout(() => this.loadNextBatch(), 100);
    }
  }

  updateAssetProgress(key, progress) {
    bridge.send('ASSET_PROGRESS', {
      asset: key,
      progress: progress
    });
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      totalAssets: this.loadedAssets.size,
      textureMemory: this.currentTextureMemory,
      avgLoadTime: this.calculateAverageLoadTime(),
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  calculateAverageLoadTime() {
    if (this.loadTimes.size === 0) return 0;
    
    const total = Array.from(this.loadTimes.values()).reduce((a, b) => a + b, 0);
    return total / this.loadTimes.size;
  }

  calculateCacheHitRate() {
    // Implementation depends on caching strategy
    return 0.85; // Placeholder
  }

  destroy() {
    this.loadedAssets.clear();
    this.textureAtlases.clear();
    this.audioBuffers.clear();
    this.priorityQueue = [];
  }
}

// Asset manifest structure
export const ASSET_MANIFEST = {
  critical: [
    // UI elements
    {
      key: 'ui_atlas',
      type: 'atlas',
      texture: 'assets/ui/ui_sprites.png',
      atlas: 'assets/ui/ui_sprites.json',
      priority: 'critical'
    },
    // Main character base sprite
    {
      key: 'character_base',
      type: 'atlas',
      texture: 'assets/characters/base/sprites.png',
      atlas: 'assets/characters/base/sprites.json',
      priority: 'critical'
    }
  ],
  characters: [
    // Character evolution sprites loaded dynamically
  ],
  bosses: [
    // Boss sprites loaded per battle
  ],
  stages: [
    // Stage backgrounds loaded per battle
  ],
  audio: [
    // Sound effects and music
    {
      key: 'theme_music',
      type: 'audio',
      url: ['assets/audio/theme.ogg', 'assets/audio/theme.mp3'],
      priority: 'low'
    }
  ]
};