import "phaser";
import MainMenuScene from "./js/MainMenuScene";
import GameplayScene from "./js/GameplayScene";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    }
};

class Game extends Phaser.Game{
    constructor(){
        super(config);
        this.scene.add("MainMenu", MainMenuScene);
        this.scene.add("Gameplay", GameplayScene);
        this.scene.start("MainMenu");
    }
}

window.onload = function(){
    const game = new Game();
};