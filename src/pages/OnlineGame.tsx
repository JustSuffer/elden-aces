import React, { useEffect, useState } from "react";
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-8 text-center text-white">
           <div className="text-red-500 text-4xl mb-4 font-bold">⚠️ Kritik Hata</div>
           <p className="text-lg mb-2">Oyun yüklenirken bir sorun oluştu.</p>
           <pre className="text-red-300 bg-black/50 p-4 rounded text-xs text-left overflow-auto max-w-full">
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
            const isUserP1 = user?.id === newMatch.player1_id;
            const oppMoves = isUserP1 ? newMatch.player2_last_move : newMatch.player1_last_move;
            
            if (oppMoves && oppMoves.round === currentRound) {
                setOpponentMoves(oppMoves.cards);
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
  
  useEffect(() => {
      if (opponentMoves) {
          setTimeout(() => {
              setCurrentRound(prev => prev + 1);
              setOpponentMoves(undefined);
          }, 5000);
      }
  }, [opponentMoves]);

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/30">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground">Çevrimiçi (Tur {currentRound})</span>
      </div>
      
      {opponentDeck && opponentDeck.cards && opponentDeck.cards.length > 0 ? (
          <SafeGameMatch
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

