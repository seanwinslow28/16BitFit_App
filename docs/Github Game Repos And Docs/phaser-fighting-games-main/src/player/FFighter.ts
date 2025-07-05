import { Player } from "./Player";

export class FFighter extends Player {
    //public scene?: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number, options?: Phaser.Types.Physics.Matter.MatterBodyConfig) {
        super(scene, x, y, texture, frame, options);
        this.scene = scene;
    }

    defineAnimations(): void {
        let attackAnimationConfig = {
            prefix: 'Cammy_60_',
            start: 1,
            end: 7,
            zeroPad: 2,
        }
        this.scene.anims.create({
            key: 'FFighter-idle',
            repeat: -1,
            frames: this.anims.generateFrameNames('female_brawler', attackAnimationConfig),
            frameRate: 8,
        })
    }

    playIdle(): void {
        console.log("Playing idle animation")
        this.play('FFighter-idle');
    }
    
}