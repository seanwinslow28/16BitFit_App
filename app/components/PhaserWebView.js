/**
 * PhaserWebView Component
 * Simplified WebView for Phaser game integration
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PhaserWebView = ({
  playerStats,
  boss,
  onGameReady,
  onBattleEnd,
  onUpdateStats,
}) => {
  const webViewRef = useRef(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the HTML file with assets
    loadGameHTML();
  }, []);

  const loadGameHTML = async () => {
    try {
      // Load and convert assets to base64 for WebView
      const assetMap = await loadGameAssets();
      
      // For now, we'll use inline HTML with embedded assets
      // In production, you'd load this from a bundled HTML file
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
      touch-action: none;
    }
    #game-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .control-button {
      position: absolute;
      background: rgba(146, 204, 65, 0.8);
      border: 3px solid #0D0D0D;
      border-radius: 8px;
      color: #0D0D0D;
      font-family: monospace;
      font-weight: bold;
      text-align: center;
      user-select: none;
      -webkit-user-select: none;
      cursor: pointer;
    }
    .control-button:active {
      background: rgba(247, 213, 29, 0.9);
      transform: scale(0.95);
    }
    .dpad-left { bottom: 100px; left: 20px; width: 50px; height: 50px; }
    .dpad-right { bottom: 100px; left: 130px; width: 50px; height: 50px; }
    .dpad-up { bottom: 160px; left: 75px; width: 50px; height: 50px; }
    .button-punch { bottom: 160px; right: 75px; width: 55px; height: 55px; }
    .button-kick { bottom: 100px; right: 75px; width: 55px; height: 55px; }
    .button-block { bottom: 160px; right: 140px; width: 55px; height: 55px; }
    .button-special { bottom: 40px; left: 50%; transform: translateX(-50%); width: 150px; height: 40px; background: rgba(52, 152, 219, 0.8); }
  </style>
</head>
<body>
  <div id="game-container"></div>
  
  <!-- Control buttons -->
  <div class="control-button dpad-left" ontouchstart="handleControl('moveLeft')" ontouchend="handleControl('stopMove')">←</div>
  <div class="control-button dpad-right" ontouchstart="handleControl('moveRight')" ontouchend="handleControl('stopMove')">→</div>
  <div class="control-button dpad-up" ontouchstart="handleControl('jump')">↑</div>
  <div class="control-button button-punch" ontouchstart="handleControl('punch')">PUNCH</div>
  <div class="control-button button-kick" ontouchstart="handleControl('kick')">KICK</div>
  <div class="control-button button-block" ontouchstart="handleControl('block')" ontouchend="handleControl('stopBlock')">BLOCK</div>
  <div class="control-button button-special" ontouchstart="handleControl('special')">SPECIAL</div>

  <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
  <script>
    // Game state
    let game = null;
    let player = null;
    let boss = null;
    let playerHP = 100;
    let bossHP = 100;
    let specialMeter = 0;
    
    // Player stats from React Native
    const playerStats = ${JSON.stringify(playerStats || {})};
    const bossData = ${JSON.stringify(boss || { id: 'sloth_demon', name: 'SLOTH DEMON', health: 100, attackPower: 15 })};
    
    // Assets passed from React Native
    window.assetMap = ${JSON.stringify(assetMap)};
    window.isReactNative = true;
    
    // Note: In production, you would import actual game modules here
    // For WebView, we're using a simplified battle scene
    
    // Simple battle scene (fallback for WebView)
    class SimpleBattleScene extends Phaser.Scene {
      constructor() {
        super({ key: 'SimpleBattleScene' });
      }
      
      preload() {
        // Assets are loaded as base64 data URIs
        const assets = ${JSON.stringify(assetMap)};
        
        // Load sprite sheets from base64
        if (assets['sean_fighter']) {
          this.load.spritesheet('sean_fighter', assets['sean_fighter'], {
            frameWidth: 64,
            frameHeight: 64,
          });
        }
        
        // Map boss types to sprites
        const bossSprites = {
          'sloth_demon': 'gym_bully',
          'junk_food_monster': 'fit_cat',
          'procrastination_phantom': 'buff_mage',
          'stress_titan': 'rookie_ryu',
        };
        
        const bossSprite = bossSprites[bossData.id] || 'rookie_ryu';
        if (assets[bossSprite]) {
          this.load.spritesheet(bossSprite, assets[bossSprite], {
            frameWidth: 64,
            frameHeight: 64,
          });
        }
        
        // Load backgrounds from base64
        if (assets['dojo_bg']) this.load.image('dojo_bg', assets['dojo_bg']);
        if (assets['warehouse_bg']) this.load.image('warehouse_bg', assets['warehouse_bg']);
        if (assets['main_bg']) this.load.image('main_bg', assets['main_bg']);
        
        // Handle load errors
        this.load.on('loaderror', (file) => {
          console.warn('Failed to load:', file.key);
          // Log more details
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'error', 
            data: { message: 'Asset load failed: ' + file.key, file: file } 
          }));
          // Create placeholder
          this.createPlaceholder(file.key);
        });
        
        // Log assets status
        console.log('Assets available:', Object.keys(assets));
        window.ReactNativeWebView.postMessage(JSON.stringify({ 
          type: 'debug', 
          data: { message: 'Assets loaded', keys: Object.keys(assets) } 
        }));
      }
      
      createPlaceholder(key) {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0x92CC41, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture(key, 64, 64);
        graphics.destroy();
      }
      
      create() {
        const { width, height } = this.cameras.main;
        
        // Background
        const backgrounds = {
          'sloth_demon': 'warehouse_bg',
          'junk_food_monster': 'dojo_bg',
          'procrastination_phantom': 'main_bg',
          'stress_titan': 'warehouse_bg',
        };
        
        const bgKey = backgrounds[bossData.id] || 'main_bg';
        if (this.textures.exists(bgKey)) {
          const bg = this.add.image(width / 2, height / 2, bgKey);
          const scaleX = width / bg.width;
          const scaleY = height / bg.height;
          const scale = Math.max(scaleX, scaleY);
          bg.setScale(scale);
        } else {
          this.add.rectangle(0, 0, width, height, 0x9BBC0F).setOrigin(0, 0);
        }
        
        // Ground
        const ground = this.add.rectangle(width / 2, height - 40, width, 80, 0x708028);
        this.physics.add.existing(ground, true);
        
        // Create player sprite
        if (this.textures.exists('sean_fighter')) {
          player = this.physics.add.sprite(150, height - 120, 'sean_fighter');
          player.setFrame(0); // Idle frame
          
          // Create simple animations
          this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('sean_fighter', { frames: [0, 1, 2, 3] }),
            frameRate: 8,
            repeat: -1
          });
          
          this.anims.create({
            key: 'player_attack',
            frames: this.anims.generateFrameNumbers('sean_fighter', { frames: [10, 11] }),
            frameRate: 12,
            repeat: 0
          });
          
          player.play('player_idle');
        } else {
          player = this.physics.add.rectangle(150, height - 120, 64, 64, 0x92CC41);
        }
        
        player.setCollideWorldBounds(true);
        player.body.setGravityY(300);
        
        // Create boss sprite
        const bossSprites = {
          'sloth_demon': 'gym_bully',
          'junk_food_monster': 'fit_cat',
          'procrastination_phantom': 'buff_mage',
          'stress_titan': 'rookie_ryu',
        };
        
        const bossSprite = bossSprites[bossData.id] || 'rookie_ryu';
        
        if (this.textures.exists(bossSprite)) {
          boss = this.physics.add.sprite(width - 150, height - 120, bossSprite);
          boss.setFrame(0); // Idle frame
          boss.setFlipX(true); // Face left
          
          // Create boss animations
          this.anims.create({
            key: 'boss_idle',
            frames: this.anims.generateFrameNumbers(bossSprite, { frames: [0, 1, 2, 3] }),
            frameRate: 6,
            repeat: -1
          });
          
          boss.play('boss_idle');
        } else {
          boss = this.physics.add.rectangle(width - 150, height - 120, 64, 64, 0xff6666);
        }
        
        boss.setCollideWorldBounds(true);
        boss.body.setGravityY(300);
        
        // Collisions
        this.physics.add.collider(player, ground);
        this.physics.add.collider(boss, ground);
        
        // HUD
        this.createHUD();
        
        // Start message
        const readyText = this.add.text(width / 2, height / 2, 'READY?', {
          font: '48px monospace',
          fill: '#F7D51D',
          stroke: '#0D0D0D',
          strokeThickness: 4,
        }).setOrigin(0.5);
        
        this.time.delayedCall(1000, () => {
          readyText.setText('FIGHT!');
          readyText.setColor('#E53935');
          
          this.time.delayedCall(500, () => {
            readyText.destroy();
            this.startBossAI();
          });
        });
        
        // Send ready message
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'gameReady', 
            data: { ready: true } 
          }));
        }
      }
      
      createHUD() {
        // Player health
        this.add.text(20, 20, 'HERO', { font: '14px monospace', fill: '#92CC41' });
        this.playerHealthBar = this.add.rectangle(20, 40, 200, 20, 0x92CC41).setOrigin(0, 0.5);
        
        // Boss health
        this.add.text(this.cameras.main.width - 220, 20, bossData.name, { font: '14px monospace', fill: '#92CC41' });
        this.bossHealthBar = this.add.rectangle(this.cameras.main.width - 220, 40, 200, 20, 0xff6666).setOrigin(0, 0.5);
      }
      
      startBossAI() {
        // Simple AI - move towards player and attack
        this.time.addEvent({
          delay: 2000,
          callback: () => {
            if (boss && player && bossHP > 0) {
              // Move towards player
              if (boss.x > player.x + 100) {
                boss.body.setVelocityX(-100);
              } else if (boss.x < player.x - 100) {
                boss.body.setVelocityX(100);
              } else {
                boss.body.setVelocityX(0);
                // Attack
                this.bossAttack();
              }
            }
          },
          loop: true,
        });
      }
      
      bossAttack() {
        // Flash boss to indicate attack
        if (boss.setFillStyle) {
          boss.setFillStyle(0xffff00);
          this.time.delayedCall(200, () => {
            boss.setFillStyle(0xff6666);
          });
        }
        
        // Check if player is in range
        if (Math.abs(boss.x - player.x) < 100) {
          this.damagePlayer(bossData.attackPower);
        }
      }
      
      playerAttack(type) {
        if (!player) return;
        
        // Flash player or play animation
        if (player.anims) {
          player.play('player_attack');
          player.once('animationcomplete', () => {
            player.play('player_idle');
          });
        } else {
          player.setFillStyle(0xFFFF00);
          this.time.delayedCall(200, () => {
            player.setFillStyle(0x92CC41);
          });
        }
        
        // Check if boss is in range
        if (Math.abs(player.x - boss.x) < 100) {
          const damage = type === 'special' ? 30 : (type === 'kick' ? 15 : 10);
          this.damageBoss(damage);
        }
      }
      
      damagePlayer(amount) {
        playerHP = Math.max(0, playerHP - amount);
        this.updateHealthBars();
        
        if (playerHP <= 0) {
          this.endBattle(false);
        }
      }
      
      damageBoss(amount) {
        bossHP = Math.max(0, bossHP - amount);
        specialMeter = Math.min(100, specialMeter + 15);
        this.updateHealthBars();
        
        if (bossHP <= 0) {
          this.endBattle(true);
        }
      }
      
      updateHealthBars() {
        this.playerHealthBar.setScale(playerHP / 100, 1);
        this.bossHealthBar.setScale(bossHP / bossData.health, 1);
        
        // Update special meter
        const specialButton = document.querySelector('.button-special');
        if (specialMeter >= 100) {
          specialButton.style.background = 'rgba(0, 255, 0, 0.9)';
        } else {
          specialButton.style.background = 'rgba(52, 152, 219, 0.8)';
        }
      }
      
      endBattle(victory) {
        const resultText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          victory ? 'VICTORY!' : 'DEFEAT...',
          {
            font: '48px monospace',
            fill: victory ? '#92CC41' : '#E53935',
            stroke: '#0D0D0D',
            strokeThickness: 6,
          }
        ).setOrigin(0.5);
        
        // Send result to React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: 'battleEnd', 
            data: { 
              victory,
              score: victory ? Math.floor(playerHP * 10) : 0,
            } 
          }));
        }
      }
    }
    
    // Control handler
    function handleControl(action) {
      if (!game || !player) return;
      
      const scene = game.scene.getScene('SimpleBattleScene');
      
      switch (action) {
        case 'moveLeft':
          player.body.setVelocityX(-200);
          break;
        case 'moveRight':
          player.body.setVelocityX(200);
          break;
        case 'stopMove':
          player.body.setVelocityX(0);
          break;
        case 'jump':
          if (player.body.onFloor()) {
            player.body.setVelocityY(-400);
          }
          break;
        case 'punch':
          scene.playerAttack('punch');
          break;
        case 'kick':
          scene.playerAttack('kick');
          break;
        case 'special':
          if (specialMeter >= 100) {
            scene.playerAttack('special');
            specialMeter = 0;
          }
          break;
      }
    }
    
    // Initialize game
    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: window.innerWidth,
      height: window.innerHeight * 0.6,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 800 },
          debug: false,
        },
      },
      scene: SimpleBattleScene,
    };
    
    game = new Phaser.Game(config);
  </script>
</body>
</html>
      `;
      
      setHtmlContent(html);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading game HTML:', error);
      setIsLoading(false);
    }
  };

  const loadGameAssets = async () => {
    const assetMap = {};
    
    try {
      // Define assets to load
      const assetsToLoad = [
        { key: 'sean_fighter', path: require('../assets/Sprites/Boss Battle Sprite Sheets/Sean_Fighter-Sprite-Sheet.png') },
        { key: 'gym_bully', path: require('../assets/Sprites/Boss Battle Sprite Sheets/Gym_Bully-Sprite-Sheet.png') },
        { key: 'fit_cat', path: require('../assets/Sprites/Boss Battle Sprite Sheets/Fit_Cat-Sprite-Sheet.png') },
        { key: 'buff_mage', path: require('../assets/Sprites/Boss Battle Sprite Sheets/Buff_Mage-Sprite-Sheet.png') },
        { key: 'rookie_ryu', path: require('../assets/Sprites/Boss Battle Sprite Sheets/Rookie_Ryu-Sprite-Sheet.png') },
        { key: 'dojo_bg', path: require('../assets/Backgrounds/Tranquil_Dojo_Backround.png') },
        { key: 'warehouse_bg', path: require('../assets/Backgrounds/Industrial_Warehouse_at_Dusk.png') },
        { key: 'main_bg', path: require('../assets/Backgrounds/Main_Background.png') },
        { key: 'background_dojo', path: require('../assets/Backgrounds/Tranquil_Dojo_Backround.png') },
        { key: 'background_warehouse', path: require('../assets/Backgrounds/Industrial_Warehouse_at_Dusk.png') },
        { key: 'background_main', path: require('../assets/Backgrounds/Main_Background.png') },
      ];
      
      // Load assets and convert to base64
      console.log('Loading assets for WebView...');
      for (const asset of assetsToLoad) {
        try {
          // Download asset to cache
          const downloadedAsset = await Asset.fromModule(asset.path).downloadAsync();
          
          if (downloadedAsset && downloadedAsset.localUri) {
            // Read as base64
            const base64 = await FileSystem.readAsStringAsync(downloadedAsset.localUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Store as data URI
            const mimeType = asset.path.toString().endsWith('.png') ? 'image/png' : 'image/jpeg';
            assetMap[asset.key] = `data:${mimeType};base64,${base64}`;
            console.log(`Loaded asset: ${asset.key}`);
          } else {
            console.warn(`Asset ${asset.key} has no local URI`);
          }
        } catch (error) {
          console.warn(`Failed to load asset ${asset.key}:`, error);
          // Create a simple placeholder for failed assets
          assetMap[asset.key] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        }
      }
      console.log(`Total assets loaded: ${Object.keys(assetMap).length} of ${assetsToLoad.length}`);
    } catch (error) {
      console.error('Asset loading error:', error);
    }
    
    return assetMap;
  };

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'gameReady':
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
        case 'debug':
          console.log('Game debug:', message.data);
          break;
      }
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#92CC41" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default PhaserWebView;