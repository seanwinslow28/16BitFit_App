import Matter from 'matter-js';

// Fighting game optimized engine configuration
export const GameEngineConfig = {
  fps: 60,
  maxUpdateDelta: 1000 / 60,
  enableSleeping: false, // Keep fighters always active
  renderer: {
    background: 'transparent',
    wireframes: false,
    showVelocity: false,
  },
};

// Physics world setup for 2D fighting
export const createWorld = () => {
  const engine = Matter.Engine.create();
  
  // Fighting game physics settings
  engine.world.gravity.x = 0;
  engine.world.gravity.y = 1; // Standard gravity for jumping
  
  // Performance optimizations
  engine.enableSleeping = false;
  engine.constraintIterations = 2;
  engine.positionIterations = 6;
  engine.velocityIterations = 4;
  
  return engine;
};

// Arena boundaries
export const ARENA_BOUNDS = {
  width: 800,
  height: 400,
  groundY: 350,
};

// Fighter physics presets
export const FIGHTER_PHYSICS = {
  width: 64,
  height: 96,
  mass: 1,
  friction: 0.8,
  frictionAir: 0.02,
  restitution: 0,
  inertia: Infinity, // Prevent rotation
};

// Input buffer for combo detection
export class InputBuffer {
  constructor(bufferTime = 500) {
    this.buffer = [];
    this.bufferTime = bufferTime;
  }

  add(input) {
    const now = Date.now();
    this.buffer.push({ input, time: now });
    this.cleanup(now);
  }

  cleanup(currentTime) {
    this.buffer = this.buffer.filter(
      item => currentTime - item.time < this.bufferTime
    );
  }

  checkCombo(pattern) {
    if (this.buffer.length < pattern.length) return false;
    
    const recentInputs = this.buffer.slice(-pattern.length);
    return pattern.every((input, index) => 
      recentInputs[index].input === input
    );
  }

  clear() {
    this.buffer = [];
  }
}