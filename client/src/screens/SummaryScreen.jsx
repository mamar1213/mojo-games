import React from 'react';

const GAME_NAMES = { 1: 'Balapan Gerobak', 2: 'Ketik Cepat', 3: 'Puzzle Peta', 4: 'Tangkap Produk', 5: 'Kuis KKN' };

export default function SummaryScreen({ data, currentPlayerId, gameData, countdown }) {
  const gameId = data?.gameId || 0;
  const rankings = data?.gameRankings || [];
  const overall = data?.overallRankings || [];

  return (
    <div className="flex flex-col h-full px-4 py-4 fade-in overflow-y-auto">
      <div className="text-center mb-4">
        <p className="text-mojo-400 text-sm">GAME {gameId}/5 SELESAI</p>
        <h2 className="text-xl font-bold text-mojo-100">{GAME_NAMES[gameId]}</h2>
      </div>

      {/* Current game top 3 */}
      <div className="bg-mojo-800 rounded-xl p-4 mb-4">
        <p className="text-mojo-400 text-xs mb-3 font-medium">PERINGKAT GAME {gameId}</p>
        {rankings.slice(0, 5).map((r, i) => (
          <div key={r.id} className={`flex items-center gap-3 py-2 ${r.id === currentPlayerId ? 'bg-mojo-700/50 -mx-2 px-2 rounded-lg' : ''}`}>
            <span className={`w-6 text-center font-bold ${i === 0 ? 'text-gold' : i === 1 ? 'text-silver' : i === 2 ? 'text-bronze' : 'text-mojo-400'}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
            </span>
            <span className="flex-1 text-mojo-100 text-sm truncate">{r.name}</span>
            <span className="text-mojo-300 text-xs">{r.team}</span>
            <span className="text-mojo-100 font-bold text-sm w-16 text-right">{r.score}</span>
          </div>
        ))}
      </div>

      {/* Overall standings */}
      <div className="bg-mojo-800 rounded-xl p-4 mb-4">
        <p className="text-mojo-400 text-xs mb-3 font-medium">KLASEMEN SEMENTARA</p>
        {overall.slice(0, 5).map((r, i) => (
          <div key={r.id} className={`flex items-center gap-3 py-2 ${r.id === currentPlayerId ? 'bg-mojo-700/50 -mx-2 px-2 rounded-lg' : ''}`}>
            <span className={`w-6 text-center font-bold ${i === 0 ? 'text-gold' : i === 1 ? 'text-silver' : i === 2 ? 'text-bronze' : 'text-mojo-400'}`}>
              {r.rank}
            </span>
            <span className="flex-1 text-mojo-100 text-sm truncate">{r.name}</span>
            <span className="text-mojo-100 font-bold text-sm">{r.total}</span>
          </div>
        ))}
      </div>

      {/* Countdown to next game */}
      {gameId < 5 && (
        <div className="text-center py-3">
          <p className="text-mojo-400 text-sm">Game berikutnya dimulai dalam</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-mojo-400 pulse" />
            <span className="text-mojo-100 text-sm">Menunggu...</span>
          </div>
        </div>
      )}
    </div>
  );
}
