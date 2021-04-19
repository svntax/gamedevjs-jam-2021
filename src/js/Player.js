import "phaser";

class Player {

    constructor(scene, x, y, cursorKeys) {
        this.parentScene = scene;

        this.hitbox = scene.add.rectangle(x, y, 32, 32, 0xff0000, 0);
        this.hitbox.setOrigin(0, 0);
        scene.physics.add.existing(this.hitbox);

        this.playerSprite = scene.add.circle(x, y, 12, 0x32a12f);

        //this.playerSprite = scene.add.sprite(x, y, "player");

        this.mirrored = false;
        this.moveAmount = 32;
        this.moveDir = 1;
        this.cursors = cursorKeys;
        scene.input.keyboard.on("keydown-DOWN", this.moveDown);
        scene.input.keyboard.on("keydown-UP", this.moveUp);
        scene.input.keyboard.on("keydown-LEFT", this.moveLeft);
        scene.input.keyboard.on("keydown-RIGHT", this.moveRight);
    }

    get x(){
        return this.hitbox.x;
    }

    get y(){
        return this.hitbox.y;
    }

    getTileX(){
        return Math.floor((this.x) / 32);
    }

    getTileY(){
        return Math.floor((this.y + 4) / 32);
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
        this.playerSprite.x = this.hitbox.x + 12;
        this.playerSprite.y = this.hitbox.y + 12;
    }

    moveLeft = (event) => {
        this.hitbox.x -= this.moveAmount * this.moveDir;
    }

    moveRight = (event) => {
        this.hitbox.x += this.moveAmount * this.moveDir;
    }

    moveUp = (event) => {
        this.hitbox.y -= this.moveAmount;
    }

    moveDown = (event) => {
        this.hitbox.y += this.moveAmount;
    }
    
}

export default Player;