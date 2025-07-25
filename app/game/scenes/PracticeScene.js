/**
 * Practice Scene
 * Free training mode with configurable dummy opponent
 */

import Phaser from 'phaser';
import TouchControls from '../systems/TouchControls';
import BattleHUD from '../ui/BattleHUD';
import MoveListDisplay from '../ui/MoveListDisplay';
import { playerConfig } from '../config/Player';

export default class PracticeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PracticeScene' });
    
    this.dummySettings = {
      behavior: 'passive', // passive, defensive, aggressive, random
      autoBlock: false,
      counterAttack: false,
      infiniteHealth: true,
      attackInterval: 3000
    };
  }

  create() {
    this.cameras.main.setBackgroundColor('#0D0D0D');
    
    // Create background
    this.background = this.add.image(448, 252, 'background_dojo');
    this.background.setScale(3.5);
    
    // Create ground
    this.ground = this.physics.add.staticGroup();
    this.ground.create(448, 460, 'ground').setScale(30, 1).refreshBody();
    
    // Create player
    this.createPlayer();
    
    // Create practice dummy
    this.createPracticeDummy();
    
    // Create controls
    this.controls = new TouchControls(this);
    this.controls.on('action', this.handlePlayerAction, this);
    
    // Create HUD
    this.hud = new BattleHUD(this);
    this.hud.updateBossName('Practice Dummy');
    
    // Create move list
    this.moveList = new MoveListDisplay(this);
    
    // Create practice UI
    this.createPracticeUI();
    
    // Setup collisions
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.dummy, this.ground);
    
    // Reset meters
    this.resetMeters();
  }

  createPlayer() {
    this.player = this.physics.add.sprite(200, 300, 'sean_fighter');
    this.player.setScale(2);
    this.player.setCollideWorldBounds(true);
    
    // Player stats
    this.player.hp = playerConfig.maxHp;
    this.player.maxHp = playerConfig.maxHp;
    this.player.specialMeter = 0;
    this.player.maxSpecialMeter = playerConfig.maxSpecialMeter;
    this.player.isBlocking = false;
    this.player.canAirDash = true;
    this.player.comboCount = 0;
    this.player.lastHitTime = 0;
    this.player.moveDirection = null;
    this.player.isAttacking = false;
    
    // Create animations (reuse from tutorial)
    this.createPlayerAnimations();
  }

  createPracticeDummy() {
    this.dummy = this.physics.add.sprite(600, 300, 'rookie_ryu');
    this.dummy.setScale(2);
    this.dummy.setCollideWorldBounds(true);
    
    // Dummy stats
    this.dummy.hp = 1000;
    this.dummy.maxHp = 1000;
    this.dummy.isAttacking = false;
    this.dummy.isBlocking = false;
    this.dummy.nextActionTime = 0;
    
    // Create dummy animations
    this.createDummyAnimations();
  }

  createPlayerAnimations() {
    // Reuse animation creation from TutorialScene
    const anims = [
      { key: 'player_idle', frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 },
      { key: 'player_walk', frames: [4, 5, 6, 7], frameRate: 10, repeat: -1 },
      { key: 'player_jump', frames: [8, 9], frameRate: 8, repeat: 0 },
      { key: 'player_punch', frames: [12, 13], frameRate: 10, repeat: 0 },
      { key: 'player_kick', frames: [14, 15], frameRate: 10, repeat: 0 },
      { key: 'player_special', frames: [12, 13, 14, 15], frameRate: 12, repeat: 0 },
      { key: 'player_block', frames: [10], frameRate: 1, repeat: 0 },
      { key: 'player_hurt', frames: [11], frameRate: 1, repeat: 0 }
    ];
    
    anims.forEach(anim => {
      if (!this.anims.exists(anim.key)) {
        this.anims.create({
          key: anim.key,
          frames: this.anims.generateFrameNumbers('sean_fighter', { frames: anim.frames }),
          frameRate: anim.frameRate,
          repeat: anim.repeat
        });
      }
    });
  }

  createDummyAnimations() {
    const anims = [
      { key: 'dummy_idle', frames: [0, 1, 2, 3], frameRate: 8, repeat: -1 },
      { key: 'dummy_attack', frames: [12, 13], frameRate: 10, repeat: 0 },
      { key: 'dummy_block', frames: [10], frameRate: 1, repeat: 0 },
      { key: 'dummy_hurt', frames: [11], frameRate: 1, repeat: 0 }
    ];
    
    anims.forEach(anim => {
      if (!this.anims.exists(anim.key)) {
        this.anims.create({
          key: anim.key,
          frames: this.anims.generateFrameNumbers('rookie_ryu', { frames: anim.frames }),
          frameRate: anim.frameRate,
          repeat: anim.repeat
        });
      }
    });
  }

  createPracticeUI() {
    const { width } = this.cameras.main;
    
    // Settings panel
    const panelY = 60;
    this.settingsPanel = this.add.rectangle(width / 2, panelY, 800, 80, 0x0D0D0D, 0.8);
    this.settingsPanel.setStrokeStyle(2, 0x92CC41);
    
    // Title
    this.add.text(width / 2, panelY - 30, 'PRACTICE MODE', {
      fontSize: '20px',
      fontFamily: 'pixel',
      color: '#F7D51D'
    }).setOrigin(0.5);
    
    // Dummy behavior buttons
    const behaviors = ['PASSIVE', 'DEFENSIVE', 'AGGRESSIVE', 'RANDOM'];
    const buttonWidth = 120;
    const startX = width / 2 - (behaviors.length * (buttonWidth + 10)) / 2;
    
    this.behaviorButtons = behaviors.map((behavior, index) => {
      const x = startX + index * (buttonWidth + 10) + buttonWidth / 2;
      const button = this.add.rectangle(x, panelY, buttonWidth, 30, 0x666666, 0.8)
        .setInteractive()
        .setStrokeStyle(2, behavior === 'PASSIVE' ? 0xF7D51D : 0x333333);
      
      const text = this.add.text(x, panelY, behavior, {
        fontSize: '12px',
        fontFamily: 'pixel',
        color: behavior === 'PASSIVE' ? '#F7D51D' : '#92CC41'
      }).setOrigin(0.5);
      
      button.on('pointerdown', () => this.setBehavior(behavior.toLowerCase()));
      
      return { button, text, behavior };
    });
    
    // Toggle buttons
    this.createToggleButton(width - 200, panelY - 20, 'AUTO BLOCK', 'autoBlock');
    this.createToggleButton(width - 200, panelY + 20, 'COUNTER', 'counterAttack');
    this.createToggleButton(width - 80, panelY - 20, 'INF HEALTH', 'infiniteHealth');
    
    // Reset button
    this.resetButton = this.add.rectangle(width - 80, panelY + 20, 100, 30, 0xE53935, 0.8)
      .setInteractive()
      .setStrokeStyle(2, 0x0D0D0D);
    
    this.add.text(width - 80, panelY + 20, 'RESET', {
      fontSize: '14px',
      fontFamily: 'pixel',
      color: '#0D0D0D'
    }).setOrigin(0.5);
    
    this.resetButton.on('pointerdown', () => this.resetPractice());
    
    // Exit button
    this.exitButton = this.add.text(40, 40, '← BACK', {
      fontSize: '16px',
      fontFamily: 'pixel',
      color: '#92CC41',
      backgroundColor: '#0D0D0D',
      padding: { x: 10, y: 5 }
    }).setInteractive();
    
    this.exitButton.on('pointerdown', () => {
      this.scene.start('BattleMenuScene');
    });
    
    // Instructions
    this.add.text(width / 2, 480, 'Practice your combos • Test damage • Master timing', {
      fontSize: '12px',
      fontFamily: 'pixel',
      color: '#666666'
    }).setOrigin(0.5);
  }

  createToggleButton(x, y, label, setting) {
    const button = this.add.rectangle(x, y, 100, 25, 0x333333, 0.8)
      .setInteractive()
      .setStrokeStyle(2, this.dummySettings[setting] ? 0x92CC41 : 0x666666);
    
    const text = this.add.text(x, y, label, {
      fontSize: '11px',
      fontFamily: 'pixel',
      color: this.dummySettings[setting] ? '#92CC41' : '#666666'
    }).setOrigin(0.5);
    
    button.on('pointerdown', () => {
      this.dummySettings[setting] = !this.dummySettings[setting];
      button.setStrokeStyle(2, this.dummySettings[setting] ? 0x92CC41 : 0x666666);
      text.setColor(this.dummySettings[setting] ? '#92CC41' : '#666666');
    });
  }

  setBehavior(behavior) {
    this.dummySettings.behavior = behavior;
    
    // Update button visuals
    this.behaviorButtons.forEach(({ button, text, behavior: btnBehavior }) => {
      const isActive = btnBehavior.toLowerCase() === behavior;
      button.setStrokeStyle(2, isActive ? 0xF7D51D : 0x333333);
      text.setColor(isActive ? '#F7D51D' : '#92CC41');
    });
  }

  handlePlayerAction(action) {
    switch (action) {
      case 'moveLeft':
        this.player.moveDirection = 'left';
        break;
        
      case 'moveRight':
        this.player.moveDirection = 'right';
        break;
        
      case 'stopMove':
        this.player.moveDirection = null;
        break;
        
      case 'jump':
        if (this.player.body.onFloor()) {
          this.player.setVelocityY(-500);
          this.player.anims.play('player_jump', true);
        }
        break;
        
      case 'punch':
        this.performAttack('punch');
        break;
        
      case 'kick':
        this.performAttack('kick');
        break;
        
      case 'block':
        this.player.isBlocking = true;
        this.player.anims.play('player_block', true);
        break;
        
      case 'stopBlock':
        this.player.isBlocking = false;
        break;
        
      case 'special':
        if (this.player.specialMeter >= this.player.maxSpecialMeter) {
          this.performSpecialAttack();
        }
        break;
        
      case 'airDash':
        if (!this.player.body.onFloor() && this.player.canAirDash) {
          this.performAirDash();
        }
        break;
        
      case 'toggleMoves':
        this.moveList.toggle();
        break;
    }
  }

  performAttack(type) {
    if (this.player.isAttacking) return;
    
    this.player.isAttacking = true;
    const damage = type === 'punch' ? 10 : 20;
    
    // Play animation
    this.player.anims.play(`player_${type}`, true);
    
    // Check if hitting dummy
    const distance = Math.abs(this.player.x - this.dummy.x);
    if (distance < 100) {
      // Apply damage
      if (!this.dummySettings.infiniteHealth) {
        this.dummy.hp -= damage;
        if (this.dummy.hp < 0) this.dummy.hp = 0;
      }
      
      // Dummy reaction
      if (this.dummySettings.autoBlock && Math.random() > 0.3) {
        this.dummy.anims.play('dummy_block', true);
        this.showDamageNumber(this.dummy.x, this.dummy.y - 50, 'BLOCKED', '#92CC41');
      } else {
        this.dummy.anims.play('dummy_hurt', true);
        this.showDamageNumber(this.dummy.x, this.dummy.y - 50, damage);
        
        // Counter attack chance
        if (this.dummySettings.counterAttack && Math.random() > 0.5) {
          this.time.delayedCall(300, () => this.dummyCounterAttack());
        }
      }
      
      // Update combo
      this.updateCombo();
      
      // Build special meter
      this.player.specialMeter = Math.min(this.player.specialMeter + 10, this.player.maxSpecialMeter);
      this.controls.updateSpecialMeter(this.player.specialMeter, this.player.maxSpecialMeter);
    }
    
    // Reset attack state
    this.time.delayedCall(300, () => {
      this.player.isAttacking = false;
    });
  }

  performSpecialAttack() {
    this.player.specialMeter = 0;
    this.controls.updateSpecialMeter(0, this.player.maxSpecialMeter);
    
    // Special attack animation and effects
    this.player.anims.play('player_special', true);
    
    // Screen flash effect
    this.cameras.main.flash(100, 255, 215, 0);
    
    // Deal damage
    const distance = Math.abs(this.player.x - this.dummy.x);
    if (distance < 150) {
      if (!this.dummySettings.infiniteHealth) {
        this.dummy.hp -= 35;
        if (this.dummy.hp < 0) this.dummy.hp = 0;
      }
      this.dummy.anims.play('dummy_hurt', true);
      this.showDamageNumber(this.dummy.x, this.dummy.y - 50, 35, '#F7D51D');
    }
  }

  performAirDash() {
    this.player.canAirDash = false;
    this.player.setVelocityX(this.player.flipX ? -400 : 400);
    this.player.setVelocityY(100);
    
    // Air dash effect
    const dashEffect = this.add.rectangle(
      this.player.x,
      this.player.y,
      60,
      4,
      0x92CC41,
      0.8
    );
    
    this.tweens.add({
      targets: dashEffect,
      alpha: 0,
      scaleX: 0,
      duration: 300,
      onComplete: () => dashEffect.destroy()
    });
  }

  dummyCounterAttack() {
    if (this.dummy.isAttacking) return;
    
    this.dummy.isAttacking = true;
    this.dummy.anims.play('dummy_attack', true);
    
    // Check if hitting player
    const distance = Math.abs(this.player.x - this.dummy.x);
    if (distance < 100 && !this.player.isBlocking) {
      this.player.hp -= 15;
      this.player.anims.play('player_hurt', true);
      this.showDamageNumber(this.player.x, this.player.y - 50, 15, '#FF0000');
    }
    
    this.time.delayedCall(400, () => {
      this.dummy.isAttacking = false;
    });
  }

  updateCombo() {
    const currentTime = this.time.now;
    
    if (currentTime - this.player.lastHitTime > 2000) {
      this.player.comboCount = 1;
    } else {
      this.player.comboCount++;
    }
    
    this.player.lastHitTime = currentTime;
    this.hud.updateCombo(this.player.comboCount);
  }

  showDamageNumber(x, y, damage, color = '#FFFFFF') {
    const text = typeof damage === 'number' ? damage.toString() : damage;
    const damageText = this.add.text(x, y, text, {
      fontSize: '24px',
      fontFamily: 'pixel',
      color: color,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: damageText,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy()
    });
  }

  resetPractice() {
    // Reset player
    this.player.hp = this.player.maxHp;
    this.player.specialMeter = 0;
    this.player.comboCount = 0;
    this.player.x = 200;
    this.player.y = 300;
    
    // Reset dummy
    this.dummy.hp = this.dummy.maxHp;
    this.dummy.x = 600;
    this.dummy.y = 300;
    
    // Update displays
    this.resetMeters();
  }

  resetMeters() {
    this.hud.updatePlayerHealth(this.player.hp, this.player.maxHp);
    this.hud.updateBossHealth(this.dummy.hp, this.dummy.maxHp);
    this.hud.updateSpecialMeter(0, this.player.maxSpecialMeter);
    this.hud.updateCombo(0);
    this.controls.updateSpecialMeter(0, this.player.maxSpecialMeter);
  }

  update(time, delta) {
    // Update player movement
    this.updatePlayerMovement();
    
    // Update dummy AI
    this.updateDummyAI(time);
    
    // Update HUD
    this.hud.updatePlayerHealth(this.player.hp, this.player.maxHp);
    this.hud.updateBossHealth(this.dummy.hp, this.dummy.maxHp);
    this.hud.updateSpecialMeter(this.player.specialMeter, this.player.maxSpecialMeter);
  }

  updatePlayerMovement() {
    // Reset velocity
    if (this.player.body.onFloor()) {
      this.player.canAirDash = true;
    }
    
    // Horizontal movement
    if (this.player.moveDirection === 'left') {
      this.player.setVelocityX(-160);
      this.player.flipX = true;
      if (this.player.body.onFloor() && !this.player.isAttacking && !this.player.isBlocking) {
        this.player.anims.play('player_walk', true);
      }
    } else if (this.player.moveDirection === 'right') {
      this.player.setVelocityX(160);
      this.player.flipX = false;
      if (this.player.body.onFloor() && !this.player.isAttacking && !this.player.isBlocking) {
        this.player.anims.play('player_walk', true);
      }
    } else {
      this.player.setVelocityX(0);
      if (this.player.body.onFloor() && !this.player.isAttacking && !this.player.isBlocking) {
        this.player.anims.play('player_idle', true);
      }
    }
  }

  updateDummyAI(time) {
    // Face the player
    this.dummy.flipX = this.dummy.x > this.player.x;
    
    if (time < this.dummy.nextActionTime || this.dummy.isAttacking) {
      if (!this.dummy.isAttacking && !this.dummy.isBlocking) {
        this.dummy.anims.play('dummy_idle', true);
      }
      return;
    }
    
    const distance = Math.abs(this.player.x - this.dummy.x);
    
    switch (this.dummySettings.behavior) {
      case 'passive':
        // Just idle
        this.dummy.anims.play('dummy_idle', true);
        break;
        
      case 'defensive':
        // Block when player is close
        if (distance < 150) {
          this.dummy.isBlocking = true;
          this.dummy.anims.play('dummy_block', true);
          this.time.delayedCall(1000, () => {
            this.dummy.isBlocking = false;
          });
        }
        this.dummy.nextActionTime = time + 2000;
        break;
        
      case 'aggressive':
        // Attack frequently
        if (distance < 100) {
          this.dummyCounterAttack();
          this.dummy.nextActionTime = time + 1000;
        } else {
          // Move towards player
          this.dummy.setVelocityX(this.dummy.x > this.player.x ? -100 : 100);
          this.time.delayedCall(500, () => this.dummy.setVelocityX(0));
          this.dummy.nextActionTime = time + 800;
        }
        break;
        
      case 'random':
        // Random actions
        const action = Math.random();
        if (action < 0.3 && distance < 100) {
          this.dummyCounterAttack();
          this.dummy.nextActionTime = time + 1500;
        } else if (action < 0.6) {
          this.dummy.isBlocking = true;
          this.dummy.anims.play('dummy_block', true);
          this.time.delayedCall(800, () => {
            this.dummy.isBlocking = false;
          });
          this.dummy.nextActionTime = time + 1500;
        } else {
          this.dummy.nextActionTime = time + 1000;
        }
        break;
    }
  }
}