import Phaser from "phaser";
import constants from "../common/const";
import getSprites from "../levels/parser";

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.currentLevel = 1;
    this.isPaused = false;
    this.pauseText = null;
    this.score = 0;
    this.lives = 3;
    this.enemyCount = 20;
  }

  init() {
    this.currentLevel = this.registry.get("currentLevel") || 1;
    this.isPaused = false;
    this.pauseText = null;
    this.score = 0;
    this.lives = 3;
    this.enemyCount = 20;
  }

  preload() {
    this.load.atlasXML(
      "sprites",
      "assets/sprites.png",
      "assets/sprites.xml"
    );

    for (let i = 1; i <= 35; i++) {
      this.load.text("level_" + i, "assets/levels/" + i);
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
      this.load.audio(soundKey, "assets/sounds/" + soundKey + ".ogg");
    }
  }

  create() {
    this.cameras.main.setBackgroundColor("#000000");

    const levelKey = "level_" + this.currentLevel;
    if (!this.cache.text.exists(levelKey)) {
      console.error("Level data not available for level:", this.currentLevel);
      this.scene.start("MenuScene");
      return;
    }

    this.fx = {
      background: this.sound.add("background", { loop: true }),
      bonus: this.sound.add("bonus"),
      brick: this.sound.add("brick"),
      explosion: this.sound.add("explosion"),
      fire: this.sound.add("fire"),
      gameover: this.sound.add("gameover"),
      gamestart: this.sound.add("gamestart"),
      score: this.sound.add("score"),
      steel: this.sound.add("steel"),
      moving: this.sound.add("moving", { loop: true }),
    };

    this.fx.gamestart.once("complete", () => {
      this.fx.background.play();
    });
    this.fx.gamestart.play();

    const graphics = this.add.graphics();
    graphics.fillStyle(0x999999);
    graphics.fillRect(0, 0, 16, 224);
    graphics.fillRect(0, 0, 224, 16);
    graphics.fillRect(0, 224, 320, 16);
    graphics.fillRect(224, 0, 56, 224);

    this.add.sprite(250, 180, "sprites", "flag.png");

    this.players = this.physics.add.group();
    this.tank = this.physics.add.sprite(91, 216, "sprites", "yellow_tank.png");
    this.tank.setOrigin(0.5);
    this.tank.setCollideWorldBounds(true);
    this.players.add(this.tank);

    this.createInvisibleWalls();

    this.powerups = this.physics.add.group();
    const helmetPowerup = this.physics.add.sprite(
      150,
      150,
      "sprites",
      "powerup_helmet.png"
    );
    helmetPowerup.setAlpha(0);
    this.powerups.add(helmetPowerup);

    this.tweens.add({
      targets: helmetPowerup,
      alpha: { from: 0, to: 0.8 },
      duration: 250,
      yoyo: true,
      repeat: -1,
    });

    this.time.delayedCall(30000, () => {
      if (helmetPowerup.active) {
        helmetPowerup.destroy();
      }
    });

    this.castles = this.physics.add.group();
    this.castle = this.physics.add.sprite(112, 210, "sprites", "castle.png");
    this.castle.setImmovable(true);
    this.castle.alive = true;
    this.castles.add(this.castle);

    this.bricks = this.physics.add.group();
    this.steelBlocks = this.physics.add.group();
    this.iceBlocks = this.physics.add.group();
    this.waterBlocks = this.physics.add.group();

    const levelData = this.cache.text.get(levelKey);
    if (!levelData) {
      console.error("Level data not found for level:", this.currentLevel);
      this.scene.start("MenuScene");
      return;
    }

    const sprites = getSprites(levelData, this);
    sprites.forEach((sprite) => {
      if (sprite.extra.entityType === constants.ENTITY_TYPES.BRICK) {
        this.bricks.add(sprite);
      } else if (sprite.extra.entityType === constants.ENTITY_TYPES.WATER) {
        this.waterBlocks.add(sprite);
        sprite.anims.create({
          key: "ripple",
          frames: [
            { key: "sprites", frame: "water1.png" },
            { key: "sprites", frame: "water2.png" },
          ],
          frameRate: 1,
          repeat: -1,
        });
        sprite.play("ripple");
      } else if (sprite.extra.entityType === constants.ENTITY_TYPES.STEEL) {
        this.steelBlocks.add(sprite);
      }
    });

    this.playerWeapon = {
      power: 1,
    };

    this.bulletTime = 0;
    this.bullets = this.physics.add.group({
      defaultKey: "sprites",
      defaultFrame: "bullet.png",
      maxSize: 32,
    });

    for (let i = 0; i < 32; i++) {
      const bullet = this.bullets.create(0, 0, "sprites", "bullet.png");
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.setOrigin(0.5);
    }

    this.explosions = this.add.group();
    for (let i = 0; i < 10; i++) {
      const explosion = this.add.sprite(0, 0, "sprites", "explosion1.png");
      explosion.setActive(false);
      explosion.setVisible(false);
      explosion.setOrigin(0.5);

      explosion.anims.create({
        key: "boom",
        frames: [
          { key: "sprites", frame: "explosion1.png" },
          { key: "sprites", frame: "explosion2.png" },
          { key: "sprites", frame: "explosion3.png" },
        ],
        frameRate: 60,
      });

      explosion.anims.create({
        key: "impact",
        frames: [
          { key: "sprites", frame: "explosion1.png" },
          { key: "sprites", frame: "explosion2.png" },
        ],
        frameRate: 60,
      });

      explosion.anims.create({
        key: "blip",
        frames: [{ key: "sprites", frame: "explosion1.png" }],
        frameRate: 60,
      });

      this.explosions.add(explosion);
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.createRightSidebarUI();
    this.updateEnemyCounter();

    this.physics.add.overlap(
      this.bullets,
      this.castles,
      this.destroyCastle,
      null,
      this
    );
    this.physics.add.overlap(
      this.bullets,
      this.bricks,
      this.hitBricks,
      null,
      this
    );
    this.physics.add.overlap(
      this.bullets,
      this.steelBlocks,
      this.hitSteel,
      null,
      this
    );
    this.physics.add.collider(this.tank, this.bricks);
    this.physics.add.collider(this.tank, this.waterBlocks);
    this.physics.add.collider(this.tank, this.steelBlocks);
    this.physics.add.collider(this.tank, this.castles);
    this.physics.add.collider(this.tank, this.invisibleWalls);
    this.physics.add.overlap(
      this.tank,
      this.powerups,
      this.gainPowerup,
      null,
      this
    );
  }

  createInvisibleWalls() {
    this.invisibleWalls = this.physics.add.staticGroup();

    const topWall = this.add.rectangle(0, 0, 280, 16, 0x000000, 0);
    topWall.setOrigin(0, 0);
    this.physics.add.existing(topWall, true);
    this.invisibleWalls.add(topWall);

    const bottomWall = this.add.rectangle(0, 224, 280, 16, 0x000000, 0);
    bottomWall.setOrigin(0, 0);
    this.physics.add.existing(bottomWall, true);
    this.invisibleWalls.add(bottomWall);

    const leftWall = this.add.rectangle(0, 0, 16, 240, 0x000000, 0);
    leftWall.setOrigin(0, 0);
    this.physics.add.existing(leftWall, true);
    this.invisibleWalls.add(leftWall);

    const rightWall = this.add.rectangle(224, 0, 16, 240, 0x000000, 0);
    rightWall.setOrigin(0, 0);
    this.physics.add.existing(rightWall, true);
    this.invisibleWalls.add(rightWall);
  }

  createRightSidebarUI() {
    this.enemyTankIcons = [];
    for (let i = 0; i < 10; i++) {
      const tankIcon = this.add.sprite(
        250,
        20 + i * 8,
        "sprites",
        "right_enemy.png"
      );
      tankIcon.setScale(0.5);
      this.enemyTankIcons.push(tankIcon);
    }

    this.playerText = this.add.text(230, 20, "IP", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#FFFFFF",
    });

    this.playerNumberText = this.add.text(240, 32, "2", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#FFFFFF",
    });

    this.flagIcon = this.add.sprite(230, 50, "sprites", "flag.png");
    this.flagIcon.setScale(0.5);

    this.livesText = this.add.text(240, 60, this.lives.toString(), {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#FFFFFF",
    });

    this.scoreText = this.add.text(230, 80, this.score.toString(), {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#FFFFFF",
    });
  }

  fireBullet() {
    if (this.time.now > this.bulletTime) {
      const bullet = this.bullets.getFirstDead(false);

      if (bullet) {
        this.fx.fire.play();
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setPosition(this.tank.x, this.tank.y);
        bullet.setAngle(this.tank.angle);

        const speed = 300;
        const angle = this.tank.angle;

        if (angle === 90) {
          bullet.setVelocity(speed, 0);
        } else if (angle === 180 || angle === -180) {
          bullet.setVelocity(0, speed);
        } else if (angle === 0) {
          bullet.setVelocity(0, -speed);
        } else {
          bullet.setVelocity(-speed, 0);
        }

        this.bulletTime = this.time.now + 500;

        this.time.delayedCall(3000, () => {
          if (bullet.active) {
            bullet.setActive(false);
            bullet.setVisible(false);
            bullet.setVelocity(0, 0);
          }
        });
      }
    }
  }

  destroyCastle(bullet, castle) {
    if (castle.alive) {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.setVelocity(0, 0);

      const explosion = this.explosions.getFirstDead(false);
      if (explosion) {
        explosion.setActive(true);
        explosion.setVisible(true);
        explosion.setPosition(castle.x + 5, castle.y + 5);
        explosion.play("boom");

        explosion.once("animationcomplete", () => {
          explosion.setActive(false);
          explosion.setVisible(false);
        });
      }

      castle.setFrame("castle_dead.png");
      castle.alive = false;

      this.fx.explosion.once("complete", () => {
        this.fx.background.stop();
        this.scene.start("GameOverScene", {
          score: this.score || 0,
          level: this.currentLevel,
          reason: "GAME OVER",
        });
      });
      this.fx.explosion.play();
    }
  }

  hitBricks(bullet, brick) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    brick.destroy();
    this.fx.brick.play();
    this.addScore(10);

    const explosion = this.explosions.getFirstDead(false);
    if (explosion) {
      explosion.setActive(true);
      explosion.setVisible(true);
      explosion.setPosition(bullet.x, bullet.y);
      explosion.play("impact");

      explosion.once("animationcomplete", () => {
        explosion.setActive(false);
        explosion.setVisible(false);
      });
    }
  }

  hitSteel(bullet, steelBlock) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    if (this.playerWeapon.power > 1) {
      this.fx.brick.play();
      steelBlock.destroy();
      this.addScore(20);
    } else {
      this.fx.steel.play();
      const explosion = this.explosions.getFirstDead(false);
      if (explosion) {
        explosion.setActive(true);
        explosion.setVisible(true);
        explosion.setPosition(bullet.x, bullet.y);
        explosion.play("blip");

        explosion.once("animationcomplete", () => {
          explosion.setActive(false);
          explosion.setVisible(false);
        });
      }
    }
  }

  gainPowerup(tank, powerup) {
    powerup.destroy();
    this.addScore(100);
    this.fx.bonus.play();
  }

  addScore(points) {
    this.score += points;
    this.scoreText.setText(this.score.toString());
  }

  updateEnemyCounter() {
    for (let i = 0; i < this.enemyTankIcons.length; i++) {
      this.enemyTankIcons[i].setVisible(i < this.enemyCount);
    }
  }

  updateLivesDisplay() {
    this.livesText.setText(this.lives.toString());
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.pauseText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "PAUSED\n\nPress P to resume\nPress ESC to return to menu",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#FFFF00",
          align: "center",
        }
      );
      this.pauseText.setOrigin(0.5);
    } else {
      this.physics.resume();
      if (this.pauseText) {
        this.pauseText.destroy();
        this.pauseText = null;
      }
    }
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause();
    }

    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.scene.start("MenuScene");
      return;
    }

    if (this.isPaused) {
      return;
    }

    this.tank.setVelocity(0, 0);

    if (this.fx.moving.isPlaying) {
      this.fx.moving.stop();
    }

    if (this.cursors.up.isDown) {
      this.tank.setAngle(0);
      this.tank.setVelocityY(-100);
      if (!this.fx.moving.isPlaying) {
        this.fx.moving.play();
      }
    } else if (this.cursors.down.isDown) {
      this.tank.setAngle(180);
      this.tank.setVelocityY(100);
      if (!this.fx.moving.isPlaying) {
        this.fx.moving.play();
      }
    } else if (this.cursors.right.isDown) {
      this.tank.setAngle(90);
      this.tank.setVelocityX(100);
      if (!this.fx.moving.isPlaying) {
        this.fx.moving.play();
      }
    } else if (this.cursors.left.isDown) {
      this.tank.setAngle(-90);
      this.tank.setVelocityX(-100);
      if (!this.fx.moving.isPlaying) {
        this.fx.moving.play();
      }
    }

    if (this.fireButton.isDown) {
      this.fireBullet();
    }
  }
}

export default GameScene;
