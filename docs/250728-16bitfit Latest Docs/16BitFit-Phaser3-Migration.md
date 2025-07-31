/*
================================================================================
|
|   16BitFit: Technical Guide for Phaser 3 + WebView Migration
|
|   This document provides the code structure and architectural plan for
|   migrating the 16BitFit battle system to Phaser 3, rendered within a
|   React Native WebView.
|
|   It is broken into three parts:
|   1. React Native Client Code (`BattleScreen.js`)
|   2. Phaser 3 Game Code (TypeScript)
|   3. Project Setup & Bundling Instructions
|
================================================================================
*/

//==============================================================================
//
//  PART 1: REACT NATIVE CLIENT CODE
//
//  This component is responsible for loading the WebView, passing initial
//  player stats to the game, and receiving the results of the battle.
//
//==============================================================================

// screens/BattleScreen.js (React Native Component)
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';

// This is a mock function. In the real app, this would fetch data from your state management (Context, Redux, etc.)
const getCurrentPlayerStats = () => ({
  health: 85,
  strength: 70,
  stamina: 80,
  evolutionStage: 2,
  // Add any other stats the game needs
});

const BattleScreen = ({ navigation, route }) => {
  const { bossId } = route.params; // Get the selected boss from navigation
  const webviewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webviewError, setWebviewError] = useState(null);

  // Prepare the data to be sent to the game
  const initialGameData = {
    playerStats: getCurrentPlayerStats(),
    bossId: bossId,
    // This is where you would pass asset paths based on the Asset Requirement List
    assets: {
        playerSprite: `Player_Evo_${getCurrentPlayerStats().evolutionStage}.png`,
        bossSprite: `Boss_${bossId}.png`,
        background: `BG_Battle_${bossId}.png`
    }
  };

  // This function is injected into the WebView and called to start the game.
  // It passes all necessary initial data as a single JSON object.
  const injectedJavaScript = `
    (function() {
      // The 'true' argument is for React Native's postMessage compatibility
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STATUS', message: 'WebView Loaded' }));
      
      // Define a function on the window that the game will wait for
      window.initializeBattle = function() {
        // Post a message with the initial game data
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'INITIALIZE_GAME',
          payload: ${JSON.stringify(initialGameData)}
        }));
      };
      
      // Call the function to signal that the bridge is ready
      window.initializeBattle();
    })();
    true; // Must end with true
  `;

  // This handler listens for messages coming FROM the Phaser game
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Handle different message types from the game
      switch (data.type) {
        case 'GAME_LOADED':
          console.log('Phaser game has finished loading assets.');
          setIsLoading(false);
          break;
        case 'BATTLE_COMPLETE':
          console.log('Battle complete. Result:', data.payload);
          // --- HANDLE BATTLE RESULT ---
          // 1. Update player stats based on the result
          // 2. Grant XP and rewards
          // 3. Navigate back to the Home screen or a results screen
          navigation.navigate('Home', { battleResult: data.payload });
          break;
        case 'ERROR':
            console.error('Error from WebView:', data.message);
            setWebviewError(data.message);
            break;
        default:
            // For debugging purposes
            console.log('Message from WebView:', data);
      }
    } catch (error) {
      console.error('Failed to parse message from WebView:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        style={styles.webview}
        originWhitelist={['*']}
        // In production, you would bundle the web app and load it locally
        // For development, you can point to the webpack dev server
        source={{ uri: 'http://localhost:8080' }} // DEV ONLY
        // source={{ uri: 'file:///android_asset/phaser/index.html' }} // ANDROID PROD
        // source={{ uri: './assets/phaser/index.html' }} // IOS PROD
        javaScriptEnabled={true}
        onMessage={onMessage}
        injectedJavaScript={injectedJavaScript}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => {
            // Note: We set loading to false only after the game confirms it's ready via postMessage
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
          setWebviewError(nativeEvent.description);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>LOADING BATTLE...</Text>
        </View>
      )}
      {webviewError && (
        <View style={styles.loadingOverlay}>
            <Text style={styles.errorText}>An Error Occurred</Text>
            <Text style={styles.errorText}>{webviewError}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, color: '#FFF', fontSize: 16 },
  errorText: { color: '#F00', fontSize: 16, textAlign: 'center', margin: 10 }
});

export default BattleScreen;


//==============================================================================
//
//  PART 2: PHASER 3 GAME CODE (TYPESCRIPT)
//
//  This is the structure for the Phaser 3 fighting game. It's designed to be
//  self-contained and communicate with the React Native host app.
//
//==============================================================================

// phaser-game/src/main.ts
import Phaser from 'phaser';
import PreloaderScene from './scenes/PreloaderScene';
import BattleScene from './scenes/BattleScene';
import UIScene from './scenes/UIScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: process.env.NODE_ENV === 'development', // Show physics bodies in dev
    },
  },
  scene: [PreloaderScene, BattleScene, UIScene],
};

export default new Phaser.Game(config);


// phaser-game/src/scenes/PreloaderScene.ts
import Phaser from 'phaser';

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('PreloaderScene');
  }

  preload() {
    // Display a loading bar
    const { width, height } = this.cameras.main;
    const loadingBar = this.add.graphics();
    const progressBar = this.add.graphics();
    loadingBar.fillStyle(0x306230, 1);
    loadingBar.fillRect(width / 4, height / 2 - 15, width / 2, 30);
    this.load.on('progress', (value) => {
        progressBar.clear();
        progressBar.fillStyle(0x8BAC0F, 1);
        progressBar.fillRect(width / 4, height / 2 - 15, (width / 2) * value, 30);
    });

    // Load all assets defined in the Asset Requirement List
    // This is where you would load all spritesheets, audio, and images.
    // Example:
    // this.load.spritesheet('player_evo_1', 'assets/sprites/Player_Evo_1.png', { frameWidth: 64, frameHeight: 96 });
    // this.load.image('bg_training_room', 'assets/backgrounds/BG_Battle_TrainingRoom.png');
    // this.load.audio('sfx_hit_heavy', 'assets/audio/SFX_Hit_Heavy.wav');
  }

  create() {
    // Listen for the initialization message from React Native
    window.addEventListener('message', (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'INITIALIZE_GAME') {
                console.log('Received game data:', message.payload);
                // Assets are loaded, now start the game with the received data
                this.scene.start('BattleScene', message.payload);
                this.scene.start('UIScene', message.payload);
            }
        } catch (e) {
            // Not a JSON message, ignore
        }
    });

    // Inform React Native that the Phaser app is loaded and ready for data
    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GAME_LOADED' }));
    }
  }
}

// phaser-game/src/scenes/BattleScene.ts
import Phaser from 'phaser';

export default class BattleScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite;
  private boss: Phaser.Physics.Arcade.Sprite;
  private playerStats: any;
  private bossId: string;

  constructor() {
    super('BattleScene');
  }

  init(data) {
    // Receive player stats and boss info from PreloaderScene
    this.playerStats = data.playerStats;
    this.bossId = data.bossId;
  }

  create() {
    // Set up the background
    // this.add.image(400, 300, `bg_${this.bossId}`);

    // Set up player and boss sprites
    this.player = this.physics.add.sprite(200, 450, `player_evo_${this.playerStats.evolutionStage}`);
    this.boss = this.physics.add.sprite(600, 450, `boss_${this.bossId}`);

    // Configure physics
    this.player.setCollideWorldBounds(true);
    this.boss.setCollideWorldBounds(true);

    // --- GAME LOGIC IMPLEMENTATION ---
    // 1. Create all animations from the Asset Requirement List
    // 2. Implement player input handling (from UIScene)
    // 3. Implement boss AI
    // 4. Implement collision detection between players and attacks
    // 5. Manage health, stamina, and game state (win/loss)

    // Example of ending the battle and sending the result
    // This would be called when a player's health reaches 0
    // setTimeout(() => {
    //   this.endBattle({ result: 'win', xpEarned: 150 });
    // }, 10000); // End battle after 10 seconds for demo
  }

  update() {
    // Main game loop
    // Handle player movement, AI updates, etc.
  }

  endBattle(result) {
    if (window.ReactNativeWebView) {
      console.log('Sending battle result to React Native:', result);
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'BATTLE_COMPLETE', payload: result })
      );
    } else {
      console.log('Battle ended (not in WebView):', result);
    }
  }
}

// phaser-game/src/scenes/UIScene.ts
import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
    }

    create(data) {
        // --- UI IMPLEMENTATION ---
        // 1. Create Health and Stamina bars based on initial stats
        // 2. Create on-screen controls (D-Pad, Action Buttons)
        // 3. Add pointer event listeners to the controls
        // 4. When a control is pressed, emit an event that the BattleScene can listen to.
        //    Example: this.events.emit('dpad_left_down');
    }
}


//==============================================================================
//
//  PART 3: PROJECT SETUP & BUNDLING
//
//  Instructions for setting up the Phaser 3 project and bundling it for
//  use in React Native.
//
//==============================================================================

/*
1.  **Create the Phaser Project:**
    - Inside your React Native project root, create a new directory: `phaser-game`.
    - `cd phaser-game`
    - `npm init -y`
    - `npm install phaser typescript webpack webpack-cli ts-loader webpack-dev-server html-webpack-plugin`

2.  **Configure TypeScript (`tsconfig.json`):**
    - Create a `tsconfig.json` file in `phaser-game` with standard settings for web projects.

3.  **Configure Webpack (`webpack.config.js`):**
    - Create a `webpack.config.js` file. Its purpose is to compile your TypeScript code and bundle everything into single files that the WebView can load.
    - It should be configured to:
        - Use `ts-loader` for `.ts` files.
        - Define an entry point (`./src/main.ts`).
        - Define an output path (e.g., `../assets/phaser/`). This places the final build into your React Native assets.
        - Use `HtmlWebpackPlugin` to generate an `index.html` file automatically.

4.  **Create an `index.html` Template:**
    - In `phaser-game/src`, create a simple `index.html` file with a `<div>` for the game:
      `<div id="phaser-game"></div>`

5.  **Add Build Scripts to `package.json`:**
    - `"dev": "webpack serve"` (for live development)
    - `"build": "webpack --mode production"` (to create the final production build)

6.  **Development Workflow:**
    - Run `npm run dev` in the `phaser-game` directory. This starts a web server (e.g., at `localhost:8080`).
    - Point your React Native `WebView` `source` to this local URL.
    - Now you have hot-reloading for both the React Native app and the Phaser game.

7.  **Production Build:**
    - Run `npm run build`. This will place the optimized, bundled `game.bundle.js` and `index.html` into the `assets/phaser` directory of your React Native project.
    - Change the `WebView` `source` prop to point to these local files before creating a release build of your mobile app.
*/

