#!/usr/bin/env node
/**
 * Bundle Phaser assets for React Native WebView
 * This script prepares and copies assets to the correct locations for iOS and Android
 */

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const PHASER_SRC_ASSETS = path.join(__dirname, '../phaser-game/src/assets');
const PHASER_DIST_ASSETS = path.join(__dirname, '../phaser-game/dist/assets');
const IOS_ASSETS = path.join(__dirname, '../ios/16BitFit/phaser-assets');
const ANDROID_ASSETS = path.join(__dirname, '../android/app/src/main/assets/phaser-assets');

// Asset manifest for bundling
const ASSET_MANIFEST = {
  ui: [
    { name: 'ui_sprites.png', width: 1024, height: 1024 },
    { name: 'ui_sprites.json', type: 'atlas' },
    { name: 'healthbar_bg.png', width: 200, height: 30 },
    { name: 'healthbar_fill.png', width: 200, height: 30 },
    { name: 'special_meter_bg.png', width: 150, height: 20 },
    { name: 'special_meter_fill.png', width: 150, height: 20 },
    { name: 'combo_counter.png', width: 128, height: 64 },
    { name: '16bitfit_logo.png', width: 256, height: 128 },
    { name: 'button_attack.png', width: 80, height: 80 },
    { name: 'button_defend.png', width: 80, height: 80 },
    { name: 'dpad.png', width: 150, height: 150 }
  ],
  characters: {
    base: [
      { name: 'sprites.png', width: 2048, height: 2048 },
      { name: 'sprites.json', type: 'atlas' }
    ],
    warrior: {
      stages: [1, 2, 3, 4, 5].map(stage => ([
        { name: `stage_${stage}_sprites.png`, width: 1024, height: 1024 },
        { name: `stage_${stage}_sprites.json`, type: 'atlas' }
      ])).flat()
    },
    speedster: {
      stages: [1, 2, 3, 4, 5].map(stage => ([
        { name: `stage_${stage}_sprites.png`, width: 1024, height: 1024 },
        { name: `stage_${stage}_sprites.json`, type: 'atlas' }
      ])).flat()
    },
    tank: {
      stages: [1, 2, 3, 4, 5].map(stage => ([
        { name: `stage_${stage}_sprites.png`, width: 1024, height: 1024 },
        { name: `stage_${stage}_sprites.json`, type: 'atlas' }
      ])).flat()
    }
  },
  bosses: [1, 2, 3, 4, 5, 6].map(id => ({
    id: `boss_${id}`,
    assets: [
      { name: 'sprites.png', width: 1024, height: 1024 },
      { name: 'sprites.json', type: 'atlas' },
      { name: 'portrait.png', width: 128, height: 128 }
    ]
  })),
  stages: [1, 2, 3, 4, 5, 6].map(id => ({
    id: `stage_${id}`,
    assets: [
      { name: 'background.png', width: 1920, height: 1080 },
      { name: 'foreground.png', width: 1920, height: 1080 }
    ]
  })),
  effects: [
    { name: 'hit_spark.png', width: 256, height: 256, frames: 6 },
    { name: 'block_spark.png', width: 256, height: 256, frames: 4 },
    { name: 'dust_cloud.png', width: 128, height: 128, frames: 8 },
    { name: 'power_up.png', width: 512, height: 512, frames: 10 },
    { name: 'evolution_glow.png', width: 512, height: 512, frames: 12 }
  ],
  audio: {
    sfx: [
      'hit_light.mp3',
      'hit_medium.mp3',
      'hit_heavy.mp3',
      'block.mp3',
      'special_activate.mp3',
      'combo_1.mp3',
      'combo_2.mp3',
      'combo_3.mp3',
      'evolution.mp3',
      'victory.mp3',
      'defeat.mp3'
    ],
    music: [
      'theme.mp3',
      'battle_1.mp3',
      'battle_2.mp3',
      'battle_3.mp3',
      'boss_theme.mp3',
      'victory_theme.mp3'
    ]
  }
};

// Create directories
async function createDirectories() {
  console.log('📁 Creating asset directories...');
  
  const dirs = [
    PHASER_SRC_ASSETS,
    path.join(PHASER_SRC_ASSETS, 'ui'),
    path.join(PHASER_SRC_ASSETS, 'characters'),
    path.join(PHASER_SRC_ASSETS, 'characters/base'),
    path.join(PHASER_SRC_ASSETS, 'characters/warrior'),
    path.join(PHASER_SRC_ASSETS, 'characters/speedster'),
    path.join(PHASER_SRC_ASSETS, 'characters/tank'),
    path.join(PHASER_SRC_ASSETS, 'bosses'),
    path.join(PHASER_SRC_ASSETS, 'stages'),
    path.join(PHASER_SRC_ASSETS, 'effects'),
    path.join(PHASER_SRC_ASSETS, 'audio/sfx'),
    path.join(PHASER_SRC_ASSETS, 'audio/music'),
    PHASER_DIST_ASSETS,
    IOS_ASSETS,
    ANDROID_ASSETS
  ];
  
  // Add boss directories
  for (let i = 1; i <= 6; i++) {
    dirs.push(path.join(PHASER_SRC_ASSETS, `bosses/boss_${i}`));
    dirs.push(path.join(PHASER_SRC_ASSETS, `stages/stage_${i}`));
  }
  
  // Add character stage directories
  ['warrior', 'speedster', 'tank'].forEach(archetype => {
    for (let i = 1; i <= 5; i++) {
      dirs.push(path.join(PHASER_SRC_ASSETS, `characters/${archetype}/stage_${i}`));
    }
  });
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
  
  console.log('✅ Directories created');
}

// Generate placeholder image
async function generatePlaceholderImage(width, height, text, outputPath) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#2a2a2a"/>
      <rect x="1" y="1" width="${width-2}" height="${height-2}" fill="none" stroke="#444" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="${Math.min(width, height) * 0.1}" fill="#666" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
}

// Generate sprite sheet for animations
async function generateSpriteSheet(name, frameWidth, frameHeight, frameCount, outputPath) {
  const columns = Math.ceil(Math.sqrt(frameCount));
  const rows = Math.ceil(frameCount / columns);
  const sheetWidth = frameWidth * columns;
  const sheetHeight = frameHeight * rows;
  
  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const x = (i % columns) * frameWidth;
    const y = Math.floor(i / columns) * frameHeight;
    
    frames.push({
      input: Buffer.from(`
        <svg width="${frameWidth}" height="${frameHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${frameWidth}" height="${frameHeight}" fill="#333"/>
          <circle cx="${frameWidth/2}" cy="${frameHeight/2}" r="${frameWidth*0.3}" fill="#555" opacity="${0.5 + (i/frameCount)*0.5}"/>
          <text x="${frameWidth/2}" y="${frameHeight/2}" font-family="Arial" font-size="20" fill="#888" text-anchor="middle" dominant-baseline="middle">
            ${i + 1}
          </text>
        </svg>
      `),
      left: x,
      top: y
    });
  }
  
  await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite(frames)
  .png()
  .toFile(outputPath);
  
  return { width: sheetWidth, height: sheetHeight, columns, rows };
}

// Generate atlas JSON
function generateAtlasJSON(imageName, frames) {
  const atlas = {
    frames: {},
    meta: {
      app: "16BitFit Asset Generator",
      version: "1.0",
      image: imageName,
      format: "RGBA8888",
      size: { w: 1024, h: 1024 },
      scale: "1"
    }
  };
  
  frames.forEach((frame, index) => {
    atlas.frames[frame.name] = {
      frame: { x: frame.x, y: frame.y, w: frame.w, h: frame.h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: frame.w, h: frame.h },
      sourceSize: { w: frame.w, h: frame.h }
    };
  });
  
  return JSON.stringify(atlas, null, 2);
}

// Generate UI assets
async function generateUIAssets() {
  console.log('🎨 Generating UI assets...');
  
  for (const asset of ASSET_MANIFEST.ui) {
    const outputPath = path.join(PHASER_SRC_ASSETS, 'ui', asset.name);
    
    if (asset.type === 'atlas') {
      // Generate atlas JSON
      const frames = [
        { name: 'hit_spark_00', x: 0, y: 0, w: 64, h: 64 },
        { name: 'hit_spark_01', x: 64, y: 0, w: 64, h: 64 },
        { name: 'hit_spark_02', x: 128, y: 0, w: 64, h: 64 },
        { name: 'hit_spark_03', x: 192, y: 0, w: 64, h: 64 },
        { name: 'hit_spark_04', x: 256, y: 0, w: 64, h: 64 },
        { name: 'hit_spark_05', x: 320, y: 0, w: 64, h: 64 },
        { name: 'block_spark_00', x: 0, y: 64, w: 64, h: 64 },
        { name: 'block_spark_01', x: 64, y: 64, w: 64, h: 64 },
        { name: 'block_spark_02', x: 128, y: 64, w: 64, h: 64 },
        { name: 'block_spark_03', x: 192, y: 64, w: 64, h: 64 },
      ];
      
      await fs.writeFile(outputPath, generateAtlasJSON('ui_sprites.png', frames));
    } else {
      await generatePlaceholderImage(asset.width, asset.height, asset.name.replace('.png', ''), outputPath);
    }
  }
  
  console.log('✅ UI assets generated');
}

// Generate character assets
async function generateCharacterAssets() {
  console.log('🦸 Generating character assets...');
  
  // Base character
  const basePath = path.join(PHASER_SRC_ASSETS, 'characters/base');
  await generatePlaceholderImage(2048, 2048, 'Base Character', path.join(basePath, 'sprites.png'));
  await fs.writeFile(
    path.join(basePath, 'sprites.json'),
    generateAtlasJSON('sprites.png', [
      { name: 'idle', x: 0, y: 0, w: 128, h: 128 },
      { name: 'walk_1', x: 128, y: 0, w: 128, h: 128 },
      { name: 'walk_2', x: 256, y: 0, w: 128, h: 128 },
      { name: 'punch', x: 0, y: 128, w: 128, h: 128 },
      { name: 'kick', x: 128, y: 128, w: 128, h: 128 },
      { name: 'block', x: 256, y: 128, w: 128, h: 128 },
      { name: 'hit', x: 0, y: 256, w: 128, h: 128 },
      { name: 'victory', x: 128, y: 256, w: 128, h: 128 }
    ])
  );
  
  // Archetype evolution stages
  for (const [archetype, data] of Object.entries(ASSET_MANIFEST.characters)) {
    if (archetype === 'base') continue;
    
    for (let stage = 1; stage <= 5; stage++) {
      const stagePath = path.join(PHASER_SRC_ASSETS, `characters/${archetype}/stage_${stage}`);
      
      await generatePlaceholderImage(
        1024, 1024,
        `${archetype} Stage ${stage}`,
        path.join(stagePath, `stage_${stage}_sprites.png`)
      );
      
      await fs.writeFile(
        path.join(stagePath, `stage_${stage}_sprites.json`),
        generateAtlasJSON(`stage_${stage}_sprites.png`, [
          { name: 'idle', x: 0, y: 0, w: 128, h: 128 },
          { name: 'walk_1', x: 128, y: 0, w: 128, h: 128 },
          { name: 'walk_2', x: 256, y: 0, w: 128, h: 128 },
          { name: 'special', x: 384, y: 0, w: 128, h: 128 }
        ])
      );
    }
  }
  
  console.log('✅ Character assets generated');
}

// Generate boss assets
async function generateBossAssets() {
  console.log('👹 Generating boss assets...');
  
  for (const boss of ASSET_MANIFEST.bosses) {
    const bossPath = path.join(PHASER_SRC_ASSETS, 'bosses', boss.id);
    
    for (const asset of boss.assets) {
      const outputPath = path.join(bossPath, asset.name);
      
      if (asset.type === 'atlas') {
        await fs.writeFile(outputPath, generateAtlasJSON('sprites.png', [
          { name: 'idle', x: 0, y: 0, w: 256, h: 256 },
          { name: 'attack_1', x: 256, y: 0, w: 256, h: 256 },
          { name: 'attack_2', x: 512, y: 0, w: 256, h: 256 },
          { name: 'special', x: 0, y: 256, w: 256, h: 256 },
          { name: 'hit', x: 256, y: 256, w: 256, h: 256 },
          { name: 'defeat', x: 512, y: 256, w: 256, h: 256 }
        ]));
      } else {
        await generatePlaceholderImage(
          asset.width, asset.height,
          `${boss.id} ${asset.name.replace('.png', '')}`,
          outputPath
        );
      }
    }
  }
  
  console.log('✅ Boss assets generated');
}

// Generate stage assets
async function generateStageAssets() {
  console.log('🏞️ Generating stage assets...');
  
  for (const stage of ASSET_MANIFEST.stages) {
    const stagePath = path.join(PHASER_SRC_ASSETS, 'stages', stage.id);
    
    for (const asset of stage.assets) {
      await generatePlaceholderImage(
        asset.width, asset.height,
        `${stage.id} ${asset.name.replace('.png', '')}`,
        path.join(stagePath, asset.name)
      );
    }
  }
  
  console.log('✅ Stage assets generated');
}

// Generate effect assets
async function generateEffectAssets() {
  console.log('✨ Generating effect assets...');
  
  for (const effect of ASSET_MANIFEST.effects) {
    const outputPath = path.join(PHASER_SRC_ASSETS, 'effects', effect.name);
    
    if (effect.frames) {
      await generateSpriteSheet(
        effect.name.replace('.png', ''),
        effect.width / Math.ceil(Math.sqrt(effect.frames)),
        effect.height / Math.ceil(Math.sqrt(effect.frames)),
        effect.frames,
        outputPath
      );
    } else {
      await generatePlaceholderImage(effect.width, effect.height, effect.name.replace('.png', ''), outputPath);
    }
  }
  
  console.log('✅ Effect assets generated');
}

// Generate audio placeholder files
async function generateAudioAssets() {
  console.log('🎵 Generating audio placeholders...');
  
  // Create empty audio files (1 second of silence)
  const silentAudioBase64 = 'SUQzAwAAAAAADlRTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAD/+0DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAEAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMYXZmNTguMjkuMTAwAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  
  for (const sfx of ASSET_MANIFEST.audio.sfx) {
    const outputPath = path.join(PHASER_SRC_ASSETS, 'audio/sfx', sfx);
    await fs.writeFile(outputPath, Buffer.from(silentAudioBase64, 'base64'));
  }
  
  for (const music of ASSET_MANIFEST.audio.music) {
    const outputPath = path.join(PHASER_SRC_ASSETS, 'audio/music', music);
    await fs.writeFile(outputPath, Buffer.from(silentAudioBase64, 'base64'));
  }
  
  console.log('✅ Audio assets generated');
}

// Copy assets to platform-specific directories
async function copyToPlatforms() {
  console.log('📱 Copying assets to iOS and Android...');
  
  // Copy to iOS
  await fs.copy(PHASER_SRC_ASSETS, IOS_ASSETS, { overwrite: true });
  console.log('✅ Copied to iOS');
  
  // Copy to Android
  await fs.copy(PHASER_SRC_ASSETS, ANDROID_ASSETS, { overwrite: true });
  console.log('✅ Copied to Android');
  
  // Also copy to dist for web build
  await fs.copy(PHASER_SRC_ASSETS, PHASER_DIST_ASSETS, { overwrite: true });
  console.log('✅ Copied to dist');
}

// Generate index.html for Phaser game
async function generatePhaserHTML() {
  console.log('📄 Generating Phaser HTML...');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>16BitFit Game Engine</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            overflow: hidden;
            touch-action: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        #game-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-family: Arial, sans-serif;
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="game-container">
        <div id="loading">Loading...</div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
    <script src="main.js"></script>
</body>
</html>`;
  
  await fs.writeFile(path.join(__dirname, '../phaser-game/src/index.html'), html);
  await fs.writeFile(path.join(__dirname, '../phaser-game/dist/index.html'), html);
  
  console.log('✅ HTML generated');
}

// Main execution
async function main() {
  console.log('🚀 Starting Phaser asset bundling...\n');
  
  try {
    await createDirectories();
    await generateUIAssets();
    await generateCharacterAssets();
    await generateBossAssets();
    await generateStageAssets();
    await generateEffectAssets();
    await generateAudioAssets();
    await generatePhaserHTML();
    await copyToPlatforms();
    
    console.log('\n✅ Asset bundling complete!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run phaser:build" to build the Phaser game');
    console.log('2. Run "npx react-native run-ios" or "npx react-native run-android"');
    console.log('3. The WebView will now load the bundled assets');
    
  } catch (error) {
    console.error('❌ Error during asset bundling:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, generatePlaceholderImage, generateAtlasJSON };