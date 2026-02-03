import { useLocation, useNavigate } from "react-router-dom";
import { GameMatch } from "@/components/game/GameMatch";
import { useEffect } from "react";


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

  if (!deck || !opponentClass) return null;

  return (
    <GameMatch 
      key={`${deck.id}-${opponentClass}-${Date.now()}`}
      playerDeck={deck}
      opponentClass={opponentClass}
    />
  );
}
