import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import MainMenu from "./components/MainMenu";
import GameTimer from "./components/GameTimer";
import ScoreDisplay from "./components/ScoreDisplay";
import GameOver from "./components/GameOver";
import Instructions from "./components/Instructions";
import MemoryMatch from "./games/MemoryMatch";
import SpeedMath from "./games/SpeedMath";
import PatternRecognition from "./games/PatternRecognition";
import WordScramble from "./games/WordScramble";
import ReactionTest from "./games/ReactionTest";
import { GameProvider } from "./context/GameContext";
import { useAudio } from "./lib/stores/useAudio";
import { getLocalStorage } from "./lib/utils";
import "@fontsource/inter";
import "./index.css";

const GAME_DURATION = 300; // 5 minutes in seconds

function App() {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game' | 'gameover'>('menu');
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const { setBackgroundMusic, setHitSound, setSuccessSound, toggleMute, isMuted } = useAudio();

  // Load sound effects
  useEffect(() => {
    // Load background music
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    // Load hit sound
    const hit = new Audio('/sounds/hit.mp3');
    setHitSound(hit);

    // Load success sound
    const success = new Audio('/sounds/success.mp3');
    setSuccessSound(success);

    // Start with previous mute setting or muted by default
    const savedMuteState = getLocalStorage('isMuted');
    if (savedMuteState !== null && !savedMuteState) {
      toggleMute(); // If it was previously unmuted, toggle from default muted state
    }
  }, []);

  const startGame = (gameId: string) => {
    setCurrentGame(gameId);
    setTimeRemaining(GAME_DURATION);
    setScore(0);
    setCurrentScreen('game');
  };

  const endGame = () => {
    setCurrentScreen('gameover');
    // Save high score if needed
    const gameKey = `highscore_${currentGame}`;
    const currentHighScore = getLocalStorage(gameKey) || 0;
    if (score > currentHighScore) {
      localStorage.setItem(gameKey, JSON.stringify(score));
    }
  };

  const returnToMenu = () => {
    setCurrentScreen('menu');
    setCurrentGame(null);
  };

  const renderGame = () => {
    switch (currentGame) {
      case 'memory':
        return <MemoryMatch setScore={setScore} />;
      case 'math':
        return <SpeedMath setScore={setScore} />;
      case 'pattern':
        return <PatternRecognition setScore={setScore} />;
      case 'word':
        return <WordScramble setScore={setScore} />;
      case 'reaction':
        return <ReactionTest setScore={setScore} />;
      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <div className="min-h-screen flex flex-col bg-background">
          {currentScreen === 'menu' && (
            <MainMenu onStartGame={startGame} isMuted={isMuted} toggleMute={toggleMute} />
          )}
          
          {currentScreen === 'game' && (
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground">
                <h2 className="text-xl font-bold">{currentGame && getGameTitle(currentGame)}</h2>
                <div className="flex items-center gap-4">
                  <ScoreDisplay score={score} />
                  <GameTimer 
                    timeRemaining={timeRemaining} 
                    setTimeRemaining={setTimeRemaining} 
                    onTimerEnd={endGame} 
                  />
                </div>
              </div>
              
              <div className="flex-1 p-4">
                {renderGame()}
              </div>
            </div>
          )}
          
          {currentScreen === 'gameover' && (
            <GameOver 
              score={score} 
              game={currentGame || ''} 
              onPlayAgain={() => startGame(currentGame || '')} 
              onReturnToMenu={returnToMenu} 
            />
          )}
        </div>
      </GameProvider>
    </QueryClientProvider>
  );
}

function getGameTitle(gameId: string): string {
  const titles: Record<string, string> = {
    'memory': 'Memory Match',
    'math': 'Speed Math',
    'pattern': 'Pattern Recognition',
    'word': 'Word Scramble',
    'reaction': 'Reaction Test'
  };
  return titles[gameId] || 'Brain Training';
}

export default App;
