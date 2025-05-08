class Victory extends Phaser.Scene {
    constructor() {
        super('Victory');
    }

    preload() {        
        this.load.setPath("assets/");
        this.load.image("victory", "victory.png");

        this.load.audio("victory", "Audio/8-Bit/jingles_NES06.ogg");
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "victory").setDepth(0);

        this.sound.play("victory", { volume: 1 });

        this.input.once('pointerdown', () => {
            this.scene.start('How');
        });
    }
}

export default Victory;