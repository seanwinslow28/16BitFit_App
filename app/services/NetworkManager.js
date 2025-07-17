/**
 * Network Manager
 * Handles network connectivity, retry logic, and offline mode
 * Following MetaSystemsAgent patterns for resilient networking
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@16BitFit:offlineQueue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Base delay in ms, will be exponentially increased

// Request types that can be queued
const QUEUEABLE_TYPES = {
  SAVE_PROGRESS: 'save_progress',
  SYNC_DATA: 'sync_data',
  ACHIEVEMENT: 'achievement',
  SOCIAL_POST: 'social_post',
  FRIEND_REQUEST: 'friend_request',
  CHALLENGE_UPDATE: 'challenge_update',
};

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.connectionType = 'unknown';
    this.listeners = new Map();
    this.offlineQueue = [];
    this.retryTimeouts = new Map();
    this.initialized = false;
  }

  /**
   * Initialize network monitoring
   */
  async initialize() {
    try {
      // Load offline queue from storage
      await this.loadOfflineQueue();
      
      // Subscribe to network state changes
      this.unsubscribe = NetInfo.addEventListener(state => {
        this.handleConnectionChange(state);
      });
      
      // Get initial network state
      const state = await NetInfo.fetch();
      this.handleConnectionChange(state);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize NetworkManager:', error);
      return false;
    }
  }

  /**
   * Handle network connection changes
   */
  handleConnectionChange(state) {
    const wasConnected = this.isConnected;
    this.isConnected = state.isConnected && state.isInternetReachable;
    this.connectionType = state.type;
    
    // Notify listeners
    this.notifyListeners({
      isConnected: this.isConnected,
      connectionType: this.connectionType,
      wasConnected,
    });
    
    // If we just got connected, process offline queue
    if (!wasConnected && this.isConnected) {
      this.processOfflineQueue();
    }
  }

  /**
   * Make a network request with retry logic
   */
  async request(url, options = {}, config = {}) {
    const {
      maxRetries = MAX_RETRIES,
      retryDelay = RETRY_DELAY,
      queueIfOffline = true,
      queueType = QUEUEABLE_TYPES.SYNC_DATA,
      onRetry = () => {},
    } = config;

    // Check if we're offline and should queue
    if (!this.isConnected && queueIfOffline) {
      return this.queueRequest(url, options, config);
    }

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.performRequest(url, options);
        
        // If successful, return the response
        if (response.ok) {
          return {
            success: true,
            data: await response.json(),
            cached: false,
          };
        }
        
        // Handle specific HTTP errors
        if (response.status === 401) {
          // Unauthorized - don't retry
          throw new Error('Unauthorized');
        }
        
        if (response.status >= 500) {
          // Server error - retry
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Other errors - don't retry
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.status}`);
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.message === 'Unauthorized' || attempt === maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        
        // Notify about retry
        onRetry(attempt + 1, maxRetries, delay);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If all retries failed, handle based on config
    if (queueIfOffline) {
      return this.queueRequest(url, options, config);
    }
    
    return {
      success: false,
      error: lastError.message,
      cached: false,
    };
  }

  /**
   * Perform the actual network request
   */
  async performRequest(url, options = {}) {
    // Add timeout to requests
    const timeout = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Queue a request for later when offline
   */
  async queueRequest(url, options, config) {
    const request = {
      id: Date.now().toString(),
      url,
      options,
      config,
      timestamp: Date.now(),
      type: config.queueType,
    };
    
    this.offlineQueue.push(request);
    await this.saveOfflineQueue();
    
    return {
      success: false,
      error: 'Offline - request queued',
      queued: true,
      queueId: request.id,
    };
  }

  /**
   * Process queued requests when coming back online
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;
    
    console.log(`Processing ${this.offlineQueue.length} offline requests`);
    
    const processedIds = [];
    
    for (const request of this.offlineQueue) {
      try {
        // Skip if request is too old (24 hours)
        if (Date.now() - request.timestamp > 24 * 60 * 60 * 1000) {
          processedIds.push(request.id);
          continue;
        }
        
        // Try to process the request
        const result = await this.request(
          request.url,
          request.options,
          { ...request.config, queueIfOffline: false }
        );
        
        if (result.success) {
          processedIds.push(request.id);
          
          // Notify listeners about successful sync
          this.notifyListeners({
            type: 'queue_processed',
            request,
            result,
          });
        }
      } catch (error) {
        console.error('Failed to process queued request:', error);
      }
    }
    
    // Remove processed requests
    this.offlineQueue = this.offlineQueue.filter(
      req => !processedIds.includes(req.id)
    );
    await this.saveOfflineQueue();
  }

  /**
   * Load offline queue from storage
   */
  async loadOfflineQueue() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        this.offlineQueue = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Save offline queue to storage
   */
  async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Check if currently connected
   */
  isOnline() {
    return this.isConnected;
  }

  /**
   * Get connection type
   */
  getConnectionType() {
    return this.connectionType;
  }

  /**
   * Get offline queue size
   */
  getQueueSize() {
    return this.offlineQueue.length;
  }

  /**
   * Clear offline queue
   */
  async clearQueue() {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
  }

  /**
   * Add a listener for network changes
   */
  addListener(id, callback) {
    this.listeners.set(id, callback);
  }

  /**
   * Remove a listener
   */
  removeListener(id) {
    this.listeners.delete(id);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  /**
   * Retry a specific failed request
   */
  async retryRequest(requestId) {
    const request = this.offlineQueue.find(req => req.id === requestId);
    if (!request) return null;
    
    try {
      const result = await this.request(
        request.url,
        request.options,
        { ...request.config, queueIfOffline: false }
      );
      
      if (result.success) {
        // Remove from queue
        this.offlineQueue = this.offlineQueue.filter(req => req.id !== requestId);
        await this.saveOfflineQueue();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    // Clear retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }
}

// Create singleton instance
const networkManager = new NetworkManager();

export default networkManager;
export { QUEUEABLE_TYPES };