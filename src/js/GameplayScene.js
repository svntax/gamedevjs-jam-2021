import "phaser";
import FloorTile from "./FloorTile";
import Player from "./Player";

class GameplayScene extends Phaser.Scene {

    constructor(){
        super("Gameplay");
    }

    create(){
        this.game.events.addListener(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this);

        this.beatText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 220, "Ready", {fontSize: 32});
        this.beatText.setOrigin(0.5);
        this.beatCounter = 1;

        this.bpm = 100;
        this.song = this.sound.add("first_song");

        // TODO read level data
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

        this.gridOriginX = 80;
        this.gridOriginY = 64;
        this.gridWidth = 20;
        this.gridHeight = 12;
        this.tileSize = 32;
        this.levelTiles = [];
        for(let x = 0; x < this.gridWidth; x++){
            this.levelTiles[x] = [];
        }
        for(let x = 0; x < this.gridWidth; x++){
            for(let y = 0; y < this.gridHeight; y++){
                const color = x < 10 ? 0xe3e3e3 : 0x7fb2f0;
                let rect = this.add.rectangle(this.gridOriginX + x*this.tileSize + 2, this.gridOriginY + y*this.tileSize + 2, 28, 24, color);
                const color2 = x < 10 ? 0x8d8d8d : 0x2d73ce;
                let bottom = this.add.rectangle(this.gridOriginX + x*this.tileSize + 2, this.gridOriginY + y*this.tileSize + 24, 28, 6, color2);
                bottom.setOrigin(0, 0);
                rect.setOrigin(0, 0);

                let floorTile = new FloorTile(this, this.gridOriginX + x*this.tileSize, this.gridOriginY + y*this.tileSize);
                this.levelTiles[x][y] = floorTile;
            }
        }

        this.cursors = this.input.keyboard.createCursorKeys();

        const startTileX = 4;
        const startTileY = 6;
        this.player = new Player(this, this.gridOriginX + startTileX * this.tileSize, this.gridOriginY + startTileY * this.tileSize, this.cursors);
        this.playerMirrored = new Player(this, this.gridOriginX + ((this.gridWidth - 1) - startTileX) * this.tileSize, this.gridOriginY + startTileY * this.tileSize, this.cursors);
        this.playerMirrored.setMirrored(true);

        this.playerLives = 3;

        this.startTimer = this.time.addEvent({
            delay: 3000,
            callback: this.startLevel,
            callbackScope: this
        });

        this.state = "READY";
    }

    update(){
        if(this.state === "LOADING"){
            if(!this.song.isDecoding){
                this.state = "GAMEPLAY";
                this.beatText.setText("1");
                this.beatTimer = this.time.addEvent({
                    delay: 60000 / this.bpm,
                    callback: this.runBeat,
                    callbackScope: this,
                    loop: true
                });
            }
        }
        else if(this.state === "GAMEPLAY"){
            this.player.update();
            this.playerMirrored.update();
        }
    }

    runBeat = () => {
        this.beatText.setText(this.beatCounter+1);

        this.beatIndex %= this.levelData.length; // REMOVE LATER
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

        this.beatCounter += 1;
        this.beatCounter %= 4;
        this.beatIndex++;
    }

    startLevel = () => {
        this.song.play();
        this.state = "LOADING";
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

export default GameplayScene;