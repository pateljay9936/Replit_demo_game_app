import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Trophy } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="flex items-center">
      <Trophy className="mr-1 h-5 w-5" />
      <Badge variant="outline" className="text-lg font-bold px-3 py-1">
        {score}
      </Badge>
    </div>
  );
};

export default ScoreDisplay;
