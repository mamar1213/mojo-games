import React, { useState, useEffect, useCallback } from 'react';

const QUESTIONS = [
  { q: 'Kelurahan Mojo 2 berada di kecamatan apa?', o: ['Gubeng', 'Tambaksari', 'Rungkut', 'Wonokromo'], a: 0 },
  { q: 'Berapa RW yang terlibat dalam program KKN NR 11?', o: ['5 RW (9-13)', '3 RW', '7 RW', '4 RW'], a: 0 },
  { q: 'Kepanjangan UMKM adalah?', o: ['Usaha Mikro Kecil Menengah', 'Unit Modal Kerja Masyarakat', 'Usaha Modal Kecil Mandiri', 'Unit Mikro Koperasi Mandiri'], a: 0 },
  { q: 'Framework website Kelurahan Mojo 2 menggunakan?', o: ['Laravel 12', 'CodeIgniter 4', 'WordPress', 'Django'], a: 0 },
  { q: 'Library peta pada website kelurahan?', o: ['Leaflet.js + OpenStreetMap', 'Google Maps API', 'Mapbox GL', 'ArcGIS'], a: 0 },
  { q: 'Universitas penyelenggara KKN NR 11 adalah?', o: ['UNTAG Surabaya', 'UNAIR', 'ITS', 'UBAYA'], a: 0 },
  { q: 'Pilar ekonomi KKN NR 11 berfokus pada?', o: ['Digitalisasi UMKM', 'Pembangunan Jalan', 'Pertanian Organik', 'Program Beasiswa'], a: 0 },
  { q: 'Fitur QR Code pada website berfungsi untuk?', o: ['Akses cepat detail UMKM/Tanaman', 'Login admin', 'Pembayaran digital', 'Scan identitas'], a: 0 },
  { q: 'Database website kelurahan menggunakan?', o: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'], a: 0 },
  { q: 'CSS framework website Kelurahan Mojo 2 adalah?', o: ['Tailwind CSS v4', 'Bootstrap 5', 'Bulma', 'Material UI'], a: 0 },
];

export default function Game5Quiz({ onComplete, onScoreUpdate }) {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timePerQ, setTimePerQ] = useState(15);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const current = QUESTIONS[qIdx];

  useEffect(() => {
    if (gameOver || showAnswer) return;
    const t = setInterval(() => {
      setTimePerQ(prev => {
        if (prev <= 1) { clearInterval(t); handleTimeout(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [qIdx, showAnswer, gameOver]);

  useEffect(() => {
    const totalTimeLeft = (QUESTIONS.length - qIdx) * 15;
    onScoreUpdate({ gameId: 5, score, timeLeft: totalTimeLeft });
  }, [score, qIdx, onScoreUpdate]);

  const handleTimeout = () => {
    setShowAnswer(true);
    setTimeout(nextQuestion, 2000);
  };

  const handleAnswer = (idx) => {
    if (showAnswer || gameOver) return;
    setSelected(idx);
    setShowAnswer(true);
    if (idx === current.a) {
      const points = timePerQ * 10;
      setScore(prev => prev + points);
    }
    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = () => {
    if (qIdx >= QUESTIONS.length - 1) {
      setGameOver(true);
      return;
    }
    setQIdx(prev => prev + 1);
    setSelected(null);
    setShowAnswer(false);
    setTimePerQ(15);
  };

  useEffect(() => {
    if (gameOver) onComplete(5, score);
  }, [gameOver, score, onComplete]);

  const timerPercent = (timePerQ / 15) * 100;

  return (
    <div className="flex flex-col h-full bg-mojo-900 px-4 py-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-mojo-400 text-sm font-medium">Soal {qIdx + 1}/{QUESTIONS.length}</span>
        <span className={`text-lg font-bold ${timePerQ <= 5 ? 'text-danger' : 'text-mojo-100'}`}>{timePerQ}s</span>
      </div>

      <div className="w-full bg-mojo-700 rounded-full h-2 mb-4">
        <div className={`h-2 rounded-full transition-all duration-1000 ${timePerQ <= 5 ? 'bg-danger' : 'bg-mojo-400'}`} style={{ width: `${timerPercent}%` }} />
      </div>

      <div className="bg-mojo-800 rounded-xl p-5 mb-5">
        <p className="text-lg text-mojo-100 font-medium leading-relaxed">{current.q}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 flex-1">
        {current.o.map((opt, i) => {
          let cls = 'bg-mojo-800 border-2 border-mojo-600 text-mojo-100';
          if (showAnswer) {
            if (i === current.a) cls = 'bg-green-800 border-2 border-green-400 text-green-100';
            else if (i === selected && i !== current.a) cls = 'bg-red-900 border-2 border-danger text-red-200';
            else cls = 'bg-mojo-800 border-2 border-mojo-700 text-mojo-500';
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={showAnswer}
              className={`w-full px-4 py-4 rounded-xl text-left text-base font-medium transition-all ${cls} active:scale-[0.98]`}>
              <span className="text-mojo-400 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-4 text-sm text-mojo-400">
        <span>Skor: {score}</span>
        <div className="flex gap-1">
          {Array.from({ length: QUESTIONS.length }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < qIdx ? 'bg-mojo-400' : i === qIdx ? 'bg-warning' : 'bg-mojo-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
