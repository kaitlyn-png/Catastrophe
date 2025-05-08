import TitleScreen from "./Scenes/TitleScreen.js";
import How from "./Scenes/How.js";
import Level1 from "./Scenes/Level1.js";
import Level2 from "./Scenes/Level2.js";
import Level3 from "./Scenes/Level3.js";
import Victory from "./Scenes/Victory.js";
import Gameover from "./Scenes/Gameover.js";
"use strict"
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    width: 800,
    height: 800,
    scene: [TitleScreen, How, Level1, Level2, Level3, Victory, Gameover],
    fps: { forceSetTimeOut: true, target: 30 },
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
}

var my = {sprite: {}};
const game = new Phaser.Game(config);
