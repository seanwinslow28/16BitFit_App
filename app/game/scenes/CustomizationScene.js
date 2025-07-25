/**
 * Customization Scene
 * Allows players to customize their character with unlocked content
 */

import UnlockManager from '../systems/UnlockManager';

export default class CustomizationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CustomizationScene' });
    
    this.unlockManager = null;
    this.selectedSkin = 'default';
    this.selectedSpecialMove = 'default_special';
    this.previewSprite = null;
    this.currentCategory = 'skins'; // skins, moves, abilities
  }
  
  async create() {
    const { width, height } = this.cameras.main;
    
    // Create background
    this.add.rectangle(0, 0, width, height, 0x1a1a1a).setOrigin(0, 0);
    
    // Title
    this.add.text(width / 2, 40, 'CHARACTER CUSTOMIZATION', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#F7D51D',
      stroke: '#0D0D0D',
      strokeThickness: 4,
    }).setOrigin(0.5);
    
    // Initialize unlock manager
    this.unlockManager = new UnlockManager(this);
    const playerId = this.registry.get('playerStats')?.playerId || 'guest';
    await this.unlockManager.loadUnlockedContent(playerId);
    
    // Create UI sections
    this.createCategoryTabs();
    this.createPreviewArea();
    this.createContentGrid();
    this.createInfoPanel();
    this.createActionButtons();
    
    // Load saved preferences
    this.loadSavedPreferences();
    
    // Display initial category
    this.displayCategory('skins');
  }
  
  createCategoryTabs() {
    const { width } = this.cameras.main;
    const tabY = 100;
    const tabWidth = 120;
    const tabSpacing = 10;
    
    const categories = [
      { key: 'skins', label: 'SKINS' },
      { key: 'moves', label: 'MOVES' },
      { key: 'abilities', label: 'ABILITIES' },
    ];
    
    const totalWidth = (tabWidth * categories.length) + (tabSpacing * (categories.length - 1));
    const startX = (width - totalWidth) / 2;
    
    categories.forEach((category, index) => {
      const x = startX + (index * (tabWidth + tabSpacing)) + (tabWidth / 2);
      
      const tab = this.add.rectangle(x, tabY, tabWidth, 40, 0x2a2a2a)
        .setStrokeStyle(2, 0x92CC41)
        .setInteractive();
      
      const text = this.add.text(x, tabY, category.label, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#FFFFFF',
      }).setOrigin(0.5);
      
      tab.on('pointerdown', () => {
        this.selectCategory(category.key);
      });
      
      tab.on('pointerover', () => {
        tab.setFillStyle(0x3a3a3a);
        text.setColor('#F7D51D');
      });
      
      tab.on('pointerout', () => {
        if (this.currentCategory !== category.key) {
          tab.setFillStyle(0x2a2a2a);
          text.setColor('#FFFFFF');
        }
      });
      
      // Store references
      category.tab = tab;
      category.text = text;
    });
    
    this.categoryTabs = categories;
  }
  
  createPreviewArea() {
    const { width, height } = this.cameras.main;
    const previewX = width * 0.75;
    const previewY = height * 0.4;
    
    // Preview background
    this.add.rectangle(previewX, previewY, 200, 250, 0x2a2a2a)
      .setStrokeStyle(3, 0x92CC41);
    
    // Preview title
    this.add.text(previewX, previewY - 100, 'PREVIEW', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#92CC41',
    }).setOrigin(0.5);
    
    // Create preview sprite
    this.previewSprite = this.add.sprite(previewX, previewY, 'Sean_Fighter-Sprite-Sheet', 0);
    this.previewSprite.setScale(2);
    
    // Animate preview
    this.time.addEvent({
      delay: 500,
      callback: () => {
        const frame = this.previewSprite.frame.name;
        const nextFrame = (parseInt(frame) + 1) % 16;
        this.previewSprite.setFrame(nextFrame);
      },
      loop: true,
    });
  }
  
  createContentGrid() {
    const { width, height } = this.cameras.main;
    const gridX = width * 0.15;
    const gridY = height * 0.35;
    const gridWidth = width * 0.5;
    const gridHeight = height * 0.4;
    
    // Grid background
    this.gridBg = this.add.rectangle(gridX, gridY, gridWidth, gridHeight, 0x0D0D0D, 0.5)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x3a3a3a);
    
    // Content container
    this.contentContainer = this.add.container(gridX, gridY);
  }
  
  createInfoPanel() {
    const { width, height } = this.cameras.main;
    const infoX = width * 0.15;
    const infoY = height * 0.8;
    const infoWidth = width * 0.5;
    const infoHeight = 80;
    
    // Info background
    this.add.rectangle(infoX, infoY, infoWidth, infoHeight, 0x2a2a2a)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x3a3a3a);
    
    // Info text objects
    this.infoTitle = this.add.text(infoX + 10, infoY + 10, '', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#F7D51D',
    });
    
    this.infoDescription = this.add.text(infoX + 10, infoY + 35, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      wordWrap: { width: infoWidth - 20 },
    });
  }
  
  createActionButtons() {
    const { width, height } = this.cameras.main;
    
    // Apply button
    const applyButton = this.add.text(width * 0.75, height - 60, 'APPLY', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#0D0D0D',
      backgroundColor: '#92CC41',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();
    
    applyButton.on('pointerdown', () => this.applyChanges());
    applyButton.on('pointerover', () => applyButton.setScale(1.1));
    applyButton.on('pointerout', () => applyButton.setScale(1));
    
    // Back button
    const backButton = this.add.text(width * 0.25, height - 60, 'BACK', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#FFFFFF',
      backgroundColor: '#3a3a3a',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();
    
    backButton.on('pointerdown', () => this.returnToMenu());
    backButton.on('pointerover', () => backButton.setScale(1.1));
    backButton.on('pointerout', () => backButton.setScale(1));
  }
  
  selectCategory(category) {
    this.currentCategory = category;
    
    // Update tab appearance
    this.categoryTabs.forEach(tab => {
      if (tab.key === category) {
        tab.tab.setFillStyle(0x3a3a3a);
        tab.text.setColor('#F7D51D');
      } else {
        tab.tab.setFillStyle(0x2a2a2a);
        tab.text.setColor('#FFFFFF');
      }
    });
    
    // Display content
    this.displayCategory(category);
  }
  
  displayCategory(category) {
    // Clear previous content
    this.contentContainer.removeAll(true);
    
    switch (category) {
      case 'skins':
        this.displaySkins();
        break;
      case 'moves':
        this.displaySpecialMoves();
        break;
      case 'abilities':
        this.displayAbilities();
        break;
    }
  }
  
  displaySkins() {
    const availableSkins = this.unlockManager.getAvailableSkins();
    const lockedSkins = this.unlockManager.getLockedContent().skins;
    const allSkins = [...availableSkins, ...lockedSkins];
    
    const itemSize = 80;
    const padding = 20;
    const cols = 4;
    
    allSkins.forEach((skin, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = col * (itemSize + padding) + itemSize / 2;
      const y = row * (itemSize + padding) + itemSize / 2;
      
      const isUnlocked = !skin.requirement;
      const isSelected = skin.id === this.selectedSkin;
      
      // Item background
      const bg = this.add.rectangle(x, y, itemSize, itemSize, isUnlocked ? 0x2a2a2a : 0x1a1a1a)
        .setStrokeStyle(2, isSelected ? 0xF7D51D : (isUnlocked ? 0x92CC41 : 0x666666));
      
      if (isUnlocked) {
        bg.setInteractive();
      }
      
      // Skin icon (simplified representation)
      const icon = this.add.rectangle(x, y - 10, 30, 40, skin.tint || 0x92CC41);
      
      // Lock icon for locked content
      if (!isUnlocked) {
        const lock = this.add.text(x, y + 20, '🔒', {
          fontSize: '20px',
        }).setOrigin(0.5);
        this.contentContainer.add(lock);
      }
      
      // Selection indicator
      if (isSelected) {
        const check = this.add.text(x + 25, y - 25, '✓', {
          fontSize: '20px',
          color: '#F7D51D',
        }).setOrigin(0.5);
        this.contentContainer.add(check);
      }
      
      // Interactions
      if (isUnlocked) {
        bg.on('pointerdown', () => {
          this.selectedSkin = skin.id;
          this.updatePreview();
          this.displaySkins(); // Refresh to show selection
          this.showItemInfo(skin);
        });
        
        bg.on('pointerover', () => {
          bg.setScale(1.1);
          this.showItemInfo(skin);
        });
        
        bg.on('pointerout', () => {
          bg.setScale(1);
        });
      } else {
        bg.on('pointerover', () => {
          this.showLockedInfo(skin);
        });
      }
      
      this.contentContainer.add([bg, icon]);
    });
  }
  
  displaySpecialMoves() {
    const availableMoves = this.unlockManager.getAvailableSpecialMoves();
    const lockedMoves = this.unlockManager.getLockedContent().moves;
    const allMoves = [...availableMoves, ...lockedMoves];
    
    const itemHeight = 60;
    const padding = 10;
    const itemWidth = 400;
    
    allMoves.forEach((move, index) => {
      const y = index * (itemHeight + padding) + itemHeight / 2;
      const isUnlocked = !move.requirement;
      const isSelected = move.id === this.selectedSpecialMove;
      
      // Item background
      const bg = this.add.rectangle(0, y, itemWidth, itemHeight, isUnlocked ? 0x2a2a2a : 0x1a1a1a)
        .setOrigin(0, 0.5)
        .setStrokeStyle(2, isSelected ? 0xF7D51D : (isUnlocked ? 0x92CC41 : 0x666666));
      
      if (isUnlocked) {
        bg.setInteractive();
      }
      
      // Move name
      const nameText = this.add.text(20, y - 10, move.name, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: isUnlocked ? '#F7D51D' : '#666666',
      }).setOrigin(0, 0.5);
      
      // Move stats
      const statsText = `DMG: ${move.damage} | COST: ${move.meterCost}`;
      this.add.text(20, y + 10, statsText, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: isUnlocked ? '#92CC41' : '#666666',
      }).setOrigin(0, 0.5);
      
      // Lock icon
      if (!isUnlocked) {
        const lock = this.add.text(itemWidth - 30, y, '🔒', {
          fontSize: '20px',
        }).setOrigin(0.5);
        this.contentContainer.add(lock);
      }
      
      // Selection indicator
      if (isSelected) {
        const check = this.add.text(itemWidth - 30, y, '✓', {
          fontSize: '20px',
          color: '#F7D51D',
        }).setOrigin(0.5);
        this.contentContainer.add(check);
      }
      
      // Interactions
      if (isUnlocked) {
        bg.on('pointerdown', () => {
          this.selectedSpecialMove = move.id;
          this.displaySpecialMoves(); // Refresh
          this.showItemInfo(move);
        });
        
        bg.on('pointerover', () => {
          bg.setScale(1.02, 1.1);
          this.showItemInfo(move);
        });
        
        bg.on('pointerout', () => {
          bg.setScale(1);
        });
      } else {
        bg.on('pointerover', () => {
          this.showLockedInfo(move);
        });
      }
      
      this.contentContainer.add([bg, nameText]);
    });
  }
  
  displayAbilities() {
    const availableAbilities = this.unlockManager.getAvailableAbilities();
    const lockedAbilities = this.unlockManager.getLockedContent().abilities;
    const allAbilities = [...availableAbilities, ...lockedAbilities];
    
    const itemSize = 100;
    const padding = 20;
    const cols = 3;
    
    allAbilities.forEach((ability, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = col * (itemSize + padding) + itemSize / 2;
      const y = row * (itemSize + padding) + itemSize / 2;
      
      const isUnlocked = !ability.requirement;
      
      // Item background
      const bg = this.add.rectangle(x, y, itemSize, itemSize, isUnlocked ? 0x2a2a2a : 0x1a1a1a)
        .setStrokeStyle(2, isUnlocked ? 0x92CC41 : 0x666666);
      
      if (isUnlocked) {
        bg.setInteractive();
      }
      
      // Ability name
      const nameText = this.add.text(x, y - 30, ability.name, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: isUnlocked ? '#F7D51D' : '#666666',
        align: 'center',
        wordWrap: { width: itemSize - 10 },
      }).setOrigin(0.5);
      
      // Type badge
      const typeColor = ability.type === 'passive' ? 0x3498db : 0xE53935;
      const typeBadge = this.add.rectangle(x, y + 20, 60, 20, typeColor);
      const typeText = this.add.text(x, y + 20, ability.type.toUpperCase(), {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#FFFFFF',
      }).setOrigin(0.5);
      
      // Lock icon
      if (!isUnlocked) {
        const lock = this.add.text(x, y, '🔒', {
          fontSize: '24px',
        }).setOrigin(0.5);
        this.contentContainer.add(lock);
      } else {
        // Checkmark for unlocked
        const check = this.add.text(x + 35, y - 35, '✓', {
          fontSize: '16px',
          color: '#92CC41',
        }).setOrigin(0.5);
        this.contentContainer.add(check);
      }
      
      // Interactions
      bg.on('pointerover', () => {
        bg.setScale(1.1);
        if (isUnlocked) {
          this.showItemInfo(ability);
        } else {
          this.showLockedInfo(ability);
        }
      });
      
      bg.on('pointerout', () => {
        bg.setScale(1);
      });
      
      this.contentContainer.add([bg, nameText, typeBadge, typeText]);
    });
  }
  
  showItemInfo(item) {
    this.infoTitle.setText(item.name);
    this.infoDescription.setText(item.description);
  }
  
  showLockedInfo(item) {
    this.infoTitle.setText(`${item.name} (LOCKED)`);
    this.infoDescription.setText(item.requirement);
  }
  
  updatePreview() {
    if (this.selectedSkin) {
      // Apply skin to preview
      this.unlockManager.applySkin(this.previewSprite, this.selectedSkin);
    }
  }
  
  async applyChanges() {
    // Save preferences
    const preferences = {
      skin: this.selectedSkin,
      specialMove: this.selectedSpecialMove,
    };
    
    this.registry.set('playerCustomization', preferences);
    
    // Save to storage (if available)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('16bitfit_customization', JSON.stringify(preferences));
      }
    } catch (error) {
      console.error('Error saving customization:', error);
    }
    
    // Visual feedback
    const savedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'SAVED!', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#92CC41',
      stroke: '#0D0D0D',
      strokeThickness: 4,
    }).setOrigin(0.5).setScale(0);
    
    this.tweens.add({
      targets: savedText,
      scale: 1.2,
      duration: 300,
      ease: 'Back.out',
      yoyo: true,
      hold: 500,
      onComplete: () => savedText.destroy(),
    });
  }
  
  async loadSavedPreferences() {
    try {
      let saved = null;
      
      // Try to load from storage
      if (typeof window !== 'undefined' && window.localStorage) {
        saved = window.localStorage.getItem('16bitfit_customization');
      }
      
      if (saved) {
        const preferences = JSON.parse(saved);
        this.selectedSkin = preferences.skin || 'default';
        this.selectedSpecialMove = preferences.specialMove || 'default_special';
        this.updatePreview();
      }
    } catch (error) {
      console.error('Error loading customization:', error);
    }
  }
  
  returnToMenu() {
    this.scene.start('BattleMenuScene');
  }
}
