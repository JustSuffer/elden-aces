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
import { useState, useEffect, useCallback } from "react";
import { GameCard } from "@/components/game/GameCard";
import { AudioManager } from "@/utils/AudioManager";
import { SavedDeck } from "@/types/deck";
import { ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";

interface GameMatchProps {
  playerDeck: SavedDeck;
  opponentClass: ClassName;
}

export const GameMatch = ({ playerDeck, opponentClass }: GameMatchProps) => {
  const navigate = useNavigate();
  const [vfxEffects, setVfxEffects] = useState<VfxEffect[]>([]);

  const { 
    gameState, 
    placeCard, 
    removeCardFromField, 
    rearrangeCard, 
    endPlacement, 
    rollDice, 
    acknowledgeDiceResult, 
    cancelDiceResult, 
    calculateRoundDamage, 
    nextRound, 
    handleCardSelection 
  } = useGameState({ playerDeck, opponentClass });

  useEffect(() => {
    AudioManager.init();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || gameState.phase !== "placement") return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId.startsWith("field-") && overId === "hand-dropzone") {
      const fieldIndex = parseInt(activeId.replace("field-", ""));
      if (!isNaN(fieldIndex)) {
        removeCardFromField(fieldIndex);
        AudioManager.play("card-placement", 0.6);
      }
      return;
    }

    if (activeId.startsWith("field-")) {
      const fromIndex = parseInt(activeId.replace("field-", ""));
      const toIndex = parseInt(overId.replace("field-", ""));
      
      if (!isNaN(fromIndex) && !isNaN(toIndex) && fromIndex !== toIndex) {
        rearrangeCard(fromIndex, toIndex);
        AudioManager.play("card-placement", 0.6);
      }
      return;
    }

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
      toast.error(`Bu tur sadece ${requiredCards} kart oynayabilirsin!`);
      return;
    }
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
    if (gameState.playerClass === "Fateweaver" && gameState.round < 3) {
      toast.error("Fateweaver sadece 3. rounddan itibaren zar atabilir!");
      return;
    }
    
    if (gameState.diceUsed >= 2) {
      toast.error("Zar hakkın bitti! (Maç başına 2)");
      return;
    }

    rollDice();
  };

  const handleEndPlacement = () => {
    const requiredCards = gameState.playerMust4Cards ? 4 : 5;
    const placedCards = gameState.playerField.filter((c) => c !== null).length;
    
    if (placedCards < requiredCards) {
      toast.error(`${requiredCards} kart yerleştirmelisin!`);
      return;
    }
    endPlacement();
    
    AudioManager.play("card-flip", 0.7);
    
    setTimeout(() => {
      gameState.playerField.forEach((card, index) => {
        if (card?.specialType === "gamma") {
          addVfx("gamma", index);
        } else if (card?.specialType === "twisted") {
          addVfx("twisted", index);
        }
      });
    }, 600);
    
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

  const playerClassData = MASTER_CLASSES[gameState.playerClass];
  const opponentClassData = MASTER_CLASSES[gameState.opponentClass];

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Menü
          </Button>
          <div className="text-center">
            <div className="text-xl font-bold text-primary glow-gold font-cinzel">
              <span style={{ color: playerClassData.color }}>{gameState.playerClass}</span>
              {" vs "}
              <span style={{ color: opponentClassData.color }}>{gameState.opponentClass}</span>
            </div>
          </div>
          <div className="w-24" />
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-8 gap-4 md:gap-8">
          {/* Opponent Area */}
          <div className="w-full max-w-6xl flex items-start gap-4">
            <DeckCounter count={gameState.opponentDeck.length} isOpponent />
            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <span 
                  className="text-3xl font-bold"
                  style={{ color: opponentClassData.color }}
                >
                  {opponentClassData.symbol}
                </span>
                <HPBar 
                  current={gameState.opponentHP} 
                  max={opponentClassData.initialHP} 
                  label={`Rakip (${gameState.opponentClass})`} 
                  isOpponent 
                />
              </div>
              {/* Opponent Field */}
              <div className="grid grid-cols-5 gap-2 md:gap-4 justify-items-center">
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
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-primary glow-gold mb-2 font-cinzel">
                Round {gameState.round}/6
              </h1>
              <p className="text-base md:text-lg text-muted-foreground tracking-wider">
                {gameState.phase === "placement" && `${requiredCards} kart yerleştir`}
                {gameState.phase === "reveal" && "Kartlar açılıyor!"}
                {gameState.phase === "damage" && "Round tamamlandı!"}
                {gameState.phase === "end" && (
                  gameState.playerHP > gameState.opponentHP ? "Zafer!" : 
                  gameState.playerHP < gameState.opponentHP ? "Yenilgi!" : "Berabere!"
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                El: {gameState.playerHand.length} kart
              </p>
            </div>

            {gameState.phase === "placement" && (
              <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleRollDice}
                  disabled={gameState.diceUsed >= 2 || (gameState.playerClass === "Fateweaver" && gameState.round < 3)}
                  className="gap-2 bg-psi hover:bg-psi/80"
                >
                  <Dices className="w-5 h-5" />
                  Zar Π ({gameState.diceUsed}/2)
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={handleEndPlacement}
                  disabled={gameState.playerField.filter((c) => c !== null).length < requiredCards}
                  className="gap-2"
                >
                  Yerleşimi Bitir
                </Button>
              </div>
            )}

            {(gameState.phase === "damage" || gameState.phase === "reveal") && gameState.damageResult && (
              <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-4 md:p-6 max-w-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-theta">Sen: -{gameState.damageResult.playerDamage} HP</span>
                    <span className="text-omega">Rakip: -{gameState.damageResult.opponentDamage} HP</span>
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
                  {gameState.round >= 6 || gameState.playerHP <= 0 || gameState.opponentHP <= 0 
                    ? "Menüye Dön" 
                    : "Sonraki Round"}
                </Button>
              </div>
            )}

            {gameState.phase === "end" && (
              <Button variant="default" size="lg" onClick={() => navigate("/")} className="gap-2">
                Menüye Dön
              </Button>
            )}
          </div>

          {/* Player Area */}
          <div className="w-full max-w-6xl flex items-end gap-4">
            <DeckCounter count={gameState.playerDeck.length} />
            <div className="flex-1 flex flex-col items-center gap-4">
              {/* Player Field - Droppable Slots */}
              <div className="grid grid-cols-5 gap-2 md:gap-4 mb-4 justify-items-center">
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

              <div className="flex items-center gap-3">
                <span 
                  className="text-3xl font-bold"
                  style={{ color: playerClassData.color }}
                >
                  {playerClassData.symbol}
                </span>
                <HPBar 
                  current={gameState.playerHP} 
                  max={playerClassData.initialHP} 
                  label={`Sen (${gameState.playerClass})`} 
                  className="mb-4 md:mb-8" 
                />
              </div>

              {/* Player Hand - Draggable Cards */}
              {gameState.phase === "placement" && (
                <DroppableSlot id="hand-dropzone" isPlaceholder className="w-full" card={null}>
                  <div className="flex gap-2 md:gap-3 mt-8 md:mt-16 flex-wrap justify-center">
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
