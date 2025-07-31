/**
 * Animation System for sprite animations and visual effects
 * Handles frame-based animations for fighting game characters
 */

// Animation frame data for different actions
const ANIMATION_DATA = {
  idle: {
    frames: 4,
    duration: 8, // frames per animation frame
    loop: true,
  },
  walking: {
    frames: 6,
    duration: 6,
    loop: true,
  },
  jumping: {
    frames: 3,
    duration: 10,
    loop: false,
  },
  attacking: {
    punch: {
      frames: 3,
      duration: 5,
      loop: false,
    },
    kick: {
      frames: 4,
      duration: 5,
      loop: false,
    },
    uppercut: {
      frames: 5,
      duration: 4,
      loop: false,
    },
  },
  hurt: {
    frames: 2,
    duration: 15,
    loop: false,
  },
  blocking: {
    frames: 1,
    duration: 1,
    loop: false,
  },
  special: {
    frames: 6,
    duration: 5,
    loop: false,
  },
  victory: {
    frames: 4,
    duration: 10,
    loop: true,
  },
  defeat: {
    frames: 2,
    duration: 20,
    loop: false,
  },
};

export const AnimationSystem = (entities, { timestep }) => {
  // Update animations for all animated entities
  Object.values(entities).forEach(entity => {
    if (entity.type === 'fighter') {
      updateFighterAnimation(entity, timestep);
    } else if (entity.type === 'projectile') {
      updateProjectileAnimation(entity, timestep);
    } else if (entity.type === 'effect') {
      updateEffectAnimation(entity, timestep);
    }
  });
  
  // Create visual effects
  handleVisualEffects(entities);
  
  return entities;
};

function updateFighterAnimation(fighter, timestep) {
  // Initialize animation state
  if (!fighter.animation) {
    fighter.animation = {
      current: 'idle',
      frame: 0,
      frameTimer: 0,
      finished: false,
    };
  }
  
  const anim = fighter.animation;
  
  // Determine animation based on state
  const newAnimation = getAnimationFromState(fighter);
  
  // Change animation if needed
  if (newAnimation !== anim.current) {
    anim.current = newAnimation;
    anim.frame = 0;
    anim.frameTimer = 0;
    anim.finished = false;
  }
  
  // Get animation data
  const animData = getAnimationData(anim.current, fighter.currentAttack);
  
  if (animData) {
    // Update frame timer
    anim.frameTimer++;
    
    // Advance frame
    if (anim.frameTimer >= animData.duration) {
      anim.frameTimer = 0;
      anim.frame++;
      
      // Handle animation completion
      if (anim.frame >= animData.frames) {
        if (animData.loop) {
          anim.frame = 0;
        } else {
          anim.frame = animData.frames - 1;
          anim.finished = true;
        }
      }
    }
  }
  
  // Update sprite display
  updateSpriteFrame(fighter);
  
  // Handle animation-driven effects
  handleAnimationEffects(fighter, anim);
}

function getAnimationFromState(fighter) {
  // Priority order for animations
  if (fighter.state === 'victory') return 'victory';
  if (fighter.state === 'defeat') return 'defeat';
  if (fighter.state === 'special') return 'special';
  if (fighter.state === 'hurt' && fighter.hitstun > 0) return 'hurt';
  if (fighter.state === 'blocking') return 'blocking';
  if (fighter.state === 'attacking') return 'attacking';
  if (!fighter.grounded) return 'jumping';
  if (Math.abs(fighter.velocity.x) > 50) return 'walking';
  return 'idle';
}

function getAnimationData(animation, attackType) {
  if (animation === 'attacking' && attackType) {
    return ANIMATION_DATA.attacking[attackType] || ANIMATION_DATA.attacking.punch;
  }
  return ANIMATION_DATA[animation] || ANIMATION_DATA.idle;
}

function updateSpriteFrame(fighter) {
  const { animation } = fighter;
  
  // Calculate sprite sheet coordinates
  fighter.spriteFrame = {
    x: animation.frame * fighter.frameWidth,
    y: getAnimationRow(animation.current) * fighter.frameHeight,
    width: fighter.frameWidth,
    height: fighter.frameHeight,
  };
  
  // Apply visual modifiers
  applyVisualModifiers(fighter);
}

function getAnimationRow(animation) {
  // Map animations to sprite sheet rows
  const rowMap = {
    idle: 0,
    walking: 1,
    jumping: 2,
    attacking: 3,
    hurt: 4,
    blocking: 5,
    special: 6,
    victory: 7,
    defeat: 8,
  };
  return rowMap[animation] || 0;
}

function applyVisualModifiers(fighter) {
  // Flash on hit
  if (fighter.hitstun > 0 && Math.floor(fighter.hitstun / 50) % 2 === 0) {
    fighter.tint = 0xFF0000; // Red tint
    fighter.alpha = 0.7;
  } else if (fighter.invincible && fighter.invincibilityFrames % 4 < 2) {
    // Flashing invincibility
    fighter.alpha = 0.5;
  } else {
    fighter.tint = 0xFFFFFF; // Normal
    fighter.alpha = 1.0;
  }
  
  // Scale effects
  if (fighter.state === 'hurt') {
    fighter.scale = 0.95;
  } else if (fighter.state === 'special') {
    fighter.scale = 1.1;
  } else {
    fighter.scale = 1.0;
  }
}

function handleAnimationEffects(fighter, animation) {
  // Trigger effects on specific animation frames
  if (animation.frame === 0 && animation.frameTimer === 0) {
    // New animation started
    if (animation.current === 'special') {
      fighter.auraEffect = true;
    }
  }
  
  // Attack impact frame
  if (animation.current === 'attacking' && 
      animation.frame === Math.floor(getAnimationData('attacking', fighter.currentAttack).frames / 2)) {
    fighter.attackImpactFrame = true;
  }
}

function updateProjectileAnimation(projectile, timestep) {
  if (!projectile.animation) {
    projectile.animation = {
      frame: 0,
      frameTimer: 0,
    };
  }
  
  // Rotate projectile
  projectile.rotation = (projectile.rotation || 0) + 0.2;
  
  // Animate projectile frames
  projectile.animation.frameTimer++;
  if (projectile.animation.frameTimer >= 4) {
    projectile.animation.frameTimer = 0;
    projectile.animation.frame = (projectile.animation.frame + 1) % 4;
  }
  
  // Add trail effect
  projectile.trailAlpha = 0.6;
}

function updateEffectAnimation(effect, timestep) {
  // Update effect lifetime
  effect.lifetime -= timestep / 1000;
  
  // Fade out effect
  effect.alpha = Math.max(0, effect.lifetime / effect.maxLifetime);
  
  // Scale effect
  if (effect.effectType === 'hit') {
    effect.scale = 1 + (1 - effect.alpha) * 0.5;
  } else if (effect.effectType === 'dust') {
    effect.position.y -= 50 * (timestep / 1000);
  }
  
  // Remove expired effects
  if (effect.lifetime <= 0) {
    effect.destroyed = true;
  }
}

function handleVisualEffects(entities) {
  Object.values(entities).forEach(entity => {
    // Create hit effects
    if (entity.triggerHitEffect) {
      const effect = createHitEffect(entity.triggerHitEffect);
      entities[`effect_${Date.now()}`] = effect;
      entity.triggerHitEffect = null;
    }
    
    // Create dust effects for movement
    if (entity.type === 'fighter' && entity.grounded && Math.abs(entity.velocity.x) > 200) {
      if (!entity.lastDustTime || Date.now() - entity.lastDustTime > 100) {
        const dust = createDustEffect(entity.position);
        entities[`dust_${Date.now()}`] = dust;
        entity.lastDustTime = Date.now();
      }
    }
    
    // Create aura effects
    if (entity.auraEffect && entity.specialMeter >= 100) {
      if (!entity.aura) {
        entity.aura = createAuraEffect(entity);
        entities[`aura_${entity.id}`] = entity.aura;
      }
    } else if (entity.aura && entity.specialMeter < 100) {
      entity.aura.destroyed = true;
      entity.aura = null;
    }
  });
  
  // Clean up destroyed effects
  Object.entries(entities).forEach(([key, entity]) => {
    if (entity.destroyed) {
      delete entities[key];
    }
  });
}

function createHitEffect(config) {
  return {
    type: 'effect',
    effectType: 'hit',
    position: { ...config.position },
    scale: 1,
    alpha: 1,
    lifetime: 0.3,
    maxLifetime: 0.3,
    sprite: config.type === 'heavy' ? 'hit_heavy' : 'hit_normal',
  };
}

function createDustEffect(position) {
  return {
    type: 'effect',
    effectType: 'dust',
    position: {
      x: position.x + (Math.random() - 0.5) * 20,
      y: position.y,
    },
    scale: 0.5 + Math.random() * 0.5,
    alpha: 0.6,
    lifetime: 0.5,
    maxLifetime: 0.5,
    sprite: 'dust',
  };
}

function createAuraEffect(fighter) {
  return {
    type: 'effect',
    effectType: 'aura',
    followEntity: fighter.id,
    offset: { x: 0, y: -fighter.height / 2 },
    scale: 1.5,
    alpha: 0.6,
    lifetime: Infinity,
    sprite: 'aura',
  };
}