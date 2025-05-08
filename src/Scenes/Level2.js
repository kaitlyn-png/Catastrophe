import Player from "../Sprites/Player.js";
import Bullets from "../Sprites/Bullets.js";
import Vacuum from "../Sprites/Vacuum.js";

class Level2 extends Phaser.Scene {
    constructor() {
        super("Level2");

        this.myScore = 0;
        this.myHearts = 3;
        this.myBullets = 5;
        this.vacuums = [];
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
        
        this.load.image("level2", "level2.png");

        // Animation
        this.load.image("explosion1", "explosion1.png");
        this.load.image("explosion2", "explosion2.png");
        this.load.image("explosion3", "explosion3.png");
        this.load.image("explosion4", "explosion4.png");

        // Audio
        this.load.audio("destroyed", "Audio/8-Bit/jingles_NES14.ogg");
        this.load.audio("cathit", "Audio/8-Bit/jingles_NES15.ogg");
        this.load.audio("start", "Audio/8-Bit/jingles_NES08.ogg");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create(data) {
        if (data && data.score !== undefined) {
            this.myScore = data.score;
        }
        if (data && data.hearts !== undefined) {
            this.myHearts = data.hearts;
        }

        // Add background and HUD
        this.add.image(400, 400, "background").setOrigin(0.5, 0.5).setScale(1, 1).setDepth(0);
        this.add.image(400, 400, "hud").setOrigin(0.5, 0.5).setScale(1, 1).setDepth(9);

         // Level 2
         const level2Image = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "level2")
         .setOrigin(0.5, 0.5)
         .setScale(1, 1)
         .setDepth(10);

        this.time.delayedCall(1000, () => {
            level2Image.destroy();
        });

        // Initialize player, bullets, and vacuum
        this.bullets = new Bullets(this);
        this.vacuum = new Vacuum(this, 400, 0);
        this.vacuumX = this.vacuum.sprite.x;

        const playerX = data?.x ?? 400;
        const playerY = data?.y ?? 710;
        this.player = new Player(this, playerX, playerY, this.vacuum, true);
        //this.player = new Player(this, data.x, data.y, this.vacuum, true);

        // Score UI
        const centerX = this.sys.game.config.width / 2;
        this.textScore = this.add.bitmapText(centerX, 20, "rocketSquare", this.myScore)
            .setOrigin(0.5, 0)
            .setDepth(11)
            .setScale(2, 2);

        // Hearts UI
        this.hearts = [];
        for (let i = 0; i < this.myHearts; i++) {
            const heart = this.add.image(40 + i * 50, 40, "heart").setScale(0.5).setDepth(11);
            this.hearts.push(heart);
        }

        // Bullets UI
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

        // Start spawning waves
        this.startWave();
    }

    update() {
        // Update player, bullets, and vacuums
        this.player.update();
        this.bullets.shoot(this.player);
        this.bullets.update();

        for (let i = this.vacuums.length - 1; i >= 0; i--) {
            const vacuum = this.vacuums[i];
            vacuum.moveToward(this.player);

            // Avoid overlapping vacuums
            for (let j = 0; j < this.vacuums.length; j++) {
                if (i !== j) {
                    const otherVacuum = this.vacuums[j];
                    const distance = Phaser.Math.Distance.Between(
                        vacuum.sprite.x,
                        vacuum.sprite.y,
                        otherVacuum.sprite.x,
                        otherVacuum.sprite.y
                    );

                    if (distance < vacuum.sprite.displayWidth) {
                        const angle = Phaser.Math.Angle.Between(
                            otherVacuum.sprite.x,
                            otherVacuum.sprite.y,
                            vacuum.sprite.x,
                            vacuum.sprite.y
                        );

                        vacuum.sprite.x += Math.cos(angle) * 2;
                        vacuum.sprite.y += Math.sin(angle) * 2;
                    }
                }
            }

            // Collision with bullets
            for (let j = this.bullets.bullets.length - 1; j >= 0; j--) {
                const bullet = this.bullets.bullets[j];

                if (this.collides(vacuum.sprite, bullet)) {
                    console.log("bullet hit vacuum");

                    const tempX = vacuum.sprite.x;
                    const tempY = vacuum.sprite.y;

                    bullet.destroy();
                    vacuum.destroy();
                    this.bullets.bullets.splice(j, 1);
                    this.vacuums.splice(i, 1);

                    this.myScore += vacuum.scorePoints;
                    this.updateScore();

                    this.explosion = this.add.sprite(tempX, tempY, "explosion1")
                        .setScale(0.5)
                        .play("explosion");
                        

                    this.sound.play("destroyed", { volume: 1 });

                    this.explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        this.explosion.destroy();
                    }, this);

                    break;
                }
            }

            // Check collision with player
            if (this.collides(vacuum.sprite, this.player.sprite)) {
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

                vacuum.destroy();
                this.vacuums.splice(i, 1);
                this.updateHearts();
                console.log("cat was hit ");

                this.explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    
                }, this);
            }
        }
    }

    startWave() {
        console.log("Level 2");

        let waveCount = 0;

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                waveCount++;
                const numVacuums = Phaser.Math.Between(2, 5);
                for (let i = 0; i < numVacuums; i++) {
                    const x = Phaser.Math.Between(0, this.sys.game.config.width);
                    const y = -100;
                    const vacuum = new Vacuum(this, x, y);
                    this.vacuums.push(vacuum);
                }
                console.log(`Wave ${waveCount} spawned. Total vacuums: ${this.vacuums.length}`);
                if (waveCount >= 10) {
                    this.time.addEvent({
                        delay: 500,
                        callback: () => {
                            if (this.vacuums.length === 0) {
                                console.log("end Level 2.");
                                this.scene.start("Level3", { score: this.myScore, hearts: this.myHearts, x: this.player.sprite.x, y: this.player.sprite.y });
                            }
                        },
                        loop: true,
                    });
                }
            },
            repeat: 9,
        });
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

export default Level2;