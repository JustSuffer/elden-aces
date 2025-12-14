import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/GameCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { MASTER_CLASSES, SPECIAL_CARDS_DATA } from "@/data/gameData";
import { ClassName, Card, SpecialCardType } from "@/types/game";
import { useLanguage } from "@/hooks/useLanguage";

const ALL_CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper",
  "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"
];

const SPECIAL_TYPES: SpecialCardType[] = ["twisted", "deflate", "gamma", "delta", "sigma", "die"];

const CardLibrary = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Generate sample cards for display
  const generateClassCards = (className: ClassName): Card[] => {
    const classData = MASTER_CLASSES[className];
    return Array.from({ length: 6 }, (_, i) => ({
      id: `${className.toLowerCase()}-${i + 1}`,
      name: `${classData.name} ${i + 1}`, // Name can stay generic or use t() if we had keys
      symbol: classData.symbol,
      value: i + 1,
      type: "numeric" as const,
      classSymbol: classData.symbol,
      color: classData.color,
    }));
  };

  const generateSpecialCards = (): Card[] => {
    return SPECIAL_TYPES.map((type, idx) => {
      // Use t() for description
      let desc = "";
      let name = "";
      if (type === "die") {
        desc = t("howToPlay.cards.die.desc");
        name = t("howToPlay.cards.die.name");
      } else {
        // @ts-ignore
        desc = t(`howToPlay.cards.${type}.desc`);
        // @ts-ignore
        name = t(`howToPlay.cards.${type}.name`) || SPECIAL_CARDS_DATA[type].name;
      }

      return {
        id: `special-${type}-${idx}`,
        name: name,
        symbol: SPECIAL_CARDS_DATA[type]?.symbol || "Π",
        type: "special" as const,
        specialType: type,
        value: 0,
        description: desc,
        color: "#fef08a",
      };
    });
  };

  const specialCards = generateSpecialCards();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("menu.back")}
        </Button>
        <div className="text-xl font-bold text-primary glow-gold flex items-center gap-2 font-cinzel">
          <BookOpen className="w-6 h-6" />
          {t("library.title")}
        </div>
        <div className="w-24" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Special Cards */}
        <section>
          <h2 className="text-3xl font-bold text-primary mb-6 glow-gold font-cinzel">{t("library.special")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specialCards.map((card) => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                <GameCard card={card} showEyeIcon />
                <p className="text-sm text-center text-muted-foreground mt-8 text-balance">{card.name}</p>
                <p className="text-xs text-center text-muted-foreground/70">{card.symbol}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Class Cards - All 11 Classes */}
        <section>
          <h2 className="text-3xl font-bold text-primary mb-6 glow-gold font-cinzel">{t("library.classes")}</h2>
          <div className="space-y-8">
            {ALL_CLASSES.map((className) => {
              const classData = MASTER_CLASSES[className];
              const cards = generateClassCards(className);
              const classKey = className.toLowerCase();

              return (
                <div key={className} className="bg-card/30 rounded-lg p-6 border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl font-bold" style={{ color: classData.color }}>
                      {classData.symbol}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: classData.color }}>
                        {className}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {/* @ts-ignore */}
                        {t(`classes.${classKey}.role`)} | HP: {classData.initialHP}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {cards.map((card) => (
                      <GameCard key={card.id} card={card} showEyeIcon />
                    ))}
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-semibold">{t("library.winCon")}:</span>
                      {/* @ts-ignore */}
                      {" "}{t(`classes.${classKey}.winCon`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-semibold">{t("classes.mechanic")}:</span>
                      {/* @ts-ignore */}
                      {" "}{t(`classes.${classKey}.passive`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Info */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-primary mb-4 font-cinzel">{t("library.deckComp")}</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• <span className="text-primary font-bold">Main Class:</span> 6 cards (values 1-6)</li>
            <li>• <span className="text-primary font-bold">Special Cards:</span> 6 cards (2× Twisted α, 2× Deflate β, 1× Delta Δ, 1× Sigma Σ)</li>
            <li>• <span className="text-primary font-bold">Secondary Classes:</span> 3 classes × 6 cards = 18 cards</li>
            <li>• <span className="text-primary font-bold">Gamma (γ):</span> Only obtainable via Dice during gameplay</li>
            <li>• <span className="text-primary font-bold">The Die (Π):</span> Fateweaver exclusive, Round 3+</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CardLibrary;
