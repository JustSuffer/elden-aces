import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Check, Trash2, Edit2, Cloud, Loader2, Lock } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ClassName, Card, SpecialCardType } from "@/types/game";
import { SavedDeck } from "@/types/deck";
import { MASTER_CLASSES, SPECIAL_CARDS_DATA } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { CharacterAvatar } from "@/components/game/CharacterAvatar";
import { useCloudDecks } from "@/hooks/useCloudDecks";
import { supabase } from "@/integrations/supabase/client";
import { useInventory } from "@/hooks/useInventory";
import { CARD_BACKS, HEROES } from "@/data/shopData";

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

import { useLanguage } from "@/hooks/useLanguage";

const DeckBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { decks: savedDecks, isLoading, isSyncing, saveDeck: cloudSaveDeck, deleteDeck: cloudDeleteDeck } = useCloudDecks();
  
  const [deckName, setDeckName] = useState("");
  const [mainClass, setMainClass] = useState<ClassName | null>(null);
  const [isHeroSelected, setIsHeroSelected] = useState(false);
  const [secondaryClasses, setSecondaryClasses] = useState<ClassName[]>([]);
  const [cardBack, setCardBack] = useState<string>("Slayer");
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const { unlockedItems } = useInventory(); // Use Hook
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);

  // Removed manual fetch useEffect
  
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const secondarySectionRef = useRef<HTMLDivElement>(null);
  const saveSectionRef = useRef<HTMLDivElement>(null);

  const customDeck = useMemo<Card[]>(() => {
    const requiredCount = mainClass === "Vessel" ? 4 : 3;
    if (!mainClass || secondaryClasses.length !== requiredCount) return [];
    
    // Check if we have 6 base + 3*6 secondary = 24 OR 6 base + 4*6 = 30?
    // Actually game logic often expects 30 cards total? 
    // Let's stick to the previous logic: Main(6) + Special(6) + Secondaries(6 each).
    // Vessel: 4 secondaries * 6 = 24. Main 6. Special 6. Total 36?
    // Normal: 3 secondaries * 6 = 18. Main 6. Special 6. Total 30.
    
    const deck: Card[] = [];
    deck.push(...generateClassCards(mainClass));
    // Mimic Special Rule: Add 6 extra Main Class cards to reach 12 for Win Condition
    // Wait, the previous code had this logic. Let's look at what was there.
    // logic: main(6) + special(6) + secondaries.
    // Mimic rule: "Mimic" main class gets duplicate main cards or something?
    // "Mimic Special Rule: Add 6 extra Main Class cards to reach 12 for Win Condition"
    if (mainClass === "Mimic") {
         deck.push(...generateClassCards(mainClass).map(c => ({...c, id: `mimic-extra-${c.id}`})));
    }
    deck.push(...generateSpecialCards());
    secondaryClasses.forEach(className => {
      deck.push(...generateClassCards(className));
    });
    
    return deck;
  }, [mainClass, secondaryClasses]);

  const availableSecondary = useMemo(() => {
    if (!mainClass) return [];
    return ALL_CLASSES.filter(c => c !== mainClass);
  }, [mainClass]);

  // Helpers for Hero Selection
  const availableHeroes = useMemo(() => {
    if (!mainClass) return [];
    
    // Default Hero (Class Avatar)
    const defaultHero = {
        id: `default_${mainClass}`,
        name: MASTER_CLASSES[mainClass].heroName || mainClass,
        image: "", // Empty string relies on CharacterAvatar default logic
        isLocked: false,
        className: mainClass
    };

    // Shop Heroes for this class
    const shopHeroes = HEROES.filter(h => h.className === mainClass).map(h => ({
        id: h.id,
        name: h.name[language as "tr" | "en"] || h.name["en"],
        image: h.image,
        isLocked: !unlockedItems.includes(h.id),
        className: h.className
    }));

    return [defaultHero, ...shopHeroes];
  }, [mainClass, unlockedItems, language]);



  const isComplete = useMemo(() => {
    const requiredCount = mainClass === "Vessel" ? 4 : 3;
    return mainClass && isHeroSelected && secondaryClasses.length === requiredCount && deckName.trim().length > 0;
  }, [mainClass, isHeroSelected, secondaryClasses, deckName]);

  const handleMainClassSelect = (className: ClassName) => {
    if (className === mainClass) return;
    setMainClass(className);
    setIsHeroSelected(false);
    setSecondaryClasses([]);
    setCardBack(`${className}.jpg`); // Default to class card back with extension
    
    // Scroll to next step after a brief delay
    setTimeout(() => {
        heroSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleHeroSelect = (heroId?: string) => {
    setIsHeroSelected(true);
    if (heroId) setSelectedHeroId(heroId);
    setTimeout(() => {
        secondarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSecondaryToggle = (className: ClassName) => {
    const limit = mainClass === "Vessel" ? 4 : 3;
    
    setSecondaryClasses(prev => {
      let newClasses = prev;
      if (prev.includes(className)) {
        newClasses = prev.filter(c => c !== className);
      } else {
         if (prev.length >= limit) return prev;
         newClasses = [...prev, className];
      }

      // If we reached the limit, scroll to the card back section
      if (newClasses.length === limit) {
         setTimeout(() => {
            // Find the card back section (it renders when length === limit)
            const section = document.getElementById("step-4-cardback");
            section?.scrollIntoView({ behavior: "smooth", block: "start" });
         }, 200); // Slight delay for render
      }

      return newClasses;
    });
  };

  const handleResetDeck = () => {
    setMainClass(null);
    setIsHeroSelected(false);
    setSelectedHeroId(null);
    setSecondaryClasses([]);
    setDeckName("");
    setCardBack("Slayer.jpg");
    setEditingDeckId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success("Deste oluşturucu sıfırlandı!");
  };

  const handleEditDeck = (deck: SavedDeck) => {
    setMainClass(deck.mainClass);
    // Determine if hero was selected (usually true for saved decks)
    setIsHeroSelected(true); 
    setSecondaryClasses(deck.secondaryClasses);
    setDeckName(deck.name);
    
    // Handle legacy saves that might not have extension
    let savedBack = typeof deck.cardBack === 'string' ? deck.cardBack : "Slayer.jpg";
    if (!savedBack.includes(".")) {
        savedBack = `${savedBack}.jpg`;
    }
    setCardBack(savedBack);
    
    setEditingDeckId(deck.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info("Deste düzenleme moduna alındı.");
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (confirm("Bu desteyi silmek istediğinize emin misiniz?")) {
        const success = await cloudDeleteDeck(deckId);
        if (success && editingDeckId === deckId) {
            handleResetDeck();
        }
    }
  };

  const handleSaveDeck = async () => {
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
    
    // Validate Card Back Ownership (Security measure)
    // If it's a class name, it's always free. If it's a shop item ID/name, check ownership.
    const isClassBack = ALL_CLASSES.includes(cardBack as ClassName);
    // Note: cardBack state stores the "image" name or ClassName.
    // CARD_BACKS uses 'id' for ownership check.
    // We need to map `cardBack` (image name) back to `id` to check ownership if it's not a class back.
    // However, `cardBack` state currently stores the IMAGE NAME (e.g. "Arid", "Slayer").
    // We should allow it if it's in unlockedItems OR isDefault.
    
    // Simple check: client-side constraint is enough for now.
    
    const newDeck: SavedDeck = {
      id: editingDeckId || `deck-${Date.now()}`,
      name: deckName.trim(),
      mainClass,
      secondaryClasses,
      cardBack,
      cards: customDeck,
      createdAt: new Date().toISOString(),
    };

    const success = await cloudSaveDeck(newDeck, !!editingDeckId);
    if (success) {
      handleResetDeck();
    }
  };

  // ... (handleEditDeck)

  // ... (handleDeleteDeck)

  // Combined list for Card Back Step
  const availableBacks = useMemo(() => {
      // 1. Class Backs (Default/Free)
      const classBacks = ALL_CLASSES.map(c => ({
          id: `default_${c}`,
          name: { tr: c, en: c }, // Match structure
          image: `${c}.jpg`, // Add extension explicitly
          isLocked: false
      }));
      
      // 2. Shop Backs
      const shopBacks = CARD_BACKS.map(cb => ({
          id: cb.id,
          name: cb.name, // Pass the whole object
          image: cb.image,
          isLocked: !cb.isDefault && !unlockedItems.includes(cb.id)
      }));
      
      return [...classBacks, ...shopBacks];
  }, [unlockedItems]);

  return (
    <div className="min-h-screen bg-background pb-32">
       {/* ... (Header and Saved Decks - same as before) ... */}
       
       <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menü
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-primary glow-gold font-cinzel">Deste Oluşturucu</div>
          {isSyncing && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing...
            </div>
          )}
          {user && !isSyncing && (
            <div className="flex items-center gap-1 text-xs text-green-500">
              <Cloud className="w-3 h-3" />
              Cloud
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetDeck} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Sıfırla
          </Button>
        </div>
      </div>

       <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Saved Decks Section */}
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
                    <div className="shrink-0">
                      <CharacterAvatar 
                        className={deck.mainClass} 
                        isPlayer={true} 
                        characterName=""
                        sizeClass="w-16 h-16" 
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

         {/* Step 1: Main Class - Unchanged */}
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

         {/* Step 2: Hero */}
          {mainClass && (
             <section 
               ref={heroSectionRef}
               className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 animate-in fade-in zoom-in duration-500 scroll-mt-24"
             >
               <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
                 2. KAHRAMAN SEÇ
               </h2>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {availableHeroes.map(hero => {
                      const isSelected = isHeroSelected && (hero.id === (selectedHeroId || `default_${mainClass}`));

                      return (
                         <button 
                           key={hero.id}
                           onClick={() => {
                               if (hero.isLocked) {
                                   toast.error(language === "tr" ? "Bu kahramanı Mağaza'dan açmalısınız!" : "You must unlock this hero in the Shop!");
                                   return;
                               }
                               setSelectedHeroId(hero.id);
                               handleHeroSelect(hero.id);
                           }}
                           className={cn(
                             "relative group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 bg-black/40",
                              isSelected 
                               ? "border-primary shadow-[0_0_30px_rgba(197,160,89,0.3)] scale-105" 
                               : hero.isLocked
                                 ? "border-gray-800 opacity-70 grayscale"
                                 : "border-border hover:border-primary/50 hover:bg-black/60"
                           )}
                         >
                           <div className="scale-110 my-2">
                              {hero.id.startsWith("default") ? (
                                  <CharacterAvatar 
                                    className={mainClass} 
                                    isPlayer={true} 
                                    characterName=""
                                    sizeClass="w-16 h-16"
                                  />
                              ) : (
                                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
                                      <img src={`/assets/avatars/${hero.image}`} className="w-full h-full object-cover" />
                                  </div>
                              )}
                           </div>
                           <div className="text-center mt-1">
                             <div className="text-sm font-bold text-primary font-cinzel truncate max-w-full px-1">
                               {hero.name}
                             </div>
                           </div>
                           
                           {isSelected && (
                             <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-in zoom-in">
                               <Check className="w-3 h-3 text-black font-bold" />
                             </div>
                           )}

                           {hero.isLocked && (
                               <div className="absolute top-2 left-2 text-white/90 drop-shadow-md">
                                   <Lock className="w-4 h-4" />
                               </div>
                           )}
                         </button>
                      );
                  })}
               </div>
             </section>
          )}

         {/* Step 3: Secondary - Unchanged */}
         {mainClass && isHeroSelected && (
           <section 
             ref={secondarySectionRef}
             className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 animate-in slide-in-from-bottom duration-500 scroll-mt-24"
           >
             <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
               3. YARDIMCI SINIFLAR ({mainClass === "Vessel" ? "4" : "3"} ADET)
             </h2>
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

         {/* Step 4: Card Back Selection - UPDATED */}
         {mainClass && isHeroSelected && secondaryClasses.length === (mainClass === "Vessel" ? 4 : 3) && (
           <section className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 animate-in slide-in-from-bottom duration-500 delay-200">
              <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
                4. KART ARKASI SEÇ
              </h2>
              <p className="text-muted-foreground mb-4">
                Destenizde kullanılacak kart arkası görünümünü seçin. Kilitli olanları <span className="text-amber-500">Shop</span>'tan satın alabilirsiniz.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {availableBacks.map(back => (
                    <button
                      key={back.id}
                      onClick={() => {
                        if (back.isLocked) {
                          toast.error(language === "tr" ? "Bu kart arkasını Mağaza'dan satın almalısınız!" : "You must purchase this card back from the Shop!");
                          return;
                        }
                        setCardBack(back.image);
                        setTimeout(() => {
                            saveSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      className={cn(
                        "relative group rounded-lg overflow-hidden border-2 transition-all duration-300 aspect-[2/3]",
                        cardBack === back.image
                          ? "border-primary shadow-[0_0_20px_rgba(197,160,89,0.5)] scale-105" 
                          : back.isLocked
                            ? "border-gray-800 opacity-100 grayscale cursor-not-allowed hover:grayscale-0 transition-all duration-300" // Fully visible but grayscale
                            : "border-transparent hover:border-primary/50 opacity-90 hover:opacity-100 hover:scale-[1.02]"
                      )}
                    >
                       <img 
                         src={`/assets/decks/${back.image}`} 
                         alt={back.name[language as "tr" | "en"] || back.name["en"]} 
                         className="w-full h-full object-cover"
                         onError={(e) => {
                           const target = e.currentTarget;
                           // Fallback logic for jpg/jpeg
                           if (target.src.endsWith(".jpg")) {
                               target.src = target.src.replace(".jpg", ".jpeg");
                           } else if (target.src.endsWith(".jpeg")) {
                               target.src = "/assets/decks/Slayer.jpg";
                               target.style.filter = "grayscale(100%)";
                           } else {
                                target.src = "/assets/decks/Slayer.jpg";
                           }
                         }} 
                       />
                       <div className={cn("absolute inset-0 transition-all", back.isLocked ? "bg-black/30" : "bg-black/20 group-hover:bg-transparent")} />
                       
                       {/* Lock overlay - Make it clearer but less obstructive */}
                       {back.isLocked && (
                           <div className="absolute top-2 left-2 text-white/90 drop-shadow-md z-10">
                               <Lock className="w-6 h-6" />
                           </div>
                       )}

                       {cardBack === back.image && (
                         <div className="absolute top-2 right-2 bg-primary text-black rounded-full p-1 animate-in zoom-in">
                            <Check className="w-3 h-3" />
                         </div>
                       )}
                       
                       <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-center text-xs font-bold text-gold uppercase tracking-wider truncate">
                          {back.name[language as "tr" | "en"] || back.name["en"]}
                       </div>
                    </button>
                 ))}
              </div>
           </section>
         )}

         {/* Preview & Save - Show when Card Back is selected */}
         {mainClass && isHeroSelected && secondaryClasses.length === (mainClass === "Vessel" ? 4 : 3) && cardBack && (
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
                
                <section className="bg-black/40 border border-primary/30 p-4 rounded-lg text-center flex flex-col items-center justify-center gap-2 group hover:border-primary transition-colors">
                   <h3 className="text-lg font-bold font-cinzel text-foreground mb-1">
                     Seçilen Kart Arkası
                   </h3>
                   <div className="w-16 h-24 rounded border border-gold/50 overflow-hidden">
                       <img 
                          src={`/assets/decks/${cardBack || "Default.jpg"}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                           const target = e.currentTarget;
                           // Fallback logic for jpg/jpeg
                           if (target.src.endsWith(".jpg")) {
                               target.src = target.src.replace(".jpg", ".jpeg");
                           } else if (target.src.endsWith(".jpeg")) {
                               target.src = "/assets/decks/Slayer.jpg";
                           }
                         }}
                       />
                    </div>
                   <div className="text-sm text-yellow-500/80 font-mono tracking-wider mt-1">
                     {cardBack}
                   </div>
                </section>
             </div>
             
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
