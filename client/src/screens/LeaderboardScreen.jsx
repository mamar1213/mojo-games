import React from 'react';

export default function LeaderboardScreen({ data, currentPlayerId }) {
  const rankings = data?.rankings || [];
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const heights = ['h-24', 'h-32', 'h-16'];
  const colors = ['bg-silver', 'bg-gold', 'bg-bronze'];
  const borders = ['border-silver', 'border-gold', 'border-bronze'];
  const labels = ['2', '1', '3'];

  return (
    <div className="flex flex-col h-full px-4 py-4 fade-in overflow-y-auto">
      <div className="text-center mb-6">
        <p className="text-warning text-sm font-medium">KOMPETISI SELESAI</p>
        <h1 className="text-2xl font-bold text-mojo-100">HASIL AKHIR</h1>
        <p className="text-mojo-400 text-xs mt-1">Mojo Games — KKN Olympic 2026</p>
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-2 mb-6 h-44">
          {podiumOrder.map((p, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const medal = actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉';
            return (
              <div key={p.id} className="flex flex-col items-center" style={{ flex: '0 0 30%' }}>
                <span className="text-2xl mb-1">{medal}</span>
                <p className="text-mojo-100 text-xs font-bold truncate max-w-full text-center">{p.name}</p>
                <p className="text-mojo-400 text-xs">{p.total}</p>
                <div className={`w-full ${heights[i]} mt-2 rounded-t-lg podium-bar`}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    background: actualRank === 1 ? '#FFD700' : actualRank === 2 ? '#C0C0C0' : '#CD7F32'
                  }}>
                  <div className="flex items-center justify-center h-full">
                    <span className="text-mojo-900 font-bold text-2xl">{labels[i]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full rankings table */}
      <div className="bg-mojo-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_3rem_3rem_3rem_3rem_3rem_3.5rem] gap-0 px-3 py-2 bg-mojo-700 text-mojo-400 text-[10px] font-medium">
          <span>#</span><span>Nama</span><span className="text-center">G1</span><span className="text-center">G2</span>
          <span className="text-center">G3</span><span className="text-center">G4</span><span className="text-center">G5</span>
          <span className="text-right">Total</span>
        </div>
        {rankings.map((r) => (
          <div key={r.id}
            className={`grid grid-cols-[2rem_1fr_3rem_3rem_3rem_3rem_3rem_3.5rem] gap-0 px-3 py-2 border-t border-mojo-700 text-xs ${
              r.id === currentPlayerId ? 'bg-mojo-700/50' : ''
            }`}>
            <span className={`font-bold ${r.rank <= 3 ? 'text-warning' : 'text-mojo-400'}`}>{r.rank}</span>
            <span className="text-mojo-100 truncate pr-1">{r.name}</span>
            {r.scores.map((s, i) => (
              <span key={i} className="text-mojo-300 text-center">{s}</span>
            ))}
            <span className="text-mojo-100 font-bold text-right">{r.total}</span>
          </div>
        ))}
      </div>

      <p className="text-mojo-600 text-xs text-center mt-6">KKN NR 11 · UNTAG Surabaya · 2026</p>
    </div>
  );
}
