import React, { useState, useEffect } from 'react';
import socket from '../socket';

export default function AdminScreen() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState({ state: 'LOBBY', currentGame: 0 });
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    socket.connect();
    socket.on('player_list', setPlayers);
    socket.on('game_state', setGameState);
    socket.on('score_update', (d) => { if (d.overallRankings) setRankings(d.overallRankings); });
    socket.on('final_results', (d) => setRankings(d.rankings));
    socket.on('admin_reset', () => { setPlayers([]); setRankings([]); setGameState({ state: 'LOBBY', currentGame: 0 }); });
    return () => socket.removeAllListeners();
  }, []);

  const handleAuth = () => {
    socket.emit('admin_auth', { password }, (res) => {
      if (res.success) { setAuthed(true); setError(''); }
      else setError(res.message || 'Password salah');
    });
  };

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 fade-in">
        <div className="w-16 h-16 bg-mojo-700 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-xl font-bold text-mojo-100">⚙</span>
        </div>
        <h1 className="text-xl font-bold text-mojo-100 mb-6">Admin Panel</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAuth()}
          placeholder="Password admin" className="w-full max-w-xs px-4 py-3 bg-mojo-800 border border-mojo-600 rounded-xl text-mojo-100 placeholder-mojo-600 focus:outline-none focus:border-mojo-400 mb-3" />
        {error && <p className="text-danger text-sm mb-3">{error}</p>}
        <button onClick={handleAuth} className="w-full max-w-xs py-3 bg-mojo-500 text-mojo-900 font-bold rounded-xl">Masuk</button>
      </div>
    );
  }

  const connected = players.filter(p => p.connected);

  return (
    <div className="flex flex-col h-full px-4 py-4 overflow-y-auto fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-mojo-100">Admin Panel</h1>
        <span className="bg-mojo-700 text-mojo-300 px-3 py-1 rounded-full text-xs">{gameState.state}</span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button onClick={() => socket.emit('admin_start')}
          disabled={gameState.state !== 'LOBBY'}
          className="py-3 bg-green-700 text-white font-bold rounded-xl disabled:opacity-30">
          Mulai
        </button>
        <button onClick={() => { if (confirm('Reset semua?')) socket.emit('admin_reset'); }}
          className="py-3 bg-danger text-white font-bold rounded-xl">
          Reset
        </button>
        <button onClick={() => socket.emit('admin_skip')}
          disabled={!gameState.state.startsWith('GAME')}
          className="py-3 bg-warning text-mojo-900 font-bold rounded-xl disabled:opacity-30 col-span-2">
          Skip Game →
        </button>
      </div>

      {/* Status */}
      <div className="bg-mojo-800 rounded-xl p-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-mojo-400">Pemain</span>
          <span className="text-mojo-100 font-bold">{connected.length}/27</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-mojo-400">Game</span>
          <span className="text-mojo-100 font-bold">{gameState.currentGame || '-'}/5</span>
        </div>
      </div>

      {/* Player list */}
      <div className="bg-mojo-800 rounded-xl p-3 mb-4">
        <p className="text-mojo-400 text-xs mb-2 font-medium">PEMAIN ({connected.length})</p>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-2 text-sm py-1">
              <span className={`w-2 h-2 rounded-full ${p.connected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="flex-1 text-mojo-100 truncate">{p.name}</span>
              <span className="text-mojo-500 text-xs">{p.team}</span>
              <button onClick={() => socket.emit('admin_kick', { playerId: p.id })}
                className="text-danger text-xs hover:underline">Kick</button>
            </div>
          ))}
        </div>
      </div>

      {/* Live scores */}
      {rankings.length > 0 && (
        <div className="bg-mojo-800 rounded-xl p-3">
          <p className="text-mojo-400 text-xs mb-2 font-medium">SKOR LIVE</p>
          {rankings.slice(0, 10).map(r => (
            <div key={r.id} className="flex items-center gap-2 text-sm py-1">
              <span className="text-mojo-400 w-5">{r.rank}</span>
              <span className="flex-1 text-mojo-100 truncate">{r.name}</span>
              <span className="text-mojo-100 font-bold">{r.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
