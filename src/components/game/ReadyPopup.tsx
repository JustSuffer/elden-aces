import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReadyPopupProps {
  isOpen: boolean;
  isPlayerReady: boolean;
  isOpponentReady: boolean;
  playerClass: string;
  opponentClass: string;
  onReady: () => void;
}

export const ReadyPopup = ({
  isOpen,
  isPlayerReady,
  isOpponentReady,
  playerClass,
  opponentClass,
  onReady,
}: ReadyPopupProps) => {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Start countdown when both are ready
  useEffect(() => {
    if (isPlayerReady && isOpponentReady) {
      setCountdown(3);
    }
  }, [isPlayerReady, isOpponentReady]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card border-2 border-primary/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-3xl font-bold font-cinzel text-primary mb-2">
              Maç Bulundu!
            </h2>
            <p className="text-muted-foreground mb-6">
              {playerClass} vs {opponentClass}
            </p>

            {/* Ready States */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg border-2 transition-all ${
                isPlayerReady 
                  ? "border-green-500 bg-green-500/10" 
                  : "border-border bg-muted/50"
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isPlayerReady ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  )}
                  <span className="font-semibold">{t("game.damage.you")}</span>
                </div>
                <span className={`text-sm ${isPlayerReady ? "text-green-500" : "text-muted-foreground"}`}>
                  {isPlayerReady ? "Hazır!" : "Bekleniyor..."}
                </span>
              </div>

              <div className={`p-4 rounded-lg border-2 transition-all ${
                isOpponentReady 
                  ? "border-green-500 bg-green-500/10" 
                  : "border-border bg-muted/50"
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isOpponentReady ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  )}
                  <span className="font-semibold">{t("game.damage.opponent")}</span>
                </div>
                <span className={`text-sm ${isOpponentReady ? "text-green-500" : "text-muted-foreground"}`}>
                  {isOpponentReady ? "Hazır!" : "Bekleniyor..."}
                </span>
              </div>
            </div>

            {/* Countdown or Ready Button */}
            {countdown !== null && countdown > 0 ? (
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-primary mb-4"
              >
                {countdown}
              </motion.div>
            ) : countdown === 0 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold text-green-500 mb-4"
              >
                BAŞLIYOR!
              </motion.div>
            ) : (
              <Button
                size="lg"
                onClick={onReady}
                disabled={isPlayerReady}
                className="w-full text-lg py-6"
              >
                {isPlayerReady ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Rakip Bekleniyor...
                  </>
                ) : (
                  "Hazırım!"
                )}
              </Button>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              Her iki oyuncu da hazır butonuna basmalıdır
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
