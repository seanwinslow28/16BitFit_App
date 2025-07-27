import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { 
  POSTHOG_API_KEY, 
  POSTHOG_HOST,
  DEBUG 
} from '@env';

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

      // Initialize PostHog
      await PostHog.initAsync(POSTHOG_API_KEY, {
        host: POSTHOG_HOST || 'https://us.posthog.com',
        debug: DEBUG === 'true' || __DEV__,
        enableSessionRecording: false, // Disable for privacy
        
        // Device info and app version
        captureApplicationLifecycleEvents: true,
        captureDeeplinks: true,
        
        // Optional: Add device and app context
        properties: {
          app_name: '16BitFit',
          app_version: Constants.expoConfig?.version || '1.0.0',
          platform: Platform.OS,
        }
      });

      this.client = PostHog;
      this.isInitialized = true;
      
      console.log('PostHog initialized successfully');
      
      // Track app launch
      this.trackEvent('app_launched', {
        session_start: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }

  // Track custom events
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

  // Track screen views
  trackScreen(screenName, properties = {}) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Track workout events
  trackWorkout(workoutType, duration, properties = {}) {
    this.trackEvent('workout_completed', {
      workout_type: workoutType,
      duration_seconds: duration,
      ...properties,
    });
  }

  // Track battle events
  trackBattle(battleType, result, properties = {}) {
    this.trackEvent('battle_completed', {
      battle_type: battleType,
      battle_result: result,
      ...properties,
    });
  }

  // Track food logging
  trackFoodLog(foodItem, properties = {}) {
    this.trackEvent('food_logged', {
      food_item: foodItem,
      ...properties,
    });
  }

  // Track user progression
  trackLevelUp(newLevel, characterType, properties = {}) {
    this.trackEvent('level_up', {
      new_level: newLevel,
      character_type: characterType,
      ...properties,
    });
  }

  // Identify user (call when user logs in)
  identifyUser(userId, userProperties = {}) {
    if (!this.isInitialized || !this.client) {
      console.warn('PostHog not initialized. User not identified');
      return;
    }

    try {
      this.client.identify(userId, userProperties);
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }

  // Reset user session (call when user logs out)
  reset() {
    if (!this.isInitialized || !this.client) {
      return;
    }

    try {
      this.client.reset();
    } catch (error) {
      console.error('Error resetting PostHog:', error);
    }
  }

  // Get feature flags
  async getFeatureFlag(flagKey, defaultValue = false) {
    if (!this.isInitialized || !this.client) {
      return defaultValue;
    }

    try {
      return await this.client.getFeatureFlag(flagKey) || defaultValue;
    } catch (error) {
      console.error('Error getting feature flag:', flagKey, error);
      return defaultValue;
    }
  }
}

// Export singleton instance
const postHogService = new PostHogService();

export default postHogService; 