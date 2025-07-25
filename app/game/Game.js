/**
 * Main Game Configuration
 * Entry point for the Phaser game
 */

import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import BattleMenuScene from './scenes/BattleMenuScene';
import BattleScene from './scenes/BattleScene';
import VictoryScene from './scenes/VictoryScene';
import DefeatScene from './scenes/DefeatScene';
import CustomizationScene from './scenes/CustomizationScene';
import TutorialScene from './scenes/TutorialScene';
import PracticeScene from './scenes/PracticeScene';
import { GAME_CONFIG } from './config/GameConfig';

// Game configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: '#000000',
  pixelArt: GAME_CONFIG.pixelArt,
  antialias: GAME_CONFIG.antialias,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME_CONFIG.gravity },
      debug: false,
    },
  },
  scene: [
    BootScene,
    BattleMenuScene,
    BattleScene,
    VictoryScene,
    DefeatScene,
    CustomizationScene,
    TutorialScene,
    PracticeScene,
  ],
  input: {
    activePointers: 3, // Support multi-touch
  },
};

// Create game instance
let game = null;

export const createGame = (container) => {
  if (game) {
    game.destroy(true);
  }
  
  config.parent = container || 'game-container';
  game = new Phaser.Game(config);
  
  return game;
};

export const destroyGame = () => {
  if (game) {
    game.destroy(true);
    game = null;
  }
};

export const getGame = () => game;

// Export for use in WebView
if (typeof window !== 'undefined') {
  window.PhaserGame = {
    create: createGame,
    destroy: destroyGame,
    get: getGame,
    config: GAME_CONFIG,
  };
}