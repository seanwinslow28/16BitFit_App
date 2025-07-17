/**
 * Phaser Battle Game Component
 * 2D Fighting game implementation with Street Fighter/Mortal Kombat mechanics
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const PhaserBattleGame = ({ 
  playerStats, 
  boss, 
  onBattleEnd, 
  onUpdateStats 
}) => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Dynamically import Phaser only on web platform
      import('phaser').then((Phaser) => {
        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 400,
          parent: gameRef.current,
          backgroundColor: '#9BBC0F',
          physics: {
            default: 'matter',
            matter: {
              gravity: { y: 1 },
              debug: false
            }
          },
          scene: createBattleScene(playerStats, boss, onBattleEnd, onUpdateStats, Phaser),
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
  }, [playerStats, boss]);

  return (
    <View style={styles.gameContainer}>
      <View ref={gameRef} style={styles.phaserContainer} />
    </View>
  );
};

// Create the battle scene
const createBattleScene = (playerStats, boss, onBattleEnd, onUpdateStats, Phaser) => {
  class BattleScene extends Phaser.Scene {
    constructor() {
      super({ key: 'BattleScene' });
      
      // Battle state
      this.playerHP = 100 + (playerStats.health || 0);
      this.playerMaxHP = this.playerHP;
      this.bossHP = boss.hp;
      this.bossMaxHP = boss.hp;
      this.comboCount = 0;
      this.specialMeter = 0;
      this.battleActive = true;
      
      // Combat state
      this.playerState = 'idle'; // idle, attacking, blocking, hurt, special
      this.bossState = 'idle';
      this.playerCanAct = true;
      this.bossCanAct = true;
      
      // Timers
      this.roundTime = 99; // 99 seconds
      this.lastComboTime = 0;
    }

    preload() {
      // Create placeholder sprites programmatically
      this.createBattleSprites();
    }

    createBattleSprites() {
      // Create player sprite (green fighter)
      const playerGraphics = this.add.graphics();
      playerGraphics.fillStyle(0x92CC41); // GameBoy green
      playerGraphics.fillRect(0, 0, 64, 96);
      playerGraphics.generateTexture('player', 64, 96);
      playerGraphics.destroy();

      // Create boss sprite (red enemy)
      const bossGraphics = this.add.graphics();
      bossGraphics.fillStyle(0xE53935);
      bossGraphics.fillRect(0, 0, 80, 120);
      bossGraphics.generateTexture('boss', 80, 120);
      bossGraphics.destroy();

      // Create effect sprites
      const hitEffectGraphics = this.add.graphics();
      hitEffectGraphics.fillStyle(0xFFFF00, 0.8);
      hitEffectGraphics.fillCircle(16, 16, 16);
      hitEffectGraphics.generateTexture('hitEffect', 32, 32);
      hitEffectGraphics.destroy();

      // Create special effect
      const specialEffectGraphics = this.add.graphics();
      specialEffectGraphics.fillStyle(0x3498db);
      specialEffectGraphics.fillRect(0, 0, 200, 20);
      specialEffectGraphics.generateTexture('specialEffect', 200, 20);
      specialEffectGraphics.destroy();
    }

    create() {
      // Create fighting arena background
      this.createArena();
      
      // Create fighters
      this.createPlayer();
      this.createBoss();
      
      // Setup controls
      this.setupControls();
      
      // Create UI
      this.createBattleUI();
      
      // Start timers
      this.startBattleTimers();
      
      // Initial stats update
      this.updateBattleStats();
    }

    createArena() {
      // Arena floor
      const floorGraphics = this.add.graphics();
      floorGraphics.fillStyle(0x556B2F);
      floorGraphics.fillRect(0, 350, 800, 50);
      
      // Background elements
      this.add.text(400, 50, 'BATTLE ARENA', {
        fontSize: '32px',
        fill: '#0D0D0D',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      // Round indicator
      this.roundText = this.add.text(400, 100, 'ROUND 1', {
        fontSize: '24px',
        fill: '#F7D51D',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      // Add "FIGHT!" text that fades
      const fightText = this.add.text(400, 200, 'FIGHT!', {
        fontSize: '48px',
        fill: '#E53935',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: fightText,
        alpha: 0,
        duration: 1000,
        delay: 500,
        onComplete: () => fightText.destroy()
      });
    }

    createPlayer() {
      // Create player fighter
      this.player = this.matter.add.sprite(200, 300, 'player');
      this.player.setScale(1);
      this.player.setFixedRotation();
      
      // Set up player physics body
      const playerBody = this.matter.bodies.rectangle(200, 300, 64, 96, {
        chamfer: { radius: 10 },
        density: 0.005,
        friction: 0.1,
        frictionAir: 0.05,
        restitution: 0.3
      });
      
      this.player.setExistingBody(playerBody);
      this.player.setCollisionCategory(1);
      
      // Player properties
      this.player.setData({
        type: 'player',
        attackPower: 10 + Math.floor(playerStats.strength / 10),
        defense: 5 + Math.floor(playerStats.endurance / 20),
        speed: 5 + Math.floor(playerStats.stamina / 20)
      });
    }

    createBoss() {
      // Create boss fighter
      this.boss = this.matter.add.sprite(600, 280, 'boss');
      this.boss.setScale(1);
      this.boss.setFixedRotation();
      this.boss.setFlipX(true);
      
      // Set up boss physics body
      const bossBody = this.matter.bodies.rectangle(600, 280, 80, 120, {
        chamfer: { radius: 10 },
        density: 0.008,
        friction: 0.1,
        frictionAir: 0.05,
        restitution: 0.3
      });
      
      this.boss.setExistingBody(bossBody);
      this.boss.setCollisionCategory(2);
      
      // Boss properties
      this.boss.setData({
        type: 'boss',
        attackPower: boss.attackPower,
        defense: boss.defense,
        specialMove: boss.specialMove
      });
      
      // Start boss AI
      this.startBossAI();
    }

    setupControls() {
      // Keyboard controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys({
        punch: Phaser.Input.Keyboard.KeyCodes.Z,
        kick: Phaser.Input.Keyboard.KeyCodes.X,
        block: Phaser.Input.Keyboard.KeyCodes.C,
        special: Phaser.Input.Keyboard.KeyCodes.SPACE
      });
      
      // Touch/Click controls for mobile
      this.input.on('pointerdown', (pointer) => {
        if (!this.battleActive || !this.playerCanAct) return;
        
        // Left side = movement, right side = attacks
        if (pointer.x < 400) {
          // Move towards pointer
          const direction = pointer.x < this.player.x ? -1 : 1;
          this.movePlayer(direction);
        } else {
          // Attack based on pointer height
          if (pointer.y < 200) {
            this.playerAttack('punch');
          } else {
            this.playerAttack('kick');
          }
        }
      });
    }

    createBattleUI() {
      // Combo display (updated via main HUD)
      this.comboText = this.add.text(700, 200, '', {
        fontSize: '24px',
        fill: '#F7D51D',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      // Controls hint
      this.add.text(10, 370, 'Z: Punch | X: Kick | C: Block | Space: Special', {
        fontSize: '10px',
        fill: '#92CC41',
        fontFamily: 'monospace'
      });
    }

    startBattleTimers() {
      // Round timer
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.roundTime--;
          if (this.roundTime <= 0) {
            this.endBattle(false); // Time out = lose
          }
        },
        loop: true
      });
      
      // Stats update timer
      this.time.addEvent({
        delay: 100,
        callback: () => this.updateBattleStats(),
        loop: true
      });
    }

    startBossAI() {
      // Simple boss AI
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          if (!this.battleActive || !this.bossCanAct) return;
          
          const distance = Math.abs(this.boss.x - this.player.x);
          const action = Math.random();
          
          if (distance < 100) {
            // Close range - attack or block
            if (action < 0.6) {
              this.bossAttack();
            } else {
              this.bossBlock();
            }
          } else {
            // Move closer
            this.moveBoss();
          }
        },
        loop: true
      });
      
      // Boss special move timer
      this.time.addEvent({
        delay: 10000,
        callback: () => {
          if (this.battleActive && this.bossCanAct) {
            this.bossSpecialMove();
          }
        },
        loop: true
      });
    }

    update() {
      if (!this.battleActive) return;
      
      // Player movement
      if (this.playerCanAct) {
        if (this.cursors.left.isDown) {
          this.movePlayer(-1);
        } else if (this.cursors.right.isDown) {
          this.movePlayer(1);
        } else {
          this.player.setVelocityX(0);
        }
        
        // Jump
        if (this.cursors.up.isDown && Math.abs(this.player.body.velocity.y) < 0.1) {
          this.player.setVelocityY(-10);
        }
        
        // Attacks
        if (Phaser.Input.Keyboard.JustDown(this.keys.punch)) {
          this.playerAttack('punch');
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.kick)) {
          this.playerAttack('kick');
        } else if (this.keys.block.isDown) {
          this.playerBlock();
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.special) && this.specialMeter >= 100) {
          this.playerSpecialMove();
        }
      }
      
      // Keep fighters on ground
      this.constrainFighters();
    }

    movePlayer(direction) {
      const speed = this.player.getData('speed');
      this.player.setVelocityX(direction * speed);
      this.player.setFlipX(direction < 0);
      this.playerState = 'moving';
    }

    playerAttack(type) {
      if (!this.playerCanAct || this.playerState === 'attacking') return;
      
      this.playerState = 'attacking';
      this.playerCanAct = false;
      
      // Attack animation (color change)
      this.player.setTint(0xFFFF00);
      
      // Check hit
      const distance = Math.abs(this.boss.x - this.player.x);
      if (distance < 100) {
        const damage = this.player.getData('attackPower') * (type === 'kick' ? 1.2 : 1);
        const isCritical = Math.random() < 0.1;
        const finalDamage = isCritical ? damage * 2 : damage;
        
        if (this.bossState !== 'blocking') {
          this.hitBoss(finalDamage, isCritical);
          this.updateCombo();
        } else {
          // Blocked
          this.showBlockEffect(this.boss.x, this.boss.y);
        }
      }
      
      // Reset after attack
      this.time.delayedCall(300, () => {
        this.player.clearTint();
        this.playerState = 'idle';
        this.playerCanAct = true;
      });
    }

    playerBlock() {
      this.playerState = 'blocking';
      this.player.setTint(0x3498db);
    }

    playerSpecialMove() {
      if (!this.playerCanAct || this.specialMeter < 100) return;
      
      this.playerState = 'special';
      this.playerCanAct = false;
      this.specialMeter = 0;
      
      // Special move effect
      const effect = this.add.sprite(this.player.x, this.player.y, 'specialEffect');
      effect.setScale(1, 3);
      effect.setTint(0x3498db);
      
      // Move forward quickly
      this.tweens.add({
        targets: effect,
        x: this.boss.x,
        duration: 300,
        onComplete: () => {
          effect.destroy();
          // Hit boss with special damage
          this.hitBoss(30, true);
        }
      });
      
      this.time.delayedCall(500, () => {
        this.playerState = 'idle';
        this.playerCanAct = true;
      });
    }

    moveBoss() {
      const direction = this.player.x < this.boss.x ? -1 : 1;
      this.boss.setVelocityX(direction * 3);
      this.boss.setFlipX(direction > 0);
    }

    bossAttack() {
      if (!this.bossCanAct) return;
      
      this.bossState = 'attacking';
      this.bossCanAct = false;
      this.boss.setTint(0xFF0000);
      
      // Check hit on player
      const distance = Math.abs(this.boss.x - this.player.x);
      if (distance < 100 && this.playerState !== 'blocking') {
        this.hitPlayer(this.boss.getData('attackPower'));
      }
      
      this.time.delayedCall(400, () => {
        this.boss.clearTint();
        this.bossState = 'idle';
        this.bossCanAct = true;
      });
    }

    bossBlock() {
      this.bossState = 'blocking';
      this.boss.setTint(0x666666);
      
      this.time.delayedCall(1000, () => {
        this.boss.clearTint();
        this.bossState = 'idle';
      });
    }

    bossSpecialMove() {
      this.bossState = 'special';
      this.bossCanAct = false;
      
      // Boss special move animation
      this.boss.setTint(0x9b59b6);
      
      // Create special effect based on boss type
      const specialText = this.add.text(this.boss.x, this.boss.y - 50, boss.specialMove, {
        fontSize: '16px',
        fill: '#9b59b6',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: specialText,
        y: specialText.y - 30,
        alpha: 0,
        duration: 1000
      });
      
      // Area damage
      this.time.delayedCall(500, () => {
        const distance = Math.abs(this.boss.x - this.player.x);
        if (distance < 200) {
          this.hitPlayer(this.boss.getData('attackPower') * 2);
        }
      });
      
      this.time.delayedCall(1500, () => {
        this.boss.clearTint();
        this.bossState = 'idle';
        this.bossCanAct = true;
      });
    }

    hitPlayer(damage) {
      this.playerHP = Math.max(0, this.playerHP - damage);
      this.comboCount = 0; // Reset combo
      
      // Hit effect
      this.showHitEffect(this.player.x, this.player.y);
      this.cameras.main.shake(200, 0.01);
      
      // Update HUD
      onUpdateStats({
        playerHP: this.playerHP,
        comboCount: 0,
        showDamage: { amount: damage, x: -50 }
      });
      
      // Check defeat
      if (this.playerHP <= 0) {
        this.endBattle(false);
      }
    }

    hitBoss(damage, isCritical = false) {
      this.bossHP = Math.max(0, this.bossHP - damage);
      
      // Hit effect
      this.showHitEffect(this.boss.x, this.boss.y);
      if (isCritical) {
        this.cameras.main.shake(300, 0.02);
      }
      
      // Add to special meter
      this.specialMeter = Math.min(100, this.specialMeter + 10);
      
      // Update HUD
      onUpdateStats({
        bossHP: this.bossHP,
        specialMeter: this.specialMeter,
        showDamage: { amount: damage, critical: isCritical, x: 50 }
      });
      
      // Check victory
      if (this.bossHP <= 0) {
        this.endBattle(true);
      }
    }

    updateCombo() {
      const now = this.time.now;
      if (now - this.lastComboTime < 2000) {
        this.comboCount++;
      } else {
        this.comboCount = 1;
      }
      this.lastComboTime = now;
      
      // Update combo display
      if (this.comboCount > 1) {
        this.comboText.setText(`COMBO x${this.comboCount}`);
        this.tweens.add({
          targets: this.comboText,
          scale: 1.2,
          duration: 100,
          yoyo: true
        });
      }
    }

    showHitEffect(x, y) {
      const effect = this.add.sprite(x, y, 'hitEffect');
      effect.setScale(0.5);
      
      this.tweens.add({
        targets: effect,
        scale: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => effect.destroy()
      });
    }

    showBlockEffect(x, y) {
      const blockText = this.add.text(x, y - 50, 'BLOCKED!', {
        fontSize: '14px',
        fill: '#3498db',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: blockText,
        y: blockText.y - 20,
        alpha: 0,
        duration: 500,
        onComplete: () => blockText.destroy()
      });
    }

    constrainFighters() {
      // Keep fighters on ground and within bounds
      if (this.player.y > 320) {
        this.player.y = 320;
        this.player.setVelocityY(0);
      }
      if (this.boss.y > 300) {
        this.boss.y = 300;
        this.boss.setVelocityY(0);
      }
      
      // Keep within screen bounds
      this.player.x = Phaser.Math.Clamp(this.player.x, 50, 750);
      this.boss.x = Phaser.Math.Clamp(this.boss.x, 50, 750);
    }

    updateBattleStats() {
      if (onUpdateStats) {
        onUpdateStats({
          playerHP: this.playerHP,
          playerMaxHP: this.playerMaxHP,
          bossHP: this.bossHP,
          bossMaxHP: this.bossMaxHP,
          comboCount: this.comboCount,
          specialMeter: this.specialMeter,
          roundTime: this.roundTime
        });
      }
    }

    endBattle(victory) {
      this.battleActive = false;
      this.physics.pause();
      
      // Show result
      const resultText = this.add.text(400, 200, victory ? 'VICTORY!' : 'DEFEAT', {
        fontSize: '64px',
        fill: victory ? '#F7D51D' : '#E53935',
        fontFamily: 'monospace'
      }).setOrigin(0.5);
      
      // Calculate score
      const score = victory ? 
        Math.floor((this.playerHP / this.playerMaxHP) * 100) + (this.comboCount * 10) : 
        0;
      
      this.time.delayedCall(2000, () => {
        if (onBattleEnd) {
          onBattleEnd({ victory, score });
        }
      });
    }
  }

  return BattleScene;
};

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaserContainer: {
    width: '100%',
    height: '100%',
  },
});

export default PhaserBattleGame;