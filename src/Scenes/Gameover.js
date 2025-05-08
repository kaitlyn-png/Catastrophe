class Gameover extends Phaser.Scene {
    constructor() {
        super('Gameover');
    }

    preload() {        
        this.load.setPath("assets/");
        this.load.image("gameover", "gameover.png");
        this.load.image("title2", "title2.png");
        this.load.image("title3", "title3.png");
        this.load.image("click", "click.png");
        
        this.load.audio("defeat", "Audio/8-Bit/jingles_NES00.ogg");
    }

    create() {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "gameover").setDepth(0);    
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "click").setDepth(1);

        this.sound.play("defeat", { volume: 1 });

        this.input.once('pointerdown', () => {
            this.scene.start('How');
        });
    }
}

export default Gameover;