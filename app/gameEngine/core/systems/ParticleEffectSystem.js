/**
 * Particle Effect System
 * Manages particle effects for evolution stages and combat
 * Optimized for 60fps mobile performance
 */

class Particle {
  constructor(config) {
    this.position = { ...config.position };
    this.velocity = { ...config.velocity };
    this.acceleration = config.acceleration || { x: 0, y: 0 };
    this.lifetime = config.lifetime || 1000;
    this.age = 0;
    this.color = config.color || '#ffffff';
    this.size = config.size || 4;
    this.alpha = config.alpha || 1;
    this.fadeRate = config.fadeRate || 0.001;
    this.shrinkRate = config.shrinkRate || 0;
    this.rotation = config.rotation || 0;
    this.rotationSpeed = config.rotationSpeed || 0;
    this.type = config.type || 'default';
    this.trail = config.trail || false;
    this.trailPositions = [];
  }

  update(deltaTime) {
    this.age += deltaTime;
    
    // Update position
    this.position.x += this.velocity.x * deltaTime / 1000;
    this.position.y += this.velocity.y * deltaTime / 1000;
    
    // Update velocity
    this.velocity.x += this.acceleration.x * deltaTime / 1000;
    this.velocity.y += this.acceleration.y * deltaTime / 1000;
    
    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime / 1000;
    
    // Update alpha
    const lifePercent = this.age / this.lifetime;
    this.alpha = Math.max(0, 1 - lifePercent * this.fadeRate);
    
    // Update size
    if (this.shrinkRate > 0) {
      this.size = Math.max(1, this.size - this.shrinkRate * deltaTime / 1000);
    }
    
    // Update trail
    if (this.trail) {
      this.trailPositions.push({ ...this.position, alpha: this.alpha * 0.5 });
      if (this.trailPositions.length > 5) {
        this.trailPositions.shift();
      }
    }
    
    return this.age < this.lifetime;
  }

  render(ctx) {
    ctx.save();
    
    // Draw trail
    if (this.trail && this.trailPositions.length > 0) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size * 0.5;
      ctx.beginPath();
      this.trailPositions.forEach((pos, index) => {
        ctx.globalAlpha = pos.alpha * (index / this.trailPositions.length);
        if (index === 0) {
          ctx.moveTo(pos.x, pos.y);
        } else {
          ctx.lineTo(pos.x, pos.y);
        }
      });
      ctx.stroke();
    }
    
    // Draw particle
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    
    switch (this.type) {
      case 'star':
        this.drawStar(ctx);
        break;
      case 'spark':
        this.drawSpark(ctx);
        break;
      case 'flame':
        this.drawFlame(ctx);
        break;
      case 'wisp':
        this.drawWisp(ctx);
        break;
      case 'cosmic':
        this.drawCosmic(ctx);
        break;
      default:
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    }
    
    ctx.restore();
  }

  drawStar(ctx) {
    const spikes = 5;
    const outerRadius = this.size;
    const innerRadius = this.size * 0.5;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
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

  drawSpark(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(this.size * 0.3, 0);
    ctx.lineTo(0, this.size);
    ctx.lineTo(-this.size * 0.3, 0);
    ctx.closePath();
    ctx.fill();
  }

  drawFlame(ctx) {
    const gradient = ctx.createRadialGradient(0, this.size/2, 0, 0, -this.size/2, this.size);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.5, this.adjustColor(this.color, 50));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWisp(ctx) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCosmic(ctx) {
    // Inner core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer glow
    const gradient = ctx.createRadialGradient(0, 0, this.size * 0.3, 0, 0, this.size);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.5, this.adjustColor(this.color, -50));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

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
}

class ParticleEmitter {
  constructor(config) {
    this.position = config.position;
    this.particleConfig = config.particleConfig;
    this.emissionRate = config.emissionRate || 10;
    this.maxParticles = config.maxParticles || 100;
    this.spread = config.spread || { x: 10, y: 10 };
    this.particles = [];
    this.active = true;
    this.timeSinceLastEmission = 0;
    this.burstMode = config.burstMode || false;
    this.orbit = config.orbit || false;
    this.orbitRadius = config.orbitRadius || 50;
    this.orbitSpeed = config.orbitSpeed || 1;
    this.orbitAngle = 0;
  }

  update(deltaTime) {
    if (!this.active) return;

    // Update existing particles
    this.particles = this.particles.filter(particle => particle.update(deltaTime));

    // Emit new particles
    if (!this.burstMode) {
      this.timeSinceLastEmission += deltaTime;
      const emissionInterval = 1000 / this.emissionRate;
      
      while (this.timeSinceLastEmission > emissionInterval && this.particles.length < this.maxParticles) {
        this.emitParticle();
        this.timeSinceLastEmission -= emissionInterval;
      }
    }

    // Update orbit
    if (this.orbit) {
      this.orbitAngle += this.orbitSpeed * deltaTime / 1000;
    }
  }

  emitParticle() {
    const config = { ...this.particleConfig };
    
    // Add position spread
    config.position = {
      x: this.position.x + (Math.random() - 0.5) * this.spread.x,
      y: this.position.y + (Math.random() - 0.5) * this.spread.y,
    };
    
    // Add velocity spread
    if (!config.velocity) {
      config.velocity = { x: 0, y: 0 };
    }
    config.velocity.x += (Math.random() - 0.5) * 100;
    config.velocity.y += (Math.random() - 0.5) * 100;
    
    // Add orbit motion
    if (this.orbit) {
      const orbitX = Math.cos(this.orbitAngle) * this.orbitRadius;
      const orbitY = Math.sin(this.orbitAngle) * this.orbitRadius;
      config.position.x += orbitX;
      config.position.y += orbitY;
      
      // Tangential velocity for orbit
      config.velocity.x += -Math.sin(this.orbitAngle) * this.orbitSpeed * 50;
      config.velocity.y += Math.cos(this.orbitAngle) * this.orbitSpeed * 50;
    }
    
    this.particles.push(new Particle(config));
  }

  burst(count) {
    for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
      this.emitParticle();
    }
  }

  render(ctx) {
    this.particles.forEach(particle => particle.render(ctx));
  }
}

export default class ParticleEffectSystem {
  constructor() {
    this.emitters = new Map();
    this.effects = [];
    this.particlePool = [];
    this.maxPoolSize = 500;
  }

  createEmitter(id, config) {
    const emitter = new ParticleEmitter(config);
    this.emitters.set(id, emitter);
    return emitter;
  }

  updateEmitter(id, updates) {
    const emitter = this.emitters.get(id);
    if (emitter) {
      Object.assign(emitter, updates);
    }
  }

  removeEmitter(id) {
    this.emitters.delete(id);
  }

  createBurst(config) {
    const effect = {
      particles: [],
      lifetime: config.duration || 1000,
      age: 0,
    };

    // Create burst particles
    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 * i) / config.count;
      const speed = config.speed || 100;
      
      const particle = new Particle({
        position: { ...config.position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        color: config.color,
        size: config.size || 6,
        type: config.particleType || 'default',
        lifetime: config.particleLifetime || 1000,
        trail: config.trail || false,
      });
      
      effect.particles.push(particle);
    }
    
    this.effects.push(effect);
  }

  createEvolutionEffect(evolutionStage, position) {
    const configs = {
      1: { // Intermediate
        count: 20,
        color: '#3498db',
        particleType: 'wisp',
        speed: 80,
        size: 8,
      },
      2: { // Advanced
        count: 30,
        color: '#9b59b6',
        particleType: 'flame',
        speed: 100,
        size: 10,
      },
      3: { // Master
        count: 40,
        color: '#ffd700',
        particleType: 'star',
        speed: 120,
        size: 12,
        trail: true,
      },
      4: { // Legend
        count: 50,
        color: '#ff0000',
        particleType: 'cosmic',
        speed: 150,
        size: 15,
        trail: true,
      },
    };

    const config = configs[evolutionStage];
    if (config) {
      this.createBurst({ ...config, position });
    }
  }

  update(deltaTime) {
    // Update emitters
    this.emitters.forEach(emitter => emitter.update(deltaTime));

    // Update one-off effects
    this.effects = this.effects.filter(effect => {
      effect.age += deltaTime;
      effect.particles = effect.particles.filter(particle => particle.update(deltaTime));
      return effect.age < effect.lifetime || effect.particles.length > 0;
    });
  }

  render(ctx) {
    // Enable additive blending for better visual effects
    ctx.globalCompositeOperation = 'lighter';

    // Render emitter particles
    this.emitters.forEach(emitter => emitter.render(ctx));

    // Render effect particles
    this.effects.forEach(effect => {
      effect.particles.forEach(particle => particle.render(ctx));
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }

  clear() {
    this.emitters.clear();
    this.effects = [];
  }
}