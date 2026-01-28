import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/game/GameCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Check, Trash2, Edit2 } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ClassName, Card, SpecialCardType } from "@/types/game";
import { SavedDeck } from "@/types/deck";
import { MASTER_CLASSES, SPECIAL_CARDS_DATA } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";

const ALL_CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper",
  "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"
];

function generateClassCards(className: ClassName): Card[] {
  const classData = MASTER_CLASSES[className];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `${className.toLowerCase()}-${i + 1}-${Date.now()}`,
    name: `${classData.name} ${i + 1}`,
    symbol: classData.symbol,
    value: i + 1,
    type: "numeric" as const,
    classSymbol: classData.symbol,
    color: classData.color,
  }));
}

function generateSpecialCards(): Card[] {
  const specialTypes: SpecialCardType[] = ["twisted", "twisted", "deflate", "deflate", "delta", "sigma"];
  return specialTypes.map((type, idx) => ({
    id: `special-${type}-${idx}-${Date.now()}`,
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
  const { user } = useAuth();
  
  const [deckName, setDeckName] = useState("");
  const [mainClass, setMainClass] = useState<ClassName | null>(null);
  const [isHeroSelected, setIsHeroSelected] = useState(false); // Step 2 state
  const [secondaryClasses, setSecondaryClasses] = useState<ClassName[]>([]);
  const [cardBack, setCardBack] = useState<string>("Slayer"); // Default
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for auto-scroll
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const secondarySectionRef = useRef<HTMLDivElement>(null);
  const saveSectionRef = useRef<HTMLDivElement>(null);

  // Load saved decks on mount
  useEffect(() => {
    const stored = localStorage.getItem("acoria-saved-decks");
    if (stored) {
      setSavedDecks(JSON.parse(stored));
    }
  }, []);

  const availableSecondary = useMemo(() => 
    ALL_CLASSES.filter(c => c !== mainClass),
    [mainClass]
  );

  const customDeck = useMemo<Card[]>(() => {
    const requiredCount = mainClass === "Vessel" ? 4 : 3;
    if (!mainClass || secondaryClasses.length !== requiredCount) return [];
    
    const deck: Card[] = [];
    deck.push(...generateClassCards(mainClass));
    // Mimic Special Rule: Add 6 extra Main Class cards to reach 12 for Win Condition
    if (mainClass === "Mimic") {
         deck.push(...generateClassCards(mainClass).map(c => ({...c, id: `mimic-extra-${c.id}`})));
    }
    deck.push(...generateSpecialCards());
    secondaryClasses.forEach(className => {
      deck.push(...generateClassCards(className));
    });
    
    return deck;
  }, [mainClass, secondaryClasses]);

  const handleMainClassSelect = (className: ClassName) => {
    setMainClass(className);
    setCardBack(className); // Default to main class card back
    setSecondaryClasses([]);
    setIsHeroSelected(false); // Reset hero selection if main class changes
    
    // Auto-scroll to Hero Section
    setTimeout(() => {
      heroSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleHeroSelect = () => {
    setIsHeroSelected(true);
    
    // Auto-scroll to Secondary Section
    setTimeout(() => {
      secondarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSecondaryToggle = (className: ClassName) => {
    const limit = mainClass === "Vessel" ? 4 : 3;
    setSecondaryClasses(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else if (prev.length < limit) {
        return [...prev, className];
      }
      toast.error(`En fazla ${limit} yardımcı sınıf seçebilirsiniz!`);
      return prev;
    });
  };

  const handleResetDeck = () => {
    setMainClass(null);
    setIsHeroSelected(false);
    setSecondaryClasses([]);
    setDeckName("");
    setCardBack("Slayer");
    setEditingDeckId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("Deste oluşturucu sıfırlandı!");
  };

  const handleSaveDeck = () => {
    const requiredCount = mainClass === "Vessel" ? 4 : 3;
    if (!mainClass || !isHeroSelected || secondaryClasses.length !== requiredCount) {
      toast.error(`Lütfen tüm adımları tamamlayın!`);
      return;
    }

    if (savedDecks.length >= 18 && !editingDeckId) {
      toast.error("Maksimum deste sınırına (18) ulaştınız! Yeni deste oluşturmak için birini silin.");
      return;
    }
    
    if (!deckName.trim()) {
      toast.error("Deste ismi girmelisiniz!");
      return;
    }

    const newDeck: SavedDeck = {
      id: editingDeckId || `deck-${Date.now()}`,
      name: deckName.trim(),
      mainClass,
      secondaryClasses,
      cardBack, // Save selected card back
      cards: customDeck,
      createdAt: new Date().toISOString(),
    };

    let updatedDecks: SavedDeck[];
    if (editingDeckId) {
      updatedDecks = savedDecks.map(d => d.id === editingDeckId ? newDeck : d);
      toast.success("Deste güncellendi!");
    } else {
      updatedDecks = [...savedDecks, newDeck];
      toast.success("Deste kaydedildi!");
    }

    setSavedDecks(updatedDecks);
    localStorage.setItem("acoria-saved-decks", JSON.stringify(updatedDecks));
    
    // Reset form
    handleResetDeck();
  };

  const handleEditDeck = (deck: SavedDeck) => {
    setEditingDeckId(deck.id);
    setDeckName(deck.name);
    setMainClass(deck.mainClass);
    setIsHeroSelected(true); // Auto-select hero for edit
    setSecondaryClasses(deck.secondaryClasses);
    setCardBack(deck.cardBack || deck.mainClass); // Load CB or default
    toast.info(`"${deck.name}" düzenleniyor...`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDeck = (deckId: string) => {
    const updatedDecks = savedDecks.filter(d => d.id !== deckId);
    setSavedDecks(updatedDecks);
    localStorage.setItem("acoria-saved-decks", JSON.stringify(updatedDecks));
    toast.success("Deste silindi!");
  };

  const isComplete = mainClass && isHeroSelected && secondaryClasses.length === (mainClass === "Vessel" ? 4 : 3);
  const numericCards = customDeck.filter((c) => c.type === "numeric");
  const specialCards = customDeck.filter((c) => c.type === "special");

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menü
        </Button>
        <div className="text-xl font-bold text-primary glow-gold font-cinzel">Deste Oluşturucu</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetDeck} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Sıfırla
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Saved Decks */}
        {savedDecks.length > 0 && (
          <section className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
              Kayıtlı Desteler ({savedDecks.length}/18)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedDecks.map((deck) => {
                const classData = MASTER_CLASSES[deck.mainClass];
                return (
                  <div
                    key={deck.id}
                    className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/50 transition-all flex items-center gap-4 group"
                  >
                    {/* Avatar for Saved Deck - Clean Look */}
                    <div className="shrink-0">
                      <CharacterAvatar 
                        className={deck.mainClass} 
                        isPlayer={true} 
                        characterName=""
                        sizeClass="w-16 h-16" // Smaller visual for list
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{deck.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="text-lg font-bold"
                          style={{ color: classData.color }}
                        >
                          {classData.symbol}
                        </span>
                        <span className="text-sm font-semibold text-muted-foreground">{classData.heroName || deck.mainClass}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        + {deck.secondaryClasses.join(", ")}
                      </p>
                    </div>

                    <div className="flex gap-1 flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDeck(deck)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 1: Main Class Selection */}
        <section className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 animate-in slide-in-from-left duration-500">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
            1. ANA SINIF SEÇ
          </h2>
          <p className="text-muted-foreground mb-4">
            Ana sınıfın yeteneklerini, kazanma koşullarını ve başlangıç HP'ni belirler.
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
                    "p-4 rounded-lg border-2 transition-all duration-200 text-left relative overflow-hidden group",
                    isSelected 
                      ? "border-primary bg-primary/20 shadow-lg shadow-primary/30 ring-1 ring-primary" 
                      : "border-border hover:border-primary/50 bg-card/50"
                  )}
                >
                  <div 
                    className="text-4xl mb-2 font-bold transition-transform group-hover:scale-110"
                    style={{ color: classData.color }}
                  >
                    {classData.symbol}
                  </div>
                  <div className="text-sm font-bold text-foreground uppercase tracking-wide">{className}</div>
                  <div className="text-xs text-muted-foreground opacity-80">{classData.role}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">HP: {classData.initialHP}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Hero Selection */}
        {mainClass && (
           <section 
             ref={heroSectionRef}
             className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 animate-in fade-in zoom-in duration-500 scroll-mt-24"
           >
             <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
               2. KAHRAMAN SEÇ
             </h2>
             <p className="text-muted-foreground mb-6">
               Destenizi temsil edecek kahramanı seçin.
             </p>
             
             <div className="flex justify-center md:justify-start">
                <button 
                  onClick={handleHeroSelect}
                  className={cn(
                    "relative group p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4 bg-black/40",
                     isHeroSelected 
                      ? "border-primary shadow-[0_0_30px_rgba(197,160,89,0.3)] scale-105" 
                      : "border-border hover:border-primary/50 hover:bg-black/60"
                  )}
                >
                  <div className="scale-125 my-4">
                     <CharacterAvatar 
                       className={mainClass} 
                       isPlayer={true} 
                       characterName="" // Name is shown below
                     />
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xl font-bold text-primary font-cinzel">
                      {MASTER_CLASSES[mainClass].heroName || mainClass}
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-widest text-[10px]">
                      {MASTER_CLASSES[mainClass].role}
                    </div>
                  </div>
                  
                  {isHeroSelected && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-in zoom-in">
                      <Check className="w-5 h-5 text-black font-bold" />
                    </div>
                  )}
                </button>
             </div>
           </section>
        )}

        {/* Step 3: Secondary Classes */}
        {mainClass && isHeroSelected && (
          <section 
            ref={secondarySectionRef}
            className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 animate-in slide-in-from-bottom duration-500 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
              3. YARDIMCI SINIFLAR ({mainClass === "Vessel" ? "4" : "3"} ADET)
            </h2>
            <p className="text-muted-foreground mb-4">
              Desteye eklemek için {mainClass === "Vessel" ? "4" : "3"} sınıf seç. Her sınıf 6 sayısal kart (1-6) ekler.
              <span className={cn("font-bold ml-2", secondaryClasses.length === (mainClass === "Vessel" ? 4 : 3) ? "text-green-500" : "text-primary")}> 
                ({secondaryClasses.length}/{mainClass === "Vessel" ? "4" : "3"} seçildi)
              </span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-3">
              {availableSecondary.map((className) => {
                const classData = MASTER_CLASSES[className];
                const isSelected = secondaryClasses.includes(className);
                const limit = mainClass === "Vessel" ? 4 : 3;
                const isDisabled = !isSelected && secondaryClasses.length >= limit;
                
                return (
                  <button
                    key={className}
                    onClick={() => !isDisabled && handleSecondaryToggle(className)}
                    disabled={isDisabled}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-left relative overflow-hidden",
                      isSelected 
                        ? "border-primary bg-primary/20 shadow-inner" 
                        : isDisabled
                        ? "border-border/30 bg-card/20 opacity-40 cursor-not-allowed grayscale"
                        : "border-border hover:border-primary/50 bg-card/50"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-in zoom-in">
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
                    <div className="text-xs text-muted-foreground">6 kart (1-6)</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 4: Card Back Selection */}
        {mainClass && isHeroSelected && secondaryClasses.length === (mainClass === "Vessel" ? 4 : 3) && (
          <section className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 animate-in slide-in-from-bottom duration-500 delay-200">
             <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
               4. KART ARKASI SEÇ
             </h2>
             <p className="text-muted-foreground mb-4">
               Destenizde kullanılacak kart arkası görünümünü seçin.
             </p>
             
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {ALL_CLASSES.map(cls => (
                   <button
                     key={cls}
                     onClick={() => setCardBack(cls)}
                     className={cn(
                       "relative group rounded-lg overflow-hidden border-2 transition-all duration-300 aspect-[2/3]",
                       cardBack === cls 
                         ? "border-primary shadow-[0_0_20px_rgba(197,160,89,0.5)] scale-105" 
                         : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100 hover:scale-[1.02]"
                     )}
                   >
                      <img 
                        src={`/assets/decks/${cls}.jpg`} 
                        alt={cls} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all" />
                      
                      {cardBack === cls && (
                        <div className="absolute top-2 right-2 bg-primary text-black rounded-full p-1 animate-in zoom-in">
                           <Check className="w-3 h-3" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-center text-xs font-bold text-gold uppercase tracking-wider">
                         {cls}
                      </div>
                   </button>
                ))}
             </div>
          </section>
        )}

        {/* Deck Preview & Save */}
        {isComplete && (
          <div ref={saveSectionRef} className="space-y-8 animate-in fade-in duration-700">
             {/* Save Area */}
            <section className="bg-card/90 backdrop-blur border border-primary rounded-lg p-6 shadow-2xl shadow-primary/10 sticky bottom-4 z-40">
              <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
                {editingDeckId ? "DESTE YENİLE" : "DESTEYİ KAYDET"}
              </h2>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-sm text-yellow-500/80 mb-2 block uppercase tracking-wider font-bold">Deste İsmi</label>
                  <Input
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Örn: Efsanevi Deste"
                    className="bg-black/50 border-gold/30 text-lg h-12"
                  />
                </div>
                <Button 
                  variant="default" 
                  onClick={handleSaveDeck} 
                  className="w-full md:w-auto h-12 gap-3 text-lg font-bold bg-primary hover:bg-primary/90 text-black px-8"
                  disabled={isLoading}
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? "KAYDEDİLİYOR..." : (editingDeckId ? "GÜNCELLE" : "KAYDET")}
                </Button>
              </div>
            </section>

             {/* Preview Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in duration-500">
               {/* Main Class Summary */}
               <section className="bg-black/40 border border-primary/30 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2 group hover:border-primary transition-colors">
                  <div className="text-3xl font-bold transition-transform group-hover:scale-110" style={{ color: MASTER_CLASSES[mainClass].color }}>
                    {MASTER_CLASSES[mainClass].symbol}
                  </div>
                  <h3 className="text-lg font-bold font-cinzel text-foreground">
                    {mainClass} Kartları
                  </h3>
                  <div className="text-sm text-yellow-500/80 font-mono tracking-wider">
                    {mainClass === "Mimic" ? "12 Adet (Çift)" : "6 Adet (1-6)"}
                  </div>
               </section>

               {/* Special Cards Summary */}
               <section className="bg-black/40 border border-primary/30 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2 group hover:border-primary transition-colors">
                  <div className="text-3xl font-bold text-primary transition-transform group-hover:scale-110">
                    ★
                  </div>
                  <h3 className="text-lg font-bold font-cinzel text-foreground">
                    Özel Kartlar
                  </h3>
                  <div className="text-sm text-yellow-500/80 font-mono tracking-wider">
                    6 Adet (Twisted, Deflate, Delta, Sigma)
                  </div>
               </section>
               
               {/* Card Back Summary */}
               <section className="bg-black/40 border border-primary/30 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2 group hover:border-primary transition-colors">
                  <h3 className="text-lg font-bold font-cinzel text-foreground mb-1">
                    Seçilen Kart Arkası
                  </h3>
                  <div className="w-16 h-24 rounded border border-gold/50 overflow-hidden">
                     <img src={`/assets/decks/${cardBack || "Default"}.jpg`} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm text-yellow-500/80 font-mono tracking-wider mt-1">
                    {cardBack}
                  </div>
               </section>
            </div>
            
            {/* Secondary Classes Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-500 delay-100">
              {secondaryClasses.map((className) => (
                <section key={className} className="bg-black/40 border border-border/50 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                   <div className="text-2xl font-bold" style={{ color: MASTER_CLASSES[className].color }}>
                    {MASTER_CLASSES[className].symbol}
                  </div>
                  <h3 className="text-base font-bold font-cinzel text-foreground">
                     {className}
                  </h3>
                  <div className="text-xs text-muted-foreground font-mono">
                    6 Adet (1-6)
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckBuilder;
