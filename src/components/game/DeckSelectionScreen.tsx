import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Swords, Shuffle } from "lucide-react";
import { useState, useEffect } from "react";
import { SavedDeck } from "@/types/deck";
import { ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "./CharacterAvatar";
import { useLanguage } from "@/hooks/useLanguage";

const ALL_CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper",
  "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"
];

interface DeckSelectionScreenProps {
  onStartGame: (deck: SavedDeck, opponentClass: ClassName) => void;
}

export const DeckSelectionScreen = ({ onStartGame }: DeckSelectionScreenProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<SavedDeck | null>(null);
  const [opponentClass, setOpponentClass] = useState<ClassName | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("acoria-saved-decks");
    if (stored) {
      try {
        let decks = JSON.parse(stored);
        
        // Migration: Old Class Names -> New
        decks = decks.map((d: any) => ({
          ...d,
          mainClass: d.mainClass === "Incinerator" ? "Decay" : (d.mainClass === "Conjurer" ? "Vessel" : d.mainClass),
          secondaryClasses: d.secondaryClasses ? d.secondaryClasses.map((c: any) => 
             c === "Incinerator" ? "Decay" : (c === "Conjurer" ? "Vessel" : c)
          ) : []
        })).filter((d: any) => MASTER_CLASSES[d.mainClass as ClassName]);

        setSavedDecks(decks);
        if (decks.length > 0) {
          setSelectedDeck(decks[0]);
        }
        
        // Save back sanitized version
        localStorage.setItem("acoria-saved-decks", JSON.stringify(decks));
      } catch (e) {
        console.error("Failed to load decks", e);
        // Do not clear immediately to avoid data loss on simple json error, but safe to ignore.
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
      // If opponent is Mimic, they copy the player's class
      const effectiveOpponentClass = opponentClass === "Mimic" ? selectedDeck.mainClass : opponentClass;
      onStartGame(selectedDeck, effectiveOpponentClass);
    }
  };

  if (savedDecks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">{t("deckSelection.noDeck")}</h2>
          <p className="text-muted-foreground mb-6">{t("deckSelection.noDeckDesc")}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />{t("deckSelection.menu")}</Button>
            <Button onClick={() => navigate("/deck-builder")}>{t("deckSelection.createDeck")}</Button>
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
          <ArrowLeft className="w-4 h-4" />{t("deckSelection.menu")}</Button>
        <div className="text-xl font-bold text-primary glow-gold font-cinzel">{t("deckSelection.prepare")}</div>
        <div className="w-24" />
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Player Deck Selection */}
        <div className="flex-1 bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-6 font-cinzel text-center">{t("deckSelection.chooseDeck")}</h2>
          
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
                    <CharacterAvatar 
                      className={deck.mainClass} 
                      isPlayer={true} 
                      characterName={classData.heroName || deck.mainClass}
                      sizeClass="w-14 h-14"
                      hideName={true}
                    />
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
              <h4 className="text-sm font-bold text-primary mb-2">{t("deckSelection.winCon")}</h4>
              <p className="text-sm text-muted-foreground">
                {MASTER_CLASSES[selectedDeck.mainClass].winCondition}
              </p>
              {MASTER_CLASSES[selectedDeck.mainClass].loseCondition && (
                <>
                  <h4 className="text-sm font-bold text-destructive mt-3 mb-2">{t("deckSelection.loseCon")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {MASTER_CLASSES[selectedDeck.mainClass].loseCondition}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

                {/* VS Divider & Start Button */}
        <div className="flex flex-col items-center justify-center gap-6 my-4 lg:my-0">
          <div className="bg-primary/20 border border-primary/50 rounded-full p-4 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <Swords className="w-8 h-8 text-primary" />
          </div>
          <Button
            size="lg"
            onClick={handleStartGame}
            disabled={!selectedDeck || !opponentClass}
            className="text-xl px-8 py-6 font-cinzel shadow-lg shadow-primary/20 hover:scale-105 transition-all whitespace-nowrap"
          >
            <Swords className="w-6 h-6 mr-3" />
            {t("deckSelection.start")}
          </Button>
        </div>

        {/* Opponent Class Display */}
        <div className="flex-1 bg-card/50 backdrop-blur-sm border border-destructive/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-destructive glow-gold font-cinzel">
              {t("game.opponent")} (Bot)
            </h2>
            <Button variant="outline" size="sm" onClick={handleRandomizeOpponent}>
              <Shuffle className="w-4 h-4 mr-2" />{t("deckSelection.change")}</Button>
          </div>

          {opponentClass && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="mb-4">
                <CharacterAvatar 
                  className={opponentClass} 
                  isPlayer={false} 
                  characterName={MASTER_CLASSES[opponentClass].heroName || opponentClass}
                  sizeClass="w-32 h-32 md:w-40 md:h-40"
                />
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
                <h4 className="text-sm font-bold text-destructive mb-2">{t("deckSelection.oppWinCon")}</h4>
                <p className="text-sm text-muted-foreground">
                  {MASTER_CLASSES[opponentClass].winCondition}
                </p>
              </div>

              {selectedDeck && MASTER_CLASSES[selectedDeck.mainClass].counterLogic?.[opponentClass] && (
                <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 w-full max-w-sm">
                  <h4 className="text-sm font-bold text-yellow-500 mb-2">{t("deckSelection.specialRule")}</h4>
                  <p className="text-sm text-yellow-200">
                    {MASTER_CLASSES[selectedDeck.mainClass].counterLogic![opponentClass]}
                  </p>
                </div>
              )}

              <div className="w-full border-t border-border/50 my-6" />
              
              <div className="w-full">
                <h3 className="text-xs font-bold text-muted-foreground mb-3 text-center uppercase tracking-widest">{t("deckSelection.orChoose")}</h3>
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto acoria-scrollbar p-1">
                    {ALL_CLASSES.map((cls) => (
                        <button
                            key={cls}
                            onClick={() => setOpponentClass(cls)}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded border transition-all h-16",
                                opponentClass === cls 
                                ? "bg-destructive/20 border-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)] scale-105" 
                                : "bg-background/30 border-border/50 hover:bg-destructive/10 hover:border-destructive/50"
                            )}
                        >
                            <span className="text-xl font-bold flex items-center gap-2" style={{ color: MASTER_CLASSES[cls].color }}>
                                <img 
                                  src={`./assets/avatars/${cls.toLowerCase()}.jpg`}
                                  alt={cls}
                                  className="w-8 h-8 rounded-full border border-current object-cover shadow-sm"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "./assets/avatars/vitalist.jpg";
                                  }}
                                />
                                {MASTER_CLASSES[cls].symbol}
                            </span>
                             <span className="text-[10px] font-bold text-muted-foreground mt-1 truncate w-full text-center">
                                {cls}
                            </span>
                        </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
};
