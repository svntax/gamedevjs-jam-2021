import "phaser";
import {createButton} from "./utils.js";

import * as nearAPI from "near-api-js";
const { connect, keyStores, WalletConnection } = nearAPI;

class BrowseLevelsScene extends Phaser.Scene {

    constructor(){
        super("BrowseLevelsMenu");
    }

    preload(){
        
    }

    create(){
        console.log(connect);
        this.backButton = createButton(this, "Back");
        this.menuButtons = this.rexUI.add.buttons({
            x: 112, y: 540,
            width: 128,
            orientation: "y",

            buttons: [
                this.backButton,
            ],
            space: 12,
            expand: false
        })
        .layout();

        this.menuButtons.on("button.click", (button, index, pointer, event) => {
            if(button.text === "Back"){
                // TODO: level select with default/included levels
                this.scene.start("MainMenu");
            }
        });
    }

    update(){
    }

}

export default BrowseLevelsScene;