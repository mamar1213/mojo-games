import React, { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length < 3) return alert('Nama minimal 3 karakter');
    if (!team.trim()) return alert('Kode kelompok wajib diisi');
    onLogin(name.trim(), team.trim().toUpperCase());
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 fade-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-mojo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-mojo-100">MG</span>
        </div>
        <h1 className="text-2xl font-bold text-mojo-100">MOJO GAMES</h1>
        <p className="text-mojo-400 text-sm mt-1">Mini Olympic KKN 2026</p>
        <p className="text-mojo-500 text-xs mt-1">Kelurahan Mojo 2 · Kecamatan Gubeng · Surabaya</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <div>
          <label className="block text-mojo-300 text-sm mb-1">Nama Lengkap</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Ahmad Rizki" className="w-full px-4 py-3 bg-mojo-800 border border-mojo-600 rounded-xl text-mojo-100 placeholder-mojo-600 focus:outline-none focus:border-mojo-400" maxLength={30} />
        </div>
        <div>
          <label className="block text-mojo-300 text-sm mb-1">Kode Kelompok</label>
          <input type="text" value={team} onChange={e => setTeam(e.target.value)} placeholder="Contoh: KKN-A" className="w-full px-4 py-3 bg-mojo-800 border border-mojo-600 rounded-xl text-mojo-100 placeholder-mojo-600 focus:outline-none focus:border-mojo-400 uppercase" maxLength={10} />
        </div>
        <button onClick={handleSubmit} className="w-full py-3 bg-mojo-500 hover:bg-mojo-400 text-mojo-900 font-bold rounded-xl transition-colors text-lg">
          Bergabung →
        </button>
      </div>

      <p className="text-mojo-600 text-xs mt-8 text-center">KKN NR 11 · UNTAG Surabaya · 2026</p>
    </div>
  );
}
