/**
 * Aura Effect System
 * Manages aura effects for different evolution stages
 * Creates dynamic energy fields around characters
 */

class Aura {
  constructor(config) {
    this.ownerId = config.ownerId;
    this.position = config.position || { x: 0, y: 0 };
    this.baseSize = config.size || 80;
    this.size = this.baseSize;
    this.color = config.color || '#ffffff';
    this.intensity = config.intensity || 0.5;
    this.pulseSpeed = config.pulseSpeed || 2;
    this.pulseAmount = config.pulseAmount || 0.1;
    this.layers = config.layers || 2;
    this.rotation = 0;
    this.rotationSpeed = config.rotationSpeed || 0.5;
    this.time = 0;
    this.active = true;
    this.particles = [];
    this.distortionField = config.distortionField || false;
    this.lightningBolts = config.lightningBolts || false;
  }

  update(deltaTime, updates = {}) {
    if (!this.active) return;

    this.time += deltaTime / 1000;

    // Update position
    if (updates.position) {
      this.position = { ...updates.position };
    }

    // Update intensity
    if (updates.intensity !== undefined) {
      this.intensity = updates.intensity;
    }

    // Pulse effect
    const pulseFactor = 1 + Math.sin(this.time * this.pulseSpeed) * this.pulseAmount;
    this.size = this.baseSize * pulseFactor;

    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime / 1000;

    // Update aura particles
    this.updateParticles(deltaTime);

    // Generate lightning bolts for high-level auras
    if (this.lightningBolts && Math.random() < 0.05) {
      this.generateLightningBolt();
    }
  }

  updateParticles(deltaTime) {
    // Remove old particles
    this.particles = this.particles.filter(p => p.lifetime > 0);

    // Update existing particles
    this.particles.forEach(particle => {
      particle.lifetime -= deltaTime;
      particle.angle += particle.speed * deltaTime / 1000;
      particle.radius += particle.expansion * deltaTime / 1000;
      particle.alpha = Math.max(0, particle.lifetime / particle.maxLifetime);
    });

    // Generate new particles
    if (this.intensity > 0.3 && this.particles.length < 20) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: this.size * 0.8,
        speed: (Math.random() - 0.5) * 2,
        expansion: 10,
        lifetime: 1000,
        maxLifetime: 1000,
        alpha: 1,
        size: 4 + Math.random() * 4,
      });
    }
  }

  generateLightningBolt() {
    const bolt = {
      start: Math.random() * Math.PI * 2,
      end: Math.random() * Math.PI * 2,
      segments: [],
      lifetime: 200,
      maxLifetime: 200,
    };

    // Generate bolt segments
    const segmentCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i <= segmentCount; i++) {
      const t = i / segmentCount;
      const angle = bolt.start + (bolt.end - bolt.start) * t;
      const radius = this.size * (0.8 + Math.random() * 0.4);
      const offset = (Math.random() - 0.5) * 20;
      
      bolt.segments.push({
        angle: angle + offset * 0.1,
        radius: radius,
      });
    }

    this.particles.push({ type: 'lightning', ...bolt });
  }

  render(ctx) {
    if (!this.active || this.intensity <= 0) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Render multiple aura layers
    for (let layer = this.layers - 1; layer >= 0; layer--) {
      this.renderAuraLayer(ctx, layer);
    }

    // Render particles
    this.renderParticles(ctx);

    // Render distortion field for highest evolution
    if (this.distortionField) {
      this.renderDistortionField(ctx);
    }

    ctx.restore();
  }

  renderAuraLayer(ctx, layer) {
    const layerScale = 1 + layer * 0.2;
    const layerAlpha = this.intensity * (1 - layer * 0.3);
    const layerSize = this.size * layerScale;

    ctx.save();
    ctx.rotate(this.rotation + layer * 0.5);
    ctx.globalAlpha = layerAlpha;

    // Create gradient
    const gradient = ctx.createRadialGradient(0, 0, layerSize * 0.3, 0, 0, layerSize);
    gradient.addColorStop(0, this.adjustColorAlpha(this.color, 0.8));
    gradient.addColorStop(0.5, this.adjustColorAlpha(this.color, 0.4));
    gradient.addColorStop(0.8, this.adjustColorAlpha(this.color, 0.1));
    gradient.addColorStop(1, 'transparent');

    // Draw aura shape
    ctx.fillStyle = gradient;
    
    if (layer === 0) {
      // Inner layer - smooth circle
      ctx.beginPath();
      ctx.arc(0, 0, layerSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Outer layers - distorted shape
      this.drawDistortedCircle(ctx, layerSize, 8 + layer * 4);
      ctx.fill();
    }

    // Add glow effect
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = this.adjustColorAlpha(this.color, 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, layerSize * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
  }

  drawDistortedCircle(ctx, radius, points) {
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const distortion = 1 + Math.sin(angle * 3 + this.time * 2) * 0.1;
      const r = radius * distortion;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }

  renderParticles(ctx) {
    ctx.globalCompositeOperation = 'lighter';
    
    this.particles.forEach(particle => {
      if (particle.type === 'lightning') {
        this.renderLightningBolt(ctx, particle);
      } else {
        this.renderAuraParticle(ctx, particle);
      }
    });
    
    ctx.globalCompositeOperation = 'source-over';
  }

  renderAuraParticle(ctx, particle) {
    const x = Math.cos(particle.angle) * particle.radius;
    const y = Math.sin(particle.angle) * particle.radius;
    
    ctx.globalAlpha = particle.alpha * this.intensity;
    ctx.fillStyle = this.color;
    
    // Particle glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.5, this.adjustColorAlpha(this.color, 0.5));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderLightningBolt(ctx, bolt) {
    ctx.globalAlpha = (bolt.lifetime / bolt.maxLifetime) * this.intensity;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2 + Math.random() * 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    
    ctx.beginPath();
    bolt.segments.forEach((segment, index) => {
      const x = Math.cos(segment.angle) * segment.radius;
      const y = Math.sin(segment.angle) * segment.radius;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Add bright core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha *= 0.5;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }

  renderDistortionField(ctx) {
    // Create a subtle warping effect for Legend tier
    ctx.globalAlpha = this.intensity * 0.3;
    
    const segments = 16;
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = this.size * (1.2 + ring * 0.3);
      
      ctx.strokeStyle = this.adjustColorAlpha(this.color, 0.2 - ring * 0.05);
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const warp = Math.sin(angle * 4 + this.time * 3 + ring) * 10;
        const x = Math.cos(angle) * (ringRadius + warp);
        const y = Math.sin(angle) * (ringRadius + warp);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  adjustColorAlpha(color, alpha) {
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

export default class AuraEffectSystem {
  constructor() {
    this.auras = new Map();
  }

  createAura(ownerId, config) {
    const aura = new Aura({ ownerId, ...config });
    this.auras.set(ownerId, aura);
    return aura;
  }

  updateAura(ownerId, updates) {
    const aura = this.auras.get(ownerId);
    if (aura) {
      // Apply evolution-specific aura configurations
      if (updates.evolutionStage !== undefined) {
        this.applyEvolutionConfig(aura, updates.evolutionStage);
      }
    }
  }

  applyEvolutionConfig(aura, evolutionStage) {
    const configs = {
      1: { // Intermediate
        layers: 2,
        pulseSpeed: 2,
        pulseAmount: 0.1,
        rotationSpeed: 0.5,
      },
      2: { // Advanced
        layers: 3,
        pulseSpeed: 3,
        pulseAmount: 0.15,
        rotationSpeed: 0.8,
      },
      3: { // Master
        layers: 3,
        pulseSpeed: 4,
        pulseAmount: 0.2,
        rotationSpeed: 1,
        lightningBolts: true,
      },
      4: { // Legend
        layers: 4,
        pulseSpeed: 5,
        pulseAmount: 0.25,
        rotationSpeed: 1.5,
        lightningBolts: true,
        distortionField: true,
      },
    };

    const config = configs[evolutionStage];
    if (config) {
      Object.assign(aura, config);
    }
  }

  removeAura(ownerId) {
    this.auras.delete(ownerId);
  }

  update(deltaTime) {
    this.auras.forEach((aura, ownerId) => {
      aura.update(deltaTime);
    });
  }

  render(ctx) {
    // Render auras in order of intensity (weakest first)
    const sortedAuras = Array.from(this.auras.values()).sort((a, b) => a.intensity - b.intensity);
    
    sortedAuras.forEach(aura => {
      aura.render(ctx);
    });
  }

  setAuraIntensity(ownerId, intensity) {
    const aura = this.auras.get(ownerId);
    if (aura) {
      aura.intensity = Math.max(0, Math.min(1, intensity));
    }
  }

  pulseAura(ownerId, duration = 1000) {
    const aura = this.auras.get(ownerId);
    if (aura) {
      const originalIntensity = aura.intensity;
      aura.intensity = Math.min(1, aura.intensity * 2);
      
      setTimeout(() => {
        if (this.auras.has(ownerId)) {
          aura.intensity = originalIntensity;
        }
      }, duration);
    }
  }

  clear() {
    this.auras.clear();
  }
}