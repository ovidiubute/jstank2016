import GameState from 'states/GameState';
import MenuState from 'states/MenuState';

class Game extends Phaser.Game {

	constructor() {
		super(280, 240, Phaser.AUTO, 'content', null);
		this.state.add('GameState', GameState, false);
		this.state.add('MenuState', MenuState, false);

		this.state.start('GameState');
	}

}

new Game();
