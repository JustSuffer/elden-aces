import { GameCard } from "@/components/game/GameCard";
import { HPBar } from "@/components/game/HPBar";
import { DeckCounter } from "@/components/game/DeckCounter";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/useGameState";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dices } from "lucide-react";
import { toast } from "sonner";

const Game = () => {
  const navigate = useNavigate();
  const { gameState, placeCard, removeCardFromField, endPlacement, rollDice } = useGameState();

  const handleCardClick = (cardIndex: number) => {
    if (gameState.phase !== "placement") return;

    // Find first empty slot
    const emptySlot = gameState.playerField.findIndex((c) => c === null);
    if (emptySlot !== -1) {
      placeCard(cardIndex, emptySlot);
    }
  };

  const handleFieldCardClick = (fieldIndex: number) => {
    if (gameState.phase !== "placement") return;
    removeCardFromField(fieldIndex);
  };

  const handleRollDice = () => {
    if (gameState.diceUsed >= 2) {
      toast.error("No dice rolls remaining!");
      return;
    }

    const result = rollDice();
    toast.success(`Dice rolled: ${result}!`);
  };

  const handleEndPlacement = () => {
    const placedCards = gameState.playerField.filter((c) => c !== null).length;
    if (placedCards < 5) {
      toast.error("You must place 5 cards!");
      return;
    }
    endPlacement();
  };

  const canPlaceCards = gameState.playerField.filter((c) => c !== null).length < 5;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menu
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">Play vs Bot</div>
        <div className="w-24" />
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-between p-8 gap-8">
        {/* Opponent Area */}
        <div className="w-full max-w-6xl flex items-start gap-4">
          <DeckCounter count={gameState.opponentDeck.length} isOpponent />
          <div className="flex-1 flex flex-col items-center gap-4">
            <HPBar current={gameState.opponentHP} max={30} label="Opponent" isOpponent />
            {/* Opponent Field */}
            <div className="flex gap-3">
              {gameState.opponentField.map((card, i) => (
                <GameCard key={i} card={card} isPlaceholder={!card} faceDown={gameState.phase === "placement"} />
              ))}
            </div>
          </div>
        </div>

        {/* Center Area - Round & Actions */}
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-primary glow-gold mb-2">Round {gameState.round}/5</h1>
            <p className="text-lg text-muted-foreground tracking-wider">
              {gameState.phase === "placement" && "Place your cards"}
              {gameState.phase === "reveal" && "Cards revealed!"}
              {gameState.phase === "damage" && "Calculating damage..."}
              {gameState.phase === "end" && "Game Over"}
            </p>
          </div>

          {gameState.phase === "placement" && (
            <div className="flex gap-4">
              <Button
                variant="default"
                size="lg"
                onClick={handleRollDice}
                disabled={gameState.diceUsed >= 2}
                className="gap-2 bg-psi hover:bg-psi/80"
              >
                <Dices className="w-5 h-5" />
                Roll Π Dice ({gameState.diceUsed}/2)
              </Button>

              <Button
                variant="default"
                size="lg"
                onClick={handleEndPlacement}
                disabled={gameState.playerField.filter((c) => c !== null).length < 5}
                className="gap-2"
              >
                End Placement
              </Button>
            </div>
          )}
        </div>

        {/* Player Area */}
        <div className="w-full max-w-6xl flex items-end gap-4">
          <DeckCounter count={gameState.playerDeck.length} />
          <div className="flex-1 flex flex-col items-center gap-4">
            {/* Player Field */}
            <div className="flex gap-3">
              {gameState.playerField.map((card, i) => (
                <GameCard
                  key={i}
                  card={card}
                  isPlaceholder={!card}
                  onClick={() => handleFieldCardClick(i)}
                  className={gameState.phase === "placement" && card ? "ring-2 ring-primary" : ""}
                />
              ))}
            </div>

            <HPBar current={gameState.playerHP} max={30} label="Player" />

            {/* Player Hand */}
            {gameState.phase === "placement" && (
              <div className="flex gap-3 mt-4">
                {gameState.playerHand.map((card, i) => (
                  <GameCard
                    key={card.id}
                    card={card}
                    onClick={() => handleCardClick(i)}
                    className={canPlaceCards ? "hover:ring-2 hover:ring-primary" : "opacity-50 cursor-not-allowed"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
