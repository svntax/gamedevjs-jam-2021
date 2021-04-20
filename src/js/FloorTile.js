import "phaser";

class FloorTile {

    constructor(scene, x, y) {
        this.parentScene = scene;

        this.hitbox = scene.add.rectangle(x, y, scene.getTileSize(), scene.getTileSize(), 0xff0000, 0);
        this.hitbox.setOrigin(0, 0);
        this.hitbox.visible = false;
        scene.physics.add.existing(this.hitbox);
        this.flashColor = 0xfacade;
        this.laserColor = 0xf33838;

        this.sprite = scene.add.rectangle(x + 2, y + 2, 28, 24, this.laserColor, 1);
        this.sprite.visible = false;
        this.sprite.depth = 10;
        this.sprite.setOrigin(0, 0);

        this.state = "IDLE";
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

    update = () => {
        
    }

    flash = (duration) => {
        this.sprite.fillColor = this.laserColor;
        this.sprite.visible = true;
        this.parentScene.time.delayedCall(duration, this.onDurationEnd, [], this);
    }

    onDurationEnd = () => {
        this.sprite.visible = false;
    }
    
}

export default FloorTile;