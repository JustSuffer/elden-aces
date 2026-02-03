import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { DeckSelectionScreen } from "@/components/game/DeckSelectionScreen";
import { SavedDeck } from "@/types/deck";
import { ClassName } from "@/types/game";

const Game = () => {
  const navigate = useNavigate();

  const handleStartGame = useCallback((deck: SavedDeck, oppClass: ClassName) => {
    navigate("/gamearena", { state: { deck, opponentClass: oppClass } });
  }, [navigate]);

  return <DeckSelectionScreen onStartGame={handleStartGame} />;
};

export default Game;
