import React, { useState, useEffect, useCallback } from 'react';
import socket from './socket';
import LoginScreen from './screens/LoginScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import SummaryScreen from './screens/SummaryScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AdminScreen from './screens/AdminScreen';

const SCREENS = { LOGIN: 'LOGIN', LOBBY: 'LOBBY', GAME: 'GAME', SUMMARY: 'SUMMARY', LEADERBOARD: 'LEADERBOARD', ADMIN: 'ADMIN' };

export default function App() {
  const [screen, setScreen] = useState(window.location.pathname === '/admin' ? SCREENS.ADMIN : SCREENS.LOGIN);
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameData, setGameData] = useState({ state: 'LOBBY', currentGame: 0, gameName: '', gameDuration: 0 });
  const [summaryData, setSummaryData] = useState(null);
  const [finalData, setFinalData] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    socket.on('registered', (data) => {
      setPlayer(data);
      setScreen(SCREENS.LOBBY);
    });

    socket.on('player_list', (list) => setPlayers(list));

    socket.on('player_joined', ({ name, total }) => showToast(`${name} bergabung (${total}/27)`));

    socket.on('game_state', (data) => setGameData(data));

    socket.on('countdown_tick', ({ count }) => setCountdown(count));

    socket.on('game_start', (data) => {
      setCountdown(null);
      setGameData(prev => ({ ...prev, ...data }));
      setScreen(SCREENS.GAME);
    });

    socket.on('game_end', () => {});

    socket.on('score_update', (data) => {
      setSummaryData(data);
      if (data.gameId && screen !== SCREENS.GAME) {
        setScreen(SCREENS.SUMMARY);
      }
    });

    socket.on('competition_end', () => {});

    socket.on('final_results', (data) => {
      setFinalData(data);
      setScreen(SCREENS.LEADERBOARD);
    });

    socket.on('admin_reset', () => {
      setScreen(SCREENS.LOGIN);
      setPlayer(null);
      setPlayers([]);
      setGameData({ state: 'LOBBY', currentGame: 0, gameName: '', gameDuration: 0 });
      setSummaryData(null);
      setFinalData(null);
    });

    socket.on('kicked', ({ message }) => {
      alert(message);
      setScreen(SCREENS.LOGIN);
      setPlayer(null);
    });

    socket.on('error_msg', ({ message }) => showToast(message));

    return () => { socket.removeAllListeners(); };
  }, [screen, showToast]);

  const handleGameComplete = useCallback((gameId, score) => {
    socket.emit('submit_score', { gameId, score });
    setScreen(SCREENS.SUMMARY);
  }, []);

  const handleLogin = useCallback((name, team) => {
    socket.connect();
    socket.emit('register', { name, team });
  }, []);

  return (
    <div className="w-full h-full relative">
      {screen === SCREENS.LOGIN && <LoginScreen onLogin={handleLogin} />}
      {screen === SCREENS.LOBBY && <LobbyScreen players={players} gameData={gameData} countdown={countdown} />}
      {screen === SCREENS.GAME && <GameScreen gameId={gameData.currentGame || gameData.gameId} duration={gameData.gameDuration || gameData.duration} gameName={gameData.gameName} onComplete={handleGameComplete} />}
      {screen === SCREENS.SUMMARY && <SummaryScreen data={summaryData} currentPlayerId={player?.playerId} gameData={gameData} countdown={countdown} />}
      {screen === SCREENS.LEADERBOARD && <LeaderboardScreen data={finalData} currentPlayerId={player?.playerId} />}
      {screen === SCREENS.ADMIN && <AdminScreen />}

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-mojo-700 text-mojo-100 px-4 py-2 rounded-lg text-sm z-50 fade-in shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
