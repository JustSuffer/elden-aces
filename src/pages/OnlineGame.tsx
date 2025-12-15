import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Wifi, ArrowLeft } from "lucide-react";
import { SavedDeck } from "@/types/deck";
import { GameMatch } from "@/components/game/GameMatch";
import { ClassName } from "@/types/game";

interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_deck: SavedDeck;
  player2_deck: SavedDeck;
  status: string;
}

const OnlineGame = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId || !user) return;

    const fetchMatch = async () => {
      const { data, error } = await supabase
        .from("matches" as any)
        .select("*")
        .eq("id", matchId)
        .single() as { data: Match | null; error: any };

      if (error || !data) {
        setError("Maç bulunamadı");
        setIsLoading(false);
        return;
      }

      setMatch(data);
      setIsLoading(false);
    };

    fetchMatch();
  }, [matchId, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Maç yükleniyor...</p>
      </div>
    );
  }

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
  const isPlayer1 = user.id === match.player1_id;
  const playerDeck = isPlayer1 ? match.player1_deck : match.player2_deck;
  const opponentDeck = isPlayer1 ? match.player2_deck : match.player1_deck;
  const opponentClass = opponentDeck.mainClass as ClassName;

  const [opponentMoves, setOpponentMoves] = useState<any[] | undefined>(undefined);
  const [currentRound, setCurrentRound] = useState(1);

  // Subscribe to Match Updates
  useEffect(() => {
      if (!matchId) return;

      const channel = supabase
        .channel(`match-${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'matches',
            filter: `id=eq.${matchId}`
          },
          (payload) => {
            const newMatch = payload.new as any;
            // Check for opponent moves
            const isUserP1 = user?.id === newMatch.player1_id;
            const oppMoves = isUserP1 ? newMatch.player2_last_move : newMatch.player1_last_move;
            const myMoves = isUserP1 ? newMatch.player1_last_move : newMatch.player2_last_move;
            
            // Only trigger if opponent has moved for THIS round (we compare with our round or just assume?)
            // We need to know which round these moves are for.
            // Let's assume the moves object has { round: N, cards: [...] }
            if (oppMoves && oppMoves.round === currentRound) {
                setOpponentMoves(oppMoves.cards);
                
                // If both ready, we might want to clean up DB?
                // Or just client logic handles it.
            }
          }
        )
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
  }, [matchId, user, currentRound]);

  const handleMovesReady = async (moves: (any | null)[]) => {
      if (!match || !user) return;
      const isUserP1 = user.id === match.player1_id;
      const field = isUserP1 ? "player1_last_move" : "player2_last_move";
      
      const moveData = {
          round: currentRound,
          cards: moves
      };

      await supabase
        .from("matches" as any)
        .update({ [field]: moveData })
        .eq("id", match.id);
  };
  
  // Also update round when GameMatch tells us? 
  // GameMatch doesn't tell us round changed... useGameState handles it.
  // We can infer round change if we successfully receive opponent moves?
  useEffect(() => {
      if (opponentMoves) {
          // We received moves, so round will advance.
          // Wait, syncOnlineRound triggers calculate -> nextRound.
          // We need to increment local currentRound to listen for NEXT moves.
          // Delay it slightly to match game logic.
          setTimeout(() => {
              setCurrentRound(prev => prev + 1);
              setOpponentMoves(undefined); // Reset
          }, 5000); // 5s for reveal/damage Phase
      }
  }, [opponentMoves]);

  // ... (Existing render)
  // Pass props
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/30">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground">Çevrimiçi (Tur {currentRound})</span>
      </div>
      
      {opponentDeck && opponentDeck.cards && opponentDeck.cards.length > 0 ? (
          <GameMatch
            key={`online-${matchId}`}
            playerDeck={playerDeck}
            opponentClass={opponentClass}
            opponentDeck={opponentDeck}
            opponentMoves={opponentMoves}
            onMovesReady={handleMovesReady}
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
