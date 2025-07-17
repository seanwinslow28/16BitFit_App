/**
 * Metro Configuration with Performance Optimizations
 * Following MetaSystemsAgent patterns for optimal bundling
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Performance optimizations
config.resolver.platforms = ['ios', 'android', 'web'];

// Asset optimization
config.transformer = {
  ...config.transformer,
  // Enable minification
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: true,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      // Remove console logs in production
      drop_console: process.env.NODE_ENV === 'production',
      // Remove debugger statements
      drop_debugger: true,
      // Remove unused code
      unused: true,
      // Collapse single-use variables
      collapse_vars: true,
      // Reduce variable names
      reduce_vars: true,
      // Remove dead code
      dead_code: true,
    },
  },
  // Enable asset resizing
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  // Optimize images
  imageOptimization: {
    enabled: true,
    quality: 80,
    formats: ['webp', 'avif'],
    progressive: true,
  },
};

// Resolver optimizations
config.resolver = {
  ...config.resolver,
  // Asset extensions in order of preference
  assetExts: [
    ...config.resolver.assetExts,
    'bin', 'txt', 'jpg', 'png', 'json', 'webp', 'avif'
  ],
  // Source extensions
  sourceExts: [
    ...config.resolver.sourceExts,
    'jsx', 'js', 'ts', 'tsx'
  ],
  // Module resolution
  alias: {
    // Create shorter import paths
    '@': path.resolve(__dirname, 'app'),
    '@components': path.resolve(__dirname, 'app/components'),
    '@services': path.resolve(__dirname, 'app/services'),
    '@hooks': path.resolve(__dirname, 'app/hooks'),
    '@assets': path.resolve(__dirname, 'app/assets'),
    '@utils': path.resolve(__dirname, 'app/utils'),
  },
  // Disable symlink resolution for better performance
  symlinks: false,
  // Block list for faster builds
  blockList: [
    /.*\/__tests__\/.*/,
    /.*\/\.git\/.*/,
    /.*\/node_modules\/.*\/\.git\/.*/,
    /.*\/\.vscode\/.*/,
    /.*\/\.idea\/.*/,
  ],
};

// Serializer optimizations
config.serializer = {
  ...config.serializer,
  // Optimize module serialization
  createModuleIdFactory: () => (path) => {
    // Use shorter module IDs
    const name = path.substring(path.lastIndexOf('/') + 1);
    return name.replace(/[^a-zA-Z0-9]/g, '');
  },
  // Process module filter
  processModuleFilter: (module) => {
    // Exclude test files and dev dependencies
    if (module.path.includes('__tests__') || 
        module.path.includes('__mocks__') ||
        module.path.includes('.test.') ||
        module.path.includes('.spec.')) {
      return false;
    }
    return true;
  },
  // Optimize chunk splitting
  getPolyfills: () => [],
  // Custom module maps
  getModulesRunBeforeMainModule: () => [
    require.resolve('react-native/Libraries/Core/InitializeCore'),
  ],
};

// Watcher optimizations
config.watchman = {
  ...config.watchman,
  // Ignore patterns for better performance
  ignore: [
    '**/.git/**',
    '**/node_modules/**',
    '**/.expo/**',
    '**/.next/**',
    '**/build/**',
    '**/dist/**',
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.log',
    '**/.vscode/**',
    '**/.idea/**',
  ],
};

// Server optimizations
config.server = {
  ...config.server,
  // Enable gzip compression
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add compression headers
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return middleware(req, res, next);
    };
  },
  // Port configuration
  port: process.env.RCT_METRO_PORT || 8081,
};

// Cache configuration
config.cacheStores = [
  {
    name: 'FileStore',
    options: {
      root: path.join(__dirname, '.metro-cache'),
    },
  },
];

// Reset cache configuration
config.resetCache = process.env.NODE_ENV === 'development';

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  // Additional production optimizations
  config.transformer.minifierConfig.compress.drop_console = true;
  config.transformer.minifierConfig.compress.drop_debugger = true;
  config.transformer.minifierConfig.compress.passes = 2;
  config.transformer.minifierConfig.mangle.toplevel = true;
  
  // Disable source maps in production
  config.transformer.minifierConfig.sourceMap = false;
  
  // Enable dead code elimination
  config.transformer.minifierConfig.compress.pure_getters = true;
  config.transformer.minifierConfig.compress.unsafe = true;
  config.transformer.minifierConfig.compress.unsafe_comps = true;
  config.transformer.minifierConfig.compress.warnings = false;
}

// Development optimizations
if (process.env.NODE_ENV === 'development') {
  // Fast refresh configuration
  config.resolver.enableSymlinks = false;
  config.watchman.deferredEnabled = true;
  config.watchman.crawl = false;
  
  // Faster builds in development
  config.transformer.enableBabelRCLookup = false;
  config.transformer.enableBabelTransform = true;
}

module.exports = config;