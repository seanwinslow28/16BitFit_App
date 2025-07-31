/**
 * Fighter Entity - Street Fighter 2 style character
 * Handles all combat mechanics, animations, and state management
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export default class Fighter extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config) {
    super(scene, x, y);
    
    this.scene = scene;
    this.config = config;
    this.type = config.type;
    this.stats = { ...config.stats };
    this.isPlayer = config.isPlayer;
    this.facing = config.facing || 1;
    
    // Initialize properties
    this.initializeProperties();
    
    // Create sprite
    this.createSprite();
    
    // Create hitboxes
    this.createHitboxes();
    
    // Set up animations
    this.setupAnimations();
    
    // Add to scene
    scene.add.existing(this);
    
    // Enable physics
    this.setupPhysics();
  }

  initializeProperties() {
    // Health and resources
    this.maxHealth = this.stats.health;
    this.health = this.maxHealth;
    this.superMeter = 0;
    this.maxSuperMeter = 100;
    
    // Movement properties
    this.velocity = { x: 0, y: 0 };
    this.grounded = true;
    this.crouching = false;
    this.blocking = false;
    
    // Combat properties
    this.currentState = 'idle';
    this.stateTimer = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.comboCount = 0;
    this.damageDealt = 0;
    
    // Frame data tracking
    this.currentMove = null;
    this.frameCount = 0;
    this.cancelWindow = false;
    
    // Input buffer
    this.inputBuffer = [];
    this.lastInput = null;
    
    // Animation state
    this.animationLocked = false;
    
    // Interpolation for smooth rendering
    this.previousX = x;
    this.previousY = y;
    this.renderX = x;
    this.renderY = y;
  }

  createSprite() {
    // Main character sprite
    this.sprite = this.scene.add.sprite(0, 0, `${this.type}-idle`);
    this.sprite.setScale(this.facing, 1);
    this.add(this.sprite);
    
    // Shadow
    this.shadow = this.scene.add.ellipse(0, 0, 60, 20, 0x000000, 0.3);
    this.addAt(this.shadow, 0);
    
    // Evolution effects layer
    if (this.config.evolutionStage && this.config.evolutionStage.level > 1) {
      this.createEvolutionEffects();
    }
  }

  createHitboxes() {
    // Hurtbox (can be hit)
    this.hurtbox = {
      x: -30,
      y: -80,
      width: 60,
      height: 80,
      active: true
    };
    
    // Hitboxes (can hit opponent)
    this.hitboxes = {
      punch: {
        light: { x: 40, y: -60, width: 40, height: 30, damage: 10, active: false },
        medium: { x: 45, y: -60, width: 50, height: 35, damage: 20, active: false },
        heavy: { x: 50, y: -60, width: 60, height: 40, damage: 30, active: false }
      },
      kick: {
        light: { x: 35, y: -40, width: 45, height: 40, damage: 12, active: false },
        medium: { x: 40, y: -45, width: 55, height: 45, damage: 22, active: false },
        heavy: { x: 45, y: -50, width: 65, height: 50, damage: 35, active: false }
      },
      special: {
        x: 0, y: -60, width: 80, height: 60, damage: 50, active: false
      }
    };
    
    // Debug visualization
    if (this.scene.game.globals.showHitboxes) {
      this.createHitboxVisuals();
    }
  }

  createHitboxVisuals() {
    // Hurtbox visual
    this.hurtboxVisual = this.scene.add.rectangle(
      this.hurtbox.x, this.hurtbox.y,
      this.hurtbox.width, this.hurtbox.height,
      0x0000FF, 0.3
    );
    this.hurtboxVisual.setStrokeStyle(2, 0x0000FF);
    this.add(this.hurtboxVisual);
    
    // Hitbox visuals
    this.hitboxVisuals = {};
    Object.entries(this.hitboxes).forEach(([type, data]) => {
      if (type === 'special') {
        this.hitboxVisuals[type] = this.scene.add.rectangle(
          data.x, data.y, data.width, data.height,
          0xFF0000, 0.3
        );
        this.hitboxVisuals[type].setStrokeStyle(2, 0xFF0000);
        this.hitboxVisuals[type].setVisible(false);
        this.add(this.hitboxVisuals[type]);
      } else {
        this.hitboxVisuals[type] = {};
        Object.entries(data).forEach(([strength, box]) => {
          const visual = this.scene.add.rectangle(
            box.x, box.y, box.width, box.height,
            0xFF0000, 0.3
          );
          visual.setStrokeStyle(2, 0xFF0000);
          visual.setVisible(false);
          this.hitboxVisuals[type][strength] = visual;
          this.add(visual);
        });
      }
    });
  }

  setupAnimations() {
    const anims = this.scene.anims;
    const baseKey = this.type;
    
    // Only create animations if they don't exist
    if (!anims.exists(`${baseKey}-idle`)) {
      // Idle
      anims.create({
        key: `${baseKey}-idle`,
        frames: anims.generateFrameNumbers(`${baseKey}-idle`, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
      
      // Walk
      anims.create({
        key: `${baseKey}-walk`,
        frames: anims.generateFrameNumbers(`${baseKey}-walk`, { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
      
      // Jump
      anims.create({
        key: `${baseKey}-jump`,
        frames: anims.generateFrameNumbers(`${baseKey}-walk`, { start: 6, end: 8 }),
        frameRate: 10,
        repeat: 0
      });
      
      // Attacks
      ['light', 'medium', 'heavy'].forEach((strength, index) => {
        anims.create({
          key: `${baseKey}-punch-${strength}`,
          frames: anims.generateFrameNumbers(`${baseKey}-attack`, { 
            start: index * 4, 
            end: index * 4 + 3 
          }),
          frameRate: 15,
          repeat: 0
        });
        
        anims.create({
          key: `${baseKey}-kick-${strength}`,
          frames: anims.generateFrameNumbers(`${baseKey}-attack`, { 
            start: 12 + index * 4, 
            end: 12 + index * 4 + 3 
          }),
          frameRate: 15,
          repeat: 0
        });
      });
      
      // Special moves
      anims.create({
        key: `${baseKey}-special`,
        frames: anims.generateFrameNumbers(`${baseKey}-special`, { start: 0, end: 7 }),
        frameRate: 12,
        repeat: 0
      });
      
      // Hit reaction
      anims.create({
        key: `${baseKey}-hit`,
        frames: anims.generateFrameNumbers(`${baseKey}-hit`, { start: 0, end: 2 }),
        frameRate: 10,
        repeat: 0
      });
      
      // KO
      anims.create({
        key: `${baseKey}-ko`,
        frames: anims.generateFrameNumbers(`${baseKey}-ko`, { start: 0, end: 4 }),
        frameRate: 8,
        repeat: 0
      });
    }
    
    // Start with idle animation
    this.sprite.play(`${baseKey}-idle`);
  }

  setupPhysics() {
    // Add physics body
    this.scene.physics.world.enable(this);
    this.body.setCollideWorldBounds(true);
    this.body.setSize(60, 100);
    this.body.setOffset(-30, -50);
    this.body.setMaxVelocity(300, 600);
    this.body.setDrag(800, 0);
  }

  update(delta) {
    // Update state timer
    this.stateTimer -= delta;
    
    // Update stun timers
    if (this.hitStun > 0) {
      this.hitStun -= delta;
      if (this.hitStun <= 0) {
        this.recoverFromHit();
      }
    }
    
    if (this.blockStun > 0) {
      this.blockStun -= delta;
      if (this.blockStun <= 0) {
        this.recoverFromBlock();
      }
    }
    
    // Update current move
    if (this.currentMove) {
      this.updateMoveFrames();
    }
    
    // Update position for interpolation
    this.previousX = this.x;
    this.previousY = this.y;
    
    // Apply physics
    this.updatePhysics(delta);
    
    // Update facing direction
    this.updateFacing();
    
    // Update shadow position
    this.shadow.y = this.scene.ground - this.y + 5;
  }

  updatePhysics(delta) {
    // Apply gravity if not grounded
    if (!this.grounded) {
      this.body.velocity.y += 1500 * (delta / 1000);
    }
    
    // Check if landed
    if (this.y >= this.scene.ground && this.body.velocity.y > 0) {
      this.y = this.scene.ground;
      this.body.velocity.y = 0;
      this.grounded = true;
      
      if (this.currentState === 'jumping') {
        this.changeState('idle');
      }
    }
    
    // Keep within stage bounds
    this.x = Phaser.Math.Clamp(this.x, this.scene.stageBounds.left, this.scene.stageBounds.right);
  }

  updateFacing() {
    if (this.opponent && !this.animationLocked) {
      const shouldFaceRight = this.x < this.opponent.x;
      this.facing = shouldFaceRight ? 1 : -1;
      this.sprite.scaleX = this.facing;
      
      // Flip hitboxes
      Object.values(this.hitboxes).forEach(hitbox => {
        if (hitbox.x) {
          hitbox.x = Math.abs(hitbox.x) * this.facing;
        }
      });
    }
  }

  updateMoveFrames() {
    this.frameCount++;
    
    const frameData = GameConfig.combat.frameData[this.currentMove];
    if (!frameData) return;
    
    const totalFrames = frameData.startup + frameData.active + frameData.recovery;
    
    // Startup frames
    if (this.frameCount <= frameData.startup) {
      // Preparing attack
    }
    // Active frames
    else if (this.frameCount <= frameData.startup + frameData.active) {
      this.activateHitbox();
      
      // Cancel window
      if (this.frameCount >= frameData.startup + frameData.active - GameConfig.combat.comboCancelWindow) {
        this.cancelWindow = true;
      }
    }
    // Recovery frames
    else if (this.frameCount <= totalFrames) {
      this.deactivateHitbox();
      this.cancelWindow = false;
    }
    // Move complete
    else {
      this.endMove();
    }
  }

  interpolate(alpha) {
    // Smooth position interpolation for 60fps rendering
    this.renderX = this.previousX + (this.x - this.previousX) * alpha;
    this.renderY = this.previousY + (this.y - this.previousY) * alpha;
    
    // Apply to display position
    this.setPosition(this.renderX, this.renderY);
  }

  // Combat actions
  attack(strength, limb) {
    if (this.canAttack()) {
      const moveKey = `${strength}${limb.charAt(0).toUpperCase() + limb.slice(1)}`;
      this.currentMove = moveKey;
      this.frameCount = 0;
      this.changeState('attacking');
      
      // Play animation
      this.sprite.play(`${this.type}-${limb}-${strength}`);
      this.animationLocked = true;
      
      // Play sound
      this.scene.game.soundManager.playSound('whoosh1');
      
      // Add to combo if within cancel window
      if (this.cancelWindow) {
        this.comboCount++;
      } else {
        this.comboCount = 1;
      }
    }
  }

  performSpecialMove(move) {
    if (this.canAttack() && this.superMeter >= 25) {
      this.currentMove = 'special';
      this.frameCount = 0;
      this.changeState('special');
      this.superMeter -= 25;
      
      // Play animation
      this.sprite.play(`${this.type}-special`);
      this.animationLocked = true;
      
      // Special effects
      this.scene.effectsManager.createSpecialMoveEffect(this.x, this.y);
      
      // Play sound
      this.scene.game.soundManager.playSound('special1');
    }
  }

  block(active) {
    if (active && this.canBlock()) {
      this.blocking = true;
      this.changeState('blocking');
      this.body.velocity.x = 0;
    } else {
      this.blocking = false;
      if (this.currentState === 'blocking') {
        this.changeState('idle');
      }
    }
  }

  jump() {
    if (this.grounded && this.canMove()) {
      this.body.velocity.y = -600;
      this.grounded = false;
      this.changeState('jumping');
      this.sprite.play(`${this.type}-jump`);
    }
  }

  crouch(active) {
    if (active && this.grounded && this.canMove()) {
      this.crouching = true;
      this.changeState('crouching');
      this.body.velocity.x = 0;
      // Adjust hurtbox
      this.hurtbox.height = 50;
      this.hurtbox.y = -50;
    } else {
      this.crouching = false;
      if (this.currentState === 'crouching') {
        this.changeState('idle');
        // Reset hurtbox
        this.hurtbox.height = 80;
        this.hurtbox.y = -80;
      }
    }
  }

  move(direction) {
    if (this.canMove()) {
      const speed = this.stats.speed * 2;
      
      if (direction === 'left') {
        this.body.velocity.x = -speed;
      } else if (direction === 'right') {
        this.body.velocity.x = speed;
      }
      
      if (this.grounded && this.currentState === 'idle') {
        this.changeState('walking');
        this.sprite.play(`${this.type}-walk`, true);
      }
    }
  }

  takeDamage(damage, attacker) {
    if (this.blocking) {
      // Blocked damage
      damage = Math.floor(damage * 0.1);
      this.blockStun = GameConfig.combat.frameData[attacker.currentMove]?.blockstun || 100;
      
      // Chip damage
      this.health = Math.max(1, this.health - damage);
      
      // Pushback
      const pushback = GameConfig.combat.pushbackOnBlock;
      this.body.velocity.x = pushback * 10 * -attacker.facing;
      
      // Effects
      this.scene.effectsManager.createBlockEffect(this.x, this.y - 60);
      this.scene.game.soundManager.playSound('block1');
    } else {
      // Full damage
      this.health = Math.max(0, this.health - damage);
      this.hitStun = GameConfig.combat.frameData[attacker.currentMove]?.hitstun || 200;
      
      // Hit reaction
      this.changeState('hit');
      this.sprite.play(`${this.type}-hit`);
      this.animationLocked = true;
      
      // Pushback
      const pushback = GameConfig.combat.pushbackOnHit;
      this.body.velocity.x = pushback * 10 * -attacker.facing;
      
      // Reset combo
      this.comboCount = 0;
      
      // Effects
      this.scene.effectsManager.createHitEffect(this.x, this.y - 60);
      this.scene.game.soundManager.playSound('hit1');
      
      // Build super meter
      attacker.superMeter = Math.min(attacker.maxSuperMeter, attacker.superMeter + damage / 2);
      this.superMeter = Math.min(this.maxSuperMeter, this.superMeter + damage / 4);
    }
    
    // Update damage tracking
    if (attacker.isPlayer) {
      attacker.damageDealt += damage;
    }
  }

  activateHitbox() {
    const [limb, strength] = this.parseMove(this.currentMove);
    if (limb && strength) {
      const hitbox = this.hitboxes[limb][strength];
      hitbox.active = true;
      
      // Show visual if debug mode
      if (this.hitboxVisuals && this.hitboxVisuals[limb]) {
        this.hitboxVisuals[limb][strength].setVisible(true);
      }
    }
  }

  deactivateHitbox() {
    // Deactivate all hitboxes
    Object.values(this.hitboxes).forEach(hitbox => {
      if (typeof hitbox === 'object') {
        Object.values(hitbox).forEach(box => box.active = false);
      } else {
        hitbox.active = false;
      }
    });
    
    // Hide visuals
    if (this.hitboxVisuals) {
      Object.values(this.hitboxVisuals).forEach(visual => {
        if (typeof visual === 'object') {
          Object.values(visual).forEach(v => v.setVisible(false));
        } else {
          visual.setVisible(false);
        }
      });
    }
  }

  parseMove(moveKey) {
    // Parse move key like "lightPunch" -> ["punch", "light"]
    const moves = {
      'lightPunch': ['punch', 'light'],
      'mediumPunch': ['punch', 'medium'],
      'heavyPunch': ['punch', 'heavy'],
      'lightKick': ['kick', 'light'],
      'mediumKick': ['kick', 'medium'],
      'heavyKick': ['kick', 'heavy']
    };
    return moves[moveKey] || [null, null];
  }

  endMove() {
    this.currentMove = null;
    this.frameCount = 0;
    this.cancelWindow = false;
    this.animationLocked = false;
    this.deactivateHitbox();
    
    if (this.currentState === 'attacking' || this.currentState === 'special') {
      this.changeState('idle');
    }
  }

  changeState(newState) {
    this.currentState = newState;
    
    // Play appropriate animation
    if (!this.animationLocked) {
      switch (newState) {
        case 'idle':
          this.sprite.play(`${this.type}-idle`, true);
          break;
        case 'walking':
          this.sprite.play(`${this.type}-walk`, true);
          break;
      }
    }
  }

  recoverFromHit() {
    this.hitStun = 0;
    this.animationLocked = false;
    this.changeState('idle');
  }

  recoverFromBlock() {
    this.blockStun = 0;
    this.blocking = false;
    this.changeState('idle');
  }

  playKO() {
    this.changeState('ko');
    this.sprite.play(`${this.type}-ko`);
    this.animationLocked = true;
    this.body.velocity.x = -200 * this.facing;
    this.body.velocity.y = -300;
    this.grounded = false;
  }

  // State checks
  canMove() {
    return this.hitStun <= 0 && this.blockStun <= 0 && 
           this.currentState !== 'attacking' && this.currentState !== 'special' &&
           this.currentState !== 'ko';
  }

  canAttack() {
    return this.hitStun <= 0 && this.blockStun <= 0 && 
           this.currentState !== 'ko' && 
           (this.currentState !== 'attacking' || this.cancelWindow);
  }

  canBlock() {
    return this.hitStun <= 0 && this.currentState !== 'attacking' && 
           this.currentState !== 'special' && this.currentState !== 'ko';
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.superMeter = 0;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.comboCount = 0;
    this.damageDealt = 0;
    this.currentState = 'idle';
    this.animationLocked = false;
    this.deactivateHitbox();
    this.sprite.play(`${this.type}-idle`);
  }

  applyEvolution(evolutionStage) {
    // Apply stat multipliers
    this.stats.attack *= evolutionStage.powerMultiplier;
    this.stats.speed *= evolutionStage.speedMultiplier;
    
    // Store for visual effects
    this.evolutionStage = evolutionStage;
  }

  createEvolutionEffects() {
    // Add aura effect based on evolution level
    const auraColor = GameConfig.evolution.visualEffects.auraColors[this.evolutionStage.level - 1];
    
    this.aura = this.scene.add.sprite(0, 0, 'evolution-aura');
    this.aura.setTint(Phaser.Display.Color.HexStringToColor(auraColor).color);
    this.aura.setAlpha(0.6);
    this.aura.setScale(1.5);
    this.aura.play('evolution-aura-pulse');
    
    this.addAt(this.aura, 1); // Behind sprite
  }
}