import Phaser from 'phaser';
import EventBus from '../utils/SceneEventBus';

export default class Game4Scene extends Phaser.Scene {
  constructor() { super('Game4Scene'); }

  init(data) {
    this.gameDuration = data.duration || 60;
    this.timeLeft = this.gameDuration;
    this.score = 0;
    this.combo = 0;
    this.gameOver = false;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#081c15');

    const products = [
      { name: 'Tempe', color: 0x8B6914, good: true },
      { name: 'Krupuk', color: 0xF4A460, good: true },
      { name: 'Kue', color: 0xFF69B4, good: true },
      { name: 'Sambal', color: 0xDC143C, good: true },
      { name: 'Batik', color: 0x4B0082, good: true },
      { name: 'Smph', color: 0x555555, good: false },
      { name: 'Rusak', color: 0x444444, good: false },
    ];

    // generate textures
    products.forEach(p => {
      const g = this.make.graphics({ add: false });
      if (p.good) {
        g.fillStyle(p.color); g.fillCircle(22, 22, 22);
        g.fillStyle(0xffffff, 0.3); g.fillCircle(16, 14, 6);
      } else {
        g.fillStyle(p.color); g.fillCircle(22, 22, 22);
        g.lineStyle(3, 0xe63946); g.lineBetween(10, 10, 34, 34); g.lineBetween(34, 10, 10, 34);
      }
      g.generateTexture(`prod_${p.name}`, 44, 44); g.destroy();
    });

    // basket
    const bg = this.make.graphics({ add: false });
    bg.fillStyle(0x8B4513);
    bg.fillRect(0, 10, 80, 35);
    bg.fillStyle(0xA0522D);
    bg.beginPath(); bg.moveTo(0, 10); bg.lineTo(-5, 0); bg.lineTo(85, 0); bg.lineTo(80, 10); bg.closePath(); bg.fillPath();
    bg.lineStyle(1, 0x654321); for (let i = 10; i < 45; i += 8) bg.lineBetween(0, i, 80, i);
    bg.generateTexture('basket', 86, 46); bg.destroy();

    this.basket = this.physics.add.sprite(width / 2, height - 60, 'basket');
    this.basket.setCollideWorldBounds(true);
    this.basket.body.setAllowGravity(false);
    this.basket.setImmovable(true);

    // item groups
    this.goodItems = this.physics.add.group();
    this.badItems = this.physics.add.group();

    this.physics.add.overlap(this.basket, this.goodItems, (_, item) => {
      this.combo++;
      const mult = this.combo >= 3 ? 2 : 1;
      this.score += 10 * mult;
      this.showFloating(item.x, item.y, `+${10 * mult}`, '#74c69d');
      item.destroy();
    });

    this.physics.add.overlap(this.basket, this.badItems, (_, item) => {
      this.combo = 0;
      this.score = Math.max(0, this.score - 5);
      this.showFloating(item.x, item.y, '-5', '#e63946');
      item.destroy();
      this.cameras.main.shake(100, 0.01);
    });

    // spawn timer
    this.spawnDelay = 800;
    this.spawnTimer = this.time.addEvent({ delay: this.spawnDelay, callback: () => this.spawnItem(products), callbackScope: this, loop: true });

    // speed increase
    this.time.addEvent({ delay: 15000, callback: () => {
      this.spawnDelay = Math.max(400, this.spawnDelay - 100);
      this.spawnTimer.remove();
      this.spawnTimer = this.time.addEvent({ delay: this.spawnDelay, callback: () => this.spawnItem(products), callbackScope: this, loop: true });
    }, callbackScope: this, loop: true });

    // controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.dragStartX = null;
    this.input.on('pointerdown', (p) => { this.dragStartX = p.x; });
    this.input.on('pointermove', (p) => {
      if (this.dragStartX !== null) {
        this.basket.x = Phaser.Math.Clamp(p.x, 43, width - 43);
      }
    });
    this.input.on('pointerup', () => { this.dragStartX = null; });

    // timer
    this.time.addEvent({ delay: 1000, callback: () => {
      if (this.gameOver) return;
      this.timeLeft--;
      EventBus.emit('game-score', { gameId: 4, score: this.score, timeLeft: this.timeLeft, combo: this.combo });
      if (this.timeLeft <= 0) this.endGame();
    }, loop: true });

    // combo text
    this.comboText = this.add.text(width / 2, 60, '', { fontSize: '16px', color: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0);

    EventBus.emit('game-score', { gameId: 4, score: 0, timeLeft: this.gameDuration, combo: 0 });
  }

  spawnItem(products) {
    if (this.gameOver) return;
    const { width } = this.scale;
    const elapsed = this.gameDuration - this.timeLeft;
    const badChance = elapsed > 30 ? 0.5 : 0.3;
    const isGood = Math.random() > badChance;
    const pool = products.filter(p => p.good === isGood);
    const p = Phaser.Utils.Array.GetRandom(pool);
    const x = Phaser.Math.Between(30, width - 30);
    const group = isGood ? this.goodItems : this.badItems;
    const item = group.create(x, -20, `prod_${p.name}`);
    item.body.setAllowGravity(true);
    item.setGravityY(Phaser.Math.Between(100, 250));

    // cleanup off-screen
    this.time.delayedCall(6000, () => { if (item.active) { if (isGood) this.combo = 0; item.destroy(); } });
  }

  showFloating(x, y, text, color) {
    const t = this.add.text(x, y, text, { fontSize: '18px', color, fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    EventBus.emit('game-complete', { gameId: 4, score: this.score });
  }

  update() {
    if (this.gameOver) return;
    const { width } = this.scale;
    const speed = 400;
    if (this.cursors.left.isDown) this.basket.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.basket.setVelocityX(speed);
    else if (this.dragStartX === null) this.basket.setVelocityX(0);

    if (this.combo >= 3) {
      this.comboText.setText(`COMBO ×${this.combo}`).setAlpha(1);
    } else {
      this.comboText.setAlpha(0);
    }
  }
}
