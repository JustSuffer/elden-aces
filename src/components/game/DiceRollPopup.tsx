import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dices } from "lucide-react";
import { useEffect, useState } from "react";

interface DiceRollPopupProps {
  open: boolean;
  onClose: () => void;
  result: number;
  effect: string;
}

export function DiceRollPopup({ open, onClose, result, effect }: DiceRollPopupProps) {
  const [rolling, setRolling] = useState(true);
  const [displayNumber, setDisplayNumber] = useState(1);

  useEffect(() => {
    if (open) {
      setRolling(true);
      let count = 0;
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 20) + 1);
        count++;
        if (count >= 20) {
          clearInterval(interval);
          setDisplayNumber(result);
          setRolling(false);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [open, result]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Dices className="w-8 h-8 text-primary" />
            Rolling Π Dice...
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-8">
          <div
            className={`w-32 h-32 rounded-2xl border-4 border-primary bg-card flex items-center justify-center ${
              rolling ? "animate-pulse" : ""
            }`}
          >
            <span className="text-6xl font-bold text-primary glow-gold">{displayNumber}</span>
          </div>
          {!rolling && (
            <div className="text-center space-y-2 animate-fade-in">
              <p className="text-lg font-bold text-primary">Rolled: {result}</p>
              <p className="text-sm text-muted-foreground max-w-xs">{effect}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
