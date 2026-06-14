const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const { GameState } = require('./gameState');
const ScoreManager = require('./scoreManager');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const gameState = new GameState();
const scoreManager = new ScoreManager();
const ADMIN_PASSWORD = 'kkn2026';
const MAX_PLAYERS = 27;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', players: scoreManager.getConnectedCount(), state: gameState.getState() });
});

function broadcast(event, data) {
  io.emit(event, data);
}

function stateCallback(event, data) {
  broadcast(event, data);
  if (event === 'game_end') {
    broadcast('score_update', {
      gameId: data.gameId,
      gameRankings: scoreManager.getGameRankings(data.gameId),
      overallRankings: scoreManager.getRankings()
    });
  }
  if (event === 'competition_end') {
    broadcast('final_results', { rankings: scoreManager.getRankings() });
  }
  broadcast('game_state', gameState.getState());
}

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('register', ({ name, team }) => {
    if (scoreManager.getConnectedCount() >= MAX_PLAYERS) {
      socket.emit('error_msg', { message: 'Ruangan penuh (maks 27 pemain)' });
      return;
    }
    if (gameState.getState().state !== 'LOBBY') {
      socket.emit('error_msg', { message: 'Kompetisi sudah dimulai' });
      return;
    }
    scoreManager.addPlayer(socket.id, name, team);
    socket.emit('registered', { playerId: socket.id });
    broadcast('player_list', scoreManager.getPlayerList());
    broadcast('player_joined', { name, team, total: scoreManager.getConnectedCount() });
    broadcast('game_state', gameState.getState());
  });

  socket.on('submit_score', ({ gameId, score }) => {
    const success = scoreManager.submitScore(socket.id, gameId, score);
    if (success) {
      broadcast('score_update', {
        gameId,
        gameRankings: scoreManager.getGameRankings(gameId),
        overallRankings: scoreManager.getRankings()
      });
      if (scoreManager.hasAllSubmitted(gameId)) {
        gameState.endCurrentGame(stateCallback);
      }
    }
  });

  socket.on('admin_auth', ({ password }, cb) => {
    if (password === ADMIN_PASSWORD) {
      socket.join('admin');
      if (cb) cb({ success: true });
    } else {
      if (cb) cb({ success: false, message: 'Password salah' });
    }
  });

  socket.on('admin_start', () => {
    if (!socket.rooms.has('admin')) return;
    gameState.startCompetition(stateCallback);
    broadcast('game_state', gameState.getState());
  });

  socket.on('admin_reset', () => {
    if (!socket.rooms.has('admin')) return;
    gameState.reset();
    scoreManager.reset();
    broadcast('admin_reset', {});
    broadcast('game_state', gameState.getState());
    broadcast('player_list', []);
  });

  socket.on('admin_kick', ({ playerId }) => {
    if (!socket.rooms.has('admin')) return;
    scoreManager.removePlayer(playerId);
    const targetSocket = io.sockets.sockets.get(playerId);
    if (targetSocket) {
      targetSocket.emit('kicked', { message: 'Anda dikeluarkan oleh admin' });
      targetSocket.disconnect(true);
    }
    broadcast('player_list', scoreManager.getPlayerList());
  });

  socket.on('admin_skip', () => {
    if (!socket.rooms.has('admin')) return;
    gameState.forceNextGame(stateCallback);
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    scoreManager.removePlayer(socket.id);
    broadcast('player_list', scoreManager.getPlayerList());
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Mojo Games server running on port ${PORT}`);
});
