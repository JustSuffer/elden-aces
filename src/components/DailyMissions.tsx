import React from "react";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { getTranslation } from "@/data/missionPool";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { Check, Coins, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const DailyMissions = () => {
  const { missions, claimReward } = useDailyMissions();
  const { language } = useLanguage();

  if (missions.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-4xl mx-auto mt-8 mb-4 px-4"
    >
        <div className="flex items-center gap-2 mb-3">
             <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1" />
             <h3 className="text-amber-500 font-cinzel text-lg tracking-widest flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                {language === "tr" ? "GÜNLÜK GÖREVLER" : "DAILY MISSIONS"}
             </h3>
             <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {missions.map((mission, idx) => {
                const isCompleted = mission.progress >= mission.targetCount;
                const progressPercent = (mission.progress / mission.targetCount) * 100;

                return (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + (idx * 0.1) }}
                        className={cn(
                            "relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
                            isCompleted && !mission.isClaimed 
                                ? "bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                                : "bg-black/40 border-white/10 hover:border-white/20"
                        )}
                    >
                        {/* Background Effect for Rare missions (300 coins) */}
                        {mission.reward === 300 && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-bl-3xl pointer-events-none" />
                        )}

                        <div className="flex justify-between items-start mb-2">
                             <div className="text-sm font-medium text-gray-200 leading-snug min-h-[40px]">
                                {getTranslation(mission.translationKey, language as "tr"|"en", mission.params)}
                             </div>
                             <div className={cn(
                                 "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-black/50 border",
                                 mission.reward === 300 ? "text-purple-400 border-purple-500/30" : "text-amber-400 border-amber-500/30"
                             )}>
                                <Coins className="w-3 h-3" />
                                {mission.reward}
                             </div>
                        </div>

                        <div className="space-y-2 mt-4 relative z-10">
                            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                                <span>{isCompleted ? (language === "tr" ? "TAMAMLANDI" : "COMPLETED") : (language === "tr" ? "İLERLEME" : "PROGRESS")}</span>
                                <span>{mission.progress}/{mission.targetCount}</span>
                            </div>
                            <Progress value={progressPercent} className={cn("h-1.5", isCompleted ? "bg-amber-900/40" : "bg-white/5")} indicatorClassName={isCompleted ? "bg-amber-500" : "bg-white/50"} />
                        </div>

                        {/* Claim Overlay or Tick */}
                        {mission.isClaimed ? (
                             <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-[1px] z-20">
                                 <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex flex-col items-center text-green-500"
                                 >
                                     <Check className="w-8 h-8 mb-1" />
                                     <span className="text-xs font-bold tracking-widest">{language === "tr" ? "ALINDI" : "CLAIMED"}</span>
                                 </motion.div>
                             </div>
                        ) : isCompleted && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => claimReward(mission.id)}
                                className="absolute inset-0 z-20 bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center backdrop-blur-[0px] transition-colors group cursor-pointer"
                            >
                                <div className="bg-amber-600 text-white shadow-lg text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 animate-bounce">
                                    <Coins className="w-4 h-4" />
                                    {language === "tr" ? "ÖDÜLÜ AL" : "CLAIM REWARD"}
                                </div>
                            </motion.button>
                        )}
                    </motion.div>
                );
            })}
        </div>
    </motion.div>
  );
};
