import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function StoryGame() {
  const { regionId, levelId } = useParams();
  const navigate = useNavigate();
  const { completeLevel } = useStoryProgress();
  const { language } = useLanguage(); // Get language
  
  const [level, setLevel] = useState<StoryLevel | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showOutro, setShowOutro] = useState<"win" | "lose" | null>(null);

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

  // Load Decks
  useEffect(() => {
     try {
       const savedDecks = JSON.parse(localStorage.getItem("acoria-saved-decks") || "[]");
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
      toast.error(language === "tr" ? "Lütfen bir deste seç!" : "Please select a deck!");
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
                <img src={`/assets/avatars/${level.opponentClass.toLowerCase()}.jpg`} className="w-full h-full object-cover" />
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
               className="bg-gold text-black hover:bg-yellow-400 font-bold min-w-[120px]" 
               onClick={handleStartGame}
               disabled={!playerDeck}
             >
               {language === "tr" ? "Savaşa Başla" : "Start Battle"}
             </Button>
          </DialogFooter>
        </DialogContent>
       </Dialog>

       {/* Dialogue Overlay - Outro */}
        <Dialog open={!!showOutro} onOpenChange={(open) => !open && navigate("/story-mode")}>
        <DialogContent className="bg-black/90 border-gold/50 text-gold max-w-lg font-cinzel">
          <DialogHeader className="text-center">
             <DialogTitle className="text-3xl font-bold mb-2">
               {showOutro === "win" 
                  ? <span className="text-green-500">{language === "tr" ? "ZAFER!" : "VICTORY!"}</span> 
                  : <span className="text-red-500">{language === "tr" ? "YENİLGİ..." : "DEFEAT..."}</span>}
             </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 text-center text-xl italic text-white/90">
             "{showOutro === "win" ? getLoc(level.dialogue.win) : getLoc(level.dialogue.lose)}"
          </div>
          
          {showOutro === "win" && level.rewards && (
             <div className="bg-gold/10 border border-gold/30 p-4 rounded-lg mb-4 text-center">
                <p className="text-sm text-gold/70 uppercase tracking-widest mb-1">{language === "tr" ? "ÖDÜLLER" : "REWARDS"}</p>
                {level.rewards.cardBack && (
                   <div className="flex items-center justify-center gap-2 font-bold text-white">
                     <div className="w-8 h-12 bg-slate-800 border border-gold/50 rounded"></div>
                     {level.rewards.cardBack} {language === "tr" ? "Kart Arkası" : "Card Back"}
                   </div>
                )}
             </div>
          )}

          <DialogFooter className="sm:justify-center">
             <Button className="w-full bg-gold text-black hover:bg-yellow-400 font-bold" onClick={() => navigate("/story-mode")}>
               {language === "tr" ? "Haritaya Dön" : "Return to Map"}
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
