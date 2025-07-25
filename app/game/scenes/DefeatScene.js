/**
 * Defeat Scene
 * Shows defeat screen with retry options
 */

export default class DefeatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DefeatScene' });
  }

  init(data) {
    this.boss = data.boss || {};
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Dark background
    this.add.rectangle(0, 0, width, height, 0x0D0D0D)
      .setOrigin(0, 0);
    
    // Defeat text
    const defeatText = this.add.text(width / 2, 100, 'DEFEAT...', {
      font: '48px monospace',
      fill: '#E53935',
      stroke: '#0D0D0D',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0);
    
    // Skull icon
    const skull = this.add.text(width / 2, 180, '💀', {
      fontSize: '64px',
    }).setOrigin(0.5).setAlpha(0);
    
    // Message
    const messageText = this.add.text(
      width / 2, 
      260, 
      `${this.boss.name || 'BOSS'} was too powerful!`, 
      {
        font: '18px monospace',
        fill: '#F7D51D',
        align: 'center',
      }
    ).setOrigin(0.5).setAlpha(0);
    
    // Tip
    const tipText = this.add.text(width / 2, 320, 'Train harder and try again!', {
      font: '16px monospace',
      fill: '#92CC41',
    }).setOrigin(0.5).setAlpha(0);
    
    // Buttons
    const retryBtn = this.add.rectangle(width / 2 - 110, height - 100, 180, 50, 0xF7D51D)
      .setInteractive()
      .setStrokeStyle(3, 0x0D0D0D)
      .setAlpha(0);
    
    const retryTxt = this.add.text(width / 2 - 110, height - 100, 'RETRY', {
      font: '18px monospace',
      fill: '#0D0D0D',
    }).setOrigin(0.5).setAlpha(0);
    
    const menuBtn = this.add.rectangle(width / 2 + 110, height - 100, 180, 50, 0xE53935)
      .setInteractive()
      .setStrokeStyle(3, 0x0D0D0D)
      .setAlpha(0);
    
    const menuTxt = this.add.text(width / 2 + 110, height - 100, 'HOME', {
      font: '18px monospace',
      fill: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);
    
    // Animate elements
    this.tweens.timeline({
      tweens: [
        {
          targets: defeatText,
          alpha: 1,
          y: { from: 80, to: 100 },
          duration: 500,
          ease: 'Power2',
        },
        {
          targets: skull,
          alpha: 1,
          scale: { from: 0, to: 1 },
          duration: 500,
          ease: 'Back.out',
          offset: '-=300',
        },
        {
          targets: messageText,
          alpha: 1,
          duration: 500,
        },
        {
          targets: tipText,
          alpha: 1,
          duration: 500,
        },
        {
          targets: [retryBtn, retryTxt, menuBtn, menuTxt],
          alpha: 1,
          duration: 500,
        },
      ],
    });
    
    // Button handlers
    retryBtn.on('pointerdown', () => {
      this.scene.start('BattleScene');
    });
    
    menuBtn.on('pointerdown', () => {
      // Close game or return to React Native
      if (window.sendToReactNative) {
        window.sendToReactNative('closeGame', {});
      }
      this.scene.start('BattleMenuScene');
    });
  }
}