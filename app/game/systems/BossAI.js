/**
 * Boss AI System
 * Advanced AI patterns and behaviors for each boss type
 */

import { GAME_CONFIG } from '../config/GameConfig';

export default class BossAI {
  constructor(boss, scene) {
    this.boss = boss;
    this.scene = scene;
    this.player = scene.player;
    
    // AI state
    this.currentPattern = null;
    this.patternStep = 0;
    this.patternTimer = 0;
    this.phase = 1; // 1 = normal, 2 = aggressive (< 50% health)
    
    // Boss-specific configurations
    this.patterns = this.createPatterns();
    this.currentPatternIndex = 0;
    
    // Decision making
    this.lastDecisionTime = 0;
    this.decisionCooldown = 1000; // ms between decisions
    
    // Projectiles group
    this.projectiles = scene.physics.add.group();
  }
  
  createPatterns() {
    // Define unique patterns for each boss type
    const patterns = {
      sloth_demon: [
        {
          name: 'lazy_combo',
          steps: [
            { action: 'approach', duration: 1000 },
            { action: 'attack', type: 'heavy', duration: 500 },
            { action: 'wait', duration: 1500 }, // Long recovery
            { action: 'attack', type: 'light', duration: 300 },
            { action: 'retreat', duration: 800 },
          ]
        },
        {
          name: 'couch_lock_special',
          steps: [
            { action: 'taunt', message: 'Time to rest...', duration: 1000 },
            { action: 'special', type: 'couch_lock', duration: 1000 },
            { action: 'approach', duration: 2000 }, // Slow approach while player is slowed
          ]
        }
      ],
      
      junk_food_monster: [
        {
          name: 'sugar_rush',
          steps: [
            { action: 'dash', direction: 'towards', duration: 300 },
            { action: 'attack', type: 'light', duration: 200 },
            { action: 'attack', type: 'light', duration: 200 },
            { action: 'attack', type: 'heavy', duration: 400 },
            { action: 'dash', direction: 'away', duration: 300 },
          ]
        },
        {
          name: 'food_throw',
          steps: [
            { action: 'jump_back', duration: 400 },
            { action: 'projectile', type: 'burger', duration: 300 },
            { action: 'projectile', type: 'soda', duration: 300 },
            { action: 'taunt', message: 'Hungry?', duration: 500 },
          ]
        }
      ],
      
      procrastination_phantom: [
        {
          name: 'time_skip',
          steps: [
            { action: 'vanish', duration: 500 },
            { action: 'teleport', position: 'behind', duration: 100 },
            { action: 'appear', duration: 300 },
            { action: 'attack', type: 'heavy', duration: 400 },
          ]
        },
        {
          name: 'delayed_assault',
          steps: [
            { action: 'taunt', message: 'Maybe later...', duration: 800 },
            { action: 'create_clone', duration: 500 },
            { action: 'wait', duration: 1000 },
            { action: 'synchronized_attack', duration: 600 },
          ]
        }
      ],
      
      stress_titan: [
        {
          name: 'overwhelming_pressure',
          steps: [
            { action: 'stomp', duration: 500 }, // Screen shake
            { action: 'approach', duration: 500 },
            { action: 'attack', type: 'heavy', duration: 400 },
            { action: 'grab_attempt', duration: 600 },
          ]
        },
        {
          name: 'anxiety_wave',
          steps: [
            { action: 'charge_up', duration: 1000 },
            { action: 'special', type: 'anxiety_wave', duration: 800 },
            { action: 'projectile', type: 'stress_orb', count: 3, duration: 1000 },
          ]
        }
      ]
    };
    
    return patterns[this.boss.bossId] || patterns.sloth_demon;
  }
  
  update(time, delta) {
    if (!this.boss.aiEnabled || !this.boss.canMove || this.boss.health <= 0) return;
    
    // Check for phase transition
    this.checkPhaseTransition();
    
    // Execute current pattern
    if (this.currentPattern) {
      this.executePattern(time, delta);
    } else {
      // Choose new pattern
      if (time - this.lastDecisionTime > this.decisionCooldown) {
        this.choosePattern();
        this.lastDecisionTime = time;
      } else {
        // Default behavior between patterns
        this.defaultBehavior();
      }
    }
    
    // Update projectiles
    this.updateProjectiles();
  }
  
  checkPhaseTransition() {
    const healthPercent = this.boss.health / this.boss.maxHealth;
    
    if (this.phase === 1 && healthPercent <= 0.5) {
      this.phase = 2;
      this.enterPhase2();
    }
  }
  
  enterPhase2() {
    // Visual indication of phase change
    this.scene.cameras.main.flash(500, 255, 0, 0);
    
    // Increase boss stats
    this.boss.moveSpeed *= 1.3;
    this.boss.attackCooldown *= 0.7;
    this.decisionCooldown *= 0.8;
    
    // Show phase 2 message
    this.showBossMessage('RAGE MODE!', '#E53935');
    
    // Add rage aura effect
    const aura = this.scene.add.circle(this.boss.x, this.boss.y, 50, 0xff0000, 0.3);
    this.scene.tweens.add({
      targets: aura,
      radius: 70,
      alpha: 0.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
    
    // Attach aura to boss
    this.boss.aura = aura;
  }
  
  choosePattern() {
    const patterns = this.phase === 2 ? 
      this.patterns.filter(p => p.name.includes('special') || p.name.includes('wave')) :
      this.patterns;
    
    // Choose pattern based on distance and randomness
    const distance = this.getDistanceToPlayer();
    let pattern;
    
    if (distance < 100 && Math.random() < 0.6) {
      // Close range patterns
      pattern = patterns.find(p => p.name.includes('combo') || p.name.includes('rush')) || patterns[0];
    } else if (distance > 300 && Math.random() < 0.7) {
      // Long range patterns
      pattern = patterns.find(p => p.name.includes('projectile') || p.name.includes('special')) || patterns[0];
    } else {
      // Random pattern
      pattern = patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    this.startPattern(pattern);
  }
  
  startPattern(pattern) {
    this.currentPattern = pattern;
    this.patternStep = 0;
    this.patternTimer = 0;
  }
  
  executePattern(time, delta) {
    if (!this.currentPattern || this.patternStep >= this.currentPattern.steps.length) {
      this.currentPattern = null;
      return;
    }
    
    const step = this.currentPattern.steps[this.patternStep];
    this.patternTimer += delta;
    
    // Execute step action
    this.executeStepAction(step);
    
    // Check if step duration is complete
    if (this.patternTimer >= step.duration) {
      this.patternStep++;
      this.patternTimer = 0;
    }
  }
  
  executeStepAction(step) {
    switch (step.action) {
      case 'approach':
        this.boss.approachTarget();
        break;
        
      case 'retreat':
        this.boss.retreat();
        break;
        
      case 'attack':
        if (this.patternTimer === 0) { // Only execute once per step
          this.boss.performAttack();
        }
        break;
        
      case 'special':
        if (this.patternTimer === 0) {
          this.boss.performSpecialAttack();
        }
        break;
        
      case 'dash':
        this.executeDash(step.direction);
        break;
        
      case 'jump_back':
        if (this.patternTimer === 0) {
          this.boss.setVelocityY(-400);
          this.boss.setVelocityX(this.boss.flipX ? 200 : -200);
        }
        break;
        
      case 'projectile':
        if (this.patternTimer === 0) {
          this.fireProjectile(step.type, step.count || 1);
        }
        break;
        
      case 'taunt':
        if (this.patternTimer === 0) {
          this.showBossMessage(step.message);
        }
        break;
        
      case 'vanish':
        this.boss.setAlpha(0.2);
        break;
        
      case 'appear':
        this.boss.setAlpha(1);
        break;
        
      case 'teleport':
        if (this.patternTimer === 0) {
          this.executeTeleport(step.position);
        }
        break;
        
      case 'stomp':
        if (this.patternTimer === 0) {
          this.scene.cameras.main.shake(200, 0.02);
          this.scene.soundManager.play('hit_heavy');
        }
        break;
        
      case 'charge_up':
        // Visual charging effect
        if (this.patternTimer % 100 < 50) {
          this.boss.setTint(0xffff00);
        } else {
          this.boss.clearTint();
        }
        break;
        
      case 'wait':
        // Just wait
        this.boss.setVelocityX(0);
        break;
    }
  }
  
  executeDash(direction) {
    const speed = this.boss.moveSpeed * 2;
    if (direction === 'towards') {
      this.boss.setVelocityX(this.player.x > this.boss.x ? speed : -speed);
    } else {
      this.boss.setVelocityX(this.player.x > this.boss.x ? -speed : speed);
    }
  }
  
  executeTeleport(position) {
    const offset = 100;
    if (position === 'behind') {
      this.boss.x = this.player.x + (this.player.facingRight ? -offset : offset);
    } else if (position === 'above') {
      this.boss.x = this.player.x;
      this.boss.y = this.player.y - 150;
    }
    
    // Teleport effect
    const effect = this.scene.add.circle(this.boss.x, this.boss.y, 30, 0x9966ff, 0.6);
    this.scene.tweens.add({
      targets: effect,
      radius: 60,
      alpha: 0,
      duration: 500,
      onComplete: () => effect.destroy(),
    });
  }
  
  fireProjectile(type, count = 1) {
    const projectileConfigs = {
      burger: { speed: 300, damage: 10, sprite: '🍔', size: 30 },
      soda: { speed: 400, damage: 8, sprite: '🥤', size: 25 },
      stress_orb: { speed: 250, damage: 15, sprite: '😰', size: 35 },
    };
    
    const config = projectileConfigs[type] || projectileConfigs.burger;
    
    for (let i = 0; i < count; i++) {
      const angle = count > 1 ? -15 + (30 / (count - 1)) * i : 0;
      const projectile = this.createProjectile(config, angle);
      this.projectiles.add(projectile);
    }
  }
  
  createProjectile(config, angle = 0) {
    const x = this.boss.x + (this.boss.flipX ? -50 : 50);
    const y = this.boss.y - 20;
    
    // For now, use a colored circle as projectile
    const projectile = this.scene.physics.add.circle(x, y, config.size / 2, 0xff6666);
    
    // Set velocity
    const radians = Phaser.Math.DegToRad(angle);
    const vx = Math.cos(radians) * config.speed * (this.boss.flipX ? -1 : 1);
    const vy = Math.sin(radians) * config.speed - 100; // Slight upward arc
    
    projectile.setVelocity(vx, vy);
    projectile.body.setGravityY(300);
    projectile.damage = config.damage;
    
    // Add collision with player
    this.scene.physics.add.overlap(projectile, this.player, (proj, player) => {
      if (player.canBeHit() && !player.isBlocking) {
        player.takeDamage(proj.damage);
        proj.destroy();
      } else if (player.isBlocking) {
        // Deflect projectile
        proj.setVelocityX(-proj.body.velocity.x);
        this.scene.soundManager.play('block');
      }
    });
    
    // Destroy after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (projectile.active) projectile.destroy();
    });
    
    return projectile;
  }
  
  showBossMessage(message, color = '#F7D51D') {
    const text = this.scene.add.text(
      this.boss.x,
      this.boss.y - 80,
      message,
      {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: color,
        stroke: '#0D0D0D',
        strokeThickness: 3,
      }
    ).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 20,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }
  
  defaultBehavior() {
    const distance = this.getDistanceToPlayer();
    
    if (distance > 150) {
      this.boss.approachTarget();
    } else if (distance < 80) {
      this.boss.retreat();
    } else {
      this.boss.setVelocityX(0);
    }
  }
  
  getDistanceToPlayer() {
    return Phaser.Math.Distance.Between(
      this.boss.x, this.boss.y,
      this.player.x, this.player.y
    );
  }
  
  updateProjectiles() {
    // Clean up off-screen projectiles
    this.projectiles.children.entries.forEach(projectile => {
      if (projectile.y > this.scene.cameras.main.height + 100) {
        projectile.destroy();
      }
    });
  }
  
  cleanup() {
    this.projectiles.clear(true, true);
    if (this.boss.aura) {
      this.boss.aura.destroy();
    }
  }
}