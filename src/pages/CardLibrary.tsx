import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game/GameCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, User, Book } from "lucide-react";
import { MASTER_CLASSES, SPECIAL_CARDS_DATA } from "@/data/gameData";
import { ClassName, Card, SpecialCardType } from "@/types/game";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";

const ALL_CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper",
  "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"
];

const SPECIAL_TYPES: SpecialCardType[] = ["twisted", "deflate", "gamma", "delta", "sigma", "die"];

const HERO_LORE: Record<ClassName, string> = {
  Vitalist: "Freya, the last guardian of the Verdant Grove, draws her power from the life force of the earth itself. She believes that endurance is the truest form of strength, and her mere presence accelerates the mending of wounds. In battle, she is a towering figure of resilience, outlasting enemies until they collapse from exhaustion.",
  Slayer: "Ragnar was born in the blood-pits of the Crimson Arena. He knows no magic, only the brute efficiency of steel and muscle. Despised by mages for his immunity to their tricks, he hunts those who hide behind spells. His philosophy is simple: if it bleeds, it dies. And everything bleeds.",
  Fateweaver: "Dante, a high-stakes gambler who wagered his soul against a demon and won, now manipulates the threads of destiny. He sees the world as a game of chance where he controls the dice. He bides his time, stacking the odds in his favor, before unleashing a catastrophic stroke of fortune that obliterates his foes.",
  Oracle: "Vesper stares too long into the void, and the void stares back. Cursed with visions of the future, she seeks to hasten the inevitable end. She willingly sacrifices her own sanity and vitality to unravel the minds of her opponents, pulling the future into the present to erase their decks before they can even play them.",
  Chronokeeper: "Rix is a traveler from a timeline that no longer exists. Obsessed with preventing the heat death of the universe, he manipulates the flow of time to pause, rewind, or skip moments entirely. To fight him is to fight entropy itself; you may find your turn skipped, or your existence erased from the timeline.",
  Cryomancer: "Alric hails from the frozen wastes of the North, where the only warmth is the blood of enemies. He commands the biting cold, freezing magic and muscle alike. His enemies find their capabilities locked away in ice, helpless as he methodically shatters them one by one.",
  Decay: "Mordred is a druid corrupted by the necrotic rot he sought to cure. Now, he embraces the cycle of decomposition. He burns through resources—both his and his opponent's—with reckless abandon, believing that from the ashes of destruction, a stronger order will arise. Fire is his cleanser.",
  Siren: "Lina's voice is both a gift and a weapon. A master thief and manipulator, she doesn't just steal gold; she steals power. She lures enemies into a false sense of security before turning their own strengths against them. Why bring a weapon when you can just take your opponent's?",
  Augmentor: "Olin is a technomancer who views the organic body as a flaw to be corrected. Through arcane engineering, he enhances every tool at his disposal. He starts slow, analyzing and upgrading, until his creations become unstoppable engines of perfection that overwhelm by sheer mathematical superiority.",
  Vessel: "Helios is a hollow shell filled with cosmic energy. He acts as a gateway for entities from other dimensions. He doesn't fight alone; he brings the swarm. By channeling the power of the stars, he summons an endless tide of constructs, drowning his enemies in a flood of celestial wrath.",
  Mimic: "Jane has no face, no past, and no true self. She is a perfect mirror, reflecting the greatest strengths of those she encounters. She scoffs at the idea of unique power, proving that anything you can do, she can do better. To fight her is to fight a perfected version of yourself."
};

const CardLibrary = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'cards' | 'heroes'>('cards');
  const [selectedHero, setSelectedHero] = useState<ClassName | null>(null);

  // Generate sample cards for display
  const generateClassCards = (className: ClassName): Card[] => {
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
  };

  const generateSpecialCards = (): Card[] => {
    return SPECIAL_TYPES.map((type, idx) => {
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
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-20">
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

      {/* Tabs */}
      <div className="flex justify-center border-b border-border/50 sticky top-[73px] bg-background/95 backdrop-blur z-10">
        <div className="flex gap-8">
            <button
                onClick={() => setActiveTab('cards')}
                className={cn(
                    "px-6 py-4 text-lg font-cinzel transition-colors border-b-2 flex items-center gap-2",
                    activeTab === 'cards' 
                    ? "border-primary text-primary glow-gold" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
            >
                <Book className="w-5 h-5" />
                {t("library.title")}
            </button>
            <button
                onClick={() => setActiveTab('heroes')}
                className={cn(
                    "px-6 py-4 text-lg font-cinzel transition-colors border-b-2 flex items-center gap-2",
                    activeTab === 'heroes' 
                    ? "border-primary text-primary glow-gold" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
            >
                <User className="w-5 h-5" />
                Hero Library
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* CARDS VIEW */}
        {activeTab === 'cards' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                {/* Class Cards */}
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

                 <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 max-w-3xl mx-auto mt-12">
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
        )}

        {/* HEROES VIEW */}
        {activeTab === 'heroes' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {ALL_CLASSES.map((className) => {
                        const classData = MASTER_CLASSES[className];
                        return (
                            <button 
                                key={className}
                                onClick={() => setSelectedHero(className)}
                                className="group relative bg-card/40 border border-primary/20 rounded-xl overflow-hidden hover:border-primary/60 transition-all hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] text-left flex flex-col h-[300px]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                                
                                {/* Hero Image Placeholder / Avatar */}
                                <div className="flex-1 w-full bg-black/50 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                                   <CharacterAvatar 
                                        className={className} 
                                        isPlayer={true} 
                                        characterName={classData.heroName || className}
                                        hideName
                                        classNameOverride="w-32 h-32 md:w-48 md:h-48 text-6xl"
                                   />
                                </div>

                                <div className="relative z-20 p-4 border-t border-primary/10 bg-card/60 backdrop-blur-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-bold font-cinzel" style={{ color: classData.color }}>
                                                {classData.heroName || className}
                                            </h3>
                                            <p className="text-sm text-muted-foreground font-bold tracking-wider uppercase opacity-80 mb-1">
                                                {className}
                                            </p>
                                        </div>
                                        <span className="text-2xl font-bold opacity-50">{classData.symbol}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                                        {HERO_LORE[className].substring(0, 100)}...
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
             </div>
        )}
      </div>

      {/* Hero Detail Popup */}
      <Dialog open={!!selectedHero} onOpenChange={(val) => !val && setSelectedHero(null)}>
        <DialogContent className="max-w-4xl bg-black/95 border-primary/40 p-0 overflow-hidden text-foreground">
            {selectedHero && (() => {
                const classData = MASTER_CLASSES[selectedHero];
                return (
                    <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                        {/* Left: Visual */}
                        <div className="w-full md:w-1/3 bg-muted/10 relative flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-primary/20">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color)_0%,_transparent_70%)] opacity-20" style={{ '--color': classData.color } as any} />
                            <CharacterAvatar 
                                className={selectedHero} 
                                isPlayer={true} 
                                characterName={classData.heroName || selectedHero}
                                hideName
                                classNameOverride="w-48 h-48 md:w-64 md:h-64 text-8xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                           />
                           <div className="absolute bottom-4 left-0 right-0 text-center opacity-30 text-[10rem] font-bold leading-none pointer-events-none select-none overflow-hidden" style={{ color: classData.color }}>
                                {classData.symbol}
                           </div>
                        </div>

                        {/* Right: Info */}
                        <div className="flex-1 p-8 overflow-y-auto acoria-scrollbar">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-5xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                                        {classData.heroName || selectedHero}
                                    </h2>
                                    <h3 className="text-xl font-bold uppercase tracking-[0.2em] mt-1" style={{ color: classData.color }}>
                                        The {selectedHero}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground uppercase tracking-widest">Role</div>
                                    <div className="text-lg font-bold">{classData.role}</div>
                                </div>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-primary/50 to-transparent my-6" />

                            <div className="space-y-6">
                                <div>
                                    <h4 className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider mb-2 text-sm">
                                        <Book className="w-4 h-4" /> 
                                        Biography
                                    </h4>
                                    <p className="text-lg leading-relaxed text-muted-foreground/90 font-serif italic text-justify pl-4 border-l-2 border-primary/30">
                                        "{HERO_LORE[selectedHero]}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="bg-card/30 p-4 rounded-lg border border-primary/10">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Philosophy</h4>
                                        <p className="text-sm font-medium text-foreground">
                                            "{
                                                // @ts-ignore
                                                t(`classes.${selectedHero.toLowerCase()}.logic`)
                                            }"
                                        </p>
                                     </div>
                                     <div className="bg-card/30 p-4 rounded-lg border border-primary/10">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Battle Cry</h4>
                                        <p className="text-sm font-medium text-destructive">"{classData.threatenQuote}"</p>
                                     </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Win Condition</h4>
                                    <div className="bg-primary/5 border border-primary/20 p-3 rounded text-sm text-foreground">
                                        {classData.winCondition}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardLibrary;
