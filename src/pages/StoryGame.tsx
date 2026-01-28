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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Layers } from "lucide-react";

export default function StoryGame() {
  const { regionId, levelId } = useParams();
  const navigate = useNavigate();
  const { completeLevel } = useStoryProgress();
  
  const [level, setLevel] = useState<StoryLevel | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showOutro, setShowOutro] = useState<"win" | "lose" | null>(null);

  // Deck State
  const [availableDecks, setAvailableDecks] = useState<SavedDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [playerDeck, setPlayerDeck] = useState<SavedDeck | null>(null);

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

  // Load Decks
  useEffect(() => {
     try {
       const savedDecks = JSON.parse(localStorage.getItem("elden_aces_decks") || "[]");
       setAvailableDecks(savedDecks);
       if (savedDecks.length > 0) {
         setSelectedDeckId(savedDecks[0].id);
         setPlayerDeck(savedDecks[0]);
       }
     } catch (e) {
       console.error("Failed to load decks", e);
     }
  }, []);

  const handleDeckChange = (deckId: string) => {
    setSelectedDeckId(deckId);
    const deck = availableDecks.find(d => d.id === deckId);
    if (deck) setPlayerDeck(deck);
  };

  const handleStartGame = () => {
    if (!playerDeck) {
      toast.error("Lütfen bir deste seç!");
      return;
    }
    setShowIntro(false);
  };

  const handleGameEnd = (result: "win" | "lose") => {
    setShowOutro(result);
    if (result === "win" && level) {
      completeLevel(level.id);
    }
  };

  if (!level) return <div className="bg-black min-h-screen flex items-center justify-center text-gold">Yükleniyor...</div>;

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
                <img src={`/assets/avatars/${level.opponentClass.toLowerCase()}.jpg`} className="w-full h-full object-cover" />
             </div>
             <DialogTitle className="text-2xl text-gold">{level.opponentName}</DialogTitle>
             <DialogDescription className="text-gold/60 text-lg uppercase tracking-widest">{level.opponentClass}</DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center text-xl italic text-white/90">
            "{level.dialogue.intro}"
          </div>

          {/* Deck Selection */}
          <div className="space-y-2 py-4 border-t border-gold/20">
            <label className="text-sm text-gold/70 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Savaş Destesi Seç:
            </label>
            {availableDecks.length > 0 ? (
              <Select value={selectedDeckId} onValueChange={handleDeckChange}>
                <SelectTrigger className="bg-black/50 border-gold/30 text-gold">
                  <SelectValue placeholder="Deste Seç" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gold/30 text-gold">
                  {availableDecks.map(deck => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name} ({deck.heroClass})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
               <div className="text-red-400 text-center text-sm p-2 border border-red-500/30 rounded bg-red-900/10">
                 Hiç desteniz yok! Önce "Kütüphane"den bir deste oluşturun.
               </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-center gap-2">
             <Button variant="outline" className="border-gold/30 hover:bg-gold/10" onClick={() => navigate("/story-mode")}>
               Geri Dön
             </Button>
             <Button 
               className="bg-gold text-black hover:bg-yellow-400 font-bold min-w-[120px]" 
               onClick={handleStartGame}
               disabled={!playerDeck}
             >
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
      {!showIntro && playerDeck && (
        <GameMatch
          playerDeck={playerDeck}
          opponentClass={level.opponentClass}
          onGameEnd={handleGameEnd}
        />
      )}
    </div>
  );
}
