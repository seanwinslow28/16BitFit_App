import { Scene, GameObjects } from 'phaser';
import MergedInput, { Player } from 'phaser3-merged-input';
import { InputController } from '../controller/InputController';
import { FFighter } from '../player/FFighter';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;

    public mergedInput?: MergedInput;
    inputController: InputController;

    player1: Player;
    player2: Player;
    players: Player[];

    player1sprite: FFighter;
    shapes: any;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        const { width, height } = this.scale; 
        this.shapes = this.cache.json.get('female_brawler_shapes');

        this.anims.create(
            {
                key: 'level1',
                frames: [
                    { key: 'level1_001' },
                    { key: 'level1_002' },
                    { key: 'level1_003' },
                    { key: 'level1_004' },
                    { key: 'level1_005' },
                    { key: 'level1_006' },
                    { key: 'level1_007' },
                    { key: 'level1_008' },
                ],
                frameRate: 10,
                repeat: -1
            });
        this.add.sprite(0, 0, 'level1_001').setOrigin(0, 0).play('level1');

        // Get the input controller scene, which contains our player objects
        this.inputController = this.scene.get('InputController');

         // Get our player objects
         this.player1 = this.inputController.player1;
         this.player2 = this.inputController.player2;
 
         // Set up an array of player objects
         this.players = [this.player1, this.player2];
            console.log("Shapes is: ", this.shapes);
         this.player1sprite = new FFighter(this, width - width + 250, height - 100, 'female_brawler', 'FFighter_086',
            //{shape: this.shapes.FFighter_086},
         );
         this.player1sprite.setOrigin(0.5,0.5).setScale(0.5,0.5);

         this.player1sprite.setPosition(200 + this.player1sprite.centerOfMass.x, 100 + this.player1sprite.centerOfMass.y);
         this.player1sprite.defineAnimations();
         this.player1sprite.playIdle();
         console.log("Player 1 sprite bounds, width, and height: " + this.player1sprite.getBounds(), this.player1sprite.width, this.player1sprite.height);
    }
}
