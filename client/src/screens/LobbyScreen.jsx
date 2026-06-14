import React from 'react';

const COLORS = ['#e63946','#457b9d','#2a9d8f','#e9c46a','#f4a261','#264653','#6a4c93','#ff6b6b','#48cae4','#06d6a0'];

export default function LobbyScreen({ players, countdown }) {
  return (
    <div className="flex flex-col h-full px-4 py-6 fade-in">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-mojo-100">MOJO GAMES</h1>
        <p className="text-mojo-400 text-sm">Menunggu pemain lain...</p>
      </div>

      <div className="bg-mojo-800 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
        <span className="text-mojo-300 text-sm">Pemain terhubung</span>
        <span className="text-mojo-100 font-bold text-lg">{players.filter(p => p.connected).length} / 27</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {players.filter(p => p.connected).map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 bg-mojo-800/50 rounded-lg px-3 py-2 fade-in">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
              {p.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-mojo-100 text-sm font-medium truncate">{p.name}</p>
              <p className="text-mojo-500 text-xs">{p.team}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 pulse" />
          </div>
        ))}
      </div>

      {countdown !== null ? (
        <div className="text-center py-4">
          <p className="text-mojo-300 text-sm">Kompetisi dimulai dalam</p>
          <p className="text-6xl font-bold text-mojo-400 countdown-num">{countdown}</p>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-mojo-500 text-sm">
            <span className="w-2 h-2 rounded-full bg-mojo-500 pulse" />
            Menunggu host memulai kompetisi...
          </div>
        </div>
      )}
    </div>
  );
}
