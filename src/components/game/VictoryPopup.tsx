import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Coins } from "lucide-react";

interface VictoryPopupProps {
  open: boolean;
  isVictory: boolean;
  playerHP: number;
  opponentHP: number;
  onReturnToMenu: () => void;
}

export function VictoryPopup({ open, isVictory, playerHP, opponentHP, onReturnToMenu }: VictoryPopupProps) {
  const reward = isVictory ? 10 : 2;

  return (
    <Dialog open={open} onOpenChange={onReturnToMenu}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl flex items-center justify-center gap-3">
            <Trophy className={`w-10 h-10 ${isVictory ? "text-phi" : "text-muted-foreground"}`} />
            {isVictory ? "VICTORY!" : "DEFEAT"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="w-full bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 space-y-4">
            <div className="flex justify-between text-lg">
              <span className="text-muted-foreground">Your HP:</span>
              <span className="font-bold text-theta">{playerHP}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-muted-foreground">Opponent HP:</span>
              <span className="font-bold text-omega">{opponentHP}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-primary">Reward:</span>
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-phi" />
                <span className="text-2xl font-bold text-phi glow-gold">+{reward} DivineCoin</span>
              </div>
            </div>
          </div>
          <Button variant="default" size="lg" onClick={onReturnToMenu} className="w-full">
            Return to Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
