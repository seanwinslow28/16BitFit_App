/**
 * Physics System for 2D fighting game
 * Handles movement, gravity, collisions, and boundaries
 */

import { GAME_CONFIG } from '../GameEngine';

const GRAVITY = 980; // pixels/second^2
const GROUND_FRICTION = 0.85;
const AIR_FRICTION = 0.98;
const MAX_VELOCITY = { x: 800, y: 1000 };

export const PhysicsSystem = (entities, { timestep }) => {
  const dt = timestep / 1000; // Convert to seconds
  
  // Update all physics bodies
  Object.keys(entities).forEach(key => {
    const entity = entities[key];
    
    if (entity.type === 'fighter' && entity.position && entity.velocity) {
      updatePhysics(entity, dt);
      checkBoundaries(entity);
      checkGroundCollision(entity);
    }
    
    // Update projectiles
    if (entity.type === 'projectile') {
      updateProjectile(entity, dt);
    }
  });
  
  // Check fighter collisions
  checkFighterCollisions(entities);
  
  return entities;
};

function updatePhysics(entity, dt) {
  // Previous position for interpolation
  entity.previousPosition = {
    x: entity.position.x,
    y: entity.position.y,
  };
  
  // Apply gravity if not grounded
  if (!entity.grounded) {
    entity.velocity.y += GRAVITY * dt;
  }
  
  // Apply friction
  const friction = entity.grounded ? GROUND_FRICTION : AIR_FRICTION;
  entity.velocity.x *= friction;
  
  // Clamp velocities
  entity.velocity.x = Math.max(-MAX_VELOCITY.x, Math.min(MAX_VELOCITY.x, entity.velocity.x));
  entity.velocity.y = Math.max(-MAX_VELOCITY.y, Math.min(MAX_VELOCITY.y, entity.velocity.y));
  
  // Update position
  entity.position.x += entity.velocity.x * dt;
  entity.position.y += entity.velocity.y * dt;
  
  // Handle special states
  if (entity.state === 'dashing') {
    entity.dashFrames = (entity.dashFrames || 0) + 1;
    if (entity.dashFrames > 10) {
      entity.state = 'idle';
      entity.dashFrames = 0;
    }
  }
  
  // Update hitbox position
  if (entity.hitbox) {
    entity.hitbox.x = entity.position.x - entity.hitbox.width / 2;
    entity.hitbox.y = entity.position.y - entity.hitbox.height;
  }
}

function checkBoundaries(entity) {
  const { arena } = GAME_CONFIG;
  const halfWidth = entity.width / 2;
  
  // Horizontal boundaries
  if (entity.position.x - halfWidth < 0) {
    entity.position.x = halfWidth;
    entity.velocity.x = 0;
  } else if (entity.position.x + halfWidth > arena.width) {
    entity.position.x = arena.width - halfWidth;
    entity.velocity.x = 0;
  }
  
  // Vertical boundaries (ceiling)
  if (entity.position.y < 0) {
    entity.position.y = 0;
    entity.velocity.y = 0;
  }
}

function checkGroundCollision(entity) {
  const { arena } = GAME_CONFIG;
  const groundY = arena.floorY;
  
  if (entity.position.y >= groundY) {
    entity.position.y = groundY;
    entity.velocity.y = 0;
    entity.grounded = true;
    
    // Reset jump count when landing
    entity.jumpsRemaining = entity.maxJumps || 1;
    
    // Change state if landing from jump
    if (entity.state === 'jumping') {
      entity.state = 'idle';
    }
  } else {
    entity.grounded = false;
  }
}

function checkFighterCollisions(entities) {
  const fighters = Object.values(entities).filter(e => e.type === 'fighter');
  
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const fighter1 = fighters[i];
      const fighter2 = fighters[j];
      
      if (checkCollision(fighter1, fighter2)) {
        resolveFighterCollision(fighter1, fighter2);
      }
    }
  }
}

function checkCollision(entity1, entity2) {
  if (!entity1.hitbox || !entity2.hitbox) return false;
  
  return !(
    entity1.hitbox.x + entity1.hitbox.width < entity2.hitbox.x ||
    entity2.hitbox.x + entity2.hitbox.width < entity1.hitbox.x ||
    entity1.hitbox.y + entity1.hitbox.height < entity2.hitbox.y ||
    entity2.hitbox.y + entity2.hitbox.height < entity1.hitbox.y
  );
}

function resolveFighterCollision(fighter1, fighter2) {
  // Calculate push direction
  const dx = fighter1.position.x - fighter2.position.x;
  const pushForce = 200;
  
  // Push fighters apart
  if (dx > 0) {
    fighter1.velocity.x += pushForce;
    fighter2.velocity.x -= pushForce;
  } else {
    fighter1.velocity.x -= pushForce;
    fighter2.velocity.x += pushForce;
  }
  
  // Prevent overlapping
  const overlap = (fighter1.hitbox.width + fighter2.hitbox.width) / 2 - Math.abs(dx);
  if (overlap > 0) {
    const separationX = overlap / 2;
    if (dx > 0) {
      fighter1.position.x += separationX;
      fighter2.position.x -= separationX;
    } else {
      fighter1.position.x -= separationX;
      fighter2.position.x += separationX;
    }
  }
}

function updateProjectile(projectile, dt) {
  // Update projectile position
  projectile.position.x += projectile.velocity.x * dt;
  projectile.position.y += projectile.velocity.y * dt;
  
  // Update lifetime
  projectile.lifetime -= dt;
  
  // Remove if expired or out of bounds
  if (projectile.lifetime <= 0 || 
      projectile.position.x < -50 || 
      projectile.position.x > GAME_CONFIG.arena.width + 50) {
    projectile.destroyed = true;
  }
}