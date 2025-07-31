/**
 * ReactNativePerformanceService - Optimizes React Native UI performance
 * Ensures smooth navigation and animations while Phaser game runs
 */

import { 
  InteractionManager, 
  Platform, 
  NativeModules,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { enableScreens } from 'react-native-screens';
import FastImage from 'react-native-fast-image';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  jsFrameRate: 60,
  navigationDelay: 300, // ms
  animationDuration: 300, // ms
  imageLoadTime: 1000, // ms
  listScrollFPS: 60,
};

// Optimization levels
const OPTIMIZATION_LEVELS = {
  high: {
    enableAnimations: true,
    animationDuration: 300,
    imageQuality: 1.0,
    enableShadows: true,
    enableBlur: true,
    listInitialRender: 10,
    listMaxRender: 50,
  },
  medium: {
    enableAnimations: true,
    animationDuration: 200,
    imageQuality: 0.8,
    enableShadows: false,
    enableBlur: false,
    listInitialRender: 7,
    listMaxRender: 30,
  },
  low: {
    enableAnimations: false,
    animationDuration: 0,
    imageQuality: 0.6,
    enableShadows: false,
    enableBlur: false,
    listInitialRender: 5,
    listMaxRender: 20,
  },
};

class ReactNativePerformanceService {
  constructor() {
    this.currentLevel = 'medium';
    this.metrics = {
      jsFrameDrops: 0,
      navigationTime: 0,
      imageLoadTime: 0,
      memoryWarnings: 0,
    };
    this.optimizations = {};
    this.interactionHandles = [];
  }
  
  /**
   * Initialize React Native optimizations
   */
  init() {
    // Enable native screens for better performance
    enableScreens();
    
    // Configure based on device
    this.detectDeviceCapabilities();
    
    // Apply initial optimizations
    this.applyOptimizations();
    
    // Set up monitoring
    this.setupPerformanceMonitoring();
    
    console.log('[RNPerf] Initialized with level:', this.currentLevel);
  }
  
  /**
   * Detect device capabilities
   */
  detectDeviceCapabilities() {
    const { width, height } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();
    const totalPixels = width * height * pixelRatio;
    
    // Categorize based on screen resolution
    if (totalPixels > 3000000) { // High-res displays
      this.currentLevel = 'high';
    } else if (totalPixels > 1500000) { // Medium displays
      this.currentLevel = 'medium';
    } else { // Low-res displays
      this.currentLevel = 'low';
    }
    
    // Override for specific platforms
    if (Platform.OS === 'ios' && Platform.Version >= 13) {
      // Modern iOS devices can handle high
      if (this.currentLevel === 'medium') {
        this.currentLevel = 'high';
      }
    }
  }
  
  /**
   * Apply optimization level
   */
  applyOptimizations() {
    const level = OPTIMIZATION_LEVELS[this.currentLevel];
    
    // Configure animations
    this.configureAnimations(level);
    
    // Configure image loading
    this.configureImageLoading(level);
    
    // Configure list rendering
    this.configureListRendering(level);
    
    // Configure native modules
    this.configureNativeModules(level);
    
    this.optimizations = level;
  }
  
  /**
   * Configure animation settings
   */
  configureAnimations(level) {
    if (Platform.OS === 'ios' && NativeModules.UIManager) {
      // iOS animation configuration
      NativeModules.UIManager.setLayoutAnimationEnabledExperimental(level.enableAnimations);
    } else if (Platform.OS === 'android' && NativeModules.UIManager) {
      // Android animation configuration
      NativeModules.UIManager.setLayoutAnimationEnabledExperimental(level.enableAnimations);
      
      // Configure transition animations
      if (NativeModules.UIManager.configureNextLayoutAnimation) {
        const config = {
          duration: level.animationDuration,
          create: {
            type: level.enableAnimations ? 'easeInEaseOut' : 'keyboard',
            property: 'opacity',
          },
          update: {
            type: level.enableAnimations ? 'easeInEaseOut' : 'keyboard',
          },
        };
        NativeModules.UIManager.configureNextLayoutAnimation(config);
      }
    }
  }
  
  /**
   * Configure image loading optimization
   */
  configureImageLoading(level) {
    // Configure FastImage
    FastImage.preload([
      // Preload critical images
    ]);
    
    // Set default image quality
    this.defaultImageConfig = {
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
      resizeMode: FastImage.resizeMode.contain,
    };
    
    // Lower quality for low-end devices
    if (level.imageQuality < 1.0) {
      this.defaultImageConfig.resizeMode = FastImage.resizeMode.cover;
    }
  }
  
  /**
   * Configure list rendering optimizations
   */
  configureListRendering(level) {
    this.listConfig = {
      initialNumToRender: level.listInitialRender,
      maxToRenderPerBatch: level.listMaxRender,
      windowSize: level.listMaxRender / 5,
      updateCellsBatchingPeriod: 50,
      removeClippedSubviews: true,
      // Platform specific
      ...Platform.select({
        ios: {
          maintainVisibleContentPosition: {
            minIndexForVisible: 0,
          },
        },
        android: {
          enableEmptySections: true,
          disableVirtualization: false,
        },
      }),
    };
  }
  
  /**
   * Configure native module optimizations
   */
  configureNativeModules(level) {
    // Disable unnecessary native features for low-end
    if (level === OPTIMIZATION_LEVELS.low) {
      // Disable blur effects
      if (NativeModules.BlurModule) {
        NativeModules.BlurModule.setEnabled(false);
      }
      
      // Reduce shadow complexity
      if (NativeModules.ShadowModule) {
        NativeModules.ShadowModule.setComplexity('simple');
      }
    }
  }
  
  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor JS thread performance
    if (Platform.OS === 'android' && NativeModules.JSDevSupport) {
      setInterval(() => {
        NativeModules.JSDevSupport.getJSFPS((fps) => {
          if (fps < PERFORMANCE_THRESHOLDS.jsFrameRate * 0.8) {
            this.metrics.jsFrameDrops++;
            this.checkPerformanceThresholds();
          }
        });
      }, 1000);
    }
    
    // Monitor memory warnings
    if (Platform.OS === 'ios' && NativeModules.MemoryWarningManager) {
      NativeModules.MemoryWarningManager.startObserving();
    }
  }
  
  /**
   * Check performance thresholds
   */
  checkPerformanceThresholds() {
    // Auto-downgrade if too many frame drops
    if (this.metrics.jsFrameDrops > 10 && this.currentLevel !== 'low') {
      console.warn('[RNPerf] Degrading performance level due to frame drops');
      this.downgradePerformance();
    }
  }
  
  /**
   * Downgrade performance level
   */
  downgradePerformance() {
    const levels = ['high', 'medium', 'low'];
    const currentIndex = levels.indexOf(this.currentLevel);
    
    if (currentIndex < levels.length - 1) {
      this.currentLevel = levels[currentIndex + 1];
      this.applyOptimizations();
      console.log('[RNPerf] Downgraded to:', this.currentLevel);
    }
  }
  
  /**
   * Optimize navigation transition
   */
  optimizeNavigation(navigationAction) {
    return new Promise((resolve) => {
      // Defer heavy operations
      InteractionManager.runAfterInteractions(() => {
        // Clear any pending renders
        this.clearPendingRenders();
        
        // Execute navigation
        navigationAction();
        
        // Mark completion
        resolve();
      });
    });
  }
  
  /**
   * Optimize heavy component render
   */
  optimizeHeavyRender(renderFunction) {
    const handle = InteractionManager.createInteractionHandle();
    this.interactionHandles.push(handle);
    
    // Defer render
    requestAnimationFrame(() => {
      renderFunction();
      
      // Clear handle
      InteractionManager.clearInteractionHandle(handle);
      this.interactionHandles = this.interactionHandles.filter(h => h !== handle);
    });
  }
  
  /**
   * Clear pending renders
   */
  clearPendingRenders() {
    this.interactionHandles.forEach(handle => {
      InteractionManager.clearInteractionHandle(handle);
    });
    this.interactionHandles = [];
  }
  
  /**
   * Get optimized FlatList props
   */
  getOptimizedFlatListProps() {
    return {
      ...this.listConfig,
      keyExtractor: this.defaultKeyExtractor,
      getItemLayout: this.getItemLayout,
      onEndReachedThreshold: 0.5,
      legacyImplementation: Platform.OS === 'android' && this.currentLevel === 'low',
    };
  }
  
  /**
   * Default key extractor
   */
  defaultKeyExtractor = (item, index) => {
    return item.id || `item-${index}`;
  }
  
  /**
   * Get item layout optimization
   */
  getItemLayout = (data, index) => {
    // Assuming fixed height items
    const ITEM_HEIGHT = 80;
    return {
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    };
  }
  
  /**
   * Get optimized ScrollView props
   */
  getOptimizedScrollViewProps() {
    return {
      scrollEventThrottle: 16,
      removeClippedSubviews: true,
      bounces: Platform.OS === 'ios',
      overScrollMode: 'never',
      showsVerticalScrollIndicator: false,
      showsHorizontalScrollIndicator: false,
      // Optimize based on level
      decelerationRate: this.currentLevel === 'low' ? 0.99 : 'normal',
      directionalLockEnabled: true,
    };
  }
  
  /**
   * Get optimized Image component
   */
  getOptimizedImage(source, style, additionalProps = {}) {
    const optimizedProps = {
      ...this.defaultImageConfig,
      source,
      style,
      ...additionalProps,
    };
    
    // Downscale for low performance
    if (this.currentLevel === 'low' && style.width && style.height) {
      optimizedProps.style = {
        ...style,
        width: style.width * 0.8,
        height: style.height * 0.8,
      };
    }
    
    return FastImage(optimizedProps);
  }
  
  /**
   * Optimize animation configuration
   */
  getOptimizedAnimationConfig() {
    const level = OPTIMIZATION_LEVELS[this.currentLevel];
    
    return {
      duration: level.animationDuration,
      useNativeDriver: true,
      // Reduce complexity for low-end
      easing: this.currentLevel === 'low' ? undefined : Easing.inOut(Easing.ease),
    };
  }
  
  /**
   * Batch state updates
   */
  batchUpdates(updates) {
    if (Platform.OS === 'android') {
      // Android batching
      NativeModules.UIManager.batchedUpdates(() => {
        updates.forEach(update => update());
      });
    } else {
      // iOS automatic batching
      updates.forEach(update => update());
    }
  }
  
  /**
   * Memory optimization helpers
   */
  clearImageCache() {
    FastImage.clearMemoryCache();
    
    if (this.currentLevel === 'low') {
      FastImage.clearDiskCache();
    }
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      level: this.currentLevel,
      metrics: this.metrics,
      optimizations: this.optimizations,
      recommendations: this.getRecommendations(),
    };
  }
  
  /**
   * Get optimization recommendations
   */
  getRecommendations() {
    const recommendations = [];
    
    if (this.metrics.jsFrameDrops > 5) {
      recommendations.push('Reduce animation complexity or disable animations');
    }
    
    if (this.metrics.navigationTime > PERFORMANCE_THRESHOLDS.navigationDelay) {
      recommendations.push('Defer heavy operations during navigation');
    }
    
    if (this.metrics.memoryWarnings > 0) {
      recommendations.push('Clear image caches and reduce memory usage');
    }
    
    return recommendations;
  }
  
  /**
   * Force optimization level
   */
  setOptimizationLevel(level) {
    if (OPTIMIZATION_LEVELS[level]) {
      this.currentLevel = level;
      this.applyOptimizations();
      console.log('[RNPerf] Forced optimization level:', level);
    }
  }
}

// Export singleton instance
export default new ReactNativePerformanceService();