import "phaser";

import { createButton, login, logout } from "./utils";

class MainMenuScene extends Phaser.Scene {

    constructor(){
        super("MainMenu");
    }

    preload(){
        this.load.audio("first_song", ["assets/first_song.mp3"]);
    }

    create(){
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this);

        this.playButton = createButton(this, "Play");
        this.browseLevelsButton = createButton(this, "Browse Levels");
        this.levelEditorButton = createButton(this, "Level Editor");
        this.optionsButton = createButton(this, "Options");
        this.menuButtons = this.rexUI.add.buttons({
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

        this.menuButtons.on("button.click", (button, index, pointer, event) => {
            if(button.text === "Play"){
                // TODO: level select with default/included levels
                this.scene.start("Gameplay");
            }
            else if(button.text === "Browse Levels"){
                this.scene.start("BrowseLevelsMenu");
            }
            else if(button.text === "Level Editor"){
                this.scene.start("LevelEditor");
            }
            else if(button.text === "Options"){
                // TODO: volume controls
            }
        });

        const loginText = window.walletConnection.isSignedIn() ? "Logout from NEAR" : "Login to NEAR";
        this.nearLoginButton = createButton(this, loginText, { fontSize: "12px" });
        this.loginButtonGroup = this.rexUI.add.buttons({
            x: 680, y: 72,
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