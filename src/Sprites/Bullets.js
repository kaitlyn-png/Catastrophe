export default class Bullets {
    constructor(scene) {
        this.scene = scene;
        this.bullets = [];
        this.maxBullets = 5;
        this.speed = 10;

        this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    shoot(player) {
        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            if (this.bullets.length < this.maxBullets) {
                this.bullets.push(this.scene.add.sprite(player.sprite.x, player.sprite.y - 60, "fish").setDepth(1).setScale(0.2, 0.2));
            }
        }
    }

    update() {
        for (let bullet of this.bullets) {
            bullet.y -= this.speed;
        }

        this.bullets = this.bullets.filter((bullet) => bullet.y > -(bullet.displayHeight / 2));
    }
}