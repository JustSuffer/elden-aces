import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/GameCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ClassName, Card, SpecialCardType } from "@/types/game";
import { MASTER_CLASSES, SPECIAL_CARDS_DATA } from "@/data/gameData";
import { cn } from "@/lib/utils";

// All available classes for deck building
const ALL_CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper",
  "Cryomancer", "Incinerator", "Siren", "Augmentor", "Conjurer", "Mimic"
];

// Generate 6 numeric cards for a class (values 1-6)
function generateClassCards(className: ClassName): Card[] {
  const classData = MASTER_CLASSES[className];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `${className.toLowerCase()}-${i + 1}`,
    name: `${classData.name} ${i + 1}`,
    symbol: classData.symbol,
    value: i + 1,
    type: "numeric" as const,
    classSymbol: classData.symbol,
    color: classData.color,
  }));
}

// Generate 6 special cards (standard set)
function generateSpecialCards(): Card[] {
  const specialTypes: SpecialCardType[] = ["twisted", "twisted", "deflate", "deflate", "delta", "sigma"];
  return specialTypes.map((type, idx) => ({
    id: `special-${type}-${idx}`,
    name: SPECIAL_CARDS_DATA[type].name,
    symbol: SPECIAL_CARDS_DATA[type].symbol,
    type: "special" as const,
    specialType: type,
    value: 0,
    description: SPECIAL_CARDS_DATA[type].description,
    color: "primary",
  }));
}

const DeckBuilder = () => {
  const navigate = useNavigate();
  
  // Main class selection
  const [mainClass, setMainClass] = useState<ClassName | null>(null);
  
  // Secondary classes (exactly 3 required)
  const [secondaryClasses, setSecondaryClasses] = useState<ClassName[]>([]);

  // Available classes for secondary selection (exclude main class)
  const availableSecondary = useMemo(() => 
    ALL_CLASSES.filter(c => c !== mainClass),
    [mainClass]
  );

  // Build the deck based on selections
  const customDeck = useMemo<Card[]>(() => {
    if (!mainClass || secondaryClasses.length !== 3) return [];
    
    const deck: Card[] = [];
    
    // 1. Main class cards (6 cards, values 1-6)
    deck.push(...generateClassCards(mainClass));
    
    // 2. Special cards (6 cards)
    deck.push(...generateSpecialCards());
    
    // 3. Secondary class cards (3 classes × 6 cards = 18 cards)
    secondaryClasses.forEach(className => {
      deck.push(...generateClassCards(className));
    });
    
    return deck;
  }, [mainClass, secondaryClasses]);

  const handleMainClassSelect = (className: ClassName) => {
    setMainClass(className);
    // Remove from secondary if it was selected
    setSecondaryClasses(prev => prev.filter(c => c !== className));
  };

  const handleSecondaryToggle = (className: ClassName) => {
    setSecondaryClasses(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else if (prev.length < 3) {
        return [...prev, className];
      }
      return prev;
    });
  };

  const handleResetDeck = () => {
    setMainClass(null);
    setSecondaryClasses([]);
    toast.success("Deck reset!");
  };

  const handleSaveDeck = () => {
    if (!mainClass || secondaryClasses.length !== 3) {
      toast.error("Please select a main class and 3 secondary classes!");
      return;
    }
    
    const deckConfig = { mainClass, secondaryClasses };
    localStorage.setItem("acoria-deck-config", JSON.stringify(deckConfig));
    localStorage.setItem("acoria-custom-deck", JSON.stringify(customDeck));
    toast.success("Deck saved successfully!");
  };

  const isComplete = mainClass && secondaryClasses.length === 3;
  const numericCards = customDeck.filter((c) => c.type === "numeric");
  const specialCards = customDeck.filter((c) => c.type === "special");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menu
        </Button>
        <div className="text-xl font-bold text-primary glow-gold font-cinzel">Deck Builder</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetDeck} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button 
            variant="default" 
            onClick={handleSaveDeck} 
            className="gap-2"
            disabled={!isComplete}
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Step 1: Main Class Selection */}
        <section className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
            1. Select Main Class
          </h2>
          <p className="text-muted-foreground mb-4">
            Your main class determines your abilities, win conditions, and starting HP.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ALL_CLASSES.map((className) => {
              const classData = MASTER_CLASSES[className];
              const isSelected = mainClass === className;
              return (
                <button
                  key={className}
                  onClick={() => handleMainClassSelect(className)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                    isSelected 
                      ? "border-primary bg-primary/20 shadow-lg shadow-primary/30" 
                      : "border-border hover:border-primary/50 bg-card/50"
                  )}
                >
                  <div 
                    className="text-3xl mb-2 font-bold"
                    style={{ color: classData.color }}
                  >
                    {classData.symbol}
                  </div>
                  <div className="text-sm font-bold text-foreground">{className}</div>
                  <div className="text-xs text-muted-foreground">{classData.role}</div>
                  <div className="text-xs text-muted-foreground mt-1">HP: {classData.initialHP}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Secondary Classes */}
        {mainClass && (
          <section className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
              2. Select 3 Secondary Classes
            </h2>
            <p className="text-muted-foreground mb-4">
              Choose 3 classes to add their numeric cards (1-6) to your deck. 
              <span className="text-primary font-bold"> ({secondaryClasses.length}/3 selected)</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-3">
              {availableSecondary.map((className) => {
                const classData = MASTER_CLASSES[className];
                const isSelected = secondaryClasses.includes(className);
                const isDisabled = !isSelected && secondaryClasses.length >= 3;
                return (
                  <button
                    key={className}
                    onClick={() => !isDisabled && handleSecondaryToggle(className)}
                    disabled={isDisabled}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-left relative",
                      isSelected 
                        ? "border-primary bg-primary/20" 
                        : isDisabled
                        ? "border-border/50 bg-card/30 opacity-50 cursor-not-allowed"
                        : "border-border hover:border-primary/50 bg-card/50"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div 
                      className="text-2xl mb-1 font-bold"
                      style={{ color: classData.color }}
                    >
                      {classData.symbol}
                    </div>
                    <div className="text-sm font-bold text-foreground">{className}</div>
                    <div className="text-xs text-muted-foreground">6 cards (1-6)</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Deck Preview */}
        {isComplete && (
          <>
            {/* Deck Stats */}
            <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-primary glow-gold mb-2 font-cinzel">
                    Your Deck
                  </h2>
                  <p className="text-muted-foreground">
                    Main Class: <span className="text-primary font-bold">{mainClass}</span>
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold text-primary">{customDeck.length}/30 Cards</p>
                  <p className="text-sm text-muted-foreground">
                    {numericCards.length} Numeric | {specialCards.length} Special
                  </p>
                </div>
              </div>
            </div>

            {/* Special Cards */}
            <section>
              <h3 className="text-xl font-bold text-primary mb-4 glow-gold font-cinzel">
                Special Cards (6)
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {specialCards.map((card) => (
                  <div key={card.id} className="flex flex-col items-center gap-2">
                    <GameCard card={card} />
                    <p className="text-xs text-center text-muted-foreground">{card.name}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Main Class Cards */}
            <section>
              <h3 className="text-xl font-bold mb-4 font-cinzel" style={{ color: MASTER_CLASSES[mainClass].color }}>
                {mainClass} Cards (6) - Main Class
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {numericCards
                  .filter(c => c.classSymbol === MASTER_CLASSES[mainClass].symbol)
                  .map((card) => (
                    <GameCard key={card.id} card={card} />
                  ))}
              </div>
            </section>

            {/* Secondary Class Cards */}
            {secondaryClasses.map((className) => (
              <section key={className}>
                <h3 className="text-xl font-bold mb-4 font-cinzel" style={{ color: MASTER_CLASSES[className].color }}>
                  {className} Cards (6)
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {numericCards
                    .filter(c => c.classSymbol === MASTER_CLASSES[className].symbol)
                    .map((card) => (
                      <GameCard key={card.id} card={card} />
                    ))}
                </div>
              </section>
            ))}
          </>
        )}

        {/* Deck Building Rules */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 max-w-2xl mx-auto">
          <h4 className="text-lg font-bold text-primary mb-3 font-cinzel">Deck Building Rules</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Each deck contains exactly <span className="text-primary font-bold">30 cards</span></li>
            <li>• <span className="text-primary">Main Class:</span> 6 numeric cards (1-6) + determines abilities</li>
            <li>• <span className="text-primary">Special Cards:</span> 6 cards (2× Twisted α, 2× Deflate β, 1× Delta Δ, 1× Sigma Σ)</li>
            <li>• <span className="text-primary">Secondary Classes:</span> Choose 3 classes, each adds 6 cards (1-6)</li>
            <li>• Total: 6 (main) + 6 (special) + 18 (3×6 secondary) = 30 cards</li>
            <li>• Gamma (γ) can only be obtained via Dice during gameplay</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
