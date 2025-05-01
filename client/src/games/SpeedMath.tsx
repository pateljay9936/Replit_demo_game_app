import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeedMathProps {
  setScore: (score: number) => void;
}

type Operation = '+' | '-' | '*' | '/';

interface MathProblem {
  expression: string;
  answer: number;
}

const SpeedMath: React.FC<SpeedMathProps> = ({ setScore }) => {
  const { difficulty } = useGameContext();
  const { playHit, playSuccess } = useAudio();
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [problemCount, setProblemCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a random math problem based on difficulty
  const generateProblem = () => {
    let operations: Operation[] = ['+', '-'];
    let num1Range = 10;
    let num2Range = 10;
    
    // Adjust difficulty
    if (difficulty >= 2) {
      operations.push('*');
      num1Range = 15;
      num2Range = 15;
    }
    
    if (difficulty >= 3) {
      operations.push('/');
      num1Range = 20;
      num2Range = 20;
    }
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    // Generate appropriate numbers based on operation
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * num1Range) + 1;
        num2 = Math.floor(Math.random() * num2Range) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * num1Range) + 1;
        num2 = Math.floor(Math.random() * num2Range) + 1;
        // Ensure num1 >= num2 to avoid negative answers for easier difficulty
        if (difficulty === 1) {
          [num1, num2] = [Math.max(num1, num2), Math.min(num1, num2)];
        }
        answer = num1 - num2;
        break;
      case '*':
        // Smaller numbers for multiplication
        num1 = Math.floor(Math.random() * (difficulty === 2 ? 10 : 12)) + 1;
        num2 = Math.floor(Math.random() * (difficulty === 2 ? 10 : 12)) + 1;
        answer = num1 * num2;
        break;
      case '/':
        // Generate division problems that result in integers
        num2 = Math.floor(Math.random() * 9) + 2; // Divisor between 2-10
        answer = Math.floor(Math.random() * 10) + 1; // Quotient between 1-10
        num1 = num2 * answer; // Dividend that ensures integer division
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }
    
    // Create expression string
    const expression = `${num1} ${operation} ${num2}`;
    
    setCurrentProblem({ expression, answer });
    setUserAnswer('');
    setProblemCount(prev => prev + 1);
    setFeedback(null);
    
    // Focus the input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Initialize with first problem
  useEffect(() => {
    generateProblem();
  }, [difficulty]);

  // Handle answer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProblem || !userAnswer.trim()) return;
    
    const numAnswer = parseFloat(userAnswer);
    const isCorrect = numAnswer === currentProblem.answer;
    
    if (isCorrect) {
      // Correct answer
      playSuccess();
      setFeedback('correct');
      setStreak(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
      
      // Calculate points based on streak and difficulty
      const basePoints = 10;
      const streakBonus = streak; // Points equal to current streak
      const difficultyMultiplier = difficulty;
      
      const points = (basePoints + streakBonus) * difficultyMultiplier;
      setScore(prev => prev + points);
      
      // Show feedback briefly then generate a new problem
      setTimeout(() => {
        generateProblem();
      }, 800);
    } else {
      // Wrong answer
      playHit();
      setFeedback('wrong');
      setStreak(0);
      
      // Show feedback briefly then let the user try again
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        inputRef.current?.focus();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="w-full mb-6 flex justify-between">
        <Badge variant="outline" className="px-3 py-1">
          Problems: {problemCount}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Correct: {correctCount}
        </Badge>
        <Badge variant={streak > 0 ? "default" : "outline"} className="px-3 py-1">
          Streak: {streak}
        </Badge>
      </div>
      
      <Card className="w-full mb-6">
        <CardContent className="pt-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProblem?.expression}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold mb-4"
            >
              {currentProblem?.expression}
            </motion.div>
          </AnimatePresence>
          
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <Input
              ref={inputRef}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="text-center text-xl py-6"
              autoFocus
              aria-label="Answer"
              disabled={feedback !== null}
            />
            
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`
                    flex items-center justify-center p-2 rounded-full
                    ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                  `}
                >
                  {feedback === 'correct' ? (
                    <Check className="h-8 w-8" />
                  ) : (
                    <X className="h-8 w-8" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button 
              type="submit" 
              className="w-full py-6 text-lg"
              disabled={feedback !== null || !userAnswer.trim()}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground text-center">
        <p>Tip: Type your answer and press Enter to submit quickly.</p>
      </div>
    </div>
  );
};

export default SpeedMath;
