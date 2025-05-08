class TitleScreen extends Phaser.Scene {
    constructor() {
        super('TitleScreen');
    }

    preload() {        
        this.load.setPath("assets/");
        this.load.image("title1", "title1.png");
        this.load.image("title2", "title2.png");
        this.load.image("title3", "title3.png");
        this.load.image("click", "click.png");
    }

    create() {
        this.anims.create({
            key: "title",
            frames: [
                { key: "title1" },
                { key: "title2" },
                { key: "title3" },
            ],
            frameRate: 3,
            repeat: -1,
        });

        this.title = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "title1")
            .setDepth(0)
            .play("title");

        this.click = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "click").setDepth(1);

        this.input.once('pointerdown', () => {
            this.scene.start('How');
        });
    }
}

export default TitleScreen;