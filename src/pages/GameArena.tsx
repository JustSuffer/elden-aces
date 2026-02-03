import { useLocation, useNavigate } from "react-router-dom";
import { GameMatch } from "@/components/game/GameMatch";
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";


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

  const handleGameEnd = useCallback(async (result: "win" | "lose", isSurrender?: boolean) => {
      if (!user) return;
      
      let reward = 0;
      if (result === "win") {
          reward = 50;
          // toast.success("Zafer! +50 Divine Coin");
      } else {
          if (isSurrender) {
              // toast.info("Teslim oldun. 0 Divine Coin");
              reward = 0;
          } else {
              reward = 10; 
              // toast.info("Yenilgi. +10 Divine Coin");
          }
      }

      if (reward > 0) {
         console.log(`[GameArena] Attempting to award ${reward} coins to user ${user.id}`);
         // Safe update without RPC assumption
         const { data, error: selectError } = await supabase.from("profiles").select("divine_coins").eq("id", user.id).single();
         
         if (selectError) {
             console.error("[GameArena] Failed to fetch current coins:", selectError);
             return;
         }

         const current = data?.divine_coins || 0;
         const { error: updateError } = await supabase.from("profiles").update({ divine_coins: current + reward } as any).eq("id", user.id);
         
         if (updateError) {
             console.error("[GameArena] Failed to update coins:", updateError);
         } else {
             console.log(`[GameArena] Successfully added ${reward} coins. New balance: ${current + reward}`);
         }
      } else {
          console.log(`[GameArena] No reward for this outcome (Reward: ${reward})`);
      }
      
      // Do NOT navigate automatically. Wait for user to click "Return to Menu" on the Defeat screen.
  }, [user]);

  if (!deck || !opponentClass) return null;

  return (
    <GameMatch 
      key={`${deck.id}-${opponentClass}-${Date.now()}`}
      playerDeck={deck}
      opponentClass={opponentClass}
      onGameEnd={(result, isSurrender) => handleGameEnd(result, isSurrender)} 
    />
  );
}
