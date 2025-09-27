class OptionsState extends Phaser.State {
  constructor() {
    super();
    this.selectedOption = 0;
    this.options = [
      { text: "SOUND: ON", key: "sound", value: true },
      { text: "MUSIC: ON", key: "music", value: true },
      { text: "DIFFICULTY: NORMAL", key: "difficulty", value: 1 },
      { text: "BACK", key: "back" }
    ];
    this.menuTexts = [];
    this.difficultyLevels = ["EASY", "NORMAL", "HARD"];
  }

  create() {
    this.game.stage.backgroundColor = "#000000";
    this.createOptionsMenu();
    this.setupInput();
  }

  createOptionsMenu() {
    // Clear any existing text
    this.menuTexts.forEach(text => text.destroy());
    this.menuTexts = [];

    // Title
    const titleStyle = {
      font: "bold 20px Arial",
      fill: "#FFFF00",
      align: "center"
    };
    
    const title = this.game.add.text(
      this.game.world.centerX,
      60,
      "OPTIONS",
      titleStyle
    );
    title.anchor.setTo(0.5);
    this.menuTexts.push(title);

    // Options
    const optionStyle = {
      font: "16px Arial",
      fill: "#FFFFFF",
      align: "center"
    };

    this.options.forEach((option, index) => {
      const y = 120 + (index * 30);
      let text = option.text;
      
      if (option.key === "difficulty") {
        text = `DIFFICULTY: ${this.difficultyLevels[option.value]}`;
      }
      
      const textObj = this.game.add.text(
        this.game.world.centerX,
        y,
        text,
        optionStyle
      );
      textObj.anchor.setTo(0.5);
      
      if (index === this.selectedOption) {
        textObj.fill = "#FFFF00";
        textObj.setShadow(2, 2, "#000000", 2);
      }
      
      this.menuTexts.push(textObj);
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
      "USE ARROW KEYS TO SELECT • PRESS ENTER TO CHANGE • ESC TO BACK",
      instructionStyle
    );
    instructions.anchor.setTo(0.5);
    this.menuTexts.push(instructions);
  }

  setupInput() {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    this.escapeKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
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

    // Handle option changes
    if (this.enterKey.justDown || this.leftKey.justDown || this.rightKey.justDown) {
      this.handleOptionChange();
    }

    // Handle back
    if (this.escapeKey.justDown) {
      this.game.state.start("MenuState");
    }
  }

  handleOptionChange() {
    const option = this.options[this.selectedOption];
    
    if (option.key === "back") {
      this.game.state.start("MenuState");
      return;
    }
    
    if (option.key === "sound" || option.key === "music") {
      option.value = !option.value;
      option.text = `${option.key.toUpperCase()}: ${option.value ? "ON" : "OFF"}`;
    } else if (option.key === "difficulty") {
      if (this.leftKey.justDown) {
        option.value = Math.max(0, option.value - 1);
      } else {
        option.value = Math.min(this.difficultyLevels.length - 1, option.value + 1);
      }
    }
    
    this.createOptionsMenu();
  }

  updateMenuDisplay() {
    this.menuTexts.forEach((text, index) => {
      if (index >= 1 && index < 1 + this.options.length) {
        const optionIndex = index - 1;
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
}

export default OptionsState;
