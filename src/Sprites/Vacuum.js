export default class Vacuum {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, "vacuum").setScale(0.4, 0.4).setDepth(3);
        this.speed = 10;
        this.active = true;
        this.scorePoints = 25;
        this.vacuumsSpawned = 0;
    }

    moveToward(player) {
        if (!this.active) return;

        let dx = player.sprite.x - this.sprite.x;
        let dy = player.sprite.y - this.sprite.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            this.sprite.x += (dx / distance) * this.speed;
            this.sprite.y += (dy / distance) * this.speed;
        }
    }

    respawn() {
        this.sprite.visible = true;
        this.sprite.x = Phaser.Math.Between(50, this.scene.sys.game.config.width - 50);
        this.sprite.y = -100;
        this.active = true;
        this.vacuumsSpawned += 1;
    }

    destroy() {
        this.active = false;
        this.sprite.visible = false;
        this.sprite.x = -100;
    }
}
