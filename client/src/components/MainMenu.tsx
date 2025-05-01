import React, { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Instructions from './Instructions';
import { Volume2, VolumeX, Info, Trophy, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface GameOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface MainMenuProps {
  onStartGame: (gameId: string) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, isMuted, toggleMute }) => {
  const [activeTab, setActiveTab] = useState('games');
  const [showInstructions, setShowInstructions] = useState<string | null>(null);
  const { highScores, difficulty, setDifficulty } = useGameContext();

  const games: GameOption[] = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Test your short-term memory by matching pairs of cards',
      icon: '🧠',
      color: 'bg-blue-500'
    },
    {
      id: 'math',
      title: 'Speed Math',
      description: 'Solve math problems quickly to improve numerical fluency',
      icon: '🔢',
      color: 'bg-green-500'
    },
    {
      id: 'pattern',
      title: 'Pattern Recognition',
      description: 'Identify the correct pattern in a sequence of shapes or colors',
      icon: '🔍',
      color: 'bg-purple-500'
    },
    {
      id: 'word',
      title: 'Word Scramble',
      description: 'Unscramble words to improve vocabulary and language skills',
      icon: '📝',
      color: 'bg-orange-500'
    },
    {
      id: 'reaction',
      title: 'Reaction Test',
      description: 'Test how quickly you can respond to visual stimuli',
      icon: '⚡',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-background">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">BrainBoost</h1>
          <p className="text-lg text-muted-foreground">5-Minute Brain Training Challenges</p>
        </header>

        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue="games" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="highscores">High Scores</TabsTrigger>
              </TabsList>

              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings size={20} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Game Settings</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <h3 className="font-medium mb-2">Difficulty Level</h3>
                      <RadioGroup 
                        value={difficulty.toString()} 
                        onValueChange={(value) => setDifficulty(parseInt(value))}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value="1" id="easy" />
                          <Label htmlFor="easy">Easy</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value="2" id="medium" />
                          <Label htmlFor="medium">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="hard" />
                          <Label htmlFor="hard">Hard</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="games" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.map((game) => (
                <Card key={game.id} className="overflow-hidden border-2 hover:border-primary transition-all">
                  <CardHeader className={`${game.color} text-white`}>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{game.icon}</span>
                        {game.title}
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowInstructions(game.id)}
                        className="text-white hover:bg-white/20"
                      >
                        <Info size={18} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p>{game.description}</p>
                    {highScores[game.id] && (
                      <p className="mt-2 flex items-center text-sm text-muted-foreground">
                        <Trophy size={16} className="mr-1" /> Best: {highScores[game.id]}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-2">
                    <Button 
                      onClick={() => onStartGame(game.id)} 
                      className="w-full"
                    >
                      Play Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="highscores" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your High Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(highScores).length > 0 ? (
                    <ul className="space-y-2">
                      {games.map(game => (
                        <li key={game.id} className="flex justify-between p-2 border-b">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{game.icon}</span>
                            <span>{game.title}</span>
                          </div>
                          <span className="font-bold">
                            {highScores[game.id] || '-'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">
                      No high scores yet. Play some games to see your scores here!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showInstructions && (
        <Dialog open={!!showInstructions} onOpenChange={() => setShowInstructions(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Play</DialogTitle>
            </DialogHeader>
            <Instructions gameId={showInstructions} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MainMenu;
