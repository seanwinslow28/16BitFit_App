/**
 * Fighter Entity
 * Represents a playable character or boss with all combat properties
 */

export class Fighter extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config) {
    super(scene, x, y);
    
    this.scene = scene;
    this.config = config;
    
    // Core properties
    this.player = config.player || 'p1'; // p1 or p2
    this.characterId = config.characterId;
    this.isAI = config.isAI || false;
    
    // Combat stats
    this.maxHealth = config.maxHealth || 100;
    this.health = this.maxHealth;
    this.attack = config.attack || 1.0;
    this.defense = config.defense || 0;
    this.speed = config.speed || 1.0;
    
    // State management
    this.state = 'idle';
    this.facing = config.facing || 'right';
    this.grounded = true;
    this.airborne = false;
    this.crouching = false;
    this.blocking = false;
    
    // Combat state
    this.currentMove = null;
    this.moveFrame = 0;
    this.invincibleFrames = 0;
    this.armorFrames = 0;
    this.juggleCount = 0;
    this.comboCounts = 0;
    
    // Physics properties
    this.velocity = { x: 0, y: 0 };
    this.gravity = 0.8;
    this.friction = 0.85;
    this.maxVelocity = { x: 10 * this.speed, y: 20 };
    
    // Visual components
    this.createVisuals();
    
    // Hitbox/Hurtbox
    this.hurtbox = this.createHurtbox();
    this.hitboxes = [];
    
    // Animation state
    this.animationLocked = false;
    
    // Input buffer for move execution
    this.inputBuffer = [];
    this.bufferWindow = 10; // frames
    
    // Add to scene
    scene.add.existing(this);
  }

  createVisuals() {
    // Main sprite
    this.sprite = this.scene.add.sprite(0, 0, this.config.texture);
    this.add(this.sprite);
    
    // Shadow
    this.shadow = this.scene.add.ellipse(0, 80, 80, 20, 0x000000, 0.3);
    this.add(this.shadow);
    this.sendToBack(this.shadow);
    
    // Debug hitbox visualization (dev only)
    if (this.scene.game.config.physics.arcade?.debug) {
      this.debugGraphics = this.scene.add.graphics();
      this.add(this.debugGraphics);
    }
    
    // Set up animations if they exist
    this.setupAnimations();
  }

  setupAnimations() {
    const anims = [
      'idle', 'walk_forward', 'walk_back', 'crouch', 'jump',
      'LP', 'MP', 'HP', 'LK', 'MK', 'HK',
      'block_stand', 'block_crouch', 'hit_stand', 'hit_crouch',
      'knockdown', 'getup', 'victory', 'defeat'
    ];
    
    // Create animations if they don't exist
    anims.forEach(animName => {
      const key = `${this.config.texture}_${animName}`;
      if (!this.scene.anims.exists(key)) {
        // Placeholder - actual frame data would come from sprite sheets
        this.scene.anims.create({
          key: key,
          frames: this.scene.anims.generateFrameNumbers(this.config.texture, {
            start: 0,
            end: 3
          }),
          frameRate: 10,
          repeat: animName === 'idle' || animName.includes('walk') ? -1 : 0
        });
      }
    });
  }

  createHurtbox() {
    const hurtbox = {
      x: 0,
      y: 0,
      width: 80,
      height: 150,
      active: true
    };
    
    return hurtbox;
  }

  update(delta) {
    // Update physics
    this.updatePhysics(delta);
    
    // Update combat state
    this.updateCombatState(delta);
    
    // Update animation
    this.updateAnimation();
    
    // Update visual effects
    this.updateVisuals();
    
    // Clear expired hitboxes
    this.updateHitboxes(delta);
  }

  updatePhysics(delta) {
    // Apply gravity if airborne
    if (!this.grounded) {
      this.velocity.y += this.gravity;
      this.velocity.y = Math.min(this.velocity.y, this.maxVelocity.y);
    }
    
    // Apply friction
    if (this.grounded && this.state !== 'hitstun' && this.state !== 'blockstun') {
      this.velocity.x *= this.friction;
    }
    
    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // Ground detection
    if (this.y >= this.config.groundY) {
      this.y = this.config.groundY;
      this.velocity.y = 0;
      this.grounded = true;
      this.airborne = false;
      this.juggleCount = 0;
    } else {
      this.grounded = false;
      this.airborne = true;
    }
    
    // Stage boundaries
    this.x = Phaser.Math.Clamp(this.x, 100, 1820);
  }

  updateCombatState(delta) {
    // Update move execution
    if (this.currentMove) {
      this.moveFrame++;
      
      const moveData = this.scene.combatSystem.frameData.get(this.currentMove);
      if (moveData) {
        const totalFrames = moveData.startup + moveData.active + moveData.recovery;
        
        if (this.moveFrame >= totalFrames) {
          this.endMove();
        }
      }
    }
    
    // Update invincibility
    if (this.invincibleFrames > 0) {
      this.invincibleFrames--;
    }
    
    // Update armor
    if (this.armorFrames > 0) {
      this.armorFrames--;
    }
    
    // Update stun
    const stunTimer = this.scene.combatSystem.stunTimers[this.player];
    if (stunTimer > 0) {
      this.state = this.blocking ? 'blockstun' : 'hitstun';
    } else if (this.state === 'hitstun' || this.state === 'blockstun') {
      this.state = 'idle';
    }
  }

  updateAnimation() {
    if (this.animationLocked) return;
    
    let animKey = '';
    const prefix = this.config.texture;
    
    // Determine animation based on state
    switch (this.state) {
      case 'idle':
        animKey = this.crouching ? 'crouch' : 'idle';
        break;
      case 'walking':
        animKey = this.velocity.x * (this.facing === 'right' ? 1 : -1) > 0 ? 
          'walk_forward' : 'walk_back';
        break;
      case 'jumping':
        animKey = 'jump';
        break;
      case 'attacking':
        animKey = this.currentMove || 'LP';
        break;
      case 'blocking':
        animKey = this.crouching ? 'block_crouch' : 'block_stand';
        break;
      case 'hitstun':
        animKey = this.crouching ? 'hit_crouch' : 'hit_stand';
        break;
      case 'blockstun':
        animKey = this.crouching ? 'block_crouch' : 'block_stand';
        break;
      case 'knockdown':
        animKey = 'knockdown';
        break;
    }
    
    const fullKey = `${prefix}_${animKey}`;
    if (this.scene.anims.exists(fullKey) && this.sprite.anims.currentAnim?.key !== fullKey) {
      this.sprite.play(fullKey);
    }
  }

  updateVisuals() {
    // Update sprite flip
    this.sprite.setFlipX(this.facing === 'left');
    
    // Update shadow
    this.shadow.y = this.config.groundY - this.y + 80;
    this.shadow.scaleX = 1 - (Math.abs(this.y - this.config.groundY) / 200);
    this.shadow.alpha = 0.3 * this.shadow.scaleX;
    
    // Flash on hit
    if (this.state === 'hitstun') {
      this.sprite.setTint(0xff6666);
    } else if (this.invincibleFrames > 0) {
      // Flashing invincibility
      this.sprite.setAlpha(Math.sin(this.invincibleFrames * 0.5) > 0 ? 1 : 0.5);
    } else {
      this.sprite.clearTint();
      this.sprite.setAlpha(1);
    }
    
    // Debug draw
    if (this.debugGraphics) {
      this.drawDebugInfo();
    }
  }

  updateHitboxes(delta) {
    this.hitboxes = this.hitboxes.filter(hitbox => {
      hitbox.lifetime--;
      return hitbox.lifetime > 0;
    });
  }

  drawDebugInfo() {
    this.debugGraphics.clear();
    
    // Draw hurtbox
    if (this.hurtbox.active) {
      this.debugGraphics.lineStyle(2, 0x00ff00);
      this.debugGraphics.strokeRect(
        this.hurtbox.x - this.hurtbox.width / 2,
        this.hurtbox.y - this.hurtbox.height / 2,
        this.hurtbox.width,
        this.hurtbox.height
      );
    }
    
    // Draw hitboxes
    this.hitboxes.forEach(hitbox => {
      this.debugGraphics.lineStyle(2, 0xff0000);
      this.debugGraphics.strokeRect(
        hitbox.x - hitbox.width / 2,
        hitbox.y - hitbox.height / 2,
        hitbox.width,
        hitbox.height
      );
    });
  }

  // Input handling
  handleInput(input) {
    // Add to buffer
    this.inputBuffer.push({
      input: input,
      frame: this.scene.game.loop.frame
    });
    
    // Trim old inputs
    const currentFrame = this.scene.game.loop.frame;
    this.inputBuffer = this.inputBuffer.filter(
      entry => currentFrame - entry.frame <= this.bufferWindow
    );
    
    // Process input through combat system
    const processedMove = this.scene.combatSystem.processInput(this.player, input);
    
    // Execute move if valid
    if (this.canPerformMove(processedMove)) {
      this.performMove(processedMove);
    }
  }

  canPerformMove(move) {
    // Can't move during hitstun/blockstun
    if (this.state === 'hitstun' || this.state === 'blockstun') {
      return false;
    }
    
    // Check if current move can be canceled
    if (this.currentMove) {
      const canCancel = this.scene.combatSystem.canCancel(
        this.currentMove, 
        move, 
        this.player
      );
      
      if (!canCancel) return false;
    }
    
    // Check move-specific requirements
    const moveData = this.scene.combatSystem.frameData.get(move);
    if (moveData) {
      // Check meter requirement
      if (moveData.meterCost && this.scene.combatSystem.superMeters[this.player] < moveData.meterCost) {
        return false;
      }
      
      // Check if grounded/airborne requirement
      if (moveData.requiresGrounded && !this.grounded) return false;
      if (moveData.requiresAirborne && !this.airborne) return false;
    }
    
    return true;
  }

  performMove(move) {
    this.currentMove = move;
    this.moveFrame = 0;
    this.state = 'attacking';
    this.animationLocked = true;
    
    const moveData = this.scene.combatSystem.frameData.get(move);
    if (!moveData) return;
    
    // Handle special properties
    if (moveData.invincible) {
      this.invincibleFrames = moveData.invincible.end - moveData.invincible.start;
    }
    
    // Create hitbox after startup frames
    this.scene.time.delayedCall(moveData.startup * 16.67, () => {
      if (this.currentMove === move) {
        this.createHitbox(move);
      }
    });
    
    // Handle projectiles
    if (moveData.projectile) {
      this.scene.time.delayedCall(moveData.startup * 16.67, () => {
        this.createProjectile(move);
      });
    }
  }

  createHitbox(move) {
    const hitbox = this.scene.combatSystem.createHitbox(this, move, this.facing);
    if (hitbox) {
      hitbox.lifetime = hitbox.moveData.active;
      this.hitboxes.push(hitbox);
    }
  }

  createProjectile(move) {
    // Projectile creation would be handled by the scene
    this.scene.events.emit('createProjectile', {
      owner: this,
      move: move,
      x: this.x + (this.facing === 'right' ? 50 : -50),
      y: this.y - 20
    });
  }

  endMove() {
    this.currentMove = null;
    this.moveFrame = 0;
    this.state = 'idle';
    this.animationLocked = false;
  }

  // Movement commands
  walk(direction) {
    if (this.state === 'hitstun' || this.state === 'blockstun') return;
    
    this.velocity.x = direction * this.maxVelocity.x;
    this.state = 'walking';
    
    // Update facing
    if (direction > 0) {
      this.facing = 'right';
    } else if (direction < 0) {
      this.facing = 'left';
    }
  }

  jump() {
    if (!this.grounded || this.state === 'hitstun' || this.state === 'blockstun') return;
    
    this.velocity.y = -15;
    this.state = 'jumping';
    this.grounded = false;
  }

  crouch(active) {
    if (this.airborne || this.state === 'hitstun' || this.state === 'blockstun') return;
    
    this.crouching = active;
    
    // Update hurtbox
    if (active) {
      this.hurtbox.height = 100;
      this.hurtbox.y = 25;
    } else {
      this.hurtbox.height = 150;
      this.hurtbox.y = 0;
    }
  }

  block(active) {
    if (this.state === 'hitstun') return;
    
    this.blocking = active;
    
    if (active) {
      this.state = 'blocking';
      this.velocity.x *= 0.5; // Reduce movement while blocking
    } else if (this.state === 'blocking') {
      this.state = 'idle';
    }
  }

  // Take damage
  takeDamage(damage, hitResult) {
    this.health = Math.max(0, this.health - damage);
    
    // Trigger hit effects
    this.scene.events.emit('fighterHit', {
      fighter: this,
      damage: damage,
      hitResult: hitResult
    });
    
    // Check for KO
    if (this.health <= 0) {
      this.onDefeat();
    }
  }

  onDefeat() {
    this.state = 'defeat';
    this.animationLocked = true;
    this.sprite.play(`${this.config.texture}_defeat`);
    
    this.scene.events.emit('fighterDefeated', {
      fighter: this
    });
  }

  // Get current hurtbox with position
  getHurtbox() {
    if (!this.hurtbox.active) return null;
    
    return {
      x: this.x + this.hurtbox.x,
      y: this.y + this.hurtbox.y,
      width: this.hurtbox.width,
      height: this.hurtbox.height,
      owner: this
    };
  }

  // Get all active hitboxes
  getHitboxes() {
    return this.hitboxes.map(hitbox => ({
      ...hitbox,
      x: this.x + (this.facing === 'right' ? hitbox.x : -hitbox.x),
      y: this.y + hitbox.y,
      attacker: this
    }));
  }

  reset() {
    this.health = this.maxHealth;
    this.state = 'idle';
    this.velocity = { x: 0, y: 0 };
    this.grounded = true;
    this.airborne = false;
    this.crouching = false;
    this.blocking = false;
    this.currentMove = null;
    this.moveFrame = 0;
    this.invincibleFrames = 0;
    this.armorFrames = 0;
    this.juggleCount = 0;
    this.hitboxes = [];
    this.inputBuffer = [];
    this.animationLocked = false;
  }
}