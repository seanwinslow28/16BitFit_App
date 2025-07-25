import Phaser from 'phaser';
import { playerConfig } from '../config/Player';
import { bossConfigs } from '../config/Bosses';
import TouchControls from '../systems/TouchControls';
import BattleHUD from '../ui/BattleHUD';
import MoveListDisplay from '../ui/MoveListDisplay';
import TipsSystem from '../systems/TipsSystem';

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
    
    this.tutorialSteps = [
      {
        id: 'movement',
        title: 'MOVEMENT BASICS',
        instructions: 'Use LEFT/RIGHT to move, UP to jump',
        objective: 'Move left, then right, then jump',
        checks: { movedLeft: false, movedRight: false, jumped: false },
        highlight: ['dpad']
      },
      {
        id: 'basic_attacks',
        title: 'BASIC ATTACKS',
        instructions: 'PUNCH deals 10 damage, KICK deals 20 damage',
        objective: 'Hit the dummy with 2 punches and 1 kick',
        checks: { punches: 0, kicks: 0 },
        highlight: ['punch', 'kick']
      },
      {
        id: 'blocking',
        title: 'DEFENSIVE MOVES',
        instructions: 'Hold BLOCK to reduce damage by 80%',
        objective: 'Block 3 incoming attacks',
        checks: { blockedAttacks: 0 },
        highlight: ['block']
      },
      {
        id: 'combos',
        title: 'COMBO SYSTEM',
        instructions: 'Chain attacks within 2 seconds for combos',
        objective: 'Perform a 3-hit combo',
        checks: { maxCombo: 0 },
        highlight: ['punch', 'kick']
      },
      {
        id: 'special_moves',
        title: 'SPECIAL ATTACKS',
        instructions: 'Fill your meter and unleash a special attack (35 damage)',
        objective: 'Use a special attack',
        checks: { specialUsed: false },
        highlight: ['special']
      },
      {
        id: 'air_dash',
        title: 'ADVANCED MOVEMENT',
        instructions: 'Press DOWN while in the air to air dash',
        objective: 'Perform 2 air dashes',
        checks: { airDashes: 0 },
        highlight: ['dpad']
      }
    ];
    
    this.currentStep = 0;
    this.stepComplete = false;
    this.tutorialComplete = false;
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
    
    // Create training dummy
    this.createTrainingDummy();
    
    // Create controls
    this.controls = new TouchControls(this);
    this.controls.on('action', this.handlePlayerAction, this);
    
    // Create tutorial UI
    this.createTutorialUI();
    
    // Create simplified HUD
    this.hud = new BattleHUD(this);
    this.hud.updateBossName('Training Dummy');
    
    // Create move list display
    this.moveList = new MoveListDisplay(this);
    
    // Setup collisions
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.dummy, this.ground);
    
    // Start first tutorial step
    this.startTutorialStep();
    
    // Setup input handlers
    this.setupInputHandlers();
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
    
    // Create animations
    this.createPlayerAnimations();
  }

  createTrainingDummy() {
    this.dummy = this.physics.add.sprite(600, 300, 'gym_bully');
    this.dummy.setScale(2);
    this.dummy.setCollideWorldBounds(true);
    
    // Dummy stats
    this.dummy.hp = 500;
    this.dummy.maxHp = 500;
    this.dummy.isAttacking = false;
    this.dummy.nextAttackTime = 0;
    
    // Simple dummy AI for blocking tutorial
    this.dummy.attackPattern = 'passive';
  }

  createPlayerAnimations() {
    // Idle animation
    if (!this.anims.exists('player_idle')) {
      this.anims.create({
        key: 'player_idle',
        frames: this.anims.generateFrameNumbers('sean_fighter', { frames: [0, 1, 2, 3] }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Walk animation
    if (!this.anims.exists('player_walk')) {
      this.anims.create({
        key: 'player_walk',
        frames: this.anims.generateFrameNumbers('sean_fighter', { frames: [4, 5, 6, 7] }),
        frameRate: 10,
        repeat: -1
      });
    }
    
    // Jump animation
    if (!this.anims.exists('player_jump')) {
      this.anims.create({
        key: 'player_jump',
        frames: this.anims.generateFrameNumbers('sean_fighter', { frames: [8, 9] }),
        frameRate: 8,
        repeat: 0
      });
    }
    
    // Attack animations
    if (!this.anims.exists('player_punch')) {
      this.anims.create({
        key: 'player_punch',
        frames: this.anims.generateFrameNumbers('sean_fighter', { frames: [12, 13] }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    if (!this.anims.exists('player_kick')) {
      this.anims.create({
        key: 'player_kick',
        frames: this.anims.generateFrameNumbers('sean_fighter', { frames: [14, 15] }),
        frameRate: 10,
        repeat: 0
      });
    }
    
    if (!this.anims.exists('player_special')) {
      this.anims.create({
        key: 'player_special',
        frames: this.anims.generateFrameNumbers('sean_fighter', { frames: [12, 13, 14, 15] }),
        frameRate: 12,
        repeat: 0
      });
    }
  }

  createTutorialUI() {
    // Tutorial panel background
    this.tutorialPanel = this.add.rectangle(448, 80, 700, 120, 0x0D0D0D, 0.9);
    this.tutorialPanel.setStrokeStyle(4, 0x92CC41);
    
    // Tutorial title
    this.tutorialTitle = this.add.text(448, 50, '', {
      fontSize: '20px',
      fontFamily: 'pixel',
      color: '#F7D51D',
      align: 'center'
    }).setOrigin(0.5);
    
    // Tutorial instructions
    this.tutorialInstructions = this.add.text(448, 80, '', {
      fontSize: '14px',
      fontFamily: 'pixel',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5);
    
    // Tutorial objective
    this.tutorialObjective = this.add.text(448, 110, '', {
      fontSize: '16px',
      fontFamily: 'pixel',
      color: '#92CC41',
      align: 'center'
    }).setOrigin(0.5);
    
    // Progress indicator
    this.progressText = this.add.text(20, 20, '', {
      fontSize: '14px',
      fontFamily: 'pixel',
      color: '#92CC41'
    });
    
    // Skip tutorial button
    this.skipButton = this.add.text(850, 480, 'SKIP [ESC]', {
      fontSize: '12px',
      fontFamily: 'pixel',
      color: '#666666'
    }).setInteractive();
    
    this.skipButton.on('pointerdown', () => this.skipTutorial());
  }

  startTutorialStep() {
    if (this.currentStep >= this.tutorialSteps.length) {
      this.completeTutorial();
      return;
    }
    
    const step = this.tutorialSteps[this.currentStep];
    this.stepComplete = false;
    
    // Update UI
    this.tutorialTitle.setText(step.title);
    this.tutorialInstructions.setText(step.instructions);
    this.tutorialObjective.setText(`Objective: ${step.objective}`);
    this.progressText.setText(`Step ${this.currentStep + 1}/${this.tutorialSteps.length}`);
    
    // Highlight relevant controls
    this.controls.highlightButtons(step.highlight);
    
    // Reset step checks
    Object.keys(step.checks).forEach(key => {
      if (typeof step.checks[key] === 'number') {
        step.checks[key] = 0;
      } else {
        step.checks[key] = false;
      }
    });
    
    // Setup step-specific behavior
    this.setupStepBehavior(step);
  }

  setupStepBehavior(step) {
    switch (step.id) {
      case 'blocking':
        // Make dummy attack periodically
        this.dummy.attackPattern = 'tutorial_blocking';
        this.dummy.nextAttackTime = this.time.now + 2000;
        break;
        
      case 'special_moves':
        // Give player full special meter
        this.player.specialMeter = this.player.maxSpecialMeter;
        this.hud.updateSpecialMeter(this.player.specialMeter, this.player.maxSpecialMeter);
        break;
        
      default:
        // Passive dummy for other steps
        this.dummy.attackPattern = 'passive';
        break;
    }
  }

  setupInputHandlers() {
    // Skip tutorial
    this.input.keyboard.on('keydown-ESC', () => this.skipTutorial());
  }
  
  handlePlayerAction(action) {
    const step = this.tutorialSteps[this.currentStep];
    
    switch (action) {
      case 'moveLeft':
        this.player.moveDirection = 'left';
        if (step.id === 'movement') {
          step.checks.movedLeft = true;
        }
        break;
        
      case 'moveRight':
        this.player.moveDirection = 'right';
        if (step.id === 'movement') {
          step.checks.movedRight = true;
        }
        break;
        
      case 'stopMove':
        this.player.moveDirection = null;
        break;
        
      case 'jump':
        if (this.player.body.onFloor()) {
          this.player.setVelocityY(-500);
          this.player.anims.play('player_jump', true);
          if (step.id === 'movement') {
            step.checks.jumped = true;
          }
        }
        break;
        
      case 'punch':
        if (step.id === 'basic_attacks') {
          this.performAttack('punch');
          step.checks.punches++;
        } else if (step.id === 'combos') {
          this.performAttack('punch');
        }
        break;
        
      case 'kick':
        if (step.id === 'basic_attacks') {
          this.performAttack('kick');
          step.checks.kicks++;
        } else if (step.id === 'combos') {
          this.performAttack('kick');
        }
        break;
        
      case 'block':
        this.player.isBlocking = true;
        break;
        
      case 'stopBlock':
        this.player.isBlocking = false;
        break;
        
      case 'special':
        if (step.id === 'special_moves' && this.player.specialMeter >= this.player.maxSpecialMeter) {
          this.performSpecialAttack();
          step.checks.specialUsed = true;
        }
        break;
        
      case 'airDash':
        if (step.id === 'air_dash' && !this.player.body.onFloor() && this.player.canAirDash) {
          this.performAirDash();
          step.checks.airDashes++;
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
      this.dummy.hp -= damage;
      this.hud.updateBossHealth(this.dummy.hp, this.dummy.maxHp);
      
      // Update combo
      this.updateCombo();
      
      // Show damage number
      this.showDamageNumber(this.dummy.x, this.dummy.y - 50, damage);
    }
    
    // Reset attack state
    this.time.delayedCall(300, () => {
      this.player.isAttacking = false;
    });
  }

  performSpecialAttack() {
    this.player.specialMeter = 0;
    this.hud.updateSpecialMeter(0, this.player.maxSpecialMeter);
    
    // Special attack animation and effects
    this.player.anims.play('player_special', true);
    
    // Deal damage
    const distance = Math.abs(this.player.x - this.dummy.x);
    if (distance < 150) {
      this.dummy.hp -= 35;
      this.hud.updateBossHealth(this.dummy.hp, this.dummy.maxHp);
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

  updateCombo() {
    const currentTime = this.time.now;
    
    if (currentTime - this.player.lastHitTime > 2000) {
      this.player.comboCount = 1;
    } else {
      this.player.comboCount++;
    }
    
    this.player.lastHitTime = currentTime;
    this.hud.updateCombo(this.player.comboCount);
    
    // Check combo objective
    const step = this.tutorialSteps[this.currentStep];
    if (step.id === 'combos' && this.player.comboCount > step.checks.maxCombo) {
      step.checks.maxCombo = this.player.comboCount;
    }
  }

  showDamageNumber(x, y, damage, color = '#FFFFFF') {
    const damageText = this.add.text(x, y, damage.toString(), {
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

  update(time, delta) {
    // Update player movement
    this.updatePlayerMovement();
    
    // Update dummy AI
    this.updateDummyAI(time);
    
    // Check step completion
    this.checkStepCompletion();
    
    // Update HUD
    this.hud.updatePlayerHealth(this.player.hp, this.player.maxHp);
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
      if (this.player.body.onFloor() && !this.player.isAttacking) {
        this.player.anims.play('player_walk', true);
      }
    } else if (this.player.moveDirection === 'right') {
      this.player.setVelocityX(160);
      this.player.flipX = false;
      if (this.player.body.onFloor() && !this.player.isAttacking) {
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
    if (this.dummy.attackPattern === 'tutorial_blocking' && time > this.dummy.nextAttackTime) {
      // Simple telegraphed attack for blocking tutorial
      this.dummy.isAttacking = true;
      
      // Telegraph attack
      this.dummy.setTint(0xff6666);
      
      this.time.delayedCall(500, () => {
        // Perform attack
        this.dummy.clearTint();
        const distance = Math.abs(this.player.x - this.dummy.x);
        
        if (distance < 100) {
          if (this.player.isBlocking) {
            // Blocked successfully
            const step = this.tutorialSteps[this.currentStep];
            step.checks.blockedAttacks++;
            this.showDamageNumber(this.player.x, this.player.y - 50, 'BLOCKED!', '#92CC41');
          } else {
            // Take damage
            this.player.hp -= 10;
            this.hud.updatePlayerHealth(this.player.hp, this.player.maxHp);
            this.showDamageNumber(this.player.x, this.player.y - 50, 10, '#FF0000');
          }
        }
        
        this.dummy.isAttacking = false;
        this.dummy.nextAttackTime = time + 2500;
      });
    }
  }

  checkStepCompletion() {
    if (this.stepComplete) return;
    
    const step = this.tutorialSteps[this.currentStep];
    let isComplete = false;
    
    switch (step.id) {
      case 'movement':
        isComplete = step.checks.movedLeft && step.checks.movedRight && step.checks.jumped;
        break;
        
      case 'basic_attacks':
        isComplete = step.checks.punches >= 2 && step.checks.kicks >= 1;
        break;
        
      case 'blocking':
        isComplete = step.checks.blockedAttacks >= 3;
        break;
        
      case 'combos':
        isComplete = step.checks.maxCombo >= 3;
        break;
        
      case 'special_moves':
        isComplete = step.checks.specialUsed;
        break;
        
      case 'air_dash':
        isComplete = step.checks.airDashes >= 2;
        break;
    }
    
    if (isComplete) {
      this.completeStep();
    }
  }

  completeStep() {
    this.stepComplete = true;
    
    // Show completion message
    const completeText = this.add.text(448, 252, 'STEP COMPLETE!', {
      fontSize: '36px',
      fontFamily: 'pixel',
      color: '#92CC41',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: completeText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          completeText.destroy();
          this.currentStep++;
          this.startTutorialStep();
        });
      }
    });
    
    // Reset dummy health
    this.dummy.hp = this.dummy.maxHp;
    this.hud.updateBossHealth(this.dummy.hp, this.dummy.maxHp);
  }

  completeTutorial() {
    this.tutorialComplete = true;
    
    // Show completion screen
    const overlay = this.add.rectangle(448, 252, 896, 504, 0x000000, 0.8);
    
    const completeTitle = this.add.text(448, 180, 'TUTORIAL COMPLETE!', {
      fontSize: '42px',
      fontFamily: 'pixel',
      color: '#F7D51D',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    const completeMessage = this.add.text(448, 252, 'You have mastered the basics of combat!', {
      fontSize: '20px',
      fontFamily: 'pixel',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    const continueButton = this.add.text(448, 340, 'CONTINUE TO BATTLE MENU', {
      fontSize: '18px',
      fontFamily: 'pixel',
      color: '#92CC41',
      backgroundColor: '#0D0D0D',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    continueButton.on('pointerdown', () => {
      this.scene.start('BattleMenuScene');
    });
  }

  skipTutorial() {
    // Confirm skip
    const skipConfirm = this.add.group([
      this.add.rectangle(448, 252, 400, 200, 0x0D0D0D, 0.95).setStrokeStyle(4, 0xE53935),
      this.add.text(448, 210, 'Skip Tutorial?', {
        fontSize: '24px',
        fontFamily: 'pixel',
        color: '#E53935'
      }).setOrigin(0.5),
      this.add.text(448, 252, 'Are you sure you want to skip?', {
        fontSize: '16px',
        fontFamily: 'pixel',
        color: '#FFFFFF'
      }).setOrigin(0.5)
    ]);
    
    const yesButton = this.add.text(350, 290, 'YES', {
      fontSize: '18px',
      fontFamily: 'pixel',
      color: '#E53935',
      backgroundColor: '#1A1A1A',
      padding: { x: 20, y: 5 }
    }).setOrigin(0.5).setInteractive();
    
    const noButton = this.add.text(546, 290, 'NO', {
      fontSize: '18px',
      fontFamily: 'pixel',
      color: '#92CC41',
      backgroundColor: '#1A1A1A',
      padding: { x: 20, y: 5 }
    }).setOrigin(0.5).setInteractive();
    
    skipConfirm.add([yesButton, noButton]);
    
    yesButton.on('pointerdown', () => {
      this.scene.start('BattleMenuScene');
    });
    
    noButton.on('pointerdown', () => {
      skipConfirm.destroy(true);
    });
  }
}