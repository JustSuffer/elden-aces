import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { GameMatch } from "@/components/game/GameMatch";
import { STORY_REGIONS, StoryLevel } from "@/data/storyData";
import { useStoryProgress } from "@/hooks/useStoryProgress";
import { useLanguage } from "@/hooks/useLanguage"; // Added hook
import { Button } from "@/components/ui/button";
import { SavedDeck } from "@/types/deck";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function StoryGame() {
  const { regionId, levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { completeLevel } = useStoryProgress();
  const { language } = useLanguage(); // Get language
  const { user } = useAuth();

  const [level, setLevel] = useState<StoryLevel | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Deck State
  const [availableDecks, setAvailableDecks] = useState<SavedDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [playerDeck, setPlayerDeck] = useState<SavedDeck | null>(null);

  // Helper for localization
  const getLoc = (obj: any) => {
    if (typeof obj === "string") return obj;
    return obj[language] || obj["en"];
  };

  // Load Level Data
  useEffect(() => {
    const region = STORY_REGIONS.find((r) => r.id === regionId);
    if (!region) {
      toast.error(language === "tr" ? "Bölge bulunamadı!" : "Region not found!");
      navigate("/story-mode");
      return;
    }
    const lvl = region.levels.find((l) => l.id === levelId);
    if (!lvl) {
      toast.error(language === "tr" ? "Bölüm bulunamadı!" : "Level not found!");
      navigate("/story-mode");
      return;
    }
    setLevel(lvl);
  }, [regionId, levelId, navigate, language]);

  // Load Decks & Handle Auto-Start
  useEffect(() => {
    try {
      const savedDecks = JSON.parse(localStorage.getItem("acoria-saved-decks") || "[]");
      setAvailableDecks(savedDecks);
      
      // Check for navigation state for auto-start
      const state = (location as any).state as { autoStart?: boolean; deckId?: string } | null;
      
      if (state?.autoStart && state?.deckId) {
         const deck = savedDecks.find((d: any) => d.id === state.deckId);
         if (deck) {
             setSelectedDeckId(deck.id);
             setPlayerDeck(deck);
             setShowIntro(false); // Skip intro to start game immediately
         }
      } else if (savedDecks.length > 0) {
        setSelectedDeckId(savedDecks[0].id);
        setPlayerDeck(savedDecks[0]);
      }
    } catch (e) {
      console.error("Failed to load decks", e);
    }
  }, [location.state]); // Re-run when location state changes (navigation)

  const handleDeckChange = (deckId: string) => {
    setSelectedDeckId(deckId);
    const deck = availableDecks.find(d => d.id === deckId);
    if (deck) setPlayerDeck(deck);
  };

  const handleStartGame = () => {
    if (!playerDeck) {
      toast.error(language === "tr" ? "Lütfen bir deste seç!" : "Please select a deck!");
      return;
    }
    setShowIntro(false);
  };





  const getNextLevelId = () => {
    if (!regionId || !levelId) return null;
    const region = STORY_REGIONS.find(r => r.id === regionId);
    if (!region) return null;

    const currentIndex = region.levels.findIndex(l => l.id === levelId);
    if (currentIndex === -1 || currentIndex === region.levels.length - 1) return null;

    return region.levels[currentIndex + 1].id;
  };

  const handleGameEnd = async (result: "win" | "lose" | "draw", isSurrender?: boolean) => {
    // setShowOutro is removed, logic is handled by passing props to GameMatch
    if (result === "win" || result === "draw") {
      if (level) completeLevel(level.id);
    }

    // Story Mode Rewards:
    // Win = 50 DC, Draw = 25 DC, Lose = 10 DC, Surrender = 0 DC
    let reward = 0;
    if (isSurrender) {
      reward = 0;
    } else if (result === "win") {
      reward = 50;
    } else if (result === "draw") {
      reward = 25;
    } else {
      reward = 10;
    }

    // Save Bot Match Stats and Award Coins
    if (user && playerDeck && level) {
      const { error } = await (supabase.from("bot_match_stats" as any) as any).insert({
        user_id: user.id,
        player_class: playerDeck.mainClass,
        deck_used_name: playerDeck.name,
        opponent_class: level.opponentClass,
        opponent_name: getLoc(level.opponentName),
        result: result,
        player_final_hp: 0,
        opponent_final_hp: 0,
        divine_coins_earned: reward,
      });

      if (error) {
        console.error("Error saving match stats:", error);
      }

      // Award coins
      if (reward > 0) {
        const { error: rpcError } = await supabase.rpc("increment_coins" as any, { amount: reward, user_id: user.id });
        
        if (rpcError) {
          console.warn("[StoryGame] RPC failed, falling back:", rpcError);
          const { data } = await supabase.from("profiles").select("divine_coins").eq("user_id", user.id).single();
          const current = data?.divine_coins || 0;
          await supabase.from("profiles").update({ divine_coins: current + reward } as any).eq("user_id", user.id);
        }
      }
    }
  };

  if (!level) return <div className="bg-black min-h-screen flex items-center justify-center text-gold">{language === "tr" ? "Yükleniyor..." : "Loading..."}</div>;

  return (
    <div className="min-h-screen bg-black relative">
      {/* Dialogue Overlay - Intro */}
      <Dialog open={showIntro} onOpenChange={(open) => {
        if (!open && !playerDeck) navigate("/story-mode"); // Cannot close if no deck, or go back
        // check if we want to allow closing to go back?
      }}>
        <DialogContent className="bg-black/90 border-gold/50 text-gold max-w-lg font-cinzel">
          <DialogHeader className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 border-2 border-gold mb-4 overflow-hidden">
              {/* Opponent Avatar */}
              <img src={`./assets/avatars/${level.opponentClass.toLowerCase()}.jpg`} className="w-full h-full object-cover" />
            </div>
            <DialogTitle className="text-2xl text-gold">{getLoc(level.opponentName)}</DialogTitle>
            <DialogDescription className="text-gold/60 text-lg uppercase tracking-widest">{level.opponentClass}</DialogDescription>
          </DialogHeader>

          <div className="py-4 text-center text-xl italic text-white/90">
            "{getLoc(level.dialogue.intro)}"
          </div>

          {/* Deck Selection */}
          <div className="space-y-2 py-4 border-t border-gold/20">
            <label className="text-sm text-gold/70 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {language === "tr" ? "Savaş Destesi Seç:" : "Select Battle Deck:"}
            </label>
            {availableDecks.length > 0 ? (
              <Select value={selectedDeckId} onValueChange={handleDeckChange}>
                <SelectTrigger className="bg-black/50 border-gold/30 text-gold">
                  <SelectValue placeholder={language === "tr" ? "Deste Seç" : "Select Deck"} />
                </SelectTrigger>
                <SelectContent className="bg-black border-gold/30 text-gold">
                  {availableDecks.map(deck => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name} ({deck.mainClass /* Using mainClass instead of heroClass */})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-red-400 text-center text-sm p-2 border border-red-500/30 rounded bg-red-900/10">
                {language === "tr"
                  ? "Hiç desteniz yok! Önce 'Kütüphane'den bir deste oluşturun."
                  : "You have no decks! Create one in 'Library' first."}
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" className="border-gold/30 hover:bg-gold/10" onClick={() => navigate("/story-mode")}>
              {language === "tr" ? "Geri Dön" : "Go Back"}
            </Button>
            <Button
              disabled={!playerDeck}
              className={cn(
                "font-bold min-w-[120px] transition-colors",
                !playerDeck 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                  : "bg-gold text-black hover:bg-yellow-400 border border-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]"
              )}
              onClick={handleStartGame}
            >
              {language === "tr" ? "Savaşa Başla" : "Start Battle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* The Game */}
      {!showIntro && playerDeck && (
        <GameMatch
          playerDeck={playerDeck}
          opponentClass={level.opponentClass}
          onGameEnd={handleGameEnd}
          onReturnToMap={() => navigate("/story-mode")}
          customReturnLabel={language === "tr" ? "Haritaya Dön" : "Return to Map"}
          onNextLevel={getNextLevelId() ? () => {
             const nextLvl = getNextLevelId();
             if (nextLvl && regionId) {
                 // Force a hard navigation to ensure clean game state
                 window.location.href = `/story-game/${regionId}/${nextLvl}`;
             }
          } : undefined}
          onRetry={() => window.location.reload()}
        />
      )}
    </div>
  );
}
