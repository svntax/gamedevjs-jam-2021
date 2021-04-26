import "phaser";
import { createButton } from "./utils.js";

class BrowseLevelsScene extends Phaser.Scene {

    constructor(){
        super("BrowseLevelsMenu");
    }

    preload(){

    }

    create(){
        this.headerText = this.add.text(this.cameras.main.centerX, 64, "Player Submitted Levels", { fontSize: 32 });
        this.headerText.setOrigin(0.5);
        this.loadingText = this.add.text(this.cameras.main.centerX, 112, "Loading levels...", { fontSize: 24 });
        this.loadingText.setOrigin(0.5);

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
                this.scene.start("MainMenu");
            }
        });

        this.loadLevelsMetadata();
    }

    loadLevelsMetadata = async () => {
        const levels = await window.contract.getLevels();
        this.levelsMetadata = [];
        const buttonsArray = [];
        for(let i = 0; i < levels.length; i++){
            if(!levels[i].levelName || !levels[i].sender){
                // Invalid entry
                continue;
            }
            let btn = createButton(this, levels[i].levelName + "\nby " + levels[i].sender, { fontSize: "16px" });
            buttonsArray.push(btn);
            this.levelsMetadata.push(levels[i]);
        }

        // Set up the scrollable container
        this.levelsContainer = this.rexUI.add.buttons({
            x: this.cameras.main.centerX, y: this.cameras.main.centerY,
            width: 440,
            height: 400,
            orientation: "y",
            buttons: buttonsArray,
            space: 12,
            expand: false,
            align: "top"
        })
        .layout();

        this.levelsContainer.on("button.click", (button, index, pointer, event) => {
            this.playLevel(index);
        });

        this.loadingText.visible = false;
    }

    playLevel = async (index) => {
        const metadata = this.levelsMetadata[index];
        // Download the json level data
        const chunks = [];
        for await (const chunk of window.ipfsNode.cat("/ipfs/" + metadata.levelDataHash)) {
            chunks.push(chunk);
        }
        let jsonData = JSON.parse(chunks);
        //console.log("Downloaded json result:", jsonData);
        // Download audio data
        const audioChunks = [];
        for await (const chunk of window.ipfsNode.cat("/ipfs/" + metadata.audioHash)){
            audioChunks.push(chunk);
        }
        const audioBlob = new Blob(audioChunks);
        //console.log("Downloaded audio result:", audioBlob);
        this.scene.start("Gameplay", {
            jsonObject: jsonData,
            audioData: audioBlob
        });
    }

    update(){
    }

}

export default BrowseLevelsScene;