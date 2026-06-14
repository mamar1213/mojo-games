import Phaser from 'phaser';
import EventBus from '../utils/SceneEventBus';

export default class Game3Scene extends Phaser.Scene {
  constructor() { super('Game3Scene'); }

  init(data) {
    this.gameDuration = data.duration || 120;
    this.timeLeft = this.gameDuration;
    this.moves = 0;
    this.gameOver = false;
    this.elapsed = 0;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#081c15');
    const gridSize = Math.min(width - 40, height - 160);
    const cellSize = Math.floor(gridSize / 3);
    const offsetX = (width - cellSize * 3) / 2;
    const offsetY = (height - cellSize * 3) / 2 + 20;

    const rwColors = [0x2d6a4f, 0x40916c, 0x52b788, 0x74c69d, 0x95d5b2, 0x1b4332, 0x3a5a40, 0x588157, 0x081c15];
    const rwLabels = ['RW 9', 'RW 10', 'RW 11', 'RW 12', 'RW 13', 'Balai', 'Masjid', 'UMKM', ''];

    // generate puzzle pieces
    this.cells = [];
    this.emptyIdx = 8;
    const order = [0,1,2,3,4,5,6,7,8];

    // shuffle (ensure solvable)
    let shuffled;
    do { shuffled = this.shuffle([...order]); } while (!this.isSolvable(shuffled) || this.isSolved(shuffled));

    for (let i = 0; i < 9; i++) {
      const val = shuffled[i];
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = offsetX + col * cellSize + cellSize / 2;
      const y = offsetY + row * cellSize + cellSize / 2;

      if (val === 8) {
        this.emptyIdx = i;
        this.cells.push({ val, container: null, row, col });
        continue;
      }

      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(rwColors[val], 1);
      bg.fillRoundedRect(-cellSize/2 + 3, -cellSize/2 + 3, cellSize - 6, cellSize - 6, 8);
      bg.lineStyle(2, 0xd8f3dc, 0.3);
      bg.strokeRoundedRect(-cellSize/2 + 3, -cellSize/2 + 3, cellSize - 6, cellSize - 6, 8);
      container.add(bg);

      const label = this.add.text(0, 0, rwLabels[val], {
        fontSize: cellSize > 90 ? '18px' : '14px', fontFamily: 'system-ui', color: '#d8f3dc', fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(label);

      const num = this.add.text(0, cellSize/2 - 18, `${val + 1}`, {
        fontSize: '11px', fontFamily: 'system-ui', color: '#95d5b2'
      }).setOrigin(0.5);
      container.add(num);

      container.setSize(cellSize, cellSize);
      container.setInteractive();
      container.on('pointerdown', () => this.tryMove(i));

      this.cells.push({ val, container, row, col });
    }

    this.cellSize = cellSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    // grid border
    const border = this.add.graphics();
    border.lineStyle(3, 0x74c69d, 0.5);
    border.strokeRoundedRect(offsetX - 2, offsetY - 2, cellSize * 3 + 4, cellSize * 3 + 4, 10);

    // timer
    this.time.addEvent({ delay: 1000, callback: () => {
      if (this.gameOver) return;
      this.timeLeft--;
      this.elapsed++;
      const score = this.calcScore();
      EventBus.emit('game-score', { gameId: 3, score, timeLeft: this.timeLeft });
      if (this.timeLeft <= 0) this.endGame();
    }, loop: true });

    EventBus.emit('game-score', { gameId: 3, score: 0, timeLeft: this.gameDuration });
  }

  tryMove(idx) {
    if (this.gameOver) return;
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const eRow = Math.floor(this.emptyIdx / 3);
    const eCol = this.emptyIdx % 3;

    const adjacent = (Math.abs(row - eRow) + Math.abs(col - eCol)) === 1;
    if (!adjacent) return;

    this.moves++;
    const cell = this.cells[idx];
    const emptyCell = this.cells[this.emptyIdx];

    // swap
    [this.cells[idx], this.cells[this.emptyIdx]] = [this.cells[this.emptyIdx], this.cells[idx]];
    this.emptyIdx = idx;

    // animate
    if (cell.container) {
      const targetX = this.offsetX + eCol * this.cellSize + this.cellSize / 2;
      const targetY = this.offsetY + eRow * this.cellSize + this.cellSize / 2;
      this.tweens.add({ targets: cell.container, x: targetX, y: targetY, duration: 150, ease: 'Power2' });
    }

    // check win
    if (this.isSolved(this.cells.map(c => c.val))) {
      this.time.delayedCall(200, () => this.winGame());
    }

    EventBus.emit('game-score', { gameId: 3, score: this.calcScore(), timeLeft: this.timeLeft });
  }

  calcScore() {
    return Math.max(100, 10000 - (this.moves * 10) - (this.elapsed * 50));
  }

  winGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.cells.forEach(c => { if (c.container) this.tweens.add({ targets: c.container, scale: 1.05, yoyo: true, duration: 200 }); });
    const txt = this.add.text(this.scale.width/2, 50, 'SELESAI!', { fontSize: '32px', color: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: txt, scale: 1.3, yoyo: true, repeat: 2, duration: 300 });
    EventBus.emit('game-complete', { gameId: 3, score: this.calcScore() });
  }

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    EventBus.emit('game-complete', { gameId: 3, score: this.calcScore() });
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  isSolvable(arr) {
    let inv = 0;
    const filtered = arr.filter(v => v !== 8);
    for (let i = 0; i < filtered.length; i++) {
      for (let j = i + 1; j < filtered.length; j++) {
        if (filtered[i] > filtered[j]) inv++;
      }
    }
    return inv % 2 === 0;
  }

  isSolved(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== i) return false;
    }
    return true;
  }
}
