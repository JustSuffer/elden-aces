import { DraggableCard } from "@/components/game/DraggableCard";
import { DroppableSlot } from "@/components/game/DroppableSlot";
import { HPBar } from "@/components/game/HPBar";
import { DeckCounter } from "@/components/game/DeckCounter";
import { DiceRollPopup } from "@/components/game/DiceRollPopup";
import { VictoryPopup } from "@/components/game/VictoryPopup";
import { CardSelectionPopup } from "@/components/game/CardSelectionPopup";
import { VfxLayer, VfxEffect } from "@/components/game/VfxLayer";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/useGameState";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dices } from "lucide-react";
import { toast } from "sonner";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { GameCard } from "@/components/game/GameCard";
import { AudioManager } from "@/utils/AudioManager";

const Game = () => {
  const navigate = useNavigate();
  const { gameState, placeCard, removeCardFromField, rearrangeCard, endPlacement, rollDice, acknowledgeDiceResult, cancelDiceResult, calculateRoundDamage, nextRound, handleCardSelection } = useGameState();
  const [vfxEffects, setVfxEffects] = useState<VfxEffect[]>([]);

  useEffect(() => {
    AudioManager.init();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || gameState.phase !== "placement") return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Handle dragging from field back to hand
    if (activeId.startsWith("field-") && overId === "hand-dropzone") {
      const fieldIndex = parseInt(activeId.replace("field-", ""));
      if (!isNaN(fieldIndex)) {
        removeCardFromField(fieldIndex);
        AudioManager.play("card-placement", 0.6);
      }
      return;
    }

    // Handle rearranging cards on field
    if (activeId.startsWith("field-")) {
      const fromIndex = parseInt(activeId.replace("field-", ""));
      const toIndex = parseInt(overId.replace("field-", ""));
      
      if (!isNaN(fromIndex) && !isNaN(toIndex) && fromIndex !== toIndex) {
        rearrangeCard(fromIndex, toIndex);
        AudioManager.play("card-placement", 0.6);
      }
      return;
    }

    // Handle placing card from hand to field
    const cardIndex = parseInt(activeId.replace("card-", ""));
    const fieldIndex = parseInt(overId.replace("field-", ""));

    if (!isNaN(cardIndex) && !isNaN(fieldIndex)) {
      placeCard(cardIndex, fieldIndex);
      AudioManager.play("card-placement", 0.8);
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

    rollDice();
  };

  const handleEndPlacement = () => {
    const requiredCards = gameState.playerMust4Cards ? 4 : 5;
    const placedCards = gameState.playerField.filter((c) => c !== null).length;
    
    if (placedCards < requiredCards) {
      toast.error(`You must place ${requiredCards} cards!`);
      return;
    }
    endPlacement();
    
    // Play card flip sound
    AudioManager.play("card-flip", 0.7);
    
    // Trigger VFX for special cards
    setTimeout(() => {
      gameState.playerField.forEach((card, index) => {
        if (card?.specialType === "gamma") {
          addVfx("gamma", index);
        } else if (card?.specialType === "twisted") {
          addVfx("twisted", index);
        }
      });
    }, 600);
    
    // Auto-calculate damage after a short delay
    setTimeout(() => {
      calculateRoundDamage();
      AudioManager.play("damage-dealt", 0.9);
    }, 1500);
  };

  const addVfx = (type: "gamma" | "twisted" | "delta-sigma-transform", slotIndex: number) => {
    const slotElement = document.querySelector(`[data-slot="${slotIndex}"]`);
    if (!slotElement) return;
    
    const rect = slotElement.getBoundingClientRect();
    const effect: VfxEffect = {
      type,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      id: `${type}-${Date.now()}-${Math.random()}`,
    };
    
    setVfxEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setVfxEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 2000);
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
            <div className="grid grid-cols-5 gap-4 justify-items-center">
              {gameState.opponentField.map((card, i) => (
                <GameCard 
                  key={i} 
                  card={card} 
                  isPlaceholder={!card} 
                  faceDown={gameState.phase === "placement"}
                  showEyeIcon={!!(card && gameState.phase !== "placement")}
                />
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
            <div className="grid grid-cols-5 gap-4 mb-4 justify-items-center">
              {gameState.playerField.map((card, i) => (
                <div key={i} data-slot={i}>
                  <DroppableSlot
                    id={`field-${i}`}
                    card={card}
                    onRemove={card ? () => handleFieldCardClick(i) : undefined}
                  />
                </div>
              ))}
            </div>

            <HPBar current={gameState.playerHP} max={30} label="Player" className="mb-8" />

            {/* Player Hand - Draggable Cards */}
            {gameState.phase === "placement" && (
              <DroppableSlot id="hand-dropzone" isPlaceholder className="w-full" card={null}>
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
              </DroppableSlot>
            )}
          </div>
        </div>
      </div>

      {/* VFX Layer */}
      <VfxLayer effects={vfxEffects} />

      {/* Dice Roll Popup */}
      {gameState.pendingDiceResult && (
        <DiceRollPopup
          open={true}
          onClose={() => {}}
          onAcknowledge={acknowledgeDiceResult}
          onCancel={cancelDiceResult}
          result={gameState.pendingDiceResult.result}
          effect={gameState.pendingDiceResult.effect}
        />
      )}

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
