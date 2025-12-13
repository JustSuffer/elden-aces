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
import { ArrowLeft, Dices, Eye, Snowflake, Heart, Settings, Flame, Sparkles, Skull, Atom } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { GameCard } from "@/components/game/GameCard";
import { AudioManager } from "@/utils/AudioManager";
import { SavedDeck } from "@/types/deck";
import { ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";
import { ClassInfoPanel } from "@/components/game/ClassInfoPanel";
import { SpecialCardInfoPanel } from "@/components/game/SpecialCardInfoPanel";

interface GameMatchProps {
  playerDeck: SavedDeck;
  opponentClass: ClassName;
}

export const GameMatch = ({ playerDeck, opponentClass }: GameMatchProps) => {
  const navigate = useNavigate();
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
      toast.error(`Bu tur en fazla ${maxCards} kart oynayabilirsin!`);
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
            toast.error("Zar hakkınız kalmadı! (Fateweaver)");
            return;
        }
        // Proceed for Fateweaver regardless of diceUsed
        rollDice();
        return;
    }

    // 2. Standard Logic (Non-Fateweaver)
    if (gameState.diceUsed >= 2) {
        toast.error("Zar hakkın bitti! (Maç başına 2)");
        return;
    }

    rollDice();
  };

  const handleEndPlacement = () => {
    const placedCards = gameState.playerField.filter((c) => c !== null).length;
    
    if (placedCards < 1) {
      toast.error(`En az 1 kart yerleştirmelisin!`);
      return;
    }
    // If specific restriction active, we might want to enforce it? 
    // "Bu tur sadece 4 kart oynayabilirsin" -> implies exactly 4? 
    // Or just max 4? The prompt wants flexibility. Let's assume Max 4 if that effect is active.
    // However, if the user explicitly wants to adhere to the table, the table has logic for 4 cards.
    // I will enforce Min 1. The Max is handled in Tap.
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
      // Check various win conditions
      if (gameState.playerClass === "Fateweaver" && details.some(l => l.includes("KADERİN GÖZÜ"))) {
        setWinConAnimationType("fateweaver");
        setShowWinConAnimation(true);
      } else if (gameState.playerClass === "Cryomancer" && details.some(l => l.includes("kazanma koşulunu sağladı"))) {
        setWinConAnimationType("cryomancer");
        setShowWinConAnimation(true);
      } else if (gameState.playerClass === "Siren" && details.some(l => l.includes("KADERİN KALBİNE"))) {
        setWinConAnimationType("siren");
        setShowWinConAnimation(true);
      } else if (isMimicVsMimic && (gameState.mimicCounter.p1 >= 12 || gameState.mimicCounter.p2 >= 12)) {
        setWinConAnimationType("mimic");
        setShowWinConAnimation(true);
      } else if (gameState.playerClass === "Augmentor" && gameState.winner === "p1") {
        // Augmentor Win (Generic or specific?)
        // User asked for "Augmentor Winconu için mühendislik animasyonu"
        // If they played 5 cards (Exodia-like) or just Won?
        // Usually Augmentor wins by Damage/Buffs.
        // Assuming any Augmentor Win triggers this blue animation.
        setWinConAnimationType("augmentor");
        setShowWinConAnimation(true);
      } else if (gameState.playerClass === "Decay" && gameState.winner === "p1") {
         setWinConAnimationType("decay");
         setShowWinConAnimation(true);
      } else if (gameState.winReason === "VESSEL_WIN") {
         setWinConAnimationType("vessel");
         setShowWinConAnimation(true);
      } else {
        setShowWinConAnimation(false);
        setWinConAnimationType(null);
      }
    }
  }, [gameState.phase, gameState.damageResult, isMimicVsMimic, gameState.mimicCounter, gameState.playerClass]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background flex flex-col relative">
        <ClassInfoPanel className={gameState.playerClass} />
        <SpecialCardInfoPanel />
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
                      label={`Rakip (${gameState.opponentClass})`} 
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
                Round {gameState.round}/{gameState.maxRounds || 7}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground tracking-wider">
                {gameState.phase === "placement" && `Kartlarını seç ve oyna`}
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
                  disabled={
                    gameState.playerClass === "Fateweaver"
                      ? (gameState.playerDiceRolls || 0) <= 0
                      : (gameState.diceUsed || 0) >= 2
                  }
                  className="gap-2 bg-psi hover:bg-psi/80"
                >
                  <Dices className="w-5 h-5" />
                  {gameState.playerClass === "Fateweaver" 
                    ? `Kader Zarı (${gameState.playerDiceRolls || 0})`
                    : `Zar Π (${gameState.diceUsed || 0}/2)`
                  }
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={handleEndPlacement}
                  disabled={gameState.playerField.filter((c) => c !== null).length < 1}
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
              <div className="flex flex-col items-center gap-4 z-50">
                {/* Visual Victory Effects */}
                {gameState.winner === "p1" && gameState.playerClass === "Vitalist" && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
                        {Array.from({length: 30}).map((_, i) => (
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
                        <div className="text-6xl font-bold text-green-500 animate-bounce mt-20 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">🌿 DOĞA ZAFERİ 🌿</div>
                    </div>
                )}
                
                {gameState.winner === "p1" && gameState.playerClass === "Decay" && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-center bg-orange-900/10">
                         {Array.from({length: 30}).map((_, i) => (
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
                             🔥 YAKIP YOK ETTİN! 🔥
                        </div>
                    </div>
                )}

                {gameState.winner === "p1" && gameState.playerClass === "Slayer" && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-center bg-red-950/30">
                         {Array.from({length: 40}).map((_, i) => (
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
                             🩸 KATLİAM! 🩸
                        </div>
                        <div className="text-2xl text-red-400 font-bold mt-4 animate-pulse">12+ HASAR: TEK OP VURUŞ</div>
                    </div>
                )}

                <Button variant="default" size="lg" onClick={() => navigate("/")} className="gap-2 relative z-50 mt-10">
                  Menüye Dön
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
                      label={`Sen (${gameState.playerClass})`} 
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
            onClose={() => {}}
            onAcknowledge={acknowledgeDiceResult}
            onCancel={cancelDiceResult}
            result={gameState.pendingDiceResult.result}
            effect={gameState.pendingDiceResult.effect}
          />
        )}

        {/* Victory Popup Removed (Duplicate) */}

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
              ZAMAN ATLANIYOR...
            </h2>
            <p className="text-xl md:text-2xl text-amber-200/80 mt-4 text-center font-cinzel">
              +{gameState.pendingRoundSkip} ROUND
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
                  MUTLAK KADER
              </h1>
              <p className="text-xl text-psi/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
                  GELECEK YAZILDI
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
                  EBEDİ KIŞ
              </h1>
              <p className="text-xl text-cyan-100/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
                  DÜNYA DONDU
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
                   {winConAnimationType === "decay_death" ? "KÜL VE ÖLÜM" : "KÜLLERİNDEN DOĞUŞ"}
               </h1>
               <p className="text-2xl text-red-500/80 mt-4 font-bold tracking-[0.2em] animate-in fade-in delay-500 duration-1000">
                   {winConAnimationType === "decay_death" ? "CEZA: DESTE BİTMEDİ" : "ZAFER: DESTE YAKILDI"}
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
                  AŞKIN LANETİ
              </h1>
              <p className="text-xl text-rose-200/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
                  KADERİN KALBİNE HÜKMETTİM
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
                  BIÇAK USTASI
              </h1>
              <p className="text-xl text-slate-300/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
                  12 BIÇAK TAMAMLANDI
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
                   MÜHENDİSLİK HARİKASI
               </h1>
               <p className="text-xl text-blue-200/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
                   KUSURSUZ HESAPLAMA
               </p>
          </div>
        )}

        {/* Decay Win Animation */}
        {showWinConAnimation && winConAnimationType === "decay" && (
          <div className="fixed inset-0 z-50 bg-orange-950/90 flex flex-col items-center justify-center animate-in fade-in duration-1000">
               <div className="absolute inset-0 overflow-hidden opacity-50">
                   {Array.from({length: 40}).map((_, i) => (
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
                   KÜL VE DUMAN
               </h1>
               <p className="text-xl text-orange-200/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000 relative z-10">
                   RAKİP DESTE YAKILDI
               </p>
          </div>
        )}

        {/* Vessel Win Animation */}
        {showWinConAnimation && winConAnimationType === "vessel" && (
          <div className="fixed inset-0 z-[60] bg-orange-950/90 flex flex-col items-center justify-center animate-in fade-in duration-1000">
               <div className="relative animate-pulse">
                  <Atom className="w-64 h-64 text-orange-400 animate-spin-slow duration-[10s]" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-yellow-200 animate-ping" />
               </div>
               <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200 mt-8 font-cinzel animate-in slide-in-from-bottom duration-1000">
                   KOZMİK GÜÇ
               </h1>
               <p className="text-xl text-orange-200/80 mt-4 tracking-[0.5em] animate-in fade-in delay-500 duration-1000">
                   EVRENİN HAKİMİ
               </p>
               <Button 
                  onClick={() => setShowWinConAnimation(false)}
                  className="mt-12 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-xl rounded-none border border-orange-400/50 shadow-[0_0_20px_rgba(249,115,22,0.5)] animate-in fade-in delay-1000 duration-1000"
               >
                  ZAFERİ KUTLA
               </Button>
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
