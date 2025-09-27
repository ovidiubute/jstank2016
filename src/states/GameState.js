import constants from "../common/const";
import getSprites from "../levels/parser";

class GameState extends Phaser.State {
  init(level = 1) {
    console.log("GameState init() called with level:", level);
    console.log("Level parameter type:", typeof level);
    console.log("Level parameter value:", level);
    console.log("Global game level:", this.game.currentLevel);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.currentLevel = this.game.currentLevel || level;
    this.isPaused = false;
    this.pauseText = null;
    this.score = 0;
    this.lives = 3;
    this.enemyCount = 20; // Total enemies for this level
  }

  preload() {
    console.log("GameState preload() called");
    console.log("Game load object:", this.game.load);
    console.log("Game load methods:", Object.keys(this.game.load));

    this.game.load.atlasXML(
      "sprites",
      "assets/sprites.png",
      "assets/sprites.xml"
    );

    for (var i = 1; i <= 35; i++) {
      this.game.load.text("level_" + i, "assets/levels/" + i);
    }

    for (let soundKey of [
      "background",
      "bonus",
      "moving",
      "brick",
      "explosion",
      "fire",
      "gameover",
      "gamestart",
      "score",
      "steel",
    ]) {
      this.game.load.audio(soundKey, "assets/sounds/" + soundKey + ".ogg");
    }

    // Add preload completion handler (Phaser 2.x compatible)
    if (this.game.load.onLoadComplete) {
      this.game.load.onLoadComplete.addOnce(() => {
        console.log("All assets loaded successfully");
      });
    } else {
      console.log("onLoadComplete not available in this Phaser version");
    }
  }

  create() {
    console.log("GameState create() called with level:", this.currentLevel);

    // Clear the entire game world
    this.game.world.removeAll();

    // Check if level data is available
    if (!this.game.cache.checkTextKey("level_" + this.currentLevel)) {
      console.error(
        "Level data not available in cache for level:",
        this.currentLevel
      );
      console.error(
        "Available cache keys:",
        Object.keys(this.game.cache._cache.text)
      );
      this.game.state.start("MenuState");
      return;
    }

    // Sound effects
    this.fx = {
      background: this.game.add.audio("background", 1, true),
      bonus: this.game.add.audio("bonus"),
      brick: this.game.add.audio("brick"),
      explosion: this.game.add.audio("explosion"),
      fire: this.game.add.audio("fire"),
      gameover: this.game.add.audio("gameover"),
      gamestart: this.game.add.audio("gamestart"),
      score: this.game.add.audio("score"),
      steel: this.game.add.audio("steel"),
      moving: this.game.add.audio("moving", 1, true),
    };

    this.fx.brick.allowMultiple = true;
    this.fx.explosion.allowMultiple = true;
    this.fx.fire.allowMultiple = true;
    this.fx.steel.allowMultiple = true;

    this.fx.gamestart.play().onStop.add(() => {
      this.fx.background.play();
    });

    // Draw screen edges
    var graphics = this.game.add.graphics(0, 0);
    graphics.beginFill(0x999999);
    graphics.drawRect(0, 0, 16, 224);
    graphics.drawRect(0, 0, 224, 16);
    graphics.drawRect(0, 224, 320, 16);
    graphics.drawRect(224, 0, 56, 224);
    graphics.endFill();

    // World bounds are now handled by game.world.setBounds()

    // Add current level flag
    this.game.add.sprite(250, 180, "sprites", "flag.png");

    // Add player tank(s)
    this.players = this.game.add.group(
      undefined,
      "players",
      false,
      true,
      Phaser.Physics.ARCADE
    );
    this.tank = this.game.add.sprite(
      91,
      216,
      "sprites",
      "yellow_tank.png",
      this.players
    );
    // this.tank.animations.add('enter', ['enemy_spawn1.png', 'enemy_spawn2.png'], 4, true);
    this.tank.anchor.setTo(0.5);
    this.tank.health = Number.MAX_SAFE_INTEGER;
    this.tank.smoothed = false;
    // this.tank.animations.play('enter');

    // Enable physics for the tank
    this.game.physics.arcade.enable(this.tank);

    // Set world bounds to the full game area
    this.game.world.setBounds(0, 0, 280, 240);
    this.tank.body.collideWorldBounds = true;

    // Create invisible walls to constrain the tank to the playable area (16,16 to 240,240)
    this.createInvisibleWalls();

    // Add powerups
    this.powerups = this.add.group();
    var helmetPowerup = this.game.add.sprite(
      150,
      150,
      "sprites",
      "powerup_helmet.png",
      this.powerups
    );
    this.game.physics.arcade.enable(helmetPowerup);
    helmetPowerup.lifespan = 30000;
    helmetPowerup.alpha = 0;
    helmetPowerup.events.onKilled.add(() => {
      helmetPowerup.destroy();
    }, this);
    this.game.add
      .tween(helmetPowerup)
      .to({ alpha: 0.8 }, 250, Phaser.Easing.Linear.None, true, 0, 1000, true);

    // Add castle
    this.castles = this.game.add.group(
      undefined,
      "castles",
      false,
      true,
      Phaser.Physics.ARCADE
    );
    this.castle = this.game.add.sprite(
      112,
      210,
      "sprites",
      "castle.png",
      this.castles
    );
    this.game.physics.arcade.enable(this.castle);
    this.castle.body.immovable = true;

    // Add level blocks
    this.bricks = this.game.add.group(
      undefined,
      "bricks",
      false,
      true,
      Phaser.Physics.ARCADE
    );
    this.steelBlocks = this.game.add.group(
      undefined,
      "steelBlocks",
      false,
      true,
      Phaser.Physics.ARCADE
    );
    this.iceBlocks = this.game.add.group(
      undefined,
      "iceBlocks",
      false,
      true,
      Phaser.Physics.ARCADE
    );
    this.waterBlocks = this.game.add.group(
      undefined,
      "waterBlocks",
      false,
      true,
      Phaser.Physics.ARCADE
    );

    // Add level sprites
    console.log("Attempting to load level data for level:", this.currentLevel);
    console.log(
      "Cache keys available:",
      Object.keys(this.game.cache._cache.text)
    );

    var levelData = this.game.cache.getText("level_" + this.currentLevel);
    console.log("Level data retrieved:", levelData ? "SUCCESS" : "FAILED");

    // Check if level data exists
    if (!levelData) {
      console.error("Level data not found for level:", this.currentLevel);
      console.error(
        "Available cache keys:",
        Object.keys(this.game.cache._cache.text)
      );
      this.game.state.start("MenuState");
      return;
    }

    var sprites = getSprites(levelData, this.game);
    sprites.forEach((sprite) => {
      this.game.add.existing(sprite);

      if (sprite.extra.entityType == constants.ENTITY_TYPES.BRICK) {
        this.bricks.add(sprite);
      } else if (sprite.extra.entityType == constants.ENTITY_TYPES.WATER) {
        this.waterBlocks.add(sprite);
        sprite.animations.add("ripple", ["water1.png", "water2.png"]);
        sprite.animations.play("ripple", 1, true);
      } else if (sprite.extra.entityType == constants.ENTITY_TYPES.STEEL) {
        this.steelBlocks.add(sprite);
      }
    });

    // Add bullets
    this.playerWeapon = {
      power: 1,
    };

    this.bulletTime = 0;
    this.bullets = this.game.add.group(
      undefined,
      "bullets",
      false,
      true,
      Phaser.Physics.ARCADE
    );
    for (var i = 0; i < 32; i++) {
      var b = this.game.add.sprite(0, 0, "sprites", "bullet.png", this.bullets);
      b.exists = false;
      b.checkWorldBounds = true;
      b.outOfBoundsKill = true;
      b.anchor.setTo(0.5);

      // Enable physics for bullets
      this.game.physics.arcade.enable(b);
    }

    // Explosions
    this.explosions = this.game.add.group(undefined, "explosions", false);
    for (var i = 0; i < 10; i++) {
      var e = this.game.add.sprite(
        0,
        0,
        "sprites",
        "explosion1.png",
        this.explosions
      );
      e.animations.add(
        "boom",
        ["explosion1.png", "explosion2.png", "explosion3.png"],
        60,
        false
      );
      e.animations.add(
        "impact",
        ["explosion1.png", "explosion2.png"],
        60,
        false
      );
      e.animations.add("blip", ["explosion1.png"], 60, false);
      e.exists = false;
      e.anchor.setTo(0.5);
    }

    // Manage input
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Keyboard.ESC);

    // Create right sidebar UI elements (matching original Battle City)
    this.createRightSidebarUI();

    // Initialize enemy counter
    this.updateEnemyCounter();
  }

  createInvisibleWalls() {
    // Create invisible walls to constrain the tank to the playable area
    this.invisibleWalls = this.game.add.group();

    // Top wall
    const topWall = this.game.add.sprite(0, 0, null);
    this.game.physics.arcade.enable(topWall);
    topWall.body.immovable = true;
    topWall.body.setSize(280, 16);
    this.invisibleWalls.add(topWall);

    // Bottom wall
    const bottomWall = this.game.add.sprite(0, 240, null);
    this.game.physics.arcade.enable(bottomWall);
    bottomWall.body.immovable = true;
    bottomWall.body.setSize(280, 16);
    this.invisibleWalls.add(bottomWall);

    // Left wall
    const leftWall = this.game.add.sprite(0, 0, null);
    this.game.physics.arcade.enable(leftWall);
    leftWall.body.immovable = true;
    leftWall.body.setSize(16, 240);
    this.invisibleWalls.add(leftWall);

    // Right wall (before the UI panel)
    const rightWall = this.game.add.sprite(224, 0, null);
    this.game.physics.arcade.enable(rightWall);
    rightWall.body.immovable = true;
    rightWall.body.setSize(16, 240);
    this.invisibleWalls.add(rightWall);
  }

  createRightSidebarUI() {
    // Enemy tank counter (10 small tank icons in vertical column)
    this.enemyTankIcons = [];
    for (let i = 0; i < 10; i++) {
      const tankIcon = this.game.add.sprite(
        250,
        20 + i * 8,
        "sprites",
        "right_enemy.png"
      );
      tankIcon.scale.setTo(0.5, 0.5);
      this.enemyTankIcons.push(tankIcon);
    }

    // Player indicator (IP 2)
    this.playerText = this.game.add.text(230, 20, "IP", {
      font: "12px Arial",
      fill: "#FFFFFF",
    });
    this.playerNumberText = this.game.add.text(240, 32, "2", {
      font: "12px Arial",
      fill: "#FFFFFF",
    });

    // Lives indicator (flag with number)
    this.flagIcon = this.game.add.sprite(230, 50, "sprites", "flag.png");
    this.flagIcon.scale.setTo(0.5, 0.5);
    this.livesText = this.game.add.text(240, 60, this.lives.toString(), {
      font: "12px Arial",
      fill: "#FFFFFF",
    });

    // Score display (smaller, positioned lower)
    this.scoreText = this.game.add.text(230, 80, this.score.toString(), {
      font: "10px Arial",
      fill: "#FFFFFF",
    });
  }

  fireBullet() {
    //  To avoid them being allowed to fire too fast we set a time limit
    if (this.game.time.now > this.bulletTime) {
      //  Grab the first bullet we can from the pool
      var bullet = this.bullets.getFirstExists(false);

      if (bullet) {
        //  And fire it
        this.fx.fire.play();
        bullet.reset(this.tank.x, this.tank.y);
        bullet.angle = this.tank.angle;
        var speed = 300;

        // Fire right
        if (this.tank.angle == 90) {
          bullet.body.velocity.x += speed;

          // Fire down
        } else if (this.tank.angle == -180) {
          bullet.body.velocity.y += speed;

          // Fire up
        } else if (this.tank.angle == 0) {
          bullet.body.velocity.y -= speed;

          // Fire left
        } else {
          bullet.body.velocity.x -= speed;
        }
        this.bulletTime = this.game.time.now + 500;
      }
    }
  }

  destroyCastle(bullet, castle) {
    if (castle.alive) {
      bullet.kill();

      var explosion = this.explosions.getFirstExists(false);
      explosion.reset(castle.x + 5, castle.y + 5);
      explosion.animations.play("boom", 4, false, true);

      castle.frameName = "castle_dead.png";
      castle.alive = false;

      this.fx.explosion.play().onStop.add(() => {
        this.fx.background.stop();
        this.game.state.start("GameOverState", true, false, {
          score: this.score || 0,
          level: this.currentLevel,
          reason: "GAME OVER",
        });
      });
    }
  }

  hitBricks(bullet, brick) {
    bullet.kill();
    brick.kill();
    this.fx.brick.play();
    this.addScore(10);
    var explosion = this.explosions.getFirstExists(false);
    explosion.reset(bullet.x, bullet.y);
    explosion.animations.play("impact", 60, false, true);
  }

  hitSteel(bullet, steelBlock) {
    bullet.kill();
    if (this.playerWeapon.power > 1) {
      this.fx.brick.play();
      steelBlock.kill();
      this.addScore(20);
    } else {
      this.fx.steel.play();
      var explosion = this.explosions.getFirstExists(false);
      explosion.reset(bullet.x, bullet.y);
      explosion.animations.play("blip", 60, false, true);
    }
  }

  // hitWorldEdge method removed - bullets are now automatically destroyed
  // by world bounds due to outOfBoundsKill = true

  gainPowerup(_, powerup) {
    powerup.kill();
    this.addScore(100);
    this.fx.bonus.play();
  }

  addScore(points) {
    this.score += points;
    this.scoreText.text = this.score.toString();
  }

  updateEnemyCounter() {
    // Update the enemy tank counter display
    for (let i = 0; i < this.enemyTankIcons.length; i++) {
      if (i < this.enemyCount) {
        this.enemyTankIcons[i].visible = true;
      } else {
        this.enemyTankIcons[i].visible = false;
      }
    }
  }

  updateLivesDisplay() {
    this.livesText.text = this.lives.toString();
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pauseText = this.game.add.text(
        this.game.world.centerX,
        this.game.world.centerY,
        "PAUSED\n\nPress P to resume\nPress ESC to return to menu",
        {
          font: "16px Arial",
          fill: "#FFFF00",
          align: "center",
        }
      );
      this.pauseText.anchor.setTo(0.5);
    } else {
      if (this.pauseText) {
        this.pauseText.destroy();
        this.pauseText = null;
      }
    }
  }

  update() {
    try {
      // Handle pause
      if (this.pauseKey.justDown) {
        this.togglePause();
      }

      if (this.escapeKey.justDown) {
        this.game.state.start("MenuState");
        return;
      }

      if (this.isPaused) {
        return;
      }
    } catch (error) {
      console.error("Error in GameState update:", error);
    }

    try {
      this.tank.body.velocity.setTo(0);

      if (this.fx.moving.isPlaying) {
        this.fx.moving.stop();
      }

      if (this.cursors.up.isDown) {
        this.tank.angle = 0;
        this.tank.body.velocity.y -= 100;
        this.fx.moving.play();
      } else if (this.cursors.down.isDown) {
        this.tank.angle = 180;
        this.tank.body.velocity.y += 100;
        this.fx.moving.play();
      } else if (this.cursors.right.isDown) {
        this.tank.angle = 90;
        this.tank.body.velocity.x += 100;
        this.fx.moving.play();
      } else if (this.cursors.left.isDown) {
        this.tank.angle = -90;
        this.tank.body.velocity.x -= 100;
        this.fx.moving.play();
      }

      if (this.fireButton.isDown) {
        this.fireBullet();
      }
    } catch (error) {
      console.error("Error in tank movement:", error);
    }

    //  Run collisions
    this.game.physics.arcade.overlap(
      this.bullets,
      this.castles,
      this.destroyCastle,
      null,
      this
    );
    this.game.physics.arcade.overlap(
      this.bullets,
      this.bricks,
      this.hitBricks,
      null,
      this
    );
    this.game.physics.arcade.overlap(
      this.bullets,
      this.steelBlocks,
      this.hitSteel,
      null,
      this
    );
    this.game.physics.arcade.collide(this.tank, this.bricks);
    this.game.physics.arcade.collide(this.tank, this.waterBlocks);
    this.game.physics.arcade.collide(this.tank, this.steelBlocks);
    this.game.physics.arcade.collide(this.tank, this.castles);
    this.game.physics.arcade.collide(this.tank, this.invisibleWalls);
    this.game.physics.arcade.overlap(
      this.tank,
      this.powerups,
      this.gainPowerup,
      null,
      this
    );
    // Bullets will automatically be destroyed when they hit world bounds
    // due to outOfBoundsKill = true in bullet creation
  }
}

export default GameState;
