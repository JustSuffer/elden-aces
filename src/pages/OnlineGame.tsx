import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRematch } from "@/hooks/useRematch";
import { Button } from "@/components/ui/button";
import { Loader2, Wifi, ArrowLeft, Clock, Users, RotateCcw, Check, X } from "lucide-react";
import { SavedDeck } from "@/types/deck";
import { GameMatch } from "@/components/game/GameMatch";
import { ClassName, Card } from "@/types/game";
import { toast } from "sonner";
import { calculateNewRatings, calculateDrawRatings } from "@/utils/eloCalculator";
import { ReadyPopup } from "@/components/game/ReadyPopup";
import { NextRoundWaitingPopup } from "@/components/game/NextRoundWaitingPopup";

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
  winner_id?: string | null;
  player1_final_hp?: number;
  player2_final_hp?: number;
  game_started?: boolean;
  player1_next_round_ready?: boolean;
  player2_next_round_ready?: boolean;
  game_state?: {
    player1_deck_count?: number;
    player2_deck_count?: number;
  };
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
  const [searchParams] = useSearchParams();
  const isReconnect = searchParams.get("reconnect") === "true";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opponentMoves, setOpponentMoves] = useState<(Card | null)[] | undefined>(undefined);
  const [currentRound, setCurrentRound] = useState(1);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Game start ready states
  const [showReadyPopup, setShowReadyPopup] = useState(true);
  const [isPlayerGameReady, setIsPlayerGameReady] = useState(false);
  const [isOpponentGameReady, setIsOpponentGameReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Next round ready states
  const [waitingForNextRound, setWaitingForNextRound] = useState(false);
  const [isPlayerNextRoundReady, setIsPlayerNextRoundReady] = useState(false);
  const [isOpponentNextRoundReady, setIsOpponentNextRoundReady] = useState(false);
  
  // Opponent deck count for real-time tracking
  const [opponentDeckCount, setOpponentDeckCount] = useState<number | undefined>(undefined);
  
  // Rematch hook
  const {
    rematchState,
    isLoading: rematchLoading,
    sendRematchRequest,
    acceptRematch,
    declineRematch,
    cancelRematchRequest
  } = useRematch(matchId);
  // Keep latest values for realtime callbacks (avoid stale closures + partial payload overwrites)
  const matchRef = useRef<Match | null>(null);
  const currentRoundRef = useRef<number>(1);

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  // Validate DB field arrays (avoid resolving with empty/partial data)
  const isValidField = (field: unknown): field is (Card | null)[] =>
    Array.isArray(field) && field.length === 5;

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
      matchRef.current = data;
      setMatch(data);
      setCurrentRound(data.current_round || 1);
      
      // Initialize opponent deck count based on their deck size and current round
      // Standard deck is 36 cards, initial hand is 6, so deck starts at 30
      // Each round draws 5 cards (approximately)
      const isP1 = user.id === data.player1_id;
      const oppDeck = isP1 ? data.player2_deck : data.player1_deck;
      const initialDeckCount = (oppDeck?.cards?.length || 36) - 6; // After initial hand
      const estimatedCardsUsed = ((data.current_round || 1) - 1) * 5;
      const estimatedDeckCount = Math.max(0, initialDeckCount - estimatedCardsUsed);
      setOpponentDeckCount(estimatedDeckCount);
      
      // Check if game already started (reconnect scenario)
      if (data.game_started) {
        setGameStarted(true);
        setShowReadyPopup(false);
        setIsPlayerGameReady(isP1 ? !!data.player1_ready : !!data.player2_ready);
        setIsOpponentGameReady(isP1 ? !!data.player2_ready : !!data.player1_ready);
      }
      
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

          const patch = payload.new as Partial<Match>;
          // IMPORTANT: UPDATE payload may not contain the full row unless replica identity is FULL.
          // So we merge the patch into the last known match to avoid losing deck data (black screen).
          const merged: Match = {
            ...(matchRef.current ?? ({} as Match)),
            ...(patch as any),
          };

          matchRef.current = merged;
          setMatch(merged);

          const isP1 = user.id === merged.player1_id;

          // ========== GAME START READY SYNC ==========
          if (!merged.game_started) {
            // Check if this is initial ready state (before game starts)
            const p1GameReady = merged.player1_ready;
            const p2GameReady = merged.player2_ready;
            
            setIsOpponentGameReady(isP1 ? !!p2GameReady : !!p1GameReady);
            
            // Both ready -> start game
            if (p1GameReady && p2GameReady) {
              console.log("[OnlineGame] Both players ready, starting game...");
              setTimeout(() => {
                setGameStarted(true);
                setShowReadyPopup(false);
              }, 3500); // 3 second countdown + 0.5s buffer
            }
            return; // Don't process other updates until game starts
          }

          // ========== SYNC OPPONENT DECK COUNT ==========
          if (merged.game_state) {
            const oppDeckCount = isP1 ? merged.game_state.player2_deck_count : merged.game_state.player1_deck_count;
            if (oppDeckCount !== undefined) {
              setOpponentDeckCount(oppDeckCount);
            }
          }

          // ========== NEXT ROUND READY SYNC ==========
          const p1NextRoundReady = merged.player1_next_round_ready;
          const p2NextRoundReady = merged.player2_next_round_ready;
          
          setIsOpponentNextRoundReady(isP1 ? !!p2NextRoundReady : !!p1NextRoundReady);
          
          // Both next round ready -> advance round
          if (p1NextRoundReady && p2NextRoundReady && waitingForNextRound) {
            console.log("[OnlineGame] Both players ready for next round");
            setWaitingForNextRound(false);
            setIsPlayerNextRoundReady(false);
            setIsOpponentNextRoundReady(false);
          }

          // Sync current round from database (use ref to avoid stale closure)
          const roundFromDb = merged.current_round || 1;
          if (roundFromDb !== currentRoundRef.current) {
            console.log("[OnlineGame] Syncing round from DB:", roundFromDb);
            setCurrentRound(roundFromDb);

            // Update opponent deck count based on new round
            const oppDeck = isP1 ? merged.player2_deck : merged.player1_deck;
            const initialDeckCount = (oppDeck?.cards?.length || 36) - 6;
            const estimatedCardsUsed = (roundFromDb - 1) * 5;
            const newDeckCount = Math.max(0, initialDeckCount - estimatedCardsUsed);
            setOpponentDeckCount(newDeckCount);

            // If round changed, reset next round ready states
            if (!merged.player1_next_round_ready && !merged.player2_next_round_ready) {
              setWaitingForNextRound(false);
              setIsPlayerNextRoundReady(false);
              setIsOpponentNextRoundReady(false);
            }

            // If round changed and both ready states are false, it's a new round
            if (!merged.player1_ready && !merged.player2_ready) {
              setOpponentMoves(undefined);
              setOpponentReady(false);
              setWaitingForOpponent(false);
            }
          }

          // Check if opponent is ready (for card placement)
          const opponentIsReady = isP1 ? merged.player2_ready : merged.player1_ready;
          const myReady = isP1 ? merged.player1_ready : merged.player2_ready;

          console.log(
            "[OnlineGame] Ready states - Me:",
            myReady,
            "Opponent:",
            opponentIsReady,
            "Round:",
            merged.current_round
          );

          setOpponentReady(!!opponentIsReady);

          // If both players are ready, sync the opponent's field
          if (myReady && opponentIsReady) {
            const opponentField = isP1 ? merged.player2_field : merged.player1_field;
            console.log("[OnlineGame] Both ready! Opponent field:", opponentField);

            // Never resolve a round with an empty/partial opponent field (prevents 'bot gibi' oynama).
            if (!isValidField(opponentField)) {
              void (async () => {
                console.log("[OnlineGame] Opponent field invalid/missing; fetching from DB...");
                const { data } = (await supabase
                  .from("matches" as any)
                  .select("player1_field, player2_field")
                  .eq("id", matchId)
                  .single()) as { data: Match | null };

                const fetchedField = isP1 ? data?.player2_field : data?.player1_field;
                console.log("[OnlineGame] Fetched opponent field:", fetchedField);

                if (isValidField(fetchedField)) {
                  setOpponentMoves(fetchedField);
                  setWaitingForOpponent(false);
                  toast.success("Rakip hazır! Kartlar açılıyor...");
                } else {
                  console.warn("[OnlineGame] Opponent field still invalid; keeping waiting state.");
                }
              })();
              return;
            }

            setOpponentMoves(opponentField);
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
  }, [matchId, user, match?.player1_id, waitingForNextRound]);

  // Handle game start ready
  const handleGameReady = useCallback(async () => {
    if (!match || !user) return;
    
    console.log("[OnlineGame] Player ready for game start");
    setIsPlayerGameReady(true);
    
    const readyColumn = isPlayer1 ? "player1_ready" : "player2_ready";
    
    const { error } = await supabase
      .from("matches" as any)
      .update({
        [readyColumn]: true
      })
      .eq("id", match.id);
    
    if (error) {
      console.error("[OnlineGame] Error setting game ready:", error);
      toast.error("Hazır durumu gönderilemedi!");
      setIsPlayerGameReady(false);
      return;
    }
    
    // Check if opponent is also ready
    const { data: currentMatch } = await supabase
      .from("matches" as any)
      .select("player1_ready, player2_ready")
      .eq("id", match.id)
      .single() as { data: { player1_ready: boolean; player2_ready: boolean } | null };
    
    if (currentMatch) {
      const opponentReady = isPlayer1 ? currentMatch.player2_ready : currentMatch.player1_ready;
      setIsOpponentGameReady(!!opponentReady);
      
      if (currentMatch.player1_ready && currentMatch.player2_ready) {
        // Mark game as started
        await supabase
          .from("matches" as any)
          .update({ 
            game_started: true,
            player1_ready: false,
            player2_ready: false
          })
          .eq("id", match.id);
        
        setTimeout(() => {
          setGameStarted(true);
          setShowReadyPopup(false);
        }, 3500);
      }
    }
  }, [match, user, isPlayer1]);

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

        if (isValidField(opponentField)) {
          setOpponentMoves(opponentField);
          setWaitingForOpponent(false);
          toast.success("Rakip zaten hazırdı! Kartlar açılıyor...");
        } else {
          console.warn("[OnlineGame] Opponent ready but field invalid; keeping waiting state.");
          // Keep waitingForOpponent=true until a valid field arrives.
        }
      }
    }
  }, [match, user, isPlayer1, currentRound]);

  // Handle round change - now requires both players to press Next Round
  const handleRoundChange = useCallback(async (newRound: number) => {
    if (!match) return;

    const fromRound = Number(matchRef.current?.current_round ?? currentRoundRef.current ?? 1);
    if (!Number.isFinite(fromRound) || newRound <= fromRound) return;

    console.log("[OnlineGame] Player requesting next round:", { fromRound, newRound });

    // Set local state - waiting for opponent
    setIsPlayerNextRoundReady(true);
    setWaitingForNextRound(true);

    const nextRoundReadyColumn = isPlayer1 ? "player1_next_round_ready" : "player2_next_round_ready";

    // Mark this player as ready for next round
    const { error: readyError } = await supabase
      .from("matches" as any)
      .update({
        [nextRoundReadyColumn]: true
      })
      .eq("id", match.id);

    if (readyError) {
      console.error("[OnlineGame] Error setting next round ready:", readyError);
      setWaitingForNextRound(false);
      setIsPlayerNextRoundReady(false);
      return;
    }

    // Check if opponent is also ready
    const { data: currentMatch } = await supabase
      .from("matches" as any)
      .select("player1_next_round_ready, player2_next_round_ready")
      .eq("id", match.id)
      .single() as { data: { player1_next_round_ready: boolean; player2_next_round_ready: boolean } | null };

    if (currentMatch) {
      const opponentNextRoundReady = isPlayer1 ? currentMatch.player2_next_round_ready : currentMatch.player1_next_round_ready;
      setIsOpponentNextRoundReady(!!opponentNextRoundReady);

      // Both ready - advance round
      if (currentMatch.player1_next_round_ready && currentMatch.player2_next_round_ready) {
        console.log("[OnlineGame] Both players ready, advancing round to:", newRound);
        
        // Prepare local UI
        setOpponentMoves(undefined);
        setOpponentReady(false);
        setWaitingForOpponent(false);
        setWaitingForNextRound(false);
        setIsPlayerNextRoundReady(false);
        setIsOpponentNextRoundReady(false);

        // Advance round in DB
        await supabase
          .from("matches" as any)
          .update({
            player1_ready: false,
            player2_ready: false,
            player1_field: [],
            player2_field: [],
            player1_next_round_ready: false,
            player2_next_round_ready: false,
            current_round: newRound,
          })
          .eq("id", match.id)
          .eq("current_round", fromRound);

        console.log("[OnlineGame] Round advanced in DB.");
      }
    }
  }, [match, isPlayer1]);

  // Handle game end - update stats and ELO
  const handleGameEnd = useCallback(async (winnerId: string | null, playerHP: number, opponentHP: number) => {
    if (!match || !user || gameEnded) return;
    setGameEnded(true);

    const opponentId = isPlayer1 ? match.player2_id : match.player1_id;

    // Update match as completed
    await supabase
      .from("matches" as any)
      .update({
        status: "completed",
        winner_id: winnerId,
        player1_final_hp: isPlayer1 ? playerHP : opponentHP,
        player2_final_hp: isPlayer1 ? opponentHP : playerHP,
        finished_at: new Date().toISOString()
      })
      .eq("id", match.id);

    // Get current ELO ratings
    const { data: myStats } = await supabase
      .from("game_stats")
      .select("elo_rating, wins, losses, total_games")
      .eq("user_id", user.id)
      .single();

    const { data: oppStats } = await supabase
      .from("game_stats")
      .select("elo_rating")
      .eq("user_id", opponentId)
      .single();

    if (myStats && oppStats) {
      const myElo = myStats.elo_rating || 1000;
      const oppElo = oppStats.elo_rating || 1000;

      let newMyElo: number, newOppElo: number;
      let wins = myStats.wins, losses = myStats.losses;

      if (winnerId === user.id) {
        const result = calculateNewRatings(myElo, oppElo);
        newMyElo = result.winnerNewRating;
        newOppElo = result.loserNewRating;
        wins++;
      } else if (winnerId === opponentId) {
        const result = calculateNewRatings(oppElo, myElo);
        newMyElo = result.loserNewRating;
        newOppElo = result.winnerNewRating;
        losses++;
      } else {
        const result = calculateDrawRatings(myElo, oppElo);
        newMyElo = result.player1NewRating;
        newOppElo = result.player2NewRating;
      }

      // Update my stats
      await supabase
        .from("game_stats")
        .update({
          elo_rating: newMyElo,
          wins,
          losses,
          total_games: myStats.total_games + 1
        })
        .eq("user_id", user.id);

      // Update opponent stats (only total_games, their win/loss handled on their end)
      await supabase
        .from("game_stats")
        .update({ elo_rating: newOppElo })
        .eq("user_id", opponentId);
    }
  }, [match, user, isPlayer1, gameEnded]);

  // Navigate to new rematch
  useEffect(() => {
    if (rematchState.newMatchId) {
      navigate(`/online-game/${rematchState.newMatchId}`);
    }
  }, [rematchState.newMatchId, navigate]);

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
      {/* Ready Popup - shown before game starts */}
      <ReadyPopup
        isOpen={showReadyPopup && !gameStarted}
        isPlayerReady={isPlayerGameReady}
        isOpponentReady={isOpponentGameReady}
        playerClass={playerDeck.mainClass}
        opponentClass={opponentClass}
        onReady={handleGameReady}
      />

      {/* Next Round Waiting Popup */}
      <NextRoundWaitingPopup
        isOpen={waitingForNextRound && !isOpponentNextRoundReady}
        isPlayerReady={isPlayerNextRoundReady}
        isOpponentReady={isOpponentNextRoundReady}
        currentRound={currentRound}
        nextRound={currentRound + 1}
      />

      {/* Online Status Bar */}
      {gameStarted && (
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
      )}

      {/* Waiting Overlay for card placement */}
      {waitingForOpponent && gameStarted && (
        <div className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4 animate-pulse">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-lg font-medium">Rakip hamlesini bekliyor...</p>
            <p className="text-sm text-muted-foreground">Kartlarınız gönderildi</p>
          </div>
        </div>
      )}

      {/* Game Match - only show after game starts */}
      {gameStarted && opponentDeck && opponentDeck.cards && opponentDeck.cards.length > 0 ? (
        <SafeGameMatch
          playerDeck={playerDeck}
          opponentClass={opponentClass}
          isOnline={true}
          opponentDeck={opponentDeck}
          opponentMoves={opponentMoves}
          serverRound={currentRound}
          opponentDeckCount={opponentDeckCount}
          onMovesReady={handleMovesReady}
          onRoundChange={handleRoundChange}
        />
      ) : gameStarted ? (
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
      ) : null}
    </div>
  );
};

export default OnlineGame;
