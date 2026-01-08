import { Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NextRoundWaitingPopupProps {
  isOpen: boolean;
  isPlayerReady: boolean;
  isOpponentReady: boolean;
  currentRound: number;
  nextRound: number;
}

export const NextRoundWaitingPopup = ({
  isOpen,
  isPlayerReady,
  isOpponentReady,
  currentRound,
  nextRound,
}: NextRoundWaitingPopupProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center pointer-events-none"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-primary/30 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
        >
          <div className="text-center">
            <ArrowRight className="w-12 h-12 mx-auto text-primary mb-3" />
            <h3 className="text-xl font-bold font-cinzel text-primary mb-2">
              Sonraki Tura Geçiliyor
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Tur {currentRound} → Tur {nextRound}
            </p>

            {/* Ready States */}
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                {isPlayerReady ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                )}
                <span className={`text-sm ${isPlayerReady ? "text-green-500" : "text-muted-foreground"}`}>
                  Sen
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isOpponentReady ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                )}
                <span className={`text-sm ${isOpponentReady ? "text-green-500" : "text-muted-foreground"}`}>
                  Rakip
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground animate-pulse">
              Rakip bekleniyor...
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
