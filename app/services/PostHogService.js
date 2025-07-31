import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { 
  POSTHOG_API_KEY, 
  POSTHOG_HOST,
  DEBUG 
} from '@env';

// Polyfill TextEncoder for React Native
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const utf8 = unescape(encodeURIComponent(str));
      const result = new Uint8Array(utf8.length);
      for (let i = 0; i < utf8.length; i++) {
        result[i] = utf8.charCodeAt(i);
      }
      return result;
    }
  };
  
  global.TextDecoder = class TextDecoder {
    decode(uint8Array) {
      let str = '';
      for (let i = 0; i < uint8Array.length; i++) {
        str += String.fromCharCode(uint8Array[i]);
      }
      return decodeURIComponent(escape(str));
    }
  };
}

class PostHogService {
  constructor() {
    this.isInitialized = false;
    this.client = null;
  }

  async initialize() {
    try {
      // Only initialize if we have a valid API key
      if (!POSTHOG_API_KEY || POSTHOG_API_KEY === 'your-posthog-project-api-key') {
        console.warn('PostHog API key not configured. Analytics will be disabled.');
        return;
      }

      // Initialize PostHog using the new v4.3.0 API
      this.client = new PostHog(POSTHOG_API_KEY, {
        host: POSTHOG_HOST || 'https://us.posthog.com',
        debug: DEBUG === 'true' || __DEV__,
        enableSessionRecording: false, // Disable for privacy
        captureApplicationLifecycleEvents: true,
        
        // Optional: Add device and app context
        customAppProperties: {
          app_name: '16BitFit',
          app_version: Constants.expoConfig?.version || '1.0.0',
          platform: Platform.OS,
        }
      });
      
      this.isInitialized = true;
      console.log('PostHog initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }

  trackScreen(screenName, properties = {}) {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Screen not tracked:', screenName);
      return;
    }
    try {
      this.client.screen(screenName, {
        ...properties,
        timestamp: new Date().toISOString(),
        app_version: Constants.expoConfig?.version || '1.0.0',
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Error tracking screen:', screenName, error);
    }
  }

  trackEvent(eventName, properties = {}) {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Event not tracked:', eventName);
      return;
    }
    try {
      this.client.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        app_version: Constants.expoConfig?.version || '1.0.0',
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Error tracking event:', eventName, error);
    }
  }

  identify(userId, userProperties = {}) {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. User not identified:', userId);
      return;
    }
    try {
      this.client.identify(userId, userProperties);
    } catch (error) {
      console.error('Error identifying user:', userId, error);
    }
  }

  alias(alias) {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Alias not set:', alias);
      return;
    }
    try {
      this.client.alias(alias);
    } catch (error) {
      console.error('Error setting alias:', alias, error);
    }
  }

  reset() {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Cannot reset.');
      return;
    }
    try {
      this.client.reset();
    } catch (error) {
      console.error('Error resetting PostHog:', error);
    }
  }

  // Feature flags
  isFeatureEnabled(flagKey) {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Feature flag not checked:', flagKey);
      return false;
    }
    try {
      return this.client.isFeatureEnabled(flagKey);
    } catch (error) {
      console.error('Error checking feature flag:', flagKey, error);
      return false;
    }
  }

  getFeatureFlag(flagKey) {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Feature flag not retrieved:', flagKey);
      return undefined;
    }
    try {
      return this.client.getFeatureFlag(flagKey);
    } catch (error) {
      console.error('Error getting feature flag:', flagKey, error);
      return undefined;
    }
  }

  // Group analytics
  group(groupType, groupKey, groupProperties = {}) {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Group not set:', groupType, groupKey);
      return;
    }
    try {
      this.client.group(groupType, groupKey, groupProperties);
    } catch (error) {
      console.error('Error setting group:', groupType, groupKey, error);
    }
  }

  // Flush events
  flush() {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Cannot flush.');
      return Promise.resolve();
    }
    try {
      return this.client.flush();
    } catch (error) {
      console.error('Error flushing PostHog events:', error);
      return Promise.resolve();
    }
  }

  // Opt out/in
  optOut() {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Cannot opt out.');
      return;
    }
    try {
      this.client.optOut();
    } catch (error) {
      console.error('Error opting out:', error);
    }
  }

  optIn() {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. Cannot opt in.');
      return;
    }
    try {
      this.client.optIn();
    } catch (error) {
      console.error('Error opting in:', error);
    }
  }
}

const postHogService = new PostHogService();
export default postHogService; 