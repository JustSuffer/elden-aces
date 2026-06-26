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
import { VictoryPopup } from "@/components/game/VictoryPopup";
import { useLanguage } from "@/hooks/useLanguage";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { GameState } from "@/types/game";

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
  player1_field_round?: number;
  player2_field_round?: number;
  game_state?: {
    player1_deck_count?: number;
    player2_deck_count?: number;
  };
  player1_state?: any | null;
  player2_state?: any | null;
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
  const { language } = useLanguage();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opponentMoves, setOpponentMoves] = useState<(Card | null)[] | undefined>(undefined);
  const [currentRound, setCurrentRound] = useState(1);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [opponentSurrendered, setOpponentSurrendered] = useState(false);
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

  // Snapshot restoration for refresh/reconnect (online)
  const [restoredState, setRestoredState] = useState<any | null>(null);
  const restoreLoadedRef = useRef(false);
  
  // Stats for ELO calculation
  const [potentialLpChange, setPotentialLpChange] = useState<{win: number, lose: number, draw: number} | null>(null);

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
  const gameEndedRef = useRef(false);

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  useEffect(() => {
    gameEndedRef.current = gameEnded;
  }, [gameEnded]);

  // Validate DB field arrays (avoid resolving with empty/partial data)
  // Accept length===5 (proper [null,null,null,null,null] or filled) 
  // Also accept length===0 (reset state) but treat as invalid for damage resolution
  const isValidField = (field: unknown): field is (Card | null)[] =>
    Array.isArray(field) && field.length === 5;

  // Check if field round matches current round (prevents stale data)
  const isFieldForCurrentRound = (fieldRound: number | undefined, round: number): boolean =>
    fieldRound !== undefined && fieldRound === round;

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
      
      const isP1 = user.id === data.player1_id;

      // ---- Restore my snapshot if present (refresh / reconnect) ----
      if (!restoreLoadedRef.current) {
        const mySnapshot = isP1 ? (data as any).player1_state : (data as any).player2_state;
        if (mySnapshot && typeof mySnapshot === "object") {
          console.log("[OnlineGame] Restoring local game state from snapshot for round:", mySnapshot.round);
          setRestoredState(mySnapshot);
        }
        restoreLoadedRef.current = true;
      }

      // Initialize opponent deck count based on their deck size and current round
      // Standard deck is 36 cards, initial hand is 6, so deck starts at 30
      // Each round draws 5 cards (approximately)
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
    fetchMatch();
  }, [matchId, user]);

  // Fetch stats and calculate potential ELO changes
  useEffect(() => {
    if (!match || !user) return;
    
    const fetchStats = async () => {
        const opponentId = user.id === match.player1_id ? match.player2_id : match.player1_id;
        
        const { data: myStats } = await supabase
          .from("game_stats")
          .select("elo_rating")
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
            
            // Calculate potential outcomes
            const winRes = calculateNewRatings(myElo, oppElo);
            const loseRes = calculateNewRatings(oppElo, myElo);
            const drawRes = calculateDrawRatings(myElo, oppElo);
            
            setPotentialLpChange({
                win: winRes.winnerNewRating - myElo,
                lose: loseRes.loserNewRating - myElo, // will be negative
                draw: drawRes.player1NewRating - myElo
            });
        }
    };
    
    fetchStats();
  }, [match, user]);

  // Track which round's opponentMoves we've processed to avoid stale data
  const processedOpponentRoundRef = useRef<number>(0);

  // Subscribe to match updates via Realtime
  useEffect(() => {
    if (!matchId || !user) return;

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

          // ========== OPPONENT SURRENDER DETECTION ==========
          if (merged.status === "completed" && merged.winner_id && merged.winner_id === user.id && !gameEndedRef.current) {
            console.log("[OnlineGame] Opponent surrendered! I am the winner.");
            setOpponentSurrendered(true);
            setGameEnded(true);
            gameEndedRef.current = true;
            
            // Award coins to the winner (ELO was already updated by the surrendering player)
            const reward = 100; // Full online win reward
            supabase.rpc("increment_coins" as any, { amount: reward, user_id: user.id }).then(({ error: rpcError }) => {
              if (rpcError) {
                // Fallback
                supabase.from("profiles").select("divine_coins").eq("user_id", user.id).single().then(({ data }) => {
                  supabase.from("profiles").update({ divine_coins: (data?.divine_coins || 0) + reward } as any).eq("user_id", user.id);
                });
              }
            });
            return;
          }

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
          

          // Sync current round from database (use ref to avoid stale closure)
          const roundFromDb = merged.current_round || 1;
          if (roundFromDb !== currentRoundRef.current) {
            console.log("[OnlineGame] Syncing round from DB:", roundFromDb);
            setCurrentRound(roundFromDb);

            // CRITICAL: Clear opponent moves when round changes to prevent stale data
            setOpponentMoves(undefined);
            setOpponentReady(false);
            setWaitingForOpponent(false);

            // Update opponent deck count based on new round
            const oppDeck = isP1 ? merged.player2_deck : merged.player1_deck;
            const initialDeckCount = (oppDeck?.cards?.length || 36) - 6;
            const estimatedCardsUsed = (roundFromDb - 1) * 5;
            const newDeckCount = Math.max(0, initialDeckCount - estimatedCardsUsed);
            setOpponentDeckCount(newDeckCount);

            // Round advanced on server -> we can safely close the next-round waiting UI.
            setWaitingForNextRound(false);
            setIsPlayerNextRoundReady(false);
            setIsOpponentNextRoundReady(false);
          }

          // Check if opponent is ready (for card placement) - only process for CURRENT round
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

          // If both players are ready, sync the opponent's field for THIS round
          if (myReady && opponentIsReady) {
            const opponentField = isP1 ? merged.player2_field : merged.player1_field;
            const opponentFieldRound = isP1 ? merged.player2_field_round : merged.player1_field_round;
            const dbRound = merged.current_round || 1;
            
            console.log("[OnlineGame] Both ready! Opponent field:", opponentField, "fieldRound:", opponentFieldRound, "dbRound:", dbRound);

            // CRITICAL: Only accept opponent's field if it's for the CURRENT round
            // This prevents showing stale cards from previous rounds
            if (!isFieldForCurrentRound(opponentFieldRound, dbRound)) {
              console.warn("[OnlineGame] Opponent field_round mismatch, ignoring stale data:", { opponentFieldRound, dbRound });
              return;
            }

            // Never resolve a round with an empty/partial opponent field (prevents 'bot gibi' oynama).
            if (!isValidField(opponentField)) {
              void (async () => {
                console.log("[OnlineGame] Opponent field invalid/missing; fetching from DB...");
                const { data } = (await supabase
                  .from("matches" as any)
                  .select("player1_field, player2_field, player1_field_round, player2_field_round, current_round")
                  .eq("id", matchId)
                  .single()) as { data: { player1_field: (Card | null)[]; player2_field: (Card | null)[]; player1_field_round: number; player2_field_round: number; current_round: number } | null };

                const fetchedField = isP1 ? data?.player2_field : data?.player1_field;
                const fetchedFieldRound = isP1 ? data?.player2_field_round : data?.player1_field_round;
                const fetchedRound = data?.current_round || 1;
                
                console.log("[OnlineGame] Fetched opponent field:", fetchedField, "fieldRound:", fetchedFieldRound, "dbRound:", fetchedRound);

                // Only set if the field_round matches current round and we haven't processed this round yet
                if (isValidField(fetchedField) && isFieldForCurrentRound(fetchedFieldRound, fetchedRound) && fetchedRound === currentRoundRef.current) {
                  if (processedOpponentRoundRef.current !== fetchedRound) {
                    processedOpponentRoundRef.current = fetchedRound;
                    setOpponentMoves(fetchedField);
                    setWaitingForOpponent(false);
                    toast.success("Rakip hazır! Kartlar açılıyor...");
                  }
                } else {
                  console.warn("[OnlineGame] Opponent field still invalid or round mismatch; keeping waiting state.");
                }
              })();
              return;
            }

            // Only set opponent moves if we haven't processed this round yet
            if (processedOpponentRoundRef.current !== dbRound) {
              processedOpponentRoundRef.current = dbRound;
              setOpponentMoves(opponentField);
              setWaitingForOpponent(false);
              toast.success("Rakip hazır! Kartlar açılıyor...");
            }
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
  }, [matchId, user?.id]);

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

    const roundToPlay = currentRoundRef.current;

    console.log("[OnlineGame] Submitting moves for round:", roundToPlay, moves);
    setWaitingForOpponent(true);

    const fieldColumn = isPlayer1 ? "player1_field" : "player2_field";
    const readyColumn = isPlayer1 ? "player1_ready" : "player2_ready";
    const fieldRoundColumn = isPlayer1 ? "player1_field_round" : "player2_field_round";

    // IMPORTANT:
    // - current_round is advanced ONLY in handleRoundChange (when both players click next round)
    // - This update is guarded by current_round to prevent late packets overwriting the wrong round
    // - field_round tracks which round this field belongs to (prevents stale data display)
    const { error } = await supabase
      .from("matches" as any)
      .update({
        [fieldColumn]: moves,
        [readyColumn]: true,
        [fieldRoundColumn]: roundToPlay,
      })
      .eq("id", match.id)
      .eq("current_round", roundToPlay);

    if (error) {
      console.error("[OnlineGame] Error submitting moves:", error);
      toast.error("Hamleler gönderilemedi (tur senkronu kaydı). Yeniden senkronize ediliyor...");

      // Force a refetch to resync local state with DB
      const { data: latest } = (await supabase
        .from("matches" as any)
        .select("*")
        .eq("id", match.id)
        .single()) as { data: Match | null };

      if (latest) {
        matchRef.current = latest;
        setMatch(latest);
        setCurrentRound(latest.current_round || 1);
        setOpponentMoves(undefined);
        setOpponentReady(false);
      }

      setWaitingForOpponent(false);
      return;
    }

    console.log("[OnlineGame] Moves submitted successfully for round:", roundToPlay);
    toast.info("Hamleler gönderildi, rakip bekleniyor...");

    // Check if opponent is already ready for THIS round
    const { data: currentMatch } = await supabase
      .from("matches" as any)
      .select("*")
      .eq("id", match.id)
      .single() as { data: Match | null };

    if (currentMatch) {
      const opponentIsReady = isPlayer1 ? currentMatch.player2_ready : currentMatch.player1_ready;
      const opponentFieldRound = isPlayer1 ? currentMatch.player2_field_round : currentMatch.player1_field_round;
      const dbRound = currentMatch.current_round || 1;

      // Only process if opponent is ready AND we're on the same round AND field is for current round
      if (opponentIsReady && dbRound === roundToPlay && isFieldForCurrentRound(opponentFieldRound, dbRound)) {
        const opponentField = isPlayer1 ? currentMatch.player2_field : currentMatch.player1_field;
        console.log("[OnlineGame] Opponent was already ready for round:", dbRound, "Field:", opponentField, "fieldRound:", opponentFieldRound);

        if (isValidField(opponentField) && processedOpponentRoundRef.current !== dbRound) {
          processedOpponentRoundRef.current = dbRound;
          setOpponentMoves(opponentField);
          setWaitingForOpponent(false);
          toast.success("Rakip zaten hazırdı! Kartlar açılıyor...");
        } else if (!isValidField(opponentField)) {
          console.warn("[OnlineGame] Opponent ready but field invalid; keeping waiting state.");
          // Keep waitingForOpponent=true until a valid field arrives.
        }
      }
    }
  }, [match, user, isPlayer1]);

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

        // Advance round in DB - reset fields to proper 5-slot arrays and clear field_round
        const emptyField = [null, null, null, null, null];
        await supabase
          .from("matches" as any)
          .update({
            player1_ready: false,
            player2_ready: false,
            player1_field: emptyField,
            player2_field: emptyField,
            player1_field_round: 0,
            player2_field_round: 0,
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
  const handleGameEnd = useCallback(async (winnerId: string | null, playerHP: number, opponentHP: number, isSurrender = false) => {
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
    
    // Check mode
    const mode = searchParams.get("mode");
    const isPrivate = mode === "private";
    
    // Update ELO only for ranked (non-private) matches
    if (!isPrivate && myStats && oppStats) {
       const myElo = myStats.elo_rating || 1000;
       const oppElo = oppStats.elo_rating || 1000;
       
       let newMyElo: number, newOppElo: number;
       let myWins = myStats.wins, myLosses = myStats.losses;
       // We need to fetch opponent's win/loss stats too
       const { data: fullOppStats } = await supabase
          .from("game_stats")
          .select("wins, losses, total_games")
          .eq("user_id", opponentId)
          .single();
       
       let oppWins = fullOppStats?.wins || 0;
       let oppLosses = fullOppStats?.losses || 0;
       let oppTotalGames = fullOppStats?.total_games || 0;

       if (winnerId === user.id) {
         const result = calculateNewRatings(myElo, oppElo);
         newMyElo = result.winnerNewRating;
         newOppElo = result.loserNewRating;
         myWins++;
         oppLosses++;
       } else if (winnerId === opponentId) {
         const result = calculateNewRatings(oppElo, myElo);
         newMyElo = result.loserNewRating;
         newOppElo = result.winnerNewRating;
         myLosses++;
         oppWins++;
       } else {
         const result = calculateDrawRatings(myElo, oppElo);
         newMyElo = result.player1NewRating;
         newOppElo = result.player2NewRating;
       }
       
       // Update ELO & Wins for both players
       await supabase.from("game_stats").update({ elo_rating: newMyElo, wins: myWins, losses: myLosses, total_games: myStats.total_games + 1 }).eq("user_id", user.id);
       await supabase.from("game_stats").update({ elo_rating: newOppElo, wins: oppWins, losses: oppLosses, total_games: oppTotalGames + 1 }).eq("user_id", opponentId);
    }
    
    // Award coins for ALL online matches (ranked + private)
    // Online: Win 100, Draw 50, Loss 25, Surrender 0
    let reward = 0;
    if (winnerId === null) reward = 50;
    else if (winnerId === user.id) reward = 100;
    else if (!isSurrender) reward = 25;
    
    if (reward > 0) {
        const { error: rpcError } = await supabase.rpc("increment_coins" as any, { amount: reward, user_id: user.id });
        if (rpcError) {
           const { data } = await supabase.from("profiles").select("divine_coins").eq("user_id", user.id).single();
           await supabase.from("profiles").update({ divine_coins: (data?.divine_coins || 0) + reward } as any).eq("user_id", user.id);
        }
    }
  }, [match, user, isPlayer1, gameEnded]);

  const { updateProgress } = useDailyMissions();
  // Handle generic game end from GameMatch (Concede OR Normal)
  const handleMatchEnd = useCallback((result: "win" | "lose" | "draw", isSurrender: boolean = false, stats?: GameState['stats']) => {
     if (!match || !user) return;
     const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
     
     // Determine winner based on result from MY perspective
     // result="win" -> I won.
     // result="lose" -> I lost (or conceded).
     // result="draw" -> No winner
     const winnerId = result === "win" ? user.id : (result === "lose" ? opponentId : null);
     
     // Mission Updates
     const playerDeck = isPlayer1 ? match.player1_deck : match.player2_deck;
     const playerClass = playerDeck?.mainClass;
     const isWin = result === "win";

     updateProgress({ type: 'play_games', amount: 1, className: playerClass, isWin });

     if (isWin) {
          updateProgress({ type: 'win_games', amount: 1, className: playerClass, isWin });
          updateProgress({ type: 'win_class', amount: 1, className: playerClass, isWin });
     }

     if (stats) {
         if (stats.cardsStolen > 0) updateProgress({ type: 'steal_cards', amount: stats.cardsStolen, className: playerClass, isWin });
         if (stats.cardsFrozen > 0) updateProgress({ type: 'freeze_cards', amount: stats.cardsFrozen, className: playerClass, isWin });
         if (stats.cardsBurned > 0) updateProgress({ type: 'burn_cards', amount: stats.cardsBurned, className: playerClass, isWin });
         if (stats.hpHealed > 0) updateProgress({ type: 'heal_points', amount: stats.hpHealed, className: playerClass, isWin });
         if (stats.damageDealt > 0) updateProgress({ type: 'deal_damage', amount: stats.damageDealt, className: playerClass, isWin });
         if (stats.specialCardsPlayed > 0) updateProgress({ type: 'play_special', amount: stats.specialCardsPlayed, className: playerClass, isWin });
         if (stats.roundsPlayed >= 7) updateProgress({ type: 'reach_round_7', amount: 1, className: playerClass, isWin });
     }

     // For HP, we might want real values, but if not available we use 40/0 or 0/40.
     // GameMatch doesn't pass HP in onGameEnd yet. We can assume 0 for loser.
     handleGameEnd(winnerId, result === "win" ? 40 : 0, result === "win" ? 0 : 40, isSurrender);
  }, [match, user, isPlayer1, handleGameEnd, updateProgress]);

  // Persist a per-round snapshot of local GameState (online refresh/reconnect support).
  // We write only OUR side; opponent writes their own. Trigger does not validate this column.
  const handleSnapshot = useCallback((state: any) => {
    if (!match || !user) return;
    const column = isPlayer1 ? "player1_state" : "player2_state";
    // Fire-and-forget; never block the game loop on this.
    void supabase
      .from("matches" as any)
      .update({ [column]: state } as any)
      .eq("id", match.id)
      .then(({ error }) => {
        if (error) console.warn("[OnlineGame] Snapshot save failed:", error);
      });
  }, [match, user, isPlayer1]);

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

  // Normalize legacy class names (older decks may still store Conjurer/Incinerator)
  const normalizeClassName = (c: string) => (c === "Incinerator" ? "Decay" : c === "Conjurer" ? "Vessel" : c);

  // Determine player's deck and opponent's class (sanitize for runtime)
  const rawPlayerDeck = isPlayer1 ? match.player1_deck : match.player2_deck;
  const rawOpponentDeck = isPlayer1 ? match.player2_deck : match.player1_deck;

  // Safely extract cards array - handle undefined, null, or invalid data
  const safeGetCards = (deck: SavedDeck | null | undefined): Card[] => {
    if (!deck) return [];
    if (!deck.cards) return [];
    if (!Array.isArray(deck.cards)) return [];
    return deck.cards;
  };

  // Safely get main class with fallback
  const safeGetMainClass = (deck: SavedDeck | null | undefined): ClassName => {
    if (!deck) return "Vitalist";
    if (!deck.mainClass) return "Vitalist";
    const normalized = normalizeClassName(String(deck.mainClass));
    // Validate that it's a known class
    const validClasses = ["Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper", "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"];
    return validClasses.includes(normalized) ? normalized as ClassName : "Vitalist";
  };

  const playerDeck: SavedDeck = {
    id: rawPlayerDeck?.id || "unknown",
    name: rawPlayerDeck?.name || "Unknown Deck",
    mainClass: safeGetMainClass(rawPlayerDeck),
    secondaryClasses: Array.isArray(rawPlayerDeck?.secondaryClasses) 
      ? rawPlayerDeck.secondaryClasses.map((c: any) => normalizeClassName(String(c)) as ClassName) 
      : [],
    cards: safeGetCards(rawPlayerDeck),
    createdAt: rawPlayerDeck?.createdAt || new Date().toISOString(),
  };

  const opponentDeck: SavedDeck = {
    id: rawOpponentDeck?.id || "unknown",
    name: rawOpponentDeck?.name || "Unknown Deck",
    mainClass: safeGetMainClass(rawOpponentDeck),
    secondaryClasses: Array.isArray(rawOpponentDeck?.secondaryClasses)
      ? rawOpponentDeck.secondaryClasses.map((c: any) => normalizeClassName(String(c)) as ClassName)
      : [],
    cards: safeGetCards(rawOpponentDeck),
    createdAt: rawOpponentDeck?.createdAt || new Date().toISOString(),
  };

  const opponentClass = opponentDeck.mainClass;

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
        isOpen={waitingForNextRound}
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
      {gameStarted && playerDeck.cards.length > 0 ? (
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
          onGameEnd={handleMatchEnd}
          lpChange={potentialLpChange}
          opponentSurrendered={opponentSurrendered}
          restoredState={restoredState}
          onSnapshot={handleSnapshot}
        />
      ) : gameStarted ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-40">
          <Loader2 className="w-12 h-12 text-destructive animate-spin mb-4" />
          <p className="text-destructive font-bold text-center">
            Deste verisi bekleniyor...<br/>
            (Kendi deste veriniz yüklenemedi)
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Yenile
          </Button>
        </div>
      ) : null}

      {/* Opponent Surrender Victory Popup - shown even if game hasn't fully started */}
      {opponentSurrendered && !gameStarted && (
        <VictoryPopup
          open={true}
          outcome="win"
          playerHP={40}
          opponentHP={0}
          winReason={language === "tr" ? "Rakip teslim oldu!" : "Opponent surrendered!"}
          onReturnToMenu={() => navigate("/")}
          isOnline={true}
          lpChange={potentialLpChange}
        />
      )}
    </div>
  );
};

export default OnlineGame;
