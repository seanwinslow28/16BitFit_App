#!/usr/bin/env node
/**
 * Generate all placeholder assets for 16BitFit
 * Creates all 68 missing assets identified in the asset scan
 */

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

const APP_ASSETS = path.join(__dirname, '../app/assets');

// Complete list of missing assets based on scan
const MISSING_ASSETS = {
  ui: [
    { path: 'ui/healthbar_bg.png', width: 200, height: 30, color: '#333' },
    { path: 'ui/healthbar_fill.png', width: 200, height: 30, color: '#0f0' },
    { path: 'ui/special_meter_bg.png', width: 150, height: 20, color: '#222' },
    { path: 'ui/special_meter_fill.png', width: 150, height: 20, color: '#ff0' },
    { path: 'ui/combo_counter.png', width: 128, height: 64, color: '#f0f' },
    { path: 'ui/16bitfit_logo.png', width: 256, height: 128, color: '#fff' },
    { path: 'ui/button_attack.png', width: 80, height: 80, color: '#f00' },
    { path: 'ui/button_defend.png', width: 80, height: 80, color: '#00f' },
    { path: 'ui/dpad.png', width: 150, height: 150, color: '#444' },
    { path: 'ui/victory_banner.png', width: 400, height: 100, color: '#ffd700' },
    { path: 'ui/defeat_banner.png', width: 400, height: 100, color: '#dc143c' },
    { path: 'ui/pause_button.png', width: 50, height: 50, color: '#888' },
    { path: 'ui/timer_bg.png', width: 120, height: 40, color: '#222' },
    { path: 'ui/score_bg.png', width: 150, height: 40, color: '#333' }
  ],
  characters: {
    warrior: [
      { path: 'characters/warrior/stage_1.png', width: 128, height: 128, color: '#8B4513' },
      { path: 'characters/warrior/stage_2.png', width: 128, height: 128, color: '#A0522D' },
      { path: 'characters/warrior/stage_3.png', width: 128, height: 128, color: '#CD853F' },
      { path: 'characters/warrior/stage_4.png', width: 128, height: 128, color: '#DEB887' },
      { path: 'characters/warrior/stage_5.png', width: 128, height: 128, color: '#F4A460' },
      { path: 'characters/warrior/icon.png', width: 64, height: 64, color: '#8B4513' }
    ],
    speedster: [
      { path: 'characters/speedster/stage_1.png', width: 128, height: 128, color: '#191970' },
      { path: 'characters/speedster/stage_2.png', width: 128, height: 128, color: '#0000CD' },
      { path: 'characters/speedster/stage_3.png', width: 128, height: 128, color: '#4169E1' },
      { path: 'characters/speedster/stage_4.png', width: 128, height: 128, color: '#6495ED' },
      { path: 'characters/speedster/stage_5.png', width: 128, height: 128, color: '#87CEEB' },
      { path: 'characters/speedster/icon.png', width: 64, height: 64, color: '#191970' }
    ],
    tank: [
      { path: 'characters/tank/stage_1.png', width: 128, height: 128, color: '#2F4F2F' },
      { path: 'characters/tank/stage_2.png', width: 128, height: 128, color: '#228B22' },
      { path: 'characters/tank/stage_3.png', width: 128, height: 128, color: '#32CD32' },
      { path: 'characters/tank/stage_4.png', width: 128, height: 128, color: '#7CFC00' },
      { path: 'characters/tank/stage_5.png', width: 128, height: 128, color: '#ADFF2F' },
      { path: 'characters/tank/icon.png', width: 64, height: 64, color: '#2F4F2F' }
    ]
  },
  effects: [
    { path: 'effects/hit_spark_1.png', width: 64, height: 64, color: '#fff' },
    { path: 'effects/hit_spark_2.png', width: 64, height: 64, color: '#ff0' },
    { path: 'effects/hit_spark_3.png', width: 64, height: 64, color: '#f80' },
    { path: 'effects/block_spark.png', width: 64, height: 64, color: '#08f' },
    { path: 'effects/dust_cloud.png', width: 128, height: 64, color: '#8b7355' },
    { path: 'effects/power_up_aura.png', width: 256, height: 256, color: '#ffd700' },
    { path: 'effects/evolution_glow.png', width: 512, height: 512, color: '#ff00ff' },
    { path: 'effects/special_move_trail.png', width: 256, height: 64, color: '#00ffff' },
    { path: 'effects/impact_shockwave.png', width: 128, height: 128, color: '#ffffff' },
    { path: 'effects/speed_lines.png', width: 320, height: 240, color: '#ffffff' }
  ],
  bosses: [
    { path: 'bosses/boss_1.png', width: 256, height: 256, color: '#8B0000' },
    { path: 'bosses/boss_2.png', width: 256, height: 256, color: '#FF8C00' },
    { path: 'bosses/boss_3.png', width: 256, height: 256, color: '#9400D3' },
    { path: 'bosses/boss_4.png', width: 256, height: 256, color: '#4B0082' },
    { path: 'bosses/boss_5.png', width: 256, height: 256, color: '#000080' },
    { path: 'bosses/boss_6.png', width: 256, height: 256, color: '#2F4F4F' }
  ],
  backgrounds: [
    { path: 'backgrounds/stage_1.png', width: 1920, height: 1080, color: '#1a1a1a' },
    { path: 'backgrounds/stage_2.png', width: 1920, height: 1080, color: '#2a2a2a' },
    { path: 'backgrounds/stage_3.png', width: 1920, height: 1080, color: '#3a3a3a' },
    { path: 'backgrounds/stage_4.png', width: 1920, height: 1080, color: '#4a4a4a' },
    { path: 'backgrounds/stage_5.png', width: 1920, height: 1080, color: '#5a5a5a' },
    { path: 'backgrounds/stage_6.png', width: 1920, height: 1080, color: '#6a6a6a' }
  ],
  misc: [
    { path: 'images/placeholder.png', width: 100, height: 100, color: '#666' },
    { path: 'placeholder.png', width: 100, height: 100, color: '#666' }
  ]
};

// Sound files to create
const SOUND_ASSETS = {
  effects: [
    'sounds/hit_light.mp3',
    'sounds/hit_medium.mp3',
    'sounds/hit_heavy.mp3',
    'sounds/block.mp3',
    'sounds/special_activate.mp3',
    'sounds/combo_1.mp3',
    'sounds/combo_2.mp3',
    'sounds/combo_3.mp3',
    'sounds/evolution.mp3',
    'sounds/victory.mp3',
    'sounds/defeat.mp3',
    'sounds/menu_select.mp3',
    'sounds/menu_back.mp3',
    'sounds/powerup.mp3',
    'sounds/countdown.mp3'
  ]
};

// Generate placeholder image with text
async function generatePlaceholderImage(width, height, text, color, outputPath) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}" opacity="0.8"/>
      <rect x="2" y="2" width="${width-4}" height="${height-4}" fill="none" stroke="#000" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"/>
      <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.08}" fill="#000" text-anchor="middle" dominant-baseline="middle" opacity="0.7">
        ${text}
      </text>
      <text x="${width/2}" y="${height/2 + Math.min(width, height) * 0.1}" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.05}" fill="#000" text-anchor="middle" dominant-baseline="middle" opacity="0.5">
        ${width}x${height}
      </text>
    </svg>
  `;
  
  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to generate ${outputPath}:`, error.message);
  }
}

// Generate silent audio file
async function generateSilentAudio(outputPath) {
  // 1 second of silence in MP3 format (base64)
  const silentMp3 = Buffer.from(
    'SUQzAwAAAAAADlRTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAD/+0DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAEAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMYXZmNTguMjkuMTAwAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    'base64'
  );
  
  try {
    await fs.writeFile(outputPath, silentMp3);
    console.log(`✓ Generated: ${outputPath}`);
  } catch (error) {
    console.error(`✗ Failed to generate ${outputPath}:`, error.message);
  }
}

// Main function
async function main() {
  console.log('🎮 16BitFit Asset Generator');
  console.log('📦 Generating all missing placeholder assets...\n');
  
  let totalGenerated = 0;
  let totalFailed = 0;
  
  // Generate image assets
  for (const [category, assets] of Object.entries(MISSING_ASSETS)) {
    console.log(`\n📁 ${category.toUpperCase()}`);
    
    const assetList = Array.isArray(assets) ? assets : Object.values(assets).flat();
    
    for (const asset of assetList) {
      const outputPath = path.join(APP_ASSETS, asset.path);
      const dir = path.dirname(outputPath);
      
      // Ensure directory exists
      await fs.ensureDir(dir);
      
      // Generate asset name from path
      const name = path.basename(asset.path, '.png')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      try {
        await generatePlaceholderImage(
          asset.width,
          asset.height,
          name,
          asset.color,
          outputPath
        );
        totalGenerated++;
      } catch (error) {
        totalFailed++;
      }
    }
  }
  
  // Generate sound assets
  console.log('\n📁 SOUNDS');
  for (const soundPath of SOUND_ASSETS.effects) {
    const outputPath = path.join(APP_ASSETS, soundPath);
    const dir = path.dirname(outputPath);
    
    await fs.ensureDir(dir);
    
    try {
      await generateSilentAudio(outputPath);
      totalGenerated++;
    } catch (error) {
      totalFailed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully generated: ${totalGenerated} assets`);
  if (totalFailed > 0) {
    console.log(`❌ Failed to generate: ${totalFailed} assets`);
  }
  console.log('='.repeat(50));
  
  console.log('\n📋 Next steps:');
  console.log('1. Run "npm run assets:bundle" to bundle assets for Phaser');
  console.log('2. Run "npm run phaser:build" to build the Phaser game');
  console.log('3. Run the app with "npm run ios" or "npm run android"');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generatePlaceholderImage, generateSilentAudio };