import "phaser";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import InputTextPlugin from "phaser3-rex-plugins/plugins/inputtext-plugin.js";
import FileChooserPlugin from "phaser3-rex-plugins/plugins/filechooser-plugin.js";

import MainMenuScene from "./js/MainMenuScene";
import GameplayScene from "./js/GameplayScene";
import LevelEditorScene from "./js/LevelEditorScene";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 0},
            debug: false
        }
    },
    plugins: {
        global: [
            {
                key: "rexInputTextPlugin",
                plugin: InputTextPlugin,
                start: true
            },
            {
                key: "rexFileChooser",
                plugin: FileChooserPlugin,
                start: true
            },
        ],
        scene: [
            {
                key: "rexUI",
                plugin: UIPlugin,
                mapping: "rexUI"
            },
        ]
    }
};

class Game extends Phaser.Game{
    constructor(){
        super(config);
        this.scene.add("MainMenu", MainMenuScene);
        this.scene.add("Gameplay", GameplayScene);
        this.scene.add("LevelEditor", LevelEditorScene);
        this.scene.start("MainMenu");
    }
}

window.onload = function(){
    const game = new Game();
};