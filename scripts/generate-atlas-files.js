#!/usr/bin/env node

/**
 * Generate missing texture atlas files for 16BitFit
 */

const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// Define assets directory
const ASSETS_DIR = path.join(__dirname, '../app/assets');

// Atlas configurations
const atlases = [
  {
    name: 'effects_atlas',
    path: path.join(ASSETS_DIR, 'effects/effects_atlas.png'),
    width: 512,
    height: 512,
    backgroundColor: { r: 0, g: 0, b: 0, alpha: 0 },
    frames: [
      // Hit effects
      { x: 0, y: 0, w: 64, h: 64, color: '#FFD700' }, // Gold hit
      { x: 64, y: 0, w: 64, h: 64, color: '#FFA500' }, // Orange hit
      { x: 128, y: 0, w: 64, h: 64, color: '#FF4500' }, // Red hit
      // Block effects
      { x: 0, y: 64, w: 64, h: 64, color: '#00CED1' }, // Blue block
      { x: 64, y: 64, w: 64, h: 64, color: '#4169E1' }, // Royal blue
      // Special effects
      { x: 0, y: 128, w: 128, h: 128, color: '#FF00FF' }, // Purple special
      { x: 128, y: 128, w: 128, h: 128, color: '#00FF00' }, // Green special
      // Evolution effects
      { x: 0, y: 256, w: 256, h: 256, color: '#FFD700' }, // Gold evolution
    ]
  },
  {
    name: 'Sean_Fighter-Sprite-Sheet',
    path: path.join(ASSETS_DIR, 'Sprites/BossBattleSpriteSheets/Sean_Fighter-Sprite-Sheet.png'),
    width: 1024,
    height: 1024,
    backgroundColor: { r: 0, g: 0, b: 0, alpha: 0 },
    frames: [
      // Idle frames (128x128)
      { x: 0, y: 0, w: 128, h: 128, color: '#4B0082' },
      { x: 128, y: 0, w: 128, h: 128, color: '#4B0082' },
      { x: 256, y: 0, w: 128, h: 128, color: '#4B0082' },
      { x: 384, y: 0, w: 128, h: 128, color: '#4B0082' },
      // Walk frames
      { x: 0, y: 128, w: 128, h: 128, color: '#483D8B' },
      { x: 128, y: 128, w: 128, h: 128, color: '#483D8B' },
      { x: 256, y: 128, w: 128, h: 128, color: '#483D8B' },
      { x: 384, y: 128, w: 128, h: 128, color: '#483D8B' },
      { x: 512, y: 128, w: 128, h: 128, color: '#483D8B' },
      { x: 640, y: 128, w: 128, h: 128, color: '#483D8B' },
      // Punch frames
      { x: 0, y: 256, w: 128, h: 128, color: '#6A5ACD' },
      { x: 128, y: 256, w: 128, h: 128, color: '#6A5ACD' },
      { x: 256, y: 256, w: 128, h: 128, color: '#6A5ACD' },
      { x: 384, y: 256, w: 128, h: 128, color: '#6A5ACD' },
    ]
  },
  {
    name: 'Gym_Bully-Sprite-Sheet',
    path: path.join(ASSETS_DIR, 'Sprites/BossBattleSpriteSheets/Gym_Bully-Sprite-Sheet.png'),
    width: 1024,
    height: 1024,
    backgroundColor: { r: 0, g: 0, b: 0, alpha: 0 },
    frames: [
      // Boss idle frames
      { x: 0, y: 0, w: 128, h: 128, color: '#DC143C' },
      { x: 128, y: 0, w: 128, h: 128, color: '#DC143C' },
      { x: 256, y: 0, w: 128, h: 128, color: '#DC143C' },
      { x: 384, y: 0, w: 128, h: 128, color: '#DC143C' },
      // Boss attack frames
      { x: 0, y: 128, w: 128, h: 128, color: '#B22222' },
      { x: 128, y: 128, w: 128, h: 128, color: '#B22222' },
      { x: 256, y: 128, w: 128, h: 128, color: '#B22222' },
      { x: 384, y: 128, w: 128, h: 128, color: '#B22222' },
    ]
  }
];

async function generateAtlas(config) {
  console.log(`📋 Generating ${config.name}...`);
  
  // Ensure directory exists
  await fs.ensureDir(path.dirname(config.path));
  
  // Create base image
  const baseImage = sharp({
    create: {
      width: config.width,
      height: config.height,
      channels: 4,
      background: config.backgroundColor
    }
  });
  
  // Create composite layers for each frame
  const composites = config.frames.map(frame => {
    // Create a simple colored rectangle for each frame
    const svg = `
      <svg width="${frame.w}" height="${frame.h}">
        <rect x="0" y="0" width="${frame.w}" height="${frame.h}" 
              fill="${frame.color}" 
              stroke="#000000" 
              stroke-width="2"/>
        <text x="${frame.w/2}" y="${frame.h/2}" 
              font-family="monospace" 
              font-size="14" 
              fill="white" 
              text-anchor="middle" 
              dominant-baseline="middle">
          ${frame.w}x${frame.h}
        </text>
      </svg>
    `;
    
    return {
      input: Buffer.from(svg),
      left: frame.x,
      top: frame.y
    };
  });
  
  // Generate the atlas
  await baseImage
    .composite(composites)
    .png()
    .toFile(config.path);
  
  console.log(`✅ Generated ${config.name} (${config.width}x${config.height})`);
}

async function main() {
  console.log('🎮 16BitFit Atlas Generator');
  console.log('📦 Generating missing texture atlases...\n');
  
  try {
    // Generate all atlases
    for (const atlas of atlases) {
      await generateAtlas(atlas);
    }
    
    console.log('\n✅ All texture atlases generated successfully!');
    console.log('🚀 You can now run the app without atlas loading errors.');
  } catch (error) {
    console.error('❌ Error generating atlases:', error);
    process.exit(1);
  }
}

// Run the generator
main();