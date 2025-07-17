// HomePage.jsx - Complete integration with Phaser and NES.css
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import useGameStore from '../store/gameStore';

// Phaser Scene for Character Display
class CharacterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterScene' });
  }

  preload() {
    // Load sprite sheets based on your provided sprites
    this.load.spritesheet('idle_healthy', '/sprites/character_idle_healthy.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.load.spritesheet('idle_sick', '/sprites/character_idle_sick.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.load.spritesheet('flex', '/sprites/character_flex.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    this.load.spritesheet('thumbsup', '/sprites/character_thumbsup.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load 8-bit sounds
    this.load.audio('flex_sound', ['/audio/flex.mp3']);
    this.load.audio('success_sound', ['/audio/success.mp3']);
    this.load.audio('damage_sound', ['/audio/damage.mp3']);
    
    // Load NES-style background
    this.load.image('arena_bg', '/sprites/arena_background.png');
  }

  create() {
    // Add retro scanline effect
    this.cameras.main.setBackgroundColor('#5c94fc');
    
    // Create character at center
    this.character = this.add.sprite(200, 150, 'idle_healthy');
    this.character.setScale(3); // Scale up for pixelated effect
    this.character.setPixelPerfect(true);
    
    // Create animations
    this.anims.create({
      key: 'idle_healthy_anim',
      frames: this.anims.generateFrameNumbers('idle_healthy', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1
    });
    
    this.anims.create({
      key: 'idle_sick_anim',
      frames: this.anims.generateFrameNumbers('idle_sick', { start: 0, end: 3 }),
      frameRate: 3,
      repeat: -1
    });
    
    this.anims.create({
      key: 'flex_anim',
      frames: this.anims.generateFrameNumbers('flex', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: 0
    });
    
    this.anims.create({
      key: 'thumbsup_anim',
      frames: this.anims.generateFrameNumbers('thumbsup', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: 0
    });
    
    // Start with idle animation
    this.character.play('idle_healthy_anim');
    
    // Add pixelated particles
    this.sparkles = this.add.particles(0, 0, 'spark', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      quantity: 1,
      frequency: 100,
      emitting: false
    });
    
    // Set up event listeners for React integration
    this.setupReactBridge();
  }

  setupReactBridge() {
    // Listen for animation commands from React
    this.events.on('playAnimation', (animationType) => {
      switch (animationType) {
        case 'flexing':
          this.playFlexAnimation();
          break;
        case 'thumbs_up':
          this.playThumbsUpAnimation();
          break;
        case 'damage_blink':
          this.playDamageAnimation();
          break;
        case 'eating_healthy':
          this.playEatingAnimation();
          break;
      }
    });
    
    // Listen for state changes
    this.events.on('updateIdleState', (state) => {
      if (state === 'idle_sick') {
        this.character.play('idle_sick_anim');
      } else if (state === 'idle_healthy') {
        this.character.play('idle_healthy_anim');
      }
    });
  }

  playFlexAnimation() {
    this.character.play('flex_anim');
    this.sound.play('flex_sound', { volume: 0.5 });
    
    // Add power effect
    this.tweens.add({
      targets: this.character,
      scaleX: 3.5,
      scaleY: 3.5,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
    
    // Screen shake
    this.cameras.main.shake(200, 0.01);
    
    this.character.once('animationcomplete', () => {
      this.character.play('idle_healthy_anim');
    });
  }

  playThumbsUpAnimation() {
    this.character.play('thumbsup_anim');
    this.sound.play('success_sound', { volume: 0.5 });
    
    // Happy bounce
    this.tweens.add({
      targets: this.character,
      y: this.character.y - 20,
      duration: 300,
      ease: 'Power2',
      yoyo: true
    });
    
    this.character.once('animationcomplete', () => {
      this.character.play('idle_healthy_anim');
    });
  }

  playDamageAnimation() {
    this.sound.play('damage_sound', { volume: 0.6 });
    
    // Flash red
    this.character.setTint(0xff0000);
    
    // Blink effect
    this.tweens.add({
      targets: this.character,
      alpha: 0,
      duration: 100,
      ease: 'Power1',
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.character.clearTint();
        this.character.setAlpha(1);
      }
    });
  }

  playEatingAnimation() {
    // Simple eating animation with scaling
    this.tweens.add({
      targets: this.character,
      scaleX: 3.2,
      scaleY: 2.8,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
  }
}

// Main HomePage Component
const HomePage = () => {
  const gameRef = useRef(null);
  const phaserGame = useRef(null);
  const { stats, applyAction, isAnimating, setAnimating } = useGameStore();
  
  useEffect(() => {
    // Initialize Phaser game
    if (gameRef.current && !phaserGame.current) {
      const config = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 400,
        height: 300,
        pixelArt: true,
        antialias: false,
        scene: CharacterScene,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 }
          }
        }
      };
      
      phaserGame.current = new Phaser.Game(config);
    }
    
    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
        phaserGame.current = null;
      }
    };
  }, []);
  
  // Handle actions
  const handleAction = (actionType, actionName, effects) => {
    if (isAnimating) return;
    
    setAnimating(true);
    applyAction(effects);
    
    // Trigger Phaser animation
    if (phaserGame.current) {
      const scene = phaserGame.current.scene.getScene('CharacterScene');
      scene.events.emit('playAnimation', effects.animation);
    }
    
    // Reset animation state
    setTimeout(() => {
      setAnimating(false);
      updateIdleState();
    }, 2000);
  };
  
  const updateIdleState = () => {
    if (phaserGame.current) {
      const scene = phaserGame.current.scene.getScene('CharacterScene');
      const idleState = stats.health < 40 ? 'idle_sick' : 'idle_healthy';
      scene.events.emit('updateIdleState', idleState);
    }
  };
  
  // Action definitions
  const healthyActions = [
    { 
      name: 'SALAD', 
      effects: { health: 5, weight: -2, stamina: 3, animation: 'eating_healthy' },
      type: 'food' 
    },
    { 
      name: 'PROTEIN', 
      effects: { strength: 5, health: 3, stamina: 2, animation: 'flexing' },
      type: 'food' 
    },
    { 
      name: 'WATER', 
      effects: { health: 2, stamina: 4, weight: -1, animation: 'thumbs_up' },
      type: 'food' 
    },
    { 
      name: 'RUN', 
      effects: { stamina: 5, weight: -3, health: 2, animation: 'thumbs_up' },
      type: 'workout' 
    },
    { 
      name: 'LIFT', 
      effects: { strength: 5, stamina: 2, health: 3, animation: 'flexing' },
      type: 'workout' 
    },
    { 
      name: 'STRETCH', 
      effects: { health: 3, happiness: 4, stamina: 2, animation: 'thumbs_up' },
      type: 'workout' 
    }
  ];
  
  const unhealthyActions = [
    { 
      name: 'BURGER', 
      effects: { health: -3, weight: 5, stamina: -2, animation: 'damage_blink' },
      type: 'food' 
    },
    { 
      name: 'SODA', 
      effects: { health: -2, weight: 3, stamina: -1, animation: 'damage_blink' },
      type: 'drink' 
    },
    { 
      name: 'SKIP DAY', 
      effects: { stamina: -3, strength: -2, weight: 2, happiness: -5, animation: 'damage_blink' },
      type: 'skip' 
    }
  ];
  
  return (
    <div className="home-page">
      {/* Title */}
      <section className="nes-container is-dark with-title">
        <p className="title">16BITFIT</p>
        
        {/* Phaser Game Canvas */}
        <div className="game-container">
          <div ref={gameRef} className="phaser-game" />
        </div>
        
        {/* Player Name */}
        <div className="player-info">
          <p>PLAYER ONE</p>
          <p className="level-indicator">LVL {Math.floor(stats.strength / 20)}</p>
        </div>
      </section>
      
      {/* Healthy Actions */}
      <section className="nes-container with-title is-centered">
        <p className="title">HEALTHY</p>
        <div className="button-grid">
          {healthyActions.map((action) => (
            <button
              key={action.name}
              type="button"
              className="nes-btn is-success"
              onClick={() => handleAction(action.type, action.name, action.effects)}
              disabled={isAnimating}
            >
              {action.name}
            </button>
          ))}
        </div>
      </section>
      
      {/* Unhealthy Actions */}
      <section className="nes-container with-title is-centered">
        <p className="title">UNHEALTHY</p>
        <div className="button-grid">
          {unhealthyActions.map((action) => (
            <button
              key={action.name}
              type="button"
              className={`nes-btn ${action.name === 'SKIP DAY' ? 'is-dark' : 'is-error'}`}
              onClick={() => handleAction(action.type, action.name, action.effects)}
              disabled={isAnimating}
            >
              {action.name}
            </button>
          ))}
        </div>
      </section>
      
      {/* Navigation */}
      <div className="navigation">
        <button type="button" className="nes-btn" onClick={() => window.location.href = '/stats'}>
          VIEW STATS
        </button>
      </div>
      
      <style jsx>{`
        .home-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .game-container {
          display: flex;
          justify-content: center;
          margin: 20px 0;
          background: linear-gradient(to bottom, #5c94fc 0%, #5c94fc 60%, #8cd68c 60%, #8cd68c 100%);
          padding: 20px;
          border: 4px solid #000;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        .phaser-game canvas {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        .player-info {
          text-align: center;
          margin-top: 15px;
        }
        
        .player-info p {
          margin: 5px 0;
          font-size: 12px;
        }
        
        .level-indicator {
          color: #ffc107;
          font-size: 10px;
        }
        
        .button-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 15px;
        }
        
        .nes-btn {
          font-size: 10px !important;
          padding: 10px 5px !important;
          white-space: nowrap;
        }
        
        .navigation {
          text-align: center;
          margin-top: 30px;
        }
        
        @media (max-width: 480px) {
          .button-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;