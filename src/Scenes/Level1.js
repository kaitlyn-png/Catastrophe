import Player from "../Sprites/Player.js";
import Bullets from "../Sprites/Bullets.js";
import Vacuum from "../Sprites/Vacuum.js";

class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");

        this.myScore = 0;
        this.myHearts = 3;
        this.myBullets = 5;
    }

    preload() {
        this.load.setPath("assets/");
        this.load.image("cat", "cat.png");
        this.load.image("catred", "catred.png");
        this.load.image("fish", "fish.png");
        this.load.image("vacuum", "vacuum.png");
        this.load.image("background", "living_room.png");
        this.load.image("hud", "hud.png");
        this.load.image("heart", "heart.png");

        this.load.image("level1", "level1.png");

        // Animation
        this.load.image("explosion1", "explosion1.png");
        this.load.image("explosion2", "explosion2.png");
        this.load.image("explosion3", "explosion3.png");
        this.load.image("explosion4", "explosion4.png");

        // Audio
        this.load.audio("destroyed", "Audio/8-Bit/jingles_NES14.ogg");
        this.load.audio("cathit", "Audio/8-Bit/jingles_NES15.ogg");
        this.load.audio("start", "Audio/8-Bit/jingles_NES12.ogg");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        //reset
        this.myScore = 0;
        this.myHearts = 3;

        this.add.image(400, 400, "background").setOrigin(0.5, 0.5).setScale(1, 1).setDepth(0);
        this.add.image(400, 400, "hud").setOrigin(0.5, 0.5).setScale(1, 1).setDepth(9);
        
         // Level 1
         const level1Image = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "level1")
         .setOrigin(0.5, 0.5)
         .setScale(1, 1)
         .setDepth(10);

        this.time.delayedCall(1000, () => {
            level1Image.destroy();
        });

        // Initialize player, bullets, and vacuum
        this.bullets = new Bullets(this);
        this.vacuum = new Vacuum(this, 400, 0);
        this.vacuumX = this.vacuum.sprite.x;
        this.player = new Player(this, 400, 710, this.vacuum, true);

        // Score UI
        const centerX = this.sys.game.config.width / 2;
        this.textScore = this.add.bitmapText(centerX, 20, "rocketSquare", this.myScore).setOrigin(0.5,0).setDepth(11).setScale(2, 2);
        //this.textHearts = this.add.bitmapText(40, 0, "rocketSquare", "Hearts " + this.myHearts).setDepth(11);
        
        // Hearts UI
        this.hearts = [];
        for (let i = 0; i < this.myHearts; i++) {
            const heart = this.add.image(40 + i * 50, 40, "heart").setScale(0.5).setDepth(11);
            this.hearts.push(heart);
        }

        // Bullets UI
        //this.textBullets = this.add.bitmapText(560, 760, "rocketSquare", "Bullets " + this.myBullets).setDepth(11); 
        const rightX = this.sys.game.config.width - 100;
        this.add.image(rightX + 60, 40, "fish").setScale(0.3).setDepth(11);
        this.textBullets = this.add.bitmapText(rightX, 30, "rocketSquare", this.myBullets)
            .setOrigin(0, 0)
            .setDepth(11);

        // Explosion animation
        if (!this.anims.exists("explosion")) {
            this.anims.create({
                key: "explosion",
                frames: [
                    { key: "explosion1" },
                    { key: "explosion2" },
                    { key: "explosion3" },
                    { key: "explosion4" },
                ],
                frameRate: 10,
                repeat: 0,
                hideOnComplete: true,
            });
        }     
        
        this.sound.play("start", { volume: 1 });
    }

    update() {
        
        // Update player, bullets, and vacuum
        this.player.update();
        this.bullets.shoot(this.player);
        this.updateBullets();
        this.bullets.update();
        this.vacuum.moveToward(this.player);

        // Check if next level
        if (this.vacuum.vacuumsSpawned > 9) {
            this.scene.start("Level2", { score: this.myScore, hearts: this.myHearts, x: this.player.sprite.x, y: this.player.sprite.y });
        }

        // Check collisions
        for (let bullet of this.bullets.bullets) {
            if (this.collides(this.vacuum.sprite, bullet)) {
                console.log("bullet hit vacuum");
                bullet.y = -100;
                this.vacuum.visible = false;
                this.vacuum.active = false;

                this.myScore += this.vacuum.scorePoints;
                this.updateScore();

                this.explosion = this.add.sprite(this.vacuum.sprite.x, this.vacuum.sprite.y, "explosion1")
                    .setScale(0.5)
                    .setDepth(10)
                    .play("explosion");

                
                this.vacuum.destroy();

                this.sound.play("destroyed", { volume: 1 });

                console.log("sound playing");

                this.explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    this.vacuum.respawn();
                    console.log("vacuum respawned " + this.vacuum.vacuumsSpawned);
                }, this);
            }
        }

        if (this.collides(this.vacuum.sprite, this.player.sprite)) {
            console.log("vacuum hit cat");

            this.player.sprite.setTexture("catred");

            this.time.delayedCall(100, () => {
                this.player.sprite.setTexture("cat");
            });

            // Create explosion
            this.explosion = this.add.sprite(this.player.sprite.x, this.player.sprite.y, "explosion1")
                .setScale(0.5)                
                .setDepth(10)
                .play("explosion");

            this.sound.play("cathit", { volume: 1 });
            console.log("sound playing");

            this.vacuum.destroy();
            this.updateHearts();

            this.explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.vacuum.respawn();
                console.log("vacuum respawned " + this.vacuum.vacuumsSpawned);
            }, this);
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2 - 25)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2 - 25)) return false;
        return true;
    }

    updateScore() {        
        const centerX = this.sys.game.config.width / 2;
        this.textScore.setText(this.myScore).setX(centerX).setOrigin(0.5, 0);
    }

    updateHearts() {
        this.myHearts -= 1;
        //this.textHearts.setText("Hearts " + this.myHearts);

        if (this.hearts.length > 0) {
            const heart = this.hearts.pop();
            heart.destroy();
        }

        if (this.myHearts <= 0) {
            this.myHearts =3;
            this.myScore = 0;
            this.scene.start("Gameover");
        }
    }

    updateBullets() {
        this.myBullets = 5 - this.bullets.bullets.length;
        this.textBullets.setText(this.myBullets);
    }
}

/* 
    DEPTHS:
    0: Background
    1: Bullets
    2: Player
    3: Vacuum
    9: HUD    
    10: Explosion
    11: Score, Hearts, Bullets
*/

export default Level1;