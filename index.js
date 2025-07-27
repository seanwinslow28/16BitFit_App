/**
 * 16BitFit Main Entry Point
 * @format
 */

// CRITICAL: URL polyfill must be imported first for Supabase compatibility
import 'react-native-url-polyfill/auto';

// Disable React DevTools in production-like mode
if (__DEV__) {
  // Disable React DevTools inspector overlay
  global.__REACT_DEVTOOLS_GLOBAL_HOOK__?.set?.('checkDCE', () => {});
}

import { registerRootComponent } from 'expo';
import App from './App'; // Use the root App.js which imports AppV2

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App); 