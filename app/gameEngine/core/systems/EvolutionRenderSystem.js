/**
 * Evolution Render System
 * Handles rendering of evolution-based visual effects during combat
 * Manages sprite rendering, particle effects, and auras
 */

import spriteManager from '../../../services/EvolutionSpriteManager';
import ParticleEffectSystem from './ParticleEffectSystem';
import AuraEffectSystem from './AuraEffectSystem';
import { Image } from 'react-native';

class EvolutionRenderSystem {
  constructor() {
    this.particleSystem = new ParticleEffectSystem();
    this.auraSystem = new AuraEffectSystem();
    this.spriteCache = new Map();
    this.effectQueue = [];
    this.activeTransformations = new Map();
    this.hitEffectDuration = 300;
    this.dodgeEffectDuration = 500;
  }

  /**
   * Render evolution-enhanced fighter
   */
  renderFighter(ctx, fighter, camera) {
    if (!fighter || !fighter.position) return;

    ctx.save();

    // Apply camera transform
    const screenX = fighter.position.x - camera.x;
    const screenY = fighter.position.y - camera.y;
    ctx.translate(screenX, screenY);

    // Apply transformation effects
    if (fighter.isTransformed && fighter.transformationData) {
      this.applyTransformationEffects(ctx, fighter);
    }

    // Render aura (behind character)
    if (fighter.evolutionStage > 0) {
      this.renderAura(ctx, fighter);
    }

    // Render character sprite
    this.renderCharacterSprite(ctx, fighter);

    // Render equipment overlays
    if (fighter.equipment) {
      this.renderEquipment(ctx, fighter);
    }

    // Render particle effects (in front of character)
    if (fighter.evolutionStage > 0) {
      this.renderParticles(ctx, fighter);
    }

    // Render hit effects
    if (fighter.pendingEffects) {
      this.renderHitEffects(ctx, fighter.pendingEffects, { x: screenX, y: screenY });
      fighter.pendingEffects = null;
    }

    // Render dodge effect
    if (fighter.dodgeEffect) {
      this.renderDodgeEffect(ctx, fighter);
      setTimeout(() => { fighter.dodgeEffect = false; }, this.dodgeEffectDuration);
    }

    ctx.restore();
  }

  /**
   * Render character sprite with evolution animations
   */
  renderCharacterSprite(ctx, fighter) {
    const evolution = fighter.evolutionStage || 0;
    const animationName = this.getAnimationFromState(fighter.state);
    const animationConfig = spriteManager.getAnimationConfig(evolution, animationName);

    if (!animationConfig) return;

    // Calculate current frame
    const frameIndex = Math.floor(fighter.animationFrame) % animationConfig.frames.length;
    const spriteFrame = animationConfig.frames[frameIndex];
    const framePosition = spriteManager.getFramePosition(spriteFrame);

    // Get sprite path
    const spritePath = spriteManager.getSpritePath(evolution, fighter.characterType);

    // Draw sprite frame
    // In a real implementation, this would use the loaded sprite sheet
    ctx.fillStyle = fighter.visualTheme ? fighter.visualTheme.primary : '#92CC41';
    ctx.globalAlpha = fighter.isInvincible ? 0.5 : 1;

    // Apply flip for facing direction
    if (fighter.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // Draw placeholder sprite (would be actual sprite in production)
    ctx.fillRect(
      -fighter.width / 2,
      -fighter.height,
      fighter.width,
      fighter.height
    );

    // Add evolution-specific visual enhancements
    this.addEvolutionEnhancements(ctx, fighter);

    ctx.globalAlpha = 1;
  }

  /**
   * Add evolution-specific visual enhancements to sprite
   */
  addEvolutionEnhancements(ctx, fighter) {
    const evolution = fighter.evolutionStage;

    switch (evolution) {
      case 1: // Intermediate - subtle glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = fighter.visualTheme.primary;
        break;

      case 2: // Advanced - energy outline
        ctx.strokeStyle = fighter.visualTheme.primary;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          -fighter.width / 2 - 2,
          -fighter.height - 2,
          fighter.width + 4,
          fighter.height + 4
        );
        break;

      case 3: // Master - golden shimmer
        const shimmerGradient = ctx.createLinearGradient(
          -fighter.width / 2, -fighter.height,
          fighter.width / 2, 0
        );
        shimmerGradient.addColorStop(0, 'transparent');
        shimmerGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
        shimmerGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = shimmerGradient;
        ctx.fillRect(
          -fighter.width / 2,
          -fighter.height,
          fighter.width,
          fighter.height
        );
        break;

      case 4: // Legend - reality distortion
        ctx.filter = 'hue-rotate(10deg) brightness(1.2)';
        break;
    }

    ctx.shadowBlur = 0;
    ctx.filter = 'none';
  }

  /**
   * Render aura effect
   */
  renderAura(ctx, fighter) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    this.auraSystem.render(ctx);
    ctx.restore();
  }

  /**
   * Render particle effects
   */
  renderParticles(ctx, fighter) {
    ctx.save();
    this.particleSystem.render(ctx);
    ctx.restore();
  }

  /**
   * Render equipment overlays
   */
  renderEquipment(ctx, fighter) {
    const equipment = fighter.equipment;
    const positions = spriteManager.getEquipmentPositions(fighter.evolutionStage);

    Object.entries(equipment).forEach(([type, item]) => {
      if (item && positions[type]) {
        const pos = positions[type];
        ctx.save();
        ctx.translate(pos.x - fighter.width / 2, pos.y - fighter.height);
        ctx.scale(pos.scale, pos.scale);

        // Draw equipment sprite (placeholder)
        ctx.fillStyle = this.getEquipmentColor(type, fighter.evolutionStage);
        ctx.fillRect(-5, -5, 10, 10);

        ctx.restore();
      }
    });
  }

  /**
   * Render hit effects based on evolution
   */
  renderHitEffects(ctx, effects, position) {
    effects.forEach(effect => {
      ctx.save();
      ctx.translate(effect.position.x - position.x, effect.position.y - position.y);

      switch (effect.type) {
        case 'hit':
          this.renderHitSpark(ctx, effect);
          break;
        case 'energy_wisp':
          this.renderEnergyWisps(ctx, effect);
          break;
        case 'flame_burst':
          this.renderFlameBurst(ctx, effect);
          break;
        case 'golden_explosion':
          this.renderGoldenExplosion(ctx, effect);
          break;
        case 'cosmic_impact':
          this.renderCosmicImpact(ctx, effect);
          break;
        case 'charge_up':
          this.renderChargeUp(ctx, effect);
          break;
        case 'special_impact':
          this.renderSpecialImpact(ctx, effect);
          break;
      }

      ctx.restore();

      // Queue effect for duration management
      this.effectQueue.push({
        effect,
        startTime: Date.now(),
        duration: effect.duration
      });
    });
  }

  /**
   * Render basic hit spark
   */
  renderHitSpark(ctx, effect) {
    const scale = effect.scale || 1;
    const size = 30 * scale;

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#ffffff';
    
    // Draw star-shaped spark
    const spikes = 8;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? size : size * 0.5;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Render energy wisps (Intermediate)
   */
  renderEnergyWisps(ctx, effect) {
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < effect.count; i++) {
      const angle = (Math.PI * 2 * i) / effect.count;
      const x = Math.cos(angle) * effect.spread;
      const y = Math.sin(angle) * effect.spread;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
      gradient.addColorStop(0, effect.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render flame burst (Advanced)
   */
  renderFlameBurst(ctx, effect) {
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = 0; i < effect.count; i++) {
      const angle = (Math.PI * 2 * i) / effect.count;
      const distance = 20 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      const gradient = ctx.createRadialGradient(x, y - 10, 0, x, y + 10, 20);
      gradient.addColorStop(0, effect.color);
      gradient.addColorStop(0.5, this.adjustColor(effect.color, 50));
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, 15, 25, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render golden explosion (Master)
   */
  renderGoldenExplosion(ctx, effect) {
    ctx.globalCompositeOperation = 'lighter';
    
    // Render expanding rings
    for (let ring = 0; ring < effect.rings; ring++) {
      const radius = 30 + ring * 40;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3 - ring;
      ctx.globalAlpha = 0.6 - ring * 0.2;
      
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Add glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = effect.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  /**
   * Render cosmic impact (Legend)
   */
  renderCosmicImpact(ctx, effect) {
    ctx.globalCompositeOperation = 'lighter';
    
    // Create reality distortion effect
    if (effect.distortion) {
      ctx.filter = 'blur(2px) hue-rotate(180deg)';
    }
    
    // Render shockwaves
    for (let wave = 0; wave < effect.shockwaves; wave++) {
      const radius = 50 + wave * 60;
      const gradient = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.8, effect.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.5 - wave * 0.15;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Central void
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Energy corona
    const coronaGradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 40);
    coronaGradient.addColorStop(0, '#000000');
    coronaGradient.addColorStop(0.5, effect.color);
    coronaGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = coronaGradient;
    ctx.fill();
    
    ctx.filter = 'none';
  }

  /**
   * Render charge up effect
   */
  renderChargeUp(ctx, effect) {
    const time = Date.now() * 0.001;
    
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = 0; i < effect.particles; i++) {
      const angle = (Math.PI * 2 * i) / effect.particles + time;
      const radius = 50 + Math.sin(time * 3 + i) * 20;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      ctx.fillStyle = effect.color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, effect.size === 'small' ? 3 : effect.size === 'medium' ? 5 : 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Trail
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /**
   * Apply transformation effects
   */
  applyTransformationEffects(ctx, fighter) {
    const transform = fighter.transformationData;
    
    // Scale effect
    ctx.scale(transform.scale, transform.scale);
    
    // Glow effect
    ctx.shadowBlur = 20 * transform.glowIntensity;
    ctx.shadowColor = fighter.visualTheme.auraColor || fighter.visualTheme.primary;
    
    // Additional evolution-specific effects
    if (transform.effects) {
      switch (transform.effects.type) {
        case 'golden_ascension':
          // Add wing effects
          this.renderWings(ctx, fighter);
          break;
        case 'cosmic_transcendence':
          // Add reality warp
          ctx.filter = 'hue-rotate(45deg) contrast(1.2)';
          break;
      }
    }
  }

  /**
   * Render dodge effect
   */
  renderDodgeEffect(ctx, fighter) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.filter = 'blur(4px)';
    
    // Create afterimage
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.3 - i * 0.1;
      ctx.translate(-10 * (i + 1) * (fighter.facing === 'right' ? -1 : 1), 0);
      ctx.fillStyle = fighter.visualTheme.primary;
      ctx.fillRect(
        -fighter.width / 2,
        -fighter.height,
        fighter.width,
        fighter.height
      );
    }
    
    ctx.restore();
  }

  /**
   * Get animation name from fighter state
   */
  getAnimationFromState(state) {
    const stateToAnimation = {
      'idle': 'idle',
      'walking': 'walk',
      'attacking': 'attack',
      'special': 'special',
      'ultimate': 'ultimate',
      'hurt': 'hurt',
      'victory': 'victory',
      'defeat': 'defeat',
      'charging': 'powerUp',
      'blocking': 'idle',
      'recovery': 'idle',
    };
    
    return stateToAnimation[state] || 'idle';
  }

  /**
   * Helper function to get equipment color
   */
  getEquipmentColor(type, evolutionStage) {
    const colors = {
      'belt': ['#ffffff', '#3498db', '#9b59b6', '#ffd700', '#ff0000'],
      'crown': ['#ffffff', '#3498db', '#9b59b6', '#ffd700', '#ff0000'],
      'gloves': ['#cccccc', '#2471a3', '#7d3c98', '#ca7f0e', '#c0392b'],
    };
    
    return colors[type] ? colors[type][evolutionStage] || '#ffffff' : '#ffffff';
  }

  /**
   * Helper function to adjust color
   */
  adjustColor(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    
    return (usePound ? '#' : '') + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  /**
   * Update effect queue
   */
  update(timestep) {
    // Clean up expired effects
    const now = Date.now();
    this.effectQueue = this.effectQueue.filter(item => {
      return now - item.startTime < item.duration;
    });
    
    // Update systems
    this.particleSystem.update(timestep);
    this.auraSystem.update(timestep);
  }

  /**
   * Clear all effects
   */
  clear() {
    this.effectQueue = [];
    this.activeTransformations.clear();
    this.particleSystem.clear();
    this.auraSystem.clear();
  }
}

// Export singleton instance
export default new EvolutionRenderSystem();