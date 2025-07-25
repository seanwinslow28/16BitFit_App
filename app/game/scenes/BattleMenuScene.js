/**
 * Battle Menu Scene
 * Boss selection screen with GameBoy aesthetic
 */

import { GAME_CONFIG } from '../config/GameConfig';

export default class BattleMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleMenuScene' });
    this.selectedBossIndex = 0;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(0, 0, width, height, GAME_CONFIG.colors.screenBg)
      .setOrigin(0, 0);
    
    // Title
    this.add.text(width / 2, 50, 'SELECT YOUR OPPONENT', {
      font: '24px monospace',
      fill: '#0D0D0D',
      align: 'center',
    }).setOrigin(0.5);
    
    // Boss list from config
    this.bosses = Object.entries(GAME_CONFIG.bosses).map(([id, data]) => ({
      id,
      ...data,
      name: id.toUpperCase().replace(/_/g, ' '),
    }));
    
    // Create boss cards
    this.bossCards = [];
    this.bosses.forEach((boss, index) => {
      const y = 150 + (index * 80);
      
      // Card background
      const card = this.add.rectangle(width / 2, y, 600, 70, 0x0D0D0D, 0.8)
        .setInteractive()
        .setStrokeStyle(3, index === this.selectedBossIndex ? 0xF7D51D : 0x92CC41);
      
      // Boss name
      const nameText = this.add.text(width / 2 - 250, y - 20, boss.name, {
        font: '18px monospace',
        fill: '#92CC41',
      });
      
      // Boss stats
      const statsText = this.add.text(width / 2 - 250, y + 5, 
        `HP: ${boss.health} | ATK: ${boss.attackPower} | DEF: ${boss.defense}`, {
        font: '12px monospace',
        fill: '#F7D51D',
      });
      
      // Difficulty indicator
      const difficulty = this.getDifficulty(boss);
      const difficultyText = this.add.text(width / 2 + 200, y, difficulty, {
        font: '16px monospace',
        fill: this.getDifficultyColor(difficulty),
      }).setOrigin(0.5);
      
      this.bossCards.push({
        card,
        nameText,
        statsText,
        difficultyText,
        boss,
        index,
      });
      
      // Handle selection
      card.on('pointerdown', () => this.selectBoss(index));
      card.on('pointerover', () => this.highlightBoss(index));
    });
    
    // Start button
    this.startButton = this.add.rectangle(width / 2 - 220, height - 80, 180, 50, 0x92CC41)
      .setInteractive()
      .setStrokeStyle(3, 0x0D0D0D);
    
    this.add.text(width / 2 - 220, height - 80, 'START BATTLE', {
      font: '16px monospace',
      fill: '#0D0D0D',
    }).setOrigin(0.5);
    
    this.startButton.on('pointerdown', () => this.startBattle());
    
    // Tutorial button
    this.tutorialButton = this.add.rectangle(width / 2, height - 80, 180, 50, 0xF7D51D)
      .setInteractive()
      .setStrokeStyle(3, 0x0D0D0D);
    
    this.add.text(width / 2, height - 80, 'TUTORIAL', {
      font: '16px monospace',
      fill: '#0D0D0D',
    }).setOrigin(0.5);
    
    this.tutorialButton.on('pointerdown', () => this.startTutorial());
    
    // Customize button
    this.customizeButton = this.add.rectangle(width / 2 + 220, height - 80, 180, 50, 0x3498db)
      .setInteractive()
      .setStrokeStyle(3, 0x0D0D0D);
    
    this.add.text(width / 2 + 220, height - 80, 'CUSTOMIZE', {
      font: '16px monospace',
      fill: '#0D0D0D',
    }).setOrigin(0.5);
    
    this.customizeButton.on('pointerdown', () => this.openCustomization());
    
    // Practice button
    this.practiceButton = this.add.rectangle(width / 2, height - 140, 180, 40, 0x9D4EDD)
      .setInteractive()
      .setStrokeStyle(3, 0x0D0D0D);
    
    this.add.text(width / 2, height - 140, 'PRACTICE', {
      font: '16px monospace',
      fill: '#0D0D0D',
    }).setOrigin(0.5);
    
    this.practiceButton.on('pointerdown', () => this.startPractice());
    
    // Instructions
    this.add.text(width / 2, height - 30, 'TAP TO SELECT • START TO FIGHT • CUSTOMIZE YOUR FIGHTER', {
      font: '12px monospace',
      fill: '#92CC41',
    }).setOrigin(0.5);
    
    // Set up keyboard controls (for testing)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.startBattle());
  }

  update() {
    // Keyboard navigation
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectBoss(Math.max(0, this.selectedBossIndex - 1));
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectBoss(Math.min(this.bosses.length - 1, this.selectedBossIndex + 1));
    }
  }

  selectBoss(index) {
    this.selectedBossIndex = index;
    this.updateBossHighlight();
  }

  highlightBoss(index) {
    this.selectedBossIndex = index;
    this.updateBossHighlight();
  }

  updateBossHighlight() {
    this.bossCards.forEach((card, index) => {
      const isSelected = index === this.selectedBossIndex;
      card.card.setStrokeStyle(3, isSelected ? 0xF7D51D : 0x92CC41);
      card.nameText.setColor(isSelected ? '#F7D51D' : '#92CC41');
    });
  }

  getDifficulty(boss) {
    const totalStats = boss.health + boss.attackPower + boss.defense;
    if (totalStats < 150) return 'EASY';
    if (totalStats < 250) return 'NORMAL';
    if (totalStats < 350) return 'HARD';
    return 'EXTREME';
  }

  getDifficultyColor(difficulty) {
    switch (difficulty) {
      case 'EASY': return '#92CC41';
      case 'NORMAL': return '#F7D51D';
      case 'HARD': return '#FF6B35';
      case 'EXTREME': return '#E53935';
      default: return '#92CC41';
    }
  }

  startBattle() {
    const selectedBoss = this.bosses[this.selectedBossIndex];
    
    // Store selected boss in registry
    this.registry.set('currentBoss', selectedBoss);
    
    // Send to React Native
    if (window.sendToReactNative) {
      window.sendToReactNative('bossSelected', selectedBoss);
    }
    
    // Transition to battle
    this.scene.start('BattleScene');
  }
  
  openCustomization() {
    // Transition to customization scene
    this.scene.start('CustomizationScene');
  }
  
  startTutorial() {
    // Transition to tutorial scene
    this.scene.start('TutorialScene');
  }
  
  startPractice() {
    // Transition to practice scene
    this.scene.start('PracticeScene');
  }
}