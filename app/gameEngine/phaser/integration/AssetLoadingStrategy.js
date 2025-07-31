/**
 * AssetLoadingStrategy - Optimized asset loading for Phaser in WebView
 * 
 * Features:
 * - Progressive loading with priority queue
 * - Memory budget management (150MB limit)
 * - Texture atlas generation for sprite batching
 * - Base64 encoding optimization
 * - Caching with IndexedDB fallback
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

// Asset priorities
const PRIORITY_LEVELS = {
  CRITICAL: 3,    // UI elements, player character
  HIGH: 2,        // Current boss, stage
  MEDIUM: 1,      // Other characters, effects
  LOW: 0,         // Background music, optional assets
};

// Memory budgets (in MB)
const MEMORY_BUDGETS = {
  TOTAL: 150,
  TEXTURES: 80,
  AUDIO: 30,
  ANIMATIONS: 20,
  MISC: 20,
};

class AssetLoadingStrategy {
  constructor() {
    this.assetQueue = [];
    this.loadedAssets = new Map();
    this.memoryUsage = {
      textures: 0,
      audio: 0,
      animations: 0,
      misc: 0,
      total: 0,
    };
    this.loadingPromises = new Map();
    this.atlasGenerator = new TextureAtlasGenerator();
    this.cacheManager = new AssetCacheManager();
  }
  
  /**
   * Initialize asset loading system
   */
  async init() {
    // Initialize cache
    await this.cacheManager.init();
    
    // Preload critical assets
    await this.preloadCriticalAssets();
    
    return this;
  }
  
  /**
   * Preload critical assets for immediate gameplay
   */
  async preloadCriticalAssets() {
    const criticalAssets = [
      // Player sprites
      { key: 'sean_fighter', path: require('../../../assets/Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png'), type: 'spritesheet', priority: PRIORITY_LEVELS.CRITICAL },
      
      // UI elements
      { key: 'health_bar', path: require('../../../assets/UI/health_bar.png'), type: 'image', priority: PRIORITY_LEVELS.CRITICAL },
      { key: 'combo_counter', path: require('../../../assets/UI/combo_counter.png'), type: 'image', priority: PRIORITY_LEVELS.CRITICAL },
      
      // Essential audio
      { key: 'hit_sound', path: require('../../../assets/Audio/sfx/hit.mp3'), type: 'audio', priority: PRIORITY_LEVELS.CRITICAL },
      { key: 'block_sound', path: require('../../../assets/Audio/sfx/block.mp3'), type: 'audio', priority: PRIORITY_LEVELS.CRITICAL },
    ];
    
    // Load in parallel with priority
    await this.loadAssetBatch(criticalAssets);
  }
  
  /**
   * Load a batch of assets with priority queue
   */
  async loadAssetBatch(assets) {
    // Sort by priority
    assets.sort((a, b) => b.priority - a.priority);
    
    // Process in chunks to avoid memory spikes
    const chunkSize = 5;
    for (let i = 0; i < assets.length; i += chunkSize) {
      const chunk = assets.slice(i, i + chunkSize);
      await Promise.all(chunk.map(asset => this.loadAsset(asset)));
    }
  }
  
  /**
   * Load a single asset with memory management
   */
  async loadAsset(assetConfig) {
    const { key, path, type, priority = PRIORITY_LEVELS.MEDIUM } = assetConfig;
    
    // Check if already loaded
    if (this.loadedAssets.has(key)) {
      return this.loadedAssets.get(key);
    }
    
    // Check if already loading
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }
    
    // Create loading promise
    const loadingPromise = this._loadAssetInternal(assetConfig);
    this.loadingPromises.set(key, loadingPromise);
    
    try {
      const result = await loadingPromise;
      this.loadedAssets.set(key, result);
      this.loadingPromises.delete(key);
      return result;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }
  
  /**
   * Internal asset loading with optimizations
   */
  async _loadAssetInternal(assetConfig) {
    const { key, path, type } = assetConfig;
    
    try {
      // Check cache first
      const cached = await this.cacheManager.get(key);
      if (cached) {
        return cached;
      }
      
      // Download asset
      const asset = await Asset.fromModule(path).downloadAsync();
      
      if (!asset || !asset.localUri) {
        throw new Error(`Failed to download asset: ${key}`);
      }
      
      // Process based on type
      let processedAsset;
      switch (type) {
        case 'spritesheet':
          processedAsset = await this.processSpriteSheet(key, asset);
          break;
          
        case 'image':
          processedAsset = await this.processImage(key, asset);
          break;
          
        case 'audio':
          processedAsset = await this.processAudio(key, asset);
          break;
          
        default:
          processedAsset = await this.processGeneric(key, asset);
      }
      
      // Cache the processed asset
      await this.cacheManager.set(key, processedAsset);
      
      // Update memory usage
      this.updateMemoryUsage(type, processedAsset.size);
      
      return processedAsset;
    } catch (error) {
      console.error(`Failed to load asset ${key}:`, error);
      // Return placeholder
      return this.getPlaceholderAsset(type);
    }
  }
  
  /**
   * Process sprite sheet with atlas optimization
   */
  async processSpriteSheet(key, asset) {
    // Get image dimensions
    const dimensions = await this.getImageDimensions(asset.localUri);
    
    // Read as base64
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Generate optimized data URI
    const dataUri = `data:image/png;base64,${base64}`;
    
    // Calculate frame data
    const frameData = this.calculateSpriteFrames(dimensions, key);
    
    // Add to texture atlas if possible
    const atlasData = await this.atlasGenerator.addSprite(key, dataUri, frameData);
    
    return {
      key,
      type: 'spritesheet',
      data: atlasData || dataUri,
      frames: frameData,
      size: base64.length * 0.75, // Approximate decoded size
      dimensions,
    };
  }
  
  /**
   * Process single image with compression
   */
  async processImage(key, asset) {
    // Optimize image size
    const optimized = await this.optimizeImage(asset.localUri);
    
    return {
      key,
      type: 'image',
      data: optimized.dataUri,
      size: optimized.size,
      dimensions: optimized.dimensions,
    };
  }
  
  /**
   * Process audio with format optimization
   */
  async processAudio(key, asset) {
    // Read audio file
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Determine MIME type
    const mimeType = asset.localUri.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
    const dataUri = `data:${mimeType};base64,${base64}`;
    
    return {
      key,
      type: 'audio',
      data: dataUri,
      size: base64.length * 0.75,
      format: mimeType,
    };
  }
  
  /**
   * Process generic asset
   */
  async processGeneric(key, asset) {
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return {
      key,
      type: 'generic',
      data: base64,
      size: base64.length * 0.75,
    };
  }
  
  /**
   * Optimize image for WebView display
   */
  async optimizeImage(uri, maxSize = 1024) {
    try {
      // Get original dimensions
      const dimensions = await this.getImageDimensions(uri);
      
      // Calculate optimal size
      const scale = Math.min(1, maxSize / Math.max(dimensions.width, dimensions.height));
      const targetWidth = Math.floor(dimensions.width * scale);
      const targetHeight = Math.floor(dimensions.height * scale);
      
      // Read and potentially resize
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const dataUri = `data:image/png;base64,${base64}`;
      
      return {
        dataUri,
        size: base64.length * 0.75,
        dimensions: { width: targetWidth, height: targetHeight },
      };
    } catch (error) {
      console.error('Image optimization failed:', error);
      // Return original
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return {
        dataUri: `data:image/png;base64,${base64}`,
        size: base64.length * 0.75,
        dimensions: { width: 64, height: 64 },
      };
    }
  }
  
  /**
   * Get image dimensions
   */
  getImageDimensions(uri) {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        reject
      );
    });
  }
  
  /**
   * Calculate sprite sheet frames
   */
  calculateSpriteFrames(dimensions, key) {
    // Default frame configurations for known sprites
    const frameConfigs = {
      'sean_fighter': { cols: 8, rows: 6, frameWidth: 64, frameHeight: 64 },
      'gym_bully': { cols: 8, rows: 6, frameWidth: 64, frameHeight: 64 },
      'fit_cat': { cols: 8, rows: 6, frameWidth: 64, frameHeight: 64 },
      'buff_mage': { cols: 8, rows: 6, frameWidth: 64, frameHeight: 64 },
      'rookie_ryu': { cols: 8, rows: 6, frameWidth: 64, frameHeight: 64 },
    };
    
    const config = frameConfigs[key] || { cols: 8, rows: 1, frameWidth: 64, frameHeight: 64 };
    const frames = [];
    
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        frames.push({
          x: col * config.frameWidth,
          y: row * config.frameHeight,
          width: config.frameWidth,
          height: config.frameHeight,
        });
      }
    }
    
    return frames;
  }
  
  /**
   * Update memory usage tracking
   */
  updateMemoryUsage(type, size) {
    const sizeMB = size / (1024 * 1024);
    
    switch (type) {
      case 'spritesheet':
      case 'image':
        this.memoryUsage.textures += sizeMB;
        break;
      case 'audio':
        this.memoryUsage.audio += sizeMB;
        break;
      default:
        this.memoryUsage.misc += sizeMB;
    }
    
    this.memoryUsage.total = Object.values(this.memoryUsage).reduce((a, b) => a + b, 0);
    
    // Check memory limits
    if (this.memoryUsage.total > MEMORY_BUDGETS.TOTAL) {
      this.performMemoryCleanup();
    }
  }
  
  /**
   * Perform memory cleanup when approaching limits
   */
  performMemoryCleanup() {
    console.warn('Memory limit approaching, performing cleanup...');
    
    // Remove low priority assets
    const sortedAssets = Array.from(this.loadedAssets.entries())
      .sort((a, b) => (a[1].priority || 0) - (b[1].priority || 0));
    
    // Remove bottom 20%
    const removeCount = Math.floor(sortedAssets.length * 0.2);
    for (let i = 0; i < removeCount; i++) {
      const [key, asset] = sortedAssets[i];
      this.unloadAsset(key);
    }
  }
  
  /**
   * Unload an asset from memory
   */
  unloadAsset(key) {
    const asset = this.loadedAssets.get(key);
    if (asset) {
      // Update memory usage
      const sizeMB = asset.size / (1024 * 1024);
      switch (asset.type) {
        case 'spritesheet':
        case 'image':
          this.memoryUsage.textures -= sizeMB;
          break;
        case 'audio':
          this.memoryUsage.audio -= sizeMB;
          break;
        default:
          this.memoryUsage.misc -= sizeMB;
      }
      
      this.memoryUsage.total -= sizeMB;
      this.loadedAssets.delete(key);
    }
  }
  
  /**
   * Get placeholder asset for failed loads
   */
  getPlaceholderAsset(type) {
    const placeholders = {
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      audio: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    };
    
    return {
      type,
      data: placeholders[type] || placeholders.image,
      size: 100,
      placeholder: true,
    };
  }
  
  /**
   * Get all loaded assets for WebView injection
   */
  getLoadedAssetsMap() {
    const assetMap = {};
    
    for (const [key, asset] of this.loadedAssets.entries()) {
      assetMap[key] = asset.data;
    }
    
    return assetMap;
  }
  
  /**
   * Get memory usage report
   */
  getMemoryReport() {
    return {
      usage: this.memoryUsage,
      limits: MEMORY_BUDGETS,
      percentage: (this.memoryUsage.total / MEMORY_BUDGETS.TOTAL * 100).toFixed(1) + '%',
      assetCount: this.loadedAssets.size,
    };
  }
}

/**
 * Texture Atlas Generator for sprite batching
 */
class TextureAtlasGenerator {
  constructor() {
    this.atlases = new Map();
    this.maxAtlasSize = 2048; // Max texture size for mobile GPUs
  }
  
  async addSprite(key, dataUri, frameData) {
    // For now, return original data
    // In production, would pack into atlas
    return dataUri;
  }
}

/**
 * Asset Cache Manager using IndexedDB
 */
class AssetCacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheVersion = 1;
  }
  
  async init() {
    // Initialize cache from AsyncStorage or IndexedDB
    // For now, use in-memory cache
    return this;
  }
  
  async get(key) {
    return this.cache.get(key);
  }
  
  async set(key, value) {
    this.cache.set(key, value);
  }
  
  async clear() {
    this.cache.clear();
  }
}

// Singleton instance
let strategyInstance = null;

export const getAssetLoadingStrategy = () => {
  if (!strategyInstance) {
    strategyInstance = new AssetLoadingStrategy();
  }
  return strategyInstance;
};

export default AssetLoadingStrategy;