export interface GameScore {
  id: number;
  userId?: number;
  gameId: string;
  score: number;
  createdAt: Date;
}

export type GameID = 'memory' | 'math' | 'pattern' | 'word' | 'reaction';

export interface GameData {
  id: GameID;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export type Difficulty = 1 | 2 | 3;

export interface UserStats {
  totalGamesPlayed: number;
  highScores: Record<string, number>;
  totalScore: number;
  lastPlayed: Date | null;
}
