import React, { useState, useEffect, useCallback } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, X, RefreshCw, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WordScrambleProps {
  setScore: (score: number) => void;
}

const WordScramble: React.FC<WordScrambleProps> = ({ setScore }) => {
  const { difficulty } = useGameContext();
  const { playHit, playSuccess } = useAudio();
  const [level, setLevel] = useState(1);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [scrambledWord, setScrambledWord] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [skipsUsed, setSkipsUsed] = useState<number>(0);
  const [correctWords, setCorrectWords] = useState<number>(0);
  const [totalWords, setTotalWords] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Word lists by difficulty
  const words = {
    easy: [
      'dog', 'cat', 'run', 'jump', 'play', 'book', 'read', 'pen', 'star', 'moon',
      'sun', 'rain', 'snow', 'tree', 'fish', 'bird', 'duck', 'ball', 'door', 'game',
      'hat', 'car', 'bus', 'ship', 'boat', 'hand', 'foot', 'eye', 'ear', 'nose'
    ],
    medium: [
      'apple', 'banana', 'orange', 'grape', 'lemon', 'melon', 'cherry', 'garden',
      'turtle', 'monkey', 'rabbit', 'panda', 'zebra', 'giraffe', 'elephant', 'lion',
      'tiger', 'window', 'kitchen', 'bedroom', 'school', 'teacher', 'student', 'pencil',
      'eraser', 'paper', 'summer', 'winter', 'spring', 'autumn'
    ],
    hard: [
      'adventure', 'fantastic', 'mysterious', 'beautiful', 'delicious', 'wonderful',
      'education', 'development', 'technology', 'psychology', 'philosophy', 'creativity',
      'imagination', 'astronomy', 'mathematics', 'chemistry', 'information', 'knowledge',
      'experience', 'opportunity', 'celebration', 'excitement', 'achievement', 'discovery',
      'exploration', 'wilderness', 'environment', 'communication', 'understanding', 'friendship'
    ]
  };

  // Get a list of words based on difficulty and level
  const getWordList = useCallback(() => {
    if (difficulty === 1) {
      return level <= 3 ? words.easy : words.medium;
    } else if (difficulty === 2) {
      return level <= 2 ? words.easy : level <= 5 ? words.medium : words.hard;
    } else {
      return level <= 1 ? words.easy : level <= 3 ? words.medium : words.hard;
    }
  }, [difficulty, level]);

  // Scramble a word
  const scrambleWord = (word: string): string => {
    const letterArray = word.split('');
    
    // Keep scrambling until it's different from the original
    let scrambled;
    do {
      scrambled = [...letterArray].sort(() => Math.random() - 0.5).join('');
    } while (scrambled === word);
    
    return scrambled;
  };

  // Get a new word
  const getNewWord = useCallback(() => {
    const wordList = getWordList();
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const word = wordList[randomIndex];
    
    setCurrentWord(word);
    setScrambledWord(scrambleWord(word));
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
    setTotalWords(prev => prev + 1);
  }, [getWordList]);

  // Initialize game
  useEffect(() => {
    getNewWord();
  }, [getNewWord]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAnswer.trim()) return;
    
    const isCorrect = userAnswer.toLowerCase() === currentWord.toLowerCase();
    
    if (isCorrect) {
      playSuccess();
      setFeedback('correct');
      setCorrectWords(prev => prev + 1);
      
      // Calculate score based on word length, difficulty, and level
      const basePoints = currentWord.length * 5;
      const difficultyMultiplier = difficulty;
      const levelBonus = level;
      const hintPenalty = hintsUsed > 0 ? 0.5 : 1; // 50% penalty if hint was used
      
      const points = Math.floor((basePoints + levelBonus) * difficultyMultiplier * hintPenalty);
      setScore(prev => prev + points);
      
      // Level up every few correct words
      if (correctWords > 0 && correctWords % 3 === 0) {
        setLevel(prev => prev + 1);
      }
      
      // Show feedback briefly then get a new word
      setTimeout(() => {
        getNewWord();
      }, 1200);
    } else {
      playHit();
      setFeedback('wrong');
      
      // Clear feedback after a moment
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 1200);
    }
  };

  // Provide a hint (reveal first letter)
  const giveHint = () => {
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
  };

  // Skip the current word
  const skipWord = () => {
    setSkipsUsed(prev => prev + 1);
    getNewWord();
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="w-full mb-4 flex justify-between items-center">
        <Badge variant="outline" className="px-3 py-1">
          Level: {level}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Words: {correctWords}/{totalWords}
        </Badge>
      </div>
      
      <Card className="w-full mb-6">
        <CardContent className="pt-6">
          <h3 className="text-center text-lg font-medium mb-4">
            Unscramble the word
          </h3>
          
          <div className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={scrambledWord}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-center gap-2"
              >
                {scrambledWord.split('').map((letter, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-10 h-10 border-2 border-primary rounded flex items-center justify-center text-lg font-bold"
                  >
                    {letter.toUpperCase()}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {showHint && (
            <div className="text-center mb-4 text-amber-500">
              <p>Hint: The word starts with "<span className="font-bold">{currentWord[0].toUpperCase()}</span>"</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 mb-4">
              <Input 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="text-center"
                autoFocus
                disabled={feedback !== null}
              />
            </div>
            
            <div className="flex justify-center">
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`
                      flex items-center justify-center p-2 rounded-full mb-4
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
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={giveHint}
                disabled={feedback !== null || showHint}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Hint
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={skipWord}
                disabled={feedback !== null}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Skip
              </Button>
              
              <Button 
                type="submit" 
                disabled={feedback !== null || !userAnswer.trim()}
              >
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="flex justify-between w-full text-sm text-muted-foreground">
        <p>Hints used: {hintsUsed}</p>
        <p>Skips used: {skipsUsed}</p>
      </div>
    </div>
  );
};

export default WordScramble;
