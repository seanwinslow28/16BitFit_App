/**
 * Metro Configuration - Simplified for Development
 * Basic configuration optimized for React Native development
 * Properly extends @expo/metro-config as required
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// Basic resolver configuration
config.resolver = {
  ...config.resolver,
  // Asset extensions
  assetExts: [
    ...config.resolver.assetExts,
    'bin', 'txt', 'jpg', 'png', 'json', 'webp'
  ],
  // Source extensions
  sourceExts: [
    ...config.resolver.sourceExts,
    'jsx', 'js', 'ts', 'tsx'
  ],
  // Simple alias configuration
  alias: {
    '@': path.resolve(__dirname, 'app'),
    '@components': path.resolve(__dirname, 'app/components'),
    '@services': path.resolve(__dirname, 'app/services'),
    '@assets': path.resolve(__dirname, 'app/assets'),
  },
  // Exclude test files and phaser-game from bundling
  blockList: [
    /.*\/__tests__\/.*/,
    /.*\.test\.(js|jsx|ts|tsx)$/,
    /.*\.spec\.(js|jsx|ts|tsx)$/,
    /.*\/test\/.*/,
    /phaser-game\/.*/,
    /app\/gameEngine\/phaser\/.*/,
  ],
};

// Basic server configuration
config.server = {
  ...config.server,
  port: 8081,
};

// Development mode optimizations only
if (process.env.NODE_ENV === 'development') {
  // Fast refresh configuration
  config.resolver.enableSymlinks = false;
}

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  // Enable minification only in production
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
      output: {
        ascii_only: true,
        quote_keys: true,
        wrap_iife: true,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
        unused: true,
        dead_code: true,
      },
    },
  };
}

module.exports = config;