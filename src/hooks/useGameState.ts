import { useState, useCallback } from "react";
import { Card, ClassName, PlayerState } from "../types/game";
import { SavedDeck } from "../types/deck";
import { MASTER_CLASSES, SPECIAL_CARDS_DATA, shuffleDeck } from "../data/gameData";
import { resolveGameRound, checkCounterWinCondition, applyClassAbility } from "../lib/gameLogic";

function localDealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { dealt, remaining };
}

export interface GameState {
  round: number;
  playerHP: number;
  opponentHP: number;
  playerDeck: Card[];
  opponentDeck: Card[];
  playerHand: Card[];
  opponentHand: Card[];
  playerField: (Card | null)[];
  opponentField: (Card | null)[];
  diceUsed: number;
  phase: "placement" | "reveal" | "damage" | "end";
  opponentMust4Cards: boolean;
  playerMust4Cards: boolean;
  cardSelectionMode: boolean;
  pendingDiceResult: {
    result: number;
    effect: string;
  } | null;
  damageResult: {
    playerDamage: number;
    opponentDamage: number;
    details: string[];
  } | null;
  playerClass: ClassName;
  opponentClass: ClassName;
  playerDiceRolls: number; // Accumulated dice rolls for Fateweaver
  carryOverCards: Card[]; // Cards carried over from previous round
}

// Generate bot deck based on class
function createBotDeck(className: ClassName): Card[] {
  const classData = MASTER_CLASSES[className];
  const deck: Card[] = [];
  
  // 6 Main class cards (1-6)
  for (let i = 1; i <= 6; i++) {
    deck.push({
      id: `bot-${className.toLowerCase()}-${i}-${Date.now()}`,
      name: `${classData.name} ${i}`,
      symbol: classData.symbol,
      value: i,
      type: "numeric",
      classSymbol: classData.symbol,
      color: classData.color
    });
  }

  // 6 Special cards
  const specialTypes = ["twisted", "twisted", "deflate", "deflate", "delta", "sigma"] as const;
  specialTypes.forEach((type, idx) => {
    deck.push({
      id: `bot-special-${type}-${idx}-${Date.now()}`,
      name: SPECIAL_CARDS_DATA[type].name,
      symbol: SPECIAL_CARDS_DATA[type].symbol,
      type: "special",
      specialType: type,
      value: 0,
      description: SPECIAL_CARDS_DATA[type].description,
    });
  });

  // 18 Filler cards from 3 random other classes
  const otherClasses = Object.keys(MASTER_CLASSES).filter(c => c !== className) as ClassName[];
  const shuffledOthers = otherClasses.sort(() => Math.random() - 0.5).slice(0, 3);
  
  shuffledOthers.forEach((fillerClass) => {
    const fillerData = MASTER_CLASSES[fillerClass];
    for (let i = 1; i <= 6; i++) {
      deck.push({
        id: `bot-${fillerClass.toLowerCase()}-${i}-${Date.now()}-${Math.random()}`,
        name: `${fillerData.name} ${i}`,
        symbol: fillerData.symbol,
        value: i,
        type: "numeric",
        classSymbol: fillerData.symbol,
        color: fillerData.color
      });
    }
  });

  return shuffleDeck(deck);
}

interface GameInitParams {
  playerDeck: SavedDeck;
  opponentClass: ClassName;
}

export function useGameState(initParams?: GameInitParams) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const pClass = initParams?.playerDeck.mainClass || "Vitalist";
    const oClass = initParams?.opponentClass || "Slayer";

    // Use player's saved deck or create default
    const playerDeck = initParams?.playerDeck.cards 
      ? shuffleDeck([...initParams.playerDeck.cards])
      : createBotDeck(pClass);
    
    const opponentDeck = createBotDeck(oClass);
    
    // Deal 6 cards for round 1
    const { dealt: initialP, remaining: remainP } = localDealCards(playerDeck, 6);
    const { dealt: initialO, remaining: remainO } = localDealCards(opponentDeck, 6);

    return {
      round: 1,
      playerHP: MASTER_CLASSES[pClass].initialHP,
      opponentHP: MASTER_CLASSES[oClass].initialHP,
      playerDeck: remainP,
      opponentDeck: remainO,
      playerHand: initialP,
      opponentHand: initialO,
      playerField: [null, null, null, null, null],
      opponentField: [null, null, null, null, null],
      diceUsed: 0,
      phase: "placement",
      opponentMust4Cards: false,
      playerMust4Cards: false,
      cardSelectionMode: false,
      pendingDiceResult: null,
      damageResult: null,
      playerClass: pClass,
      opponentClass: oClass,
      playerDiceRolls: 0,
      carryOverCards: [],
    };
  });

  const placeCard = useCallback((cardIndex: number, fieldIndex: number) => {
    setGameState((prev) => {
      const newField = [...prev.playerField];
      const card = prev.playerHand[cardIndex];

      if (newField[fieldIndex] !== null) return prev;

      newField[fieldIndex] = card;
      const newHand = prev.playerHand.filter((_, i) => i !== cardIndex);

      return {
        ...prev,
        playerField: newField,
        playerHand: newHand,
      };
    });
  }, []);

  const removeCardFromField = useCallback((fieldIndex: number) => {
    setGameState((prev) => {
      const card = prev.playerField[fieldIndex];
      if (!card) return prev;

      const newField = [...prev.playerField];
      newField[fieldIndex] = null;

      return {
        ...prev,
        playerField: newField,
        playerHand: [...prev.playerHand, card],
      };
    });
  }, []);

  const rearrangeCard = useCallback((fromIndex: number, toIndex: number) => {
    setGameState((prev) => {
      const newField = [...prev.playerField];
      const cardToMove = newField[fromIndex];
      
      if (!cardToMove || newField[toIndex] !== null) return prev;

      newField[fromIndex] = null;
      newField[toIndex] = cardToMove;

      return {
        ...prev,
        playerField: newField,
      };
    });
  }, []);

  const endPlacement = useCallback(() => {
    setGameState((prev) => {
      // Bot Logic: Strategic placement based on class
      const botField: (Card | null)[] = [null, null, null, null, null];
      const cardsToPlace = prev.opponentMust4Cards ? 4 : 5;
      
      // Sort by value and take best cards
      const sortedHand = [...prev.opponentHand].sort((a, b) => (b.value || 0) - (a.value || 0));
      const botHandToPlay = sortedHand.slice(0, cardsToPlace);
      
      // Shuffle placement for unpredictability
      const shuffledPlay = botHandToPlay.sort(() => Math.random() - 0.5);
      shuffledPlay.forEach((c, i) => botField[i] = c);
      
      // Remaining cards stay in hand for carry-over
      const remainingBotHand = prev.opponentHand.filter(c => !botHandToPlay.includes(c));
      
      return {
        ...prev,
        opponentField: botField,
        opponentHand: remainingBotHand,
        phase: "reveal",
      };
    });
  }, []);

  const rollDice = useCallback(() => {
    // Check if Fateweaver and round >= 3
    setGameState((prev) => {
      if (prev.playerClass === "Fateweaver" && prev.round < 3) {
        return prev; // Can't roll yet
      }
      
      if (prev.diceUsed >= 2 && prev.playerClass !== "Fateweaver") {
        return prev; // Max 2 rolls for non-Fateweaver
      }

      const result = Math.floor(Math.random() * 20) + 1;
      let effect = "";
      
      if (result >= 1 && result <= 5) {
        effect = "Bu tur sadece 4 kart oynayabilirsin!";
      } else if (result >= 6 && result <= 10) {
        effect = "2 kart elinden desteye karıştı, 2 yeni kart çektin!";
      } else if (result >= 11 && result <= 15) {
        effect = "2 kart seç: desteye at ve 2 yeni kart çek!";
      } else if (result >= 16 && result <= 18) {
        effect = "Eline 1 adet Twisted (α) eklendi!";
      } else {
        effect = "Eline 1 adet Gamma (γ) eklendi!";
      }

      return {
        ...prev,
        pendingDiceResult: { result, effect },
      };
    });
  }, []);

  const acknowledgeDiceResult = useCallback(() => {
    setGameState((prev) => {
      if (!prev.pendingDiceResult) return prev;
      
      const result = prev.pendingDiceResult.result;
      let newHand = [...prev.playerHand];
      let newDeck = [...prev.playerDeck];
      let must4Cards = prev.playerMust4Cards;
      let cardSelectionMode = false;

      if (result >= 1 && result <= 5) {
        must4Cards = true;
      } else if (result >= 6 && result <= 10) {
        // Swap 2 random cards
        const toSwap = newHand.splice(0, Math.min(2, newHand.length));
        newDeck = shuffleDeck([...newDeck, ...toSwap]);
        const { dealt, remaining } = localDealCards(newDeck, 2);
        newHand = [...newHand, ...dealt];
        newDeck = remaining;
      } else if (result >= 11 && result <= 15) {
        cardSelectionMode = true;
      } else if (result >= 16 && result <= 18) {
        // Add Twisted
        newHand.push({
          id: `dice-twisted-${Date.now()}`,
          name: SPECIAL_CARDS_DATA.twisted.name,
          symbol: SPECIAL_CARDS_DATA.twisted.symbol,
          type: "special",
          specialType: "twisted",
          value: 0,
          description: SPECIAL_CARDS_DATA.twisted.description,
        });
      } else {
        // Add Gamma
        newHand.push({
          id: `dice-gamma-${Date.now()}`,
          name: SPECIAL_CARDS_DATA.gamma.name,
          symbol: SPECIAL_CARDS_DATA.gamma.symbol,
          type: "special",
          specialType: "gamma",
          value: 0,
          description: SPECIAL_CARDS_DATA.gamma.description,
        });
      }

      return {
        ...prev,
        diceUsed: prev.diceUsed + 1,
        pendingDiceResult: null,
        playerHand: newHand,
        playerDeck: newDeck,
        playerMust4Cards: must4Cards,
        cardSelectionMode,
      };
    });
  }, []);

  const cancelDiceResult = useCallback(() => {
    setGameState((prev) => ({ ...prev, pendingDiceResult: null }));
  }, []);

  const calculateRoundDamage = useCallback(() => {
    setGameState((prev) => {
      const p1Cards = prev.playerField.filter((c): c is Card => c !== null);
      const p2Cards = prev.opponentField.filter((c): c is Card => c !== null);

      // Apply class abilities first
      const p1AbilityResult = applyClassAbility(prev.playerClass, p1Cards, prev.playerHP);
      const p2AbilityResult = applyClassAbility(prev.opponentClass, p2Cards, prev.opponentHP);

      let newPlayerHP = Math.max(0, prev.playerHP + p1AbilityResult.hpChange);
      let newOpponentHP = Math.max(0, prev.opponentHP + p2AbilityResult.hpChange);

      // Resolve round combat
      const result = resolveGameRound(p1Cards, p2Cards, prev.playerClass, prev.opponentClass);

      newPlayerHP = Math.max(0, newPlayerHP - result.p1DamageTaken);
      newOpponentHP = Math.max(0, newOpponentHP - result.p2DamageTaken);

      // Check instant win conditions
      const p1State: PlayerState = {
        id: "p1", className: prev.playerClass, hp: newPlayerHP, maxHP: MASTER_CLASSES[prev.playerClass].initialHP,
        deck: prev.playerDeck, hand: prev.playerHand, graveyard: [], playedCardsInRound: p1Cards,
        wins: 0, isEliminated: false
      };
      const p2State: PlayerState = {
        id: "p2", className: prev.opponentClass, hp: newOpponentHP, maxHP: MASTER_CLASSES[prev.opponentClass].initialHP,
        deck: prev.opponentDeck, hand: prev.opponentHand, graveyard: [], playedCardsInRound: p2Cards,
        wins: 0, isEliminated: false
      };

      const p1InstantWin = checkCounterWinCondition(p1State, p2State, prev.round);
      const p2InstantWin = checkCounterWinCondition(p2State, p1State, prev.round);

      let logDetails = [...p1AbilityResult.logs, ...p2AbilityResult.logs, ...result.logs];
      let phase: "placement" | "reveal" | "damage" | "end" = newPlayerHP <= 0 || newOpponentHP <= 0 ? "end" : "damage";

      if (p1InstantWin) {
        newOpponentHP = 0;
        phase = "end";
        logDetails.push(`🏆 ${prev.playerClass} kazanma koşulunu sağladı!`);
      }
      if (p2InstantWin) {
        newPlayerHP = 0;
        phase = "end";
        logDetails.push(`💀 ${prev.opponentClass} kazanma koşulunu sağladı!`);
      }

      // Apply side effects
      let p1Deck = [...prev.playerDeck];
      let p2Deck = [...prev.opponentDeck];

      if (result.sideEffects.p1BurnCount) {
        p2Deck = p2Deck.slice(result.sideEffects.p1BurnCount);
        logDetails.push(`🔥 ${result.sideEffects.p1BurnCount} rakip kartı yakıldı!`);
      }
      if (result.sideEffects.p2BurnCount) {
        p1Deck = p1Deck.slice(result.sideEffects.p2BurnCount);
        logDetails.push(`🔥 ${result.sideEffects.p2BurnCount} kartın yakıldı!`);
      }

      // Check round 6 end condition
      if (prev.round >= 6 && phase !== "end") {
        phase = "end";
        if (newPlayerHP > newOpponentHP) {
          logDetails.push("6. Round sonu - HP'n daha yüksek!");
        } else if (newOpponentHP > newPlayerHP) {
          logDetails.push("6. Round sonu - Rakip HP'si daha yüksek!");
        } else {
          logDetails.push("6. Round sonu - Berabere!");
        }
      }

      return {
        ...prev,
        playerHP: newPlayerHP,
        opponentHP: newOpponentHP,
        playerDeck: p1Deck,
        opponentDeck: p2Deck,
        damageResult: {
          playerDamage: result.p1DamageTaken,
          opponentDamage: result.p2DamageTaken,
          details: logDetails
        },
        phase,
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setGameState((prev) => {
      if (prev.round >= 6 || prev.playerHP <= 0 || prev.opponentHP <= 0) {
        return { ...prev, phase: "end" };
      }

      // Cards not played carry over (player hand already has unplayed cards)
      // Deal new cards to reach 6 total
      const cardsNeeded = Math.max(0, 6 - prev.playerHand.length);
      const botCardsNeeded = Math.max(0, 6 - prev.opponentHand.length);
      
      const { dealt: playerCards, remaining: playerRemaining } = localDealCards(prev.playerDeck, cardsNeeded);
      const { dealt: opponentCards, remaining: opponentRemaining } = localDealCards(prev.opponentDeck, botCardsNeeded);
      
      return {
        ...prev,
        round: prev.round + 1,
        playerDeck: playerRemaining,
        opponentDeck: opponentRemaining,
        playerHand: [...prev.playerHand, ...playerCards],
        opponentHand: [...prev.opponentHand, ...opponentCards],
        playerField: [null, null, null, null, null],
        opponentField: [null, null, null, null, null],
        phase: "placement" as const,
        damageResult: null,
        playerMust4Cards: false,
        opponentMust4Cards: false,
      };
    });
  }, []);

  const handleCardSelection = useCallback((selectedIndices: number[]) => {
    setGameState(prev => {
      if (selectedIndices.length !== 2) return { ...prev, cardSelectionMode: false };
      
      // Remove selected cards and draw 2 new
      const selectedCards = selectedIndices.map(i => prev.playerHand[i]);
      let newHand = prev.playerHand.filter((_, i) => !selectedIndices.includes(i));
      let newDeck = shuffleDeck([...prev.playerDeck, ...selectedCards]);
      
      const { dealt, remaining } = localDealCards(newDeck, 2);
      newHand = [...newHand, ...dealt];
      
      return { 
        ...prev, 
        cardSelectionMode: false,
        playerHand: newHand,
        playerDeck: remaining,
      };
    });
  }, []);

  return {
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
  };
}
