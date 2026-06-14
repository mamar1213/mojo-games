class ScoreManager {
  constructor() {
    this.players = new Map();
  }

  addPlayer(id, name, team) {
    this.players.set(id, {
      id,
      name,
      team,
      scores: [0, 0, 0, 0, 0],
      completedGames: new Set(),
      connected: true
    });
  }

  removePlayer(id) {
    const p = this.players.get(id);
    if (p) p.connected = false;
  }

  reconnectPlayer(id) {
    const p = this.players.get(id);
    if (p) p.connected = true;
  }

  submitScore(playerId, gameId, score) {
    const p = this.players.get(playerId);
    if (!p) return false;
    const idx = gameId - 1;
    if (idx < 0 || idx > 4) return false;
    p.scores[idx] = Math.max(0, Math.round(score));
    p.completedGames.add(gameId);
    return true;
  }

  hasAllSubmitted(gameId) {
    for (const [, p] of this.players) {
      if (p.connected && !p.completedGames.has(gameId)) return false;
    }
    return this.players.size > 0;
  }

  getRankings() {
    const arr = [];
    for (const [, p] of this.players) {
      arr.push({
        id: p.id,
        name: p.name,
        team: p.team,
        scores: [...p.scores],
        total: p.scores.reduce((a, b) => a + b, 0),
        connected: p.connected
      });
    }
    arr.sort((a, b) => b.total - a.total);
    return arr.map((r, i) => ({ ...r, rank: i + 1 }));
  }

  getGameRankings(gameId) {
    const idx = gameId - 1;
    const arr = [];
    for (const [, p] of this.players) {
      arr.push({
        id: p.id,
        name: p.name,
        team: p.team,
        score: p.scores[idx] || 0,
        connected: p.connected
      });
    }
    arr.sort((a, b) => b.score - a.score);
    return arr.map((r, i) => ({ ...r, rank: i + 1 }));
  }

  reset() {
    this.players.clear();
  }

  getConnectedCount() {
    let c = 0;
    for (const [, p] of this.players) {
      if (p.connected) c++;
    }
    return c;
  }

  getPlayerList() {
    const arr = [];
    for (const [, p] of this.players) {
      arr.push({ id: p.id, name: p.name, team: p.team, connected: p.connected });
    }
    return arr;
  }
}

module.exports = ScoreManager;
