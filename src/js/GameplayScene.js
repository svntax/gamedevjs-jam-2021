import { JsonRpcProvider } from "near-api-js/lib/providers";
import "phaser";
import FloorTile from "./FloorTile";
import Player from "./Player";

class GameplayScene extends Phaser.Scene {

    constructor(){
        super("Gameplay");
    }

    create(data){
        this.game.events.addListener(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this);

        this.beatText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 180, "Ready", {fontSize: 32});
        this.beatText.setOrigin(0.5);
        this.beatCounter = 1;

        this.mainMenuButton = this.add.text(this.cameras.main.centerX - 180, this.cameras.main.centerY + 244, "Main Menu", {fontSize: 32});
        this.mainMenuButton.setOrigin(0, 0.5);
        this.mainMenuButton.setInteractive().on("pointerdown", this.onMainMenuButtonClicked);
        this.mainMenuButton.visible = false;

        this.restartButton = this.add.text(this.cameras.main.centerX + 180, this.cameras.main.centerY + 244, "Retry", {fontSize: 32});
        this.restartButton.setOrigin(1, 0.5);
        this.restartButton.setInteractive().on("pointerdown", this.onRestartButtonClicked);
        this.restartButton.visible = false;

        this.beatIndex = 0;

        if(data && data.jsonObject && data.audioData){
            // Read level data
            const jsonData = data.jsonObject;
            // First read the json data
            this.bpm = jsonData.bpm;
            this.beatLength = 60 / this.bpm;
            this.levelData = jsonData.levelData;

            // Next read the audio data
            data.audioData.arrayBuffer().then((audioArrayBuffer) => {
                this.sound.decodeAudio("currentSong", audioArrayBuffer);
                this.sound.on("decodedall", () => {
                    this.song = this.sound.add("currentSong");
                    this.startTimer = this.time.addEvent({
                        delay: 3000,
                        callback: this.startLevel,
                        callbackScope: this
                    });
                });
            });
            
        }
        else{
            this.song = this.sound.add("tutorialSong");
            this.bpm = 100;
            this.beatLength = 60 / this.bpm;
            this.levelData = [
                [{x: 0, y: 0, type: 1}, {x: 2, y: 1, type: 1}],
                [{x: 1, y: 0, type: 1}, {x: 3, y: 1, type: 1}],
                [{x: 0, y: 0, type: 2}, {x: 2, y: 1, type: 2}],
                [{x: 1, y: 0, type: 2}, {x: 3, y: 1, type: 2}],
                [],
                [],
                []
            ];
            this.startTimer = this.time.addEvent({
                delay: 3000,
                callback: this.startLevel,
                callbackScope: this
            });
        }

        // Grid setup with laser tiles
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
        this.canTakeDamage = true;

        this.state = "READY";
    }

    update(){
        if(this.state === "LOADING"){
            if(!this.song.isDecoding){
                this.state = "GAMEPLAY";
                //this.beatText.setText("1");
                this.beatTimer = this.time.addEvent({
                    delay: 60000 / this.bpm,
                    callback: this.runBeat,
                    callbackScope: this,
                    loop: true
                });
                this.runBeat();
            }
        }
        else if(this.state === "GAMEPLAY"){
            this.player.update();
            this.playerMirrored.update();
            for(let x = 0; x < this.levelTiles.length; x++){
                for(let y = 0; y < this.levelTiles[x].length; y++){
                    this.levelTiles[x][y].update();
                }
            }
        }
        else if(this.state === "GAME_OVER"){
            this.player.update();
            this.playerMirrored.update();
        }
        else if(this.state === "FINISHED"){
            this.player.update();
            this.playerMirrored.update();
            this.beatText.setText("Finished!");
        }
    }

    runBeat = () => {
        //this.beatText.setText(this.beatCounter+1);

        if(this.beatIndex >= this.levelData.length){
            this.state = "FINISHED";
            this.song.stop();
            this.beatText.visible = true;
            this.time.delayedCall(3000, this.onLevelFinished, [], this);
            this.beatTimer.remove();
            return;
        }

        const currentData = this.levelData[this.beatIndex];
        for(let i = 0; i < currentData.length; i++){
            const beat = currentData[i];
            if(beat.type === 1){ // Telegraph/flash, hard-coded to last half a beat
                this.levelTiles[beat.x][beat.y].flash((this.beatLength / 2) * 1000);
            }
            else if(beat.type === 2){ // Laser, hard-coded to last almost a full beat
                this.levelTiles[beat.x][beat.y].shootLaser((this.beatLength) * 1000 * 0.9);
            }
        }

        this.beatCounter += 1;
        this.beatCounter %= 4;
        this.beatIndex++;
    }

    startLevel = () => {
        this.song.play();
        this.state = "LOADING";
        this.beatText.visible = false;
    }

    gameOver = () => {
        this.state = "GAME_OVER";
        this.song.stop();
        this.beatTimer.remove();
        this.player.onDeath();
        this.playerMirrored.onDeath();
        this.beatText.visible = true;
        this.beatText.setText("Game over!");
        this.mainMenuButton.visible = true;
        this.restartButton.visible = true;
    }

    onLevelFinished = () => {
        this.scene.stop();
        this.scene.start("MainMenu");
    }

    damagePlayer = () => {
        if(this.canTakeDamage){
            this.canTakeDamage = false;
            this.playerLives--;
            if(this.playerLives < 0){
                this.gameOver();
            }
            else{
                
                this.player.takeDamage();
                this.playerMirrored.takeDamage();

                this.time.delayedCall(2000, this.resetDamageCooldown, [], this);
            }
        }
    }

    resetDamageCooldown = () => {
        this.canTakeDamage = true;
    }

    onMainMenuButtonClicked = (pointer, localX, localY, event) => {
        this.song.stop();
        this.scene.start("MainMenu");
    }

    onRestartButtonClicked = (pointer, localX, localY, event) => {
        this.song.stop();
        this.scene.restart();
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