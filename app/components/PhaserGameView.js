/**
 * PhaserGameView Component
 * WebView wrapper for Phaser 3 game integration in React Native
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhaserGameView = ({
  gameConfig,
  playerStats,
  boss,
  onGameReady,
  onBattleEnd,
  onUpdateStats,
}) => {
  const webViewRef = useRef(null);
  const [isGameReady, setIsGameReady] = useState(false);

  // Generate the HTML content with Phaser game
  const getGameHTML = () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              background-color: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              touch-action: none;
            }
            #game-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div id="game-container"></div>
          <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
          <script>
            // Import all game files
            ${require('raw-loader!../game/config/GameConfig.js').default}
            ${require('raw-loader!../game/sprites/Player.js').default}
            ${require('raw-loader!../game/sprites/Boss.js').default}
            ${require('raw-loader!../game/systems/BattleHUD.js').default}
            ${require('raw-loader!../game/systems/TouchControls.js').default}
            ${require('raw-loader!../game/systems/ComboSystem.js').default}
            ${require('raw-loader!../game/systems/EffectsManager.js').default}
            ${require('raw-loader!../game/scenes/BootScene.js').default}
            ${require('raw-loader!../game/scenes/BattleMenuScene.js').default}
            ${require('raw-loader!../game/scenes/BattleScene.js').default}
            ${require('raw-loader!../game/scenes/VictoryScene.js').default}
            ${require('raw-loader!../game/scenes/DefeatScene.js').default}
            
            // Bridge between React Native and Phaser
            window.ReactNativeWebView = window.ReactNativeWebView || {
              postMessage: (data) => console.log('Bridge:', data)
            };

            // Player stats passed from React Native
            window.playerStats = ${JSON.stringify(playerStats || {})};
            window.currentBoss = ${JSON.stringify(boss || {})};

            // Communication functions
            window.sendToReactNative = (type, data) => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
            };

            // Game configuration
            const config = {
              type: Phaser.AUTO,
              parent: 'game-container',
              width: 896,
              height: 504,
              backgroundColor: '#000000',
              pixelArt: true,
              antialias: false,
              scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
              },
              physics: {
                default: 'arcade',
                arcade: {
                  gravity: { y: 800 },
                  debug: false,
                },
              },
              scene: [
                BootScene,
                BattleMenuScene,
                BattleScene,
                VictoryScene,
                DefeatScene,
              ],
              input: {
                activePointers: 3,
              },
            };

            // Initialize game
            window.addEventListener('load', () => {
              window.game = new Phaser.Game(config);
              window.sendToReactNative('gameReady', { ready: true });
            });

            // Handle messages from React Native
            window.addEventListener('message', (event) => {
              try {
                const message = JSON.parse(event.data);
                if (window.game && window.game.scene.keys.BattleScene) {
                  const battleScene = window.game.scene.keys.BattleScene;
                  
                  switch (message.type) {
                    case 'startBattle':
                      battleScene.startBattle(message.data);
                      break;
                    case 'pauseGame':
                      battleScene.pauseGame();
                      break;
                    case 'resumeGame':
                      battleScene.resumeGame();
                      break;
                    case 'playerAction':
                      battleScene.handlePlayerAction(message.data);
                      break;
                  }
                }
              } catch (error) {
                console.error('Message handling error:', error);
              }
            });
          </script>
        </body>
      </html>
    `;
    return html;
  };

  // Default Phaser configuration
  const getDefaultConfig = () => ({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 896,
    height: 504,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 800 },
        debug: false,
      },
    },
    scene: [], // Will be populated with actual scenes
  });

  // Handle messages from the WebView
  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'gameReady':
          setIsGameReady(true);
          if (onGameReady) onGameReady();
          break;
        case 'battleEnd':
          if (onBattleEnd) onBattleEnd(message.data);
          break;
        case 'updateStats':
          if (onUpdateStats) onUpdateStats(message.data);
          break;
        case 'error':
          console.error('Game error:', message.data);
          break;
      }
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  };

  // Send message to the game
  const sendToGame = (type, data) => {
    if (webViewRef.current && isGameReady) {
      webViewRef.current.postMessage(JSON.stringify({ type, data }));
    }
  };

  // Public methods exposed to parent
  useEffect(() => {
    if (isGameReady) {
      // Start the battle when game is ready
      sendToGame('startBattle', { playerStats, boss });
    }
  }, [isGameReady, playerStats, boss]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getGameHTML() }}
        style={styles.webView}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        injectedJavaScript={`
          window.isReactNative = true;
          true;
        `}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default PhaserGameView;