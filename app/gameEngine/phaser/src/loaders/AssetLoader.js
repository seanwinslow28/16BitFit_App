/**
 * Asset Loader - Manages all game asset loading with texture atlasing
 * Optimized for mobile with progressive loading and caching
 */

import { GameConfig } from '../config/GameConfig';

export default class AssetLoader {
  constructor(scene) {
    this.scene = scene;
    this.loadProgress = 0;
    this.assetsToLoad = [];
    this.loadedAssets = new Set();
    
    // Asset manifest
    this.assetManifest = {
      // Sprite atlases for each evolution stage
      fighters: {
        basic: {
          key: 'fighter-basic',
          texture: 'assets/sprites/fighters/basic-fighter.png',
          atlas: 'assets/sprites/fighters/basic-fighter.json'
        },
        intermediate: {
          key: 'fighter-intermediate',
          texture: 'assets/sprites/fighters/intermediate-fighter.png',
          atlas: 'assets/sprites/fighters/intermediate-fighter.json'
        },
        advanced: {
          key: 'fighter-advanced',
          texture: 'assets/sprites/fighters/advanced-fighter.png',
          atlas: 'assets/sprites/fighters/advanced-fighter.json'
        },
        master: {
          key: 'fighter-master',
          texture: 'assets/sprites/fighters/master-fighter.png',
          atlas: 'assets/sprites/fighters/master-fighter.json'
        },
        legend: {
          key: 'fighter-legend',
          texture: 'assets/sprites/fighters/legend-fighter.png',
          atlas: 'assets/sprites/fighters/legend-fighter.json'
        }
      },
      
      // Boss sprites
      bosses: {
        trainingDummy: {
          key: 'boss-training',
          texture: 'assets/sprites/bosses/training-dummy.png',
          atlas: 'assets/sprites/bosses/training-dummy.json'
        },
        basicBoss: {
          key: 'boss-basic',
          texture: 'assets/sprites/bosses/basic-boss.png',
          atlas: 'assets/sprites/bosses/basic-boss.json'
        }
      },
      
      // Effects
      effects: {
        particles: {
          key: 'particles',
          texture: 'assets/effects/particles.png',
          atlas: 'assets/effects/particles.json'
        },
        combat: {
          key: 'combat-effects',
          texture: 'assets/effects/combat-effects.png',
          atlas: 'assets/effects/combat-effects.json'
        }
      },
      
      // UI elements
      ui: {
        controls: {
          key: 'ui-controls',
          texture: 'assets/ui/controls.png',
          atlas: 'assets/ui/controls.json'
        },
        hud: {
          key: 'ui-hud',
          texture: 'assets/ui/hud.png',
          atlas: 'assets/ui/hud.json'
        }
      },
      
      // Backgrounds
      backgrounds: {
        dojo: {
          key: 'bg-dojo',
          image: 'assets/backgrounds/dojo.jpg'
        },
        street: {
          key: 'bg-street',
          image: 'assets/backgrounds/street.jpg'
        }
      },
      
      // Audio
      audio: {
        sfx: {
          punch: 'assets/audio/sfx/punch.mp3',
          kick: 'assets/audio/sfx/kick.mp3',
          block: 'assets/audio/sfx/block.mp3',
          hadouken: 'assets/audio/sfx/hadouken.mp3',
          ko: 'assets/audio/sfx/ko.mp3'
        },
        music: {
          menu: 'assets/audio/music/menu.mp3',
          battle: 'assets/audio/music/battle.mp3',
          victory: 'assets/audio/music/victory.mp3'
        }
      }
    };
    
    // Quality settings
    this.textureQuality = this.getQualitySettings();
  }

  getQualitySettings() {
    const quality = GameConfig.performance.defaultQuality;
    const qualityMap = {
      ultra: 1.0,
      high: 0.75,
      medium: 0.5,
      low: 0.375
    };
    return qualityMap[quality] || 0.5;
  }

  preload() {
    // Set up loading progress
    this.setupLoadingProgress();
    
    // Load based on priority
    this.loadCriticalAssets();
    this.loadGameplayAssets();
    this.loadAudioAssets();
    this.loadOptionalAssets();
  }

  setupLoadingProgress() {
    this.scene.load.on('progress', (value) => {
      this.loadProgress = value;
      this.updateLoadingBar(value);
    });

    this.scene.load.on('fileprogress', (file) => {
      console.log(`Loading: ${file.key}`);
    });

    this.scene.load.on('complete', () => {
      console.log('All assets loaded');
      this.onLoadComplete();
    });
  }

  loadCriticalAssets() {
    // Load player's current evolution stage
    const playerEvolution = this.getPlayerEvolutionStage();
    const fighterAsset = this.assetManifest.fighters[playerEvolution];
    
    if (fighterAsset) {
      this.scene.load.atlas(
        fighterAsset.key,
        fighterAsset.texture,
        fighterAsset.atlas
      );
      this.assetsToLoad.push(fighterAsset.key);
    }
    
    // Load training dummy (always needed for tutorial)
    const trainingDummy = this.assetManifest.bosses.trainingDummy;
    this.scene.load.atlas(
      trainingDummy.key,
      trainingDummy.texture,
      trainingDummy.atlas
    );
    this.assetsToLoad.push(trainingDummy.key);
    
    // Load essential UI
    const controls = this.assetManifest.ui.controls;
    this.scene.load.atlas(
      controls.key,
      controls.texture,
      controls.atlas
    );
    this.assetsToLoad.push(controls.key);
  }

  loadGameplayAssets() {
    // Load combat effects
    const combatEffects = this.assetManifest.effects.combat;
    this.scene.load.atlas(
      combatEffects.key,
      combatEffects.texture,
      combatEffects.atlas
    );
    
    // Load particle effects
    const particles = this.assetManifest.effects.particles;
    this.scene.load.atlas(
      particles.key,
      particles.texture,
      particles.atlas
    );
    
    // Load HUD elements
    const hud = this.assetManifest.ui.hud;
    this.scene.load.atlas(
      hud.key,
      hud.texture,
      hud.atlas
    );
    
    // Load default background
    const dojo = this.assetManifest.backgrounds.dojo;
    this.scene.load.image(dojo.key, dojo.image);
  }

  loadAudioAssets() {
    // Load essential sound effects
    const sfx = this.assetManifest.audio.sfx;
    Object.entries(sfx).forEach(([key, path]) => {
      this.scene.load.audio(`sfx-${key}`, path);
    });
    
    // Load battle music (menu music loads later)
    this.scene.load.audio('music-battle', this.assetManifest.audio.music.battle);
  }

  loadOptionalAssets() {
    // These load in background after game starts
    
    // Other evolution stages
    const currentEvolution = this.getPlayerEvolutionStage();
    Object.entries(this.assetManifest.fighters).forEach(([stage, asset]) => {
      if (stage !== currentEvolution && !this.loadedAssets.has(asset.key)) {
        // Load with lower priority
        this.scene.load.atlas(asset.key, asset.texture, asset.atlas);
      }
    });
    
    // Additional backgrounds
    const street = this.assetManifest.backgrounds.street;
    this.scene.load.image(street.key, street.image);
    
    // Menu music
    this.scene.load.audio('music-menu', this.assetManifest.audio.music.menu);
    this.scene.load.audio('music-victory', this.assetManifest.audio.music.victory);
  }

  // Progressive loading for evolution stages
  async loadEvolutionAssets(evolutionStage) {
    const asset = this.assetManifest.fighters[evolutionStage];
    if (!asset || this.loadedAssets.has(asset.key)) {
      return; // Already loaded
    }
    
    return new Promise((resolve) => {
      this.scene.load.atlas(asset.key, asset.texture, asset.atlas);
      
      this.scene.load.once('complete', () => {
        this.loadedAssets.add(asset.key);
        resolve();
      });
      
      this.scene.load.start();
    });
  }

  // Preload next evolution stage when player is close
  preloadNextEvolution(currentStage, progress) {
    if (progress < 0.8) return; // Only preload when 80% to next stage
    
    const stages = ['basic', 'intermediate', 'advanced', 'master', 'legend'];
    const currentIndex = stages.indexOf(currentStage);
    
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      this.loadEvolutionAssets(nextStage);
    }
  }

  // Get player's current evolution stage from game data
  getPlayerEvolutionStage() {
    // Check for saved data or default to basic
    const savedData = localStorage.getItem('16bitfit-player-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.evolutionStage || 'basic';
    }
    return 'basic';
  }

  // Create texture atlas at runtime for custom sprites
  createDynamicAtlas(key, frames) {
    const texture = this.scene.textures.createCanvas(key, 1024, 1024);
    const context = texture.context;
    
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    const padding = 2;
    const atlas = { frames: {} };
    
    frames.forEach((frame, index) => {
      // Check if we need to move to next row
      if (x + frame.width + padding > 1024) {
        x = 0;
        y += rowHeight + padding;
        rowHeight = 0;
      }
      
      // Draw frame to atlas
      context.drawImage(frame.image, x, y);
      
      // Add to atlas data
      atlas.frames[frame.name] = {
        frame: { x, y, w: frame.width, h: frame.height },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: frame.width, h: frame.height },
        sourceSize: { w: frame.width, h: frame.height }
      };
      
      // Update position
      x += frame.width + padding;
      rowHeight = Math.max(rowHeight, frame.height);
    });
    
    // Update texture
    texture.refresh();
    
    // Add atlas data
    this.scene.textures.addAtlas(key, texture.canvas, atlas);
  }

  // Loading UI
  updateLoadingBar(progress) {
    if (this.scene.loadingBar) {
      this.scene.loadingBar.clear();
      this.scene.loadingBar.fillStyle(0xffffff, 1);
      this.scene.loadingBar.fillRect(250, 280, 300 * progress, 30);
    }
  }

  onLoadComplete() {
    // Cache textures for faster access
    this.cacheFrequentTextures();
    
    // Notify game that assets are ready
    this.scene.events.emit('assetsLoaded');
  }

  cacheFrequentTextures() {
    // Pre-generate common tints and scales
    const fighterTexture = this.scene.textures.get(
      `fighter-${this.getPlayerEvolutionStage()}`
    );
    
    if (fighterTexture) {
      // Cache common frame names
      const commonFrames = [
        'idle-1', 'idle-2', 'idle-3', 'idle-4',
        'walk-1', 'walk-2', 'walk-3', 'walk-4',
        'punch-1', 'punch-2', 'punch-3',
        'kick-1', 'kick-2', 'kick-3'
      ];
      
      commonFrames.forEach(frameName => {
        fighterTexture.get(frameName);
      });
    }
  }

  // Memory management
  unloadAssets(keys) {
    keys.forEach(key => {
      if (this.scene.textures.exists(key)) {
        this.scene.textures.remove(key);
        this.loadedAssets.delete(key);
      }
    });
  }

  // Get asset loading stats
  getLoadingStats() {
    return {
      progress: this.loadProgress,
      totalAssets: this.assetsToLoad.length,
      loadedAssets: this.loadedAssets.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    let totalBytes = 0;
    
    this.loadedAssets.forEach(key => {
      const texture = this.scene.textures.get(key);
      if (texture && texture.source[0]) {
        const source = texture.source[0];
        totalBytes += source.width * source.height * 4; // RGBA
      }
    });
    
    return Math.round(totalBytes / 1024 / 1024); // MB
  }
}