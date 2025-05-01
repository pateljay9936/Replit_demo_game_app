import React, { useEffect } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/stores/useAudio';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import confetti from 'react-confetti';

interface GameOverProps {
  score: number;
  game: string;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ 
  score, 
  game, 
  onPlayAgain, 
  onReturnToMenu 
}) => {
  const { highScores, updateHighScore, incrementCompletedGames } = useGameContext();
  const { playSuccess } = useAudio();
  const isNewHighScore = (highScores[game] || 0) < score;

  const getGameTitle = (gameId: string): string => {
    const titles: Record<string, string> = {
      'memory': 'Memory Match',
      'math': 'Speed Math',
      'pattern': 'Pattern Recognition',
      'word': 'Word Scramble',
      'reaction': 'Reaction Test'
    };
    return titles[gameId] || 'Brain Training';
  };

  useEffect(() => {
    // Update high score if needed
    updateHighScore(game, score);
    
    // Increment completed games counter
    incrementCompletedGames();
    
    // Play success sound for high scores
    if (isNewHighScore && score > 0) {
      playSuccess();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/20 to-background">
      {isNewHighScore && score > 0 && <confetti />}
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Game Over</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <h3 className="text-lg font-medium mb-2">{getGameTitle(game)}</h3>
          
          <div className="my-6 flex flex-col items-center">
            <p className="text-muted-foreground mb-2">Your score:</p>
            <div className="text-4xl font-bold text-primary mb-2">{score}</div>
            
            {isNewHighScore && score > 0 ? (
              <div className="flex items-center gap-2 text-amber-500 font-bold mt-2">
                <Trophy size={24} />
                <span>New High Score!</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Your best: {highScores[game] || 0}
              </p>
            )}
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Keep training regularly to improve your cognitive skills!</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onReturnToMenu}
          >
            <Home size={18} className="mr-2" />
            Menu
          </Button>
          <Button 
            className="flex-1"
            onClick={onPlayAgain}
          >
            <RotateCcw size={18} className="mr-2" />
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameOver;
