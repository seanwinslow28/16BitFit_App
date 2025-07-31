#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../app/assets');
const BOSS_DIR = path.join(ASSETS_DIR, 'Sprites/BossBattleSpriteSheets');

// Boss configurations
const bosses = [
  { name: 'Rookie_Ryu-Sprite-Sheet.png', color: '#0066CC' },
  { name: 'Fit_Cat-Sprite-Sheet.png', color: '#FF6600' },
  { name: 'Buff_Mage-Sprite-Sheet.png', color: '#9933FF' },
];

async function generateBossSprite(config) {
  console.log(`🎮 Generating ${config.name}...`);
  
  await fs.ensureDir(BOSS_DIR);
  
  const width = 1024;
  const height = 1024;
  
  // Create sprite sheet with character frames
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="transparent"/>
      
      <!-- Idle frames (row 1) -->
      ${[0, 1, 2, 3].map(i => `
        <rect x="${i * 128}" y="0" width="128" height="128" 
              fill="${config.color}" stroke="#000" stroke-width="2"/>
        <text x="${i * 128 + 64}" y="64" font-family="monospace" font-size="12" 
              fill="white" text-anchor="middle">IDLE ${i + 1}</text>
      `).join('')}
      
      <!-- Walk frames (row 2) -->
      ${[0, 1, 2, 3, 4, 5].map(i => `
        <rect x="${i * 128}" y="128" width="128" height="128" 
              fill="${config.color}" stroke="#000" stroke-width="2" opacity="0.9"/>
        <text x="${i * 128 + 64}" y="192" font-family="monospace" font-size="12" 
              fill="white" text-anchor="middle">WALK ${i + 1}</text>
      `).join('')}
      
      <!-- Attack frames (row 3) -->
      ${[0, 1, 2, 3].map(i => `
        <rect x="${i * 128}" y="256" width="128" height="128" 
              fill="${config.color}" stroke="#000" stroke-width="2" opacity="0.8"/>
        <text x="${i * 128 + 64}" y="320" font-family="monospace" font-size="12" 
              fill="white" text-anchor="middle">ATK ${i + 1}</text>
      `).join('')}
      
      <!-- Special frames (row 4) -->
      ${[0, 1, 2, 3].map(i => `
        <rect x="${i * 128}" y="384" width="128" height="128" 
              fill="${config.color}" stroke="#FFD700" stroke-width="3" opacity="0.7"/>
        <text x="${i * 128 + 64}" y="448" font-family="monospace" font-size="12" 
              fill="yellow" text-anchor="middle">SPECIAL ${i + 1}</text>
      `).join('')}
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(BOSS_DIR, config.name));
  
  console.log(`✅ Generated ${config.name}`);
}

async function main() {
  console.log('🏟️ 16BitFit Boss Sprite Generator\n');
  
  try {
    for (const boss of bosses) {
      await generateBossSprite(boss);
    }
    
    console.log('\n✅ All boss sprites generated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();