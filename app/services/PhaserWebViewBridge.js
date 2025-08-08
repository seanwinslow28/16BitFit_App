/**
 * PhaserWebViewBridge Service
 * Main entry point for Phaser WebView integration in React Native
 * This service acts as a facade for the underlying bridge implementation
 */

import { getPhaserBridge } from '../gameEngine/phaser/integration/PhaserWebViewBridge';
import { Platform } from 'react-native';

class PhaserWebViewBridgeService {
  constructor() {
    this.bridge = getPhaserBridge();
    this.assetCache = new Map();
    this.assetBaseUrl = null;
    this.isInitialized = false;
    
    // Asset loading configuration
    this.assetConfig = {
      baseUrl: Platform.select({
        ios: 'phaser-assets',
        android: 'file:///android_asset/phaser-assets'
      }),
      cacheEnabled: true,
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      compressionEnabled: true
    };
  }

  /**
   * Initialize the bridge service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Set up asset base URL
      await this.setupAssetPaths();
      
      // Register asset request handler
      this.bridge.on('ASSET_REQUEST', this.handleAssetRequest.bind(this));
      
      // Set up performance monitoring
      this.setupPerformanceMonitoring();
      
      this.isInitialized = true;
      
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize PhaserWebViewBridge:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set up asset paths based on platform
   */
  async setupAssetPaths() {
    if (Platform.OS === 'ios') {
      // iOS: Check if assets exist in bundle
      const bundlePath = `${RNFS.MainBundlePath}/phaser-assets`;
      const exists = await RNFS.exists(bundlePath);
      
      if (!exists) {
        console.warn('Phaser assets not found in iOS bundle');
        // Fall back to document directory
        this.assetConfig.baseUrl = `${RNFS.DocumentDirectoryPath}/phaser-assets`;
      }
    } else if (Platform.OS === 'android') {
      // Android assets are in the APK, no need to check
      this.assetConfig.baseUrl = 'file:///android_asset/phaser-assets';
    }
    
    // Create cache directory if needed
    const cacheDir = `${RNFS.CachesDirectoryPath}/phaser-assets`;
    const cacheDirExists = await RNFS.exists(cacheDir);
    if (!cacheDirExists) {
      await RNFS.mkdir(cacheDir);
    }
  }

  /**
   * Handle asset requests from Phaser game
   */
  async handleAssetRequest({ assetId, priority }) {
    try {
      // Check cache first
      if (this.assetCache.has(assetId)) {
        const cachedAsset = this.assetCache.get(assetId);
        this.bridge.loadAsset(assetId, cachedAsset.data, priority);
        return;
      }

      // Load asset from file system
      const assetData = await this.loadAssetFromFile(assetId);
      
      // Cache if enabled
      if (this.assetConfig.cacheEnabled) {
        this.cacheAsset(assetId, assetData);
      }
      
      // Send to Phaser
      this.bridge.loadAsset(assetId, assetData, priority);
      
    } catch (error) {
      console.error(`Failed to load asset ${assetId}:`, error);
      this.bridge.emit('ASSET_LOAD_ERROR', { assetId, error: error.message });
    }
  }

  /**
   * Load asset from file system
   */
  async loadAssetFromFile(assetId) {
    // Determine file path based on asset ID
    const assetPath = this.resolveAssetPath(assetId);
    
    try {
      // For images, read as base64
      if (this.isImageAsset(assetId)) {
        const base64 = await RNFS.readFile(assetPath, 'base64');
        const mimeType = this.getMimeType(assetId);
        return `data:${mimeType};base64,${base64}`;
      }
      
      // For JSON files, read as text
      if (assetId.endsWith('.json')) {
        return await RNFS.readFile(assetPath, 'utf8');
      }
      
      // For other files, read as base64
      return await RNFS.readFile(assetPath, 'base64');
      
    } catch (error) {
      // If asset doesn't exist, try to generate placeholder
      if (error.code === 'ENOENT') {
        return this.generatePlaceholderAsset(assetId);
      }
      throw error;
    }
  }

  /**
   * Resolve asset path from ID
   */
  resolveAssetPath(assetId) {
    // Remove any query params or fragments
    const cleanId = assetId.split('?')[0].split('#')[0];
    
    // Map common asset IDs to file paths
    const assetMap = {
      'ui_atlas': 'ui/ui_sprites.png',
      'ui_atlas_json': 'ui/ui_sprites.json',
      'character_base': 'characters/base/sprites.png',
      'character_base_json': 'characters/base/sprites.json',
      // Add more mappings as needed
    };
    
    const mappedPath = assetMap[cleanId];
    if (mappedPath) {
      return `${this.assetConfig.baseUrl}/${mappedPath}`;
    }
    
    // Default path resolution
    return `${this.assetConfig.baseUrl}/${cleanId}`;
  }

  /**
   * Generate placeholder asset if real asset is missing
   */
  async generatePlaceholderAsset(assetId) {
    console.warn(`Generating placeholder for missing asset: ${assetId}`);
    
    // For texture atlases JSON
    if (assetId.includes('atlas') && assetId.endsWith('.json')) {
      return JSON.stringify({
        frames: {
          'placeholder': {
            frame: { x: 0, y: 0, w: 64, h: 64 },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: 64, h: 64 },
            sourceSize: { w: 64, h: 64 }
          }
        },
        meta: {
          app: '16BitFit',
          version: '1.0',
          image: 'placeholder.png',
          format: 'RGBA8888',
          size: { w: 64, h: 64 },
          scale: '1'
        }
      });
    }
    
    // For images, return a 1x1 transparent pixel
    if (this.isImageAsset(assetId)) {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
    
    // For audio files
    if (this.isAudioAsset(assetId)) {
      // Return silence
      return 'data:audio/mp3;base64,SUQzAwAAAAAADlRTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAD/+0DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAEAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMYXZmNTguMjkuMTAwAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    }
    
    // Default to empty JSON
    return '{}';
  }

  /**
   * Cache asset in memory
   */
  cacheAsset(assetId, data) {
    const size = this.getAssetSize(data);
    
    // Check cache size limit
    if (this.getCacheSize() + size > this.assetConfig.maxCacheSize) {
      this.evictOldestAssets(size);
    }
    
    this.assetCache.set(assetId, {
      data,
      size,
      timestamp: Date.now()
    });
  }

  /**
   * Get total cache size
   */
  getCacheSize() {
    let totalSize = 0;
    for (const [_, asset] of this.assetCache) {
      totalSize += asset.size;
    }
    return totalSize;
  }

  /**
   * Evict oldest assets to make room
   */
  evictOldestAssets(requiredSize) {
    const assets = Array.from(this.assetCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    let freedSize = 0;
    for (const [assetId, asset] of assets) {
      if (freedSize >= requiredSize) break;
      
      this.assetCache.delete(assetId);
      freedSize += asset.size;
    }
  }

  /**
   * Get asset size in bytes
   */
  getAssetSize(data) {
    if (typeof data === 'string') {
      return data.length * 2; // Rough estimate for UTF-16
    }
    return JSON.stringify(data).length * 2;
  }

  /**
   * Check if asset is an image
   */
  isImageAsset(assetId) {
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(assetId);
  }

  /**
   * Check if asset is audio
   */
  isAudioAsset(assetId) {
    return /\.(mp3|ogg|wav|m4a)$/i.test(assetId);
  }

  /**
   * Get MIME type for asset
   */
  getMimeType(assetId) {
    const ext = assetId.split('.').pop().toLowerCase();
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'mp3': 'audio/mpeg',
      'ogg': 'audio/ogg',
      'wav': 'audio/wav',
      'm4a': 'audio/mp4',
      'json': 'application/json'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor asset loading performance
    this.bridge.on('ASSET_LOAD_PROGRESS', (data) => {
      console.log(`Asset loading progress: ${data.progress * 100}%`);
    });
    
    this.bridge.on('ASSETS_LOADED', (data) => {
      console.log('Assets loaded:', data);
      
      // Report to analytics if needed
      if (global.PostHogService && global.PostHogService.isInitialized) {
        global.PostHogService.capture('phaser_assets_loaded', {
          loadedCount: data.loadedCount,
          memoryUsage: data.memoryUsage,
          phase: data.phase,
          avgLoadTime: data.loadTimes ? 
            Object.values(data.loadTimes).reduce((a, b) => a + b, 0) / Object.keys(data.loadTimes).length : 
            0
        });
      }
    });
  }

  /**
   * Preload critical assets
   */
  async preloadCriticalAssets() {
    const criticalAssets = [
      'ui_atlas',
      'ui_atlas_json',
      'character_base',
      'character_base_json'
    ];
    
    const promises = criticalAssets.map(assetId => 
      this.loadAssetFromFile(assetId)
        .then(data => this.cacheAsset(assetId, data))
        .catch(error => console.warn(`Failed to preload ${assetId}:`, error))
    );
    
    await Promise.all(promises);
  }

  /**
   * Get bridge instance
   */
  getBridge() {
    return this.bridge;
  }

  /**
   * Clean up and destroy
   */
  destroy() {
    this.assetCache.clear();
    this.bridge.destroy();
    this.isInitialized = false;
  }
}

// Singleton instance
let serviceInstance = null;

export const getPhaserWebViewBridgeService = () => {
  if (!serviceInstance) {
    serviceInstance = new PhaserWebViewBridgeService();
  }
  return serviceInstance;
};

export default PhaserWebViewBridgeService;