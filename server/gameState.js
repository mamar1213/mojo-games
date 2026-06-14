const STATES = {
  LOBBY: 'LOBBY',
  COUNTDOWN: 'COUNTDOWN',
  GAME_1: 'GAME_1',
  SUMMARY_1: 'SUMMARY_1',
  GAME_2: 'GAME_2',
  SUMMARY_2: 'SUMMARY_2',
  GAME_3: 'GAME_3',
  SUMMARY_3: 'SUMMARY_3',
  GAME_4: 'GAME_4',
  SUMMARY_4: 'SUMMARY_4',
  GAME_5: 'GAME_5',
  SUMMARY_5: 'SUMMARY_5',
  FINAL: 'FINAL'
};

const GAME_DURATIONS = {
  1: 60,
  2: 90,
  3: 120,
  4: 60,
  5: 160
};

const GAME_NAMES = {
  1: 'Balapan Gerobak UMKM',
  2: 'Ketik Cepat Data Warga',
  3: 'Puzzle Peta RW',
  4: 'Tangkap Produk UMKM',
  5: 'Kuis Pengetahuan KKN'
};

class GameState {
  constructor() {
    this.state = STATES.LOBBY;
    this.currentGame = 0;
    this.timer = null;
    this.onStateChange = null;
  }

  getState() {
    return {
      state: this.state,
      currentGame: this.currentGame,
      gameName: GAME_NAMES[this.currentGame] || '',
      gameDuration: GAME_DURATIONS[this.currentGame] || 0
    };
  }

  getCurrentGameId() {
    return this.currentGame;
  }

  startCompetition(callback) {
    if (this.state !== STATES.LOBBY) return false;
    this.currentGame = 1;
    this._startCountdown(callback);
    return true;
  }

  _startCountdown(callback) {
    this.state = STATES.COUNTDOWN;
    this._notify();
    let count = 3;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      count--;
      if (callback) callback('countdown_tick', { count });
      if (count <= 0) {
        clearInterval(this.timer);
        this.timer = null;
        this._startGame(callback);
      }
    }, 1000);
  }

  _startGame(callback) {
    this.state = `GAME_${this.currentGame}`;
    this._notify();
    if (callback) {
      callback('game_start', {
        gameId: this.currentGame,
        duration: GAME_DURATIONS[this.currentGame],
        gameName: GAME_NAMES[this.currentGame]
      });
    }

    const duration = GAME_DURATIONS[this.currentGame];
    const extraGrace = 30;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.endCurrentGame(callback);
    }, (duration + extraGrace) * 1000);
  }

  endCurrentGame(callback) {
    if (this.timer) {
      clearTimeout(this.timer);
      clearInterval(this.timer);
      this.timer = null;
    }

    this.state = `SUMMARY_${this.currentGame}`;
    this._notify();
    if (callback) {
      callback('game_end', { gameId: this.currentGame });
    }

    setTimeout(() => {
      if (this.currentGame >= 5) {
        this.state = STATES.FINAL;
        this._notify();
        if (callback) callback('competition_end', {});
      } else {
        this.currentGame++;
        this._startCountdown(callback);
      }
    }, 10000);
  }

  forceNextGame(callback) {
    this.endCurrentGame(callback);
  }

  reset() {
    if (this.timer) {
      clearTimeout(this.timer);
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state = STATES.LOBBY;
    this.currentGame = 0;
  }

  _notify() {
    if (this.onStateChange) this.onStateChange(this.getState());
  }
}

module.exports = { GameState, STATES, GAME_DURATIONS, GAME_NAMES };
