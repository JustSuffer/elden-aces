import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Swords, Shuffle } from "lucide-react";
import { useState, useEffect } from "react";
import { SavedDeck } from "@/types/deck";
import { ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";
import { cn } from "@/lib/utils";

const ALL_CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper",
  "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"
];

interface DeckSelectionScreenProps {
  onStartGame: (deck: SavedDeck, opponentClass: ClassName) => void;
}

export const DeckSelectionScreen = ({ onStartGame }: DeckSelectionScreenProps) => {
  const navigate = useNavigate();
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<SavedDeck | null>(null);
  const [opponentClass, setOpponentClass] = useState<ClassName | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("acoria-saved-decks");
    if (stored) {
      const decks = JSON.parse(stored);
      setSavedDecks(decks);
      if (decks.length > 0) {
        setSelectedDeck(decks[0]);
      }
    }
    // Randomly select opponent class
    const randomClass = ALL_CLASSES[Math.floor(Math.random() * ALL_CLASSES.length)];
    setOpponentClass(randomClass);
  }, []);

  const handleRandomizeOpponent = () => {
    const randomClass = ALL_CLASSES[Math.floor(Math.random() * ALL_CLASSES.length)];
    setOpponentClass(randomClass);
  };

  const handleStartGame = () => {
    if (selectedDeck && opponentClass) {
      onStartGame(selectedDeck, opponentClass);
    }
  };

  if (savedDecks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
            Deste Bulunamadı
          </h2>
          <p className="text-muted-foreground mb-6">
            Oyuna başlamadan önce Deste Oluşturucu'da bir deste kaydetmelisiniz.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Menü
            </Button>
            <Button onClick={() => navigate("/deck-builder")}>
              Deste Oluştur
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menü
        </Button>
        <div className="text-xl font-bold text-primary glow-gold font-cinzel">Savaşa Hazırlan</div>
        <div className="w-24" />
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Player Deck Selection */}
        <div className="flex-1 bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-6 font-cinzel text-center">
            Desteni Seç
          </h2>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto acoria-scrollbar pr-2">
            {savedDecks.map((deck) => {
              const classData = MASTER_CLASSES[deck.mainClass];
              const isSelected = selectedDeck?.id === deck.id;
              return (
                <button
                  key={deck.id}
                  onClick={() => setSelectedDeck(deck)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                    isSelected 
                      ? "border-primary bg-primary/20 shadow-lg shadow-primary/30" 
                      : "border-border hover:border-primary/50 bg-card/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="text-4xl font-bold"
                      style={{ color: classData.color }}
                    >
                      {classData.symbol}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">{deck.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {deck.mainClass} ({classData.role})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        + {deck.secondaryClasses.join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: classData.color }}>
                        HP: {classData.initialHP}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedDeck && (
            <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border">
              <h4 className="text-sm font-bold text-primary mb-2">Kazanma Koşulu:</h4>
              <p className="text-sm text-muted-foreground">
                {MASTER_CLASSES[selectedDeck.mainClass].winCondition}
              </p>
              {MASTER_CLASSES[selectedDeck.mainClass].loseCondition && (
                <>
                  <h4 className="text-sm font-bold text-destructive mt-3 mb-2">Kaybetme Koşulu:</h4>
                  <p className="text-sm text-muted-foreground">
                    {MASTER_CLASSES[selectedDeck.mainClass].loseCondition}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="bg-primary/20 border border-primary/50 rounded-full p-4">
            <Swords className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Opponent Class Display */}
        <div className="flex-1 bg-card/50 backdrop-blur-sm border border-destructive/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-destructive glow-gold font-cinzel">
              Rakip (Bot)
            </h2>
            <Button variant="outline" size="sm" onClick={handleRandomizeOpponent}>
              <Shuffle className="w-4 h-4 mr-2" />
              Değiştir
            </Button>
          </div>

          {opponentClass && (
            <div className="flex flex-col items-center justify-center py-8">
              <div 
                className="text-8xl font-bold mb-4"
                style={{ color: MASTER_CLASSES[opponentClass].color }}
              >
                {MASTER_CLASSES[opponentClass].symbol}
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2 font-cinzel">
                {opponentClass}
              </h3>
              <p className="text-lg text-muted-foreground mb-4">
                {MASTER_CLASSES[opponentClass].role}
              </p>
              <div className="text-xl font-bold" style={{ color: MASTER_CLASSES[opponentClass].color }}>
                HP: {MASTER_CLASSES[opponentClass].initialHP}
              </div>

              <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border w-full max-w-sm">
                <h4 className="text-sm font-bold text-destructive mb-2">Rakip Kazanma Koşulu:</h4>
                <p className="text-sm text-muted-foreground">
                  {MASTER_CLASSES[opponentClass].winCondition}
                </p>
              </div>

              {/* Counter Logic Display */}
              {selectedDeck && MASTER_CLASSES[selectedDeck.mainClass].counterLogic?.[opponentClass] && (
                <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 w-full max-w-sm">
                  <h4 className="text-sm font-bold text-yellow-500 mb-2">⚠️ Özel Eşleşme Kuralı:</h4>
                  <p className="text-sm text-yellow-200">
                    {MASTER_CLASSES[selectedDeck.mainClass].counterLogic![opponentClass]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Start Button */}
      <div className="p-6 border-t border-border">
        <div className="container mx-auto flex justify-center">
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={!selectedDeck || !opponentClass}
            className="text-xl px-12 py-6 font-cinzel"
          >
            <Swords className="w-6 h-6 mr-3" />
            Savaşı Başlat
          </Button>
        </div>
      </div>
    </div>
  );
};
