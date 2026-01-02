import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Wifi, ArrowLeft, Clock, Users } from "lucide-react";
import { SavedDeck } from "@/types/deck";
import { GameMatch } from "@/components/game/GameMatch";
import { ClassName, Card } from "@/types/game";
import { toast } from "sonner";

interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_deck: SavedDeck;
  player2_deck: SavedDeck;
  status: string;
  player1_field: (Card | null)[];
  player2_field: (Card | null)[];
  player1_ready: boolean;
  player2_ready: boolean;
  current_round: number;
  phase: string;
}

// Basic Error Boundary for catching render crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("GameMatch Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-50 p-8 text-center text-black">
           <div className="text-red-600 text-4xl mb-4 font-bold">⚠️ Kritik Hata</div>
           <p className="text-lg mb-2">Oyun yüklenirken bir sorun oluştu.</p>
           <pre className="text-red-700 bg-red-100 p-4 rounded text-xs text-left overflow-auto max-w-full">
               {this.state.error?.toString()}
           </pre>
           <Button onClick={() => window.location.reload()} className="mt-8" variant="destructive">
               Yenile
           </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe Wrapper
const SafeGameMatch = (props: React.ComponentProps<typeof GameMatch>) => {
    return (
        <ErrorBoundary>
            <GameMatch {...props} />
        </ErrorBoundary>
    )
}

const OnlineGame = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opponentMoves, setOpponentMoves] = useState<(Card | null)[] | undefined>(undefined);
  const [currentRound, setCurrentRound] = useState(1);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Determine if current user is player 1
  const isPlayer1 = match ? user?.id === match.player1_id : false;

  // Fetch match data
  useEffect(() => {
    if (!matchId || !user) return;

    const fetchMatch = async () => {
      console.log("[OnlineGame] Fetching match:", matchId);
      const { data, error } = await supabase
        .from("matches" as any)
        .select("*")
        .eq("id", matchId)
        .single() as { data: Match | null; error: any };

      if (error || !data) {
        console.error("[OnlineGame] Match fetch error:", error);
        setError("Maç bulunamadı");
        setIsLoading(false);
        return;
      }

      console.log("[OnlineGame] Match loaded:", data);
      setMatch(data);
      setCurrentRound(data.current_round || 1);
      setIsLoading(false);
    };

    fetchMatch();
  }, [matchId, user]);

  // Subscribe to match updates via Realtime
  useEffect(() => {
    if (!matchId || !user || !match) return;

    console.log("[OnlineGame] Setting up realtime subscription for match:", matchId);

    const channel = supabase
      .channel(`match-sync-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          console.log("[OnlineGame] Realtime update received:", payload);
          const newMatch = payload.new as Match;
          
          // Update match state
          setMatch(newMatch);
          
          // Check if opponent is ready
          const isP1 = user.id === newMatch.player1_id;
          const opponentIsReady = isP1 ? newMatch.player2_ready : newMatch.player1_ready;
          const myReady = isP1 ? newMatch.player1_ready : newMatch.player2_ready;
          
          console.log("[OnlineGame] Ready states - Me:", myReady, "Opponent:", opponentIsReady);
          
          setOpponentReady(opponentIsReady);
          
          // If both players are ready, sync the opponent's field
          if (myReady && opponentIsReady) {
            const opponentField = isP1 ? newMatch.player2_field : newMatch.player1_field;
            console.log("[OnlineGame] Both ready! Opponent field:", opponentField);
            setOpponentMoves(opponentField || []);
            setWaitingForOpponent(false);
            toast.success("Rakip hazır! Kartlar açılıyor...");
          }
        }
      )
      .subscribe((status) => {
        console.log("[OnlineGame] Realtime subscription status:", status);
      });

    channelRef.current = channel;

    return () => {
      console.log("[OnlineGame] Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [matchId, user, match?.player1_id]);

  // Submit player's moves to database
  const handleMovesReady = useCallback(async (moves: (Card | null)[]) => {
    if (!match || !user) return;

    console.log("[OnlineGame] Submitting moves:", moves);
    setWaitingForOpponent(true);

    const fieldColumn = isPlayer1 ? "player1_field" : "player2_field";
    const readyColumn = isPlayer1 ? "player1_ready" : "player2_ready";

    const { error } = await supabase
      .from("matches" as any)
      .update({
        [fieldColumn]: moves,
        [readyColumn]: true,
        current_round: currentRound
      })
      .eq("id", match.id);

    if (error) {
      console.error("[OnlineGame] Error submitting moves:", error);
      toast.error("Hamleler gönderilemedi!");
      setWaitingForOpponent(false);
      return;
    }

    console.log("[OnlineGame] Moves submitted successfully");
    toast.info("Hamleler gönderildi, rakip bekleniyor...");

    // Check if opponent is already ready
    const { data: currentMatch } = await supabase
      .from("matches" as any)
      .select("*")
      .eq("id", match.id)
      .single() as { data: Match | null };

    if (currentMatch) {
      const opponentIsReady = isPlayer1 ? currentMatch.player2_ready : currentMatch.player1_ready;
      if (opponentIsReady) {
        const opponentField = isPlayer1 ? currentMatch.player2_field : currentMatch.player1_field;
        console.log("[OnlineGame] Opponent was already ready! Field:", opponentField);
        setOpponentMoves(opponentField || []);
        setWaitingForOpponent(false);
        toast.success("Rakip zaten hazırdı! Kartlar açılıyor...");
      }
    }
  }, [match, user, isPlayer1, currentRound]);

  // Handle round change - reset ready states
  const handleRoundChange = useCallback(async (newRound: number) => {
    if (newRound <= currentRound || !match) return;

    console.log("[OnlineGame] Round changing from", currentRound, "to", newRound);
    setCurrentRound(newRound);
    setOpponentMoves(undefined);
    setOpponentReady(false);
    setWaitingForOpponent(false);

    // Reset ready states in database for new round
    const { error } = await supabase
      .from("matches" as any)
      .update({
        player1_ready: false,
        player2_ready: false,
        player1_field: [],
        player2_field: [],
        current_round: newRound
      })
      .eq("id", match.id);

    if (error) {
      console.error("[OnlineGame] Error resetting round:", error);
    }
  }, [currentRound, match]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Maç yükleniyor...</p>
      </div>
    );
  }

  // Error state
  if (error || !match || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Wifi className="w-12 h-12 text-destructive" />
        <p className="text-destructive text-xl">{error || "Bir hata oluştu"}</p>
        <Button onClick={() => navigate("/menu")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Menüye Dön
        </Button>
      </div>
    );
  }

  // Determine player's deck and opponent's class
  const playerDeck = isPlayer1 ? match.player1_deck : match.player2_deck;
  const opponentDeck = isPlayer1 ? match.player2_deck : match.player1_deck;
  const opponentClass = opponentDeck.mainClass as ClassName;

  return (
    <div className="relative">
      {/* Online Status Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Çevrimiçi</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Tur {currentRound}</span>
        </div>
        {waitingForOpponent && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-amber-500">Rakip bekleniyor...</span>
            </div>
          </>
        )}
      </div>

      {/* Waiting Overlay */}
      {waitingForOpponent && (
        <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4 animate-pulse">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-lg font-medium">Rakip hamlesini bekliyor...</p>
            <p className="text-sm text-muted-foreground">Kartlarınız gönderildi</p>
          </div>
        </div>
      )}

      {opponentDeck && opponentDeck.cards && opponentDeck.cards.length > 0 ? (
        <SafeGameMatch
          playerDeck={playerDeck}
          opponentClass={opponentClass}
          isOnline={true}
          opponentDeck={opponentDeck}
          opponentMoves={opponentMoves}
          onMovesReady={handleMovesReady}
          onRoundChange={handleRoundChange}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-40">
          <Loader2 className="w-12 h-12 text-destructive animate-spin mb-4" />
          <p className="text-destructive font-bold text-center">
            Rakip verisi bekleniyor...<br/>
            (Veri senkronizasyonu hatası)
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Yenile
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnlineGame;
