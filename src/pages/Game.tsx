import { useState, useCallback } from "react";
import { GameMatch } from "@/components/game/GameMatch";
import { DeckSelectionScreen } from "@/components/game/DeckSelectionScreen";
import { SavedDeck } from "@/types/deck";
import { ClassName } from "@/types/game";

const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<SavedDeck | null>(null);
  const [opponentClass, setOpponentClass] = useState<ClassName | null>(null);

  const handleStartGame = useCallback((deck: SavedDeck, oppClass: ClassName) => {
    setSelectedDeck(deck);
    setOpponentClass(oppClass);
    setGameStarted(true);
  }, []);

  if (!gameStarted || !selectedDeck || !opponentClass) {
    return <DeckSelectionScreen onStartGame={handleStartGame} />;
  }

  // Use key to force re-mounting and fresh state when game starts
  return (
    <GameMatch 
      key={`${selectedDeck.id}-${opponentClass}-${Date.now()}`}
      playerDeck={selectedDeck}
      opponentClass={opponentClass}
    />
  );
};

export default Game;
