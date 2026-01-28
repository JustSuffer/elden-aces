
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameMatch } from "@/components/game/GameMatch";
import { STORY_REGIONS, StoryLevel } from "@/data/storyData";
import { useStoryProgress } from "@/hooks/useStoryProgress";
import { useGameState } from "@/hooks/useGameState"; // We might need to reset state?
import { Button } from "@/components/ui/button";
import { SavedDeck } from "@/types/deck";
import { MASTER_CLASSES } from "@/data/gameData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function StoryGame() {
  const { regionId, levelId } = useParams();
  const navigate = useNavigate();
  const { completeLevel } = useStoryProgress();
  
  const [level, setLevel] = useState<StoryLevel | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showOutro, setShowOutro] = useState<"win" | "lose" | null>(null);

  // Load Level Data
  useEffect(() => {
    const region = STORY_REGIONS.find((r) => r.id === regionId);
    if (!region) {
      toast.error("Bölge bulunamadı!");
      navigate("/story-mode");
      return;
    }
    const lvl = region.levels.find((l) => l.id === levelId);
    if (!lvl) {
      toast.error("Bölüm bulunamadı!");
      navigate("/story-mode");
      return;
    }
    setLevel(lvl);
  }, [regionId, levelId, navigate]);

  // Mock Player Deck (In a real app, user selects deck before level or uses their active deck)
  // For now, let's use a default deck or local storage deck
  const [playerDeck, setPlayerDeck] = useState<SavedDeck | null>(null);

  useEffect(() => {
     // Try to load last used deck from local storage or create a dummy one
     try {
       const savedDecks = JSON.parse(localStorage.getItem("elden_aces_decks") || "[]");
       if (savedDecks.length > 0) {
         setPlayerDeck(savedDecks[0]);
       } else {
         // Fallback default deck logic if needed, or redirect to deck builder
         toast.error("Lütfen önce Desteni Oluştur!");
         navigate("/library");
       }
     } catch (e) {
       console.error("Failed to load deck", e);
     }
  }, [navigate]);

  const handleGameEnd = (result: "win" | "lose") => {
    setShowOutro(result);
    if (result === "win" && level) {
      completeLevel(level.id);
      // If boss, maybe trigger confetti?
    }
  };

  if (!level || !playerDeck) return <div className="bg-black min-h-screen flex items-center justify-center text-gold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-black relative">
       {/* Dialogue Overlay - Intro */}
       <Dialog open={showIntro} onOpenChange={setShowIntro}>
        <DialogContent className="bg-black/90 border-gold/50 text-gold max-w-lg font-cinzel">
          <DialogHeader className="text-center">
             <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 border-2 border-gold mb-4 overflow-hidden">
                {/* Opponent Avatar */}
                <img src={`/assets/avatars/${level.opponentClass.toLowerCase()}.jpg`} className="w-full h-full object-cover" />
             </div>
             <DialogTitle className="text-2xl text-gold">{level.opponentName}</DialogTitle>
             <DialogDescription className="text-gold/60 text-lg uppercase tracking-widest">{level.opponentClass}</DialogDescription>
          </DialogHeader>
          
          <div className="py-6 text-center text-xl italic text-white/90">
            "{level.dialogue.intro}"
          </div>
          
          <DialogFooter className="sm:justify-center">
             <Button className="w-full bg-gold text-black hover:bg-yellow-400 font-bold" onClick={() => setShowIntro(false)}>
               Savaşa Başla
             </Button>
          </DialogFooter>
        </DialogContent>
       </Dialog>

       {/* Dialogue Overlay - Outro */}
        <Dialog open={!!showOutro} onOpenChange={(open) => !open && navigate("/story-mode")}>
        <DialogContent className="bg-black/90 border-gold/50 text-gold max-w-lg font-cinzel">
          <DialogHeader className="text-center">
             <DialogTitle className="text-3xl font-bold mb-2">
               {showOutro === "win" ? <span className="text-green-500">ZAFER!</span> : <span className="text-red-500">YENİLGİ...</span>}
             </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 text-center text-xl italic text-white/90">
             "{showOutro === "win" ? level.dialogue.win : level.dialogue.lose}"
          </div>
          
          {showOutro === "win" && level.rewards && (
             <div className="bg-gold/10 border border-gold/30 p-4 rounded-lg mb-4 text-center">
                <p className="text-sm text-gold/70 uppercase tracking-widest mb-1">ÖDÜLLER</p>
                {level.rewards.cardBack && (
                   <div className="flex items-center justify-center gap-2 font-bold text-white">
                     <div className="w-8 h-12 bg-slate-800 border border-gold/50 rounded"></div>
                     {level.rewards.cardBack} Kart Arkası
                   </div>
                )}
             </div>
          )}

          <DialogFooter className="sm:justify-center">
             <Button className="w-full bg-gold text-black hover:bg-yellow-400 font-bold" onClick={() => navigate("/story-mode")}>
               Haritaya Dön
             </Button>
          </DialogFooter>
        </DialogContent>
       </Dialog>

      {/* The Game */}
      {!showIntro && (
        <GameMatch
          playerDeck={playerDeck}
          opponentClass={level.opponentClass}
          onGameEnd={handleGameEnd}
          // Pass custom deck if level has one (not implemented in GameMatch yet but good for future)
        />
      )}
      
      {/* Back Button (Only visible if needed, but GameMatch has its own menu usually) */}
    </div>
  );
}
