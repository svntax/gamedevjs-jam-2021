import "phaser";
import { createButton } from "./utils.js";

class BrowseLevelsScene extends Phaser.Scene {

    constructor(){
        super("BrowseLevelsMenu");
    }

    preload(){

    }

    async create(){
        const response = await window.contract.hello();
        console.log("Contract response:", response);

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
            if (button.text === "Back") {
                this.scene.start("MainMenu");
            }
        });

        this.loadLevelsMetadata();
    }

    loadLevelsMetadata = async () => {
        // TODO temp, remove later
        if(window.cidPath){
            const chunks = [];
            for await (const chunk of window.ipfsNode.cat("/ipfs/" + window.cidPath)) {
                chunks.push(chunk);
            }
            let testData = JSON.parse(chunks);
            this.add.text(400, 200, testData.name, {fontSize: "32px"});
        }
    }

    update(){
    }

}

export default BrowseLevelsScene;