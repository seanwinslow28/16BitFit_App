import { Scene, GameObjects } from 'phaser';
import MergedInput, { Player } from 'phaser3-merged-input';
import { InputController } from '../controller/InputController';
import { FFighter } from '../player/FFighter';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    private menuOptions: GameObjects.Text[] = [];
    private selectedMenuOption = 0;
    public mergedInput?: MergedInput;
    inputController: InputController;
    private enterKey: Phaser.Input.Keyboard.Key;
    player1: Player;
    player2: Player;
    players: Player[];

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale; 

        this.anims.create(
            {
                key: 'mainmenu',
                frames: [
                    { key: 'mainmenu_001' },
                    { key: 'mainmenu_002' },
                    { key: 'mainmenu_003' },
                    { key: 'mainmenu_004' },
                ],
                frameRate: 15,
                repeat: -1
            });
        this.add.sprite(0, 0, 'mainmenu_001').setOrigin(0, 0).play('mainmenu');

        // Get the input controller scene, which contains our player objects
        this.inputController = this.scene.get('InputController');
        this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)!;

        // Get our player objects
        this.player1 = this.inputController.player1;
        this.player2 = this.inputController.player2;

        // Set up an array of player objects
        this.players = [this.player1, this.player2]

        // Add the input keys

        // keyboard_keydown, keyboard_keyup, gamepad_buttondown, gamepad_directiondown,
        // gamepad_buttonup, gamepad_directionup, down, up, pointer_down, pointer_up, 
        this.inputController.mergedInput?.events.on('gamepad_keydown', ({key, player}) => {
            //console.log(`Player: ${event} entered: ${event}!`);
            console.log(this.inputController.mergedInput?.getPlayerIndexFromKey(key));
            let pressedButton = this.inputController.mergedInput?.getPlayerButtonFromKey(key);

            console.log("Key is:", key, player, pressedButton);

        });

        // This section is for adding the title and main menu options

        console.log(width/12, width/4+50, width/3+25, width/3+100, height);

        this.add.text(width/2, height/6, 'Brutal Brawl', {
            fontFamily: 'dragon_woff', fontSize: 160, color: '#ffffff',
            stroke: '#ff0000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5, 0.5).setShadow(15, 15, "#111111", 4, true, true);

        const classicOption = this.add.text(width/2, height/2, 'Classic', {
            fontFamily: 'dragon_woff', fontSize: 70, color: '#800000',
            stroke: '#111111', strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.menuOptions.push(classicOption);

        const surviveOption = this.add.text(width/2, height/2+75, 'Survive', {
            fontFamily: 'dragon_woff', fontSize: 70, color: '#000000',
            stroke: '#111111', strokeThickness: 0,
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.menuOptions.push(surviveOption);

        const optionsOption = this.add.text(width/2, height/2+150, 'Options', {
            fontFamily: 'dragon_woff', fontSize: 70, color: '#000000',
            stroke: '#111111', strokeThickness: 0,
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.menuOptions.push(optionsOption);

        this.selectButton(0);
    }

    selectButton(index: number)
    {
        const currentOption = this.menuOptions[this.selectedMenuOption];
        currentOption.setColor('#000000');
        currentOption.setStroke('#111111', 0);

        const newOption = this.menuOptions[index];
        newOption.setColor('#800000');
        currentOption.setStroke('#111111', 2);

        this.selectedMenuOption = index;
    }

    selectNextButton(change = 1)
    {
        let index = ( (this.selectedMenuOption + change ) + this.menuOptions.length ) % this.menuOptions.length; 
        this.selectButton(index)
    }

    confirmSelection()
    {
        console.log('confirmed selection')
        this.scene.start('Game');
    }

    update(time: number, delta: number): void {
        if (this.player2.interaction_mapped.isPressed(['DOWN', 'LC_S']) || this.player1.interaction_mapped.isPressed(['DOWN', 'LC_S'])) {
            console.log("down");
            this.selectNextButton(1)
        }
        else if (this.player2.interaction_mapped.isPressed(['UP', 'LC_N']) || this.player1.interaction_mapped.isPressed(['UP', 'LC_N'])) {
            console.log("up");
            this.selectNextButton(-1)
        }
        else if (this.player2.interaction_mapped.isPressed(['RC_S']) || this.player1.interaction_mapped.isPressed(['RC_S'])
        || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.confirmSelection();
        }

        if( (this.player1.direction.LEFT > 0) || (this.player2.direction.LEFT > 0) ){
            console.log("left");
        }
    }
}
