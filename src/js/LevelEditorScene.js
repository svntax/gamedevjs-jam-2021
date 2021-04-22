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

        this.numberOfBeats = 68; // NOTE: Number of beats in intro test song
        this.numberOfSubdivisions = this.numberOfBeats * 4; // Sixteenth notes are the smallest subdivision

        // Playback controls UI
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

        // Menu controls UI
        this.menuButtons = this.rexUI.add.buttons({
            x: 680, y: 160,
            width: 200,
            orientation: "y",

            buttons: [
                this.createButton(this, "Upload song"),
                this.createButton(this, "Save"),
                this.createButton(this, "Import"),
                this.createButton(this, "Exit")
            ],

            space: {
                left: 10, right: 10, top: 10, bottom: 10, 
                item: 4
            },
            expand: true
        })
        .layout();

        this.menuButtons.on("button.click", (button, index, pointer, event) => {
            if(button.text === "Exit"){
                this.onExitClicked();
            }
            else if(button.text === "Save"){
                // TODO: convert level data and metadata to text/json
            }
            else if(button.text === "Import"){
                // TODO: prompt for level data file
            }
            else if(button.text === "Upload song"){
                // TODO: prompt for song file
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

        /*const style = document.createElement("style");
        style.innerHTML = `
        #bpmInput::-webkit-inner-spin-button, 
        #bpmInput::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }`;
        document.head.appendChild(style);*/

        // Timeline UI
        this.timelineCursor = this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, LevelEditorScene.COLOR_PRIMARY);
        this.timelineCursor.depth = 10;
        this.syncedTimelineCursor = this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, LevelEditorScene.COLOR_PRIMARY);
        this.syncedTimelineCursor.depth = 20;
        this.timelineSlider = this.rexUI.add.slider({
            x: this.cameras.main.centerX,
            y: 520,
            width: 400,
            height: 20,
            orientation: "x",
            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, LevelEditorScene.COLOR_DARK),
            //indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, LevelEditorScene.COLOR_PRIMARY),
            thumb: this.timelineCursor,
            input: "click", // "drag"|"click"
            valuechangeCallback: function(value, oldValue){
                if(sceneRef.syncedTimelineSlider){
                    sceneRef.syncedTimelineSlider.visible = false;
                }
                sceneRef.timelineCursor.visible = true;
                if(sceneRef.song){
                    const subdivisionIndex = Math.round(value * sceneRef.numberOfBeats); // TODO: change to use subdivisions instead
                    sceneRef.beatIndex = subdivisionIndex;
                    sceneRef.onPauseClicked();
                    if(sceneRef.beatTimer){
                        sceneRef.beatTimer.remove();
                    }
                    sceneRef.beatTimer = sceneRef.time.addEvent({
                        delay: 60000 / sceneRef.bpm,
                        callback: sceneRef.runBeat,
                        callbackScope: sceneRef,
                        loop: true,
                        paused: true
                    });
                    const targetSeek = sceneRef.song.duration * (subdivisionIndex / sceneRef.numberOfBeats); // TODO: change to use subdivisions instead
                    sceneRef.song.stop();
                    sceneRef.song.play({seek: targetSeek});
                    sceneRef.song.pause();
                    sceneRef.playButton.setText("Play");
                    sceneRef.runBeat();
                }
            },

        })
        .layout();

        this.syncedTimelineSlider = this.rexUI.add.slider({
            x: this.cameras.main.centerX,
            y: 520,
            width: 400,
            height: 20,
            orientation: "x",
            thumb: this.syncedTimelineCursor,
            input: "none",
        })
        .layout();

        this.song = this.sound.add("first_song");

        this.beatLength = 60 / this.bpm;
        this.levelData = [
            [{x: 0, y: 0, type: 1, duration: this.beatLength / 2}, {x: 2, y: 1, type: 1, duration: this.beatLength / 2}],
            [{x: 1, y: 0, type: 1, duration: this.beatLength / 2}, {x: 3, y: 1, type: 1, duration: this.beatLength / 2}],
            [{x: 0, y: 0, type: 2, duration: this.beatLength}, {x: 2, y: 1, type: 2, duration: this.beatLength}],
            [{x: 1, y: 0, type: 2, duration: this.beatLength}, {x: 3, y: 1, type: 2, duration: this.beatLength}],
            [],[],[],[],[],[],[],[],[],
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
        this.runBeat();
        this.beatIndex = 0;

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
    }

    runBeat = () => {
        if(this.beatIndex >= this.levelData.length){
            // Reached the end of the song
            this.beatIndex = 0;
            this.beatTimer.remove();
            this.state = "EDITING";
            return;
        }
        const progressFraction = this.beatIndex / this.numberOfBeats; // TODO: change to use subdivisions instead
        this.syncedTimelineSlider.value = progressFraction;
        this.timelineCursor.visible = false;
        this.syncedTimelineSlider.visible = true;

        // First reset the state of all tiles
        for(let i = 0; i < this.levelTiles.length; i++){
            for(let j = 0; j < this.levelTiles[i].length; j++){
                this.levelTiles[i][j].resetState();
            }
            const debugTile = this.levelTiles[i];
        }

        // Then read the current row of tile data and update their states
        if(!this.levelTiles){
            return;
        }
        const currentData = this.levelData[this.beatIndex];
        for(let i = 0; i < currentData.length; i++){
            const beat = currentData[i];
            if(beat.type === 1){ // Telegraph/flash
                this.levelTiles[beat.x][beat.y].flash();
            }
            else if(beat.type === 2){ // Laser
                this.levelTiles[beat.x][beat.y].shootLaser();
            }
        }
        this.beatIndex++;
    }

    onExitClicked = () => {
        this.song.stop();
        // TODO: confirm prompt, also check unsaved progress
        this.scene.start("MainMenu");
    }

    onStopClicked = () => {
        this.song.stop();
        this.beatIndex = 0;
        this.runBeat();
        this.beatIndex = 0;
        this.state = "EDITING";
        if(this.beatTimer){
            this.beatTimer.remove();
        }
    }

    onPlayClicked = () => {
        this.state = "PLAYING";
        if(this.song.isPaused){
            this.song.resume();
            if(this.beatTimer){
                this.beatTimer.paused = false;
            }
            else{
                this.beatTimer = this.time.addEvent({
                    delay: 60000 / this.bpm,
                    callback: this.runBeat,
                    callbackScope: this,
                    loop: true
                });
                this.runBeat();
            }
        }
        else{
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
            this.runBeat();
        }
    }

    onPauseClicked = () => {
        if(this.beatTimer){
            this.beatTimer.paused = true;
        }
        this.song.pause();
        this.state = "EDITING";
    }

    moveBeatLeft = () => {

    }

    moveBeatRight = () => {

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
        if(this.playButton.text === "Pause"){
            if(this.beatTimer){
                this.beatTimer.paused = false;
            }
            this.song.resume();
        }
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