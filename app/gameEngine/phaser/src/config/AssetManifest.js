/**
 * Asset Manifest - Central registry of all game assets
 * Organized by priority for optimal loading
 */

export default {
  // Critical assets needed for gameplay
  critical: {
    sprites: [
      // Character base sprites
      { key: 'brawler-idle', path: 'assets/characters/brawler/idle.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'speedster-idle', path: 'assets/characters/speedster/idle.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'technician-idle', path: 'assets/characters/technician/idle.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      
      // Essential animations
      { key: 'hit-spark', path: 'assets/effects/hit-spark.png', type: 'spritesheet', frameWidth: 64, frameHeight: 64 },
      { key: 'block-spark', path: 'assets/effects/block-spark.png', type: 'spritesheet', frameWidth: 64, frameHeight: 64 }
    ],
    
    audio: [
      // Core combat sounds
      { key: 'hit1', path: 'assets/audio/sfx/hit1' },
      { key: 'hit2', path: 'assets/audio/sfx/hit2' },
      { key: 'block1', path: 'assets/audio/sfx/block1' },
      { key: 'whoosh1', path: 'assets/audio/sfx/whoosh1' }
    ],
    
    ui: [
      // HUD elements
      { key: 'healthbar-bg', path: 'assets/ui/healthbar-bg.png' },
      { key: 'healthbar-fill', path: 'assets/ui/healthbar-fill.png' },
      { key: 'super-meter-bg', path: 'assets/ui/super-meter-bg.png' },
      { key: 'super-meter-fill', path: 'assets/ui/super-meter-fill.png' },
      
      // Touch controls
      { key: 'touch-dpad', path: 'assets/ui/touch-dpad.png' },
      { key: 'touch-button', path: 'assets/ui/touch-button.png' }
    ]
  },
  
  // High priority - needed for smooth gameplay
  high: {
    sprites: [
      // Character movement sprites
      { key: 'brawler-walk', path: 'assets/characters/brawler/walk.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'brawler-attack', path: 'assets/characters/brawler/attack.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'brawler-special', path: 'assets/characters/brawler/special.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'brawler-hit', path: 'assets/characters/brawler/hit.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'brawler-ko', path: 'assets/characters/brawler/ko.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      
      { key: 'speedster-walk', path: 'assets/characters/speedster/walk.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'speedster-attack', path: 'assets/characters/speedster/attack.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'speedster-special', path: 'assets/characters/speedster/special.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'speedster-hit', path: 'assets/characters/speedster/hit.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'speedster-ko', path: 'assets/characters/speedster/ko.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      
      { key: 'technician-walk', path: 'assets/characters/technician/walk.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'technician-attack', path: 'assets/characters/technician/attack.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'technician-special', path: 'assets/characters/technician/special.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'technician-hit', path: 'assets/characters/technician/hit.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'technician-ko', path: 'assets/characters/technician/ko.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 }
    ],
    
    effects: [
      // Combat effects
      { key: 'super-flash', path: 'assets/effects/super-flash.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'dust-cloud', path: 'assets/effects/dust-cloud.png', type: 'spritesheet', frameWidth: 64, frameHeight: 64 },
      { key: 'combo-numbers', path: 'assets/ui/combo-numbers.png', type: 'spritesheet', frameWidth: 32, frameHeight: 48 }
    ],
    
    audio: [
      // Additional combat sounds
      { key: 'hit3', path: 'assets/audio/sfx/hit3' },
      { key: 'block2', path: 'assets/audio/sfx/block2' },
      { key: 'special1', path: 'assets/audio/sfx/special1' },
      { key: 'whoosh2', path: 'assets/audio/sfx/whoosh2' },
      { key: 'ko1', path: 'assets/audio/sfx/ko1' },
      
      // Voice clips
      { key: 'voice-ready', path: 'assets/audio/voice/ready' },
      { key: 'voice-fight', path: 'assets/audio/voice/fight' },
      { key: 'voice-ko', path: 'assets/audio/voice/ko' }
    ]
  },
  
  // Medium priority - can be loaded during gameplay
  medium: {
    backgrounds: [
      // Stage backgrounds
      { key: 'bg-gym', path: 'assets/backgrounds/gym.png' },
      { key: 'bg-gym-far', path: 'assets/backgrounds/gym-far.png' },
      { key: 'bg-gym-mid', path: 'assets/backgrounds/gym-mid.png' },
      { key: 'bg-gym-near', path: 'assets/backgrounds/gym-near.png' },
      
      { key: 'bg-street', path: 'assets/backgrounds/street.png' },
      { key: 'bg-dojo', path: 'assets/backgrounds/dojo.png' }
    ],
    
    sprites: [
      // Evolution stage overlays
      { key: 'brawler-evolution-1', path: 'assets/characters/brawler/evolution-1.png' },
      { key: 'brawler-evolution-2', path: 'assets/characters/brawler/evolution-2.png' },
      { key: 'brawler-evolution-3', path: 'assets/characters/brawler/evolution-3.png' },
      { key: 'brawler-evolution-4', path: 'assets/characters/brawler/evolution-4.png' },
      { key: 'brawler-evolution-5', path: 'assets/characters/brawler/evolution-5.png' },
      
      { key: 'speedster-evolution-1', path: 'assets/characters/speedster/evolution-1.png' },
      { key: 'speedster-evolution-2', path: 'assets/characters/speedster/evolution-2.png' },
      { key: 'speedster-evolution-3', path: 'assets/characters/speedster/evolution-3.png' },
      { key: 'speedster-evolution-4', path: 'assets/characters/speedster/evolution-4.png' },
      { key: 'speedster-evolution-5', path: 'assets/characters/speedster/evolution-5.png' },
      
      { key: 'technician-evolution-1', path: 'assets/characters/technician/evolution-1.png' },
      { key: 'technician-evolution-2', path: 'assets/characters/technician/evolution-2.png' },
      { key: 'technician-evolution-3', path: 'assets/characters/technician/evolution-3.png' },
      { key: 'technician-evolution-4', path: 'assets/characters/technician/evolution-4.png' },
      { key: 'technician-evolution-5', path: 'assets/characters/technician/evolution-5.png' }
    ],
    
    particles: [
      // Particle effects
      { key: 'particle-star', path: 'assets/effects/particle-star.png' },
      { key: 'particle-sweat', path: 'assets/effects/particle-sweat.png' },
      { key: 'particle-dust', path: 'assets/effects/particle-dust.png' },
      { key: 'particle-energy', path: 'assets/effects/particle-energy.png' }
    ],
    
    audio: [
      // Music tracks
      { key: 'music-menu', path: 'assets/audio/music/menu' },
      { key: 'music-battle', path: 'assets/audio/music/battle' },
      { key: 'music-victory', path: 'assets/audio/music/victory' },
      { key: 'music-defeat', path: 'assets/audio/music/defeat' }
    ]
  },
  
  // Low priority - can be loaded on demand
  low: {
    sprites: [
      // Boss sprites
      { key: 'boss-sedentary', path: 'assets/bosses/sedentary/spritesheet.png', type: 'spritesheet', frameWidth: 192, frameHeight: 192 },
      { key: 'boss-junkfood', path: 'assets/bosses/junkfood/spritesheet.png', type: 'spritesheet', frameWidth: 192, frameHeight: 192 },
      { key: 'boss-procrastination', path: 'assets/bosses/procrastination/spritesheet.png', type: 'spritesheet', frameWidth: 192, frameHeight: 192 },
      { key: 'boss-stress', path: 'assets/bosses/stress/spritesheet.png', type: 'spritesheet', frameWidth: 192, frameHeight: 192 },
      { key: 'boss-fatigue', path: 'assets/bosses/fatigue/spritesheet.png', type: 'spritesheet', frameWidth: 192, frameHeight: 192 }
    ],
    
    effects: [
      // Evolution effects
      { key: 'evolution-aura', path: 'assets/effects/evolution-aura.png', type: 'spritesheet', frameWidth: 256, frameHeight: 256 },
      { key: 'level-up', path: 'assets/effects/level-up.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 },
      { key: 'power-up', path: 'assets/effects/power-up.png', type: 'spritesheet', frameWidth: 128, frameHeight: 128 }
    ],
    
    ui: [
      // Additional UI elements
      { key: 'icon-punch', path: 'assets/ui/icon-punch.png' },
      { key: 'icon-kick', path: 'assets/ui/icon-kick.png' },
      { key: 'icon-special', path: 'assets/ui/icon-special.png' },
      { key: 'icon-block', path: 'assets/ui/icon-block.png' },
      
      // Menu elements
      { key: '16bitfit-logo', path: 'assets/ui/16bitfit-logo.png' },
      { key: 'loading-bar-bg', path: 'assets/ui/loading-bar-bg.png' },
      { key: 'loading-bar-fill', path: 'assets/ui/loading-bar-fill.png' }
    ],
    
    audio: [
      // Additional sounds
      { key: 'special2', path: 'assets/audio/sfx/special2' },
      { key: 'ko2', path: 'assets/audio/sfx/ko2' },
      { key: 'power-up', path: 'assets/audio/sfx/power-up' },
      { key: 'level-up', path: 'assets/audio/sfx/level-up' },
      { key: 'combo-break', path: 'assets/audio/sfx/combo-break' },
      { key: 'super-activate', path: 'assets/audio/sfx/super-activate' },
      { key: 'menu-select', path: 'assets/audio/sfx/menu-select' },
      { key: 'menu-back', path: 'assets/audio/sfx/menu-back' },
      
      // Additional voice clips
      { key: 'voice-perfect', path: 'assets/audio/voice/perfect' },
      { key: 'voice-win', path: 'assets/audio/voice/win' }
    ]
  },
  
  // Font assets
  fonts: [
    { key: 'arcade', png: 'assets/fonts/arcade.png', xml: 'assets/fonts/arcade.xml' },
    { key: 'damage', png: 'assets/fonts/damage.png', xml: 'assets/fonts/damage.xml' }
  ]
};