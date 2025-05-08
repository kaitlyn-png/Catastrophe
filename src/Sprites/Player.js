import Vacuum from "../Sprites/Vacuum.js";

export default class Player {
    constructor(scene, x, y, vacuum, active) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, "cat").setScale(0.15, 0.15).setDepth(2);;
        this.speed = 10;

        this.left = scene.input.keyboard.addKey("A");
        this.right = scene.input.keyboard.addKey("D");

        this.vacuum = vacuum;

        this.active = active; //if true -> level 1 and 2, if false -> level 3
    }

    update() {
        if (this.left.isDown) {
            if (this.sprite.x > 70) {
                this.sprite.x -= this.speed;
                this.sprite.flipX = false;
            }
        }

        if (this.right.isDown) {
            if (this.sprite.x < 730) {
                this.sprite.x += this.speed;
                this.sprite.flipX = true;
            }
        }
        if(this.active){ //level 1 and 2
            if (this.sprite.x < this.vacuum.sprite.x) {
                this.vacuum.sprite.flipX = false; // faces left
            } else {
                this.vacuum.sprite.flipX = true; // faces right
            }
        }
    }
}