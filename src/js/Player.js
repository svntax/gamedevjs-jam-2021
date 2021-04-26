import "phaser";

class Player {

    constructor(scene, x, y, cursorKeys) {
        this.parentScene = scene;

        this.hitbox = scene.add.rectangle(x, y, scene.getTileSize(), scene.getTileSize(), 0xff0000, 0);
        this.hitbox.setOrigin(0, 0);
        scene.physics.add.existing(this.hitbox);

        this.playerSprite = scene.add.ellipse(x+16, y+14, 20, 16, 0x217836);
        this.playerSprite.depth = 10;

        //this.playerSprite = scene.add.sprite(x, y, "player");

        this.mirrored = false;
        this.moveAmount = 32;
        this.moveDir = 1;
        this.cursors = cursorKeys;
        scene.input.keyboard.on("keydown-DOWN", this.moveDown);
        scene.input.keyboard.on("keydown-UP", this.moveUp);
        scene.input.keyboard.on("keydown-LEFT", this.moveLeft);
        scene.input.keyboard.on("keydown-RIGHT", this.moveRight);

        this.damageTween = scene.tweens.add({
            targets: this.playerSprite,
            paused: true,
            alpha: {from: 1, to: 0},
            ease: "Linear",
            duration: 80,
            yoyo: true,
            repeat: 5
        });
    }

    get x(){
        return this.hitbox.x;
    }

    get y(){
        return this.hitbox.y;
    }

    getTileX(){
        return Math.floor((this.x - this.parentScene.getGridX()) / this.parentScene.getTileSize());
    }

    getTileY(){
        return Math.floor((this.y + 4 - this.parentScene.getGridY()) / this.parentScene.getTileSize());
    }

    setMirrored = (mirrored) => {
        this.mirrored = mirrored;
        if(mirrored){
            this.moveDir = -1;
        }
        else{
            this.moveDir = 1;
        }
    }

    update = () => {
        this.playerSprite.x = this.hitbox.x + 16;
        this.playerSprite.y = this.hitbox.y + 14;
    }

    takeDamage = () => {
        this.damageTween.play();
    }

    onDeath = () => {
        this.damageTween.remove();
        this.visible = false;
    }

    moveLeft = (event) => {
        if(!this.canMove()){
            return;
        }
        const nextTileX = this.getTileX() - this.moveDir;
        if(this.checkInsideGrid(nextTileX, this.getTileY())){
            this.hitbox.x -= this.moveAmount * this.moveDir;
        }
    }

    moveRight = (event) => {
        if(!this.canMove()){
            return;
        }
        const nextTileX = this.getTileX() + this.moveDir;
        if(this.checkInsideGrid(nextTileX, this.getTileY())){
            this.hitbox.x += this.moveAmount * this.moveDir;
        }
    }

    moveUp = (event) => {
        if(!this.canMove()){
            return;
        }
        const nextTileY = this.getTileY() - 1;
        if(this.checkInsideGrid(this.getTileX(), nextTileY)){
            this.hitbox.y -= this.moveAmount;
        }
    }

    moveDown = (event) => {
        if(!this.canMove()){
            return;
        }
        const nextTileY = this.getTileY() + 1;
        if(this.checkInsideGrid(this.getTileX(), nextTileY)){
            this.hitbox.y += this.moveAmount;
        }
    }

    checkInsideGrid = (tx, ty) => {
        return tx >= 0 && tx < this.parentScene.getGridWidth() && ty >= 0 && ty < this.parentScene.getGridHeight();
    }

    canMove = () => {
        return this.parentScene.state === "GAMEPLAY";
    }
    
}

export default Player;