/**
 * PhaserWebViewBridge - High-performance bidirectional communication bridge
 * Optimized for 60fps fighting game with <50ms input latency
 * 
 * Architecture:
 * - MessageChannel API for faster communication than postMessage
 * - Structured clone algorithm for zero-copy transfers
 * - Binary protocol for input events
 * - Shared memory buffers for game state
 */

import { NativeEventEmitter, NativeModules } from 'react-native';

// Binary message types for optimal performance
const MESSAGE_TYPES = {
  // Core messages (1-10)
  INIT: 0x01,
  READY: 0x02,
  ERROR: 0x03,
  
  // Input messages (11-30) - High frequency
  INPUT_DOWN: 0x0B,
  INPUT_UP: 0x0C,
  INPUT_MOVE: 0x0D,
  INPUT_COMBO: 0x0E,
  
  // Game state (31-50) - Medium frequency  
  STATE_UPDATE: 0x1F,
  HEALTH_UPDATE: 0x20,
  COMBO_UPDATE: 0x21,
  SPECIAL_UPDATE: 0x22,
  
  // Asset loading (51-70) - Low frequency
  ASSET_REQUEST: 0x33,
  ASSET_LOADED: 0x34,
  ASSET_PROGRESS: 0x35,
  
  // Performance (71-90) - Debug only
  PERF_METRICS: 0x47,
  PERF_WARNING: 0x48,
};

// Input codes for binary protocol
const INPUT_CODES = {
  LEFT: 0x01,
  RIGHT: 0x02,
  UP: 0x04,
  DOWN: 0x08,
  PUNCH: 0x10,
  KICK: 0x20,
  BLOCK: 0x40,
  SPECIAL: 0x80,
};

class PhaserWebViewBridge {
  constructor() {
    this.webViewRef = null;
    this.messageChannel = null;
    this.sharedBuffer = null;
    this.inputBuffer = null;
    this.listeners = new Map();
    this.pendingMessages = [];
    this.isReady = false;
    this.performanceMetrics = {
      messageCount: 0,
      totalLatency: 0,
      maxLatency: 0,
      droppedFrames: 0,
    };
    
    // Pre-allocate buffers for performance
    this.inputArrayBuffer = new ArrayBuffer(16); // 16 bytes for input data
    this.inputDataView = new DataView(this.inputArrayBuffer);
    this.stateArrayBuffer = new ArrayBuffer(256); // 256 bytes for game state
    this.stateDataView = new DataView(this.stateArrayBuffer);
    
    // Bind methods
    this.handleMessage = this.handleMessage.bind(this);
    this.sendInput = this.sendInput.bind(this);
  }
  
  /**
   * Initialize the bridge with WebView reference
   */
  init(webViewRef) {
    this.webViewRef = webViewRef;
    
    // Inject high-performance bridge code
    const bridgeCode = this.generateBridgeCode();
    webViewRef.injectJavaScript(bridgeCode);
    
    // Set up message channel if available
    if (typeof MessageChannel !== 'undefined') {
      this.setupMessageChannel();
    }
    
    return this;
  }
  
  /**
   * Generate optimized bridge code for WebView injection
   */
  generateBridgeCode() {
    return `
    (function() {
      // High-performance WebView bridge
      window.__phaserBridge = {
        // Message type constants
        MESSAGE_TYPES: ${JSON.stringify(MESSAGE_TYPES)},
        INPUT_CODES: ${JSON.stringify(INPUT_CODES)},
        
        // Performance tracking
        metrics: {
          frameCount: 0,
          inputLatency: [],
          renderTime: [],
          lastFrameTime: 0,
        },
        
        // Binary message sending for inputs
        sendBinaryInput: function(inputCode, timestamp) {
          const buffer = new ArrayBuffer(12);
          const view = new DataView(buffer);
          
          // Message structure: [type(1), inputCode(1), timestamp(8), reserved(2)]
          view.setUint8(0, 0x0B); // INPUT_DOWN
          view.setUint8(1, inputCode);
          view.setFloat64(2, timestamp || performance.now());
          
          // Use transferable objects for zero-copy
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(buffer, [buffer]);
          }
        },
        
        // Optimized state update
        sendStateUpdate: function(state) {
          const buffer = new ArrayBuffer(256);
          const view = new DataView(buffer);
          
          // Header
          view.setUint8(0, 0x1F); // STATE_UPDATE
          view.setUint8(1, 1); // Version
          
          // Player state (offset 8)
          view.setFloat32(8, state.player.x);
          view.setFloat32(12, state.player.y);
          view.setFloat32(16, state.player.health);
          view.setUint8(20, state.player.state);
          view.setUint8(21, state.player.frame);
          
          // Boss state (offset 32)
          view.setFloat32(32, state.boss.x);
          view.setFloat32(36, state.boss.y);
          view.setFloat32(40, state.boss.health);
          view.setUint8(44, state.boss.state);
          view.setUint8(45, state.boss.frame);
          
          // Combat state (offset 64)
          view.setUint16(64, state.combo);
          view.setUint8(66, state.specialMeter);
          view.setFloat32(68, state.damageMultiplier);
          
          // Timestamp (offset 248)
          view.setFloat64(248, performance.now());
          
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(buffer, [buffer]);
          }
        },
        
        // Request asset with priority
        requestAsset: function(assetId, priority) {
          const msg = {
            type: 0x33, // ASSET_REQUEST
            assetId: assetId,
            priority: priority || 0,
            timestamp: performance.now(),
          };
          
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(msg));
          }
        },
        
        // Performance monitoring
        trackFrameTime: function(frameTime) {
          this.metrics.frameCount++;
          this.metrics.renderTime.push(frameTime);
          
          // Keep only last 60 frames
          if (this.metrics.renderTime.length > 60) {
            this.metrics.renderTime.shift();
          }
          
          // Send performance update every 60 frames
          if (this.metrics.frameCount % 60 === 0) {
            this.sendPerformanceMetrics();
          }
        },
        
        sendPerformanceMetrics: function() {
          const avgRenderTime = this.metrics.renderTime.reduce((a, b) => a + b, 0) / this.metrics.renderTime.length;
          const fps = 1000 / avgRenderTime;
          
          const metrics = {
            type: 0x47, // PERF_METRICS
            fps: Math.round(fps),
            avgRenderTime: avgRenderTime,
            frameCount: this.metrics.frameCount,
            timestamp: performance.now(),
          };
          
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(metrics));
          }
        },
        
        // Initialize bridge
        init: function() {
          // Override console for debugging
          const originalLog = console.log;
          console.log = function(...args) {
            originalLog.apply(console, args);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'console',
                level: 'log',
                args: args.map(arg => String(arg)),
              }));
            }
          };
          
          // Send ready signal
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 0x02, // READY
              timestamp: performance.now(),
            }));
          }
        }
      };
      
      // Auto-initialize
      window.__phaserBridge.init();
    })();
    `;
  }
  
  /**
   * Set up MessageChannel for faster communication (experimental)
   */
  setupMessageChannel() {
    try {
      this.messageChannel = new MessageChannel();
      
      // Port 1 for React Native -> WebView
      this.messageChannel.port1.onmessage = (event) => {
        this.handleChannelMessage(event.data);
      };
      
      // Transfer port 2 to WebView
      if (this.webViewRef) {
        const transferCode = `
          window.__phaserBridge.messagePort = event.ports[0];
          window.__phaserBridge.messagePort.onmessage = function(e) {
            window.__phaserBridge.handleNativeMessage(e.data);
          };
        `;
        
        this.webViewRef.postMessage('', '*', [this.messageChannel.port2]);
        this.webViewRef.injectJavaScript(transferCode);
      }
    } catch (error) {
      console.warn('MessageChannel not supported:', error);
    }
  }
  
  /**
   * Send input event with minimal latency
   */
  sendInput(inputType, pressed = true) {
    if (!this.isReady) {
      return;
    }
    
    const timestamp = Date.now();
    const inputCode = INPUT_CODES[inputType.toUpperCase()];
    
    if (!inputCode) {
      console.warn('Unknown input type:', inputType);
      return;
    }
    
    // Pack input data into binary format
    this.inputDataView.setUint8(0, pressed ? MESSAGE_TYPES.INPUT_DOWN : MESSAGE_TYPES.INPUT_UP);
    this.inputDataView.setUint8(1, inputCode);
    this.inputDataView.setFloat64(2, timestamp);
    this.inputDataView.setUint16(10, this.performanceMetrics.messageCount++);
    
    // Send via fastest available method
    if (this.messageChannel && this.messageChannel.port1) {
      this.messageChannel.port1.postMessage(this.inputArrayBuffer, [this.inputArrayBuffer.slice(0)]);
    } else if (this.webViewRef) {
      // Fallback to postMessage
      const code = `
        window.__phaserBridge.handleInputBuffer(${JSON.stringify(Array.from(new Uint8Array(this.inputArrayBuffer)))});
      `;
      this.webViewRef.injectJavaScript(code);
    }
    
    // Track latency
    this.trackInputLatency(timestamp);
  }
  
  /**
   * Handle messages from WebView
   */
  handleMessage(event) {
    try {
      let data;
      
      // Handle binary messages
      if (event.nativeEvent.data instanceof ArrayBuffer) {
        data = this.parseBinaryMessage(event.nativeEvent.data);
      } else {
        // Parse JSON messages
        data = JSON.parse(event.nativeEvent.data);
      }
      
      // Process by type
      switch (data.type) {
        case MESSAGE_TYPES.READY:
          this.isReady = true;
          this.flushPendingMessages();
          this.emit('ready', data);
          break;
          
        case MESSAGE_TYPES.STATE_UPDATE:
          this.handleStateUpdate(data);
          break;
          
        case MESSAGE_TYPES.PERF_METRICS:
          this.handlePerformanceMetrics(data);
          break;
          
        case MESSAGE_TYPES.ERROR:
          console.error('WebView error:', data.error);
          this.emit('error', data);
          break;
          
        default:
          // Emit to listeners
          this.emit(data.type, data);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }
  
  /**
   * Parse binary message from WebView
   */
  parseBinaryMessage(buffer) {
    const view = new DataView(buffer);
    const type = view.getUint8(0);
    
    switch (type) {
      case MESSAGE_TYPES.STATE_UPDATE:
        return {
          type,
          player: {
            x: view.getFloat32(8),
            y: view.getFloat32(12),
            health: view.getFloat32(16),
            state: view.getUint8(20),
            frame: view.getUint8(21),
          },
          boss: {
            x: view.getFloat32(32),
            y: view.getFloat32(36),
            health: view.getFloat32(40),
            state: view.getUint8(44),
            frame: view.getUint8(45),
          },
          combat: {
            combo: view.getUint16(64),
            specialMeter: view.getUint8(66),
            damageMultiplier: view.getFloat32(68),
          },
          timestamp: view.getFloat64(248),
        };
        
      default:
        // Fallback to basic parsing
        return {
          type,
          timestamp: view.getFloat64(buffer.byteLength - 8),
        };
    }
  }
  
  /**
   * Handle game state updates
   */
  handleStateUpdate(state) {
    // Calculate frame time
    const now = Date.now();
    const frameTime = this.lastStateUpdate ? now - this.lastStateUpdate : 16.67;
    this.lastStateUpdate = now;
    
    // Check for dropped frames
    if (frameTime > 20) {
      this.performanceMetrics.droppedFrames++;
    }
    
    // Emit state update
    this.emit('stateUpdate', state);
  }
  
  /**
   * Handle performance metrics from WebView
   */
  handlePerformanceMetrics(metrics) {
    // Merge with local metrics
    this.performanceMetrics = {
      ...this.performanceMetrics,
      ...metrics,
      lastUpdate: Date.now(),
    };
    
    // Check for performance issues
    if (metrics.fps < 55) {
      this.emit('performanceWarning', {
        fps: metrics.fps,
        severity: metrics.fps < 30 ? 'critical' : 'warning',
      });
    }
    
    this.emit('performanceUpdate', this.performanceMetrics);
  }
  
  /**
   * Track input latency
   */
  trackInputLatency(timestamp) {
    // Store timestamp for latency calculation
    this.pendingInputs = this.pendingInputs || new Map();
    this.pendingInputs.set(this.performanceMetrics.messageCount - 1, timestamp);
    
    // Clean old entries
    if (this.pendingInputs.size > 100) {
      const oldestKey = this.pendingInputs.keys().next().value;
      this.pendingInputs.delete(oldestKey);
    }
  }
  
  /**
   * Load asset with priority queue
   */
  loadAsset(assetId, assetData, priority = 0) {
    const code = `
      window.__phaserBridge.receiveAsset({
        id: '${assetId}',
        data: '${assetData}',
        priority: ${priority},
        timestamp: ${Date.now()}
      });
    `;
    
    if (this.isReady) {
      this.webViewRef.injectJavaScript(code);
    } else {
      this.pendingMessages.push({ code, priority });
    }
  }
  
  /**
   * Send command to Phaser game
   */
  sendCommand(command, data) {
    const code = `
      if (window.game && window.game.scene) {
        const scene = window.game.scene.getScene('BattleScene');
        if (scene && scene.${command}) {
          scene.${command}(${JSON.stringify(data)});
        }
      }
    `;
    
    if (this.isReady) {
      this.webViewRef.injectJavaScript(code);
    } else {
      this.pendingMessages.push({ code, priority: 1 });
    }
  }
  
  /**
   * Flush pending messages when ready
   */
  flushPendingMessages() {
    // Sort by priority
    this.pendingMessages.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Execute all pending
    for (const msg of this.pendingMessages) {
      this.webViewRef.injectJavaScript(msg.code);
    }
    
    this.pendingMessages = [];
  }
  
  /**
   * Event emitter methods
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }
  
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
    return this;
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      }
    }
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    const avgLatency = this.performanceMetrics.totalLatency / this.performanceMetrics.messageCount || 0;
    
    return {
      messageCount: this.performanceMetrics.messageCount,
      averageLatency: avgLatency.toFixed(2) + 'ms',
      maxLatency: this.performanceMetrics.maxLatency.toFixed(2) + 'ms',
      droppedFrames: this.performanceMetrics.droppedFrames,
      fps: this.performanceMetrics.fps || 0,
      lastUpdate: this.performanceMetrics.lastUpdate,
    };
  }
  
  /**
   * Destroy bridge and clean up
   */
  destroy() {
    this.isReady = false;
    this.listeners.clear();
    this.pendingMessages = [];
    
    if (this.messageChannel) {
      this.messageChannel.port1.close();
      this.messageChannel = null;
    }
    
    this.webViewRef = null;
  }
}

// Singleton instance
let bridgeInstance = null;

export const getPhaserBridge = () => {
  if (!bridgeInstance) {
    bridgeInstance = new PhaserWebViewBridge();
  }
  return bridgeInstance;
};

export default PhaserWebViewBridge;