
import { Button } from "@/components/ui/button";
import { Trophy, Skull, Coins, Swords, Shield, Crown, Sparkles, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

interface VictoryPopupProps {
  open: boolean;
  outcome: "win" | "loss" | "draw";
  playerHP: number;
  opponentHP: number;
  winReason?: string;
  damageDetails?: string[];
  onReturnToMenu: () => void;
  delayMs?: number;
  isOnline?: boolean;
}

export function VictoryPopup({
  open,
  outcome,
  playerHP,
  opponentHP,
  winReason,
  damageDetails,
  onReturnToMenu,
  delayMs = 0,
  isOnline = false
}: VictoryPopupProps) {
  const { t, language } = useLanguage();
  
  let reward = 0;
  if (winReason === "SURRENDER") {
      reward = 0;
  } else if (outcome === "win") {
      reward = isOnline ? 100 : 50;
  } else if (outcome === "loss") {
      reward = isOnline ? 25 : 10;
  } else {
      // Draw
      reward = isOnline ? 10 : 5; // Assuming small reward for draw
  }

  const [showPopup, setShowPopup] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const hpDiff = Math.abs(playerHP - opponentHP);
  const isVictory = outcome === "win";
  const isLoss = outcome === "loss";
  const isDraw = outcome === "draw";

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        setTimeout(() => setShowContent(true), 400);
      }, delayMs);

      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
      setShowContent(false);
    }
  }, [open, delayMs]);

  if (!showPopup) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 ${
            isVictory ? "bg-gradient-to-b from-amber-950/90 via-black/95 to-black" :
            isLoss ? "bg-gradient-to-b from-red-950/90 via-black/95 to-black" :
            "bg-gradient-to-b from-slate-900/90 via-black/95 to-black"
          }`}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                y: "100vh",
                x: `${Math.random() * 100}vw`,
                opacity: 0
              }}
              animate={{
                y: "-10vh",
                opacity: [0, 1, 0],
                transition: {
                  duration: 4 + Math.random() * 3,
                  delay: Math.random() * 2,
                  repeat: Infinity
                }
              }}
              className={`absolute w-2 h-2 rounded-full ${
                isVictory ? "bg-amber-400" :
                isLoss ? "bg-red-500" :
                "bg-slate-400"
              }`}
            />
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
          className="relative z-10 w-full max-w-lg mx-4"
        >
          {/* Decorative top border */}
          <div className={`h-1 rounded-t-xl ${
            isVictory ? "bg-gradient-to-r from-transparent via-amber-400 to-transparent" :
            isLoss ? "bg-gradient-to-r from-transparent via-red-500 to-transparent" :
            "bg-gradient-to-r from-transparent via-slate-400 to-transparent"
          }`} />

          <div className={`
            backdrop-blur-xl rounded-b-xl border-x border-b p-8
            ${
              isVictory ? "bg-gradient-to-b from-amber-950/40 to-card/80 border-amber-500/30" :
              isLoss ? "bg-gradient-to-b from-red-950/40 to-card/80 border-red-500/30" :
              "bg-gradient-to-b from-slate-900/40 to-card/80 border-slate-500/30"
            }
          `}>
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, delay: 0.4 }}
              className="flex justify-center mb-6"
            >
              <div className={`
                relative p-6 rounded-full
                ${
                  isVictory ? "bg-gradient-to-br from-amber-500 to-yellow-600 shadow-[0_0_60px_rgba(251,191,36,0.5)]" :
                  isLoss ? "bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_60px_rgba(239,68,68,0.5)]" :
                  "bg-gradient-to-br from-slate-500 to-slate-700 shadow-[0_0_60px_rgba(148,163,184,0.5)]"
                }
              `}>
                {isVictory && <Crown className="w-16 h-16 text-amber-950" />}
                {isLoss && <Skull className="w-16 h-16 text-red-200" />}
                {isDraw && <Scale className="w-16 h-16 text-slate-100" />}

                {/* Orbiting sparkles for victory */}
                {isVictory && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 text-amber-300" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0"
                    >
                      <Sparkles className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-300" />
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`
                text-5xl font-bold text-center font-cinzel mb-2
                ${
                  isVictory ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300" :
                  isLoss ? "text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-300 to-red-400" :
                  "text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-white to-slate-300"
                }
              `}
              style={{
                textShadow: 
                  isVictory ? "0 0 40px rgba(251,191,36,0.6)" :
                  isLoss ? "0 0 40px rgba(239,68,68,0.6)" :
                  "0 0 40px rgba(148,163,184,0.6)"
              }}
            >
              {winReason === "SURRENDER" 
                  ? (language === "tr" ? "TESLİM OLDUN" : "SURRENDERED")
                  : (isVictory ? t("victory.title.win") : (isDraw ? t("victory.title.draw") : t("victory.title.loss")))}
            </motion.h1>

            {/* Win reason if provided (don't show if it's SURRENDER as it's already in title) */}
            {winReason && winReason !== "SURRENDER" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-muted-foreground text-sm mb-6"
              >
                {winReason}
              </motion.p>
            )}

            {/* HP Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              {/* Player HP */}
              <div className={`
                p-4 rounded-lg border text-center
                ${playerHP > opponentHP
                  ? "bg-green-950/30 border-green-500/30"
                  : "bg-card/30 border-border/50"
                }
              `}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-muted-foreground">{t("victory.you")}</span>
                </div>
                <span className="text-3xl font-bold text-green-400">{playerHP}</span>
                <span className="text-lg text-muted-foreground"> HP</span>
              </div>

              {/* Opponent HP */}
              <div className={`
                p-4 rounded-lg border text-center
                ${opponentHP > playerHP
                  ? "bg-red-950/30 border-red-500/30"
                  : "bg-card/30 border-border/50"
                }
              `}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Swords className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-muted-foreground">{t("victory.opponent")}</span>
                </div>
                <span className="text-3xl font-bold text-red-400">{opponentHP}</span>
                <span className="text-lg text-muted-foreground"> HP</span>
              </div>
            </motion.div>

            {/* HP Difference */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mb-6"
            >
              <div className="text-sm text-muted-foreground mb-4">
                {t("victory.hpDiff")}: <span className="font-bold text-foreground">{hpDiff}</span>
              </div>

              {/* Damage Details (Last Round Info) */}
              {damageDetails && damageDetails.length > 0 && (
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-center">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("victory.summary")}</h3>
                  <div className="space-y-1 text-xs text-slate-300">
                    {damageDetails.map((detail, i) => (
                      <div key={i}>{detail}</div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Reward */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.8 }}
              className={`
                p-4 rounded-lg mb-6 flex items-center justify-center gap-3
                ${
                  isVictory ? "bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-amber-950/50 border border-amber-500/30" :
                  isDraw ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-500/30" :
                  "bg-card/30 border border-border/50"
                }
              `}
            >
              <Coins className={`w-8 h-8 ${isVictory ? "text-amber-400" : isDraw ? "text-slate-300" : "text-muted-foreground"}`} />
              <span className={`
                text-2xl font-bold font-cinzel
                ${isVictory ? "text-amber-300 glow-gold" : isDraw ? "text-slate-200" : "text-muted-foreground"}
              `}>
                +{reward} DivineCoin
              </span>
            </motion.div>

            {/* Return Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                variant="default"
                size="lg"
                onClick={onReturnToMenu}
                className={`
                  w-full text-lg font-cinzel py-6
                  ${
                    isVictory ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-amber-950" :
                    isDraw ? "bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white" :
                    ""
                  }
                `}
              >
                {t("victory.back")}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
