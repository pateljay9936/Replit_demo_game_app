import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

interface GameContextType {
  highScores: Record<string, number>;
  updateHighScore: (game: string, score: number) => void;
  difficulty: number;
  setDifficulty: (level: number) => void;
  completedGames: number;
  incrementCompletedGames: () => void;
}

const GameContext = createContext<GameContextType>({
  highScores: {},
  updateHighScore: () => {},
  difficulty: 1,
  setDifficulty: () => {},
  completedGames: 0,
  incrementCompletedGames: () => {},
});

export const useGameContext = () => useContext(GameContext);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const [difficulty, setDifficultyState] = useState<number>(1);
  const [completedGames, setCompletedGames] = useState<number>(0);

  // Load saved high scores and settings from localStorage on mount
  useEffect(() => {
    const savedHighScores = getLocalStorage('brainboost_highscores') || {};
    const savedDifficulty = getLocalStorage('brainboost_difficulty') || 1;
    const savedCompletedGames = getLocalStorage('brainboost_completed_games') || 0;
    
    setHighScores(savedHighScores);
    setDifficultyState(savedDifficulty);
    setCompletedGames(savedCompletedGames);
  }, []);

  const updateHighScore = (game: string, score: number) => {
    const currentHighScore = highScores[game] || 0;
    
    if (score > currentHighScore) {
      const newHighScores = { ...highScores, [game]: score };
      setHighScores(newHighScores);
      setLocalStorage('brainboost_highscores', newHighScores);
    }
  };

  const setDifficulty = (level: number) => {
    setDifficultyState(level);
    setLocalStorage('brainboost_difficulty', level);
  };

  const incrementCompletedGames = () => {
    const newCount = completedGames + 1;
    setCompletedGames(newCount);
    setLocalStorage('brainboost_completed_games', newCount);
  };

  return (
    <GameContext.Provider 
      value={{ 
        highScores, 
        updateHighScore, 
        difficulty, 
        setDifficulty,
        completedGames,
        incrementCompletedGames
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
