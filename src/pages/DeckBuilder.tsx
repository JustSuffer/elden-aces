import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/GameCard";
import { DECK, Card } from "@/data/cards";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DeckBuilder = () => {
  const navigate = useNavigate();
  const [customDeck, setCustomDeck] = useState<Card[]>([...DECK]);

  const handleResetDeck = () => {
    setCustomDeck([...DECK]);
    toast.success("Deck reset to default!");
  };

  const handleSaveDeck = () => {
    // In a real app, this would save to backend
    localStorage.setItem("acoria-custom-deck", JSON.stringify(customDeck));
    toast.success("Deck saved successfully!");
  };

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
        <div className="text-xl font-bold text-primary glow-gold">Deck Builder</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetDeck} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button variant="default" onClick={handleSaveDeck} className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Deck Stats */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary glow-gold mb-2">Current Deck</h2>
              <p className="text-muted-foreground">Total Cards: {customDeck.length}/30</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">Numeric: {numericCards.length}</p>
              <p className="text-sm text-muted-foreground">Special: {specialCards.length}</p>
            </div>
          </div>
        </div>

        {/* Special Cards Section */}
        <section>
          <h3 className="text-2xl font-bold text-primary mb-4 glow-gold">Special Cards</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialCards.map((card) => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                <GameCard card={card} />
                <p className="text-xs text-center text-muted-foreground">{card.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Numeric Cards by Color */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-primary glow-gold">Numeric Cards</h3>
          {["phi", "theta", "psi", "omega"].map((color) => {
            const colorCards = numericCards.filter((c) => c.color === color);
            const colorName = color.charAt(0).toUpperCase() + color.slice(1);
            return (
              <div key={color}>
                <h4 className="text-lg font-bold mb-3 capitalize" style={{ color: `hsl(var(--${color}))` }}>
                  {colorName} Cards ({colorCards.length})
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {colorCards.map((card) => (
                    <GameCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Info */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 max-w-2xl mx-auto">
          <h4 className="text-lg font-bold text-primary mb-3">Deck Building Rules</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Each deck must contain exactly 30 cards</li>
            <li>• Standard deck includes 24 numeric cards + 6 special cards</li>
            <li>• Gamma (γ) can only be obtained during gameplay via Dice</li>
            <li>• Custom decks can be used in local matches</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
