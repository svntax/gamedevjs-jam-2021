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
        const sceneRef = this;

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
        this.uploadSongButton = this.createButton(this, "Upload song");
        this.saveButton = this.createButton(this, "Save");
        this.importButton = this.createButton(this, "Import");
        this.menuButtons = this.rexUI.add.buttons({
            x: 680, y: 160,
            width: 200,
            orientation: "y",

            buttons: [
                this.uploadSongButton,
                this.saveButton,
                this.importButton,
                this.createButton(this, "Exit")
            ],

            space: {
                left: 10, right: 10, top: 10, bottom: 10, 
                item: 4
            },
            expand: true
        })
        .layout();

        this.loadingBg = this.add.rectangle(0, 0, this.sys.game.canvas.width, this.sys.game.canvas.height, 0, 0.5);
        this.loadingBg.setOrigin(0);
        this.loadingBg.depth = 40;
        this.loadingBg.setInteractive().on("pointerdown", (pointer, localX, localY, event) => {
            // Do nothing, this background is just meant to block the mouse from clicking on anything behind it
        });
        this.loadingBg.visible = false;
        this.loadingBgText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Loading...", {fontSize: 32});
        this.loadingBgText.setOrigin(0.5);
        this.loadingBgText.visible = false;
        this.loadingBgText.depth = 40;

        // Song upload input
        this.add.rexFileChooser({ accept: "audio/*" })
        .syncTo(this.uploadSongButton)
        .on("change", function (gameObject) {
            var files = gameObject.files;
            if (files.length === 0) {
                return;
            }
            // Set this.song to load the uploaded file
            sceneRef.loadingBg.visible = true;
            sceneRef.loadingBgText.visible = true;
            if(sceneRef.cache.audio.has("uploadedSong")){
                sceneRef.cache.audio.remove("uploadedSong");
            }
            const objectURL = URL.createObjectURL(files[0]);
            sceneRef.load.audio("uploadedSong", objectURL);
            sceneRef.load.once("complete", () => {
                sceneRef.song = sceneRef.sound.add("uploadedSong");
                sceneRef.loadingBg.visible = false;
                sceneRef.loadingBgText.visible = false;
                URL.revokeObjectURL(files[0]);
            });
            sceneRef.load.start();
        });

        // Level data importing
        this.add.rexFileChooser({ accept: ".json" })
        .syncTo(this.importButton)
        .on("change", function (gameObject) {
            var files = gameObject.files;
            if (files.length === 0) {
                return;
            }
            sceneRef.loadingBg.visible = true;
            sceneRef.loadingBgText.visible = true;
            // Read the json file
            const objectURL = URL.createObjectURL(files[0]);
            if(sceneRef.cache.json.has("levelData")){
                sceneRef.cache.json.remove("levelData");
            }
            sceneRef.load.json("levelData", objectURL);
            sceneRef.load.once("complete", () => {
                const jsonData = sceneRef.cache.json.get("levelData");
                // First validate the json data
                if(!jsonData || !jsonData.numBeats || !jsonData.bpm || !jsonData.name || !jsonData.levelData){
                    sceneRef.loadingBgText.setText("Error: could not load json data");
                    sceneRef.time.delayedCall(2000, () => {
                        sceneRef.loadingBg.visible = false;
                        sceneRef.loadingBgText.visible = false;
                        sceneRef.loadingBgText.setText("Loading...");
                    }, [], this);
                    return;
                }
                // Note: changing the text values directly for input boxes do NOT trigger the textchange event, so we have to manually update the variables too
                sceneRef.songLengthInput.text = jsonData.numBeats;
                sceneRef.setNumberOfBeats(jsonData.numBeats);
                sceneRef.updateLevelDataLength();

                sceneRef.bpm = jsonData.bpm;
                sceneRef.bpmInput.text = jsonData.bpm;

                sceneRef.levelNameInput.text = jsonData.name;
                sceneRef.levelName = jsonData.name;

                sceneRef.loadingBg.visible = false;
                sceneRef.loadingBgText.visible = false;

                sceneRef.levelData = jsonData.levelData;
            })
            sceneRef.load.start();
        });

        this.menuButtons.on("button.click", (button, index, pointer, event) => {
            if(button.text === "Exit"){
                this.onExitClicked();
            }
            else if(button.text === "Save"){
                this.onSaveClicked();
            }
        });

        this.levelName = "LevelName";
        this.levelNameInput = this.add.rexInputText(280, 44, 10, 10, {
            id: "bpmInput",
            type: "text",
            text: "LevelName",
            fontSize: "24px",
            minLength: 1,
            maxLength: 32,
            placeholder: "Level name here...",
            border: 2,
            borderColor: 0xfff,
            paddingLeft: "8px"
        })
        .resize(440, 40)
        .setOrigin(0.5)
        .on("textchange", function(inputText){
            sceneRef.levelName = inputText.text;
        });

        this.bpm = 100;
        
        this.bpmLabel = this.add.text(484, 376, "BPM", {fontSize: "24px"});
        this.bpmInput = this.add.rexInputText(478, 370, 76, 100, {
            id: "bpmInput",
            type: "number",
            text: "100",
            fontSize: "24px",
        })
        .setOrigin(0) // NOTE: must be 0 due to weird offset issue in Chrome
        .on("textchange", function(inputText){
            let newBpm = parseInt(inputText.text);
            if(newBpm <= 0){
                newBpm = 1;
                sceneRef.bpmInput.text = "1";
            }
            else{
                sceneRef.bpm = parseInt(inputText.text);
            }
        });
        this.bpmInput.node.addEventListener("keypress", function (evt) {
            if(evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57) {
                evt.preventDefault();
            }
        });

        this.songLengthLabel = this.add.text(578, 352, "Beats\nLength", {fontSize: "24px"});
        this.songLengthInput = this.add.rexInputText(576, 370, 76, 100, {
            id: "songLengthInput",
            type: "number",
            text: "68",
            fontSize: "24px",
        })
        .setOrigin(0) // NOTE: must be 0 due to weird offset issue in Chrome
        .on("textchange", function(inputText){
            let newLength = parseInt(inputText.text);
            if(newLength <= 0){
                newLength = 1;
                sceneRef.bpmInput.text = "1";
            }
            else{
                sceneRef.setNumberOfBeats(parseInt(inputText.text));
                sceneRef.updateLevelDataLength();
            }
        });
        this.bpmInput.node.addEventListener("keypress", function (evt) {
            if(evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57) {
                evt.preventDefault();
            }
        });

        this.beatIndexLabel = this.add.text(128, 508, "0001", {fontSize: "24px", align: "left"});

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
                    let subdivisionIndex = Math.round(value * sceneRef.numberOfSubdivisions);
                    if(subdivisionIndex >= sceneRef.numberOfSubdivisions){
                        subdivisionIndex = sceneRef.numberOfSubdivisions - 1;
                    }
                    sceneRef.setBeatIndex(subdivisionIndex);
                    sceneRef.onPauseClicked();
                    if(sceneRef.beatTimer){
                        sceneRef.beatTimer.remove();
                    }
                    sceneRef.beatTimer = sceneRef.time.addEvent({
                        delay: 60000 / sceneRef.bpm / 4,
                        callback: sceneRef.runBeat,
                        callbackScope: sceneRef,
                        loop: true,
                        paused: true
                    });
                    const targetSeek = sceneRef.song.duration * (subdivisionIndex / sceneRef.numberOfSubdivisions);
                    sceneRef.song.stop();
                    sceneRef.song.play({seek: targetSeek});
                    sceneRef.song.pause();
                    sceneRef.playButton.setText("Play");
                    sceneRef.readCurrentBeatData();
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
        this.levelData = [];
        for(let i = 0; i < this.numberOfSubdivisions; i++){
            this.levelData[i] = [];
        }
        /*this.levelData = [
            [{x: 0, y: 0, type: 1, duration: this.beatLength / 2}, {x: 2, y: 1, type: 1, duration: this.beatLength / 2}],
            [{x: 1, y: 0, type: 1, duration: this.beatLength / 2}, {x: 3, y: 1, type: 1, duration: this.beatLength / 2}],
            [{x: 0, y: 0, type: 2, duration: this.beatLength}, {x: 2, y: 1, type: 2, duration: this.beatLength}],
            [{x: 1, y: 0, type: 2, duration: this.beatLength}, {x: 3, y: 1, type: 2, duration: this.beatLength}],
            [],[],[],[],[],[],[],[],[],
        ];*/
        this.beatIndex = 0;

        this.gridOriginX = 64;
        this.gridOriginY = 74;
        this.gridWidth = 20;
        this.gridHeight = 12;
        this.tileSize = 24;
        this.levelTiles = [];
        for(let x = 0; x < this.gridWidth; x++){
            this.levelTiles[x] = [];
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
                    delay: 60000 / this.bpm / 4,
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
            this.decrementBeatIndex();
            this.beatTimer.remove();
            this.state = "EDITING";
            return;
        }
        const progressFraction = this.beatIndex / this.numberOfSubdivisions;
        this.syncedTimelineSlider.value = progressFraction;
        this.timelineCursor.visible = false;
        this.syncedTimelineSlider.visible = true;

        this.readCurrentBeatData();
        this.incrementBeatIndex();
        if(this.beatIndex >= this.levelData.length){
            // Reached the end of the song
            this.playButton.text = "Play";
            this.onStopClicked();
        }
    }

    setBeatIndex = (i) => {
        this.beatIndex = i;
        this.beatIndexLabel.text = i + 1;
        this.beatIndexLabel.text = this.beatIndexLabel.text.padStart(4, "0");
    }
    incrementBeatIndex = () => {
        this.beatIndex++;
        this.beatIndexLabel.text = this.beatIndex + 1;
        this.beatIndexLabel.text = this.beatIndexLabel.text.padStart(4, "0");
    }
    decrementBeatIndex = () => {
        this.beatIndex--;
        this.beatIndexLabel.text = this.beatIndex + 1;
        this.beatIndexLabel.text = this.beatIndexLabel.text.padStart(4, "0");
    }

    readCurrentBeatData = () => {
        if(!this.levelTiles || !this.levelData){
            return;
        }

        // First reset the state of all tiles
        for(let i = 0; i < this.levelTiles.length; i++){
            for(let j = 0; j < this.levelTiles[i].length; j++){
                this.levelTiles[i][j].resetState();
            }
        }

        // Then read the current row of tile data and update their states
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
    }

    updateLevelDataLength = () => {
        let currentLength = this.levelData.length;
        if(currentLength < this.numberOfSubdivisions){
            while(this.levelData.length < this.numberOfSubdivisions){
                this.levelData.push([]);
            }
        }
        else{
            while(this.levelData.length > this.numberOfSubdivisions){
                this.levelData.pop();
            }
        }
    }

    onExitClicked = () => {
        this.song.stop();
        // TODO: confirm prompt, also check unsaved progress
        this.clearData();
        this.scene.start("MainMenu");
    }

    onSaveClicked = () => {
        let name = this.levelName;
        if(name){
            const jsonObject = {
                "name": name,
                "bpm": this.bpm,
                "numBeats": this.numberOfBeats,
                "levelData": this.levelData
            };
            const jsonString = JSON.stringify(jsonObject);
            const blob = new Blob([jsonString], {type: "application/json"});
            // https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
            if(window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, name);
            }
            else{
                let elem = window.document.createElement("a");
                elem.href = URL.createObjectURL(blob);
                elem.download = name;
                document.body.appendChild(elem);
                elem.click();
                document.body.removeChild(elem);
                URL.revokeObjectURL(blob);
            }
        }
        else{
            this.loadingBg.visible = true;
            this.loadingBgText.visible = true;
            this.loadingBgText.setText("Missing name for your level!");
            this.time.delayedCall(2000, () => {
                this.loadingBg.visible = false;
                this.loadingBgText.visible = false;
                this.loadingBgText.setText("Loading...");
            }, [], this);
        }
    }

    clearData = () => {
        this.song = null;
        this.levelData.length = 0;
        this.levelTiles.length = 0;
    }

    onStopClicked = () => {
        this.song.stop();
        this.beatIndex = 0;
        this.runBeat();
        this.setBeatIndex(0);
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
                    delay: 60000 / this.bpm / 4,
                    callback: this.runBeat,
                    callbackScope: this,
                    loop: true
                });
                this.runBeat();
                this.decrementBeatIndex();
            }
        }
        else{
            if(this.beatTimer){
                this.beatTimer.remove();
            }
            this.beatTimer = this.time.addEvent({
                delay: 60000 / this.bpm / 4,
                callback: this.runBeat,
                callbackScope: this,
                loop: true
            });
            this.song.play();
            this.runBeat();
            this.decrementBeatIndex();
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
        if(this.beatIndex === 0){
            return;
        }
        this.beatIndex--;
        this.runBeat();
        this.decrementBeatIndex();
    }

    moveBeatRight = () => {
        if(this.beatIndex >= this.numberOfSubdivisions){
            return;
        }
        this.beatIndex++;
        this.runBeat();
        this.decrementBeatIndex();
    }

    updateTileData = (tileX, tileY, tileType) => {
        if(this.beatIndex < 0 || this.beatIndex >= this.levelData.length){
            console.log("beatIndex is out of bounds, this shouldn't happen!");
            return;
        }
        const currentData = this.levelData[this.beatIndex];
        // Check if tile exists
        let tileExists = false;
        let tileData = null;
        for(let i = 0; i < currentData.length && !tileExists; i++){
            const data = currentData[i];
            if(data.x === tileX && data.y === tileY){
                tileExists = true;
                tileData = data;
            }
        }
        if(tileData){
            if(tileType === 0){
                // TODO: remove data? just change the type to 0?
                tileData.type = 0;
            }
            else{
                tileData.type = tileType;
            }
        }
        else{
            if(tileType !== 0){
                tileData = {x: tileX, y: tileY, type: tileType, duration: this.beatLength / 2};
                currentData.push(tileData);
            }
        }
    }

    setNumberOfBeats = (amount) => {
        this.numberOfBeats = amount;
        this.numberOfSubdivisions = this.numberOfBeats * 4;
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
        if(this.song){
            this.song.pause();
        }
    }

    onFocus = () => {
        if(this.playButton.text === "Pause"){
            if(this.beatTimer){
                this.beatTimer.paused = false;
            }
            if(this.song){
                this.song.resume();
            }
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