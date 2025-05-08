import Player from "../Sprites/Player.js";
import Bullets from "../Sprites/Bullets.js";
import Vacuum2 from "../Sprites/Vacuum2.js";

class Level3 extends Phaser.Scene {
    constructor() {
        super("Level3");

        this.myScore = 0;
        this.myHearts = 3;
        this.myBullets = 5;
        this.vacuums = [];
        this.waveCount = 0;

        this.activeBullets = [];
        this.waveActive = false;
    }

    preload() {
        this.load.setPath("assets/");
        this.load.image("cat", "cat.png");
        this.load.image("catred", "catred.png");
        this.load.image("fish", "fish.png");
        //this.load.image("vacuum", "vacuumblue.png");
        this.load.image("vacuumB", "vacuumblue.png");
        this.load.image("background", "living_room.png");
        this.load.image("hud", "hud.png");
        this.load.image("heart", "heart.png");
        this.load.image("ball", "ball.png"); // Vacuum bullet
        this.load.image("bullet", "fish.png"); // Player bullet

        this.load.image("level3", "level3.png");

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
        console.log("Level 3");

        this.vacuums = [];
        this.waveCount = 0;

        if (data && data.score !== undefined) {
            this.myScore = data.score;
        }
        if (data && data.hearts !== undefined) {
            this.myHearts = data.hearts;
        }

        // Add background and HUD
        this.add.image(400, 400, "background").setOrigin(0.5, 0.5).setScale(1, 1).setDepth(0);
        this.add.image(400, 400, "hud").setOrigin(0.5, 0.5).setScale(1, 1).setDepth(9);

        // Level 3
        const level3Image = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "level3")
            .setOrigin(0.5, 0.5)
            .setScale(1, 1)
            .setDepth(10);

        this.time.delayedCall(1000, () => {
            level3Image.destroy();
        });

        // Initialize player and bullets
        this.bullets = new Bullets(this);

        const playerX = data?.x ?? 400;
        const playerY = data?.y ?? 710;
        this.player = new Player(this, playerX, playerY, this.vacuumB, false);

        //this.player = new Player(this, 400, 710, this.vacuumB, false);

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
        this.spawnWave();
    }

    update() {
        // Update player and bullets
        this.player.update();
        this.bullets.shoot(this.player);
        this.updateBullets();
        this.bullets.update();

        // Check collision between active bullets and player
        for (let i = this.activeBullets.length - 1; i >= 0; i--) {
            const bullet = this.activeBullets[i];
            if (this.collides(bullet, this.player.sprite)) {
                console.log("Vacuum bullet hit player");
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

                bullet.destroy();
                this.activeBullets.splice(i, 1);
                this.updateHearts();
                console.log("cat was hit ");

                this.explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    
                }, this);

            }
        }

        // Update vacuums
        for (let i = this.vacuums.length - 1; i >= 0; i--) {
            const vacuum = this.vacuums[i];
            vacuum.move();

            if (Phaser.Math.Between(0, 100) < 3) {
                vacuum.shoot();
            }

            // Check collision between player bullets and vacuums
            for (let j = this.bullets.bullets.length - 1; j >= 0; j--) {
                const playerBullet = this.bullets.bullets[j];
                if (this.collides(playerBullet, vacuum.sprite)) {
                    console.log("Player bullet hit vacuum");

                    const tempX = vacuum.sprite.x;
                    const tempY = vacuum.sprite.y;

                    playerBullet.destroy();
                    this.bullets.bullets.splice(j, 1);

                    vacuum.destroy();
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
        }

        // Check if all vacuums are cleared
        this.checkVacuums();
    }

    spawnWave() {
        if (this.waveCount >= 10) {
            console.log("Wave complete. Victory!");
            this.scene.start("Victory");
            return;
        }

        if(this.waveActive) {
            console.log("Wave active");
            return;
        }

        this.waveActive = true;
        this.waveCount++;
        console.log(`Wave ${this.waveCount} started`);
        
        while (this.vacuums.length < Phaser.Math.Between(3, 5)) {
            let x = Phaser.Math.Between(100, this.sys.game.config.width - 100);
            const y = 200;

            while (this.isTooClose(x)) {
                x = Phaser.Math.Between(100, this.sys.game.config.width - 100);
            }

            const vacuum = new Vacuum2(this, x, y);
            vacuum.move();
            this.vacuums.push(vacuum);
        }
    }

    isTooClose(x) {
        for (const vacuum of this.vacuums) {
            if (Math.abs(vacuum.sprite.x - x) < 50) {                
                console.log("too close");
                return true;
            }
        }
        return false;
    }

    checkVacuums() {
        if (this.vacuums.length === 0) {
            if (this.waveCount >= 10) {
                console.log("Wave complete. Victory!");
                this.scene.start("Victory");
                return;
            }
    
            this.waveActive = false;
            this.time.delayedCall(2000, () => {
                this.spawnWave();
            });
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
            this.myHearts = 3;
            this.myScore = 0;
            this.scene.start("Gameover");
        }
    }

    updateBullets() {
        this.myBullets = 5 - this.bullets.bullets.length;
        this.textBullets.setText(this.myBullets);
    }
}

export default Level3;