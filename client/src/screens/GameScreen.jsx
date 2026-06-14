import React, { useState, useEffect, useCallback } from 'react';
import PhaserGame from '../phaser/PhaserGame';
import Game1Scene from '../phaser/scenes/Game1Scene';
import Game3Scene from '../phaser/scenes/Game3Scene';
import Game4Scene from '../phaser/scenes/Game4Scene';
import Game2Typing from '../phaser/scenes/Game2Typing';
import Game5Quiz from '../phaser/scenes/Game5Quiz';
import EventBus from '../phaser/utils/SceneEventBus';

const GAME_NAMES = {
  1: 'Balapan Gerobak UMKM',
  2: 'Ketik Cepat Data Warga',
  3: 'Puzzle Peta RW',
  4: 'Tangkap Produk UMKM',
  5: 'Kuis Pengetahuan KKN',
};

const PHASER_SCENES = { 1: Game1Scene, 3: Game3Scene, 4: Game4Scene };
const GAME_DURATIONS = { 1: 60, 2: 90, 3: 120, 4: 60, 5: 160 };

export default function GameScreen({ gameId, duration, gameName, onComplete }) {
  const [scoreData, setScoreData] = useState({ score: 0, timeLeft: duration || GAME_DURATIONS[gameId] || 60, combo: 0 });
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);

  // countdown before game starts
  useEffect(() => {
    if (countdown <= 0) { setStarted(true); return; }
    const t = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // listen to Phaser events
  useEffect(() => {
    const onScore = (data) => setScoreData(data);
    const onComplete2 = (data) => onComplete(data.gameId, data.score);
    EventBus.on('game-score', onScore);
    EventBus.on('game-complete', onComplete2);
    return () => {
      EventBus.off('game-score', onScore);
      EventBus.off('game-complete', onComplete2);
    };
  }, [onComplete]);

  const handleReactScoreUpdate = useCallback((data) => setScoreData(data), []);
  const handleReactComplete = useCallback((gId, score) => onComplete(gId, score), [onComplete]);

  const isPhaser = !!PHASER_SCENES[gameId];
  const sceneDuration = duration || GAME_DURATIONS[gameId] || 60;

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2 flex justify-between items-center bg-gradient-to-b from-mojo-900/90 to-transparent pointer-events-none">
        <div>
          <p className="text-mojo-400 text-xs font-medium">GAME {gameId}/5</p>
          <p className="text-mojo-100 text-sm font-bold">{GAME_NAMES[gameId]}</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${scoreData.timeLeft <= 10 ? 'text-danger' : 'text-mojo-100'}`}>
            {scoreData.timeLeft}s
          </p>
          <p className="text-mojo-400 text-xs">Skor: <span className="text-mojo-100 font-bold">{scoreData.score}</span></p>
        </div>
      </div>

      {/* Combo display */}
      {scoreData.combo >= 3 && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 bg-warning/20 text-warning px-3 py-1 rounded-full text-sm font-bold pointer-events-none">
          COMBO ×{scoreData.combo}
        </div>
      )}

      {/* Timer bar */}
      <div className="absolute top-0 left-0 right-0 z-20 h-1">
        <div className={`h-full transition-all duration-1000 ${scoreData.timeLeft <= 10 ? 'bg-danger' : 'bg-mojo-400'}`}
          style={{ width: `${(scoreData.timeLeft / sceneDuration) * 100}%` }} />
      </div>

      {/* Countdown overlay */}
      {!started && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-mojo-900/95">
          <p className="text-mojo-400 text-lg mb-4">{GAME_NAMES[gameId]}</p>
          {countdown > 0 ? (
            <span key={countdown} className="text-7xl font-bold text-mojo-400 countdown-num">{countdown}</span>
          ) : (
            <span className="text-5xl font-bold text-warning countdown-num">MULAI!</span>
          )}
        </div>
      )}

      {/* Game content */}
      {started && (
        <div className="flex-1 w-full pt-12">
          {isPhaser ? (
            <PhaserGame sceneClass={PHASER_SCENES[gameId]} sceneData={{ duration: sceneDuration }} />
          ) : gameId === 2 ? (
            <Game2Typing duration={sceneDuration} onComplete={handleReactComplete} onScoreUpdate={handleReactScoreUpdate} />
          ) : gameId === 5 ? (
            <Game5Quiz onComplete={handleReactComplete} onScoreUpdate={handleReactScoreUpdate} />
          ) : null}
        </div>
      )}
    </div>
  );
}
