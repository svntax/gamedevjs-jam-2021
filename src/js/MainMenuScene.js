import "phaser";

class MainMenuScene extends Phaser.Scene {

    constructor(){
        super("MainMenu");
    }

    preload(){
        this.load.audio("first_song", ["assets/first_song.mp3"]);
    }

    create(){
        this.playButton = this.createButton(this, "Play");
        this.browseLevelsButton = this.createButton(this, "Browse Levels");
        this.levelEditorButton = this.createButton(this, "Level Editor");
        this.optionsButton = this.createButton(this, "Options");
        this.playbackButtons = this.rexUI.add.buttons({
            x: this.cameras.main.centerX, y: 420,
            width: 400,
            orientation: "y",

            buttons: [
                this.playButton,
                this.browseLevelsButton,
                this.levelEditorButton,
                this.optionsButton
            ],

            space: 12,
            expand: false
        })
        .layout();

        this.playbackButtons.on("button.click", (button, index, pointer, event) => {
            if(button.text === "Play"){
                // TODO: level select with default/included levels
                this.scene.start("Gameplay");
            }
            else if(button.text === "Browse Levels"){
                // TODO
            }
            else if(button.text === "Level Editor"){
                this.scene.start("LevelEditor");
            }
            else if(button.text === "Options"){
                // TODO: volume controls
            }
        });
    }

    update(){
    }

    createButton = (scene, text) => {
        return scene.rexUI.add.label({
            width: 40,
            height: 40,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 2, 0xb4b4b4),
            text: scene.add.text(0, 0, text, {
                fontSize: "32px"
            }),
            space: {
                left: 12,
                right: 12,
            },
            align: "center"
        });
    }

}

export default MainMenuScene;