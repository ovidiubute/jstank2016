import Phaser from "phaser";

class OptionsScene extends Phaser.Scene {
  constructor() {
    super({ key: "OptionsScene" });
    this.selectedOption = 0;
    this.options = [
      { text: "SOUND: ON", key: "sound", value: true },
      { text: "MUSIC: ON", key: "music", value: true },
      { text: "DIFFICULTY: NORMAL", key: "difficulty", value: 1 },
      { text: "BACK", key: "back" },
    ];
    this.menuTexts = [];
    this.difficultyLevels = ["EASY", "NORMAL", "HARD"];
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");
    this.createOptionsMenu();
    this.setupInput();
  }

  createOptionsMenu() {
    this.menuTexts.forEach((text) => text.destroy());
    this.menuTexts = [];

    const centerX = this.cameras.main.centerX;

    const title = this.add.text(centerX, 60, "OPTIONS", {
      fontFamily: "Arial",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#FFFF00",
      align: "center",
    });
    title.setOrigin(0.5);
    this.menuTexts.push(title);

    this.options.forEach((option, index) => {
      const y = 120 + index * 30;
      let text = option.text;

      if (option.key === "difficulty") {
        text = `DIFFICULTY: ${this.difficultyLevels[option.value]}`;
      }

      const textObj = this.add.text(centerX, y, text, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFFFFF",
        align: "center",
      });
      textObj.setOrigin(0.5);

      if (index === this.selectedOption) {
        textObj.setColor("#FFFF00");
        textObj.setShadow(2, 2, "#000000", 2);
      }

      this.menuTexts.push(textObj);
    });

    const instructions = this.add.text(
      centerX,
      280,
      "USE ARROW KEYS TO SELECT • PRESS ENTER TO CHANGE • ESC TO BACK",
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
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
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

    if (
      Phaser.Input.Keyboard.JustDown(this.enterKey) ||
      Phaser.Input.Keyboard.JustDown(this.leftKey) ||
      Phaser.Input.Keyboard.JustDown(this.rightKey)
    ) {
      this.handleOptionChange();
    }

    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.scene.start("MenuScene");
    }
  }

  handleOptionChange() {
    const option = this.options[this.selectedOption];

    if (option.key === "back") {
      this.scene.start("MenuScene");
      return;
    }

    if (option.key === "sound" || option.key === "music") {
      option.value = !option.value;
      option.text = `${option.key.toUpperCase()}: ${option.value ? "ON" : "OFF"}`;
    } else if (option.key === "difficulty") {
      if (Phaser.Input.Keyboard.JustDown(this.leftKey)) {
        option.value = Math.max(0, option.value - 1);
      } else {
        option.value = Math.min(
          this.difficultyLevels.length - 1,
          option.value + 1
        );
      }
    }

    this.createOptionsMenu();
  }

  updateMenuDisplay() {
    this.menuTexts.forEach((text, index) => {
      if (index >= 1 && index < 1 + this.options.length) {
        const optionIndex = index - 1;
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
}

export default OptionsScene;
