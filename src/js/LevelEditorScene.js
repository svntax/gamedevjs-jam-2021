import "phaser";
import FloorTileDebug from "./FloorTileDebug";

class LevelEditorScene extends Phaser.Scene {

    constructor(){
        super("LevelEditor");
    }

    create(){
        this.game.events.addListener(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this);

        this.mainMenuButton = this.add.text(64, 64, "Go back", {fontSize: 32});
        this.mainMenuButton.setOrigin(0, 0.5);
        this.mainMenuButton.setInteractive().on("pointerdown", this.onMainMenuButtonClicked);

        this.bpm = 100;
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

        this.state = "READY";
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
            this.state = "READY";
        }
    }

    playSong = () => {
        this.song.play();
        this.state = "LOADING";
    }

    resetDamageCooldown = () => {
        this.canTakeDamage = true;
    }

    onMainMenuButtonClicked = (pointer, localX, localY, event) => {
        this.song.stop();
        // TODO: confirm prompt, also check unsaved progress
    }

    onUploadSongButtonClicked = (pointer, localX, localY, event) => {
        
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