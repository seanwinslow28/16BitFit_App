/**
 * Fixed timestep game loop for consistent 60fps fighting game mechanics
 * Implements Glenn Fiedler's "Fix Your Timestep" approach
 */

export const GameLoop = (entities, { time }) => {
  // The main game loop is handled by the GameEngine component
  // This system acts as a coordinator for other systems
  
  const gameState = entities._gameState || 'fighting';
  
  if (gameState !== 'fighting') {
    return entities;
  }
  
  // Update frame counter for performance tracking
  if (!entities._frameData) {
    entities._frameData = {
      frameCount: 0,
      lastFrameTime: time,
      deltaTime: 0,
      fps: 60,
    };
  }
  
  const frameData = entities._frameData;
  frameData.frameCount++;
  frameData.deltaTime = time - frameData.lastFrameTime;
  frameData.lastFrameTime = time;
  
  // Calculate FPS
  if (frameData.frameCount % 30 === 0) {
    frameData.fps = Math.round(1000 / (frameData.deltaTime || 16.67));
  }
  
  return entities;
};