import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Skull } from "lucide-react";
import { useState, useEffect } from "react";

interface VictoryPopupProps {
  open: boolean;
  isVictory: boolean;
  playerHP: number;
  opponentHP: number;
  onReturnToMenu: () => void;
}

export function VictoryPopup({ open, isVictory, playerHP, opponentHP, onReturnToMenu }: VictoryPopupProps) {
  const reward = isVictory ? 10 : 2;
  const [showExplanation, setShowExplanation] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const explanationSteps = [
    "Calculating base damage from numeric totals...",
    "Applying sequential combo bonuses...",
    "Applying symbol combo bonuses...",
    "Resolving special card effects...",
    "Final damage calculation complete!"
  ];

  useEffect(() => {
    if (open) {
      setShowExplanation(true);
      setCurrentStep(0);
      
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= explanationSteps.length - 1) {
            clearInterval(interval);
            setTimeout(() => setShowExplanation(false), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        {showExplanation ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-primary glow-gold">
                {explanationSteps[currentStep]}
              </p>
              <div className="flex gap-2 justify-center mt-4">
                {explanationSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-3xl flex items-center justify-center gap-3">
                {isVictory ? (
                  <>
                    <Trophy className="w-10 h-10 text-primary" />
                    <span className="text-primary glow-gold">Victory!</span>
                  </>
                ) : (
                  <>
                    <Skull className="w-10 h-10 text-destructive" />
                    <span className="text-destructive">Defeat</span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-6 animate-fade-in">
              <div className="text-center space-y-2">
                <p className="text-lg">
                  Your HP: <span className="font-bold text-theta">{playerHP}</span>
                </p>
                <p className="text-lg">
                  Opponent HP: <span className="font-bold text-omega">{opponentHP}</span>
                </p>
              </div>
              
              <div className="bg-muted/30 border border-border rounded-lg p-4 w-full">
                <p className="text-sm text-center text-muted-foreground mb-2">
                  {isVictory 
                    ? "Your strategic mastery led to victory!" 
                    : "A valiant effort, but defeat teaches valuable lessons."}
                </p>
                <p className="text-center text-sm text-foreground/70">
                  HP Difference: {Math.abs(playerHP - opponentHP)}
                </p>
              </div>

              <div className="bg-card/50 border border-primary/30 rounded-lg p-4 w-full">
                <p className="text-center text-xl font-bold text-primary glow-gold">
                  +{reward} DivineCoin
                </p>
              </div>
              
              <Button
                variant="default"
                size="lg"
                onClick={onReturnToMenu}
                className="w-full"
              >
                Return to Menu
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
