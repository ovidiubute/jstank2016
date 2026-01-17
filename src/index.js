import Phaser from "phaser";
import GameOverScene from "states/GameOverState";
import GameScene from "states/GameState";
import MenuScene from "states/MenuState";
import OptionsScene from "states/OptionsState";

const config = {
  type: Phaser.AUTO,
  width: 280,
  height: 240,
  parent: "content",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [MenuScene, GameScene, OptionsScene, GameOverScene],
};

new Phaser.Game(config);
