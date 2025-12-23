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
import { useState, useEffect } from "react";
import { GameCard } from "@/components/game/GameCard";
import { AudioManager } from "@/utils/AudioManager";
import { SavedDeck } from "@/types/deck";
import { ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";
import { ClassInfoPanel } from "@/components/game/ClassInfoPanel";
import { SpecialCardInfoPanel } from "@/components/game/SpecialCardInfoPanel";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface GameMatchProps {
  playerDeck: SavedDeck;
  opponentClass: ClassName;
}

export const GameMatch = ({ playerDeck, opponentClass }: GameMatchProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [vfxEffects, setVfxEffects] = useState<VfxEffect[]>([]);
  const [showHourglass, setShowHourglass] = useState(false);
  const [showWinConAnimation, setShowWinConAnimation] = useState(false);
  const [winConAnimationType, setWinConAnimationType] = useState<string | null>(null);

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

  const handleEndPlacement = () => {
    const placedCards = gameState.playerField.filter((c) => c !== null).length;

    if (placedCards < 1) {
      toast.error(t("game.placement.toast.minCards"));
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
    const maxRounds = gameState.maxRounds || 7;

    if (gameState.pendingRoundSkip && gameState.pendingRoundSkip > 0) {
      setShowHourglass(true);
      setTimeout(() => {
        setShowHourglass(false);
        if (gameState.round >= maxRounds || gameState.playerHP <= 0 || gameState.opponentHP <= 0) {
          navigate("/");
          return;
        }
        nextRound();
      }, 2500);
      return;
    }

    if (gameState.round >= maxRounds || gameState.playerHP <= 0 || gameState.opponentHP <= 0) {
      navigate("/");
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
      <div className="min-h-screen bg-background flex flex-col relative w-full overflow-hidden">
        <ClassInfoPanel className={gameState.playerClass} />
        <SpecialCardInfoPanel />

        {/* --- Header --- */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/10 backdrop-blur-sm z-30 h-16">
          {/* Left: Back Button */}
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">{t("victory.back")}</span>
          </Button>

          {/* Center: Matchup & Round */}
          <div className="flex flex-col items-center">
            <div className="text-lg md:text-xl font-bold font-cinzel tracking-wider flex items-center gap-3">
              <span style={{ color: playerClassData.color }} className="drop-shadow-sm">{gameState.playerClass}</span>
              <span className="text-muted-foreground text-sm font-sans px-2">VS</span>
              <span style={{ color: opponentClassData.color }} className="drop-shadow-sm">{gameState.opponentClass}</span>
            </div>

            {/* Round & Phase Pill */}
            <div className="flex items-center gap-3 text-xs md:text-sm mt-0.5">
              <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {t("game.round")} {gameState.round}/{gameState.maxRounds || 7}
              </span>
              <span className="text-muted-foreground">
                {gameState.phase === "placement" && t("game.phase.placement")}
                {gameState.phase === "reveal" && t("game.phase.reveal")}
                {gameState.phase === "damage" && t("game.phase.damage")}
                {gameState.phase === "end" && (
                  gameState.playerHP > gameState.opponentHP ? t("game.phase.victory") :
                    gameState.playerHP < gameState.opponentHP ? t("game.phase.defeat") : t("game.phase.draw")
                )}
              </span>
            </div>
          </div>

          {/* Right: Spacer */}
          <div className="w-24 flex justify-end">
            {/* Placeholder */}
          </div>
        </div>

        {/* --- Game Area (Flex Column) --- */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 gap-2 md:gap-4 relative w-full max-w-7xl mx-auto">

          {/* 1. Opponent Area (Top) */}
          <div className="w-full flex justify-center items-start relative min-h-[160px]">
            {/* Opponent Info (Left) */}
            <div className="absolute left-4 top-0 hidden md:flex flex-col items-start gap-2">
              <DeckCounter count={gameState.opponentDeck.length} isOpponent />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color: opponentClassData.color }}>{opponentClassData.symbol}</span>
                <HPBar
                  current={gameState.opponentHP}
                  max={opponentClassData.initialHP}
                  label={gameState.opponentClass}
                  isOpponent
                  className="w-32 md:w-48"
                />
              </div>
            </div>

            {/* Mobile Opponent Info (Compact) */}
            <div className="md:hidden absolute left-0 top-0 flex flex-col gap-1 z-10 p-2 bg-black/40 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: opponentClassData.color }}>{opponentClassData.symbol}</span>
                <HPBar current={gameState.opponentHP} max={opponentClassData.initialHP} label="" isOpponent className="w-24" />
              </div>
            </div>


            {/* Opponent Field */}
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              <div className="grid grid-cols-5 gap-2 md:gap-4">
                {gameState.opponentField.map((card, i) => (
                  <GameCard
                    key={i}
                    card={card}
                    isPlaceholder={!card}
                    faceDown={gameState.phase === "placement"}
                    showEyeIcon={!!(card && gameState.phase !== "placement")}
                    className="w-16 h-24 md:w-24 md:h-36"
                  />
                ))}
              </div>
              {/* Opponent Knife Bar */}
              {isMimicVsMimic && <KnifeBar count={gameState.mimicCounter.p2} isOpponent className="absolute right-0 top-0 scale-75 origin-top-right md:static md:scale-100" />}
            </div>
          </div>


          {/* 2. Center Status / Damage Result (Absolute Center Overlay or Spacer) */}
          <div className="w-full flex items-center justify-center min-h-[60px] relative z-20">
            {(gameState.phase === "damage" || gameState.phase === "reveal") && gameState.damageResult && (
              <div className="absolute top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-xl border border-primary/30 rounded-lg p-4 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between gap-8 text-lg font-bold mb-2">
                  <span className="text-theta drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">-{gameState.damageResult.playerDamage} SİZ</span>
                  <span className="text-omega drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">-{gameState.damageResult.opponentDamage} RAKİP</span>
                </div>
                <div className="space-y-1 text-center">
                  {gameState.damageResult.details.map((detail, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{detail}</p>
                  ))}
                </div>
                <Button variant="default" size="sm" onClick={handleNextRound} className="w-full mt-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50">
                  {gameState.round >= 6 || gameState.playerHP <= 0 || gameState.opponentHP <= 0 ? t("game.action.menu") : t("game.action.next")}
                </Button>
              </div>
            )}

            {/* End Phase / Victory Menu */}
            {gameState.phase === "end" && (
              <div className="z-50 flex flex-col items-center">
                {/* Visual Effects handled below in the separate block, just Menu Button here */}
                <Button variant="outline" size="lg" onClick={() => navigate("/")} className="gap-2 relative z-50 bg-background/50 backdrop-blur border-primary text-primary hover:bg-primary hover:text-black transition-all">
                  <ArrowLeft className="w-4 h-4" /> {t("game.action.menu")}
                </Button>
              </div>
            )}
          </div>


          {/* 3. Player Area (Bottom) */}
          <div className="w-full flex justify-center items-end relative min-h-[280px]">

            {/* Player Info (Left Side Panel) */}
            <div className="absolute left-4 bottom-0 hidden md:flex flex-col items-start gap-3">
              <DeckCounter count={gameState.playerDeck.length} />
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold" style={{ color: playerClassData.color }}>{playerClassData.symbol}</span>
                <HPBar
                  current={gameState.playerHP}
                  max={playerClassData.initialHP}
                  label={gameState.playerClass}
                  className="w-32 md:w-56"
                />
              </div>
            </div>

            {/* Mobile Player Info */}
            <div className="md:hidden absolute left-0 bottom-[180px] z-10 p-2 bg-black/40 rounded">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: playerClassData.color }}>{playerClassData.symbol}</span>
                <HPBar current={gameState.playerHP} max={playerClassData.initialHP} label="" className="w-24" />
              </div>
            </div>

            {/* Main Play Area (Field + Hand) */}
            <div className="flex flex-col items-center gap-4 md:gap-8">
              {/* Player Field */}
              <div className="flex items-center gap-4 relative">
                <div className="grid grid-cols-5 gap-2 md:gap-4">
                  {gameState.playerField.map((card, i) => (
                    <div key={i} data-slot={i}>
                      <DroppableSlot
                        id={`field-${i}`}
                        card={card}
                        onRemove={card ? () => handleFieldCardClick(i) : undefined}
                        className="w-16 h-24 md:w-24 md:h-36"
                      />
                    </div>
                  ))}
                </div>

                {/* Mimic Knife Bar */}
                {isMimicVsMimic && <KnifeBar count={gameState.mimicCounter.p1} className="absolute right-0 bottom-40 scale-75 origin-bottom-right md:static md:scale-100" />}

                {/* --- RIGHT ACTION PANEL (New!) --- */}
                {gameState.phase === "placement" && (
                  <div className="absolute right-[-140px] top-0 bottom-0 flex flex-col justify-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRollDice}
                      disabled={gameState.playerClass === "Fateweaver" ? (gameState.playerDiceRolls || 0) <= 0 : (gameState.diceUsed || 0) >= 2}
                      className="w-16 h-16 rounded-full border-2 border-psi/50 bg-psi/10 hover:bg-psi/20 hover:border-psi text-psi shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all active:scale-95 flex flex-col gap-1"
                      title={t("game.dice.standard")}
                    >
                      <Dices className="w-6 h-6" />
                      <span className="text-[10px] font-bold">
                        {gameState.playerClass === "Fateweaver" ? (gameState.playerDiceRolls || 0) : `${gameState.diceUsed || 0}/2`}
                      </span>
                    </Button>

                    <div className="h-4" /> {/* Spacer */}

                    <Button
                      variant="ghost"
                      onClick={handleEndPlacement}
                      disabled={gameState.playerField.filter((c) => c !== null).length < 1}
                      className={cn(
                        "w-16 h-16 rounded-full border-2 transition-all flex flex-col gap-1 active:scale-95",
                        gameState.playerField.filter((c) => c !== null).length >= 1
                          ? "border-primary bg-primary/10 text-primary hover:bg-primary hover:text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse"
                          : "border-muted bg-muted/10 text-muted-foreground opacity-50"
                      )}
                      title={t("game.action.finish")}
                    >
                      <Hourglass className="w-6 h-6" />
                      <span className="text-[10px] font-bold">GO</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Player Hand */}
              <div className="min-h-[110px] w-full flex justify-center pb-2">
                {gameState.phase === "placement" ? (
                  <DroppableSlot id="hand-dropzone" isPlaceholder className="w-full border-none bg-transparent shadow-none" card={null}>
                    <div className="flex gap-2 md:gap-4 justify-center items-end px-4">
                      {gameState.playerHand.map((card, i) => (
                        <div key={card.id} className="transition-transform hover:-translate-y-4 duration-200">
                          <DraggableCard
                            card={card}
                            id={`card-${i}`}
                            disabled={!canPlaceCards}
                            onTap={() => handleTapToPlace(i)}
                          />
                        </div>
                      ))}
                    </div>
                  </DroppableSlot>
                ) : (
                  /* If not placement, just show empty space or remaining cards nicely */
                  <div className="h-[100px] w-full flex justify-center items-center text-muted-foreground/30 text-sm italic font-cinzel">
                    {t("game.phase.combat")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- End of Game Area --- */}

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

        {/* Visual Victory Effects */}
        {gameState.phase === "end" && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {gameState.winner === "p1" && gameState.playerClass === "Vitalist" && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-6xl font-bold text-green-500 animate-bounce drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">🌿 {t("game.anim.natureVictory")} 🌿</div>
              </div>
            )}
            {gameState.winner === "p1" && gameState.playerClass === "Decay" && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-orange-900/10">
                <div className="text-6xl font-bold text-orange-500 animate-pulse drop-shadow-[0_0_30px_rgba(249,115,22,1)]">🔥 {t("game.anim.victoryBurned")} 🔥</div>
              </div>
            )}
            {gameState.winner === "p1" && gameState.playerClass === "Slayer" && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/30">
                <div className="text-7xl font-cinzel font-black text-red-600 animate-bounce drop-shadow-[0_0_50px_rgba(220,38,38,1)] tracking-widest uppercase">🩸 {t("game.anim.massacre")} 🩸</div>
              </div>
            )}
          </div>
        )}

        <VictoryPopup
          open={gameState.phase === "end" && !showWinConAnimation}
          isVictory={gameState.winner === "p1"}
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
