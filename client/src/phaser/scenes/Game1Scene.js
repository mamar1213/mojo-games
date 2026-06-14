import Phaser from 'phaser';
import EventBus from '../utils/SceneEventBus';

export default class Game1Scene extends Phaser.Scene {
  constructor() { super('Game1Scene'); }

  init(data) {
    this.gameDuration = data.duration || 60;
    this.score = 0;
    this.speed = 300;
    this.gameOver = false;
    this.canDoubleJump = false;
    this.isJumping = false;
    this.elapsed = 0;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#081c15');

    // ground
    const gfx = this.add.graphics();
    gfx.fillStyle(0x2d6a4f, 1); gfx.fillRect(0, 0, 64, 16);
    gfx.generateTexture('ground_tile', 64, 16); gfx.destroy();
    this.ground = this.add.tileSprite(width / 2, height - 30, width, 16, 'ground_tile');
    this.physics.add.existing(this.ground, true);

    // road line
    const rl = this.add.graphics();
    rl.fillStyle(0x40916c, 1); rl.fillRect(0, 0, width, 60);
    rl.fillStyle(0x52b788, 0.3); rl.fillRect(0, 25, width, 2);
    rl.setPosition(0, height - 90);

    // player gerobak
    const pg = this.make.graphics({ x: 0, y: 0, add: false });
    pg.fillStyle(0x8B4513); pg.fillRect(0, 5, 50, 25);
    pg.fillStyle(0xA0522D); pg.fillRect(50, 10, 10, 15);
    pg.fillStyle(0x333333); pg.fillCircle(12, 35, 8); pg.fillCircle(38, 35, 8);
    pg.fillStyle(0x555555); pg.fillCircle(12, 35, 4); pg.fillCircle(38, 35, 4);
    pg.generateTexture('gerobak', 65, 45); pg.destroy();

    this.player = this.physics.add.sprite(80, height - 80, 'gerobak');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);
    this.physics.add.collider(this.player, this.ground, () => {
      this.isJumping = false;
      this.canDoubleJump = false;
    });

    // obstacles group
    this.obstacles = this.physics.add.group();
    this.physics.add.collider(this.obstacles, this.ground);
    this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);

    // obstacle textures
    const ob1 = this.make.graphics({ add: false });
    ob1.fillStyle(0xe63946); ob1.fillRect(0, 0, 30, 40);
    ob1.fillStyle(0xcc3333); ob1.fillRect(5, 5, 20, 10);
    ob1.generateTexture('obstacle_motor', 30, 40); ob1.destroy();

    const ob2 = this.make.graphics({ add: false });
    ob2.fillStyle(0x333333); ob2.fillEllipse(20, 10, 40, 20);
    ob2.generateTexture('obstacle_lubang', 40, 20); ob2.destroy();

    const ob3 = this.make.graphics({ add: false });
    ob3.fillStyle(0x457b9d, 0.6); ob3.fillEllipse(20, 8, 40, 16);
    ob3.generateTexture('obstacle_genangan', 40, 16); ob3.destroy();

    this.obstacleTypes = ['obstacle_motor', 'obstacle_lubang', 'obstacle_genangan'];

    // spawn timer
    this.spawnTimer = this.time.addEvent({ delay: 1800, callback: this.spawnObstacle, callbackScope: this, loop: true });

    // speed increase
    this.time.addEvent({ delay: 10000, callback: () => { this.speed += 50; }, callbackScope: this, loop: true });

    // input
    this.input.on('pointerdown', () => this.jump());
    this.cursors = this.input.keyboard.addKeys({ space: Phaser.Input.Keyboard.KeyCodes.SPACE, up: Phaser.Input.Keyboard.KeyCodes.UP });

    // game timer
    this.timeLeft = this.gameDuration;
    this.time.addEvent({ delay: 1000, callback: () => {
      this.timeLeft--;
      this.elapsed++;
      this.score = Math.round(this.elapsed * (this.speed / 100));
      EventBus.emit('game-score', { gameId: 1, score: this.score, timeLeft: this.timeLeft });
      if (this.timeLeft <= 0) this.endGame();
    }, loop: true });

    // decorative buildings
    for (let i = 0; i < 6; i++) {
      const bh = Phaser.Math.Between(40, 100);
      const bg = this.add.graphics();
      bg.fillStyle(0x1b4332, 0.5);
      bg.fillRect(0, 0, Phaser.Math.Between(30, 60), bh);
      bg.setPosition(i * (width / 5), height - 90 - bh);
    }

    EventBus.emit('game-score', { gameId: 1, score: 0, timeLeft: this.gameDuration });
  }

  jump() {
    if (this.gameOver) return;
    if (!this.isJumping) {
      this.player.setVelocityY(-500);
      this.isJumping = true;
      this.canDoubleJump = true;
    } else if (this.canDoubleJump) {
      this.player.setVelocityY(-450);
      this.canDoubleJump = false;
    }
  }

  spawnObstacle() {
    if (this.gameOver) return;
    const { width, height } = this.scale;
    const type = Phaser.Utils.Array.GetRandom(this.obstacleTypes);
    const obs = this.obstacles.create(width + 50, height - 60, type);
    obs.setVelocityX(-this.speed);
    obs.body.setAllowGravity(false);
    obs.setImmovable(true);
    this.time.delayedCall(8000, () => { if (obs.active) obs.destroy(); });
  }

  hitObstacle() {
    if (this.gameOver) return;
    this.endGame();
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    if (this.spawnTimer) this.spawnTimer.remove();
    this.player.setTint(0xe63946);
    EventBus.emit('game-complete', { gameId: 1, score: this.score });
  }

  update() {
    if (this.gameOver) return;
    if (this.cursors.space.isDown || this.cursors.up.isDown) this.jump();
    if (this.ground) this.ground.tilePositionX += this.speed * 0.016;
  }
}
