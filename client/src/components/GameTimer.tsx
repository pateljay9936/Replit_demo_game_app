import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
  onTimerEnd: () => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ 
  timeRemaining, 
  setTimeRemaining, 
  onTimerEnd 
}) => {
  const totalTime = 300; // 5 minutes in seconds
  const progressPercentage = (timeRemaining / totalTime) * 100;
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimerEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [setTimeRemaining, onTimerEnd]);

  // Return different color based on time remaining
  const getTimerColor = (): string => {
    if (timeRemaining < 30) return 'text-destructive';
    if (timeRemaining < 60) return 'text-orange-500';
    return 'text-primary';
  };

  return (
    <div className="flex flex-col items-center gap-1 min-w-[100px]">
      <div className="flex items-center gap-2">
        <Clock size={18} />
        <div className={`font-mono text-lg font-bold ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </div>
      </div>
      <Progress 
        value={progressPercentage} 
        className={`h-2 w-full ${
          timeRemaining < 30 
            ? 'bg-destructive/30' 
            : timeRemaining < 60 
              ? 'bg-orange-200' 
              : 'bg-primary/30'
        }`} 
      />
    </div>
  );
};

export default GameTimer;
