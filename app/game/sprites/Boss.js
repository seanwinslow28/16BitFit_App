/**
 * Boss Character Class
 * Enemy AI and combat behavior
 */

import { GAME_CONFIG } from '../config/GameConfig';
import { createCharacterAnimations, BOSS_SPRITES } from '../config/AnimationConfig';
import BossAI from '../systems/BossAI';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, bossData) {
    // Map boss type to sprite sheet
    const spriteKey = BOSS_SPRITES[bossData.id] || 'rookie_ryu';
    super(scene, x, y, spriteKey);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Boss data
    this.bossId = bossData.id;
    this.spriteKey = spriteKey;
    this.bossName = bossData.name;
    this.maxHealth = bossData.health;
    this.health = bossData.health;
    this.attackPower = bossData.attackPower;
    this.defense = bossData.defense;
    this.moveSpeed = bossData.moveSpeed;
    this.attackCooldown = bossData.attackCooldown;
    this.specialCooldown = bossData.specialCooldown;
    
    // Set up physics
    this.setSize(40, 60);
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    
    // Combat properties
    this.isAttacking = false;
    this.isHurt = false;
    this.canMove = true;
    this.lastAttackTime = 0;
    this.lastSpecialTime = 0;
    this.target = null;
    
    // Create hitbox for attacks
    this.hitbox = scene.physics.add.sprite(x, y, null);
    this.hitbox.setSize(0, 0);
    this.hitbox.body.enable = false;
    
    // AI system
    this.ai = null;
    this.aiEnabled = false;
    
    // Face left (towards player)
    this.setFlipX(true);
    
    // Create animations
    this.createAnimations();
  }
  
  createAnimations() {
    // Create all animations for this boss type
    createCharacterAnimations(this.scene, this.spriteKey, `boss_${this.bossId}`);
    
    // Play idle animation
    this.play(`boss_${this.bossId}_idle`);
  }

  startAI() {
    this.aiEnabled = true;
    this.target = this.scene.player;
    
    // Create AI system
    if (!this.ai) {
      this.ai = new BossAI(this, this.scene);
    }
  }

  // This method is now handled by BossAI system

  approachTarget() {
    if (!this.target || this.isAttacking) return;
    
    // Move towards player
    if (this.target.x < this.x) {
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true);
    } else {
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
    }
    
    if (this.body.onFloor()) {
      this.play(`boss_${this.bossId}_walk`, true);
    }
  }

  retreat() {
    if (!this.target || this.isAttacking) return;
    
    // Move away from player
    if (this.target.x < this.x) {
      this.setVelocityX(this.moveSpeed * 0.7);
      this.setFlipX(true);
    } else {
      this.setVelocityX(-this.moveSpeed * 0.7);
      this.setFlipX(false);
    }
    
    if (this.body.onFloor()) {
      this.play(`boss_${this.bossId}_walk`, true);
    }
  }

  performAttack() {
    if (this.isAttacking || !this.canMove) return;
    
    this.isAttacking = true;
    this.setVelocityX(0);
    this.lastAttackTime = this.scene.time.now;
    
    // Play attack animation
    this.play(`boss_${this.bossId}_attack`);
    
    // Enable hitbox
    const offsetX = this.flipX ? -50 : 50;
    this.hitbox.body.setSize(80, 60);
    this.hitbox.setPosition(this.x + offsetX, this.y);
    this.hitbox.body.enable = true;
    
    // Disable after attack
    this.scene.time.delayedCall(400, () => {
      this.isAttacking = false;
      this.hitbox.body.enable = false;
      if (this.body.velocity.x === 0) {
        this.play(`boss_${this.bossId}_idle`, true);
      }
    });
  }

  performSpecialAttack() {
    if (this.isAttacking || !this.canMove) return;
    
    this.isAttacking = true;
    this.setVelocityX(0);
    this.lastSpecialTime = this.scene.time.now;
    
    // Special attack based on boss type
    switch (this.bossId) {
      case 'sloth_demon':
        this.couchLockAttack();
        break;
      case 'junk_food_monster':
        this.sugarRushAttack();
        break;
      case 'procrastination_phantom':
        this.timeWarpAttack();
        break;
      case 'stress_titan':
        this.anxietyWaveAttack();
        break;
    }
  }

  couchLockAttack() {
    // Sloth Demon special - slow player movement
    this.play(`boss_${this.bossId}_special`);
    
    if (this.target) {
      // Temporarily reduce player speed
      const originalSpeed = GAME_CONFIG.playerSpeed;
      GAME_CONFIG.playerSpeed *= 0.5;
      
      this.scene.time.delayedCall(3000, () => {
        GAME_CONFIG.playerSpeed = originalSpeed;
      });
    }
    
    this.scene.time.delayedCall(500, () => {
      this.isAttacking = false;
      this.play(`boss_${this.bossId}_idle`, true);
    });
  }

  sugarRushAttack() {
    // Junk Food Monster - rapid attacks
    this.play(`boss_${this.bossId}_special`);
    
    let attackCount = 0;
    const rapidAttack = this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        this.performAttack();
        attackCount++;
        if (attackCount >= 3) {
          rapidAttack.remove();
        }
      },
      repeat: 2,
    });
  }

  timeWarpAttack() {
    // Procrastination Phantom - teleport
    this.play(`boss_${this.bossId}_special`);
    
    // Teleport behind player
    if (this.target) {
      const newX = this.target.x + (this.target.flipX ? 100 : -100);
      this.x = Phaser.Math.Clamp(newX, 100, this.scene.cameras.main.width - 100);
    }
    
    this.scene.time.delayedCall(300, () => {
      this.isAttacking = false;
      this.play(`boss_${this.bossId}_idle`, true);
    });
  }

  anxietyWaveAttack() {
    // Stress Titan - screen-wide attack
    this.play(`boss_${this.bossId}_special`);
    
    // Create shockwave effect
    const shockwave = this.scene.add.circle(this.x, this.y, 50, 0xff00ff, 0.5);
    
    this.scene.tweens.add({
      targets: shockwave,
      radius: 400,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => shockwave.destroy(),
    });
    
    // Damage player if in range
    this.scene.time.delayedCall(500, () => {
      if (this.target && Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 300) {
        this.target.takeDamage(this.attackPower * 0.5);
      }
      
      this.isAttacking = false;
      this.play(`boss_${this.bossId}_idle`, true);
    });
  }

  takeDamage(damage) {
    if (this.isHurt) return;
    
    this.health -= damage;
    this.isHurt = true;
    this.isAttacking = false;
    
    // Knockback
    const knockbackX = this.x > this.scene.player.x ? 100 : -100;
    this.setVelocity(knockbackX, -50);
    
    // Play hurt animation
    this.play(`boss_${this.bossId}_hurt`);
    this.setTint(0xff0000);
    
    // Recovery
    this.scene.time.delayedCall(300, () => {
      this.isHurt = false;
      this.clearTint();
      if (this.health > 0) {
        this.play(`boss_${this.bossId}_idle`, true);
      }
    });
  }

  canBeHit() {
    return !this.isHurt;
  }

  freeze() {
    this.canMove = false;
    this.aiEnabled = false;
    this.setVelocity(0, 0);
  }

  unfreeze() {
    this.canMove = true;
    this.aiEnabled = true;
  }

  victory() {
    this.canMove = false;
    this.aiEnabled = false;
    this.setVelocity(0, 0);
    this.play(`boss_${this.bossId}_victory`, true);
  }

  defeat() {
    this.canMove = false;
    this.aiEnabled = false;
    this.setVelocity(0, 0);
    this.play(`boss_${this.bossId}_defeat`, true);
    
    // Cleanup AI
    if (this.ai) {
      this.ai.cleanup();
    }
  }

  update(time, delta) {
    // Update AI
    if (this.ai && this.aiEnabled) {
      this.ai.update(time, delta);
    }
    
    // Update hitbox position
    if (this.hitbox && !this.hitbox.body.enable) {
      this.hitbox.setPosition(this.x, this.y);
    }
    
    // Update aura position if in phase 2
    if (this.aura) {
      this.aura.setPosition(this.x, this.y);
    }
    
    // Update animations based on state
    if (this.body.onFloor() && Math.abs(this.body.velocity.x) < 10 && !this.isAttacking && !this.isHurt) {
      this.play(`boss_${this.bossId}_idle`, true);
    }
  }
}