/**
 * Player Character Class
 * Handles player movement, animations, and combat
 */

import { GAME_CONFIG } from '../config/GameConfig';
import { createCharacterAnimations } from '../config/AnimationConfig';
import UnlockManager from '../systems/UnlockManager';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'sean_fighter');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics
    this.setSize(GAME_CONFIG.player.hitboxWidth, GAME_CONFIG.player.hitboxHeight);
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    
    // Combat properties
    this.health = GAME_CONFIG.player.health;
    this.maxHealth = GAME_CONFIG.player.health;
    this.specialMeter = 0;
    this.isAttacking = false;
    this.isBlocking = false;
    this.isHurt = false;
    this.canMove = true;
    this.facingRight = true;
    this.currentAttackDamage = 0;
    
    // Create hitbox for attacks
    this.hitbox = scene.physics.add.sprite(x, y, null);
    this.hitbox.setSize(0, 0);
    this.hitbox.body.enable = false;
    
    // Stats from player data
    this.stats = {
      strength: 0,
      stamina: 0,
      focus: 0,
    };
    
    // Unlock system
    this.unlockManager = new UnlockManager(scene);
    this.currentSkin = 'default';
    this.currentSpecialMove = 'default_special';
    
    // Ability flags
    this.canDoubleJump = false;
    this.hasDoubleJumped = false;
    this.canAirDash = false;
    this.hasAirDashed = false;
    this.hasRageMode = false;
    this.meterGainMultiplier = 1;
    
    // Set up animations
    this.createAnimations();
  }

  createAnimations() {
    // Create all animations for the player using Sean Fighter sprite
    createCharacterAnimations(this.scene, 'sean_fighter', 'player');
    
    // Play idle animation
    this.play('player_idle');
  }

  async setStats(playerStats) {
    this.stats = {
      strength: playerStats.strength || 0,
      stamina: playerStats.stamina || 0,
      focus: playerStats.focus || 0,
    };
    
    // Apply stat bonuses
    this.maxHealth = GAME_CONFIG.player.health + (this.stats.stamina * 2);
    this.health = this.maxHealth;
    
    // Load unlocks and customization
    await this.loadCustomization(playerStats.playerId);
  }
  
  async loadCustomization(playerId) {
    // Load unlocked content
    await this.unlockManager.loadUnlockedContent(playerId);
    
    // Load saved customization
    const customization = this.scene.registry.get('playerCustomization');
    if (customization) {
      this.currentSkin = customization.skin || 'default';
      this.currentSpecialMove = customization.specialMove || 'default_special';
    }
    
    // Apply skin
    this.unlockManager.applySkin(this, this.currentSkin);
    
    // Apply ability effects
    this.unlockManager.applyAbilityEffects(this);
  }

  moveLeft() {
    if (!this.canMove || this.isAttacking || this.isBlocking) return;
    
    this.setVelocityX(-GAME_CONFIG.playerSpeed);
    this.facingRight = false;
    this.setFlipX(true);
    
    if (this.body.onFloor()) {
      this.play('player_walk', true);
    }
  }

  moveRight() {
    if (!this.canMove || this.isAttacking || this.isBlocking) return;
    
    this.setVelocityX(GAME_CONFIG.playerSpeed);
    this.facingRight = true;
    this.setFlipX(false);
    
    if (this.body.onFloor()) {
      this.play('player_walk', true);
    }
  }

  stopMoving() {
    if (this.isAttacking || this.isBlocking) return;
    
    this.setVelocityX(0);
    
    if (this.body.onFloor() && !this.isHurt) {
      this.play('player_idle', true);
    }
  }

  jump() {
    if (!this.canMove) return;
    
    // Normal jump
    if (this.body.onFloor()) {
      this.setVelocityY(GAME_CONFIG.jumpVelocity);
      this.play('player_jump');
      this.hasDoubleJumped = false;
      this.hasAirDashed = false;
      
      // Jump effect
      if (this.scene.effects) {
        this.scene.effects.playJumpEffect(this.x, this.y);
      }
    }
    // Double jump
    else if (this.canDoubleJump && !this.hasDoubleJumped) {
      this.setVelocityY(GAME_CONFIG.jumpVelocity * 0.8);
      this.play('player_jump');
      this.hasDoubleJumped = true;
      
      // Double jump effect
      if (this.scene.effects) {
        this.scene.effects.playDoubleJumpEffect(this.x, this.y);
      }
      
      // Sound
      if (this.scene.audioManager) {
        this.scene.audioManager.playSound('double_jump');
      }
    }
  }
  
  airDash() {
    if (!this.canAirDash || this.hasAirDashed || this.body.onFloor()) return;
    
    this.hasAirDashed = true;
    const dashSpeed = this.facingRight ? 400 : -400;
    this.setVelocityX(dashSpeed);
    this.setVelocityY(0);
    
    // Dash effect
    if (this.scene.effects) {
      this.scene.effects.playDashEffect(this.x, this.y, this.facingRight);
    }
    
    // Sound
    if (this.scene.audioManager) {
      this.scene.audioManager.playSound('air_dash');
    }
    
    // Reset velocity after dash
    this.scene.time.delayedCall(200, () => {
      this.setVelocityX(this.facingRight ? GAME_CONFIG.playerSpeed : -GAME_CONFIG.playerSpeed);
    });
  }

  attack(type = 'light') {
    if (this.isAttacking || this.isBlocking || this.isHurt) return;
    
    this.isAttacking = true;
    this.setVelocityX(0);
    
    // Set attack damage
    if (type === 'light') {
      this.currentAttackDamage = GAME_CONFIG.combat.lightAttackDamage;
      this.play('player_attack_light');
    } else {
      this.currentAttackDamage = GAME_CONFIG.combat.heavyAttackDamage;
      this.play('player_attack_heavy');
    }
    
    // Enable hitbox
    const hitboxData = {
      light: { width: 80, height: 40, offsetX: 40 },
      heavy: { width: 100, height: 60, offsetX: 50 },
    };
    
    const data = hitboxData[type];
    const offsetX = this.facingRight ? data.offsetX : -data.offsetX;
    
    this.hitbox.body.setSize(data.width, data.height);
    this.hitbox.setPosition(this.x + offsetX, this.y);
    this.hitbox.body.enable = true;
    
    // Disable hitbox after attack
    this.scene.time.delayedCall(type === 'light' ? 300 : 500, () => {
      this.isAttacking = false;
      this.hitbox.body.enable = false;
      
      if (this.body.velocity.x === 0) {
        this.play('player_idle', true);
      }
    });
  }

  specialAttack() {
    const specialMove = this.unlockManager.getSpecialMove(this.currentSpecialMove);
    if (!specialMove || this.isAttacking || this.specialMeter < specialMove.meterCost) return;
    
    this.isAttacking = true;
    this.specialMeter -= specialMove.meterCost;
    this.setVelocityX(0);
    
    // Handle different special move types
    if (specialMove.damage === 'counter') {
      // Counter move - enter counter stance
      this.enterCounterStance(specialMove);
    } else if (specialMove.hits) {
      // Multi-hit move
      this.performMultiHitSpecial(specialMove);
    } else {
      // Standard special move
      this.performStandardSpecial(specialMove);
    }
  }
  
  performStandardSpecial(specialMove) {
    this.currentAttackDamage = specialMove.damage;
    this.play(specialMove.animation || 'player_attack_heavy');
    
    // Apply effects
    specialMove.effects.forEach(effect => {
      if (this.scene.effects) {
        switch (effect) {
          case 'screen_shake':
            this.scene.cameras.main.shake(300, 0.02);
            break;
          case 'impact_burst':
            this.scene.effects.playPowerUpEffect(this, 1000);
            break;
          case 'screen_flash':
            this.scene.cameras.main.flash(200, 255, 255, 0);
            break;
          case 'ultimate_aura':
            this.scene.effects.playUltimateAura(this);
            break;
        }
      }
    });
    
    // Large hitbox for special
    const offsetX = this.facingRight ? 60 : -60;
    this.hitbox.body.setSize(120, 80);
    this.hitbox.setPosition(this.x + offsetX, this.y);
    this.hitbox.body.enable = true;
    
    // Disable after animation
    this.scene.time.delayedCall(800, () => {
      this.isAttacking = false;
      this.hitbox.body.enable = false;
      this.play('player_idle', true);
    });
  }
  
  performMultiHitSpecial(specialMove) {
    const hitDelay = 200;
    let currentHit = 0;
    
    const performHit = () => {
      if (currentHit >= specialMove.hits) {
        this.isAttacking = false;
        this.play('player_idle', true);
        return;
      }
      
      this.currentAttackDamage = specialMove.damage;
      this.play(specialMove.animation || 'player_attack_light');
      
      // Enable hitbox
      const offsetX = this.facingRight ? 50 : -50;
      this.hitbox.body.setSize(100, 60);
      this.hitbox.setPosition(this.x + offsetX, this.y);
      this.hitbox.body.enable = true;
      
      // Apply effects for first hit
      if (currentHit === 0 && specialMove.effects.includes('wind_effect')) {
        this.scene.effects.playWindEffect(this.x, this.y);
      }
      
      // Disable hitbox and continue
      this.scene.time.delayedCall(100, () => {
        this.hitbox.body.enable = false;
        currentHit++;
        
        if (currentHit < specialMove.hits) {
          this.scene.time.delayedCall(hitDelay - 100, performHit);
        } else {
          this.scene.time.delayedCall(300, () => {
            this.isAttacking = false;
            this.play('player_idle', true);
          });
        }
      });
    };
    
    performHit();
  }
  
  enterCounterStance(specialMove) {
    this.isCountering = true;
    this.play(specialMove.animation || 'player_block');
    
    // Time slow effect
    if (specialMove.effects.includes('time_slow')) {
      this.scene.time.timeScale = 0.5;
    }
    
    // Counter window
    this.scene.time.delayedCall(1000, () => {
      this.isCountering = false;
      this.isAttacking = false;
      this.scene.time.timeScale = 1;
      this.play('player_idle', true);
    });
  }

  block() {
    if (this.isAttacking || this.isHurt) return;
    
    this.isBlocking = true;
    this.setVelocityX(0);
    this.play('player_block');
  }

  stopBlocking() {
    this.isBlocking = false;
    this.play('player_idle', true);
  }

  takeDamage(damage) {
    if (this.isHurt) return;
    
    // Counter attack check
    if (this.isCountering) {
      this.performCounterAttack();
      return;
    }
    
    // Apply rage mode damage reduction if health is low
    let finalDamage = damage;
    if (this.hasRageMode && this.health < this.maxHealth * 0.3) {
      finalDamage = Math.floor(damage * 0.8);
    }
    
    this.health -= finalDamage;
    this.isHurt = true;
    this.isAttacking = false;
    this.isBlocking = false;
    
    // Knockback
    const knockbackX = this.facingRight ? -200 : 200;
    this.setVelocity(knockbackX, -100);
    
    // Play hurt animation
    this.play('player_hurt');
    this.setTint(0xff0000);
    
    // Recovery
    this.scene.time.delayedCall(GAME_CONFIG.combat.hitStunDuration, () => {
      this.isHurt = false;
      this.clearTint();
      if (this.health > 0) {
        this.play('player_idle', true);
      }
    });
  }
  
  performCounterAttack() {
    // Cancel counter stance
    this.isCountering = false;
    this.scene.time.timeScale = 1;
    
    // Counter attack
    this.currentAttackDamage = this.stats.strength * 2; // Double damage
    this.play('player_attack_heavy');
    
    // Flash effect
    if (this.scene.effects) {
      this.scene.effects.playCounterFlash(this.x, this.y);
    }
    
    // Enable large hitbox
    const offsetX = this.facingRight ? 80 : -80;
    this.hitbox.body.setSize(140, 80);
    this.hitbox.setPosition(this.x + offsetX, this.y);
    this.hitbox.body.enable = true;
    
    // Sound
    if (this.scene.audioManager) {
      this.scene.audioManager.playSound('counter_success');
    }
    
    // Disable after hit
    this.scene.time.delayedCall(400, () => {
      this.isAttacking = false;
      this.hitbox.body.enable = false;
      this.play('player_idle', true);
    });
  }

  addSpecialMeter(amount) {
    // Apply meter gain multiplier from abilities
    const finalAmount = amount * this.meterGainMultiplier;
    
    this.specialMeter = Math.min(
      this.specialMeter + finalAmount,
      GAME_CONFIG.combat.specialMeterMax
    );
  }

  canAct() {
    return !this.isHurt && this.canMove;
  }

  canBeHit() {
    return !this.isHurt;
  }

  freeze() {
    this.canMove = false;
    this.setVelocity(0, 0);
  }

  unfreeze() {
    this.canMove = true;
  }

  victory() {
    this.canMove = false;
    this.setVelocity(0, 0);
    this.play('player_victory', true);
  }

  defeat() {
    this.canMove = false;
    this.setVelocity(0, 0);
    this.play('player_hurt', true);
  }

  update() {
    // Update hitbox position to follow player
    if (this.hitbox && !this.hitbox.body.enable) {
      this.hitbox.setPosition(this.x, this.y);
    }
    
    // Check if on ground and not moving
    if (this.body.onFloor() && Math.abs(this.body.velocity.x) < 10 && !this.isAttacking && !this.isBlocking && !this.isHurt) {
      this.play('player_idle', true);
    }
    
    // Play fall animation when in air
    if (!this.body.onFloor() && this.body.velocity.y > 0 && !this.isAttacking) {
      this.play('player_fall', true);
    }
    
    // Landing effect
    if (this.wasInAir && this.body.onFloor()) {
      const fallSpeed = this.lastVelocityY / 300; // Normalize fall speed
      
      if (this.scene.effects) {
        this.scene.effects.playLandingEffect(this.x, this.y + 30, fallSpeed);
      }
      
      // Play landing sound
      if (this.scene.audioManager && fallSpeed > 0.5) {
        const soundType = fallSpeed > 1.5 ? 'land_hard' : 'land_soft';
        this.scene.audioManager.playSound(soundType, { x: this.x, y: this.y });
      }
    }
    
    // Track air state
    this.wasInAir = !this.body.onFloor();
    this.lastVelocityY = this.body.velocity.y;
  }
}