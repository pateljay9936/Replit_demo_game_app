import React, { useState, useEffect, useCallback } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface PatternRecognitionProps {
  setScore: (score: number) => void;
}

type PatternType = 'color' | 'shape' | 'number';
type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star';
type Color = 'red' | 'blue' | 'green' | 'purple' | 'orange';

interface PatternItem {
  shape?: Shape;
  color?: Color;
  number?: number;
  value?: string;
}

const PatternRecognition: React.FC<PatternRecognitionProps> = ({ setScore }) => {
  const { difficulty } = useGameContext();
  const { playHit, playSuccess } = useAudio();
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [options, setOptions] = useState<PatternItem[]>([]);
  const [correctOption, setCorrectOption] = useState<number>(-1);
  const [patternType, setPatternType] = useState<PatternType>('color');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [correct, setCorrect] = useState<number>(0);
  const [questions, setQuestions] = useState<number>(0);

  // Generate shape HTML
  const renderShape = (item: PatternItem) => {
    const size = 50;
    const color = item.color || 'gray';
    
    switch (item.shape) {
      case 'circle':
        return (
          <div 
            className={`bg-${color}-500 rounded-full flex items-center justify-center`}
            style={{ width: size, height: size }}
          >
            {item.number !== undefined && (
              <span className="text-white font-bold">{item.number}</span>
            )}
          </div>
        );
      case 'square':
        return (
          <div 
            className={`bg-${color}-500 flex items-center justify-center`}
            style={{ width: size, height: size }}
          >
            {item.number !== undefined && (
              <span className="text-white font-bold">{item.number}</span>
            )}
          </div>
        );
      case 'triangle':
        return (
          <div className="relative" style={{ width: size, height: size }}>
            <div 
              className={`absolute w-0 h-0 
                border-l-[25px] border-l-transparent
                border-r-[25px] border-r-transparent
                border-b-[50px] border-b-${color}-500
                flex items-center justify-center`}
            >
              {item.number !== undefined && (
                <span className="absolute text-white font-bold" style={{ top: '20px', left: '17px' }}>
                  {item.number}
                </span>
              )}
            </div>
          </div>
        );
      case 'diamond':
        return (
          <div 
            className={`bg-${color}-500 flex items-center justify-center`}
            style={{ 
              width: size, 
              height: size,
              transform: 'rotate(45deg)'
            }}
          >
            {item.number !== undefined && (
              <span className="text-white font-bold" style={{ transform: 'rotate(-45deg)' }}>
                {item.number}
              </span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Create color patterns
  const generateColorPattern = useCallback(() => {
    const colors: Color[] = ['red', 'blue', 'green', 'purple', 'orange'];
    const sequenceLength = Math.min(3 + level, 7);
    
    let sequence: PatternItem[] = [];
    let rule: (i: number) => number;
    
    // Create a rule based on level difficulty
    if (level <= 3) {
      // Simple alternating pattern
      rule = (i) => i % colors.length;
    } else if (level <= 6) {
      // Skip one pattern
      rule = (i) => (i * 2) % colors.length;
    } else {
      // More complex pattern
      rule = (i) => (i * i) % colors.length;
    }
    
    // Generate the sequence
    for (let i = 0; i < sequenceLength; i++) {
      const colorIndex = rule(i);
      sequence.push({ color: colors[colorIndex] });
    }
    
    // Determine the next correct value
    const nextCorrectIndex = rule(sequenceLength);
    const correctColor = colors[nextCorrectIndex];
    
    // Generate options
    const optionItems: PatternItem[] = [];
    const usedColors = new Set<Color>();
    
    // Add the correct option
    optionItems.push({ color: correctColor });
    usedColors.add(correctColor);
    
    // Add incorrect options
    while (optionItems.length < 4) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      if (!usedColors.has(randomColor)) {
        optionItems.push({ color: randomColor });
        usedColors.add(randomColor);
      }
    }
    
    // Shuffle options
    const shuffledOptions = optionItems.sort(() => Math.random() - 0.5);
    const correctOptionIndex = shuffledOptions.findIndex(item => item.color === correctColor);
    
    setPatternType('color');
    setPattern(sequence);
    setOptions(shuffledOptions);
    setCorrectOption(correctOptionIndex);
  }, [level]);

  // Create shape patterns
  const generateShapePattern = useCallback(() => {
    const shapes: Shape[] = ['circle', 'square', 'triangle', 'diamond'];
    const sequenceLength = Math.min(3 + level, 7);
    
    let sequence: PatternItem[] = [];
    let rule: (i: number) => number;
    
    // Create a rule based on level difficulty
    if (level <= 3) {
      // Simple alternating pattern
      rule = (i) => i % shapes.length;
    } else if (level <= 6) {
      // Skip one pattern
      rule = (i) => (i * 2) % shapes.length;
    } else {
      // More complex pattern
      rule = (i) => (i * 3) % shapes.length;
    }
    
    // Generate the sequence
    for (let i = 0; i < sequenceLength; i++) {
      const shapeIndex = rule(i);
      sequence.push({ 
        shape: shapes[shapeIndex],
        color: 'blue' // Use a consistent color for shape patterns
      });
    }
    
    // Determine the next correct value
    const nextCorrectIndex = rule(sequenceLength);
    const correctShape = shapes[nextCorrectIndex];
    
    // Generate options
    const optionItems: PatternItem[] = [];
    const usedShapes = new Set<Shape>();
    
    // Add the correct option
    optionItems.push({ shape: correctShape, color: 'blue' });
    usedShapes.add(correctShape);
    
    // Add incorrect options
    while (optionItems.length < 4) {
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      if (!usedShapes.has(randomShape)) {
        optionItems.push({ shape: randomShape, color: 'blue' });
        usedShapes.add(randomShape);
      }
    }
    
    // Shuffle options
    const shuffledOptions = optionItems.sort(() => Math.random() - 0.5);
    const correctOptionIndex = shuffledOptions.findIndex(item => item.shape === correctShape);
    
    setPatternType('shape');
    setPattern(sequence);
    setOptions(shuffledOptions);
    setCorrectOption(correctOptionIndex);
  }, [level]);

  // Create number patterns
  const generateNumberPattern = useCallback(() => {
    const sequenceLength = Math.min(3 + level, 7);
    let sequence: PatternItem[] = [];
    let rule: (i: number) => number;
    
    // Create a rule based on level difficulty
    if (level <= 3) {
      // Simple +n pattern
      const increment = Math.floor(Math.random() * 3) + 1;
      const start = Math.floor(Math.random() * 5) + 1;
      rule = (i) => start + i * increment;
    } else if (level <= 6) {
      // Square numbers or fibonacci-like
      const useSquare = Math.random() > 0.5;
      if (useSquare) {
        const start = Math.floor(Math.random() * 3) + 1;
        rule = (i) => (i + start) * (i + start);
      } else {
        let a = 1;
        let b = 1;
        const fibValues = [a, b];
        for (let i = 2; i < sequenceLength + 1; i++) {
          const next = a + b;
          fibValues.push(next);
          a = b;
          b = next;
        }
        rule = (i) => fibValues[i];
      }
    } else {
      // Alternating pattern
      const increment1 = Math.floor(Math.random() * 3) + 1;
      const increment2 = Math.floor(Math.random() * 3) + 3;
      const start = Math.floor(Math.random() * 5) + 1;
      rule = (i) => start + (i % 2 === 0 ? i * increment1 : i * increment2);
    }
    
    // Generate the sequence
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push({ value: rule(i).toString() });
    }
    
    // Determine the next correct value
    const correctNumber = rule(sequenceLength);
    
    // Generate options
    const optionItems: PatternItem[] = [];
    const usedNumbers = new Set<number>();
    
    // Add the correct option
    optionItems.push({ value: correctNumber.toString() });
    usedNumbers.add(correctNumber);
    
    // Add incorrect options
    while (optionItems.length < 4) {
      // Generate plausible but incorrect numbers
      let incorrectNumber: number;
      do {
        const offset = Math.floor(Math.random() * 5) + 1;
        incorrectNumber = correctNumber + (Math.random() > 0.5 ? offset : -offset);
        // Ensure positive numbers
        if (incorrectNumber < 1) incorrectNumber = 1;
      } while (usedNumbers.has(incorrectNumber));
      
      optionItems.push({ value: incorrectNumber.toString() });
      usedNumbers.add(incorrectNumber);
    }
    
    // Shuffle options
    const shuffledOptions = optionItems.sort(() => Math.random() - 0.5);
    const correctOptionIndex = shuffledOptions.findIndex(
      item => parseInt(item.value!) === correctNumber
    );
    
    setPatternType('number');
    setPattern(sequence);
    setOptions(shuffledOptions);
    setCorrectOption(correctOptionIndex);
  }, [level]);

  // Generate a new pattern based on difficulty and level
  const generatePattern = useCallback(() => {
    setSelectedOption(null);
    setShowFeedback(false);
    setQuestions(prev => prev + 1);
    
    // Choose pattern type based on difficulty
    const patternTypes: PatternType[] = ['color', 'shape', 'number'];
    let selectedTypes = patternTypes;
    
    // For lower difficulty, use simpler patterns
    if (difficulty === 1) {
      selectedTypes = ['color', 'number'];
    }
    
    const selectedType = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
    
    switch (selectedType) {
      case 'color':
        generateColorPattern();
        break;
      case 'shape':
        generateShapePattern();
        break;
      case 'number':
        generateNumberPattern();
        break;
      default:
        generateColorPattern();
    }
  }, [difficulty, level, generateColorPattern, generateShapePattern, generateNumberPattern]);

  // Initialize
  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  // Handle option selection
  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null || showFeedback) return;
    
    setSelectedOption(index);
    setShowFeedback(true);
    
    const isCorrect = index === correctOption;
    
    if (isCorrect) {
      playSuccess();
      setCorrect(prev => prev + 1);
      
      // Calculate points based on level and difficulty
      const basePoints = 10;
      const levelBonus = level * 2;
      const difficultyMultiplier = difficulty;
      
      const points = (basePoints + levelBonus) * difficultyMultiplier;
      setScore(prev => prev + points);
      
      // Move to next level every few correct answers
      if (correct % 3 === 2) {
        setLevel(prev => prev + 1);
      }
    } else {
      playHit();
    }
    
    // Show feedback, then generate next problem
    setTimeout(() => {
      generatePattern();
    }, 1500);
  };

  // Render pattern item
  const renderPatternItem = (item: PatternItem) => {
    if (patternType === 'color') {
      return (
        <div 
          className={`w-12 h-12 rounded-full bg-${item.color}-500`}
        ></div>
      );
    } else if (patternType === 'shape') {
      return renderShape(item);
    } else {
      return (
        <div className="w-12 h-12 flex items-center justify-center border-2 border-primary rounded">
          <span className="text-xl font-bold">{item.value}</span>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="w-full mb-4 flex justify-between">
        <Badge variant="outline" className="px-3 py-1">
          Level: {level}
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Correct: {correct}/{questions}
        </Badge>
      </div>
      
      <Card className="w-full mb-6">
        <CardContent className="pt-6">
          <h3 className="text-center text-lg font-medium mb-4">
            Identify the pattern and select what comes next
          </h3>
          
          {/* Pattern sequence */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pattern.join('-')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3"
              >
                {pattern.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {renderPatternItem(item)}
                  </motion.div>
                ))}
                <div className="flex items-center justify-center w-12 h-12 border-2 border-dashed border-muted-foreground rounded">
                  <span className="text-xl font-bold">?</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, i) => (
              <Button
                key={i}
                variant={
                  selectedOption === i
                    ? showFeedback
                      ? i === correctOption
                        ? "default"
                        : "destructive"
                      : "default"
                    : showFeedback && i === correctOption
                    ? "default"
                    : "outline"
                }
                className={`p-6 h-auto flex items-center justify-center ${
                  showFeedback && i === correctOption ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => handleOptionSelect(i)}
                disabled={selectedOption !== null || showFeedback}
              >
                {renderPatternItem(option)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternRecognition;
