import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/game/GameCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Check, Trash2, Edit2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { ClassName, Card, SpecialCardType } from "@/types/game";
import { SavedDeck } from "@/types/deck";
import { MASTER_CLASSES, SPECIAL_CARDS_DATA } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const [secondaryClasses, setSecondaryClasses] = useState<ClassName[]>([]);
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved decks from Supabase
  const fetchDecks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedDecks: SavedDeck[] = data.map(d => ({
          id: d.id,
          name: d.name,
          mainClass: d.main_class as ClassName,
          secondaryClasses: d.secondary_classes as ClassName[],
          cards: d.cards as unknown as Card[],
          createdAt: d.created_at
        }));
        setSavedDecks(mappedDecks);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Desteler yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [user]);

  const availableSecondary = useMemo(() =>
    ALL_CLASSES.filter(c => c !== mainClass),
    [mainClass]
  );

  const customDeck = useMemo<Card[]>(() => {
    if (!mainClass || secondaryClasses.length !== 3) return [];

    const deck: Card[] = [];
    deck.push(...generateClassCards(mainClass));
    deck.push(...generateSpecialCards());
    secondaryClasses.forEach(className => {
      deck.push(...generateClassCards(className));
    });

    return deck;
  }, [mainClass, secondaryClasses]);

  const handleMainClassSelect = (className: ClassName) => {
    setMainClass(className);
    setSecondaryClasses(prev => prev.filter(c => c !== className));
  };

  const handleSecondaryToggle = (className: ClassName) => {
    const limit = mainClass === "Vessel" ? 4 : 3;
    setSecondaryClasses(prev => {
      if (prev.includes(className)) {
        return prev.filter(c => c !== className);
      } else if (prev.length < limit) {
        return [...prev, className];
      }
      return prev;
    });
  };

  const handleResetDeck = () => {
    setMainClass(null);
    setSecondaryClasses([]);
    setDeckName("");
    setEditingDeckId(null);
    toast.success("Deste sıfırlandı!");
  };

  const handleSaveDeck = async () => {
    const requiredCount = mainClass === "Vessel" ? 4 : 3;
    if (!mainClass || secondaryClasses.length !== requiredCount) {
      toast.error(`Ana sınıf ve ${requiredCount} yardımcı sınıf seçmelisiniz!`);
      return;
    }

    if (!deckName.trim()) {
      toast.error("Deste ismi girmelisiniz!");
      return;
    }

    if (!user) {
      toast.error("Deste kaydetmek için giriş yapmalısınız!");
      return;
    }

    setIsLoading(true);

    try {
      const deckData = {
        name: deckName.trim(),
        main_class: mainClass,
        secondary_classes: secondaryClasses,
        cards: customDeck as any,
        user_id: user.id
      };

      if (editingDeckId) {
        // Update existing deck
        const { error } = await supabase
          .from('decks')
          .update(deckData)
          .eq('id', editingDeckId);

        if (error) throw error;
        toast.success("Deste güncellendi!");
      } else {
        // Create new deck
        const { error } = await supabase
          .from('decks')
          .insert(deckData);

        if (error) throw error;
        toast.success("Deste kaydedildi!");
      }

      await fetchDecks();
      handleResetDeck();
    } catch (error) {
      console.error('Error saving deck:', error);
      toast.error('Deste kaydedilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDeck = (deck: SavedDeck) => {
    setEditingDeckId(deck.id);
    setDeckName(deck.name);
    setMainClass(deck.mainClass);
    setSecondaryClasses(deck.secondaryClasses);
    toast.info(`"${deck.name}" düzenleniyor...`);

    // Scroll to top to show edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm("Bu desteyi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;

      toast.success("Deste silindi!");
      fetchDecks();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Deste silinirken bir hata oluştu.');
    }
  };

  const isComplete = mainClass && secondaryClasses.length === (mainClass === "Vessel" ? 4 : 3);
  const numericCards = customDeck.filter((c) => c.type === "numeric");
  const specialCards = customDeck.filter((c) => c.type === "special");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
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
              Kayıtlı Desteler ({savedDecks.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedDecks.map((deck) => {
                const classData = MASTER_CLASSES[deck.mainClass];
                // Handle case where class data might be missing if classes changed
                if (!classData) return null;

                return (
                  <div
                    key={deck.id}
                    className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{deck.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-2xl font-bold"
                            style={{ color: classData.color }}
                          >
                            {classData.symbol}
                          </span>
                          <span className="text-sm text-muted-foreground">{deck.mainClass}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          + {deck.secondaryClasses.join(", ")}
                        </p>
                      </div>
                      <div className="flex gap-1">
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
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Deck Name Input */}
        <section className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
            {editingDeckId ? "Deste Düzenle" : "Yeni Deste Oluştur"}
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Deste İsmi</label>
              <Input
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Örn: Aggro Slayer, Control Vitalist..."
                className="bg-background/50"
              />
            </div>
            <Button
              variant="default"
              onClick={handleSaveDeck}
              className="gap-2"
              disabled={!isComplete || !deckName.trim() || isLoading}
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Kaydediliyor..." : (editingDeckId ? "Güncelle" : "Kaydet")}
            </Button>
          </div>
        </section>

        {/* Step 1: Main Class Selection */}
        <section className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
            1. Ana Sınıf Seç
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
              2. Yardımcı Sınıflar ({mainClass === "Vessel" ? "4" : "3"} Adet)
            </h2>
            <p className="text-muted-foreground mb-4">
              Desteye eklemek için {mainClass === "Vessel" ? "4" : "3"} sınıf seç. Her sınıf 6 sayısal kart (1-6) ekler.
              <span className="text-primary font-bold"> ({secondaryClasses.length}/{mainClass === "Vessel" ? "4" : "3"} seçildi)</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-3">
              {availableSecondary.map((className) => {
                const classData = MASTER_CLASSES[className];
                const isSelected = secondaryClasses.includes(className);
                const isDisabled = !isSelected && secondaryClasses.length >= (mainClass === "Vessel" ? 4 : 3);
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
                    <div className="text-xs text-muted-foreground">6 kart (1-6)</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Deck Preview */}
        {isComplete && (
          <>
            <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-primary glow-gold mb-2 font-cinzel">
                    Deste Önizleme
                  </h2>
                  <p className="text-muted-foreground">
                    Ana Sınıf: <span className="text-primary font-bold">{mainClass}</span>
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold text-primary">{customDeck.length}/{mainClass === "Vessel" ? 36 : 30} Kart</p>
                  <p className="text-sm text-muted-foreground">
                    {numericCards.length} Sayısal | {specialCards.length} Özel
                  </p>
                </div>
              </div>
            </div>

            {/* Special Cards */}
            <section>
              <h3 className="text-xl font-bold text-primary mb-4 glow-gold font-cinzel">
                Özel Kartlar (6)
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
                {mainClass} Kartları (6) - Ana Sınıf
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
                  {className} Kartları (6)
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
          <h4 className="text-lg font-bold text-primary mb-3 font-cinzel">Deste Kuralları</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Her deste tam olarak <span className="text-primary font-bold">30 kart</span> içerir</li>
            <li>• <span className="text-primary">Ana Sınıf:</span> 6 sayısal kart (1-6) + yetenekler</li>
            <li>• <span className="text-primary">Özel Kartlar:</span> 6 kart (2× Twisted α, 2× Deflate β, 1× Delta Δ, 1× Sigma Σ)</li>
            <li>• <span className="text-primary">Yardımcı Sınıflar:</span> 3 sınıf seç, her biri 6 kart (1-6) ekler</li>
            <li>• Toplam: 6 (ana) + 6 (özel) + 18 (3×6 yardımcı) = 30 kart</li>
            <li>• Gamma (γ) sadece oyun içi Zar ile elde edilebilir</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
