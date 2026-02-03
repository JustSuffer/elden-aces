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
         // Safe update without RPC assumption
         const { data } = await supabase.from("profiles").select("divine_coins").eq("id", user.id).single();
         const current = data?.divine_coins || 0;
         await supabase.from("profiles").update({ divine_coins: current + reward } as any).eq("id", user.id);
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
