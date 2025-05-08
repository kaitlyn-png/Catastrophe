class How extends Phaser.Scene {
    constructor() {
        super('How');
    }

    preload() {        
        this.load.setPath("assets/");
        this.load.image("how", "instructions.png");
        this.load.image("click", "click.png");
    }

    create() {
        this.how = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, "how").setDepth(0);        
        this.click = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 100, "click").setDepth(1);

        this.input.once('pointerdown', () => {
            this.scene.start('Level1');
        });
    }
}

export default How;