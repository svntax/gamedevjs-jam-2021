import "phaser";

import { createButton, login, logout } from "./utils";

class MainMenuScene extends Phaser.Scene {

    constructor(){
        super("MainMenu");
    }

    preload(){
        this.load.audio("tutorialSong", ["assets/tutorial_song.ogg"]);
        this.load.json("tutorialLevelData", "assets/TutorialLevel.json");

        this.load.audio("laserSound", ["assets/laser.wav"]);
        this.load.audio("telegraphSound", ["assets/telegraph.wav"]);
    }

    create(){
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this);

        this.playButton = createButton(this, "Play");
        this.browseLevelsButton = createButton(this, "Browse Levels");
        this.levelEditorButton = createButton(this, "Level Editor");
        //this.optionsButton = createButton(this, "Options");
        this.menuButtons = this.rexUI.add.buttons({
            x: this.cameras.main.centerX, y: 440,
            width: 400,
            orientation: "y",
            buttons: [
                this.playButton,
                this.browseLevelsButton,
                this.levelEditorButton,
                //this.optionsButton
            ],
            space: 12,
            expand: false
        })
        .layout();

        this.menuButtons.on("button.click", (button, index, pointer, event) => {
            if(button.text === "Play"){
                // TODO: level select with default/included levels
                this.scene.start("Gameplay", {});
            }
            else if(button.text === "Browse Levels"){
                this.scene.start("BrowseLevelsMenu");
            }
            else if(button.text === "Level Editor"){
                this.scene.start("LevelEditor");
            }
            else if(button.text === "Options"){
                // Unfinished: volume controls
            }
        });

        this.titleText = this.add.text(this.cameras.main.centerX, 128, "Just Lasers\nand\nReflections", { fontSize: 48, align: "center" });
        this.titleText.setOrigin(0.5);

        // Grid setup
        this.gridWidth = 12;
        this.gridHeight = 4;
        this.tileSize = 32;
        this.gridOriginX = (this.sys.game.canvas.width - (this.gridWidth * this.tileSize)) / 2;
        this.gridOriginY = 214;
        for(let x = 0; x < this.gridWidth; x++){
            for(let y = 0; y < this.gridHeight; y++){
                const color = x < this.gridWidth / 2 ? 0xe3e3e3 : 0x7fb2f0;
                let rect = this.add.rectangle(this.gridOriginX + x*this.tileSize + 2, this.gridOriginY + y*this.tileSize + 2, 28, 24, color);
                const color2 = x < this.gridWidth / 2 ? 0x8d8d8d : 0x2d73ce;
                let bottom = this.add.rectangle(this.gridOriginX + x*this.tileSize + 2, this.gridOriginY + y*this.tileSize + 24, 28, 6, color2);
                bottom.setOrigin(0, 0);
                rect.setOrigin(0, 0);
            }
        }

        this.popupBg = this.add.rectangle(0, 0, this.sys.game.canvas.width, this.sys.game.canvas.height, 0, 0.5);
        this.popupBg.setOrigin(0);
        this.popupBg.depth = 40;
        this.popupBg.setInteractive().on("pointerdown", (pointer, localX, localY, event) => {
            // Do nothing, this background is just meant to block the mouse from clicking on anything behind it
        });
        this.popupBg.visible = false;
        this.popupText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Popup message", { fontSize: 32 });
        this.popupText.setOrigin(0.5);
        this.popupText.visible = false;
        this.popupText.depth = 40;

        const loginText = window.walletConnection.isSignedIn() ? "Logout from NEAR" : "Login to NEAR";
        this.nearLoginButton = createButton(this, loginText, { fontSize: "12px" });
        this.loginButtonGroup = this.rexUI.add.buttons({
            x: 700, y: 72,
            width: 120,
            orientation: "y",
            buttons: [
                this.nearLoginButton
            ],
            space: 12,
            expand: false
        })
        .layout();
        this.loginButtonGroup.on("button.click", (button, index, pointer, event) => {
            if(button.text === "Login to NEAR"){
                login();
            }
            else if(button.text === "Logout from NEAR"){
                logout();
            }
        });
    }

    update(){
    }

    showMessagePopup = (message, duration) => {
        this.popupBg.visible = true;
        this.popupText.visible = true;
        this.popupText.setText(message);
        this.time.delayedCall(duration, () => {
            this.popupBg.visible = false;
            this.popupText.visible = false;
        }, [], this);
    }

    onFocus = () => {
        if(window.walletConnection.isSignedIn()){
            if(this.nearLoginButton){
                this.nearLoginButton.text = "Logout from NEAR";
            }
        }
        else{
            if(this.nearLoginButton){
                this.nearLoginButton.text = "Login to NEAR";
            }
        }
    }

}

export default MainMenuScene;