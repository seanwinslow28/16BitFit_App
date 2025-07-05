import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import { FontLoaderPlugin, FontFile } from './plugins/font_loader_plugin';

import MergedInput from 'phaser3-merged-input';
import { InputController } from './controller/InputController'

import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1200,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "matter",
        matter: {
            debug: true
        }
    },
    plugins: {
        scene: [
          {
            plugin: PhaserMatterCollisionPlugin, // The plugin class
            key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
            mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
          },
        //   {
        //     key: "mergedInput",
        //     plugin: MergedInput,
        //     mapping: "mergedInput",
        //   },
        ],
        global: [
            {
                key: 'FontLoaderPlugin',
                plugin: FontLoaderPlugin,
                start: true
            } 
        ]
    },
    input: {
        gamepad: true
    },
    scene: [
        Boot,
        InputController,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

export default new Game(config);
