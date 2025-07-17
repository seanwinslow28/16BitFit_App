/**
 * Image Optimizer Service
 * Handles image loading, caching, and optimization
 * Following MetaSystemsAgent patterns for performance
 */

import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CACHE_DIRECTORY = FileSystem.documentDirectory + 'imageCache/';
const CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const STORAGE_KEY = '@16BitFit:imageCache';

class ImageOptimizer {
  constructor() {
    this.cache = new Map();
    this.cacheSize = 0;
    this.isInitialized = false;
    this.loadQueue = [];
    this.preloadQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Initialize the image optimizer
   */
  async initialize() {
    try {
      // Create cache directory
      await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, { intermediates: true });
      
      // Load cache metadata
      await this.loadCacheMetadata();
      
      // Clean expired cache
      await this.cleanExpiredCache();
      
      this.isInitialized = true;
      console.log('ImageOptimizer initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize ImageOptimizer:', error);
      return false;
    }
  }

  /**
   * Load cache metadata from storage
   */
  async loadCacheMetadata() {
    try {
      const metadata = await AsyncStorage.getItem(STORAGE_KEY);
      if (metadata) {
        const cacheData = JSON.parse(metadata);
        this.cache = new Map(cacheData.entries);
        this.cacheSize = cacheData.size || 0;
      }
    } catch (error) {
      console.error('Failed to load cache metadata:', error);
    }
  }

  /**
   * Save cache metadata to storage
   */
  async saveCacheMetadata() {
    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        size: this.cacheSize,
        lastUpdated: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, metadata] of this.cache.entries()) {
      if (now - metadata.timestamp > CACHE_EXPIRY) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      await this.removeCacheEntry(key);
    }
  }

  /**
   * Remove a cache entry
   */
  async removeCacheEntry(key) {
    try {
      const metadata = this.cache.get(key);
      if (metadata) {
        // Remove file
        await FileSystem.deleteAsync(metadata.localPath, { idempotent: true });
        
        // Update cache size
        this.cacheSize -= metadata.size;
        
        // Remove from cache
        this.cache.delete(key);
      }
    } catch (error) {
      console.error(`Failed to remove cache entry ${key}:`, error);
    }
  }

  /**
   * Get cache key for a URI
   */
  getCacheKey(uri) {
    return uri.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Get cached image path
   */
  getCachedImagePath(uri) {
    const metadata = this.cache.get(this.getCacheKey(uri));
    return metadata ? metadata.localPath : null;
  }

  /**
   * Download and cache an image
   */
  async downloadAndCacheImage(uri) {
    const cacheKey = this.getCacheKey(uri);
    const localPath = CACHE_DIRECTORY + cacheKey;
    
    try {
      // Check if we need to free up space
      if (this.cacheSize > CACHE_SIZE_LIMIT) {
        await this.freeUpCacheSpace();
      }
      
      // Download image
      const downloadResult = await FileSystem.downloadAsync(uri, localPath);
      
      if (downloadResult.status === 200) {
        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        const fileSize = fileInfo.size || 0;
        
        // Update cache
        this.cache.set(cacheKey, {
          uri,
          localPath,
          timestamp: Date.now(),
          size: fileSize,
        });
        
        this.cacheSize += fileSize;
        
        // Save metadata
        await this.saveCacheMetadata();
        
        return localPath;
      }
    } catch (error) {
      console.error(`Failed to download image ${uri}:`, error);
      
      // Clean up partial download
      await FileSystem.deleteAsync(localPath, { idempotent: true });
    }
    
    return null;
  }

  /**
   * Free up cache space by removing oldest entries
   */
  async freeUpCacheSpace() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      await this.removeCacheEntry(entries[i][0]);
    }
  }

  /**
   * Load image with caching
   */
  async loadImage(uri, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Check cache first
    const cachedPath = this.getCachedImagePath(uri);
    if (cachedPath) {
      const fileInfo = await FileSystem.getInfoAsync(cachedPath);
      if (fileInfo.exists) {
        return { uri: cachedPath, cached: true };
      } else {
        // Remove invalid cache entry
        await this.removeCacheEntry(this.getCacheKey(uri));
      }
    }
    
    // Download and cache
    const localPath = await this.downloadAndCacheImage(uri);
    if (localPath) {
      return { uri: localPath, cached: false };
    }
    
    // Fallback to original URI
    return { uri, cached: false };
  }

  /**
   * Preload images in background
   */
  async preloadImages(uris) {
    this.preloadQueue.push(...uris);
    if (!this.isProcessingQueue) {
      this.processPreloadQueue();
    }
  }

  /**
   * Process preload queue
   */
  async processPreloadQueue() {
    this.isProcessingQueue = true;
    
    while (this.preloadQueue.length > 0) {
      const uri = this.preloadQueue.shift();
      
      try {
        // Only preload if not already cached
        if (!this.getCachedImagePath(uri)) {
          await this.loadImage(uri);
        }
      } catch (error) {
        console.error(`Failed to preload image ${uri}:`, error);
      }
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Optimize image based on screen size
   */
  getOptimizedImageUri(uri, targetWidth, targetHeight) {
    // For local images, return as-is
    if (uri.startsWith('file://') || uri.startsWith('asset://')) {
      return uri;
    }
    
    // For remote images, add optimization parameters
    const url = new URL(uri);
    url.searchParams.set('w', targetWidth.toString());
    url.searchParams.set('h', targetHeight.toString());
    url.searchParams.set('fit', 'cover');
    url.searchParams.set('q', '80'); // Quality
    
    return url.toString();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      entries: this.cache.size,
      sizeBytes: this.cacheSize,
      sizeMB: (this.cacheSize / (1024 * 1024)).toFixed(2),
      limitMB: (CACHE_SIZE_LIMIT / (1024 * 1024)).toFixed(2),
    };
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    try {
      // Delete all cached files
      for (const [key, metadata] of this.cache.entries()) {
        await FileSystem.deleteAsync(metadata.localPath, { idempotent: true });
      }
      
      // Clear cache directory
      await FileSystem.deleteAsync(CACHE_DIRECTORY, { idempotent: true });
      await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, { intermediates: true });
      
      // Reset cache
      this.cache.clear();
      this.cacheSize = 0;
      
      // Clear storage
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      console.log('Image cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

/**
 * Optimized Image Component
 * Drop-in replacement for Image with automatic optimization
 */
export const OptimizedImage = ({ source, style, ...props }) => {
  const [optimizedSource, setOptimizedSource] = React.useState(source);
  
  React.useEffect(() => {
    if (source?.uri) {
      ImageOptimizer.loadImage(source.uri)
        .then(result => {
          setOptimizedSource({ uri: result.uri });
        })
        .catch(() => {
          // Fallback to original source
          setOptimizedSource(source);
        });
    }
  }, [source]);
  
  return (
    <Image
      source={optimizedSource}
      style={style}
      placeholder={require('../../assets/placeholder.png')} // Add placeholder
      transition={200}
      {...props}
    />
  );
};

export default new ImageOptimizer();