import { useLocation, useNavigate } from "react-router-dom";
import { GameMatch } from "@/components/game/GameMatch";
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { GameState } from "@/types/game";


export default function GameArena() {
  const location = useLocation();
  const navigate = useNavigate();
  const { deck, opponentClass } = location.state || {};

  useEffect(() => {
    if (!deck || !opponentClass) {
      navigate("/game");
    }
  }, [deck, opponentClass, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Chrome requires returnValue to be set
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const { user } = useAuth();
  const { updateProgress } = useDailyMissions();

  const handleGameEnd = useCallback(async (result: "win" | "lose" | "draw", isSurrender?: boolean, stats?: GameState['stats']) => {
      if (!user) return;
      
      // Mission Updates
      const playerClass = deck?.mainClass;
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

      // Bot Match Rewards:
      // Win = 50 DC, Draw = 25 DC, Lose = 10 DC, Surrender = 0 DC
      let reward = 0;
      if (isSurrender) {
        reward = 0;
      } else if (result === "win") {
        reward = 50;
      } else if (result === "draw") {
        reward = 25;
      } else {
        reward = 10;
      }

      if (reward > 0) {
         console.log(`[GameArena] Attempting to award ${reward} coins to user ${user.id}`);
         
         // Try RPC first (Atomic & likely safer for RLS)
         const { error: rpcError } = await supabase.rpc("increment_coins" as any, { amount: reward, user_id: user.id });

         if (rpcError) {
             console.warn("[GameArena] RPC increment_coins failed, falling back to direct update:", rpcError);
             
             // Fallback: Direct Update
             const { data, error: selectError } = await supabase.from("profiles").select("divine_coins").eq("user_id", user.id).single();
             if (selectError) {
                 console.error("[GameArena] Failed to fetch current coins for fallback:", selectError);
             } else {
                 const current = data?.divine_coins || 0;
                 const { error: updateError } = await supabase.from("profiles").update({ divine_coins: current + reward } as any).eq("user_id", user.id);
                 
                 if (updateError) {
                     console.error("[GameArena] Fallback update also failed:", updateError);
                     toast.error("Ödül eklenemedi (Bağlantı Hatası)");
                 } else {
                     console.log(`[GameArena] Fallback direct update success. New balance: ${current + reward}`);
                 }
             }
         } else {
             console.log(`[GameArena] RPC success. Added ${reward} coins.`);
         }
      } else {
          console.log(`[GameArena] No reward for this outcome (Surrender)`);
      }
      
      // Do NOT navigate automatically. Wait for user to click "Return to Menu" on the Defeat screen.
  }, [user, deck, updateProgress]);

  if (!deck || !opponentClass) return null;

  return (
    <GameMatch 
      key={`${deck.id}-${opponentClass}`}
      playerDeck={deck}
      opponentClass={opponentClass}
      onGameEnd={(result, isSurrender, stats) => handleGameEnd(result, isSurrender, stats)} 
    />
  );
}
