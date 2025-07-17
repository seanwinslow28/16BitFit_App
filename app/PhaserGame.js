/**
 * 16BitFit Phaser 3 Game Component
 * Retro-style mini-games for the fitness app
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

const PhaserGame = ({ gameType = 'battle', playerStats, onGameComplete }) => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Dynamically import Phaser only on web platform
      import('phaser').then((Phaser) => {
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
          scene: createGameScene(gameType, playerStats, onGameComplete, Phaser),
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
          }
        };

        phaserGameRef.current = new Phaser.Game(config);
      });
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
      <View ref={gameRef} style={styles.phaserContainer} />
    </View>
  );
};

// Create game scene based on type
const createGameScene = (gameType, playerStats, onGameComplete, Phaser) => {
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameScene' });
    }

    preload() {
      // Load your custom sprite sheet with proper Expo asset handling
      this.load.spritesheet('hero', './assets/Sprites/16BitFit_Sprite_Sheet.png', {
        frameWidth: 512,
        frameHeight: 512,
      });
      
      // Handle load errors and create fallback
      this.load.on('filefailed', (key) => {
        if (key === 'hero') {
          console.warn('Sprite sheet failed to load, will use fallback');
          this.spriteSheetFailed = true;
        }
      });
      
      // Create other sprites programmatically
      this.createPixelSprites();
    }

    createPixelSprites() {
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

    createFallbackSprite() {
      // Create a simple fallback hero sprite if the main sprite sheet fails
      const heroGraphics = this.add.graphics();
      heroGraphics.fillStyle(0x00FF00);
      heroGraphics.fillRect(0, 0, 32, 32);
      heroGraphics.generateTexture('hero', 32, 32);
      heroGraphics.destroy();
    }

    createHeroAnimations() {
      // Create animations based on your sprite sheet layout
      // 2x3 grid: Idle, Flex, Tired, Pointing, Drinking, Overweight/Sad
      
      if (this.spriteSheetFailed) {
        // For fallback sprite, all animations use frame 0
        ['idle', 'flex', 'tired', 'point', 'drink', 'sad'].forEach(key => {
          this.anims.create({
            key: key,
            frames: [{ key: 'hero', frame: 0 }],
            frameRate: 1,
          });
        });
      } else {
        // Frame 0: Idle
        this.anims.create({
          key: 'idle',
          frames: [{ key: 'hero', frame: 0 }],
          frameRate: 1,
        });

        // Frame 1: Flex (for victories/strength)
        this.anims.create({
          key: 'flex',
          frames: [{ key: 'hero', frame: 1 }],
          frameRate: 1,
        });

        // Frame 2: Tired (for when hit by enemies)
        this.anims.create({
          key: 'tired',
          frames: [{ key: 'hero', frame: 2 }],
          frameRate: 1,
        });

        // Frame 3: Pointing (for movement/direction)
        this.anims.create({
          key: 'point',
          frames: [{ key: 'hero', frame: 3 }],
          frameRate: 1,
        });

        // Frame 4: Drinking (for collecting items)
        this.anims.create({
          key: 'drink',
          frames: [{ key: 'hero', frame: 4 }],
          frameRate: 1,
        });

        // Frame 5: Overweight/Sad (for game over)
        this.anims.create({
          key: 'sad',
          frames: [{ key: 'hero', frame: 5 }],
          frameRate: 1,
        });
      }

      // Start with idle animation
      this.player.anims.play('idle', true);
    }

    create() {
      // Add retro-style text
      this.add.text(10, 10, '16BitFit Battle!', {
        fontSize: '12px',
        fill: '#000',
        fontFamily: 'monospace'
      });

      // Add power-up indicator
      this.add.text(10, 60, 'Collect coins for power!', {
        fontSize: '8px',
        fill: '#000',
        fontFamily: 'monospace'
      });

      // Add animation controls instructions
      this.add.text(10, 75, 'Press 1-5 to test animations:', {
        fontSize: '7px',
        fill: '#000',
        fontFamily: 'monospace'
      });
      this.add.text(10, 85, '1=Flex 2=Tired 3=Point 4=Drink 5=Sad', {
        fontSize: '6px',
        fill: '#000',
        fontFamily: 'monospace'
      });

      // Create hero player - check if sprite sheet loaded
      if (this.spriteSheetFailed || !this.textures.exists('hero')) {
        // Sprite sheet failed to load, create fallback
        this.createFallbackSprite();
        console.warn('Using fallback sprite - sprite sheet not found');
      }
      
      this.player = this.physics.add.sprite(50, 150, 'hero', 0);
      this.player.setCollideWorldBounds(true);
      
      // Scale based on sprite type
      if (!this.spriteSheetFailed && this.textures.exists('hero')) {
        // If sprite sheet loaded successfully, scale it down
        this.player.setScale(0.06); // Scale down 512x512 to ~30x30 pixels
      } else {
        // If using fallback sprite, use normal scale
        this.player.setScale(1);
      }
      
      // Create hero animations
      this.createHeroAnimations();

      // Create enemies group
      this.enemies = this.physics.add.group();
      
      // Create collectibles group
      this.collectibles = this.physics.add.group();

      // Add initial enemies and collectibles
      this.spawnEnemies();
      this.spawnCollectibles();

      // Input handling
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys({
        flex: Phaser.Input.Keyboard.KeyCodes.ONE,
        tired: Phaser.Input.Keyboard.KeyCodes.TWO,
        point: Phaser.Input.Keyboard.KeyCodes.THREE,
        drink: Phaser.Input.Keyboard.KeyCodes.FOUR,
        sad: Phaser.Input.Keyboard.KeyCodes.FIVE
      });

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

      // Manual animation controls (1-5 keys)
      if (Phaser.Input.Keyboard.JustDown(this.keys.flex)) {
        this.player.anims.play('flex');
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.tired)) {
        this.player.anims.play('tired');
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.point)) {
        this.player.anims.play('point');
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.drink)) {
        this.player.anims.play('drink');
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.sad)) {
        this.player.anims.play('sad');
      }

      // Player movement with fitness-themed animations
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
        this.player.setFlipX(true); // Flip sprite when moving left
        if (this.player.body.touching.down) {
          this.player.anims.play('point', true); // Pointing while moving
        }
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
        this.player.setFlipX(false); // Normal direction when moving right
        if (this.player.body.touching.down) {
          this.player.anims.play('point', true); // Pointing while moving
        }
      } else {
        this.player.setVelocityX(0);
        if (this.player.body.touching.down) {
          this.player.anims.play('idle', true); // Idle when standing
        }
      }

      // Jump - use flex animation to show strength
      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
        this.player.anims.play('flex', true); // Flex when jumping (showing strength)
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
      
      // Show drinking animation when collecting (nutrition/hydration)
      this.player.anims.play('drink', true);
      this.time.delayedCall(500, () => {
        if (!this.isGameOver) {
          this.player.anims.play('idle', true);
        }
      });
    }

    hitEnemy(player, enemy) {
      this.score = Math.max(0, this.score - 5);
      this.scoreText.setText(`Score: ${this.score}`);
      
      // Show tired animation when hit (fitness exhaustion)
      this.player.anims.play('tired', true);
      this.player.setTint(0xff0000);
      
      this.time.delayedCall(800, () => {
        this.player.clearTint();
        if (!this.isGameOver) {
          this.player.anims.play('idle', true);
        }
      });
      
      // Small knockback effect
      if (player.x < enemy.x) {
        player.setVelocityX(-100);
      } else {
        player.setVelocityX(100);
      }
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

      // Show appropriate ending animation based on score
      if (this.score >= 50) {
        this.player.anims.play('flex', true); // Victory pose for good score
      } else {
        this.player.anims.play('sad', true); // Sad pose for low score
      }

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