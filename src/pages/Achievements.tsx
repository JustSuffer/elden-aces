import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { ACHIEVEMENTS, Achievement, AchievementCategory } from "@/data/achievementsData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Lock, CheckCircle, Gift, Award, Medal, Crown, Shield } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStoryProgress } from "@/hooks/useStoryProgress";

interface AchievementState {
  isUnlocked: boolean;
  isClaimed: boolean;
  progress: number; // Current value (e.g., 5 wins)
  target: number;   // Target value (e.g., 10 wins)
}

export default function Achievements() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { isLevelCompleted, isRegionUnlocked } = useStoryProgress();

  const [activeTab, setActiveTab] = useState<AchievementCategory | "All">("All");
  const [loading, setLoading] = useState(true);
  
  // User Stats
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [totalGames, setTotalGames] = useState(0);

  // Fetch Data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Coins (Isolated)
        try {
            const { data: coinData } = await supabase.from("profiles").select("divine_coins").eq("user_id", user.id).single();
            if (coinData) setCoins(coinData.divine_coins || 0);
        } catch (e) {
            console.error("Error fetching coins:", e);
        }

        // 2. Fetch Unlocked Items (Isolated with LocalStorage Fallback)
        try {
            const { data: itemData } = await supabase.from("profiles").select("unlocked_items").eq("user_id", user.id).maybeSingle();
            
            let dbItems: string[] = [];
            if (itemData) {
                dbItems = ((itemData as any).unlocked_items as string[]) || [];
            }
            
            // Merge with LocalStorage (Schema fallback)
            const localStored = localStorage.getItem(`achievements_${user.id}`);
            let localItems: string[] = localStored ? JSON.parse(localStored) : [];
            
            // Union unique items
            const mergedItems = Array.from(new Set([...dbItems, ...localItems]));
            setUnlockedItems(mergedItems);
            
        } catch (e) {
            console.error("Error fetching unlocked items:", e);
        }

        // 2. Match Stats (for calculation)
        // We fetch basic stats to aggregate locally. 
        // OPTIMIZATION: Ideally we'd use RPC or summary tables for 1000s of matches, 
        // but for now creating a client-side aggregate is acceptable for MVP scale.
        const { data: stats } = await supabase
          .from("bot_match_stats")
          .select("result, player_class, player_final_hp, opponent_final_hp") // Min columns
          .eq("user_id", user.id);
        
        if (stats) {
          setMatchStats(stats);
          setTotalGames(stats.length);
        }

      } catch (err) {
        console.error("Error fetching achievement data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate Status for ALL Achievements
  const achievementStatus = useMemo(() => {
    const statusMap: Record<string, AchievementState> = {};

    // Pre-calculate Aggregates
    const totalWins = matchStats.filter(m => m.result === "win").length;
    const classWins: Record<string, number> = {};
    matchStats.forEach(m => {
        if (m.result === "win") {
             classWins[m.player_class] = (classWins[m.player_class] || 0) + 1;
        }
    });

    const perfectWins = matchStats.filter(m => m.result === "win" && m.player_final_hp >= 20).length; // Assuming 20 is max, or full stats needed
    const closeCallWins = matchStats.filter(m => m.result === "win" && m.player_final_hp <= 5).length;

    ACHIEVEMENTS.forEach(achiv => {
      let progress = 0;
      let unlocked = false;

      switch (achiv.conditionType) {
        case "total_wins":
          progress = totalWins;
          break;
        case "class_wins":
          progress = classWins[achiv.conditionParam || ""] || 0;
          break;
        case "total_games":
          progress = totalGames;
          break;
        case "coins_earned":
          progress = coins; // Current balance proxy
          break;
        case "items_owned":
          // Count non-achievement items in unlocked_items
          // Filter out strings starting with 'achiv_' to avoid recursion/inflation if stored there
          const realItems = unlockedItems.filter(id => !id.startsWith("achiv_"));
          progress = realItems.length;
          break;
        case "story_level_complete":
          progress = isLevelCompleted(achiv.conditionParam!) ? 1 : 0;
          break;
        case "story_region_unlock":
          progress = isRegionUnlocked(achiv.conditionParam!) ? 1 : 0;
          break;
        case "perfect_win":
            progress = perfectWins;
            break;
        case "close_call":
            progress = closeCallWins;
            break;
        default:
          progress = 0;
      }

      unlocked = progress >= achiv.targetCount;
      const claimed = unlockedItems.includes(achiv.id);

      statusMap[achiv.id] = {
        isUnlocked: unlocked,
        isClaimed: claimed,
        progress: progress,
        target: achiv.targetCount
      };
    });

    return statusMap;
  }, [matchStats, totalGames, coins, unlockedItems, isLevelCompleted, isRegionUnlocked]);

  // Sort: Unclaimed & Unlocked > Locked > Claimed
  const filteredAchievements = useMemo(() => {
    let list = ACHIEVEMENTS;
    if (activeTab !== "All") {
      list = list.filter(a => a.category === activeTab);
    }

    return list.sort((a, b) => {
        const sA = achievementStatus[a.id];
        const sB = achievementStatus[b.id];

        // Priority 1: Unlocked but NOT Claimed (Actionable)
        const actionableA = sA.isUnlocked && !sA.isClaimed;
        const actionableB = sB.isUnlocked && !sB.isClaimed;
        if (actionableA && !actionableB) return -1;
        if (!actionableA && actionableB) return 1;

        // Priority 2: In Progress (Not Unlocked, Not Claimed) - Sort by progress % ??
        // Let's just put Claimed at bottom
        if (sA.isClaimed && !sB.isClaimed) return 1;
        if (!sA.isClaimed && sB.isClaimed) return -1;

        return 0;
    });
  }, [activeTab, achievementStatus]);

  const handleClaim = async (achievement: Achievement) => {
    if (!user) return;
    const status = achievementStatus[achievement.id];
    // Check local status first to avoiding unnecessary calls
    if (!status.isUnlocked || status.isClaimed) return;

    // Optimistic UI Update
    setUnlockedItems(prev => [...prev, achievement.id]);
    setCoins(prev => prev + achievement.reward);
    
    toast.success(
        language === "tr" 
        ? `${achievement.reward} Divine Coin kazanıldı!` 
        : `Earned ${achievement.reward} Divine Coins!`
    );

    try {
        // 1. Fetch LATEST data (Coins only, as it's the critical DB part)
        const { data: profileData, error: fetchError } = await supabase
            .from("profiles")
            .select("divine_coins") 
            .eq("user_id", user.id)
            .single();
            
        if (fetchError) {
             console.error("Profile fetch error:", fetchError);
             throw new Error("Could not fetch profile data.");
        }
        
        const currentCoins = profileData.divine_coins || 0;
        
        // 2. Update Coins (Priority 1 - Must Succeed)
        const newCoins = currentCoins + achievement.reward;
        const { error: coinError } = await supabase
            .from("profiles")
            .update({ divine_coins: newCoins } as any)
            .eq("user_id", user.id);

        if (coinError) {
            throw new Error(`Coin update failed: ${coinError.message}`);
        }

        // 3. Update Unlocked Items (Priority 2 - Try DB, Fallback to LocalStorage)
        // We tried getting it from DB but schema might be missing 'unlocked_items'.
        // So we use our local 'unlockedItems' state + new item.
        const newItems = [...unlockedItems, achievement.id];
        
        // Attempt DB update for items
        const { error: itemError } = await supabase
            .from("profiles")
            .update({ unlocked_items: newItems } as any)
            .eq("user_id", user.id);

        if (itemError) {
            console.warn("DB Item Update failed (Schema mismatch?), falling back to LocalStorage:", itemError);
            // Fallback: Save to LocalStorage
            localStorage.setItem(`achievements_${user.id}`, JSON.stringify(newItems));
        }

        // 4. Final Success State
        setCoins(newCoins);
        setUnlockedItems(newItems);

    } catch (err: any) {
        console.error("Claim failed:", err);
        toast.error(`Error saving progress: ${err.message || "Unknown Error"}`);
        
        // Revert Optimistic UI
        setUnlockedItems(prev => prev.filter(id => id !== achievement.id));
        setCoins(prev => prev - achievement.reward);
    }
  };

  const categories: (AchievementCategory | "All")[] = ["All", "Combat", "Mastery", "Story", "Collection", "Social"];

  return (
    <div className="min-h-screen bg-black text-gold relative overflow-x-hidden font-cinzel selection:bg-gold/30 pb-20">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black -z-50" />
      <div className="fixed inset-0 bg-[url('/assets/hex-pattern.png')] opacity-5 -z-40" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-gold/10 bg-white/80">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/menu")} 
              className="hover:bg-gold/10 hover:text-gold text-gold/70"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              {language === "tr" ? "BAŞARIMLAR" : "ACHIEVEMENTS"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-full border border-gold/30">
             <span className="text-sm text-gold/60 mr-2 border-r border-gold/20 pr-3">
               {Object.values(achievementStatus).filter(s => s.isClaimed).length} / {ACHIEVEMENTS.length}
             </span>
             <Award className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        
        {/* Categories Scroller */}
        <div className="container mx-auto px-4 py-2 overflow-x-auto no-scrollbar flex gap-2">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                        activeTab === cat 
                            ? "bg-gold text-black border-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                            : "bg-transparent text-gold/60 border-gold/20 hover:border-gold/50 hover:text-gold"
                    )}
                >
                    {language === "tr" && cat === "All" ? "Tümü" : 
                     language === "tr" && cat === "Combat" ? "Savaş" :
                     language === "tr" && cat === "Mastery" ? "Ustalık" :
                     language === "tr" && cat === "Story" ? "Hikaye" :
                     language === "tr" && cat === "Collection" ? "Koleksiyon" :
                     language === "tr" && cat === "Social" ? "Sosyal" : cat}
                </button>
            ))}
        </div>
      </header>

      {/* Main List */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
         {loading ? (
             <div className="text-center py-20 text-gold/50 animate-pulse">
                 {language === "tr" ? "Veriler analiz ediliyor..." : "Analyzing data..."}
             </div>
         ) : (
             <div className="space-y-4">
                 {filteredAchievements.map(achiv => {
                     const status = achievementStatus[achiv.id];
                     const percent = Math.min(100, (status.progress / status.target) * 100);
                     
                     return (
                         <div 
                            key={achiv.id}
                            className={cn(
                                "group relative border rounded-xl p-4 transition-all duration-300 overflow-hidden",
                                status.isClaimed 
                                    ? "bg-slate-900/40 border-gold/10 opacity-70"
                                    : status.isUnlocked 
                                        ? "bg-gradient-to-r from-amber-950/40 to-black border-gold/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                                        : "bg-black/40 border-white/5"
                            )}
                         >
                            <div className="flex items-center gap-4 relative z-10">
                                {/* Icon / Circle */}
                                <div className={cn(
                                    "w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0",
                                    status.isClaimed ? "bg-gold/10 border-gold/30 text-gold/50" :
                                    status.isUnlocked ? "bg-black text-orange-500 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-pulse-slow" :
                                    "bg-slate-900 border-white/10 text-white/20"
                                )}>
                                    {status.isClaimed ? <CheckCircle className="w-7 h-7" /> :
                                     status.isUnlocked ? <Gift className="w-7 h-7" /> :
                                     <Lock className="w-6 h-6" />
                                    }
                                </div>

                                {/* Text */}
                                <div className="flex-grow min-w-0">
                                    <h3 className={cn(
                                        "text-lg font-bold truncate",
                                        status.isClaimed ? "text-gold/60" :
                                        status.isUnlocked ? "text-white group-hover:text-gold transition-colors" :
                                        "text-white/40"
                                    )}>
                                        {language === "tr" ? achiv.titleTR : achiv.titleEN}
                                    </h3>
                                    <p className="text-sm text-gray-400 truncate">
                                        {language === "tr" ? achiv.descriptionTR : achiv.descriptionEN}
                                    </p>
                                    
                                    {/* Progress Bar (Only if not claimed) */}
                                    {!status.isClaimed && (
                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="h-1.5 flex-grow bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn("h-full rounded-full transition-all duration-1000", 
                                                        status.isUnlocked ? "bg-green-500" : "bg-gold/50"
                                                    )}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-mono text-gold/50">
                                                {status.progress} / {status.target}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Action / Status */}
                                <div className="shrink-0">
                                    {status.isClaimed ? (
                                        <div className="px-4 py-2 border border-gold/10 rounded-lg bg-gold/5 flex items-center gap-2">
                                            <span className="text-gold/50 text-sm font-bold">
                                                {language === "tr" ? "ALINDI" : "CLAIMED"}
                                            </span>
                                        </div>
                                    ) : status.isUnlocked ? (
                                        <Button
                                            onClick={() => handleClaim(achiv)}
                                            className="bg-green-600 hover:bg-green-500 text-white border border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-bounce-subtle"
                                        >
                                           {language === "tr" ? "ÖDÜLÜ AL" : "CLAIM REWARD"}
                                           <span className="ml-2 bg-black/20 px-2 py-0.5 rounded text-xs">
                                             +{achiv.reward} DC
                                           </span>
                                        </Button>
                                    ) : (
                                        <div className="px-4 py-2 text-white/20 text-sm font-bold flex items-center gap-1">
                                            <Award className="w-4 h-4" />
                                            {achiv.reward}
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                     );
                 })}
             </div>
         )}
      </main>
    </div>
  );
}
