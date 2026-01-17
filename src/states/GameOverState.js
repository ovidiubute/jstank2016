import Phaser from "phaser";

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
    this.selectedOption = 0;
    this.options = [
      { text: "TRY AGAIN", action: "retry" },
      { text: "MAIN MENU", action: "menu" },
    ];
    this.menuTexts = [];
    this.score = 0;
    this.level = 1;
    this.reason = "GAME OVER";
  }

  init(data) {
    this.score = data.score || 0;
    this.level = data.level || 1;
    this.reason = data.reason || "GAME OVER";
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");
    this.createGameOverScreen();
    this.setupInput();
  }

  createGameOverScreen() {
    this.menuTexts.forEach((text) => text.destroy());
    this.menuTexts = [];

    const centerX = this.cameras.main.centerX;

    const gameOverText = this.add.text(centerX, 80, this.reason, {
      fontFamily: "Arial",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#FF0000",
      align: "center",
    });
    gameOverText.setOrigin(0.5);
    this.menuTexts.push(gameOverText);

    const scoreText = this.add.text(
      centerX,
      120,
      `SCORE: ${this.score}`,
      {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
        align: "center",
      }
    );
    scoreText.setOrigin(0.5);
    this.menuTexts.push(scoreText);

    const levelText = this.add.text(
      centerX,
      140,
      `STAGE: ${this.level}`,
      {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
        align: "center",
      }
    );
    levelText.setOrigin(0.5);
    this.menuTexts.push(levelText);

    this.options.forEach((option, index) => {
      const y = 200 + index * 30;
      const text = this.add.text(centerX, y, option.text, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#FFFFFF",
        align: "center",
      });
      text.setOrigin(0.5);

      if (index === this.selectedOption) {
        text.setColor("#FFFF00");
        text.setShadow(2, 2, "#000000", 2);
      }

      this.menuTexts.push(text);
    });

    const instructions = this.add.text(
      centerX,
      280,
      "USE ARROW KEYS TO SELECT • PRESS ENTER TO CONFIRM",
      {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#CCCCCC",
        align: "center",
      }
    );
    instructions.setOrigin(0.5);
    this.menuTexts.push(instructions);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    this.handleInput();
  }

  handleInput() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectedOption =
        (this.selectedOption - 1 + this.options.length) %
        this.options.length;
      this.updateMenuDisplay();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectedOption = (this.selectedOption + 1) % this.options.length;
      this.updateMenuDisplay();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.selectOption();
    }
  }

  updateMenuDisplay() {
    this.menuTexts.forEach((text, index) => {
      if (index >= 3 && index < 3 + this.options.length) {
        const optionIndex = index - 3;
        if (optionIndex === this.selectedOption) {
          text.setColor("#FFFF00");
          text.setShadow(2, 2, "#000000", 2);
        } else {
          text.setColor("#FFFFFF");
          text.setShadow(0, 0, "#000000", 0);
        }
      }
    });
  }

  selectOption() {
    const selectedAction = this.options[this.selectedOption].action;

    switch (selectedAction) {
      case "retry":
        this.registry.set("currentLevel", this.level);
        this.scene.start("GameScene");
        break;
      case "menu":
        this.scene.start("MenuScene");
        break;
    }
  }
}

export default GameOverScene;
