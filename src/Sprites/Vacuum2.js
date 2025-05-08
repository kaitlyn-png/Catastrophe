export default class Vacuum2 {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, "vacuumB").setScale(0.4, 0.4).setDepth(3);
        this.speed = 10;
        this.active = true;
        this.scorePoints = 50;
        this.vacuumsSpawned = 0;
        this.bullets = [];
        this.isActive = true;
    }

    move(){
        if (!this.active) return;
        // let random = Phaser.Math.Between(1, 6);
        // let random2 = Phaser.Math.Between(1, 2);
        // for (let i = 0; i < random; i++) {
        //     if(this.sprite.x < 730 || this.sprite.x > 70) {
        //         if(random2 == 1){
        //             this.sprite.x += this.speed;
        //         }
        //         else if(random2 == 2){
        //             this.sprite.x -= this.speed;
        //         }
        //     }
        // }     
        if (!this.direction) {
            this.direction = "right";
            this.sprite.flipX = true;
        }

        if (this.direction === "right") {
            this.sprite.x += this.speed;
            if (this.sprite.x >= 730) {
                this.direction = "left";                
                this.sprite.flipX = false;
            }
        } 
        else if (this.direction === "left") {
            this.sprite.x -= this.speed;
            if (this.sprite.x <= 79) {
                this.direction = "right";                
                this.sprite.flipX = true;
            }
        }
    }

    shoot() {
        if (!this.isActive) return;

        const bullet = this.scene.add.sprite(this.sprite.x - 40, this.sprite.y + 60, "ball")
            .setScale(0.5)
            .setDepth(1);
        this.bullets.push(bullet);
        this.scene.activeBullets.push(bullet);

        this.scene.tweens.add({
            targets: bullet,
            y: this.scene.sys.game.config.height + 10,
            duration: 3000,
            onComplete: () => {
                bullet.destroy();
                this.bullets = this.bullets.filter(b => b !== bullet);                
                this.scene.activeBullets = this.scene.activeBullets.filter(b => b !== bullet);
            },
        });
    }

    destroy() {
        this.isActive = false;
        this.sprite.destroy();
    }
}