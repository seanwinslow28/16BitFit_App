/**
 * Webpack configuration for Phaser 3 WebView build
 * Optimized for mobile performance and minimal bundle size
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    entry: './src/index.js',
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDevelopment ? 'game.[name].js' : 'game.[name].[contenthash].js',
      clean: true,
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb - inline small images
            },
          },
          generator: {
            filename: 'assets/images/[name].[hash][ext]',
          },
        },
        {
          test: /\.(mp3|wav|ogg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/audio/[name].[hash][ext]',
          },
        },
        {
          test: /\.json$/,
          type: 'json',
        },
      ],
    },
    
    plugins: [
      new CleanWebpackPlugin(),
      
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: 'body',
        minify: !isDevelopment && {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
        },
      }),
      
      // Gzip compression for production
      !isDevelopment && new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      }),
    ].filter(Boolean),
    
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: !isDevelopment,
              drop_debugger: !isDevelopment,
              pure_funcs: ['console.log', 'console.info'],
            },
            mangle: {
              safari10: true,
            },
            output: {
              comments: false,
              ascii_only: true,
            },
          },
        }),
      ],
      
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          phaser: {
            test: /[\\/]node_modules[\\/]phaser[\\/]/,
            name: 'phaser',
            priority: 10,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 5,
          },
        },
      },
      
      runtimeChunk: 'single',
    },
    
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@scenes': path.resolve(__dirname, 'src/scenes'),
        '@entities': path.resolve(__dirname, 'src/entities'),
        '@systems': path.resolve(__dirname, 'src/systems'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
    
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 8080,
      hot: true,
      open: false,
      host: '0.0.0.0', // Allow external connections for mobile testing
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      devMiddleware: {
        writeToDisk: true, // Write files to disk for React Native file:// access
      },
    },
    
    devtool: isDevelopment ? 'eval-source-map' : false,
    
    performance: {
      hints: !isDevelopment && 'warning',
      maxEntrypointSize: 512000, // 500kb
      maxAssetSize: 512000,
    },
    
    stats: {
      assets: true,
      chunks: true,
      modules: false,
      entrypoints: true,
      children: false,
    },
  };
};

// Export additional build scripts
module.exports.scripts = {
  'phaser:dev': 'webpack serve --mode development',
  'phaser:build': 'webpack --mode production',
  'phaser:analyze': 'webpack-bundle-analyzer dist/stats.json',
  'phaser:deploy:ios': 'cp -r dist/* ios/16BitFit/phaser/',
  'phaser:deploy:android': 'cp -r dist/* android/app/src/main/assets/phaser/',
};