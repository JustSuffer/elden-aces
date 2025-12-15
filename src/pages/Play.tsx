import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Swords, Loader2, Users, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SavedDeck } from "@/types/deck";
import { MASTER_CLASSES } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type MatchmakingStatus = "idle" | "searching" | "found" | "connecting";

interface QueueEntry {
  id: string;
  user_id: string;
  deck_data: SavedDeck;
  deck_name: string;
  main_class: string;
  status: string;
  matched_with: string | null;
  match_id: string | null;
}

const Play = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<SavedDeck | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<MatchmakingStatus>("idle");
  const [searchTime, setSearchTime] = useState(0);
  const [queueEntryId, setQueueEntryId] = useState<string | null>(null);
  const [opponentInfo, setOpponentInfo] = useState<{ username: string; mainClass: string } | null>(null);

  // Load saved decks
  useEffect(() => {
    const stored = localStorage.getItem("acoria-saved-decks");
    if (stored) {
      try {
        let decks = JSON.parse(stored);
        decks = decks.map((d: any) => ({
          ...d,
          mainClass: d.mainClass === "Incinerator" ? "Decay" : (d.mainClass === "Conjurer" ? "Vessel" : d.mainClass),
          secondaryClasses: d.secondaryClasses?.map((c: string) => 
            c === "Incinerator" ? "Decay" : (c === "Conjurer" ? "Vessel" : c)
          ) || []
        })).filter((d: SavedDeck) => MASTER_CLASSES[d.mainClass]);
        setSavedDecks(decks);
        if (decks.length > 0) {
          setSelectedDeck(decks[0]);
        }
      } catch (e) {
        console.error("Failed to load decks", e);
      }
    }
  }, []);

  // Search timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (matchmakingStatus === "searching") {
      interval = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(interval);
  }, [matchmakingStatus]);

  // Real-time subscription for matchmaking
  useEffect(() => {
    if (!queueEntryId || !user) return;

    const channel = supabase
      .channel(`matchmaking-${queueEntryId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matchmaking_queue',
          filter: `id=eq.${queueEntryId}`
        },
        async (payload) => {
          const updated = payload.new as QueueEntry;
          console.log("Queue update received:", updated);
          
          if (updated.status === 'matched' && updated.matched_with && updated.match_id) {
            handleMatchFound(updated.matched_with, updated.match_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueEntryId, user, navigate]);

  // Handler for when match is found
  const handleMatchFound = async (opponentQueueId: string, matchId: string) => {
    if (matchmakingStatus === "found" || matchmakingStatus === "connecting") return;
    
    setMatchmakingStatus("found");
    
    // Get opponent info using queue entry id
    const { data: opponentQueue } = await supabase
      .from("matchmaking_queue" as any)
      .select("main_class, user_id")
      .eq("id", opponentQueueId)
      .maybeSingle() as { data: { main_class: string; user_id: string } | null };
    
    if (opponentQueue) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", opponentQueue.user_id)
        .maybeSingle();
      
      setOpponentInfo({
        username: profile?.username || "Rakip",
        mainClass: opponentQueue.main_class
      });
    }
    
    // Brief delay for animation
    setTimeout(() => {
      setMatchmakingStatus("connecting");
      // Navigate to online game with match_id
      setTimeout(() => {
        navigate(`/online-game/${matchId}`);
      }, 1500);
    }, 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (queueEntryId) {
        cancelSearch();
      }
    };
  }, [queueEntryId]);

  const startSearch = async () => {
    if (!user || !selectedDeck) {
      toast.error("Lütfen bir deste seçin");
      return;
    }

    setMatchmakingStatus("searching");

    try {
      // Check for existing queue entry and remove
      await supabase
        .from("matchmaking_queue" as any)
        .delete()
        .eq("user_id", user.id);

      // Add to queue
      const { data: queueEntry, error } = await supabase
        .from("matchmaking_queue" as any)
        .insert({
          user_id: user.id,
          deck_data: selectedDeck as unknown as Record<string, unknown>,
          deck_name: selectedDeck.name,
          main_class: selectedDeck.mainClass,
          status: "searching"
        })
        .select()
        .single() as { data: QueueEntry | null; error: any };

      if (error || !queueEntry) {
        console.error("Queue error:", error);
        toast.error("Eşleşme kuyruğuna eklenemedi");
        setMatchmakingStatus("idle");
        return;
      }

      setQueueEntryId(queueEntry.id);

      // Look for another searching player
      const { data: searchingPlayers, error: searchError } = await supabase
        .from("matchmaking_queue" as any)
        .select("*")
        .eq("status", "searching")
        .neq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1) as { data: QueueEntry[] | null; error: any };

      if (searchError) {
        console.error("Search error:", searchError);
        return;
      }

      if (searchingPlayers && searchingPlayers.length > 0) {
        const opponent = searchingPlayers[0];
        
        // Create a match
        const { data: match, error: matchError } = await supabase
          .from("matches" as any)
          .insert({
            player1_id: opponent.user_id,
            player2_id: user.id,
            player1_deck: opponent.deck_data,
            player2_deck: selectedDeck as unknown as Record<string, unknown>,
            status: "active"
          })
          .select()
          .single() as { data: { id: string } | null; error: any };

        if (matchError || !match) {
          console.error("Match creation error:", matchError);
          return;
        }

        // Update opponent's queue entry first (this triggers their realtime subscription)
        await supabase
          .from("matchmaking_queue" as any)
          .update({ 
            status: "matched", 
            matched_with: queueEntry.id,
            match_id: match.id 
          })
          .eq("id", opponent.id);

        // Update our own queue entry
        await supabase
          .from("matchmaking_queue" as any)
          .update({ 
            status: "matched", 
            matched_with: opponent.id,
            match_id: match.id 
          })
          .eq("id", queueEntry.id);

        // The user who initiated the match should also navigate (won't get realtime event for own update)
        handleMatchFound(opponent.id, match.id);
      }
    } catch (err) {
      console.error("Matchmaking error:", err);
      toast.error("Bir hata oluştu");
      setMatchmakingStatus("idle");
    }
  };

  const cancelSearch = useCallback(async () => {
    if (queueEntryId && user) {
      await supabase
        .from("matchmaking_queue" as any)
        .delete()
        .eq("id", queueEntryId);
    }
    setQueueEntryId(null);
    setMatchmakingStatus("idle");
    setOpponentInfo(null);
  }, [queueEntryId, user]);

  const formatSearchTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (savedDecks.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-4 font-cinzel">
            Deste Bulunamadı
          </h2>
          <p className="text-muted-foreground mb-6">
            Çevrimiçi oynamadan önce Deste Oluşturucu'da bir deste kaydetmelisiniz.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/menu")}>
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-50" />
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-border/50">
        <Button variant="ghost" onClick={() => navigate("/menu")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menü
        </Button>
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-xl font-bold text-primary glow-gold font-cinzel">Çevrimiçi Oyna</span>
        </div>
        <div className="w-24" />
      </div>

      <div className="relative z-10 flex-1 container mx-auto px-4 py-8 flex flex-col items-center gap-8">
        
        {/* Match Found Overlay */}
        <AnimatePresence>
          {(matchmakingStatus === "found" || matchmakingStatus === "connecting") && opponentInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-6xl mb-6"
                >
                  ⚔️
                </motion.div>
                <h2 className="text-4xl font-bold text-primary glow-gold font-cinzel mb-4">
                  Rakip Bulundu!
                </h2>
                <div className="flex items-center justify-center gap-8 my-8">
                  {/* Player */}
                  <div className="text-center">
                    <div 
                      className="text-5xl font-bold mb-2"
                      style={{ color: MASTER_CLASSES[selectedDeck?.mainClass || "Vitalist"].color }}
                    >
                      {MASTER_CLASSES[selectedDeck?.mainClass || "Vitalist"].symbol}
                    </div>
                    <p className="text-lg font-bold text-foreground">Sen</p>
                    <p className="text-sm text-muted-foreground">{selectedDeck?.mainClass}</p>
                  </div>
                  
                  <div className="text-3xl text-primary font-bold">VS</div>
                  
                  {/* Opponent */}
                  <div className="text-center">
                    <div 
                      className="text-5xl font-bold mb-2"
                      style={{ color: MASTER_CLASSES[opponentInfo.mainClass as keyof typeof MASTER_CLASSES]?.color || "#fff" }}
                    >
                      {MASTER_CLASSES[opponentInfo.mainClass as keyof typeof MASTER_CLASSES]?.symbol || "?"}
                    </div>
                    <p className="text-lg font-bold text-foreground">{opponentInfo.username}</p>
                    <p className="text-sm text-muted-foreground">{opponentInfo.mainClass}</p>
                  </div>
                </div>
                
                {matchmakingStatus === "connecting" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-muted-foreground"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Oyuna bağlanılıyor...</span>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deck Selection */}
        <div className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-primary glow-gold mb-6 font-cinzel text-center">
            Desteni Seç
          </h2>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto acoria-scrollbar pr-2">
            {savedDecks.map((deck) => {
              const classData = MASTER_CLASSES[deck.mainClass];
              const isSelected = selectedDeck?.id === deck.id;
              return (
                <button
                  key={deck.id}
                  onClick={() => matchmakingStatus === "idle" && setSelectedDeck(deck)}
                  disabled={matchmakingStatus !== "idle"}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                    isSelected 
                      ? "border-primary bg-primary/20 shadow-lg shadow-primary/30" 
                      : "border-border hover:border-primary/50 bg-card/50",
                    matchmakingStatus !== "idle" && "opacity-50 cursor-not-allowed"
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
        </div>

        {/* Matchmaking Controls */}
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {matchmakingStatus === "idle" ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Button
                  size="lg"
                  onClick={startSearch}
                  disabled={!selectedDeck}
                  className="w-full text-xl py-8 font-cinzel bg-primary hover:bg-primary/90"
                >
                  <Users className="w-6 h-6 mr-3" />
                  Rakip Ara
                </Button>
              </motion.div>
            ) : matchmakingStatus === "searching" ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full"
                    />
                    <Swords className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-primary font-cinzel">
                    Rakip Aranıyor...
                  </h3>
                  <p className="text-muted-foreground">
                    Arama süresi: <span className="text-primary font-mono">{formatSearchTime(searchTime)}</span>
                  </p>
                  
                  <Button
                    variant="outline"
                    onClick={cancelSearch}
                    className="mt-4"
                  >
                    <WifiOff className="w-4 h-4 mr-2" />
                    Aramayı İptal Et
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Quick Play Option */}
        {matchmakingStatus === "idle" && (
          <div className="w-full max-w-2xl text-center">
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-muted-foreground text-sm">veya</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/game")}
              className="gap-2"
            >
              <Swords className="w-4 h-4" />
              Bot ile Oyna
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Play;
