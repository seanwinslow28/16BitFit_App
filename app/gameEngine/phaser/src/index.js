/**
 * Phaser 3 Game Entry Point for 16BitFit
 * Optimized for WebView integration and 60fps mobile performance
 */

import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import BattleScene from './scenes/BattleScene';
import { BridgeManager } from './managers/BridgeManager';
import { PerformanceMonitor } from './utils/PerformanceMonitor';

// Initialize bridge communication
const bridgeManager = new BridgeManager();

// Game configuration optimized for mobile
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0D0D0D',
  
  // Physics configuration
  physics: {
    default: 'arcade',
    arcade: {
      fps: 60,
      fixedStep: true,
      gravity: { x: 0, y: 980 },
      debug: window.GAME_CONFIG.debug,
      // Performance optimizations
      overlapBias: 4,
      tileBias: 8,
      forceX: false,
      isPaused: false,
      timeScale: 1,
      // Reduce physics iterations for performance
      velocityIterations: 4,
      positionIterations: 4,
    },
  },
  
  // Rendering optimizations
  render: {
    antialias: window.GAME_CONFIG.antialias,
    pixelArt: window.GAME_CONFIG.pixelArt,
    transparent: false,
    clearBeforeRender: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'high-performance',
    desynchronized: true,
    batchSize: 2048, // Increased batch size for sprite batching
  },
  
  // Audio configuration
  audio: {
    disableWebAudio: false,
    noAudio: false,
  },
  
  // Input configuration
  input: {
    activePointers: 4, // Support multi-touch
    target: null,
    capture: true,
    mouse: {
      target: null,
      capture: true,
      preventDefaultDown: true,
      preventDefaultUp: true,
      preventDefaultMove: true,
      preventDefaultWheel: true,
    },
    touch: {
      target: null,
      capture: true,
    },
    smoothFactor: 0,
    windowEvents: true,
  },
  
  // Performance settings
  fps: {
    target: window.GAME_CONFIG.targetFPS,
    min: 30,
    forceSetTimeOut: false,
    deltaHistory: 10,
    panicMax: 120,
    smoothStep: true,
  },
  
  // Scale configuration
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'game-container',
    width: '100%',
    height: '100%',
    min: {
      width: 320,
      height: 480,
    },
    max: {
      width: 1920,
      height: 1080,
    },
    autoRound: true,
  },
  
  // Scene configuration
  scene: [BootScene, PreloadScene, BattleScene],
  
  // Callbacks
  callbacks: {
    postBoot: (game) => {
      // Initialize performance monitoring
      const perfMonitor = new PerformanceMonitor(game);
      game.perfMonitor = perfMonitor;
      
      // Set up bridge callbacks
      bridgeManager.setGame(game);
      
      // Notify React Native that game is booted
      bridgeManager.sendMessage({
        type: 'gameBooted',
        timestamp: Date.now(),
      });
    },
  },
};

// Handle window resize
window.addEventListener('resize', () => {
  if (window.game) {
    window.game.scale.resize(window.innerWidth, window.innerHeight);
  }
});

// Create game instance
let game;

function initGame() {
  // Destroy existing game if any
  if (window.game) {
    window.game.destroy(true);
  }
  
  // Create new game instance
  game = new Phaser.Game(config);
  window.game = game;
  
  // Set up global error handling
  game.events.on('error', (error) => {
    console.error('Phaser error:', error);
    bridgeManager.sendMessage({
      type: 'gameError',
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  });
  
  // Set up visibility handling
  game.events.on('blur', () => {
    game.loop.sleep();
    bridgeManager.sendMessage({ type: 'gamePaused' });
  });
  
  game.events.on('focus', () => {
    game.loop.wake();
    bridgeManager.sendMessage({ type: 'gameResumed' });
  });
  
  // Performance tracking
  let frameCount = 0;
  game.events.on('step', () => {
    frameCount++;
    if (frameCount % 60 === 0) {
      const metrics = game.perfMonitor.getMetrics();
      window.updatePerformanceDisplay(metrics);
      bridgeManager.sendPerformanceMetrics(metrics);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

// Export for debugging
window.Phaser = Phaser;
window.bridgeManager = bridgeManager;

// Handle messages from React Native
window.addEventListener('message', (event) => {
  try {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    bridgeManager.handleMessage(data);
  } catch (error) {
    console.error('Failed to handle message:', error);
  }
});

// Touch input optimization
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    // Prevent default to avoid delays
    e.preventDefault();
  }
}, { passive: false });

// Prevent context menu on long press
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

// Export game instance
export default game;