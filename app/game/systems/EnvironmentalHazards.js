/**
 * Environmental Hazards System
 * Stage-specific hazards that affect gameplay
 */

import { GAME_CONFIG } from '../config/GameConfig';

export default class EnvironmentalHazards {
  constructor(scene, stageType) {
    this.scene = scene;
    this.stageType = stageType;
    this.hazards = [];
    this.hazardGroup = scene.physics.add.group();
    
    // Initialize stage-specific hazards
    this.initializeHazards();
  }
  
  initializeHazards() {
    switch (this.stageType) {
      case 'warehouse':
        this.createWarehouseHazards();
        break;
      case 'dojo':
        this.createDojoHazards();
        break;
      case 'main':
        this.createMainStageHazards();
        break;
    }
  }
  
  createWarehouseHazards() {
    const { width, height } = this.scene.cameras.main;
    
    // Falling crates hazard
    this.hazards.push({
      type: 'falling_crates',
      interval: 5000,
      lastTrigger: 0,
      execute: () => {
        // Warning indicator
        const warningX = 100 + Math.random() * (width - 200);
        const warning = this.scene.add.rectangle(warningX, 50, 60, 10, 0xff0000, 0.8);
        
        // Flash warning
        this.scene.tweens.add({
          targets: warning,
          alpha: { from: 0.8, to: 0.2 },
          duration: 200,
          yoyo: true,
          repeat: 4,
          onComplete: () => {
            warning.destroy();
            
            // Drop crate
            const crate = this.scene.physics.add.rectangle(warningX, -50, 60, 60, 0x8B4513);
            crate.body.setGravityY(500);
            this.hazardGroup.add(crate);
            
            // Add collision
            this.scene.physics.add.overlap(crate, [this.scene.player, this.scene.boss], (hazard, character) => {
              if (character.canBeHit()) {
                character.takeDamage(15);
                this.scene.cameras.main.shake(100, 0.01);
              }
            });
            
            // Destroy when hits ground
            this.scene.physics.add.collider(crate, this.scene.platforms, () => {
              this.createImpactEffect(crate.x, crate.y);
              
              // Play 3D positioned sound
              if (this.scene.audioManager) {
                this.scene.audioManager.playEnvironmentalSound('crate_fall', crate.x, crate.y);
              }
              
              crate.destroy();
            });
          }
        });
      }
    });
    
    // Steam vents
    this.createSteamVents();
  }
  
  createDojoHazards() {
    const { width, height } = this.scene.cameras.main;
    
    // Swinging training dummies
    const dummyY = height - 200;
    for (let i = 0; i < 2; i++) {
      const x = (i + 1) * width / 3;
      const dummy = this.createSwingingDummy(x, dummyY);
      this.hazards.push(dummy);
    }
    
    // Floor spikes that pop up
    this.hazards.push({
      type: 'floor_spikes',
      interval: 4000,
      lastTrigger: 0,
      execute: () => {
        const spikeX = 100 + Math.random() * (width - 200);
        const spikeY = height - 80;
        
        // Warning glow
        const warning = this.scene.add.circle(spikeX, spikeY, 30, 0xff0000, 0.3);
        
        this.scene.tweens.add({
          targets: warning,
          radius: 40,
          alpha: 0.6,
          duration: 800,
          onComplete: () => {
            warning.destroy();
            
            // Create spikes
            const spikes = this.scene.add.triangle(spikeX, spikeY + 40, 0, 20, 15, 0, 30, 20, 0x666666);
            this.scene.physics.add.existing(spikes);
            spikes.body.setSize(30, 20);
            this.hazardGroup.add(spikes);
            
            // Spike animation
            this.scene.tweens.add({
              targets: spikes,
              y: spikeY,
              duration: 200,
              ease: 'Power2',
              onComplete: () => {
                // Add damage collision
                const overlap = this.scene.physics.add.overlap(spikes, [this.scene.player, this.scene.boss], (hazard, character) => {
                  if (character.canBeHit()) {
                    character.takeDamage(10);
                  }
                });
                
                // Retract after 1.5 seconds
                this.scene.time.delayedCall(1500, () => {
                  this.scene.tweens.add({
                    targets: spikes,
                    y: spikeY + 40,
                    duration: 200,
                    onComplete: () => {
                      spikes.destroy();
                      if (overlap) overlap.destroy();
                    }
                  });
                });
              }
            });
          }
        });
      }
    });
  }
  
  createMainStageHazards() {
    const { width, height } = this.scene.cameras.main;
    
    // Energy barriers that turn on/off
    this.hazards.push({
      type: 'energy_barrier',
      interval: 3000,
      lastTrigger: 0,
      active: false,
      barrier: null,
      execute: function() {
        if (!this.barrier) {
          // Create barrier in center
          this.barrier = this.scene.add.rectangle(width / 2, height / 2, 10, height * 0.6, 0x00ffff, 0);
          this.scene.physics.add.existing(this.barrier, true);
        }
        
        if (this.active) {
          // Deactivate
          this.active = false;
          this.scene.tweens.add({
            targets: this.barrier,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              this.barrier.body.enable = false;
            }
          });
        } else {
          // Activate
          this.active = true;
          this.barrier.body.enable = true;
          
          // Warning flash
          this.scene.tweens.add({
            targets: this.barrier,
            alpha: { from: 0.8, to: 0.3 },
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              this.barrier.setAlpha(0.6);
              
              // Add electric effect
              const electric = this.scene.add.rectangle(this.barrier.x, this.barrier.y, 20, this.barrier.height, 0x00ffff, 0.8);
              this.scene.tweens.add({
                targets: electric,
                scaleX: { from: 1, to: 2 },
                alpha: 0,
                duration: 500,
                onComplete: () => electric.destroy()
              });
            }
          });
          
          // Damage on contact
          this.scene.physics.add.overlap(this.barrier, [this.scene.player, this.scene.boss], (barrier, character) => {
            if (character.canBeHit() && this.active) {
              character.takeDamage(5);
              
              // Knockback
              const knockbackX = character.x < barrier.x ? -200 : 200;
              character.setVelocityX(knockbackX);
            }
          });
        }
      }
    });
  }
  
  createSwingingDummy(x, y) {
    const dummy = this.scene.add.rectangle(x, y, 30, 80, 0x8B4513);
    this.scene.physics.add.existing(dummy);
    dummy.body.setGravityY(0);
    this.hazardGroup.add(dummy);
    
    // Create rope
    const rope = this.scene.add.line(x, y - 100, 0, 0, 0, 100, 0x666666, 0.5);
    
    // Swing animation
    const timeline = this.scene.tweens.timeline({
      targets: dummy,
      loop: -1,
      tweens: [
        {
          x: x - 100,
          duration: 2000,
          ease: 'Sine.inOut',
          onUpdate: () => {
            // Update rope
            rope.setTo(x, y - 100, dummy.x, dummy.y - 40);
          }
        },
        {
          x: x + 100,
          duration: 2000,
          ease: 'Sine.inOut',
          onUpdate: () => {
            rope.setTo(x, y - 100, dummy.x, dummy.y - 40);
          }
        }
      ]
    });
    
    // Add collision
    this.scene.physics.add.overlap(dummy, [this.scene.player, this.scene.boss], (hazard, character) => {
      if (character.canBeHit()) {
        character.takeDamage(8);
        // Knockback based on swing direction
        const knockbackX = hazard.body.velocity.x > 0 ? 150 : -150;
        character.setVelocityX(knockbackX);
      }
    });
    
    return {
      type: 'swinging_dummy',
      dummy: dummy,
      rope: rope,
      timeline: timeline
    };
  }
  
  createSteamVents() {
    const { width, height } = this.scene.cameras.main;
    const ventPositions = [width * 0.25, width * 0.75];
    
    ventPositions.forEach(x => {
      // Create vent base
      const vent = this.scene.add.rectangle(x, height - 40, 40, 10, 0x666666);
      
      this.hazards.push({
        type: 'steam_vent',
        interval: 3500,
        lastTrigger: Math.random() * 2000, // Offset timing
        execute: () => {
          // Warning hiss
          const warning = this.scene.add.circle(x, height - 50, 5, 0xcccccc, 0.5);
          this.scene.tweens.add({
            targets: warning,
            radius: 20,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              warning.destroy();
              
              // Create steam
              const steam = this.scene.add.rectangle(x, height - 150, 30, 200, 0xcccccc, 0.6);
              steam.setOrigin(0.5, 1);
              this.scene.physics.add.existing(steam, true);
              this.hazardGroup.add(steam);
              
              // Play steam sound with 3D positioning
              if (this.scene.audioManager) {
                this.scene.audioManager.playEnvironmentalSound('steam_vent', x, height - 150);
              }
              
              // Steam particles
              for (let i = 0; i < 5; i++) {
                const particle = this.scene.add.circle(
                  x + (Math.random() - 0.5) * 20,
                  height - 60 - i * 30,
                  5 + Math.random() * 5,
                  0xffffff,
                  0.4
                );
                
                this.scene.tweens.add({
                  targets: particle,
                  y: particle.y - 100,
                  alpha: 0,
                  scale: 2,
                  duration: 1000,
                  delay: i * 100,
                  onComplete: () => particle.destroy()
                });
              }
              
              // Damage collision
              const overlap = this.scene.physics.add.overlap(steam, [this.scene.player, this.scene.boss], (hazard, character) => {
                if (character.canBeHit()) {
                  character.takeDamage(2); // Low damage but continuous
                  character.setVelocityY(-200); // Push up
                }
              });
              
              // Remove steam after duration
              this.scene.time.delayedCall(1500, () => {
                this.scene.tweens.add({
                  targets: steam,
                  alpha: 0,
                  scaleY: 0,
                  duration: 300,
                  onComplete: () => {
                    steam.destroy();
                    if (overlap) overlap.destroy();
                  }
                });
              });
            }
          });
        }
      });
    });
  }
  
  createImpactEffect(x, y) {
    // Dust particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const particle = this.scene.add.circle(x, y, 3, 0x8B4513, 0.6);
      
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        scale: 0.5,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
    
    // Screen shake
    this.scene.cameras.main.shake(50, 0.005);
    
    // Impact sound
    if (this.scene.audioManager) {
      this.scene.audioManager.playEnvironmentalSound('explosion', x, y);
    } else if (this.scene.soundManager) {
      this.scene.soundManager.play('hit_heavy');
    }
  }
  
  update(time, delta) {
    // Update hazards
    this.hazards.forEach(hazard => {
      if (hazard.execute && time - hazard.lastTrigger > hazard.interval) {
        hazard.execute.call(hazard);
        hazard.lastTrigger = time;
      }
    });
  }
  
  cleanup() {
    // Clean up all hazards
    this.hazardGroup.clear(true, true);
    
    this.hazards.forEach(hazard => {
      if (hazard.timeline) hazard.timeline.destroy();
      if (hazard.dummy) hazard.dummy.destroy();
      if (hazard.rope) hazard.rope.destroy();
      if (hazard.barrier) hazard.barrier.destroy();
    });
    
    this.hazards = [];
  }
}