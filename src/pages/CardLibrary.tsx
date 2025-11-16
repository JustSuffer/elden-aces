import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/GameCard";
import { DECK } from "@/data/cards";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

const CardLibrary = () => {
  const navigate = useNavigate();

  // Group cards by type
  const numericCards = DECK.filter((c) => c.type === "numeric");
  const specialCards = DECK.filter((c) => c.type === "special");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menu
        </Button>
        <div className="text-xl font-bold text-primary glow-gold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Card Library
        </div>
        <div className="w-24" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Special Cards */}
        <section>
          <h2 className="text-3xl font-bold text-primary mb-6 glow-gold">Special Cards</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialCards.map((card) => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                <GameCard card={card} />
                <p className="text-sm text-center text-muted-foreground">{card.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Numeric Cards */}
        <section>
          <h2 className="text-3xl font-bold text-primary mb-6 glow-gold">Numeric Cards</h2>
          <div className="space-y-8">
            {["phi", "theta", "psi", "omega"].map((color) => {
              const colorCards = numericCards.filter((c) => c.color === color);
              const colorName = color.charAt(0).toUpperCase() + color.slice(1);
              return (
                <div key={color}>
                  <h3 className="text-xl font-bold mb-4 capitalize" style={{ color: `hsl(var(--${color}))` }}>
                    {colorName} (Φ, Θ, Ψ, Ω)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {colorCards.map((card) => (
                      <GameCard key={card.id} card={card} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Info */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-primary mb-4">Total Cards: 30</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• 24 Numeric Cards (1-6 × 4 symbols)</li>
            <li>• 2 Twisted (α) - Special</li>
            <li>• 2 Deflate (β) - Special</li>
            <li>• 1 Delta (Δ) - Special</li>
            <li>• 1 Sigma (Σ) - Special</li>
            <li>• Gamma (γ) - Only obtainable via Dice</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CardLibrary;
