/**
 * Unified Game Engine for 16BitFit
 * Built on react-native-game-engine for optimal mobile performance
 * Targets consistent 60fps for fighting game mechanics
 */

import React, { Component } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GameEngine } from 'react-native-game-engine';

// Core systems
import { GameLoop } from './systems/GameLoop';
import { InputSystem } from './systems/InputSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { OptimizedRenderSystem } from './systems/OptimizedRenderSystem';
import { CombatSystem } from './systems/CombatSystem';
import { AnimationSystem } from './systems/AnimationSystem';

// Managers
import { EntityManager } from './managers/EntityManager';
import { AssetManager } from './managers/AssetManager';
import { getEnhancedObjectPool } from './managers/EnhancedObjectPool';

// Performance systems
import { getPerformanceMonitor } from './systems/PerformanceMonitor';
import { getTextureAtlas } from './rendering/TextureAtlas';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Game configuration
export const GAME_CONFIG = {
  // Performance settings
  fps: 60,
  fixedTimestep: 1000 / 60, // 16.67ms per frame
  maxUpdateDelta: 1000 / 30, // Max 33.33ms (30fps minimum)
  
  // Arena settings
  arena: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
    floorY: SCREEN_HEIGHT * 0.3,
  },
  
  // Fighting game settings
  physics: {
    gravity: { x: 0, y: 980 }, // Pixels per second squared
    groundFriction: 0.85,
    airFriction: 0.98,
  },
  
  // Input settings
  input: {
    bufferTime: 500, // 500ms input buffer for combos
    doubleTapWindow: 300, // 300ms for dash input
  },
};

class UnifiedGameEngine extends Component {
  constructor(props) {
    super(props);
    
    // Initialize managers
    this.entityManager = new EntityManager();
    this.assetManager = new AssetManager();
    this.objectPool = getEnhancedObjectPool();
    this.performanceMonitor = getPerformanceMonitor();
    this.textureAtlas = getTextureAtlas();
    
    // Game state
    this.state = {
      running: true,
      entities: {},
      gameState: 'loading', // loading, ready, fighting, paused, victory, defeat
    };
    
    // Performance tracking
    this.frameCount = 0;
    this.lastTime = Date.now();
    this.deltaTime = 0;
    this.accumulator = 0;
  }
  
  async componentDidMount() {
    // Load assets
    await this.assetManager.loadAssets();
    
    // Initialize entities
    this.setupEntities();
    
    // Start game
    this.setState({ gameState: 'ready' });
    
    // Notify parent
    if (this.props.onGameReady) {
      this.props.onGameReady();
    }
  }
  
  componentWillUnmount() {
    // Cleanup
    this.objectPool.destroy();
    this.assetManager.cleanup();
    this.performanceMonitor.destroy();
    this.textureAtlas.destroy();
  }
  
  setupEntities = () => {
    const { playerStats, boss } = this.props;
    
    // Create player entity
    const player = this.entityManager.createFighter({
      id: 'player',
      type: 'player',
      position: { x: 100, y: GAME_CONFIG.arena.floorY },
      stats: {
        health: 100 + (playerStats?.health || 0),
        strength: 10 + (playerStats?.strength || 0) * 0.1,
        defense: 5 + (playerStats?.endurance || 0) * 0.05,
        speed: 300 + (playerStats?.stamina || 0) * 2,
      },
      sprite: this.assetManager.getSprite('player'),
    });
    
    // Create boss entity
    const bossEntity = this.entityManager.createFighter({
      id: 'boss',
      type: 'boss',
      position: { x: SCREEN_WIDTH - 100, y: GAME_CONFIG.arena.floorY },
      stats: {
        health: boss?.hp || 100,
        strength: boss?.attackPower || 15,
        defense: boss?.defense || 5,
        speed: 250,
      },
      sprite: this.assetManager.getSprite(boss?.spriteId || 'boss_default'),
      flipX: true,
    });
    
    // Create HUD entity
    const hud = this.entityManager.createHUD({
      playerMaxHP: player.stats.health,
      bossMaxHP: bossEntity.stats.health,
    });
    
    // Create arena entity
    const arena = this.entityManager.createArena({
      background: this.assetManager.getBackground(boss?.arenaId || 'default'),
    });
    
    this.setState({
      entities: {
        player,
        boss: bossEntity,
        hud,
        arena,
      },
    });
  };
  
  // Fixed timestep game loop for consistent physics
  onUpdate = (entities, { time, delta }) => {
    if (this.state.gameState !== 'fighting') {
      return entities;
    }
    
    // Calculate frame timing
    const currentTime = Date.now();
    this.deltaTime = Math.min(currentTime - this.lastTime, GAME_CONFIG.maxUpdateDelta);
    this.lastTime = currentTime;
    
    // Fixed timestep accumulator
    this.accumulator += this.deltaTime;
    
    // Process fixed timestep updates
    while (this.accumulator >= GAME_CONFIG.fixedTimestep) {
      // Update systems with fixed timestep
      entities = this.updateSystems(entities, GAME_CONFIG.fixedTimestep);
      this.accumulator -= GAME_CONFIG.fixedTimestep;
    }
    
    // Interpolation alpha for smooth rendering
    const alpha = this.accumulator / GAME_CONFIG.fixedTimestep;
    entities._interpolationAlpha = alpha;
    
    // Track FPS
    this.trackPerformance();
    
    return entities;
  };
  
  updateSystems = (entities, timestep) => {
    // System update order is important for fighting games
    entities = InputSystem(entities, { timestep });
    entities = PhysicsSystem(entities, { timestep });
    entities = CombatSystem(entities, { timestep, onHit: this.handleHit });
    entities = AnimationSystem(entities, { timestep });
    
    return entities;
  };
  
  handleHit = (attacker, target, damage) => {
    // Update health
    target.health = Math.max(0, target.health - damage);
    
    // Haptic feedback
    if (this.props.onHapticFeedback) {
      this.props.onHapticFeedback(attacker.type === 'player' ? 'medium' : 'heavy');
    }
    
    // Update stats
    if (this.props.onUpdateStats) {
      this.props.onUpdateStats({
        playerHP: this.state.entities.player.health,
        bossHP: this.state.entities.boss.health,
        comboCount: this.state.entities.player.comboCount || 0,
        specialMeter: this.state.entities.player.specialMeter || 0,
      });
    }
    
    // Check victory/defeat
    if (target.health <= 0) {
      this.endBattle(attacker.type === 'player');
    }
  };
  
  endBattle = (playerWon) => {
    this.setState({ 
      gameState: playerWon ? 'victory' : 'defeat',
      running: false,
    });
    
    if (this.props.onBattleEnd) {
      this.props.onBattleEnd({
        victory: playerWon,
        score: this.calculateScore(),
        stats: {
          damageDealt: this.state.entities.player.damageDealt || 0,
          damageTaken: this.state.entities.player.damageTaken || 0,
          maxCombo: this.state.entities.player.maxCombo || 0,
          timeElapsed: Date.now() - this.battleStartTime,
        },
      });
    }
  };
  
  calculateScore = () => {
    const { player, boss } = this.state.entities;
    const healthBonus = Math.floor(player.health * 10);
    const comboBonus = (player.maxCombo || 0) * 50;
    const damageBonus = Math.floor((player.damageDealt || 0) * 2);
    const timeBonus = Math.max(0, 1000 - Math.floor((Date.now() - this.battleStartTime) / 100));
    
    return healthBonus + comboBonus + damageBonus + timeBonus;
  };
  
  trackPerformance = () => {
    this.frameCount++;
    
    // Get detailed performance metrics
    const metrics = this.performanceMonitor.getMetrics();
    
    // Log FPS every second
    if (this.frameCount % 60 === 0) {
      if (this.props.onPerformanceUpdate) {
        this.props.onPerformanceUpdate({
          fps: metrics.fps,
          avgFps: metrics.avgFps,
          frameTime: metrics.frameTime,
          entities: Object.keys(this.state.entities).length,
          drawCalls: metrics.drawCalls,
          memoryUsage: metrics.memoryUsage,
          quality: metrics.quality,
        });
      }
      
      // Check for performance warnings
      const warnings = this.performanceMonitor.getWarnings();
      if (warnings.length > 0 && this.props.onPerformanceWarning) {
        this.props.onPerformanceWarning(warnings);
      }
    }
  };
  
  handleEvent = (event) => {
    // Handle touch/gesture events
    if (event.type === 'touch') {
      const { player } = this.state.entities;
      if (player) {
        player.inputQueue.push(event);
      }
    }
  };
  
  startBattle = () => {
    this.battleStartTime = Date.now();
    this.setState({ gameState: 'fighting' });
  };
  
  render() {
    return (
      <View style={styles.container}>
        <GameEngine
          ref={(ref) => { this.engine = ref; }}
          style={styles.gameEngine}
          systems={[GameLoop, OptimizedRenderSystem]}
          entities={this.state.entities}
          running={this.state.running}
          onEvent={this.handleEvent}
          timer={this.onUpdate}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameEngine: {
    flex: 1,
  },
});

export default UnifiedGameEngine;