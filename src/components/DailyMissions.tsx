import React from "react";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { getTranslation } from "@/data/missionPool";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Coins, RefreshCw, X, Scroll } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DailyMissionsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DailyMissions = ({ isOpen, onClose }: DailyMissionsProps) => {
  const { missions, claimReward } = useDailyMissions();
  const { language } = useLanguage();

  if (missions.length === 0) return null;

  return (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl bg-card/95 border-2 border-amber-500/30 p-6 md:p-8 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-primary z-50"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 relative">
                         {/* Glow Behind Header */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                         
                         <div className="w-16 h-16 rounded-full bg-amber-950/30 flex items-center justify-center border border-amber-500/30 mb-4 shadow-lg shadow-amber-900/20">
                            <Scroll className="w-8 h-8 text-amber-500" />
                         </div>

                         <div className="flex items-center gap-4 w-full justify-center">
                             <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1 max-w-[100px]" />
                             <h3 className="text-2xl md:text-3xl font-bold font-cinzel text-amber-500 glow-gold tracking-widest text-center">
                                {language === "tr" ? "GÜNLÜK GÖREVLER" : "DAILY MISSIONS"}
                             </h3>
                             <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1 max-w-[100px]" />
                         </div>
                         <p className="text-muted-foreground text-sm mt-2 text-center max-w-md">
                             {language === "tr" 
                               ? "Her gün 23:00'da yenilenen görevleri tamamla ve ödülleri kazan!" 
                               : "Complete missions refreshed daily at 23:00 to earn rewards!"}
                         </p>
                    </div>

                    {/* Missions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                        {missions.map((mission, idx) => {
                            const isCompleted = mission.progress >= mission.targetCount;
                            const progressPercent = (mission.progress / mission.targetCount) * 100;

                            return (
                                <motion.div
                                    key={mission.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.1) }}
                                    className={cn(
                                        "relative overflow-hidden rounded-xl border p-4 transition-all duration-300 flex flex-col justify-between min-h-[180px]",
                                        isCompleted && !mission.isClaimed 
                                            ? "bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                                            : "bg-black/40 border-white/10 hover:border-white/20"
                                    )}
                                >
                                    {/* Background Effect for Rare missions (300 coins) */}
                                    {mission.reward === 300 && (
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-full pointer-events-none" />
                                    )}

                                    <div className="flex justify-between items-start mb-2 gap-2">
                                         <div className="text-sm font-medium text-gray-200 leading-snug">
                                            {getTranslation(mission.translationKey, language as "tr"|"en", mission.params)}
                                         </div>
                                         <div className={cn(
                                             "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-black/50 border shrink-0",
                                             mission.reward === 300 ? "text-purple-400 border-purple-500/30" : "text-amber-400 border-amber-500/30"
                                         )}>
                                            <Coins className="w-3 h-3" />
                                            {mission.reward}
                                         </div>
                                    </div>

                                    <div className="space-y-3 mt-auto relative z-10">
                                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                            <span>{isCompleted ? (language === "tr" ? "TAMAMLANDI" : "COMPLETED") : (language === "tr" ? "İLERLEME" : "PROGRESS")}</span>
                                            <span>{Math.min(mission.progress, mission.targetCount)}/{mission.targetCount}</span>
                                        </div>
                                        <Progress value={progressPercent} className={cn("h-2", isCompleted ? "bg-amber-900/40" : "bg-white/5")} indicatorClassName={isCompleted ? "bg-amber-500" : "bg-white/50"} />
                                    </div>

                                    {/* Claim Overlay or Tick */}
                                    {mission.isClaimed ? (
                                         <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-[1px] z-20">
                                             <motion.div 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="flex flex-col items-center text-green-500"
                                             >
                                                 <Check className="w-10 h-10 mb-2 drop-shadow-lg" />
                                                 <span className="text-sm font-bold tracking-widest border-b border-green-500/30 pb-1">{language === "tr" ? "ALINDI" : "CLAIMED"}</span>
                                             </motion.div>
                                         </div>
                                    ) : isCompleted && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => claimReward(mission.id)}
                                            className="absolute inset-0 z-20 bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center backdrop-blur-[0px] transition-colors group cursor-pointer"
                                        >
                                            <div className="bg-amber-600 text-white shadow-[0_4px_14px_0_rgba(217,119,6,0.39)] text-sm font-bold px-6 py-2 rounded-full flex items-center gap-2 animate-bounce border border-amber-400">
                                                <Coins className="w-4 h-4 fill-white text-white" />
                                                {language === "tr" ? "ÖDÜLÜ AL" : "CLAIM REWARD"}
                                            </div>
                                        </motion.button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
  );
};
