class MenuState extends Phaser.State {
  constructor() {
    super();
    this.selectedOption = 0;
    this.menuOptions = [
      { text: "1 PLAYER", action: "startSinglePlayer" },
      { text: "2 PLAYER", action: "startTwoPlayer" },
      { text: "CONSTRUCTION", action: "levelEditor" },
      { text: "OPTIONS", action: "options" },
    ];
    this.menuTexts = [];
    this.blinkTimer = 0;
    this.showingLevelSelect = false;
    this.selectedLevel = 1;
    this.levelSelectTexts = [];
  }

  preload() {
    // Load any additional assets needed for menus
    this.game.load.atlasXML(
      "sprites",
      "assets/sprites.png",
      "assets/sprites.xml"
    );
  }

  create() {
    this.game.stage.backgroundColor = "#000000";

    if (this.showingLevelSelect) {
      this.createLevelSelect();
    } else {
      this.createMainMenu();
    }

    this.setupInput();
  }

  createMainMenu() {
    // Clear any existing text
    this.menuTexts.forEach((text) => text.destroy());
    this.menuTexts = [];

    // Title
    const titleStyle = {
      font: "bold 24px Arial",
      fill: "#FFFF00",
      align: "center",
    };

    const title = this.game.add.text(
      this.game.world.centerX,
      60,
      "BATTLE CITY",
      titleStyle
    );
    title.anchor.setTo(0.5);
    this.menuTexts.push(title);

    // Subtitle
    const subtitleStyle = {
      font: "16px Arial",
      fill: "#FFFFFF",
      align: "center",
    };

    const subtitle = this.game.add.text(
      this.game.world.centerX,
      90,
      "TANK 2016",
      subtitleStyle
    );
    subtitle.anchor.setTo(0.5);
    this.menuTexts.push(subtitle);

    // Menu options
    const optionStyle = {
      font: "18px Arial",
      fill: "#FFFFFF",
      align: "center",
    };

    this.menuOptions.forEach((option, index) => {
      const y = 140 + index * 30;
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
      align: "center",
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

  createLevelSelect() {
    // Clear any existing text
    this.levelSelectTexts.forEach((text) => text.destroy());
    this.levelSelectTexts = [];

    // Title
    const titleStyle = {
      font: "bold 20px Arial",
      fill: "#FFFF00",
      align: "center",
    };

    const title = this.game.add.text(
      this.game.world.centerX,
      40,
      "STAGE SELECT",
      titleStyle
    );
    title.anchor.setTo(0.5);
    this.levelSelectTexts.push(title);

    // Level grid (5x7 = 35 levels)
    const levelStyle = {
      font: "14px Arial",
      fill: "#FFFFFF",
      align: "center",
    };

    for (let i = 1; i <= 35; i++) {
      const row = Math.floor((i - 1) / 5);
      const col = (i - 1) % 5;
      const x = 80 + col * 40;
      const y = 80 + row * 25;

      const text = this.game.add.text(x, y, i.toString(), levelStyle);
      text.anchor.setTo(0.5);

      if (i === this.selectedLevel) {
        text.fill = "#FFFF00";
        text.setShadow(2, 2, "#000000", 2);
      }

      this.levelSelectTexts.push(text);
    }

    // Instructions
    const instructionStyle = {
      font: "12px Arial",
      fill: "#CCCCCC",
      align: "center",
    };

    const instructions = this.game.add.text(
      this.game.world.centerX,
      280,
      "USE ARROW KEYS TO SELECT • PRESS ENTER TO START • ESC TO BACK",
      instructionStyle
    );
    instructions.anchor.setTo(0.5);
    this.levelSelectTexts.push(instructions);

    // Add a test button to directly start the game
    const testButton = this.game.add.text(
      this.game.world.centerX,
      300,
      "TEST: Press T to start level 1",
      {
        font: "12px Arial",
        fill: "#FF0000",
        align: "center",
      }
    );
    testButton.anchor.setTo(0.5);
    this.levelSelectTexts.push(testButton);
  }

  setupInput() {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    this.escapeKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.testKey = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
  }

  update() {
    if (this.showingLevelSelect) {
      this.handleLevelSelectInput();
    } else {
      this.handleMainMenuInput();
    }
  }

  handleMainMenuInput() {
    // Handle menu navigation
    if (this.cursors.up.justDown) {
      this.selectedOption =
        (this.selectedOption - 1 + this.menuOptions.length) %
        this.menuOptions.length;
      this.updateMenuDisplay();
    } else if (this.cursors.down.justDown) {
      this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
      this.updateMenuDisplay();
    }

    // Handle selection
    if (this.enterKey.justDown || this.spaceKey.justDown) {
      this.selectOption();
    }
  }

  handleLevelSelectInput() {
    // Handle level navigation
    if (this.cursors.up.justDown) {
      this.selectedLevel = Math.max(1, this.selectedLevel - 5);
      this.updateLevelSelectDisplay();
    } else if (this.cursors.down.justDown) {
      this.selectedLevel = Math.min(35, this.selectedLevel + 5);
      this.updateLevelSelectDisplay();
    } else if (this.cursors.left.justDown) {
      this.selectedLevel = Math.max(1, this.selectedLevel - 1);
      this.updateLevelSelectDisplay();
    } else if (this.cursors.right.justDown) {
      this.selectedLevel = Math.min(35, this.selectedLevel + 1);
      this.updateLevelSelectDisplay();
    }

    // Handle selection
    if (this.enterKey.justDown || this.spaceKey.justDown) {
      console.log(
        "Enter/Space pressed, starting game with level:",
        this.selectedLevel
      );
      this.startGame(this.selectedLevel);
    }

    // Handle test key
    if (this.testKey.justDown) {
      console.log("T key pressed, starting test game with level 1");
      this.startGame(1);
    }

    // Handle back
    if (this.escapeKey.justDown) {
      this.showingLevelSelect = false;
      this.createMainMenu();
    }
  }

  updateMenuDisplay() {
    this.menuTexts.forEach((text, index) => {
      if (index >= 2 && index < 2 + this.menuOptions.length) {
        const optionIndex = index - 2;
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

  updateLevelSelectDisplay() {
    this.levelSelectTexts.forEach((text, index) => {
      if (index > 0 && index <= 35) {
        const level = index;
        if (level === this.selectedLevel) {
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
    const selectedAction = this.menuOptions[this.selectedOption].action;

    switch (selectedAction) {
      case "startSinglePlayer":
        this.showingLevelSelect = true;
        this.createLevelSelect();
        break;
      case "startTwoPlayer":
        // TODO: Implement two-player mode
        console.log("Two-player mode not yet implemented");
        break;
      case "levelEditor":
        // TODO: Implement level editor
        console.log("Level editor not yet implemented");
        break;
      case "options":
        this.game.state.start("OptionsState");
        break;
    }
  }

  startGame(level = 1) {
    console.log("Starting game with level:", level);

    // Hide the level select screen immediately
    this.hideLevelSelect();

    // Try different state transition methods
    console.log("Attempting state transition...");

    // Store the level in a global variable for the GameState to access
    this.game.currentLevel = level;

    // Start the GameState
    this.game.state.start("GameState", true, false);
    console.log("State start called successfully with level:", level);
  }

  hideLevelSelect() {
    // Clear all menu elements
    this.menuTexts.forEach((text) => text.destroy());
    this.menuTexts = [];
    this.levelSelectTexts.forEach((text) => text.destroy());
    this.levelSelectTexts = [];

    // Reset the level select state
    this.showingLevelSelect = false;

    // Clear the background
    this.game.stage.backgroundColor = "#000000";
  }

  shutdown() {
    console.log("MenuState shutdown called");
    // Clear all text elements
    this.menuTexts.forEach((text) => text.destroy());
    this.menuTexts = [];
    this.levelSelectTexts.forEach((text) => text.destroy());
    this.levelSelectTexts = [];
  }
}

export default MenuState;
