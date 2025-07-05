export abstract class Player extends Phaser.Physics.Matter.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number, options?: Phaser.Types.Physics.Matter.MatterBodyConfig) {
        super(scene.matter.world, x, y, texture, frame, options);
        scene.add.existing(this);
        scene.matter.world.setBounds(0, 0, scene.scale.width, scene.scale.height);
    }

    getBody() {
        return this.body;
    }

    log() {
        console.log(this);
    }

    abstract defineAnimations(): void;
}