import "phaser";
import Player from "./Player";

class GameplayScene extends Phaser.Scene {

    constructor(){
        super("Gameplay");
    }

    create(){
        this.game.events.addListener(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this);

        this.beatText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 220, "Beat:", {fontSize: 32});
        this.beatText.setOrigin(0.5);
        this.beatCounter = 1;

        this.bpm = 100;
        this.song = this.sound.add("first_song");

        // TODO read level data
        this.levelData = [];
        this.beatIndex = 0;

        this.levelTiles = [];
        for(let x = 0; x < 20; x++){
            this.levelTiles[x] = [];
        }
        for(let x = 0; x < 20; x++){
            for(let y = 0; y < 12; y++){
                const color = x < 10 ? 0xe3e3e3 : 0x7fb2f0;
                let rect = this.add.rectangle(x*32 + 2, y*32 + 2, 28, 24, color);
                this.levelTiles[x][y] - rect;
                const color2 = x < 10 ? 0x8d8d8d : 0x2d73ce;
                let bottom = this.add.rectangle(x*32 + 2, y*32 + 24, 28, 6, color2);
                bottom.setOrigin(0, 0);
                rect.setOrigin(0, 0);
            }
        }

        this.cursors = this.input.keyboard.createCursorKeys();

        const startTileX = 4;
        const startTileY = 6;
        this.player = new Player(this, startTileX * 32, startTileY * 32, this.cursors);
        this.playerMirrored = new Player(this, (19 - startTileX) * 32, startTileY * 32, this.cursors);
        this.playerMirrored.setMirrored(true);

        this.song.play();

        this.beatTimer = this.time.addEvent({
            delay: 60000 / this.bpm,
            callback: this.runBeat,
            callbackScope: this,
            loop: true
        });
    }

    update(){
        this.player.update();
        this.playerMirrored.update();
    }

    runBeat = () => {
        this.beatText.setText(this.beatCounter+1);
        this.beatCounter += 1;
        this.beatCounter %= 4;
    }

    onBlur = () => {
        this.beatTimer.paused = true;
        this.song.pause();
    }

    onFocus = () => {
        this.beatTimer.paused = false;
        this.song.resume();
    }

}

export default GameplayScene;