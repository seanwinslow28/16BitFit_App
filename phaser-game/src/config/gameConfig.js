/**
 * Phaser 3 Game Configuration for 16BitFit
 * Optimized for 60fps mobile WebView performance
 */

export const GAME_CONFIG = {
  type: Phaser.WEBGL, // WebGL for best performance
  parent: 'phaser-game-container',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
    min: {
      width: 320,
      height: 180
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // No gravity for fighting game
      debug: false,
      fps: 60 // Fixed timestep for consistent physics
    }
  },
  fps: {
    target: 60,
    forceSetTimeOut: false, // Use RAF for better performance
    deltaHistory: 10,
    panicMax: 120
  },
  render: {
    antialias: false, // Disable for performance
    pixelArt: true, // Perfect for 16-bit sprites
    roundPixels: true,
    transparent: false,
    clearBeforeRender: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'high-performance',
    batchSize: 4096, // Optimize sprite batching
    maxTextures: 8, // Limit texture units for mobile
    maxLights: 6
  },
  audio: {
    disableWebAudio: false,
    noAudio: false
  },
  input: {
    activePointers: 2, // Support multi-touch
    target: null,
    touch: {
      capture: true
    },
    smoothFactor: 0 // No smoothing for instant response
  },
  disableContextMenu: true,
  banner: false
};

// Performance tiers for dynamic quality adjustment
export const QUALITY_PRESETS = {
  ULTRA: {
    particleLimit: 200,
    shadowQuality: 'high',
    effectsEnabled: true,
    backgroundComplexity: 'full',
    maxSprites: 100
  },
  HIGH: {
    particleLimit: 100,
    shadowQuality: 'medium',
    effectsEnabled: true,
    backgroundComplexity: 'reduced',
    maxSprites: 80
  },
  MEDIUM: {
    particleLimit: 50,
    shadowQuality: 'low',
    effectsEnabled: true,
    backgroundComplexity: 'simple',
    maxSprites: 60
  },
  LOW: {
    particleLimit: 25,
    shadowQuality: 'none',
    effectsEnabled: false,
    backgroundComplexity: 'minimal',
    maxSprites: 40
  },
  POTATO: {
    particleLimit: 10,
    shadowQuality: 'none',
    effectsEnabled: false,
    backgroundComplexity: 'none',
    maxSprites: 20
  }
};

// WebView specific optimizations
export const WEBVIEW_CONFIG = {
  // Input latency optimization
  inputUpdateRate: 16, // 60fps input polling
  inputPrediction: true,
  inputBufferSize: 3,
  
  // Memory management
  maxTextureSize: 2048,
  textureCompression: true,
  atlasOptimization: true,
  
  // Rendering optimization
  batchDrawCalls: true,
  cullingOptimization: true,
  dynamicBatching: true,
  
  // Asset loading
  parallelLoads: 4,
  crossOrigin: 'anonymous',
  responseType: 'blob',
  async: true
};