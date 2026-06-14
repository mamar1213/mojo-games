import React, { useState, useEffect, useRef, useCallback } from 'react';

const SENTENCES = [
  'Kelurahan Mojo 2 berada di Kecamatan Gubeng Kota Surabaya',
  'UMKM warga RW 9 memproduksi berbagai produk unggulan',
  'Program KKN mendukung digitalisasi usaha mikro masyarakat',
  'Website profil kelurahan memudahkan akses informasi warga',
  'RW 10 memiliki potensi tanaman obat yang sangat beragam',
  'Branding digital membantu UMKM memperluas jangkauan pasar',
  'Pelatihan WhatsApp Business meningkatkan penjualan produk',
  'Foto produk yang baik meningkatkan kepercayaan pembeli',
  'Pendataan UMKM dilakukan di seluruh RW 9 hingga RW 13',
  'Pengabdian masyarakat adalah wujud nyata Tri Dharma kampus',
];

export default function Game2Typing({ duration, onComplete, onScoreUpdate }) {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration || 90);
  const [completed, setCompleted] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime] = useState(Date.now());
  const inputRef = useRef(null);

  const currentSentence = SENTENCES[sentenceIdx] || '';

  const calcScore = useCallback(() => {
    const elapsed = (Date.now() - startTime) / 60000;
    const wpm = elapsed > 0 ? (correctChars / 5) / elapsed : 0;
    const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 100;
    return Math.round(wpm * (accuracy / 100) * 10);
  }, [correctChars, totalTyped, startTime]);

  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setGameOver(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) {
      const score = calcScore();
      onComplete(2, score);
    }
  }, [gameOver, calcScore, onComplete]);

  useEffect(() => {
    onScoreUpdate({ gameId: 2, score: calcScore(), timeLeft });
  }, [timeLeft, correctChars, calcScore, onScoreUpdate]);

  useEffect(() => { inputRef.current?.focus(); }, [sentenceIdx]);

  const handleInput = (e) => {
    if (gameOver) return;
    const val = e.target.value;
    setTyped(val);
    setTotalTyped(prev => prev + 1);

    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === currentSentence[i]) correct++;
    }

    if (val.length === currentSentence.length) {
      setCorrectChars(prev => prev + correct);
      setCompleted(prev => prev + 1);
      setTyped('');
      if (sentenceIdx < SENTENCES.length - 1) {
        setSentenceIdx(prev => prev + 1);
      } else {
        setGameOver(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-mojo-900 px-4 py-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-mojo-400 text-sm">Kalimat {sentenceIdx + 1}/{SENTENCES.length}</span>
        <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-danger' : 'text-mojo-100'}`}>{timeLeft}s</span>
      </div>

      <div className="bg-mojo-800 rounded-xl px-4 py-2 mb-2">
        <div className="w-full bg-mojo-700 rounded-full h-2">
          <div className="bg-mojo-400 h-2 rounded-full transition-all" style={{ width: `${(completed / SENTENCES.length) * 100}%` }} />
        </div>
      </div>

      <div className="bg-mojo-800 rounded-xl p-4 mb-4 flex-shrink-0">
        <p className="text-lg leading-relaxed">
          {currentSentence.split('').map((char, i) => {
            let color = 'text-mojo-300';
            if (i < typed.length) {
              color = typed[i] === char ? 'text-green-400' : 'text-danger';
            } else if (i === typed.length) {
              color = 'text-mojo-100 underline';
            }
            return <span key={i} className={color}>{char}</span>;
          })}
        </p>
      </div>

      <textarea ref={inputRef} value={typed} onChange={handleInput} disabled={gameOver}
        className="w-full flex-1 min-h-[80px] bg-mojo-800 border-2 border-mojo-600 rounded-xl p-4 text-mojo-100 text-lg focus:outline-none focus:border-mojo-400 resize-none"
        placeholder="Ketik di sini..." autoComplete="off" autoCapitalize="off" spellCheck="false" />

      <div className="flex justify-between mt-3 text-sm text-mojo-400">
        <span>Selesai: {completed}</span>
        <span>Skor: {calcScore()}</span>
      </div>
    </div>
  );
}
