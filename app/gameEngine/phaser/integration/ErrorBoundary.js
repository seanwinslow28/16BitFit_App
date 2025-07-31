/**
 * ErrorBoundary - WebView error handling and fallback mechanisms
 * Provides graceful degradation when WebView fails or has performance issues
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ERROR_TYPES = {
  WEBVIEW_CRASH: 'webview_crash',
  PERFORMANCE_CRITICAL: 'performance_critical',
  ASSET_LOAD_FAILURE: 'asset_load_failure',
  BRIDGE_TIMEOUT: 'bridge_timeout',
  MEMORY_PRESSURE: 'memory_pressure',
  NETWORK_ERROR: 'network_error',
};

const MAX_RETRY_ATTEMPTS = 3;
const ERROR_LOG_KEY = '@16bitfit_webview_errors';

class WebViewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorType: null,
      retryCount: 0,
      fallbackMode: false,
      errorLog: [],
    };
    
    this.retryTimeoutRef = null;
  }
  
  static getDerivedStateFromError(error) {
    // Update state to display fallback UI
    return {
      hasError: true,
      error: error.toString(),
      errorType: ERROR_TYPES.WEBVIEW_CRASH,
    };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error details
    this.logError({
      error: error.toString(),
      errorInfo,
      timestamp: new Date().toISOString(),
      type: ERROR_TYPES.WEBVIEW_CRASH,
    });
    
    // Report to crash analytics
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Attempt recovery
    this.attemptRecovery();
  }
  
  componentDidMount() {
    // Load error history
    this.loadErrorLog();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
  }
  
  componentWillUnmount() {
    if (this.retryTimeoutRef) {
      clearTimeout(this.retryTimeoutRef);
    }
  }
  
  // Load error log from storage
  loadErrorLog = async () => {
    try {
      const logData = await AsyncStorage.getItem(ERROR_LOG_KEY);
      if (logData) {
        const errorLog = JSON.parse(logData);
        this.setState({ errorLog });
        
        // Check for repeated crashes
        this.checkCrashPattern(errorLog);
      }
    } catch (error) {
      console.error('Failed to load error log:', error);
    }
  };
  
  // Save error to persistent log
  logError = async (errorData) => {
    try {
      const { errorLog } = this.state;
      const updatedLog = [...errorLog, errorData].slice(-20); // Keep last 20 errors
      
      this.setState({ errorLog: updatedLog });
      await AsyncStorage.setItem(ERROR_LOG_KEY, JSON.stringify(updatedLog));
    } catch (error) {
      console.error('Failed to save error log:', error);
    }
  };
  
  // Check for crash patterns
  checkCrashPattern = (errorLog) => {
    const recentErrors = errorLog.filter(err => {
      const errorTime = new Date(err.timestamp);
      const hourAgo = new Date(Date.now() - 3600000);
      return errorTime > hourAgo;
    });
    
    // If more than 5 crashes in the last hour, enable fallback mode
    if (recentErrors.length > 5) {
      this.setState({ fallbackMode: true });
      Alert.alert(
        'Performance Issues Detected',
        'The game engine is experiencing repeated issues. Switching to fallback mode for stability.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Set up performance monitoring
  setupPerformanceMonitoring = () => {
    if (this.props.performanceThreshold) {
      // Monitor for critical performance issues
      this.performanceCheckInterval = setInterval(() => {
        if (this.props.getCurrentPerformance) {
          const perf = this.props.getCurrentPerformance();
          
          if (perf.fps < 20 || perf.droppedFrames > 30) {
            this.handlePerformanceCritical();
          }
        }
      }, 5000); // Check every 5 seconds
    }
  };
  
  // Handle critical performance issues
  handlePerformanceCritical = () => {
    this.setState({
      hasError: true,
      errorType: ERROR_TYPES.PERFORMANCE_CRITICAL,
      error: 'Game performance has degraded below playable levels',
    });
    
    this.logError({
      type: ERROR_TYPES.PERFORMANCE_CRITICAL,
      timestamp: new Date().toISOString(),
    });
    
    // Don't retry for performance issues - go straight to fallback
    this.enableFallbackMode();
  };
  
  // Attempt to recover from error
  attemptRecovery = () => {
    const { retryCount } = this.state;
    
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      
      this.retryTimeoutRef = setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          retryCount: retryCount + 1,
        });
      }, delay);
    } else {
      // Max retries reached, enable fallback
      this.enableFallbackMode();
    }
  };
  
  // Enable fallback mode
  enableFallbackMode = () => {
    this.setState({ fallbackMode: true });
    
    Alert.alert(
      'Game Engine Error',
      'The game engine failed to load properly. You can continue with limited functionality or try again later.',
      [
        {
          text: 'Use Fallback',
          onPress: () => this.props.onFallbackMode?.(),
        },
        {
          text: 'Retry',
          onPress: () => this.resetError(),
        },
      ]
    );
  };
  
  // Manual retry
  handleRetry = () => {
    this.resetError();
  };
  
  // Reset error state
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorType: null,
      retryCount: 0,
      fallbackMode: false,
    });
  };
  
  // Clear error history
  clearErrorHistory = async () => {
    try {
      await AsyncStorage.removeItem(ERROR_LOG_KEY);
      this.setState({ errorLog: [] });
      Alert.alert('Success', 'Error history cleared');
    } catch (error) {
      console.error('Failed to clear error history:', error);
    }
  };
  
  // Render error UI
  renderErrorUI = () => {
    const { error, errorType, retryCount, fallbackMode } = this.state;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          {errorType === ERROR_TYPES.PERFORMANCE_CRITICAL
            ? 'Performance Issue'
            : 'Game Engine Error'}
        </Text>
        
        <Text style={styles.errorMessage}>
          {error || 'An unexpected error occurred'}
        </Text>
        
        {retryCount > 0 && (
          <Text style={styles.retryInfo}>
            Retry attempt {retryCount} of {MAX_RETRY_ATTEMPTS}
          </Text>
        )}
        
        <View style={styles.buttonContainer}>
          {!fallbackMode && (
            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRetry}
              disabled={retryCount >= MAX_RETRY_ATTEMPTS}
            >
              <Text style={styles.buttonText}>
                {retryCount < MAX_RETRY_ATTEMPTS ? 'Retry' : 'Max Retries Reached'}
              </Text>
            </TouchableOpacity>
          )}
          
          {fallbackMode && this.props.fallbackComponent && (
            <TouchableOpacity
              style={[styles.button, styles.fallbackButton]}
              onPress={() => this.setState({ hasError: false })}
            >
              <Text style={styles.buttonText}>Use Fallback Mode</Text>
            </TouchableOpacity>
          )}
          
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.button, styles.debugButton]}
              onPress={this.clearErrorHistory}
            >
              <Text style={styles.buttonText}>Clear Error History</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Error Log: {this.state.errorLog.length} errors recorded
            </Text>
          </View>
        )}
      </View>
    );
  };
  
  render() {
    const { hasError, fallbackMode } = this.state;
    const { children, fallbackComponent } = this.props;
    
    if (hasError && !fallbackMode) {
      return this.renderErrorUI();
    }
    
    if (fallbackMode && fallbackComponent) {
      return fallbackComponent;
    }
    
    return children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryInfo: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  fallbackButton: {
    backgroundColor: '#FF9800',
  },
  debugButton: {
    backgroundColor: '#2196F3',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
  },
  debugText: {
    color: '#00ff00',
    fontSize: 12,
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
    }),
  },
});

// HOC for wrapping components with error boundary
export const withWebViewErrorBoundary = (Component, options = {}) => {
  return (props) => (
    <WebViewErrorBoundary {...options}>
      <Component {...props} />
    </WebViewErrorBoundary>
  );
};

export default WebViewErrorBoundary;