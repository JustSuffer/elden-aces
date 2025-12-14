import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { useEffect, useState } from "react";
import { AudioManager } from "@/utils/AudioManager";
import { useLanguage } from "@/hooks/useLanguage";

interface DiceRollPopupProps {
  open: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
  onCancel: () => void;
  result: number;
  effect: string; // Kept for interface compatibility but we'll use localized text
}

export function DiceRollPopup({ open, onClose, onAcknowledge, onCancel, result, effect }: DiceRollPopupProps) {
  const [rolling, setRolling] = useState(true);
  const [displayNumber, setDisplayNumber] = useState(1);
  const [countdown, setCountdown] = useState(5);
  const [showButtons, setShowButtons] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      setRolling(true);
      setShowButtons(false);
      setCountdown(5);

      // Play dice roll sound
      AudioManager.play("dice-roll", 0.8);

      let count = 0;
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 20) + 1);
        count++;
        if (count >= 20) {
          clearInterval(interval);
          setDisplayNumber(result);
          setRolling(false);
          setShowButtons(true);

          // Play result ping sound
          setTimeout(() => AudioManager.play("dice-ping", 1.0), 100);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [open, result]);

  useEffect(() => {
    if (!rolling && showButtons && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && showButtons) {
      handleCancel();
    }
  }, [countdown, rolling, showButtons]);

  const handleAcknowledge = () => {
    onAcknowledge();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  // Determine localized effect based on result range
  const getLocalizedEffect = (res: number) => {
    if (res >= 1 && res <= 5) return t("howToPlay.dice.1_5");
    if (res >= 6 && res <= 10) return t("howToPlay.dice.6_10");
    if (res >= 11 && res <= 15) return t("howToPlay.dice.11_15");
    if (res >= 16 && res <= 18) return t("howToPlay.dice.16_18");
    if (res >= 19 && res <= 20) return t("howToPlay.dice.19_20");
    return effect; // Fallback
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Dices className="w-8 h-8 text-primary" />
            {rolling ? t("game.dice.popup.rolling") : t("game.dice.popup.result")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-8">
          <div
            className={`w-32 h-32 rounded-2xl border-4 border-primary bg-card flex items-center justify-center ${rolling ? "animate-pulse" : ""
              }`}
          >
            <span className="text-6xl font-bold text-primary glow-gold">{displayNumber}</span>
          </div>
          {!rolling && showButtons && (
            <div className="text-center space-y-4 animate-fade-in w-full">
              <p className="text-lg font-bold text-primary">{t("game.dice.popup.rolled", { result })}</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{getLocalizedEffect(result)}</p>

              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={handleAcknowledge}
                  variant="default"
                  size="lg"
                  className="flex-1 max-w-[140px]"
                >
                  {t("game.dice.popup.acknowledge")}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="lg"
                  className="flex-1 max-w-[140px]"
                >
                  {t("game.dice.popup.cancel")}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                {t("game.dice.popup.autoCancel", { seconds: countdown })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
