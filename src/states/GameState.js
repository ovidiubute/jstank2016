import getSprites from "../levels/parser";
import constants from "../common/const";

class GameState extends Phaser.State {
  init() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
  }

  preload() {
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
      "steel"
    ]) {
      this.game.load.audio(soundKey, "assets/sounds/" + soundKey + ".ogg");
    }
  }

  create() {
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
      moving: this.game.add.audio("moving", 1, true)
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

    // World bounds
    this.leftWorldBounds = this.game.add.sprite(0, 0, null);
    this.game.physics.arcade.enable(this.leftWorldBounds);
    this.leftWorldBounds.immovable = true;
    this.leftWorldBounds.body.setSize(16, 224);

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
    var levelData = this.game.cache.getText("level_1");
    var sprites = getSprites(levelData, this.game);
    sprites.forEach(sprite => {
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
      power: 1
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
      });
      console.log("Game Over");
    }
  }

  hitBricks(bullet, brick) {
    bullet.kill();
    brick.kill();
    this.fx.brick.play();
    var explosion = this.explosions.getFirstExists(false);
    explosion.reset(bullet.x, bullet.y);
    explosion.animations.play("impact", 60, false, true);
  }

  hitSteel(bullet, steelBlock) {
    bullet.kill();
    if (this.playerWeapon.power > 1) {
      this.fx.brick.play();
      steelBlock.kill();
    } else {
      this.fx.steel.play();
      var explosion = this.explosions.getFirstExists(false);
      explosion.reset(bullet.x, bullet.y);
      explosion.animations.play("blip", 60, false, true);
    }
  }

  hitWorldEdge(bullet) {
    bullet.kill();

    this.fx.steel.play();
    var explosion = this.explosions.getFirstExists(false);
    explosion.reset(bullet.x, bullet.y);
    explosion.animations.play("blip", 60, false, true);
    this.fx.steel.stop();
  }

  gainPowerup(_, powerup) {
    powerup.kill();

    // Handle bonus logic

    this.fx.bonus.play();
  }

  update() {
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
    this.game.physics.arcade.overlap(
      this.tank,
      this.powerups,
      this.gainPowerup,
      null,
      this
    );
    this.game.physics.arcade.collide(this.tank, this.leftWorldBounds);
    this.game.physics.arcade.overlap(
      this.bullets,
      this.leftWorldBounds,
      this.hitWorldEdge,
      null,
      this
    );
  }
}

export default GameState;
