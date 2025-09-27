import GameOverState from "states/GameOverState";
import GameState from "states/GameState";
import MenuState from "states/MenuState";
import OptionsState from "states/OptionsState";

class Game extends Phaser.Game {
  constructor() {
    super(280, 240, Phaser.AUTO, "content", null);
    this.state.add("GameState", GameState, false);
    this.state.add("MenuState", MenuState, false);
    this.state.add("OptionsState", OptionsState, false);
    this.state.add("GameOverState", GameOverState, false);

    this.state.start("MenuState");
  }
}

new Game();
