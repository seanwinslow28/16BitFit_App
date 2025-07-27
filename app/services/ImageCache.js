/**
 * Image Cache Service
 * Optimizes image loading by caching required assets
 * Prevents repeated loading of the same images
 */

class ImageCache {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  /**
   * Get an image from cache or load it
   * @param {string} key - Unique identifier for the image
   * @param {Function} loader - Function that returns the require() statement
   * @returns {any} The cached or newly loaded image
   */
  getImage(key, loader) {
    if (!this.cache.has(key)) {
      try {
        const asset = loader();
        this.cache.set(key, asset);
        console.log(`[ImageCache] Loaded and cached: ${key}`);
      } catch (error) {
        console.error(`[ImageCache] Failed to load ${key}:`, error);
        return null;
      }
    }
    return this.cache.get(key);
  }

  /**
   * Preload multiple images
   * @param {Array} images - Array of {key, loader} objects
   */
  async preloadImages(images) {
    console.log(`[ImageCache] Preloading ${images.length} images...`);
    
    const promises = images.map(({ key, loader }) => {
      return new Promise((resolve) => {
        this.getImage(key, loader);
        resolve();
      });
    });

    await Promise.all(promises);
    console.log('[ImageCache] Preloading complete');
  }

  /**
   * Clear the cache to free memory
   */
  clear() {
    this.cache.clear();
    console.log('[ImageCache] Cache cleared');
  }

  /**
   * Clear specific cached images
   * @param {Array<string>} keys - Array of cache keys to clear
   */
  clearSpecific(keys) {
    keys.forEach(key => {
      this.cache.delete(key);
    });
    console.log(`[ImageCache] Cleared ${keys.length} cached images`);
  }

  /**
   * Get cache size
   * @returns {number} Number of cached images
   */
  getSize() {
    return this.cache.size;
  }

  /**
   * Check if an image is cached
   * @param {string} key - Cache key to check
   * @returns {boolean} Whether the image is cached
   */
  has(key) {
    return this.cache.has(key);
  }
}

// Singleton instance
const imageCache = new ImageCache();

// Preload common assets on app start
export const preloadCommonAssets = async () => {
  const commonAssets = [
    // Backgrounds
    { key: 'bg_main', loader: () => require('../assets/Backgrounds/Main_Background.png') },
    { key: 'bg_dojo', loader: () => require('../assets/Backgrounds/Tranquil_Dojo_Backround.png') },
    { key: 'bg_warehouse', loader: () => require('../assets/Backgrounds/Industrial_Warehouse_at_Dusk.png') },
    
    // Player sprites
    { key: 'sprite_sean', loader: () => require('../assets/Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png') },
    
    // Common boss sprites
    { key: 'sprite_gym_bully', loader: () => require('../assets/Sprites/BossBattleSpriteSheets/Gym_Bully-Sprite-Sheet.png') },
    { key: 'sprite_fit_cat', loader: () => require('../assets/Sprites/BossBattleSpriteSheets/Fit_Cat-Sprite-Sheet.png') },
  ];

  await imageCache.preloadImages(commonAssets);
};

export default imageCache;