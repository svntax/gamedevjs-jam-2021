import "phaser";

class FloorTileDebug {

    constructor(scene, x, y) {
        this.parentScene = scene;

        this.hitbox = scene.add.rectangle(x, y, scene.getTileSize() - 2, scene.getTileSize() - 2, 0xff0000);
        this.hitbox.setOrigin(0, 0);

        this.flashColor = 0xfacade;
        this.laserColor = 0xf33838;

        this.floorSprite = scene.add.rectangle(x, y, scene.getTileSize() - 2, scene.getTileSize() - 2, this.laserColor, 0.8);
        this.floorSprite.visible = false;
        this.floorSprite.depth = 10;
        this.floorSprite.setOrigin(0, 0);

        this.debugText = scene.add.text(x, y, ".", {fontSize: 24});
        this.debugText.setOrigin(0, 0);
        this.debugText.setColor("black");
        this.debugText.visible = false;
        this.debugText.depth = 20;

        this.hitbox.setInteractive().on("pointerdown", this.onTileClicked);
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
        this.debugText.visible = true;
    }

    shootLaser = () => {
        this.floorSprite.visible = true;
        this.floorSprite.fillColor = this.laserColor;
        this.debugText.setText("L");
        this.debugText.visible = true;
    }

    resetState = () => {
        this.floorSprite.visible = false;
        this.debugText.visible = false;
        this.debugText.text = ".";
    }

    onTileClicked = (pointer, localX, localY, event) => {
        if(this.parentScene.state !== "EDITING"){
            return;
        }

        // Type values: 0 = blank, 1 = flash, 2 = laser
        if(this.debugText.text === "."){
            this.flash();
            this.parentScene.updateTileData(this.getTileX(), this.getTileY(), 1);
        }
        else if(this.debugText.text === "F"){
            this.shootLaser();
            this.parentScene.updateTileData(this.getTileX(), this.getTileY(), 2);
        }
        else if(this.debugText.text === "L"){
            this.resetState();
            this.parentScene.updateTileData(this.getTileX(), this.getTileY(), 0);
        }

    }
    
}

export default FloorTileDebug;