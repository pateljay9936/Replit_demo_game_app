import { GameID, GameData } from '../types';

// Get game data by ID
export const getGameById = (gameId: GameID): GameData => {
  const gameData: Record<GameID, GameData> = {
    'memory': {
      id: 'memory',
      title: 'Memory Match',
      description: 'Test your short-term memory by matching pairs of cards',
      icon: '🧠',
      color: 'bg-blue-500'
    },
    'math': {
      id: 'math',
      title: 'Speed Math',
      description: 'Solve math problems quickly to improve numerical fluency',
      icon: '🔢',
      color: 'bg-green-500'
    },
    'pattern': {
      id: 'pattern',
      title: 'Pattern Recognition',
      description: 'Identify the correct pattern in a sequence of shapes or colors',
      icon: '🔍',
      color: 'bg-purple-500'
    },
    'word': {
      id: 'word',
      title: 'Word Scramble',
      description: 'Unscramble words to improve vocabulary and language skills',
      icon: '📝',
      color: 'bg-orange-500'
    },
    'reaction': {
      id: 'reaction',
      title: 'Reaction Test',
      description: 'Test how quickly you can respond to visual stimuli',
      icon: '⚡',
      color: 'bg-red-500'
    }
  };
  
  return gameData[gameId];
};

// Format a score for display with commas
export const formatScore = (score: number): string => {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Calculate performance level based on score and game
export const getPerformanceLevel = (gameId: GameID, score: number): string => {
  const thresholds: Record<GameID, number[]> = {
    'memory': [300, 600, 1000, 1500],
    'math': [200, 500, 800, 1200],
    'pattern': [250, 550, 900, 1300],
    'word': [200, 450, 750, 1100],
    'reaction': [300, 650, 950, 1400]
  };
  
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
  
  const gameThresholds = thresholds[gameId];
  let level = 0;
  
  for (let i = 0; i < gameThresholds.length; i++) {
    if (score >= gameThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  return levels[level];
};

// Calculate total time played in minutes
export const calculatePlayTime = (gameCount: number): number => {
  // Each game is 5 minutes
  return gameCount * 5;
};

// Delay a promise for a specified time
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Shuffle an array
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
