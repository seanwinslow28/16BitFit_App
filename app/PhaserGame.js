/**
 * 16BitFit Phaser 3 Game Component
 * Retro-style mini-games for the fitness app
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Phaser from 'phaser';

const PhaserGame = ({ gameType = 'battle', playerStats, onGameComplete }) => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Initialize Phaser game only on web platform
      const config = {
        type: Phaser.AUTO,
        width: 280,
        height: 200,
        parent: gameRef.current,
        backgroundColor: '#9BBD3F', // GameBoy green
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 300 },
            debug: false
          }
        },
        scene: createGameScene(gameType, playerStats, onGameComplete),
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      phaserGameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [gameType, playerStats]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.webOnlyMessage}>
        <Text style={styles.messageText}>🎮</Text>
        <Text style={styles.messageText}>Games available on web platform</Text>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <div ref={gameRef} style={styles.phaserContainer} />
    </View>
  );
};

// Create game scene based on type
const createGameScene = (gameType, playerStats, onGameComplete) => {
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameScene' });
    }

    preload() {
      // Create simple colored rectangles as sprites (no external assets needed)
      this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      
      // Create pixel art sprites programmatically
      this.createPixelSprites();
    }

    createPixelSprites() {
      // Create player sprite (green square)
      const playerGraphics = this.add.graphics();
      playerGraphics.fillStyle(0x00FF00);
      playerGraphics.fillRect(0, 0, 16, 16);
      playerGraphics.generateTexture('player', 16, 16);
      playerGraphics.destroy();

      // Create enemy sprite (red square)
      const enemyGraphics = this.add.graphics();
      enemyGraphics.fillStyle(0xFF0000);
      enemyGraphics.fillRect(0, 0, 16, 16);
      enemyGraphics.generateTexture('enemy', 16, 16);
      enemyGraphics.destroy();

      // Create collectible sprite (yellow circle)
      const collectibleGraphics = this.add.graphics();
      collectibleGraphics.fillStyle(0xFFFF00);
      collectibleGraphics.fillCircle(8, 8, 8);
      collectibleGraphics.generateTexture('collectible', 16, 16);
      collectibleGraphics.destroy();
    }

    create() {
      // Add retro-style text
      this.add.text(10, 10, '16BitFit Battle!', {
        fontSize: '12px',
        fill: '#000',
        fontFamily: 'monospace'
      });

      // Create player
      this.player = this.physics.add.sprite(50, 150, 'player');
      this.player.setCollideWorldBounds(true);

      // Create enemies group
      this.enemies = this.physics.add.group();
      
      // Create collectibles group
      this.collectibles = this.physics.add.group();

      // Add initial enemies and collectibles
      this.spawnEnemies();
      this.spawnCollectibles();

      // Input handling
      this.cursors = this.input.keyboard.createCursorKeys();

      // Game variables
      this.score = 0;
      this.gameTime = 30; // 30 second game
      this.isGameOver = false;

      // UI
      this.scoreText = this.add.text(10, 30, `Score: ${this.score}`, {
        fontSize: '10px',
        fill: '#000',
        fontFamily: 'monospace'
      });

      this.timeText = this.add.text(10, 45, `Time: ${this.gameTime}`, {
        fontSize: '10px',
        fill: '#000',
        fontFamily: 'monospace'
      });

      // Timer
      this.gameTimer = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      });

      // Collisions
      this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);
      this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);

      // Spawn new items periodically
      this.spawnTimer = this.time.addEvent({
        delay: 2000,
        callback: this.spawnItems,
        callbackScope: this,
        loop: true
      });
    }

    update() {
      if (this.isGameOver) return;

      // Player movement
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
      }
    }

    spawnEnemies() {
      for (let i = 0; i < 3; i++) {
        const x = Phaser.Math.Between(100, 250);
        const y = Phaser.Math.Between(50, 100);
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(Phaser.Math.Between(-100, 100), 0);
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
      }
    }

    spawnCollectibles() {
      for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(50, 250);
        const y = Phaser.Math.Between(50, 150);
        const collectible = this.collectibles.create(x, y, 'collectible');
        collectible.setBounce(0.2);
        collectible.setCollideWorldBounds(true);
      }
    }

    spawnItems() {
      if (this.isGameOver) return;

      // Spawn random collectible
      if (Math.random() < 0.7) {
        const x = Phaser.Math.Between(50, 250);
        const y = 50;
        const collectible = this.collectibles.create(x, y, 'collectible');
        collectible.setBounce(0.2);
        collectible.setCollideWorldBounds(true);
      }

      // Spawn random enemy
      if (Math.random() < 0.5) {
        const x = Phaser.Math.Between(100, 250);
        const y = 50;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(Phaser.Math.Between(-100, 100), 0);
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
      }
    }

    collectItem(player, collectible) {
      collectible.destroy();
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
    }

    hitEnemy(player, enemy) {
      this.score = Math.max(0, this.score - 5);
      this.scoreText.setText(`Score: ${this.score}`);
      
      // Flash player red
      this.player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        this.player.clearTint();
      });
    }

    updateTimer() {
      this.gameTime--;
      this.timeText.setText(`Time: ${this.gameTime}`);

      if (this.gameTime <= 0) {
        this.endGame();
      }
    }

    endGame() {
      this.isGameOver = true;
      this.gameTimer.remove();
      this.spawnTimer.remove();

      // Stop all physics
      this.physics.pause();

      // Show game over screen
      this.add.rectangle(140, 100, 280, 200, 0x000000, 0.7);
      this.add.text(140, 80, 'GAME OVER!', {
        fontSize: '16px',
        fill: '#fff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      this.add.text(140, 100, `Final Score: ${this.score}`, {
        fontSize: '12px',
        fill: '#fff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      this.add.text(140, 120, 'Press SPACE to continue', {
        fontSize: '10px',
        fill: '#fff',
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      // Continue on spacebar
      this.input.keyboard.once('keydown-SPACE', () => {
        if (onGameComplete) {
          onGameComplete({
            score: this.score,
            xpEarned: Math.floor(this.score / 10),
            statsBoost: this.score > 50 ? 2 : 1
          });
        }
      });
    }
  }

  return GameScene;
};

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9BBD3F',
    borderRadius: 8,
    padding: 10,
  },
  phaserContainer: {
    width: '100%',
    height: '100%',
  },
  webOnlyMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9BBD3F',
    borderRadius: 8,
    padding: 20,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
});

export default PhaserGame; 