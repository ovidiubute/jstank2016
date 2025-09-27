class GameOverState extends Phaser.State {
  constructor() {
    super();
    this.selectedOption = 0;
    this.options = [
      { text: "TRY AGAIN", action: "retry" },
      { text: "MAIN MENU", action: "menu" }
    ];
    this.menuTexts = [];
    this.gameOverText = null;
    this.score = 0;
    this.level = 1;
  }

  init(score = 0, level = 1, reason = "GAME OVER") {
    this.score = score;
    this.level = level;
    this.reason = reason;
  }

  create() {
    this.game.stage.backgroundColor = "#000000";
    this.createGameOverScreen();
    this.setupInput();
  }

  createGameOverScreen() {
    // Clear any existing text
    this.menuTexts.forEach(text => text.destroy());
    this.menuTexts = [];

    // Game Over title
    const titleStyle = {
      font: "bold 24px Arial",
      fill: "#FF0000",
      align: "center"
    };
    
    this.gameOverText = this.game.add.text(
      this.game.world.centerX,
      80,
      this.reason,
      titleStyle
    );
    this.gameOverText.anchor.setTo(0.5);
    this.menuTexts.push(this.gameOverText);

    // Score display
    const scoreStyle = {
      font: "16px Arial",
      fill: "#FFFFFF",
      align: "center"
    };
    
    const scoreText = this.game.add.text(
      this.game.world.centerX,
      120,
      `SCORE: ${this.score}`,
      scoreStyle
    );
    scoreText.anchor.setTo(0.5);
    this.menuTexts.push(scoreText);

    // Level display
    const levelText = this.game.add.text(
      this.game.world.centerX,
      140,
      `STAGE: ${this.level}`,
      scoreStyle
    );
    levelText.anchor.setTo(0.5);
    this.menuTexts.push(levelText);

    // Menu options
    const optionStyle = {
      font: "18px Arial",
      fill: "#FFFFFF",
      align: "center"
    };

    this.options.forEach((option, index) => {
      const y = 200 + (index * 30);
      const text = this.game.add.text(
        this.game.world.centerX,
        y,
        option.text,
        optionStyle
      );
      text.anchor.setTo(0.5);
      
      if (index === this.selectedOption) {
        text.fill = "#FFFF00";
        text.setShadow(2, 2, "#000000", 2);
      }
      
      this.menuTexts.push(text);
    });

    // Instructions
    const instructionStyle = {
      font: "12px Arial",
      fill: "#CCCCCC",
      align: "center"
    };
    
    const instructions = this.game.add.text(
      this.game.world.centerX,
      280,
      "USE ARROW KEYS TO SELECT • PRESS ENTER TO CONFIRM",
      instructionStyle
    );
    instructions.anchor.setTo(0.5);
    this.menuTexts.push(instructions);
  }

  setupInput() {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  }

  update() {
    this.handleInput();
  }

  handleInput() {
    // Handle menu navigation
    if (this.cursors.up.justDown) {
      this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
      this.updateMenuDisplay();
    } else if (this.cursors.down.justDown) {
      this.selectedOption = (this.selectedOption + 1) % this.options.length;
      this.updateMenuDisplay();
    }

    // Handle selection
    if (this.enterKey.justDown || this.spaceKey.justDown) {
      this.selectOption();
    }
  }

  updateMenuDisplay() {
    this.menuTexts.forEach((text, index) => {
      if (index >= 3 && index < 3 + this.options.length) {
        const optionIndex = index - 3;
        if (optionIndex === this.selectedOption) {
          text.fill = "#FFFF00";
          text.setShadow(2, 2, "#000000", 2);
        } else {
          text.fill = "#FFFFFF";
          text.setShadow(0, 0, "#000000", 0);
        }
      }
    });
  }

  selectOption() {
    const selectedAction = this.options[this.selectedOption].action;
    
    switch (selectedAction) {
      case "retry":
        this.game.state.start("GameState", true, false, { level: this.level });
        break;
      case "menu":
        this.game.state.start("MenuState");
        break;
    }
  }
}

export default GameOverState;
