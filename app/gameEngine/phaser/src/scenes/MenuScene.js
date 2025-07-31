/**
 * Menu Scene - Main menu with character selection
 * Optimized for quick access and mobile touch
 */

import Phaser from 'phaser';
import { CharacterArchetypes } from '../config/GameConfig';
import TouchButton from '../ui/TouchButton';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  init() {
    this.selectedCharacter = null;
    this.selectedDifficulty = 'normal';
  }

  create() {
    const { width, height } = this.scale.gameSize;

    // Add background
    this.createBackground();

    // Add title
    this.createTitle(width, height);

    // Create character selection
    this.createCharacterSelection(width, height);

    // Create menu buttons
    this.createMenuButtons(width, height);

    // Play menu music
    this.game.soundManager.playMusic('music-menu');

    // Fade in
    this.cameras.main.fadeIn(500);

    // Set up input
    this.setupInput();
  }

  createBackground() {
    // Animated background with parallax
    const bg = this.add.image(0, 0, 'bg-gym');
    bg.setOrigin(0, 0);
    bg.setScale(1.2);

    // Subtle animation
    this.tweens.add({
      targets: bg,
      x: -100,
      duration: 20000,
      ease: 'Linear',
      repeat: -1,
      yoyo: true
    });

    // Dark overlay for better text visibility
    const overlay = this.add.rectangle(
      0, 0,
      this.scale.width,
      this.scale.height,
      0x000000, 0.5
    );
    overlay.setOrigin(0, 0);
  }

  createTitle(width, height) {
    // Main title
    const title = this.add.text(width / 2, 80, '16BitFit', {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // Pulsing effect
    this.tweens.add({
      targets: title,
      scale: 1.1,
      duration: 1000,
      ease: 'Sine.easeInOut',
      repeat: -1,
      yoyo: true
    });

    // Subtitle
    const subtitle = this.add.text(width / 2, 130, 'Train Hard, Fight Harder', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#FFFFFF'
    });
    subtitle.setOrigin(0.5);
  }

  createCharacterSelection(width, height) {
    // Character selection title
    const selectionTitle = this.add.text(width / 2, 200, 'SELECT YOUR FIGHTER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#00FF00'
    });
    selectionTitle.setOrigin(0.5);

    // Character cards
    const characters = Object.keys(CharacterArchetypes);
    const cardWidth = 120;
    const cardHeight = 180;
    const spacing = 20;
    const totalWidth = (cardWidth + spacing) * characters.length - spacing;
    const startX = (width - totalWidth) / 2;

    this.characterCards = [];

    characters.forEach((archetype, index) => {
      const x = startX + (cardWidth + spacing) * index + cardWidth / 2;
      const y = height / 2;

      // Card background
      const card = this.add.group();
      
      const cardBg = this.add.rectangle(x, y, cardWidth, cardHeight, 0x222222);
      cardBg.setStrokeStyle(3, 0x666666);
      cardBg.setInteractive();
      card.add(cardBg);

      // Character sprite
      const sprite = this.add.sprite(x, y - 30, `${archetype}-idle`);
      sprite.setScale(0.8);
      sprite.play(`${archetype}-idle-anim`);
      card.add(sprite);

      // Character name
      const name = this.add.text(x, y + 50, CharacterArchetypes[archetype].name, {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#FFFFFF'
      });
      name.setOrigin(0.5);
      card.add(name);

      // Stats preview
      const stats = CharacterArchetypes[archetype].stats;
      const statY = y + 70;
      const statText = this.add.text(x, statY, 
        `ATK: ${stats.attack}\nDEF: ${stats.defense}\nSPD: ${stats.speed}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#CCCCCC',
        align: 'center'
      });
      statText.setOrigin(0.5);
      card.add(statText);

      // Selection handling
      cardBg.on('pointerdown', () => {
        this.selectCharacter(archetype, card, cardBg);
      });

      cardBg.on('pointerover', () => {
        if (this.selectedCharacter !== archetype) {
          cardBg.setStrokeStyle(3, 0xFFFFFF);
          sprite.setScale(0.9);
        }
      });

      cardBg.on('pointerout', () => {
        if (this.selectedCharacter !== archetype) {
          cardBg.setStrokeStyle(3, 0x666666);
          sprite.setScale(0.8);
        }
      });

      this.characterCards.push({ archetype, card, cardBg, sprite });
    });

    // Create character animations
    this.createCharacterAnimations();
  }

  createCharacterAnimations() {
    Object.keys(CharacterArchetypes).forEach(archetype => {
      // Idle animation
      this.anims.create({
        key: `${archetype}-idle-anim`,
        frames: this.anims.generateFrameNumbers(`${archetype}-idle`, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    });
  }

  selectCharacter(archetype, card, cardBg) {
    // Deselect previous
    if (this.selectedCharacter) {
      const prevCard = this.characterCards.find(c => c.archetype === this.selectedCharacter);
      if (prevCard) {
        prevCard.cardBg.setStrokeStyle(3, 0x666666);
        prevCard.sprite.setScale(0.8);
      }
    }

    // Select new character
    this.selectedCharacter = archetype;
    cardBg.setStrokeStyle(3, 0x00FF00);
    
    // Play selection sound
    this.game.soundManager.playSound('menu-select');

    // Visual feedback
    this.tweens.add({
      targets: card.getChildren(),
      scale: 1.1,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: card.getChildren(),
          scale: 1,
          duration: 100
        });
      }
    });

    // Enable start button
    if (this.startButton) {
      this.startButton.setAlpha(1);
      this.startButton.setInteractive();
    }
  }

  createMenuButtons(width, height) {
    // Start Battle button (disabled until character selected)
    this.startButton = new TouchButton(this, width / 2, height - 150, 'START BATTLE', {
      width: 200,
      height: 60,
      fontSize: '16px',
      color: 0x00FF00,
      onClick: () => this.startBattle()
    });
    this.startButton.setAlpha(0.5);
    this.startButton.disableInteractive();

    // Quick Play button
    const quickPlayButton = new TouchButton(this, width / 2, height - 80, 'QUICK PLAY', {
      width: 200,
      height: 40,
      fontSize: '14px',
      color: 0xFFFF00,
      onClick: () => this.quickPlay()
    });

    // Settings button
    const settingsButton = new TouchButton(this, width - 50, 50, '⚙', {
      width: 40,
      height: 40,
      fontSize: '24px',
      color: 0xCCCCCC,
      onClick: () => this.openSettings()
    });
  }

  setupInput() {
    // Keyboard shortcuts
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.selectedCharacter) {
        this.startBattle();
      }
    });

    this.input.keyboard.on('keydown-Q', () => {
      this.quickPlay();
    });

    // Touch gestures
    this.input.on('pointerdown', (pointer) => {
      this.lastPointerDown = { x: pointer.x, y: pointer.y, time: Date.now() };
    });

    this.input.on('pointerup', (pointer) => {
      if (this.lastPointerDown) {
        const dx = pointer.x - this.lastPointerDown.x;
        const dy = pointer.y - this.lastPointerDown.y;
        const dt = Date.now() - this.lastPointerDown.time;

        // Swipe detection
        if (Math.abs(dx) > 100 && dt < 500) {
          // Horizontal swipe - change character
          if (dx > 0) {
            this.selectNextCharacter(-1);
          } else {
            this.selectNextCharacter(1);
          }
        }
      }
    });
  }

  selectNextCharacter(direction) {
    const characters = Object.keys(CharacterArchetypes);
    let currentIndex = characters.indexOf(this.selectedCharacter);
    
    if (currentIndex === -1) {
      currentIndex = direction > 0 ? -1 : characters.length;
    }
    
    const newIndex = (currentIndex + direction + characters.length) % characters.length;
    const newCharacter = characters[newIndex];
    
    const card = this.characterCards.find(c => c.archetype === newCharacter);
    if (card) {
      this.selectCharacter(newCharacter, card.card, card.cardBg);
    }
  }

  startBattle() {
    if (!this.selectedCharacter) return;

    // Save selection
    this.game.selectedCharacter = this.selectedCharacter;
    this.game.selectedDifficulty = this.selectedDifficulty;

    // Transition to battle
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.game.soundManager.stopMusic();
      this.scene.start('BattleScene', {
        character: this.selectedCharacter,
        difficulty: this.selectedDifficulty
      });
    });
  }

  quickPlay() {
    // Random character selection
    const characters = Object.keys(CharacterArchetypes);
    this.selectedCharacter = characters[Math.floor(Math.random() * characters.length)];
    this.selectedDifficulty = 'normal';
    
    this.startBattle();
  }

  openSettings() {
    // Would open settings overlay
    console.log('Settings not implemented yet');
  }
}