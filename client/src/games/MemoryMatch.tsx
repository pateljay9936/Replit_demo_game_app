import React, { useState, useEffect, useCallback } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAudio } from '@/lib/stores/useAudio';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchProps {
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({ setScore }) => {
  const { difficulty } = useGameContext();
  const { playHit, playSuccess } = useAudio();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Determine grid size based on difficulty and level
  const getGridSize = useCallback(() => {
    const basePairs = 6; // 12 cards (6 pairs) for level 1, easy difficulty
    const difficultyMultiplier = difficulty === 1 ? 0 : difficulty === 2 ? 1 : 2;
    const levelMultiplier = level - 1;
    
    const totalPairs = basePairs + difficultyMultiplier * 2 + levelMultiplier * 2;
    
    // Minimum 4 pairs (8 cards), maximum 12 pairs (24 cards)
    const pairs = Math.min(Math.max(totalPairs, 4), 12);
    
    return pairs;
  }, [difficulty, level]);

  // Set up the cards for the current level
  const setupCards = useCallback(() => {
    const pairs = getGridSize();
    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', 
                    '🐷', '🐸', '🐵', '🦄', '🐙', '🦋', '🦀', '🐠', '🦖', '🦕', '🦒', '🦓'];
    
    // Use only the number of symbols we need for the current level
    const selectedSymbols = symbols.slice(0, pairs);
    
    // Create pairs of cards
    let newCards: MemoryCard[] = [];
    selectedSymbols.forEach((symbol, index) => {
      // Create two cards with the same symbol
      const card1: MemoryCard = {
        id: index * 2,
        symbol,
        isFlipped: false,
        isMatched: false
      };
      
      const card2: MemoryCard = {
        id: index * 2 + 1,
        symbol,
        isFlipped: false,
        isMatched: false
      };
      
      newCards.push(card1, card2);
    });
    
    // Shuffle the cards
    newCards = newCards.sort(() => Math.random() - 0.5);
    
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
  }, [getGridSize]);

  // Initialize game
  useEffect(() => {
    setupCards();
  }, [setupCards, level, difficulty]);

  // Handle card click
  const handleCardClick = (id: number) => {
    // Prevent clicking if already checking cards or if card is already flipped/matched
    if (isChecking) return;
    
    const clickedCard = cards.find(card => card.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;
    
    // Don't allow more than 2 cards to be flipped at once
    if (flippedCards.length === 2) return;
    
    // Play sound effect
    playHit();
    
    // Flip the card
    setCards(cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ));
    
    // Add to flipped cards
    setFlippedCards([...flippedCards, id]);
  };

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      
      // Increment moves
      setMoves(prevMoves => prevMoves + 1);
      
      const [firstCardId, secondCardId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);
      
      if (firstCard?.symbol === secondCard?.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prevCards => prevCards.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true }
              : card
          ));
          
          setMatchedPairs(prevMatched => prevMatched + 1);
          playSuccess();
          
          // Calculate score based on moves and difficulty
          const basePoints = 100;
          const movePenalty = Math.max(0, moves - matchedPairs) * 5;
          const difficultyBonus = difficulty * 10;
          const newPairPoints = basePoints - movePenalty + difficultyBonus;
          
          setScore(prev => prev + newPairPoints);
          
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards => prevCards.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isFlipped: false }
              : card
          ));
          
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [flippedCards, difficulty, playSuccess, setScore, moves, matchedPairs]);

  // Check if level is complete
  useEffect(() => {
    const totalPairs = getGridSize();
    
    if (matchedPairs === totalPairs && matchedPairs > 0) {
      // Level complete
      setTimeout(() => {
        // Level complete bonus
        const levelCompleteBonus = level * difficulty * 50;
        setScore(prev => prev + levelCompleteBonus);
        
        // Move to next level
        setLevel(prevLevel => prevLevel + 1);
      }, 1000);
    }
  }, [matchedPairs, getGridSize, level, difficulty, setScore]);

  // Determine grid column count based on number of cards
  const getGridColumns = () => {
    const totalCards = cards.length;
    if (totalCards <= 8) return 'grid-cols-4'; // 2x4 grid
    if (totalCards <= 16) return 'grid-cols-4'; // 4x4 grid
    return 'grid-cols-6'; // 4x6 grid for 24 cards
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <p className="text-center text-muted-foreground">
          Level {level} • Pairs: {matchedPairs}/{getGridSize()} • Moves: {moves}
        </p>
      </div>
      
      <div className={`grid ${getGridColumns()} gap-2 w-full max-w-2xl mx-auto`}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className="aspect-square"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: card.isFlipped ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleCardClick(card.id)}
          >
            <Card
              className={`w-full h-full flex items-center justify-center cursor-pointer select-none
                ${card.isMatched ? 'bg-green-100 border-green-300' : ''}
                ${card.isFlipped && !card.isMatched ? 'bg-primary/10 border-primary/30' : ''}
              `}
            >
              {card.isFlipped || card.isMatched ? (
                <span className="text-2xl">{card.symbol}</span>
              ) : (
                <span className="text-2xl text-muted-foreground">?</span>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MemoryMatch;
