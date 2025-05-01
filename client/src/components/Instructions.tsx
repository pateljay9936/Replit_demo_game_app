import React from 'react';

interface InstructionsProps {
  gameId: string;
}

const Instructions: React.FC<InstructionsProps> = ({ gameId }) => {
  const instructions: Record<string, { title: string; steps: string[] }> = {
    memory: {
      title: 'Memory Match',
      steps: [
        'A grid of face-down cards will be displayed.',
        'Click on cards to flip them over and reveal their symbols.',
        'Try to find matching pairs of symbols.',
        'When you find a matching pair, they remain face up.',
        'The goal is to find all matching pairs as quickly as possible.',
        'Earn points for each matching pair you find.',
        'The difficulty increases with more cards and symbols as you progress.'
      ]
    },
    math: {
      title: 'Speed Math',
      steps: [
        'Math problems will appear on screen one at a time.',
        'Type your answer using the number keys or on-screen keypad.',
        'Press Enter or click Submit to check your answer.',
        'Answer as many problems correctly as possible before time runs out.',
        'Problems become more difficult as you progress.',
        'Earn points for each correct answer.',
        'Consecutive correct answers give bonus points.'
      ]
    },
    pattern: {
      title: 'Pattern Recognition',
      steps: [
        'A sequence of shapes, colors, or numbers will be shown.',
        'Study the pattern carefully.',
        'Select the item that correctly continues the pattern.',
        'You have limited time to answer each question.',
        'Patterns become more complex as you progress.',
        'Earn points for each correct answer.',
        'Bonus points for quick responses.'
      ]
    },
    word: {
      title: 'Word Scramble',
      steps: [
        'Jumbled letters of a word will appear on screen.',
        'Rearrange the letters to form the correct word.',
        'Type your answer or drag the letters to rearrange them.',
        'Submit your answer to check if it\'s correct.',
        'Words become longer and more complex as you progress.',
        'Earn points for each correctly unscrambled word.',
        'Bonus points for solving quickly.'
      ]
    },
    reaction: {
      title: 'Reaction Test',
      steps: [
        'Wait for the screen to change color or show a specific symbol.',
        'As soon as you see the change, click or tap as quickly as possible.',
        'Your reaction time will be measured in milliseconds.',
        'Be careful not to click before the change occurs (false start).',
        'Multiple rounds will test your average reaction time.',
        'Earn points based on how quickly you react.',
        'The test becomes more challenging with distractions as you progress.'
      ]
    }
  };

  const gameInstructions = instructions[gameId] || {
    title: 'Unknown Game',
    steps: ['Instructions not available for this game.']
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">{gameInstructions.title}</h3>
      <ol className="list-decimal pl-5 space-y-2">
        {gameInstructions.steps.map((step, index) => (
          <li key={index} className="text-sm">{step}</li>
        ))}
      </ol>
      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Each game lasts for 5 minutes. Try to get the highest score possible before time runs out!
        </p>
      </div>
    </div>
  );
};

export default Instructions;
