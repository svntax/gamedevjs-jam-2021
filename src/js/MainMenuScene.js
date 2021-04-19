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
    }

    onStartButtonClicked = (pointer, localX, localY, event) => {
        this.scene.start("Gameplay");
    }

    update(){
    }

}

export default MainMenuScene;