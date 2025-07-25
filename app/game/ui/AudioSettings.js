/**
 * Audio Settings UI
 * In-game audio controls overlay
 */

export default class AudioSettings {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.container = null;
    
    this.createUI();
  }
  
  createUI() {
    const { width, height } = this.scene.cameras.main;
    
    // Create container
    this.container = this.scene.add.container(width - 150, 100);
    this.container.setDepth(1000);
    this.container.setAlpha(0);
    
    // Background panel
    const bg = this.scene.add.rectangle(0, 0, 140, 200, 0x000000, 0.8)
      .setStrokeStyle(2, 0x92CC41);
    
    // Title
    const title = this.scene.add.text(0, -80, 'AUDIO', {
      font: 'bold 14px monospace',
      fill: '#92CC41',
      align: 'center'
    }).setOrigin(0.5);
    
    // Volume sliders
    this.createVolumeSlider('MASTER', -50, 0);
    this.createVolumeSlider('MUSIC', -20, 1);
    this.createVolumeSlider('SFX', 10, 2);
    this.createVolumeSlider('VOICE', 40, 3);
    
    // Mute button
    this.muteButton = this.scene.add.text(0, 80, 'MUTE: OFF', {
      font: '12px monospace',
      fill: '#92CC41',
      backgroundColor: '#222222',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();
    
    this.muteButton.on('pointerdown', () => {
      this.scene.audioManager.toggleMute();
      this.updateMuteButton();
    });
    
    // Add all elements to container
    this.container.add([bg, title, this.muteButton]);
    
    // Audio button to toggle settings
    this.audioButton = this.scene.add.text(width - 40, 20, '🔊', {
      font: '20px Arial',
      fill: '#92CC41',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(999);
    
    this.audioButton.on('pointerdown', () => this.toggle());
  }
  
  createVolumeSlider(label, y, type) {
    const sliderWidth = 100;
    
    // Label
    const text = this.scene.add.text(-50, y, label, {
      font: '10px monospace',
      fill: '#92CC41'
    }).setOrigin(0, 0.5);
    
    // Slider background
    const sliderBg = this.scene.add.rectangle(20, y, sliderWidth, 8, 0x222222)
      .setStrokeStyle(1, 0x92CC41);
    
    // Slider fill
    const sliderFill = this.scene.add.rectangle(
      20 - sliderWidth/2, y, sliderWidth, 6, 0x92CC41
    ).setOrigin(0, 0.5);
    
    // Slider handle
    const handle = this.scene.add.circle(20 + sliderWidth/2 - sliderWidth, y, 8, 0xF7D51D)
      .setInteractive()
      .setStrokeStyle(2, 0x0D0D0D);
    
    // Set initial position based on current volume
    const volumes = {
      0: this.scene.audioManager.masterVolume,
      1: this.scene.audioManager.musicVolume,
      2: this.scene.audioManager.sfxVolume,
      3: this.scene.audioManager.voiceVolume
    };
    
    const currentVolume = volumes[type] || 1;
    handle.x = (20 - sliderWidth/2) + (sliderWidth * currentVolume);
    sliderFill.scaleX = currentVolume;
    
    // Make handle draggable
    this.scene.input.setDraggable(handle);
    
    handle.on('drag', (pointer, dragX) => {
      // Constrain to slider bounds
      const minX = 20 - sliderWidth/2;
      const maxX = 20 + sliderWidth/2;
      handle.x = Phaser.Math.Clamp(dragX, minX, maxX);
      
      // Calculate volume
      const volume = (handle.x - minX) / sliderWidth;
      sliderFill.scaleX = volume;
      
      // Apply volume
      switch(type) {
        case 0:
          this.scene.audioManager.setMasterVolume(volume);
          break;
        case 1:
          this.scene.audioManager.setMusicVolume(volume);
          break;
        case 2:
          this.scene.audioManager.setSFXVolume(volume);
          break;
        case 3:
          this.scene.audioManager.setVoiceVolume(volume);
          break;
      }
      
      // Play test sound
      if (type === 2) {
        this.scene.audioManager.playSound('menu_select', { volume: 0.5 });
      }
    });
    
    // Add to container
    this.container.add([text, sliderBg, sliderFill, handle]);
  }
  
  updateMuteButton() {
    const muted = this.scene.audioManager.muted;
    this.muteButton.setText(muted ? 'MUTE: ON' : 'MUTE: OFF');
    this.muteButton.setColor(muted ? '#E53935' : '#92CC41');
    this.audioButton.setText(muted ? '🔇' : '🔊');
  }
  
  toggle() {
    this.visible = !this.visible;
    
    this.scene.tweens.add({
      targets: this.container,
      alpha: this.visible ? 1 : 0,
      duration: 200,
      ease: 'Power2'
    });
    
    // Play UI sound
    this.scene.audioManager.playSound('menu_select');
  }
  
  show() {
    this.visible = true;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200
    });
  }
  
  hide() {
    this.visible = false;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200
    });
  }
}