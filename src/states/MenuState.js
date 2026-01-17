import Phaser from "phaser";

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.selectedOption = 0;
    this.menuOptions = [
      { text: "1 PLAYER", action: "startSinglePlayer" },
      { text: "2 PLAYER", action: "startTwoPlayer" },
      { text: "CONSTRUCTION", action: "levelEditor" },
      { text: "OPTIONS", action: "options" },
    ];
    this.menuTexts = [];
    this.showingLevelSelect = false;
    this.selectedLevel = 1;
    this.levelSelectTexts = [];
  }

  preload() {
    this.load.atlasXML(
      "sprites",
      "assets/sprites.png",
      "assets/sprites.xml"
    );
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    if (this.showingLevelSelect) {
      this.createLevelSelect();
    } else {
      this.createMainMenu();
    }

    this.setupInput();
  }

  createMainMenu() {
    this.menuTexts.forEach((text) => text.destroy());
    this.menuTexts = [];

    const centerX = this.cameras.main.centerX;

    const title = this.add.text(centerX, 60, "BATTLE CITY", {
      fontFamily: "Arial",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#FFFF00",
      align: "center",
    });
    title.setOrigin(0.5);
    this.menuTexts.push(title);

    const subtitle = this.add.text(centerX, 90, "TANK 2016", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#FFFFFF",
      align: "center",
    });
    subtitle.setOrigin(0.5);
    this.menuTexts.push(subtitle);

    this.menuOptions.forEach((option, index) => {
      const y = 140 + index * 30;
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

  createLevelSelect() {
    this.levelSelectTexts.forEach((text) => text.destroy());
    this.levelSelectTexts = [];

    const centerX = this.cameras.main.centerX;

    const title = this.add.text(centerX, 40, "STAGE SELECT", {
      fontFamily: "Arial",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#FFFF00",
      align: "center",
    });
    title.setOrigin(0.5);
    this.levelSelectTexts.push(title);

    for (let i = 1; i <= 35; i++) {
      const row = Math.floor((i - 1) / 5);
      const col = (i - 1) % 5;
      const x = 80 + col * 40;
      const y = 80 + row * 25;

      const text = this.add.text(x, y, i.toString(), {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFFFFF",
        align: "center",
      });
      text.setOrigin(0.5);

      if (i === this.selectedLevel) {
        text.setColor("#FFFF00");
        text.setShadow(2, 2, "#000000", 2);
      }

      this.levelSelectTexts.push(text);
    }

    const instructions = this.add.text(
      centerX,
      280,
      "USE ARROW KEYS TO SELECT • PRESS ENTER TO START • ESC TO BACK",
      {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#CCCCCC",
        align: "center",
      }
    );
    instructions.setOrigin(0.5);
    this.levelSelectTexts.push(instructions);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if (this.showingLevelSelect) {
      this.handleLevelSelectInput();
    } else {
      this.handleMainMenuInput();
    }
  }

  handleMainMenuInput() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectedOption =
        (this.selectedOption - 1 + this.menuOptions.length) %
        this.menuOptions.length;
      this.updateMenuDisplay();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
      this.updateMenuDisplay();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.selectOption();
    }
  }

  handleLevelSelectInput() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectedLevel = Math.max(1, this.selectedLevel - 5);
      this.updateLevelSelectDisplay();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectedLevel = Math.min(35, this.selectedLevel + 5);
      this.updateLevelSelectDisplay();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedLevel = Math.max(1, this.selectedLevel - 1);
      this.updateLevelSelectDisplay();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedLevel = Math.min(35, this.selectedLevel + 1);
      this.updateLevelSelectDisplay();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startGame(this.selectedLevel);
    }

    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.showingLevelSelect = false;
      this.createMainMenu();
    }
  }

  updateMenuDisplay() {
    this.menuTexts.forEach((text, index) => {
      if (index >= 2 && index < 2 + this.menuOptions.length) {
        const optionIndex = index - 2;
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

  updateLevelSelectDisplay() {
    this.levelSelectTexts.forEach((text, index) => {
      if (index > 0 && index <= 35) {
        const level = index;
        if (level === this.selectedLevel) {
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
    const selectedAction = this.menuOptions[this.selectedOption].action;

    switch (selectedAction) {
      case "startSinglePlayer":
        this.showingLevelSelect = true;
        this.createLevelSelect();
        break;
      case "startTwoPlayer":
        console.log("Two-player mode not yet implemented");
        break;
      case "levelEditor":
        console.log("Level editor not yet implemented");
        break;
      case "options":
        this.scene.start("OptionsScene");
        break;
    }
  }

  startGame(level = 1) {
    this.registry.set("currentLevel", level);
    this.scene.start("GameScene");
  }
}

export default MenuScene;
