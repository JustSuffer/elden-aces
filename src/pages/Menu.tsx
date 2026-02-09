import { MenuButton } from "@/components/ui/menu-button";
import logo from "@/assets/acoria-logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Trophy, X, Monitor, Map, Users, Coins, Store, Award, Scroll } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ACHIEVEMENTS } from "@/data/achievementsData";
import { useStoryProgress } from "@/hooks/useStoryProgress";
import { DailyMissions } from "@/components/DailyMissions";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring" as const, stiffness: 50, damping: 10 }
  }
};

const Menu = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t, language } = useLanguage();
  const [showPopup, setShowPopup] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("acoria_f11_reminder_hidden");
    if (saved !== "true") {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDontShowAgainChange = (checked: boolean) => {
    setDontShowAgain(checked);
    if (checked) {
      localStorage.setItem("acoria_f11_reminder_hidden", "true");
    } else {
      localStorage.removeItem("acoria_f11_reminder_hidden");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Fetch Coins & Achievements Notification
  const { user } = useAuth();
  const [coins, setCoins] = useState<number | null>(null);
  const [unclaimedAchievements, setUnclaimedAchievements] = useState(0);
  const [unclaimedMissions, setUnclaimedMissions] = useState(false);
  const { isLevelCompleted, isRegionUnlocked } = useStoryProgress();
  
  // Fetch and subscribe to data
  useEffect(() => {
    if(!user) return;
    
    const fetchData = async () => {
       // 1. Fetch Coins (Isolated)
       try {
           const { data: coinData } = await supabase.from("profiles").select("divine_coins").eq("user_id", user.id).single();
           if (coinData) setCoins(coinData.divine_coins || 0);
       } catch (e) {
           console.error("Error fetching coins:", e);
       }

       // 2. Fetch Unlocked Items (Isolated with LocalStorage Fallback)
       let unlockedIds: string[] = [];
       try {
           const { data: itemData } = await supabase.from("profiles").select("unlocked_items").eq("user_id", user.id).maybeSingle();
           
           let dbItems: string[] = [];
           if (itemData) {
               dbItems = ((itemData as any).unlocked_items as string[]) || [];
           }
           
           // Merge with LocalStorage to see locally claimed items
           const localStored = localStorage.getItem(`achievements_${user.id}`);
           let localItems: string[] = localStored ? JSON.parse(localStored) : [];
           
           // Union unique items
           unlockedIds = Array.from(new Set([...dbItems, ...localItems]));
           
       } catch (e) {
           console.error("Error fetching unlocked items:", e);
       }

       // 3. Stats for Achievement Calc
       try {
           const { data: stats } = await supabase.from("bot_match_stats").select("result, player_class, player_final_hp").eq("user_id", user.id);
           
           if (stats) {
               // Calculate Unclaimed Count
               const totalWins = stats.filter(m => m.result === "win").length;
               const classWins: Record<string, number> = {};
               stats.forEach(m => { if (m.result === "win") classWins[m.player_class] = (classWins[m.player_class] || 0) + 1; });
               
               let count = 0;
               ACHIEVEMENTS.forEach(achiv => {
                   if (unlockedIds.includes(achiv.id)) return; // Already claimed

                   let progress = 0;
                   switch (achiv.conditionType) {
                       case "total_wins": progress = totalWins; break;
                       case "class_wins": progress = classWins[achiv.conditionParam || ""] || 0; break;
                       case "total_games": progress = stats.length; break;
                       case "coins_earned": progress = coins || 0; break;
                       case "items_owned": progress = unlockedIds.filter(id => !id.startsWith("achiv_")).length; break;
                       case "story_level_complete": progress = isLevelCompleted(achiv.conditionParam!) ? 1 : 0; break;
                       case "story_region_unlock": progress = isRegionUnlocked(achiv.conditionParam!) ? 1 : 0; break;
                       case "perfect_win": progress = stats.filter(m => m.result === "win" && m.player_final_hp >= 20).length; break;
                       case "close_call": progress = stats.filter(m => m.result === "win" && m.player_final_hp <= 5).length; break;
                       default: progress = 0;
                   }

                   if (progress >= achiv.targetCount) count++;
               });
               setUnclaimedAchievements(count);
           }
       } catch (e) {
           console.error("Error calculating achievements:", e);
       }
    };
    fetchData();
    
    // Check for claimable missions for notification
    const checkMissionNotifications = () => {
         const stored = localStorage.getItem("acoria_daily_missions");
         if (stored) {
             try {
                 const parsed = JSON.parse(stored);
                 if (parsed.missions && Array.isArray(parsed.missions)) {
                     const hasClaimable = parsed.missions.some((m: any) => m.progress >= m.targetCount && !m.isClaimed);
                     setUnclaimedMissions(hasClaimable);
                 }
             } catch (e) { console.error("Error parsing missions for notification", e); }
         }
    };
    checkMissionNotifications();
    // Re-check periodically or on focus? Simple interval for now.
    const missionInterval = setInterval(checkMissionNotifications, 5000);
    
    // Subscribe to coin changes
    const channel = supabase
      .channel("profile-coins")
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          if (payload.new?.divine_coins !== undefined) {
            setCoins(payload.new.divine_coins);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(missionInterval);
    };
  }, [user, isLevelCompleted, isRegionUnlocked, coins]); // Added coins to dependency for achievement calc update

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Bio-Digital Background Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
            maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
        }}
      />

      {/* Atmospheric Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-muted/20 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Mist Effect */}
      <div className="absolute inset-0 bg-mist opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      
      {/* Coin Display */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <button
              onClick={() => setShowMissions(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/60 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/60 transition-all shadow-lg relative hvr-pulse"
              title={language === "tr" ? "Günlük Görevler" : "Daily Missions"}
          >
              <Scroll className="w-5 h-5" />
              {unclaimedMissions && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border border-black animate-pulse shadow-md shadow-green-500/50" />
              )}
          </button>

          <button
              onClick={() => navigate("/achievements")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/60 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/60 transition-all shadow-lg relative hvr-pulse"
              title={language === "tr" ? "Başarımlar" : "Achievements"}
          >
              <Award className="w-5 h-5" />
              {unclaimedAchievements > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 border border-black flex items-center justify-center text-[10px] text-white font-bold animate-bounce">
                      {unclaimedAchievements > 9 ? "!" : unclaimedAchievements}
                  </span>
              )}
          </button>
          
          <button
              onClick={() => navigate("/checkout")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/60 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/60 transition-all shadow-lg"
              title={language === "tr" ? "Coin Satın Al" : "Buy Coins"}
          >
              <Store className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-amber-500/30 shadow-lg">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-100 font-bold font-cinzel">{(coins || 0).toLocaleString()}</span>
          </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4 max-w-2xl w-full">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, type: "spring" }}
          className="relative"
        >
          <img 
            src={logo} 
            alt="ACORIA" 
            className="w-64 md:w-80 h-auto drop-shadow-2xl animate-float"
          />
          <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 animate-pulse" style={{ animationDuration: '3s' }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground text-sm md:text-base tracking-[0.3em] uppercase text-center glow-gold"
        >
          {t("menu.subtitle")}
        </motion.p>

        {/* Menu Items */}
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col space-y-4 w-full max-w-lg"
        >
          <motion.div variants={itemVariants}>
             <MenuButton 
               onClick={() => navigate("/story-mode")} 
               variant="primary" 
               className="w-full h-16 text-xl tracking-widest shadow-lg shadow-purple-900/40 bg-gradient-to-r from-purple-950 to-indigo-950 border-purple-500/50 text-purple-200 mb-4 hover:shadow-purple-500/20 hover:scale-[1.02] transition-all"
             >
               <Map className="mr-2 h-6 w-6 animate-pulse" />
               {t("menu.storyMode")}
             </MenuButton>
          </motion.div>
          <motion.div variants={itemVariants}>
             <MenuButton onClick={() => navigate("/play")} variant="primary" className="w-full h-16 text-xl tracking-widest shadow-lg shadow-primary/20">
               {t("menu.playOnline")}
             </MenuButton>
          </motion.div>
          <motion.div variants={itemVariants}>
             <MenuButton onClick={() => navigate("/game")} className="w-full h-14 text-lg">
               {t("menu.playBot")}
             </MenuButton>
          </motion.div>

          <motion.div variants={itemVariants}>
             <MenuButton 
               onClick={() => navigate("/shop")} 
               className="w-full h-14 text-lg border-amber-600/30 text-amber-500 hover:text-amber-200 hover:bg-amber-900/20"
             >
               {language === "tr" ? "MARKET" : "SHOP"}
             </MenuButton>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
              <motion.div variants={itemVariants}>
                 <MenuButton onClick={() => navigate("/profile")} className="w-full h-14 text-base px-2">
                   {t("menu.profile")}
                 </MenuButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                 <MenuButton onClick={() => navigate("/card-library")} className="w-full h-14 text-base px-2 whitespace-nowrap">
                   {t("menu.library")}
                 </MenuButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                 <MenuButton onClick={() => navigate("/deck-builder")} className="w-full h-14 text-base px-2 whitespace-nowrap">
                   {t("menu.deckBuilder")}
                 </MenuButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                 <MenuButton onClick={() => navigate("/settings")} className="w-full h-14 text-base px-2">
                   {t("menu.settings")}
                 </MenuButton>
              </motion.div>
          </div>

          <motion.div variants={itemVariants} className="grid grid-cols-5 gap-3 pt-2">
             <MenuButton onClick={() => navigate("/credits")} className="h-10 text-xs px-1 border-white/20 hover:border-white/40">{t("menu.team")}</MenuButton>
             <MenuButton onClick={() => navigate("/how-to-play")} className="h-10 text-xs px-1 border-white/20 hover:border-white/40">{t("menu.howToPlay")}</MenuButton>
             <MenuButton onClick={() => navigate("/tutorial")} className="h-10 text-xs px-1 border-white/20 hover:border-white/40">{t("menu.tutorial")}</MenuButton>
             <MenuButton onClick={() => navigate("/friends")} className="h-10 text-xs px-1 border-green-500/30 hover:border-green-500/60 flex items-center justify-center gap-1">
               <Users className="w-3 h-3" />
               {t("menu.friends")}
             </MenuButton>
             <MenuButton onClick={() => navigate("/leaderboard")} className="h-10 text-xs px-1 border-primary/30 hover:border-primary/60 flex items-center justify-center gap-1">
               <Trophy className="w-3 h-3" />
               ELO
             </MenuButton>
          </motion.div>
          
          {/* Logout Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleSignOut}
            whileHover={{ scale: 1.05, color: "#f87171" }}
            className="flex items-center justify-center gap-2 py-3 px-6 text-muted-foreground/70 transition-colors mx-auto mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm tracking-wider">{t("menu.logout")}</span>
          </motion.button>
        </motion.div>

        {/* Version Info */}
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.3 }} 
            transition={{ delay: 1.5 }}
            className="text-muted-foreground/50 text-xs tracking-widest pt-4"
        >
          {t("common.version")}
        </motion.div>
        <DailyMissions isOpen={showMissions} onClose={() => setShowMissions(false)} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-primary/20 rounded-full animate-spin-slow pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border border-primary/10 rounded-full animate-spin-slower pointer-events-none" />

      {/* F11 Reminder Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-card/90 border-2 border-primary/40 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/5 blur-3xl rounded-full" />

              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Monitor className="w-8 h-8 text-primary animate-pulse" />
                </div>

                <h2 className="text-xl md:text-2xl font-bold font-cinzel text-primary glow-gold leading-relaxed">
                  {t("menu.popup.f11.message")}
                </h2>

                <div className="flex items-center space-x-3 pt-4 border-t border-primary/10 w-full justify-center">
                  <Checkbox 
                    id="dont-show-again" 
                    checked={dontShowAgain}
                    onCheckedChange={(checked) => handleDontShowAgainChange(!!checked)}
                    className="border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                  />
                  <Label 
                    htmlFor="dont-show-again"
                    className="text-xs tracking-widest text-muted-foreground hover:text-primary cursor-pointer transition-colors uppercase"
                  >
                    {t("menu.popup.f11.dontShowAgain")}
                  </Label>
                </div>
                
                <button
                  onClick={() => setShowPopup(false)}
                  className="mt-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground/30 hover:text-primary/50 transition-colors"
                >
                  [ {t("menu.back").toUpperCase()} ]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
