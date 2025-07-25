/**
 * Move List Display
 * Shows available moves and combos in a retro GameBoy style
 */

export default class MoveListDisplay {
  constructor(scene) {
    this.scene = scene;
    this.isVisible = false;
    this.container = null;
    
    this.moves = [
      { category: 'BASIC ATTACKS', moves: [
        { name: 'Punch', input: 'PUNCH', damage: '10', description: 'Quick jab' },
        { name: 'Kick', input: 'KICK', damage: '20', description: 'Heavy strike' },
        { name: 'Block', input: 'HOLD BLOCK', damage: '-80%', description: 'Reduce damage' }
      ]},
      { category: 'MOVEMENT', moves: [
        { name: 'Walk', input: '← / →', damage: '-', description: 'Move horizontally' },
        { name: 'Jump', input: '↑', damage: '-', description: 'Leap into air' },
        { name: 'Air Dash', input: '↓ (in air)', damage: '-', description: 'Dash forward' }
      ]},
      { category: 'SPECIAL MOVES', moves: [
        { name: 'Special Attack', input: 'SPECIAL', damage: '35', description: 'Requires full meter' },
        { name: 'Combo x3', input: '3 hits < 2s', damage: '1.2x', description: 'Chain attacks' },
        { name: 'Combo x5', input: '5 hits < 2s', damage: '1.5x', description: 'Extended chain' },
        { name: 'Combo x10', input: '10 hits < 2s', damage: '2x', description: 'Master combo' }
      ]}
    ];
    
    this.createDisplay();
  }
  
  createDisplay() {
    const { width, height } = this.scene.cameras.main;
    
    // Create container
    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(1000);
    this.container.setVisible(false);
    
    // Background overlay
    this.overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    this.container.add(this.overlay);
    
    // Main panel
    const panelWidth = 700;
    const panelHeight = 450;
    this.panel = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x0D0D0D, 0.95);
    this.panel.setStrokeStyle(4, 0x92CC41);
    this.container.add(this.panel);
    
    // Title
    this.title = this.scene.add.text(0, -panelHeight/2 + 30, 'MOVE LIST', {
      fontSize: '28px',
      fontFamily: 'pixel',
      color: '#F7D51D',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.container.add(this.title);
    
    // Close button
    this.closeButton = this.scene.add.text(panelWidth/2 - 30, -panelHeight/2 + 30, 'X', {
      fontSize: '24px',
      fontFamily: 'pixel',
      color: '#E53935',
      backgroundColor: '#1A1A1A',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive();
    
    this.closeButton.on('pointerdown', () => this.hide());
    this.container.add(this.closeButton);
    
    // Create move categories
    let yOffset = -150;
    
    this.moves.forEach((category, categoryIndex) => {
      // Category header
      const categoryHeader = this.scene.add.text(-300, yOffset, category.category, {
        fontSize: '18px',
        fontFamily: 'pixel',
        color: '#92CC41'
      });
      this.container.add(categoryHeader);
      
      yOffset += 30;
      
      // Move entries
      category.moves.forEach((move, moveIndex) => {
        // Move name
        const moveName = this.scene.add.text(-280, yOffset, move.name, {
          fontSize: '14px',
          fontFamily: 'pixel',
          color: '#FFFFFF'
        });
        this.container.add(moveName);
        
        // Input
        const input = this.scene.add.text(-100, yOffset, move.input, {
          fontSize: '14px',
          fontFamily: 'pixel',
          color: '#F7D51D'
        });
        this.container.add(input);
        
        // Damage
        const damage = this.scene.add.text(100, yOffset, `DMG: ${move.damage}`, {
          fontSize: '14px',
          fontFamily: 'pixel',
          color: '#FF6B35'
        });
        this.container.add(damage);
        
        // Description
        const description = this.scene.add.text(200, yOffset, move.description, {
          fontSize: '12px',
          fontFamily: 'pixel',
          color: '#999999'
        });
        this.container.add(description);
        
        yOffset += 25;
      });
      
      yOffset += 15; // Extra space between categories
    });
    
    // Instructions
    const instructions = this.scene.add.text(0, panelHeight/2 - 30, 'Press TAB or tap MOVES button to close', {
      fontSize: '12px',
      fontFamily: 'pixel',
      color: '#666666'
    }).setOrigin(0.5);
    this.container.add(instructions);
    
    // Keyboard controls
    this.scene.input.keyboard.on('keydown-TAB', () => this.toggle());
    this.scene.input.keyboard.on('keydown-M', () => this.toggle());
  }
  
  show() {
    this.isVisible = true;
    this.container.setVisible(true);
    
    // Pause game physics
    this.scene.physics.pause();
    
    // Show animation
    this.container.setScale(0.8);
    this.container.setAlpha(0);
    
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }
  
  hide() {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 0.8,
      scaleY: 0.8,
      alpha: 0,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.isVisible = false;
        this.container.setVisible(false);
        
        // Resume game physics
        this.scene.physics.resume();
      }
    });
  }
  
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  destroy() {
    if (this.container) {
      this.container.destroy(true);
    }
  }
}