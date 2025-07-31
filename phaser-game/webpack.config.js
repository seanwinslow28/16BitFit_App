/**
 * Webpack configuration for Phaser 3 game
 * Optimized for mobile WebView deployment
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/main.js',
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'game.bundle.js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        } : false
      }),
      
      new CopyPlugin({
        patterns: [
          { 
            from: 'assets', 
            to: 'assets',
            noErrorOnMissing: true
          },
          { 
            from: 'node_modules/phaser/dist/phaser.min.js', 
            to: 'phaser.min.js' 
          }
        ]
      })
    ],
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: true
            },
            mangle: true,
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          phaser: {
            test: /[\\/]node_modules[\\/]phaser/,
            name: 'phaser',
            priority: 10,
            filename: 'phaser.bundle.js'
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    },
    
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 8080,
      hot: true,
      open: true
    },
    
    resolve: {
      extensions: ['.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'phaser': path.resolve(__dirname, 'node_modules/phaser/dist/phaser.js')
      }
    }
  };
};