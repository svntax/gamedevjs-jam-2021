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

        this.floorSprite = scene.add.rectangle(x + 2, y + 2, 28, 24, this.laserColor, 0.8);
        this.floorSprite.visible = false;
        this.floorSprite.depth = 5;
        this.floorSprite.setOrigin(0, 0);

        this.laserSprite = scene.add.rectangle(x + (scene.getTileSize() / 2), y + scene.getTileSize() - 8, 28, scene.sys.game.canvas.height, this.laserColor, 0.8);
        this.laserSprite.visible = false;
        this.laserSprite.depth = 15;
        this.laserSprite.setOrigin(0.5, 1);

        this.canDealDamage = false;

        this.laserShrinkTween = scene.tweens.add({
            targets: this.laserSprite,
            paused: true,
            scaleX: {from: 1, to: 0},
            ease: "Linear",
            duration: 1000
        });
        this.laserShootTween = scene.tweens.add({
            targets: this.laserSprite,
            paused: true,
            scaleY: {from: 0, to: 1},
            ease: "Linear",
            duration: 5000
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

    update = () => {
        if(this.canDealDamage){
            const px = this.parentScene.player.getTileX();
            const py = this.parentScene.player.getTileY();
            const px2 = this.parentScene.playerMirrored.getTileX();
            const py2 = this.parentScene.playerMirrored.getTileY();
            const tx = this.getTileX();
            const ty = this.getTileY();
            if((px === tx && py === ty) || (px2 === tx && py2 === ty)){
                this.parentScene.damagePlayer();
            }
        }
    }

    flash = (duration) => {
        this.floorSprite.visible = true;
        this.parentScene.time.delayedCall(duration, this.onDurationEnd, [], this);
    }

    shootLaser = (laserDuration) => {
        let tweenDuration = laserDuration;
        let tweenDelay = 0;
        this.laserSprite.scaleX = 1;
        this.laserSprite.scaleY = 0;
        this.laserSprite.visible = true;
        if(laserDuration > 500){
            tweenDuration = 500;
            tweenDelay = laserDuration - 500;
        }
        this.laserShrinkTween.stop();
        this.laserShrinkTween = this.parentScene.tweens.add({
            targets: this.laserSprite,
            scaleX: {from: 1, to: 0},
            ease: "Linear",
            duration: tweenDuration,
            delay: tweenDelay,
            onComplete: this.laserShrinkComplete,
            onCompleteScope: this
        });
        
        this.laserShootTween.stop();
        this.laserShootTween = this.parentScene.tweens.add({
            targets: this.laserSprite,
            scaleY: {from: 0, to: 1},
            ease: "Linear",
            duration: 100
        });

        this.canDealDamage = true;
        this.parentScene.time.delayedCall(laserDuration, this.onDurationEnd, [], this);
    }

    onDurationEnd = () => {
        this.floorSprite.visible = false;
    }

    laserShrinkComplete = () => {
        this.laserSprite.visible = false;
        this.canDealDamage = false;
    }
    
}

export default FloorTile;