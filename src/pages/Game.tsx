import { DraggableCard } from "@/components/game/DraggableCard";
import { DroppableSlot } from "@/components/game/DroppableSlot";
import { HPBar } from "@/components/game/HPBar";
import { DeckCounter } from "@/components/game/DeckCounter";
import { DiceRollPopup } from "@/components/game/DiceRollPopup";
import { VictoryPopup } from "@/components/game/VictoryPopup";
import { CardSelectionPopup } from "@/components/game/CardSelectionPopup";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/useGameState";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dices } from "lucide-react";
import { toast } from "sonner";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import { GameCard } from "@/components/game/GameCard";

const Game = () => {
  const navigate = useNavigate();
  const { gameState, placeCard, removeCardFromField, rearrangeCard, endPlacement, rollDice, calculateRoundDamage, nextRound, handleCardSelection } = useGameState();
  const [dicePopup, setDicePopup] = useState<{ open: boolean; result: number; effect: string }>({
    open: false,
    result: 0,
    effect: "",
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || gameState.phase !== "placement") return;

    // Handle rearranging cards on field
    if (active.id.toString().startsWith("rearrange-")) {
      const fromIndex = parseInt(active.id.toString().replace("rearrange-field-", ""));
      const toIndex = parseInt(over.id.toString().replace("field-", ""));
      
      if (!isNaN(fromIndex) && !isNaN(toIndex) && fromIndex !== toIndex) {
        rearrangeCard(fromIndex, toIndex);
      }
      return;
    }

    const cardIndex = parseInt(active.id.toString().replace("card-", ""));
    const fieldIndex = parseInt(over.id.toString().replace("field-", ""));

    if (!isNaN(cardIndex) && !isNaN(fieldIndex)) {
      placeCard(cardIndex, fieldIndex);
    }
  };

  const handleTapToPlace = (cardIndex: number) => {
    if (gameState.phase !== "placement") return;
    const requiredCards = gameState.playerMust4Cards ? 4 : 5;
    const placedCards = gameState.playerField.filter((c) => c !== null).length;
    if (placedCards >= requiredCards) {
      toast.error(`You can only place ${requiredCards} cards!`);
      return;
    }
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
      toast.error("No dice rolls remaining! (2 per match)");
      return;
    }

    const result = rollDice();
    
    // Determine effect message
    let effect = "";
    if (result >= 1 && result <= 5) {
      effect = "Fate demands: Play only 4 cards this round!";
    } else if (result >= 6 && result <= 10) {
      effect = "2 random cards swapped with deck!";
    } else if (result >= 11 && result <= 15) {
      effect = "2 cards returned to deck, 2 new cards drawn!";
    } else if (result >= 16 && result <= 18) {
      effect = "+1 Twisted (α) added to deck!";
    } else if (result >= 19 && result <= 20) {
      effect = "+1 Gamma (γ) added to deck!";
    }

    // Show dice animation popup
    setDicePopup({ open: true, result, effect });
  };

  const handleEndPlacement = () => {
    const requiredCards = gameState.playerMust4Cards ? 4 : 5;
    const placedCards = gameState.playerField.filter((c) => c !== null).length;
    
    if (placedCards < requiredCards) {
      toast.error(`You must place ${requiredCards} cards!`);
      return;
    }
    endPlacement();
    
    // Auto-calculate damage after a short delay
    setTimeout(() => {
      calculateRoundDamage();
    }, 1000);
  };

  const handleNextRound = () => {
    if (gameState.round >= 6 || gameState.playerHP <= 0 || gameState.opponentHP <= 0) {
      navigate("/");
      return;
    }
    nextRound();
  };

  const requiredCards = gameState.playerMust4Cards ? 4 : 5;
  const canPlaceCards = gameState.playerField.filter((c) => c !== null).length < requiredCards;

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
              <h1 className="text-5xl font-bold text-primary glow-gold mb-2">Round {gameState.round}/6</h1>
            <p className="text-lg text-muted-foreground tracking-wider">
              {gameState.phase === "placement" && `Place ${requiredCards} cards`}
              {gameState.phase === "reveal" && "Cards revealed!"}
              {gameState.phase === "damage" && "Round complete!"}
              {gameState.phase === "end" && (gameState.playerHP > gameState.opponentHP ? "Victory!" : gameState.playerHP < gameState.opponentHP ? "Defeat!" : "Draw!")}
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
                disabled={gameState.playerField.filter((c) => c !== null).length < requiredCards}
                className="gap-2"
              >
                End Placement
              </Button>
            </div>
          )}

          {(gameState.phase === "damage" || gameState.phase === "reveal") && gameState.damageResult && (
            <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-6 max-w-2xl">
              <div className="space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-theta">Player: -{gameState.damageResult.playerDamage} HP</span>
                  <span className="text-omega">Opponent: -{gameState.damageResult.opponentDamage} HP</span>
                </div>
                {gameState.damageResult.details.map((detail, i) => (
                  <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                ))}
              </div>
              <Button
                variant="default"
                size="lg"
                onClick={handleNextRound}
                className="w-full mt-4"
              >
                {gameState.round >= 6 || gameState.playerHP <= 0 || gameState.opponentHP <= 0 ? "Return to Menu" : "Next Round"}
              </Button>
            </div>
          )}

          {gameState.phase === "end" && (
            <Button variant="default" size="lg" onClick={() => navigate("/")} className="gap-2">
              Return to Menu
            </Button>
          )}
        </div>

        {/* Player Area */}
        <div className="w-full max-w-6xl flex items-end gap-4">
          <DeckCounter count={gameState.playerDeck.length} />
          <div className="flex-1 flex flex-col items-center gap-4">
            {/* Player Field - Droppable Slots */}
            <div className="flex gap-3 mb-4">
              {gameState.playerField.map((card, i) => (
                <DroppableSlot
                  key={i}
                  id={`field-${i}`}
                  card={card}
                  onRemove={card ? () => handleFieldCardClick(i) : undefined}
                />
              ))}
            </div>

            <HPBar current={gameState.playerHP} max={30} label="Player" className="mb-8" />

            {/* Player Hand - Draggable Cards */}
            {gameState.phase === "placement" && (
              <div className="flex gap-3 mt-16 flex-wrap justify-center">
                {gameState.playerHand.map((card, i) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    id={`card-${i}`}
                    disabled={!canPlaceCards}
                    onTap={() => handleTapToPlace(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dice Roll Popup */}
      <DiceRollPopup
        open={dicePopup.open}
        onClose={() => setDicePopup({ ...dicePopup, open: false })}
        result={dicePopup.result}
        effect={dicePopup.effect}
      />

      {/* Victory Popup */}
      <VictoryPopup
        open={gameState.phase === "end"}
        isVictory={gameState.playerHP > gameState.opponentHP}
        playerHP={gameState.playerHP}
        opponentHP={gameState.opponentHP}
        onReturnToMenu={() => navigate("/")}
      />

      {/* Card Selection Popup */}
      <CardSelectionPopup
        open={gameState.cardSelectionMode}
        cards={gameState.playerHand}
        onConfirm={handleCardSelection}
      />
    </div>
    </DndContext>
  );
};

export default Game;
