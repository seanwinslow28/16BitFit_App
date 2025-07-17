/**
 * Jest Setup Configuration
 * Test environment setup for 16BitFit app
 * Following MetaSystemsAgent patterns for comprehensive testing
 */

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock React Native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Sound: {
      createAsync: jest.fn(() => ({
        sound: {
          playAsync: jest.fn(),
          stopAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
          setPositionAsync: jest.fn(),
          getStatusAsync: jest.fn(() => ({ isLoaded: true })),
          unloadAsync: jest.fn(),
        },
      })),
    },
    InterruptionModeIOS: {
      DuckOthers: 0,
    },
    InterruptionModeAndroid: {
      DuckOthers: 0,
    },
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({ downloadAsync: jest.fn() })),
    loadAsync: jest.fn(),
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://test/',
  makeDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  downloadAsync: jest.fn(() => ({ status: 200 })),
  getInfoAsync: jest.fn(() => ({ exists: true, size: 1000 })),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-performance', () => ({
  Performance: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1000000,
    },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }) => children,
  createNavigationContainerRef: () => ({ current: null }),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  Version: '14.0',
  select: jest.fn((obj) => obj.ios),
}));

// Mock Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock InteractionManager
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  runAfterInteractions: jest.fn((callback) => callback()),
  createInteractionHandle: jest.fn(),
  clearInteractionHandle: jest.fn(),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Clipboard
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(() => Promise.resolve('')),
}));

// Global test utilities
global.fetch = jest.fn();
global.FormData = jest.fn();
global.XMLHttpRequest = jest.fn();

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset fetch mock
  global.fetch.mockClear();
  
  // Reset AsyncStorage mock
  require('@react-native-async-storage/async-storage').getItem.mockClear();
  require('@react-native-async-storage/async-storage').setItem.mockClear();
  require('@react-native-async-storage/async-storage').removeItem.mockClear();
  
  // Reset NetInfo mock
  require('@react-native-community/netinfo').fetch.mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  });
});

// Cleanup after tests
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Custom matchers
expect.extend({
  toBeValidGameBoyColor(received) {
    const validColors = ['#92CC41', '#0D0D0D', '#F7D51D', '#E53935', '#666', '#FFFFFF'];
    const pass = validColors.includes(received);
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid GameBoy color`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid GameBoy color`,
        pass: false,
      };
    }
  },
  
  toBeValidStatValue(received) {
    const pass = typeof received === 'number' && received >= 0 && received <= 100;
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid stat value`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid stat value (0-100)`,
        pass: false,
      };
    }
  },
});

// Test helpers
global.testHelpers = {
  // Mock player data
  mockPlayerData: {
    level: 5,
    xp: 1250,
    health: 85,
    strength: 70,
    stamina: 90,
    happiness: 80,
    weight: 75,
    evolutionStage: 'trainee',
    gear: {
      hat: null,
      shirt: null,
      pants: null,
      shoes: null,
    },
  },
  
  // Mock workout data
  mockWorkoutData: {
    type: 'cardio',
    duration: 30,
    intensity: 'medium',
    calories: 300,
    timestamp: '2023-01-01T10:00:00Z',
  },
  
  // Mock nutrition data
  mockNutritionData: {
    type: 'healthy',
    calories: 500,
    protein: 25,
    carbs: 60,
    fat: 15,
    timestamp: '2023-01-01T12:00:00Z',
  },
  
  // Mock battle data
  mockBattleData: {
    bossLevel: 5,
    playerPower: 400,
    bossHealth: 100,
    victory: true,
    xpGained: 500,
  },
  
  // Create mock component
  createMockComponent: (name) => {
    return jest.fn().mockImplementation(({ children, ...props }) => {
      const React = require('react');
      return React.createElement(name, props, children);
    });
  },
  
  // Wait for async operations
  waitForAsync: async (fn, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Async operation timed out'));
      }, timeout);
      
      fn().then((result) => {
        clearTimeout(timer);
        resolve(result);
      }).catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  },
  
  // Mock animation frame
  mockAnimationFrame: () => {
    let id = 0;
    const callbacks = new Map();
    
    global.requestAnimationFrame = jest.fn((callback) => {
      const currentId = ++id;
      callbacks.set(currentId, callback);
      return currentId;
    });
    
    global.cancelAnimationFrame = jest.fn((id) => {
      callbacks.delete(id);
    });
    
    return {
      flush: () => {
        callbacks.forEach((callback, id) => {
          callback(Date.now());
          callbacks.delete(id);
        });
      },
      clear: () => {
        callbacks.clear();
      },
    };
  },
};