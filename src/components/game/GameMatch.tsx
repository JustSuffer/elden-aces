import { DraggableCard } from "@/components/game/DraggableCard";
import { DroppableSlot } from "@/components/game/DroppableSlot";
import { HPBar } from "@/components/game/HPBar";
import { DeckCounter } from "@/components/game/DeckCounter";
import { DiceRollPopup } from "@/components/game/DiceRollPopup";
import { VictoryPopup } from "@/components/game/VictoryPopup";
import { CardSelectionPopup } from "@/components/game/CardSelectionPopup";
import { VfxLayer, VfxEffect } from "@/components/game/VfxLayer";
import { KnifeBar } from "@/components/game/KnifeBar";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/useGameState";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { ArrowLeft, Dices, Eye, Snowflake, Heart, Settings, Flame, Sparkles, Skull, Atom, Hourglass } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { GameCard } from "@/components/game/GameCard";
import { AudioManager } from "@/utils/AudioManager";
import { SavedDeck } from "@/types/deck";
import { ClassName, Card } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";
import { ClassInfoPanel } from "@/components/game/ClassInfoPanel";
import { SpecialCardInfoPanel } from "@/components/game/SpecialCardInfoPanel";
import { useLanguage } from "@/hooks/useLanguage";

interface GameMatchProps {
  playerDeck: SavedDeck;
  opponentClass: ClassName;
  // Online game props
  isOnline?: boolean;
  opponentDeck?: SavedDeck;
  opponentMoves?: (Card | null)[];
  serverRound?: number;
  opponentDeckCount?: number; // Real-time opponent deck count for online mode
  onMovesReady?: (moves: (Card | null)[]) => Promise<void>;
  onRoundChange?: (newRound: number) => Promise<void>;
}

export const GameMatch = ({
  playerDeck,
  opponentClass,
  isOnline = false,
  opponentDeck,
  opponentMoves,
  serverRound,
  opponentDeckCount,
  onMovesReady,
  onRoundChange,
}: GameMatchProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [vfxEffects, setVfxEffects] = useState<VfxEffect[]>([]);
  const [showHourglass, setShowHourglass] = useState(false);
  const [showWinConAnimation, setShowWinConAnimation] = useState(false);
  const [winConAnimationType, setWinConAnimationType] = useState<string | null>(null);

  // Online: prevent local round from advancing before server confirmation (fixes 1-round delay / wrong cards)
  const [requestedNextRoundFor, setRequestedNextRoundFor] = useState<number | null>(null);

  const timeoutHandledRoundRef = useRef<number | null>(null);

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
    handleCardSelection,
    syncOnlineRound
  } = useGameState({ playerDeck, opponentClass, opponentDeck: opponentDeck?.cards, isOnline });

  useEffect(() => {
    AudioManager.init();
  }, []);

  // Sync opponent moves when received in online mode
  useEffect(() => {
    // Only sync if we have valid opponent moves (array with actual cards or nulls, not undefined)
    if (isOnline && opponentMoves !== undefined && Array.isArray(opponentMoves) && gameState.phase === "waiting") {
      console.log("[GameMatch] Opponent moves received, syncing:", opponentMoves);
      syncOnlineRound(opponentMoves);
    }
  }, [isOnline, opponentMoves, gameState.phase, syncOnlineRound]);

  // If the server advanced the round (e.g., other player clicked Next), catch up locally.
  useEffect(() => {
    if (!isOnline || !serverRound) return;
    if (serverRound > gameState.round && gameState.phase !== "end") {
      console.log("[GameMatch] Server round advanced, syncing local round:", {
        local: gameState.round,
        server: serverRound,
      });
      setRequestedNextRoundFor(null);
      nextRound();
    }
  }, [isOnline, serverRound, gameState.round, gameState.phase, nextRound]);

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
    const maxCards = gameState.playerMust4Cards ? 4 : 5;
    const placedCards = gameState.playerField.filter((c) => c !== null).length;
    if (placedCards >= maxCards) {
      toast.error(t("game.placement.toast.maxCards", { count: maxCards }));
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
    // 1. Fateweaver Logic
    if (gameState.playerClass === "Fateweaver") {
      const rolls = gameState.playerDiceRolls || 0;
      if (rolls <= 0) {
        toast.error(t("game.dice.toast.noFateweaver"));
        return;
      }
      // Proceed for Fateweaver regardless of diceUsed
      rollDice();
      return;
    }

    // 2. Standard Logic (Non-Fateweaver)
    if (gameState.diceUsed >= 2) {
      toast.error(t("game.dice.toast.limit"));
      return;
    }

    rollDice();
  };

  const handleEndPlacement = async () => {
    const placedCards = gameState.playerField.filter((c) => c !== null).length;

    if (placedCards < 1) {
      toast.error(t("game.placement.toast.minCards"));
      return;
    }

    endPlacement();
    AudioManager.play("card-flip", 0.7);

    // Online mode: Send moves to server and wait for opponent
    if (isOnline && onMovesReady) {
      await onMovesReady(gameState.playerField);
      return; // Wait for opponent moves via props
    }

    // Offline mode: Calculate damage after animation
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

  // Online mode: 60s placement timer + AFK/timeout rule
  useEffect(() => {
    if (!isOnline) return;
    if (gameState.phase !== "placement") return;
    if (gameState.timeLeft > 0) return;

    // Only handle once per round
    if (timeoutHandledRoundRef.current === gameState.round) return;
    timeoutHandledRoundRef.current = gameState.round;

    console.log("[GameMatch] Placement timeout -> auto submit", { round: gameState.round });
    toast.warning("Süre doldu! Hamlen otomatik gönderiliyor.");

    const placed = gameState.playerField.filter((c) => c !== null).length;
    if (placed < 1 && gameState.playerHand.length > 0) {
      const empty = gameState.playerField.findIndex((c) => c === null);
      if (empty !== -1) {
        placeCard(0, empty);
        setTimeout(() => {
          void handleEndPlacement();
        }, 150);
        return;
      }
    }

    void handleEndPlacement();
  }, [
    isOnline,
    gameState.phase,
    gameState.timeLeft,
    gameState.round,
    gameState.playerField,
    gameState.playerHand.length,
    placeCard,
  ]);

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

  const handleNextRound = async () => {
    const maxRounds = gameState.maxRounds || 7;
    const newRound = gameState.round + 1 + (gameState.pendingRoundSkip || 0);

    // If game ended (HP depleted or round limit), nextRound() will transition to "end".
    if (gameState.round >= maxRounds || gameState.playerHP <= 0 || gameState.opponentHP <= 0) {
      nextRound();
      return;
    }

    // Online mode MUST NOT advance locally until DB round advances.
    // Otherwise the client can enter "placement" for round N+1 while server is still on round N,
    // and will re-sync opponentMoves from the previous round (the bug you're seeing).
    if (isOnline && onRoundChange) {
      if (requestedNextRoundFor === gameState.round) return;
      setRequestedNextRoundFor(gameState.round);

      if (gameState.pendingRoundSkip && gameState.pendingRoundSkip > 0) {
        setShowHourglass(true);
        setTimeout(async () => {
          setShowHourglass(false);
          await onRoundChange(newRound);
        }, 2500);
        return;
      }

      await onRoundChange(newRound);
      return;
    }

    // Offline mode
    if (gameState.pendingRoundSkip && gameState.pendingRoundSkip > 0) {
      setShowHourglass(true);
      setTimeout(() => {
        setShowHourglass(false);
        nextRound();
      }, 2500);
      return;
    }

    nextRound();
  };

  const requiredCards = gameState.playerMust4Cards ? 4 : 5;
  const canPlaceCards = gameState.playerField.filter((c) => c !== null).length < requiredCards;
  const isMimicVsMimic = gameState.playerClass === "Mimic" && gameState.opponentClass === "Mimic";

  const playerClassData = MASTER_CLASSES[gameState.playerClass];
  const opponentClassData = MASTER_CLASSES[gameState.opponentClass];

  // Check for win condition animations
  useEffect(() => {
    if (gameState.phase === "end") {
      const details = gameState.damageResult?.details || [];

      if (winConAnimationType !== null) return;
      if (showWinConAnimation) return;

      let type: string | null = null;
      let duration = 3000;

      if (gameState.playerClass === "Fateweaver" && details.some(l => l.includes("KADERİN GÖZÜ"))) {
        type = "fateweaver";
      } else if (gameState.playerClass === "Chronokeeper" && (details.some(l => l.includes("Chronokeeper zamanın efendisi")) || gameState.winReason === "CHRONO_WIN")) {
        type = "chronokeeper";
      } else if (gameState.playerClass === "Cryomancer" && details.some(l => l.includes("kazanma koşulunu sağladı"))) {
        type = "cryomancer";
      } else if (gameState.playerClass === "Siren" && details.some(l => l.includes("KADERİN KALBİNE"))) {
        type = "siren";
      } else if (isMimicVsMimic && (gameState.mimicCounter.p1 >= 12 || gameState.mimicCounter.p2 >= 12)) {
        type = "mimic";
      } else if (gameState.playerClass === "Augmentor" && gameState.winner === "p1") {
        type = "augmentor";
      } else if (gameState.playerClass === "Decay" && gameState.winner === "p1") {
        type = "decay";
      } else if (gameState.winReason === "VESSEL_WIN") {
        type = "vessel";
        duration = 2000;
      }

      if (type) {
        setWinConAnimationType(type);
        setShowWinConAnimation(true);

        setTimeout(() => {
          setShowWinConAnimation(false);
          // Don't reset winConAnimationType to prevent loop
        }, duration);
      }
    }
  }, [gameState.phase, gameState.damageResult, isMimicVsMimic, gameState.mimicCounter, gameState.playerClass, winConAnimationType, showWinConAnimation, gameState.winReason, gameState.winner]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background flex flex-col relative">
        <ClassInfoPanel className={gameState.playerClass} />
        <SpecialCardInfoPanel />
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("victory.back")}
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
            <DeckCounter count={isOnline && opponentDeckCount !== undefined ? opponentDeckCount : gameState.opponentDeck.length} isOpponent />
            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="flex flex-col w-full max-w-[200px] md:max-w-[300px]">
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
                    label={`${t("game.damage.opponent")} (${gameState.opponentClass})`}
                    isOpponent
                  />
                </div>
              </div>
              {/* Opponent Field with Knife Bar */}
              <div className="flex items-center gap-4">
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
                {/* Opponent Knife Bar - Right side of field */}
                {isMimicVsMimic && (
                  <KnifeBar
                    count={gameState.mimicCounter.p2}
                    isOpponent
                    className="ml-4"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Center Area - Round & Actions */}
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-primary glow-gold mb-2 font-cinzel">
                {t("game.round")} {gameState.round}/{gameState.maxRounds || 7}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground tracking-wider">
                {gameState.phase === "placement" && t("game.phase.placement")}
                {gameState.phase === "reveal" && t("game.phase.reveal")}
                {gameState.phase === "damage" && t("game.phase.damage")}
                {gameState.phase === "end" && (
                  gameState.playerHP > gameState.opponentHP ? t("game.phase.victory") :
                    gameState.playerHP < gameState.opponentHP ? t("game.phase.defeat") : t("game.phase.draw")
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("game.hand", { count: gameState.playerHand.length })}
              </p>
              {isOnline && gameState.phase === "placement" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Süre: <span className="font-semibold text-foreground tabular-nums">{gameState.timeLeft}s</span>
                </p>
              )}
            </div>

            {gameState.phase === "placement" && (
              <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleRollDice}
                  disabled={
                    gameState.playerClass === "Fateweaver"
                      ? (gameState.playerDiceRolls || 0) <= 0
                      : (gameState.diceUsed || 0) >= 2
                  }
                  className="gap-2 bg-psi hover:bg-psi/80"
                >
                  <Dices className="w-5 h-5" />
                  {gameState.playerClass === "Fateweaver"
                    ? `${t("game.dice.fateweaver")} (${gameState.playerDiceRolls || 0})`
                    : `${t("game.dice.standard")} (${gameState.diceUsed || 0}/2)`
                  }
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={handleEndPlacement}
                  disabled={gameState.playerField.filter((c) => c !== null).length < 1}
                  className="gap-2"
                >
                  {t("game.action.finish")}
                </Button>
              </div>
            )}

            {(gameState.phase === "damage" || gameState.phase === "reveal") && gameState.damageResult && (
              <div className="bg-card/50 backdrop-blur-sm border border-primary/30 rounded-lg p-4 md:p-6 max-w-2xl">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-theta">{t("game.damage.you")}: -{gameState.damageResult.playerDamage} HP</span>
                    <span className="text-omega">{t("game.damage.opponent")}: -{gameState.damageResult.opponentDamage} HP</span>
                  </div>
                  {gameState.damageResult.details.map((detail, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                  ))}
                </div>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleNextRound}
                  disabled={
                    isOnline &&
                    requestedNextRoundFor === gameState.round &&
                    gameState.playerHP > 0 &&
                    gameState.opponentHP > 0 &&
                    gameState.round < (gameState.maxRounds || 7)
                  }
                  className="w-full mt-4"
                >
                  {gameState.round >= 6 || gameState.playerHP <= 0 || gameState.opponentHP <= 0
                    ? t("game.action.menu")
                    : t("game.action.next")}
                </Button>
              </div>
            )}

            {gameState.phase === "end" && (
              <div className="flex flex-col items-center gap-4 z-50">
                {/* Visual Victory Effects */}
                {gameState.winner === "p1" && gameState.playerClass === "Vitalist" && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i}
                        className="absolute text-5xl opacity-0 animate-[ping_3s_ease-in-out_infinite]"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          color: "#22c55e"
                        }}
                      >
                        🍃
                      </div>
                    ))}
                    <div className="text-6xl font-bold text-green-500 animate-bounce mt-20 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">🌿 {t("game.anim.natureVictory")} 🌿</div>
                  </div>
                )}

                {gameState.winner === "p1" && gameState.playerClass === "Decay" && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-center bg-orange-900/10">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i}
                        className="absolute text-6xl opacity-70 animate-[pulse_1s_ease-in-out_infinite]"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 1}s`,
                          color: "#fdba74"
                        }}
                      >
                        🔥
                      </div>
                    ))}
                    <div className="text-6xl font-bold text-orange-500 animate-pulse drop-shadow-[0_0_30px_rgba(249,115,22,1)] z-50">
                      🔥 {t("game.anim.victoryBurned")} 🔥
                    </div>
                  </div>
                )}

                {gameState.winner === "p1" && gameState.playerClass === "Slayer" && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-center bg-red-950/30">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div key={i}
                        className="absolute text-5xl opacity-80 animate-[ping_4s_ease-in-out_infinite]"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          color: "#ef4444",
                          transform: `scale(${Math.random() + 0.5})`
                        }}
                      >
                        🩸
                      </div>
                    ))}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#450a0a_100%)] opacity-60 animate-pulse"></div>
                    <div className="text-7xl font-cinzel font-black text-red-600 animate-bounce mt-10 drop-shadow-[0_0_50px_rgba(220,38,38,1)] z-50 tracking-widest uppercase">
                      🩸 {t("game.anim.massacre")} 🩸
                    </div>
                    <div className="text-2xl text-red-400 font-bold mt-4 animate-pulse">{t("game.anim.oneHit")}</div>
                  </div>
                )}

                <Button variant="default" size="lg" onClick={() => navigate("/")} className="gap-2 relative z-50 mt-10">
                  {t("game.action.menu")}
                </Button>
              </div>
            )}
          </div>

          {/* Player Area */}
          <div className="w-full max-w-6xl flex items-end gap-4">
            <DeckCounter count={gameState.playerDeck.length} />
            <div className="flex-1 flex flex-col items-center gap-4">
              {/* Player Field - Droppable Slots with Knife Bar */}
              <div className="flex items-center gap-4">
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
                {/* Player Knife Bar - Right side of field */}
                {isMimicVsMimic && (
                  <KnifeBar
                    count={gameState.mimicCounter.p1}
                    className="ml-4"
                  />
                )}
              </div>

              <div className="flex flex-col w-full max-w-[200px] md:max-w-[300px]">
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
                    label={`${t("game.damage.you")} (${gameState.playerClass})`}
                  />
                </div>
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
            onClose={() => { }}
            onAcknowledge={acknowledgeDiceResult}
            onCancel={cancelDiceResult}
            result={gameState.pendingDiceResult.result}
            effect={gameState.pendingDiceResult.effect}
          />
        )}

        {/* Card Selection Popup */}
        <CardSelectionPopup
          open={gameState.cardSelectionMode}
          cards={gameState.playerHand}
          onConfirm={handleCardSelection}
        />

        {/* Hourglass Time Skip Overlay */}
        {showHourglass && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="animate-pulse">
              <div className="text-6xl md:text-8xl mb-6">⏳</div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-amber-500 font-cinzel glow-text text-center animate-bounce">
              {t("game.anim.timeSkip")}
            </h2>
            <p className="text-xl md:text-2xl text-amber-200/80 mt-4 text-center font-cinzel">
              +{gameState.pendingRoundSkip} {t("game.round").toUpperCase()}
            </p>
          </div>
        )}

        {/* Fateweaver Exodia Animation Overlay */}
        {showWinConAnimation && winConAnimationType === "fateweaver" && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative">
              <Dices className="w-48 h-48 text-psi animate-spin-slow opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-md" />
              <Eye className="w-64 h-64 text-yellow-400 glow-gold animate-pulse relative z-10" />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-psi to-yellow-500 mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000">
              {t("game.anim.fateRewritten")}
            </h1>
            <p className="text-xl text-psi/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
              {t("game.anim.cosmicPower")}
            </p>
          </div>
        )}

        {/* Cryomancer Win Animation */}
        {showWinConAnimation && winConAnimationType === "cryomancer" && (
          <div className="fixed inset-0 z-50 bg-blue-950/80 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative animate-pulse">
              <Snowflake className="w-64 h-64 text-cyan-200 glow-cyan animate-spin-slow duration-[3s]" />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000">
              {t("game.anim.infiniteWinter")}
            </h1>
            <p className="text-xl text-cyan-100/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
              {t("game.anim.worldFrozen")}
            </p>
          </div>
        )}

        {/* Decay Death Animation (Opponent Deck Not Empty) */}
        {showWinConAnimation && (winConAnimationType === "decay_death" || winConAnimationType === "decay_victory") && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative animate-pulse">
              <Skull className="w-64 h-64 text-zinc-600 animate-bounce duration-[3s]" strokeWidth={1} />
              <Flame className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 text-orange-600/80 animate-pulse mix-blend-screen" />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-stone-500 to-stone-800 mt-8 font-cinzel animate-in slide-in-from-top duration-1000">
              {winConAnimationType === "decay_death" ? t("game.anim.ashDeath") : t("game.anim.bornFromAsh")}
            </h1>
            <p className="text-2xl text-red-500/80 mt-4 font-bold tracking-[0.2em] animate-in fade-in delay-500 duration-1000">
              {winConAnimationType === "decay_death" ? t("game.anim.penalty") : t("game.anim.victoryBurned")}
            </p>
          </div>
        )}

        {/* Siren Win Animation */}
        {showWinConAnimation && winConAnimationType === "siren" && (
          <div className="fixed inset-0 z-50 bg-rose-950/80 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative animate-pulse">
              <Heart className="w-64 h-64 text-rose-500 glow-rose animate-bounce duration-[2s]" fill="currentColor" />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-white mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000">
              {t("game.anim.curseOfLove")}
            </h1>
            <p className="text-xl text-rose-200/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
              {t("game.anim.heartRuled")}
            </p>
          </div>
        )}

        {/* Mimic vs Mimic Win Animation */}
        {showWinConAnimation && winConAnimationType === "mimic" && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative">
              <div className="text-[200px] animate-pulse">🗡️</div>
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-white to-slate-300 mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000">
              {t("game.anim.knifeMaster")}
            </h1>
            <p className="text-xl text-slate-300/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
              {t("game.anim.knivesComplete")}
            </p>
          </div>
        )}

        {/* Augmentor Win Animation */}
        {showWinConAnimation && winConAnimationType === "augmentor" && (
          <div className="fixed inset-0 z-50 bg-blue-950/90 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative flex items-center justify-center">
              <Settings className="w-[300px] h-[300px] text-blue-500/30 animate-[spin_10s_linear_infinite]" />
              <Settings className="absolute w-[150px] h-[150px] text-cyan-400/50 animate-[spin_5s_linear_infinite_reverse]" />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000">
              {t("game.anim.engineering")}
            </h1>
            <p className="text-xl text-blue-200/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
              {t("game.anim.calculation")}
            </p>
          </div>
        )}

        {/* Decay Win Animation */}
        {showWinConAnimation && winConAnimationType === "decay" && (
          <div className="fixed inset-0 z-50 bg-orange-950/90 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="absolute inset-0 overflow-hidden opacity-50">
              {Array.from({ length: 40 }).map((_, i) => (
                <Flame
                  key={i}
                  className="absolute text-orange-500 animate-[pulse_1s_ease-in-out_infinite]"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 60 + 20}px`,
                    height: `${Math.random() * 60 + 20}px`,
                    animationDelay: `${Math.random()}s`,
                    opacity: Math.random() * 0.5 + 0.2
                  }}
                />
              ))}
            </div>
            <div className="relative z-10 animate-bounce">
              <Flame className="w-64 h-64 text-orange-500 glow-orange drop-shadow-[0_0_50px_rgba(249,115,22,0.8)]" fill="currentColor" />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000 relative z-10">
              {t("game.anim.ashSmoke")}
            </h1>
            <p className="text-xl text-orange-200/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000 relative z-10">
              {t("game.anim.deckBurned")}
            </p>
          </div>
        )}

        {/* Vessel Win Animation */}
        {showWinConAnimation && winConAnimationType === "vessel" && (
          <div className="fixed inset-0 z-[60] bg-orange-950/90 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            {/* Additional Sparkle Effects */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute text-yellow-200 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random()}s`,
                    opacity: Math.random() * 0.7 + 0.3,
                    transform: `scale(${Math.random() + 0.5})`
                  }}
                />
              ))}
            </div>

            <div className="relative animate-pulse z-10">
              <Atom className="w-64 h-64 text-orange-400 animate-spin-slow duration-[10s]" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-yellow-100 animate-ping duration-[2s]" />
            </div>
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-yellow-200 to-orange-300 mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000 z-10 drop-shadow-[0_0_15px_rgba(253,186,116,0.5)]">
              {t("game.anim.cosmicPower")}
            </h1>
            <p className="text-2xl text-orange-100/90 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000 z-10 font-bold">
              {t("game.anim.rulerOfUniverse")}
            </p>
          </div>
        )}

        {/* Chronokeeper Win Animation */}
        {showWinConAnimation && winConAnimationType === "chronokeeper" && (
          <div className="fixed inset-0 z-50 bg-amber-950/90 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
              <Hourglass className="w-64 h-64 text-amber-500 animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-32 h-32 text-amber-200/50 animate-ping duration-[3s]" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000 drop-shadow-md">
              {t("game.anim.timeLord")}
            </h1>
            <p className="text-xl text-amber-200/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
              {t("game.anim.fateRewritten")}
            </p>
          </div>
        )}

        <VictoryPopup
          open={gameState.phase === "end" && !showWinConAnimation}
          outcome={gameState.winner === "p1" ? "win" : gameState.winner === "p2" ? "loss" : "draw"}
          playerHP={gameState.playerHP}
          opponentHP={gameState.opponentHP}
          winReason={gameState.winReason}
          damageDetails={gameState.damageResult?.details}
          onReturnToMenu={() => navigate("/")}
          delayMs={0}
        />

      </div>
    </DndContext>
  );
};
