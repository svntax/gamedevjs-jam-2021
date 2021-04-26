import "phaser";
import { createButton } from "./utils.js";

class BrowseLevelsScene extends Phaser.Scene {

    constructor(){
        super("BrowseLevelsMenu");
    }

    preload(){

    }

    async create(){
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
            console.log("Level " + i + ":", levels[i]);
            if(!levels[i].levelName || !levels[i].sender){
                // Invalid entry
                continue;
            }
            let btn = createButton(this, levels[i].levelName + "\nby " + levels[i].sender, { fontSize: "16px", });
            buttonsArray.push(btn);
            this.levelsMetadata.push(levels[i]);
        }

        // Set up the scrollable container
        this.levelsContainer = this.rexUI.add.buttons({
            x: this.cameras.main.centerX, y: 200,
            width: 440,
            orientation: "y",
            buttons: buttonsArray,
            space: 12,
            expand: false
        })
        .layout();

        this.levelsContainer.on("button.click", (button, index, pointer, event) => {
            console.log(this.levelsMetadata[index]);
            this.playLevel(index);
        });
    }

    playLevel = async (index) => {
        const metadata = this.levelsMetadata[index];
        // Download the json level data
        const chunks = [];
        for await (const chunk of window.ipfsNode.cat("/ipfs/" + metadata.levelDataHash)) {
            chunks.push(chunk);
        }
        let jsonData = JSON.parse(chunks);
        // Download audio data
        const audioChunks = [];
        for await (const chunk of window.ipfsNode.cat("/ipfs/" + metadata.audioHash)){
            audioChunks.push(chunk);
        }
        const audioBlob = new Blob(audioChunks);
        const audioArrayBuffer = await audioBlob.arrayBuffer();
        // TODO: pass blob to new scene instead of decoding here
        this.sound.decodeAudio("testSong", audioArrayBuffer);
        this.sound.on("decodedall", () => {
            console.log("Decoded downloaded audio!");
            let testSong = this.sound.add("testSong");
            testSong.play();
        });
    }

    update(){
    }

}

export default BrowseLevelsScene;