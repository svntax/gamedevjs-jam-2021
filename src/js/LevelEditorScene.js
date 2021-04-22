import "phaser";
import FloorTileDebug from "./FloorTileDebug";

class LevelEditorScene extends Phaser.Scene {

    static COLOR_PRIMARY = 0x4e342e;
    static COLOR_LIGHT = 0x7b5e57;
    static COLOR_DARK = 0x260e04;

    constructor(){
        super("LevelEditor");
    }

    create(){
        this.game.events.addListener(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this);

        this.mainMenuButton = this.add.text(64, 64, "Exit", {fontSize: 32});
        this.mainMenuButton.setOrigin(0, 0.5);
        this.mainMenuButton.setInteractive().on("pointerdown", this.onMainMenuButtonClicked);

        this.playButton = this.createButton(this, "Play");
        this.playbackButtons = this.rexUI.add.buttons({
            x: 280, y: 420,
            width: 400,
            orientation: "x",

            buttons: [
                this.createButton(this, "<-"),
                this.createButton(this, "->"),
                this.playButton,
                this.createButton(this, "Stop")
            ],

            space: {
                left: 10, right: 10, top: 10, bottom: 10, 
                item: 4
            },
            expand: true
        })
        .layout();

        this.playbackButtons.on("button.click", (button, index, pointer, event) => {
            if(button.text === "Play"){
                button.text = "Pause";
                this.onPlayClicked();
            }
            else if(button.text === "Pause"){
                button.text = "Play";
                this.onPauseClicked();
            }
            else if(button.text === "Stop"){
                this.onStopClicked();
                this.playButton.text = "Play";
            }
            else if(button.text === "<-"){
                this.moveBeatLeft();
            }
            else if(button.text === "->"){
                this.moveBeatRight();
            }
        });

        this.bpm = 100;
        const sceneRef = this;
        this.bpmLabel = this.add.text(484, 380, "BPM", {fontSize: "24px"});

        this.bpmInput = this.add.rexInputText(512, 384, 10, 10, {
            id: "bpmInput",
            type: "number",
            text: "100",
            fontSize: "24px",
        })
        .resize(76, 100)
        .setOrigin(0.5)
        .on("textchange", function (inputText) {
            sceneRef.bpm = parseInt(inputText.text);
        });

        this.bpmInput.node.addEventListener("keypress", function (evt) {
            if(evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57) {
                evt.preventDefault();
            }
        });

        const style = document.createElement("style");
        style.innerHTML = `
        #bpmInput::-webkit-inner-spin-button, 
        #bpmInput::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }`;
        document.head.appendChild(style);

        this.song = this.sound.add("first_song");

        this.beatLength = 60 / this.bpm;
        this.levelData = [
            [{x: 0, y: 0, type: 1, duration: this.beatLength / 2}, {x: 2, y: 1, type: 1, duration: this.beatLength / 2}],
            [{x: 1, y: 0, type: 1, duration: this.beatLength / 2}, {x: 3, y: 1, type: 1, duration: this.beatLength / 2}],
            [{x: 0, y: 0, type: 2, duration: this.beatLength}, {x: 2, y: 1, type: 2, duration: this.beatLength}],
            [{x: 1, y: 0, type: 2, duration: this.beatLength}, {x: 3, y: 1, type: 2, duration: this.beatLength}],
            [],
            [],
            []
        ];
        this.beatIndex = 0;

        this.gridOriginX = 64;
        this.gridOriginY = 64;
        this.gridWidth = 20;
        this.gridHeight = 12;
        this.tileSize = 24;
        this.levelTiles = [];
        for(let x = 0; x < this.gridWidth; x++){
            this.levelTiles[x] = [];
        }
        for(let x = 0; x < this.gridWidth; x++){
            for(let y = 0; y < this.gridHeight; y++){
                const color = x < 10 ? 0xe3e3e3 : 0x7fb2f0;

                let floorTile = new FloorTileDebug(this, this.gridOriginX + x*this.tileSize, this.gridOriginY + y*this.tileSize);
                floorTile.hitbox.fillColor = color;
                this.levelTiles[x][y] = floorTile;
            }
        }

        this.state = "EDITING";
    }

    update(){
        if(this.state === "LOADING"){
            if(!this.song.isDecoding){
                this.state = "PLAYING";
                this.beatTimer = this.time.addEvent({
                    delay: 60000 / this.bpm,
                    callback: this.runBeat,
                    callbackScope: this,
                    loop: true
                });
            }
        }
        else if(this.state === "PLAYING"){
            for(let x = 0; x < this.levelTiles.length; x++){
                for(let y = 0; y < this.levelTiles[x].length; y++){
                    this.levelTiles[x][y].update();
                }
            }
        }
    }

    runBeat = () => {
        const currentData = this.levelData[this.beatIndex];
        for(let i = 0; i < currentData.length; i++){
            const beat = currentData[i];
            if(beat.type === 1){ // Telegraph/flash
                this.levelTiles[beat.x][beat.y].flash(beat.duration*1000);
            }
            else if(beat.type === 2){ // Laser
                this.levelTiles[beat.x][beat.y].shootLaser(beat.duration*1000);
            }
        }
        this.beatIndex++;
        if(this.beatIndex >= this.levelData.length){
            // Reached the end of the song
            this.beatIndex = 0;
            this.beatTimer.remove();
            this.state = "EDITING";
        }
    }

    resetDamageCooldown = () => {
        this.canTakeDamage = true;
    }

    onMainMenuButtonClicked = (pointer, localX, localY, event) => {
        this.song.stop();
        // TODO: confirm prompt, also check unsaved progress
    }

    onStopClicked = () => {
        this.song.stop();
        this.beatIndex = 0;
        this.state = "EDITING";
        if(this.beatTimer){
            this.beatTimer.remove();
        }
    }

    onPlayClicked = () => {
        if(this.song.isPaused){
            console.log("Played after pausign");
            this.song.resume();
            this.beatTimer.paused = false;
        }
        else{
            this.state = "PLAYING";
            if(this.beatTimer){
                this.beatTimer.remove();
            }
            this.beatTimer = this.time.addEvent({
                delay: 60000 / this.bpm,
                callback: this.runBeat,
                callbackScope: this,
                loop: true
            });
            this.song.play();
        }
    }

    onPauseClicked = () => {
        if(this.beatTimer){
            this.beatTimer.paused = true;
        }
        this.song.pause();
        this.state = "EDITING";
    }

    createButton = (scene, text) => {
        return scene.rexUI.add.label({
            width: 40,
            height: 40,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, LevelEditorScene.COLOR_LIGHT),
            text: scene.add.text(0, 0, text, {
                fontSize: 18
            }),
            space: {
                left: 10,
                right: 10,
            },
            align: "center"
        });
    }

    onBlur = () => {
        if(this.beatTimer){
            this.beatTimer.paused = true;
        }
        this.song.pause();
    }

    onFocus = () => {
        if(this.beatTimer){
            this.beatTimer.paused = false;
        }
        this.song.resume();
    }

    getTileSize = () => {
        return this.tileSize;
    }

    getGridX = () => {
        return this.gridOriginX;
    }

    getGridY = () => {
        return this.gridOriginY;
    }

    getGridWidth = () => {
        return this.gridWidth;
    }

    getGridHeight = () => {
        return this.gridHeight;
    }
}

export default LevelEditorScene;