import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionTestProps {
  setScore: (score: number) => void;
}

type GameState = 'waiting' | 'ready' | 'go' | 'tooEarly' | 'result';

const ReactionTest: React.FC<ReactionTestProps> = ({ setScore }) => {
  const { difficulty } = useGameContext();
  const { playHit, playSuccess } = useAudio();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [round, setRound] = useState<number>(1);
  const [targetShape, setTargetShape] = useState<string>('circle');
  const [targetColor, setTargetColor] = useState<string>('green');
  const [distractors, setDistractors] = useState<Array<{shape: string, color: string}>>([]);
  
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionTimesRef = useRef<number[]>([]);

  // Start a new reaction test
  const startTest = () => {
    setGameState('ready');
    
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Random delay between 1-4 seconds before showing the target
    const delay = 1000 + Math.random() * 3000;
    
    timerRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      
      // Choose random target shape and color
      const shapes = ['circle', 'square', 'triangle'];
      const colors = ['green', 'blue', 'red', 'purple'];
      
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      setTargetShape(shape);
      setTargetColor(color);
      
      // Add distractors for higher difficulties
      if (difficulty >= 2) {
        const distractorCount = difficulty === 2 ? 1 : 2;
        const newDistractors = [];
        
        for (let i = 0; i < distractorCount; i++) {
          // Ensure distractor is different from target
          let distractorShape, distractorColor;
          do {
            distractorShape = shapes[Math.floor(Math.random() * shapes.length)];
            distractorColor = colors[Math.floor(Math.random() * colors.length)];
          } while (distractorShape === shape && distractorColor === color);
          
          newDistractors.push({
            shape: distractorShape,
            color: distractorColor
          });
        }
        
        setDistractors(newDistractors);
      } else {
        setDistractors([]);
      }
      
      setGameState('go');
    }, delay);
  };

  // Handle click events
  const handleClick = () => {
    // If user clicks too early (before target appears)
    if (gameState === 'ready') {
      playHit();
      setGameState('tooEarly');
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      return;
    }
    
    // If target is showing, calculate reaction time
    if (gameState === 'go' && startTimeRef.current) {
      const endTime = Date.now();
      const time = endTime - startTimeRef.current;
      
      setReactionTime(time);
      reactionTimesRef.current.push(time);
      
      // Update best time
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
      }
      
      // Calculate average time
      const sum = reactionTimesRef.current.reduce((a, b) => a + b, 0);
      const avg = Math.round(sum / reactionTimesRef.current.length);
      setAverageTime(avg);
      
      // Calculate score based on reaction time and difficulty
      const baseScore = Math.max(0, 500 - time);
      const difficultyMultiplier = difficulty;
      const points = Math.floor(baseScore * difficultyMultiplier / 50);
      
      setScore(prevScore => prevScore + points);
      
      // Play sound effect
      if (time < 300) {
        playSuccess(); // Excellent reaction
      } else {
        playHit(); // Good but not excellent
      }
      
      setGameState('result');
    }
  };

  // Continue to next round
  const nextRound = () => {
    setRound(round + 1);
    setReactionTime(null);
    startTest();
  };

  // Restart after clicking too early
  const restartAfterEarly = () => {
    setGameState('waiting');
  };

  // Render the target shape
  const renderShape = (shape: string, color: string, isTarget = true) => {
    const size = isTarget ? 'w-24 h-24' : 'w-16 h-16';
    
    switch (shape) {
      case 'circle':
        return (
          <div className={`${size} rounded-full bg-${color}-500 flex items-center justify-center`}>
            {isTarget && gameState === 'go' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="text-white text-lg font-bold"
              >
                CLICK!
              </motion.div>
            )}
          </div>
        );
      case 'square':
        return (
          <div className={`${size} bg-${color}-500 flex items-center justify-center`}>
            {isTarget && gameState === 'go' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="text-white text-lg font-bold"
              >
                CLICK!
              </motion.div>
            )}
          </div>
        );
      case 'triangle':
        return (
          <div className={`${size} relative`}>
            <div className={`w-0 h-0 
              border-l-[60px] border-l-transparent
              border-r-[60px] border-r-transparent
              border-b-[120px] border-b-${color}-500
              flex items-center justify-center`}>
              {isTarget && gameState === 'go' && (
                <div className="absolute text-white text-lg font-bold" style={{ top: '50px', left: '-25px' }}>
                  CLICK!
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Get reaction time rating
  const getReactionRating = (time: number | null) => {
    if (time === null) return '';
    
    if (time < 200) return 'Lightning Fast!';
    if (time < 300) return 'Excellent!';
    if (time < 400) return 'Great!';
    if (time < 500) return 'Good';
    return 'Keep Practicing';
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="w-full mb-4 flex justify-between">
        <Badge variant="outline" className="px-3 py-1">
          Round: {round}
        </Badge>
        {bestTime && (
          <Badge variant="outline" className="px-3 py-1">
            Best: {bestTime}ms
          </Badge>
        )}
      </div>
      
      <Card className="w-full mb-6">
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {gameState === 'waiting' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <h3 className="text-center text-lg font-medium mb-4">
                  Test Your Reaction Time
                </h3>
                <p className="text-center text-sm text-muted-foreground mb-6">
                  Click when you see the shape appear. Don't click too early!
                </p>
                <Button onClick={startTest} size="lg" className="mb-4">
                  Start Test
                </Button>
                {averageTime && (
                  <p className="text-sm text-muted-foreground">
                    Your average: {averageTime}ms
                  </p>
                )}
              </motion.div>
            )}
            
            {gameState === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
                onClick={handleClick}
              >
                <div className="bg-amber-100 text-amber-800 p-4 rounded-md mb-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Get Ready!</h3>
                  <p>Wait for the shape to appear...</p>
                </div>
                
                <div className="w-32 h-32 border-4 border-dashed border-muted-foreground rounded-full flex items-center justify-center">
                  <Clock className="w-12 h-12 text-muted-foreground" />
                </div>
              </motion.div>
            )}
            
            {gameState === 'go' && (
              <motion.div
                key="go"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
                onClick={handleClick}
              >
                <div className="flex items-center justify-center gap-6">
                  {/* Distractors */}
                  {distractors.map((distractor, index) => (
                    <div key={index} className="opacity-70">
                      {renderShape(distractor.shape, distractor.color, false)}
                    </div>
                  ))}
                  
                  {/* Target */}
                  {renderShape(targetShape, targetColor)}
                </div>
              </motion.div>
            )}
            
            {gameState === 'tooEarly' && (
              <motion.div
                key="tooEarly"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-medium">Too Early!</h3>
                  </div>
                  <p>You clicked before the shape appeared.</p>
                </div>
                
                <Button onClick={restartAfterEarly}>
                  Try Again
                </Button>
              </motion.div>
            )}
            
            {gameState === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Check className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-medium">Your Reaction Time</h3>
                  </div>
                  
                  <div className="text-3xl font-bold mb-2">
                    {reactionTime}ms
                  </div>
                  
                  <p className="font-medium">{getReactionRating(reactionTime)}</p>
                  
                  {bestTime === reactionTime && (
                    <p className="text-sm mt-2">New personal best!</p>
                  )}
                </div>
                
                <Button onClick={nextRound}>
                  Next Round
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground text-center">
        <p>Average human reaction time: 250ms</p>
      </div>
    </div>
  );
};

export default ReactionTest;
