/**
 * Battle Scene - Main fighting game scene
 */

import { bridge } from '../bridge/WebViewBridge';
import { AssetManager } from '../systems/AssetManager';
import { CombatSystem } from '../systems/CombatSystem';
import { BossAI } from '../systems/BossAI';
import { Fighter } from '../entities/Fighter';
import { TouchControls } from '../ui/TouchControls';

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    
    // Systems
    this.assetManager = null;
    this.combatSystem = null;
    this.bossAI = null;
    
    // Game objects
    this.player = null;
    this.opponent = null;
    this.stage = null;
    this.projectiles = [];
    
    // Battle state
    this.battleState = {
      round: 1,
      timer: 99,
      timerMs: 99000,
      isPaused: false,
      isRoundOver: false,
      frameCount: 0
    };
    
    // Performance
    this.lastUpdateTime = 0;
    this.updateDelta = 16.67; // 60fps target
    
    // Ground level
    this.groundY = 800;
  }

  init(battleData) {
    this.battleData = battleData || {
      characterId: 'default',
      opponentId: 'boss_1',
      stageId: 'dojo',
      difficulty: 'normal'
    };
    
    // Reset battle state
    this.resetBattleState();
  }

  preload() {
    // Create asset manager for this scene
    this.assetManager = new AssetManager(this);
    
    // Load battle-specific assets
    this.assetManager.loadCombatAssets(this.battleData);
  }

  create() {
    // Initialize systems
    this.combatSystem = new CombatSystem(this);
    this.bossAI = new BossAI(this, this.combatSystem);
    
    // Set up battle stage
    this.createStage();
    
    // Create fighters
    this.createFighters();
    
    // Set up UI
    this.createBattleUI();
    
    // Set up input handling
    this.setupInputHandling();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize AI
    this.bossAI.setBoss(this.battleData.opponentId, this.battleData.difficulty);
    
    // Start battle
    this.startBattle();
  }

  update(time, delta) {
    if (this.battleState.isPaused || this.battleState.isRoundOver) return;
    
    // Cap delta to prevent large jumps
    const cappedDelta = Math.min(delta, 33.33);
    
    // Update frame count
    this.battleState.frameCount++;
    
    // Update systems
    this.updateInput(cappedDelta);
    this.combatSystem.update();
    this.updateFighters(cappedDelta);
    this.updateCollisions();
    this.updateProjectiles(cappedDelta);
    this.updateBattleLogic(cappedDelta);
    this.updateUI(cappedDelta);
    
    // Track performance
    this.lastUpdateTime = time;
  }

  createStage() {
    // Background
    const stageKey = `stage_${this.battleData.stageId}`;
    if (this.textures.exists(stageKey)) {
      this.stage = this.add.image(960, 540, stageKey);
      this.stage.setDepth(-10);
    } else {
      // Fallback background
      this.add.rectangle(960, 540, 1920, 1080, 0x2a2a4a);
    }
    
    // Ground plane for physics
    const ground = this.add.rectangle(960, 980, 1920, 200, 0x000000, 0);
    this.physics.add.existing(ground, true);
    this.ground = ground;
  }

  createFighters() {
    // Create player character
    this.player = new Fighter(this, 480, this.groundY, {
      player: 'p1',
      characterId: this.battleData.characterId,
      texture: `character_${this.battleData.characterId}`,
      facing: 'right',
      groundY: this.groundY,
      isAI: false
    });
    
    // Create opponent
    const bossData = this.bossAI.bossPatterns[this.battleData.opponentId];
    this.opponent = new Fighter(this, 1440, this.groundY, {
      player: 'p2',
      characterId: this.battleData.opponentId,
      texture: `boss_${this.battleData.opponentId}`,
      facing: 'left',
      groundY: this.groundY,
      isAI: true,
      maxHealth: bossData?.health || 100,
      defense: bossData?.defense || 0
    });
    
    // Auto-face opponents
    this.updateFacing();
  }

  updateFacing() {
    // Make fighters face each other
    if (this.player.x < this.opponent.x) {
      this.player.facing = 'right';
      this.opponent.facing = 'left';
    } else {
      this.player.facing = 'left';
      this.opponent.facing = 'right';
    }
  }

  createFighterAnimations(fighter, textureKey) {
    // Basic animations - will be expanded based on actual sprite sheets
    const animConfigs = [
      { key: 'idle', frames: [0, 1, 2, 3], frameRate: 10, repeat: -1 },
      { key: 'walk', frames: [4, 5, 6, 7], frameRate: 12, repeat: -1 },
      { key: 'jump', frames: [8, 9], frameRate: 10, repeat: 0 },
      { key: 'punch', frames: [12, 13, 14], frameRate: 20, repeat: 0 },
      { key: 'kick', frames: [16, 17, 18], frameRate: 20, repeat: 0 },
      { key: 'hit', frames: [20, 21], frameRate: 15, repeat: 0 },
      { key: 'block', frames: [24], frameRate: 10, repeat: 0 }
    ];
    
    animConfigs.forEach(config => {
      if (!this.anims.exists(`${textureKey}_${config.key}`)) {
        this.anims.create({
          key: `${textureKey}_${config.key}`,
          frames: this.anims.generateFrameNumbers(textureKey, { 
            frames: config.frames 
          }),
          frameRate: config.frameRate,
          repeat: config.repeat
        });
      }
    });
  }

  createBattleUI() {
    // Health bars
    this.createHealthBar(100, 50, true); // Player
    this.createHealthBar(1820, 50, false); // Opponent
    
    // Timer
    this.timerText = this.add.text(960, 50, '99', {
      font: '48px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.timerText.setOrigin(0.5, 0.5);
    
    // Round indicator
    this.roundText = this.add.text(960, 100, `ROUND ${this.battleState.round}`, {
      font: '32px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.roundText.setOrigin(0.5, 0.5);
    
    // Combo counter
    this.comboText = this.add.text(100, 200, '', {
      font: '36px Arial',
      fill: '#ff6600',
      stroke: '#000000',
      strokeThickness: 3
    });
  }

  createHealthBar(x, y, isPlayer) {
    const width = 400;
    const height = 30;
    
    // Background
    const bg = this.add.rectangle(x, y, width + 4, height + 4, 0x000000);
    bg.setOrigin(isPlayer ? 0 : 1, 0.5);
    
    // Health fill
    const fill = this.add.rectangle(x, y, width, height, 0x00ff00);
    fill.setOrigin(isPlayer ? 0 : 1, 0.5);
    
    // Store references
    if (isPlayer) {
      this.playerHealthBar = fill;
      this.playerHealthBarWidth = width;
    } else {
      this.opponentHealthBar = fill;
      this.opponentHealthBarWidth = width;
    }
  }

  setupInputHandling() {
    // Create touch controls for mobile
    if (this.game.device.input.touch) {
      this.touchControls = new TouchControls(this);
      this.touchControls.bridge = bridge; // Connect to bridge
    }
    
    // Touch controls handled via bridge
    bridge.on('GAME_INPUT', (inputData) => {
      this.handleInput(inputData);
    });
    
    // Development keyboard controls
    if (!window.ReactNativeWebView) {
      this.setupKeyboardControls();
    }
  }

  setupKeyboardControls() {
    const cursors = this.input.keyboard.createCursorKeys();
    const keys = this.input.keyboard.addKeys('W,A,S,D,J,K,L,U,I,O');
    
    // Store for update loop
    this.cursors = cursors;
    this.keys = keys;
  }

  setupEventListeners() {
    // Fighter events
    this.events.on('fighterHit', this.onFighterHit, this);
    this.events.on('fighterDefeated', this.onFighterDefeated, this);
    this.events.on('createProjectile', this.createProjectile, this);
    
    // Combat events
    this.events.on('comboHit', this.onComboHit, this);
    this.events.on('superActivated', this.onSuperActivated, this);
  }

  startBattle() {
    // Play fight announcement
    this.showAnnouncement('FIGHT!', () => {
      this.battleState.isPaused = false;
      this.startTimer();
    });
    
    // Notify bridge
    bridge.send('BATTLE_STARTED', {
      characterId: this.battleData.characterId,
      opponentId: this.battleData.opponentId,
      timestamp: Date.now()
    });
  }

  showAnnouncement(text, callback) {
    const announcement = this.add.text(960, 540, text, {
      font: '72px Arial',
      fill: '#ffffff',
      stroke: '#ff0000',
      strokeThickness: 6
    });
    announcement.setOrigin(0.5, 0.5);
    announcement.setScale(0);
    
    this.tweens.add({
      targets: announcement,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(500, () => {
          this.tweens.add({
            targets: announcement,
            scale: 0,
            duration: 200,
            onComplete: () => {
              announcement.destroy();
              if (callback) callback();
            }
          });
        });
      }
    });
  }

  // Input handling
  handleInput(inputData) {
    if (this.battleState.isPaused || this.battleState.isRoundOver) return;
    
    // Add to input buffer for combo detection
    this.inputBuffer.push({
      action: inputData.action,
      timestamp: performance.now()
    });
    
    // Keep buffer size manageable
    if (this.inputBuffer.length > 10) {
      this.inputBuffer.shift();
    }
    
    // Process immediate actions
    this.processInput(inputData);
  }

  processInput(inputData) {
    // Map input to game actions
    const inputMap = {
      'MOVE_LEFT': () => this.player.walk(-1),
      'MOVE_RIGHT': () => this.player.walk(1),
      'MOVE_NEUTRAL': () => this.player.walk(0),
      'JUMP': () => this.player.jump(),
      'CROUCH': () => this.player.crouch(true),
      'CROUCH_RELEASE': () => this.player.crouch(false),
      'BLOCK': () => this.player.block(true),
      'BLOCK_RELEASE': () => this.player.block(false),
      'LP': () => this.player.handleInput('LP'),
      'MP': () => this.player.handleInput('MP'),
      'HP': () => this.player.handleInput('HP'),
      'LK': () => this.player.handleInput('LK'),
      'MK': () => this.player.handleInput('MK'),
      'HK': () => this.player.handleInput('HK'),
      'THROW': () => this.player.handleInput('THROW')
    };
    
    const action = inputMap[inputData.action];
    if (action) action();
    
    // Also process directional inputs for special moves
    if (inputData.action.includes('DOWN') || inputData.action.includes('FORWARD') || 
        inputData.action.includes('BACK') || inputData.action.includes('UP')) {
      this.player.handleInput(inputData.action);
    }
  }

  // Update methods
  updateInput(delta) {
    // Keyboard controls for development
    if (this.cursors && !window.ReactNativeWebView) {
      if (this.cursors.left.isDown) {
        this.movePlayer(-1);
      } else if (this.cursors.right.isDown) {
        this.movePlayer(1);
      }
      
      if (this.cursors.up.isDown) {
        this.jumpPlayer();
      }
      
      // Attack keys
      if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
        this.performAttack('punch_light');
      }
    }
  }

  updateFighters(delta) {
    // Update fighters
    this.player.update(delta);
    this.opponent.update(delta);
    
    // Update facing
    this.updateFacing();
    
    // Update AI
    this.updateAI(delta);
  }

  updateFighter(fighter, delta) {
    // Apply gravity if airborne
    if (fighter.body.velocity.y !== 0) {
      fighter.state = 'airborne';
    } else if (Math.abs(fighter.body.velocity.x) > 50) {
      fighter.state = 'walking';
    } else if (fighter.state !== 'attacking') {
      fighter.state = 'idle';
    }
    
    // Update animations based on state
    this.updateFighterAnimation(fighter);
  }

  updateFighterAnimation(fighter) {
    const textureKey = fighter.texture.key;
    
    switch (fighter.state) {
      case 'idle':
        if (fighter.anims.currentAnim?.key !== `${textureKey}_idle`) {
          fighter.play(`${textureKey}_idle`);
        }
        break;
      case 'walking':
        if (fighter.anims.currentAnim?.key !== `${textureKey}_walk`) {
          fighter.play(`${textureKey}_walk`);
        }
        break;
      case 'attacking':
        // Handled by attack method
        break;
    }
  }

  updateBattleLogic(delta) {
    // Update timer
    if (!this.battleState.isRoundOver) {
      this.updateTimer(delta);
    }
    
    // Check win conditions
    this.checkWinConditions();
  }

  updateTimer(delta) {
    this.battleState.timerMs = (this.battleState.timerMs || 99000) - delta;
    
    if (this.battleState.timerMs <= 0) {
      this.battleState.timer = 0;
      this.endRound('timeout');
    } else {
      this.battleState.timer = Math.ceil(this.battleState.timerMs / 1000);
      this.timerText.setText(this.battleState.timer);
    }
  }

  updateUI(delta) {
    // Update health bars
    const playerHealthPercent = this.player.health / this.player.maxHealth;
    const opponentHealthPercent = this.opponent.health / this.opponent.maxHealth;
    
    this.playerHealthBar.width = playerHealthPercent * this.playerHealthBarWidth;
    this.opponentHealthBar.width = opponentHealthPercent * this.opponentHealthBarWidth;
    
    // Health bar colors
    if (playerHealthPercent < 0.3) {
      this.playerHealthBar.setFillStyle(0xff0000);
    } else if (playerHealthPercent < 0.6) {
      this.playerHealthBar.setFillStyle(0xffff00);
    }
    
    if (opponentHealthPercent < 0.3) {
      this.opponentHealthBar.setFillStyle(0xff0000);
    } else if (opponentHealthPercent < 0.6) {
      this.opponentHealthBar.setFillStyle(0xffff00);
    }
    
    // Update combo counter
    const playerCombo = this.combatSystem.comboCounts.p1;
    if (playerCombo > 1) {
      this.comboText.setText(`${playerCombo} HIT COMBO!`);
      this.comboText.setScale(1 + (playerCombo * 0.1));
    } else {
      this.comboText.setText('');
    }
    
    // Update super meters
    this.updateSuperMeters();
  }

  processAIAction(action) {
    // Map AI actions to opponent inputs
    const actionMap = {
      'MOVE_LEFT': () => this.opponent.walk(-1),
      'MOVE_RIGHT': () => this.opponent.walk(1),
      'JUMP': () => this.opponent.jump(),
      'CROUCH': () => this.opponent.crouch(true),
      'BLOCK': () => this.opponent.block(true),
      'BLOCK_RELEASE': () => this.opponent.block(false),
      'LP': () => this.opponent.handleInput('LP'),
      'MP': () => this.opponent.handleInput('MP'),
      'HP': () => this.opponent.handleInput('HP'),
      'LK': () => this.opponent.handleInput('LK'),
      'MK': () => this.opponent.handleInput('MK'),
      'HK': () => this.opponent.handleInput('HK'),
      'THROW': () => this.opponent.handleInput('THROW')
    };
    
    // Handle special moves
    if (this.bossAI.currentBoss.specialMoves && this.bossAI.currentBoss.specialMoves[action]) {
      this.opponent.handleInput(action);
    } else {
      const mapped = actionMap[action];
      if (mapped) mapped();
    }
  }

  jumpPlayer() {
    if (this.player.body.blocked.down && this.player.state !== 'attacking') {
      this.player.setVelocityY(-600);
    }
  }

  performAttack(attackType) {
    if (this.player.state === 'attacking') return;
    
    this.player.state = 'attacking';
    
    // Create hitbox
    const hitbox = this.createHitbox(this.player, attackType);
    
    // Play animation
    const animKey = attackType.includes('punch') ? 'punch' : 'kick';
    this.player.play(`${this.player.texture.key}_${animKey}`);
    
    // Reset state after animation
    this.player.once('animationcomplete', () => {
      this.player.state = 'idle';
      hitbox.destroy();
    });
  }

  createHitbox(fighter, attackType) {
    const hitboxData = this.getHitboxData(attackType);
    
    const x = fighter.x + (fighter.flipX ? -hitboxData.offsetX : hitboxData.offsetX);
    const y = fighter.y + hitboxData.offsetY;
    
    const hitbox = this.add.rectangle(x, y, hitboxData.width, hitboxData.height, 0xff0000, 0);
    this.physics.add.existing(hitbox);
    
    hitbox.attacker = fighter;
    hitbox.damage = hitboxData.damage;
    hitbox.hitstun = hitboxData.hitstun;
    
    this.hitboxGroup.add(hitbox);
    
    // Auto-destroy after active frames
    this.time.delayedCall(hitboxData.activeFrames * 16.67, () => {
      hitbox.destroy();
    });
    
    return hitbox;
  }

  getHitboxData(attackType) {
    const hitboxData = {
      punch_light: { width: 60, height: 40, offsetX: 50, offsetY: -20, damage: 5, hitstun: 200, activeFrames: 3 },
      punch_heavy: { width: 80, height: 50, offsetX: 60, offsetY: -20, damage: 10, hitstun: 400, activeFrames: 5 },
      kick_light: { width: 70, height: 60, offsetX: 55, offsetY: 0, damage: 7, hitstun: 300, activeFrames: 4 },
      kick_heavy: { width: 90, height: 70, offsetX: 65, offsetY: 0, damage: 12, hitstun: 500, activeFrames: 6 }
    };
    
    return hitboxData[attackType] || hitboxData.punch_light;
  }

  setBlocking(isBlocking) {
    this.player.isBlocking = isBlocking;
    
    if (isBlocking) {
      this.player.play(`${this.player.texture.key}_block`);
    }
  }

  checkSpecialMoves() {
    // Quarter-circle forward detection
    // This is simplified - real implementation would check input buffer timing
    const recentInputs = this.inputBuffer.slice(-3);
    
    if (recentInputs.length >= 3) {
      const inputs = recentInputs.map(i => i.action);
      
      // Hadouken motion
      if (inputs.includes('DOWN') && inputs.includes('DOWN_RIGHT') && inputs.includes('RIGHT')) {
        this.performSpecialMove('hadouken');
      }
    }
  }

  performSpecialMove(moveName) {
    console.log('Special move:', moveName);
    // Implementation for special moves
  }

  // AI
  updateAI(delta) {
    if (!this.opponent || this.battleState.isRoundOver) return;
    
    // Get AI decision
    const gameState = {
      currentFrame: this.battleState.frameCount,
      round: this.battleState.round
    };
    
    const aiAction = this.bossAI.update(this.opponent, this.player, gameState);
    
    if (aiAction) {
      // Convert AI action to fighter input
      this.processAIAction(aiAction);
    }
  }

  performAIAttack() {
    this.opponent.state = 'attacking';
    
    const attacks = ['punch_light', 'punch_heavy', 'kick_light', 'kick_heavy'];
    const attack = Phaser.Math.RND.pick(attacks);
    
    const hitbox = this.createHitbox(this.opponent, attack);
    
    const animKey = attack.includes('punch') ? 'punch' : 'kick';
    this.opponent.play(`${this.opponent.texture.key}_${animKey}`);
    
    this.opponent.once('animationcomplete', () => {
      this.opponent.state = 'idle';
    });
  }

  // Collision handling
  onFighterCollision(fighter1, fighter2) {
    // Push fighters apart slightly
    const pushForce = 100;
    
    if (fighter1.x < fighter2.x) {
      fighter1.setVelocityX(-pushForce);
      fighter2.setVelocityX(pushForce);
    } else {
      fighter1.setVelocityX(pushForce);
      fighter2.setVelocityX(-pushForce);
    }
  }

  updateCollisions() {
    // Check all active hitboxes against hurtboxes
    const playerHitboxes = this.player.getHitboxes();
    const opponentHitboxes = this.opponent.getHitboxes();
    
    // Check player hits on opponent
    playerHitboxes.forEach(hitbox => {
      const opponentHurtbox = this.opponent.getHurtbox();
      if (opponentHurtbox) {
        const hit = this.combatSystem.checkHit(hitbox, this.opponent, opponentHurtbox);
        if (hit) {
          this.combatSystem.applyHit(hit, this.player, this.opponent);
          this.createHitEffect(hit, this.opponent);
        }
      }
    });
    
    // Check opponent hits on player
    opponentHitboxes.forEach(hitbox => {
      const playerHurtbox = this.player.getHurtbox();
      if (playerHurtbox) {
        const hit = this.combatSystem.checkHit(hitbox, this.player, playerHurtbox);
        if (hit) {
          this.combatSystem.applyHit(hit, this.opponent, this.player);
          this.createHitEffect(hit, this.player);
        }
      }
    });
    
    // Check projectile collisions
    this.checkProjectileCollisions();
  }

  isFacingAttacker(defender, attacker) {
    const facingRight = defender.flipX;
    const attackerOnRight = attacker.x > defender.x;
    
    return (facingRight && attackerOnRight) || (!facingRight && !attackerOnRight);
  }

  onBlocked(defender, hitbox) {
    // Reduced damage
    const damage = hitbox.damage * 0.1;
    this.dealDamage(defender, damage);
    
    // Block effect
    this.createBlockEffect(defender.x, defender.y);
    
    // Push back
    const pushDirection = defender.x < hitbox.x ? -1 : 1;
    defender.setVelocityX(pushDirection * 200);
    
    // Sound
    if (this.sound.get('block')) {
      this.sound.play('block');
    }
  }

  onHit(defender, hitbox) {
    // Full damage
    this.dealDamage(defender, hitbox.damage);
    
    // Hit effect
    this.createHitEffect(defender.x, defender.y);
    
    // Hitstun
    defender.state = 'hitstun';
    this.time.delayedCall(hitbox.hitstun, () => {
      if (defender.state === 'hitstun') {
        defender.state = 'idle';
      }
    });
    
    // Knockback
    const knockbackDirection = defender.x < hitbox.x ? -1 : 1;
    defender.setVelocityX(knockbackDirection * 300);
    defender.setVelocityY(-200);
    
    // Update combo
    if (hitbox.attacker === this.player) {
      this.player.comboCount++;
      
      // Reset combo after delay
      this.time.delayedCall(1000, () => {
        this.player.comboCount = 0;
      });
    }
    
    // Sound
    const hitSound = hitbox.damage > 8 ? 'hit_heavy' : 'hit_light';
    if (this.sound.get(hitSound)) {
      this.sound.play(hitSound);
    }
  }

  dealDamage(fighter, damage) {
    if (fighter === this.player) {
      this.battleState.playerHealth = Math.max(0, this.battleState.playerHealth - damage);
    } else {
      this.battleState.opponentHealth = Math.max(0, this.battleState.opponentHealth - damage);
    }
  }

  createHitEffect(hitResult, defender) {
    const x = defender.x;
    const y = defender.y - 30;
    
    // Different effects for different hit types
    if (hitResult.blocked) {
      this.createBlockEffect(x, y);
      if (this.sound.get('block')) {
        this.sound.play('block');
      }
    } else {
      // Hit spark
      if (this.anims.exists('hit_spark')) {
        const effect = this.add.sprite(x, y, 'ui_atlas');
        effect.play('hit_spark');
        effect.once('animationcomplete', () => effect.destroy());
      }
      
      // Hit sound
      const hitSound = hitResult.damage > 30 ? 'hit_heavy' : 'hit_light';
      if (this.sound.get(hitSound)) {
        this.sound.play(hitSound);
      }
      
      // Screen shake on heavy hits
      if (hitResult.damage > 40) {
        this.cameras.main.shake(100, 0.01);
      }
    }
    
    // Damage number
    this.createDamageNumber(x, y - 50, hitResult.damage);
  }

  createBlockEffect(x, y) {
    if (this.anims.exists('block_spark')) {
      const effect = this.add.sprite(x, y, 'ui_atlas');
      effect.play('block_spark');
      effect.once('animationcomplete', () => effect.destroy());
    }
  }

  // Win conditions
  updateSuperMeters() {
    // Create super meter bars if they don't exist
    if (!this.playerSuperBar) {
      this.playerSuperBar = this.add.rectangle(100, 120, 0, 20, 0x00ffff);
      this.playerSuperBar.setOrigin(0, 0.5);
      this.playerSuperBarBg = this.add.rectangle(100, 120, 300, 20, 0x003366);
      this.playerSuperBarBg.setOrigin(0, 0.5);
      this.playerSuperBarBg.setDepth(-1);
    }
    
    if (!this.opponentSuperBar) {
      this.opponentSuperBar = this.add.rectangle(1820, 120, 0, 20, 0x00ffff);
      this.opponentSuperBar.setOrigin(1, 0.5);
      this.opponentSuperBarBg = this.add.rectangle(1820, 120, 300, 20, 0x003366);
      this.opponentSuperBarBg.setOrigin(1, 0.5);
      this.opponentSuperBarBg.setDepth(-1);
    }
    
    // Update widths
    const playerMeterPercent = this.combatSystem.superMeters.p1 / this.combatSystem.superMeterMax;
    const opponentMeterPercent = this.combatSystem.superMeters.p2 / this.combatSystem.superMeterMax;
    
    this.playerSuperBar.width = playerMeterPercent * 300;
    this.opponentSuperBar.width = opponentMeterPercent * 300;
    
    // Flash when full
    if (playerMeterPercent >= 1) {
      this.playerSuperBar.setFillStyle(0xffff00);
      this.playerSuperBar.setAlpha(0.5 + Math.sin(this.time.now * 0.01) * 0.5);
    }
    
    if (opponentMeterPercent >= 1) {
      this.opponentSuperBar.setFillStyle(0xffff00);
      this.opponentSuperBar.setAlpha(0.5 + Math.sin(this.time.now * 0.01) * 0.5);
    }
  }

  createDamageNumber(x, y, damage) {
    const damageText = this.add.text(x, y, damage.toString(), {
      font: 'bold 32px Arial',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    damageText.setOrigin(0.5, 0.5);
    
    // Animate up and fade
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }

  updateProjectiles(delta) {
    this.projectiles = this.projectiles.filter(projectile => {
      // Update position
      projectile.x += projectile.velocity;
      
      // Update lifetime
      projectile.lifetime--;
      
      // Remove if off screen or expired
      if (projectile.x < -50 || projectile.x > 1970 || projectile.lifetime <= 0) {
        projectile.destroy();
        return false;
      }
      
      return true;
    });
  }

  checkProjectileCollisions() {
    this.projectiles.forEach(projectile => {
      // Check against fighters
      const targets = projectile.owner === this.player ? [this.opponent] : [this.player];
      
      targets.forEach(target => {
        const hurtbox = target.getHurtbox();
        if (!hurtbox) return;
        
        // Simple box collision
        if (this.combatSystem.checkBoxOverlap(
          projectile.x - 25, projectile.y - 25, 50, 50,
          hurtbox.x - hurtbox.width/2, hurtbox.y - hurtbox.height/2, 
          hurtbox.width, hurtbox.height
        )) {
          // Hit detected
          const hitResult = {
            hit: true,
            blocked: target.blocking,
            damage: projectile.damage,
            hitstun: projectile.hitstun,
            pushback: projectile.pushback
          };
          
          this.combatSystem.applyHit(hitResult, projectile.owner, target);
          this.createHitEffect(hitResult, target);
          
          // Destroy projectile
          projectile.destroy();
          this.projectiles = this.projectiles.filter(p => p !== projectile);
        }
      });
    });
  }

  createProjectile(data) {
    const moveData = this.combatSystem.frameData.get(data.move);
    if (!moveData || !moveData.projectile) return;
    
    const projectile = this.add.sprite(data.x, data.y, 'projectile_' + data.move);
    
    // Set properties
    projectile.owner = data.owner;
    projectile.velocity = data.owner.facing === 'right' ? 
      moveData.projectileSpeed : -moveData.projectileSpeed;
    projectile.damage = moveData.damage;
    projectile.hitstun = moveData.hitstun;
    projectile.pushback = moveData.pushback;
    projectile.lifetime = 120; // 2 seconds at 60fps
    
    // Play animation if exists
    if (this.anims.exists('projectile_' + data.move)) {
      projectile.play('projectile_' + data.move);
    }
    
    this.projectiles.push(projectile);
  }

  onFighterHit(data) {
    // Update health display
    this.updateUI(0);
    
    // Camera shake for heavy hits
    if (data.damage > 40) {
      this.cameras.main.shake(150, 0.015);
    }
  }

  onFighterDefeated(data) {
    this.battleState.isRoundOver = true;
    
    // Determine winner
    const result = data.fighter === this.player ? 'opponent_win' : 'player_win';
    this.endRound(result);
  }

  onComboHit(data) {
    // Special effects for high combos
    if (data.comboCount >= 5) {
      // Flash background
      this.cameras.main.flash(100, 255, 255, 0);
    }
  }

  onSuperActivated(data) {
    // Pause briefly for dramatic effect
    this.scene.pause();
    
    // Super flash effect
    const flash = this.add.rectangle(960, 540, 1920, 1080, 0xffffff);
    flash.setAlpha(0);
    
    this.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        flash.destroy();
        this.scene.resume();
      }
    });
    
    // Super activation sound
    if (this.sound.get('super_activate')) {
      this.sound.play('super_activate');
    }
  }

  checkWinConditions() {
    if (this.player.health <= 0) {
      this.endRound('opponent_win');
    } else if (this.opponent.health <= 0) {
      this.endRound('player_win');
    }
  }

  endRound(result) {
    this.battleState.isRoundOver = true;
    
    // Show round result
    let resultText = '';
    switch (result) {
      case 'player_win':
        resultText = 'YOU WIN!';
        break;
      case 'opponent_win':
        resultText = 'YOU LOSE!';
        break;
      case 'timeout':
        resultText = 'TIME OUT!';
        break;
    }
    
    this.showAnnouncement(resultText, () => {
      this.endBattle(result);
    });
  }

  endBattle(result) {
    // Calculate score
    const score = this.calculateScore();
    
    // Send results to React Native
    bridge.send('BATTLE_COMPLETE', {
      result: result,
      score: score,
      playerHealth: this.battleState.playerHealth,
      opponentHealth: this.battleState.opponentHealth,
      combosLanded: this.player.comboCount,
      timestamp: Date.now()
    });
  }

  calculateScore() {
    let score = 0;
    
    // Base score for winning
    if (this.battleState.playerHealth > 0) {
      score += 1000;
    }
    
    // Health bonus
    score += this.battleState.playerHealth * 10;
    
    // Time bonus
    score += this.battleState.timer * 5;
    
    // Combo bonus
    score += this.player.comboCount * 100;
    
    return score;
  }

  // Utility methods
  resetBattleState() {
    this.battleState = {
      round: 1,
      timer: 99,
      timerMs: 99000,
      playerHealth: 100,
      opponentHealth: 100,
      isPaused: false,
      isRoundOver: false
    };
  }

  startTimer() {
    this.battleState.timerMs = 99000;
  }

  // Character data updates from React Native
  updateCharacterData(data) {
    // Update player stats based on character evolution
    if (this.player && data.stats) {
      this.player.attackPower = data.stats.attack || 1;
      this.player.defense = data.stats.defense || 1;
      this.player.speed = data.stats.speed || 1;
      
      // Update max velocity based on speed stat
      this.player.setMaxVelocity(600 * this.player.speed, 800);
    }
  }

  // Clean up
  cleanup() {
    // Remove all physics bodies
    this.hitboxGroup.clear(true, true);
    this.hurtboxGroup.clear(true, true);
    
    // Clear input buffer
    this.inputBuffer = [];
  }

  shutdown() {
    // Clean up event listeners
    bridge.off('GAME_INPUT', this.handleInput);
    bridge.off('UPDATE_CHARACTER', this.updateCharacterData);
    
    // Clean up scene
    this.cleanup();
  }
}