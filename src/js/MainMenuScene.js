import "phaser";

class MainMenuScene extends Phaser.Scene {

    constructor(){
        super("MainMenu");
    }

    preload(){
        this.load.audio("first_song", ["assets/first_song.mp3"]);
    }

    create(){
        this.startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Start", {fontSize: 32});
        this.startButton.setOrigin(0.5);
        this.startButton.setInteractive().on("pointerdown", this.onStartButtonClicked);

        this.levelEditorButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 96, "Level Editor", {fontSize: 32});
        this.levelEditorButton.setOrigin(0.5);
        this.levelEditorButton.setInteractive().on("pointerdown", this.onLevelEditorButtonClicked);
    }

    onStartButtonClicked = (pointer, localX, localY, event) => {
        this.scene.start("Gameplay");
    }

    onLevelEditorButtonClicked = (pointer, localX, localY, event) => {
        this.scene.start("LevelEditor");
    }

    update(){
    }

}

export default MainMenuScene;