/**
 * PhaserWebView - High-performance WebView wrapper for Phaser 3 game engine
 * Optimized for 60fps fighting game with minimal input latency
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import { getPhaserBridge } from '../gameEngine/phaser/integration/PhaserWebViewBridge';
import PerformanceMonitor from '../gameEngine/core/utils/PerformanceMonitor';

const PHASER_HTML_PATH = Platform.select({
  ios: `${RNFS.MainBundlePath}/phaser-game-dist/index.html`,
  android: 'file:///android_asset/phaser-game-dist/index.html',
  default: 'http://localhost:8080' // For development
});

const PhaserWebView = ({
  onReady,
  onStateUpdate,
  onPerformanceUpdate,
  onError,
  characterData,
  battleConfig,
  style,
}) => {
  const webViewRef = useRef(null);
  const bridgeRef = useRef(null);
  const performanceRef = useRef(new PerformanceMonitor());
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    latency: 0,
    droppedFrames: 0,
  });

  // Initialize bridge on mount
  useEffect(() => {
    bridgeRef.current = getPhaserBridge();
    
    // Set up event listeners
    bridgeRef.current.on('ready', handleBridgeReady);
    bridgeRef.current.on('stateUpdate', handleStateUpdate);
    bridgeRef.current.on('performanceUpdate', handlePerformanceUpdate);
    bridgeRef.current.on('error', handleBridgeError);
    bridgeRef.current.on('performanceWarning', handlePerformanceWarning);
    
    return () => {
      // Clean up
      if (bridgeRef.current) {
        bridgeRef.current.off('ready', handleBridgeReady);
        bridgeRef.current.off('stateUpdate', handleStateUpdate);
        bridgeRef.current.off('performanceUpdate', handlePerformanceUpdate);
        bridgeRef.current.off('error', handleBridgeError);
        bridgeRef.current.off('performanceWarning', handlePerformanceWarning);
      }
    };
  }, []);

  // Handle WebView load
  const handleWebViewLoad = useCallback(() => {
    if (webViewRef.current && bridgeRef.current) {
      bridgeRef.current.init(webViewRef.current);
      
      // Initialize game with config
      const initCode = `
        window.__gameConfig = ${JSON.stringify({
          characterData,
          battleConfig,
          targetFPS: 60,
          enableDebug: __DEV__,
          renderMode: 'webgl',
          antialias: false,
          powerPreference: 'high-performance',
        })};
        
        // Start Phaser game
        if (window.initPhaserGame) {
          window.initPhaserGame(window.__gameConfig);
        }
      `;
      
      webViewRef.current.injectJavaScript(initCode);
    }
  }, [characterData, battleConfig]);

  // Handle bridge ready event
  const handleBridgeReady = useCallback((data) => {
    setIsLoading(false);
    performanceRef.current.start();
    
    if (onReady) {
      onReady({
        bridge: bridgeRef.current,
        timestamp: data.timestamp,
      });
    }
  }, [onReady]);

  // Handle game state updates
  const handleStateUpdate = useCallback((state) => {
    performanceRef.current.recordFrame();
    
    if (onStateUpdate) {
      onStateUpdate(state);
    }
  }, [onStateUpdate]);

  // Handle performance metrics
  const handlePerformanceUpdate = useCallback((metrics) => {
    setPerformanceMetrics({
      fps: metrics.fps || 0,
      latency: metrics.averageLatency || 0,
      droppedFrames: metrics.droppedFrames || 0,
    });
    
    if (onPerformanceUpdate) {
      onPerformanceUpdate(metrics);
    }
  }, [onPerformanceUpdate]);

  // Handle performance warnings
  const handlePerformanceWarning = useCallback((warning) => {
    if (warning.severity === 'critical') {
      Alert.alert(
        'Performance Issue',
        `Game is running at ${warning.fps} FPS. Consider reducing quality settings.`,
        [
          { text: 'Reduce Quality', onPress: () => reduceQuality() },
          { text: 'Continue', style: 'cancel' },
        ]
      );
    }
  }, []);

  // Handle bridge errors
  const handleBridgeError = useCallback((error) => {
    console.error('Bridge error:', error);
    setError(error);
    
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Handle WebView errors
  const handleWebViewError = useCallback((syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError({
      code: nativeEvent.code,
      description: nativeEvent.description,
    });
  }, []);

  // Handle WebView messages
  const handleMessage = useCallback((event) => {
    if (bridgeRef.current) {
      bridgeRef.current.handleMessage(event);
    }
  }, []);

  // Reduce rendering quality for performance
  const reduceQuality = useCallback(() => {
    if (webViewRef.current) {
      const code = `
        if (window.game && window.game.scene) {
          const scene = window.game.scene.getScene('BattleScene');
          if (scene && scene.reduceQuality) {
            scene.reduceQuality();
          }
        }
      `;
      webViewRef.current.injectJavaScript(code);
    }
  }, []);

  // Send input to game
  const sendInput = useCallback((inputType, pressed = true) => {
    if (bridgeRef.current) {
      bridgeRef.current.sendInput(inputType, pressed);
    }
  }, []);

  // Send command to game
  const sendCommand = useCallback((command, data) => {
    if (bridgeRef.current) {
      bridgeRef.current.sendCommand(command, data);
    }
  }, []);

  // WebView configuration for optimal performance
  const webViewConfig = {
    // Core settings
    ref: webViewRef,
    source: { uri: PHASER_HTML_PATH },
    style: [styles.webView, style],
    
    // Performance settings
    javaScriptEnabled: true,
    domStorageEnabled: true,
    startInLoadingState: true,
    scalesPageToFit: false,
    scrollEnabled: false,
    bounces: false,
    
    // Hardware acceleration
    androidHardwareAccelerationDisabled: false,
    androidLayerType: 'hardware',
    
    // Message handling
    onMessage: handleMessage,
    onLoad: handleWebViewLoad,
    onError: handleWebViewError,
    
    // iOS specific
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: false,
    
    // Injection settings
    injectedJavaScriptBeforeContentLoaded: `
      window.__REACT_NATIVE__ = true;
      window.__DEV__ = ${__DEV__};
      window.onerror = function(msg, url, line, col, error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          error: {
            message: msg,
            url: url,
            line: line,
            col: col,
            stack: error ? error.stack : ''
          }
        }));
        return true;
      };
    `,
  };

  // Loading overlay
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FFD700" />
      <Text style={styles.loadingText}>Loading Battle Arena...</Text>
    </View>
  );

  // Error overlay
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load game engine</Text>
      <Text style={styles.errorDetail}>{error?.description || 'Unknown error'}</Text>
    </View>
  );

  // Performance overlay (dev only)
  const renderPerformanceOverlay = () => {
    if (!__DEV__) return null;
    
    return (
      <View style={styles.performanceOverlay}>
        <Text style={styles.performanceText}>
          FPS: {performanceMetrics.fps} | Latency: {performanceMetrics.latency}ms | Dropped: {performanceMetrics.droppedFrames}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <WebView {...webViewConfig} />
      
      {isLoading && renderLoading()}
      {error && renderError()}
      {renderPerformanceOverlay()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 10,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
    }),
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetail: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  performanceOverlay: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 5,
    borderRadius: 5,
  },
  performanceText: {
    color: '#0F0',
    fontSize: 10,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
    }),
  },
});

// Export methods for external control
PhaserWebView.sendInput = (inputType, pressed) => {
  const bridge = getPhaserBridge();
  if (bridge && bridge.isReady) {
    bridge.sendInput(inputType, pressed);
  }
};

PhaserWebView.sendCommand = (command, data) => {
  const bridge = getPhaserBridge();
  if (bridge && bridge.isReady) {
    bridge.sendCommand(command, data);
  }
};

export default PhaserWebView;