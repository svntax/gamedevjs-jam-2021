import "phaser";

class FloorTileDebug {

    constructor(scene, x, y) {
        this.parentScene = scene;

        this.hitbox = scene.add.rectangle(x, y, scene.getTileSize() - 2, scene.getTileSize() - 2, 0xff0000);
        this.hitbox.setOrigin(0, 0);

        this.debugText = scene.add.text(64, 64, "", {fontSize: 24});
        this.debugText.setOrigin(0, 0);

        this.flashColor = 0xfacade;
        this.laserColor = 0xf33838;

        this.floorSprite = scene.add.rectangle(x + 2, y + 2, scene.getTileSize() - 4, scene.getTileSize() - 8, this.laserColor, 0.8);
        this.floorSprite.visible = false;
        this.floorSprite.depth = 10;
        this.floorSprite.setOrigin(0, 0);
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

    flash = () => {
        this.floorSprite.visible = true;
        this.floorSprite.fillColor = this.flashColor;
        this.debugText.setText("F");
    }

    shootLaser = (laserDuration) => {
        this.floorSprite.visible = true;
        this.floorSprite.fillColor = this.laserColor;
        this.debugText.setText("L");
    }
    
}

export default FloorTileDebug;