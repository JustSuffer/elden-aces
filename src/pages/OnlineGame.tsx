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

  return (
    <div className="relative">
      {/* Online indicator */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/30">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground">Çevrimiçi</span>
      </div>
      
      <GameMatch
        key={`online-${matchId}`}
        playerDeck={playerDeck}
        opponentClass={opponentClass}
      />
    </div>
  );
};

export default OnlineGame;
