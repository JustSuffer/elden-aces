import { useState, useCallback } from "react";
import { Card, ClassName, GameState as NewGameState, PlayerState } from "../types/game";
import { createDeck, MASTER_CLASSES } from "../data/gameData";
import { resolveGameRound, checkCounterWinCondition } from "../lib/gameLogic";
// Wait, I didn't export dealCards from gameData.ts in my previous edit. 
// I should add it or just implement it here. It's simple. 
// But wait, the original useGameState imported it from data/cards. 
// I'll implement a simple one here or import if I added it. I didn't add it to gameData.ts.

function localDealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { dealt, remaining };
}

// Adapted GameState interface to match what Game.tsx expects, but using new types
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
  
  // New fields for Class Tracking
  playerClass: ClassName;
  opponentClass: ClassName;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Initial Classes - Hardcoded for now or Random?
    // Let's go with Vitalist vs Slayer as per prompt example, or Random.
    // "1v1 Sıra Tabanlı..." doesn't specify initial setup.
    // I'll pick Vitalist (Player) vs Slayer (Opponent) for demo.
    const pClass: ClassName = "Vitalist";
    const oClass: ClassName = "Slayer";

    const playerDeck = createDeck(pClass); // Already shuffled
    const opponentDeck = createDeck(oClass);
    
    const { dealt: playerCards, remaining: playerRemaining } = localDealCards(playerDeck, 5); // 5 cards per round usually, initial deal?
    // Prompt: "Mekanik: Her round 5 kart oynanır." -> implies hand size needs to support 5 cards play.
    // Usually draws up to 5? Or deal fixed amount?
    // "Deste: 30 Kart". "Süre: 6 Round". 5 cards * 6 rounds = 30 cards. Perfect.
    // So we deal 5 cards every round.
    
    // Initial deal
    const { dealt: initialP, remaining: remainP } = localDealCards(playerDeck, 5);
    const { dealt: initialO, remaining: remainO } = localDealCards(opponentDeck, 5);

    return {
      round: 1,
      playerHP: MASTER_CLASSES[pClass].initialHP, // Vitalist 40
      opponentHP: MASTER_CLASSES[oClass].initialHP, // Slayer 30
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
      // Bot Logic: Random placement from hand
      const botField: (Card | null)[] = [null, null, null, null, null];
      const cardsToPlace = prev.opponentMust4Cards ? 4 : 5;
      
      // Just take first N cards for now, or random shuffle
      const botHandToPlay = [...prev.opponentHand].slice(0, cardsToPlace);
      // Fill slots 0 to N-1
      botHandToPlay.forEach((c, i) => botField[i] = c);
      
      // Remaining hand (unused cards?) 
      // In this game mode (5 cards deal, 5 cards play), hand should be empty after play effectively.
      // But if they play 4, 1 remains?
      // For now, keep unused in hand (though they might be discarded if we draw fresh 5 next round? 
      // "Deste: 30 Kart... Süre: 6 Round... Her round 5 kart oynanır." -> implies strict 5 deal/play consumption.
      
      return {
        ...prev,
        opponentField: botField,
        phase: "reveal",
      };
    });
  }, []);

  const rollDice = useCallback(() => {
    // Fateweaver specific? Or Global?
    // Prompt: "Zar Mekaniği: ... Sadece Zardan (Pi) gelir. Fateweaver'a özeldir (R3+)."
    // It seems only Fateweaver uses dice. 
    // But existing code had a generic dice roll.
    // I will keep generic structure but maybe limit it?
    // "Zar atma yeteneği sadece Round 3 ve sonrasında kullanılabilir."
    
    // For now I'll just keep the existing "simulation" of dice logic or adapt it.
    // Let's simple return a mocked result compatible with UI.
    const result = Math.floor(Math.random() * 20) + 1;
    let effect = "Fate rolled: " + result;

    if (result >= 13) effect += " (Success!)";
    else effect += " (Fail)";

    setGameState((prev) => ({
      ...prev,
      pendingDiceResult: { result, effect },
    }));

    return { result, effect };
  }, []);

  const acknowledgeDiceResult = useCallback(() => {
     setGameState((prev) => ({ ...prev, diceUsed: prev.diceUsed + 1, pendingDiceResult: null }));
  }, []);

  const cancelDiceResult = useCallback(() => {
    setGameState((prev) => ({ ...prev, pendingDiceResult: null }));
  }, []);

  const calculateRoundDamage = useCallback(() => {
    setGameState((prev) => {
      // Create non-null arrays for the logic function
      const p1Cards = prev.playerField.filter((c): c is Card => c !== null);
      const p2Cards = prev.opponentField.filter((c): c is Card => c !== null); // Opponent

      const result = resolveGameRound(
        p1Cards,
        p2Cards,
        prev.playerClass,
        prev.opponentClass
      );

      let newPlayerHP = Math.max(0, prev.playerHP - result.p1DamageTaken);
      let newOpponentHP = Math.max(0, prev.opponentHP - result.p2DamageTaken); // p2DamageTaken is damage P2 took

      // Construct temporary PlayerState objects for logic check
      const p1State: PlayerState = {
        id: "p1", className: prev.playerClass, hp: prev.playerHP, maxHP: MASTER_CLASSES[prev.playerClass].initialHP,
        deck: prev.playerDeck, hand: prev.playerHand, graveyard: [], playedCardsInRound: p1Cards,
        wins: 0, isEliminated: false
      };
      const p2State: PlayerState = {
        id: "p2", className: prev.opponentClass, hp: prev.opponentHP, maxHP: MASTER_CLASSES[prev.opponentClass].initialHP,
        deck: prev.opponentDeck, hand: prev.opponentHand, graveyard: [], playedCardsInRound: p2Cards,
        wins: 0, isEliminated: false
      };

      const p1InstantWin = checkCounterWinCondition(p1State, p2State, prev.round);
      const p2InstantWin = checkCounterWinCondition(p2State, p1State, prev.round);

      let logDetails = [...result.logs];
      let phase = newPlayerHP <= 0 || newOpponentHP <= 0 ? "end" : "damage";

      if (p1InstantWin) {
         newOpponentHP = 0; // Force end
         phase = "end";
         logDetails.push("Player met specific Win Condition!");
      }
      if (p2InstantWin) {
         newPlayerHP = 0;
         phase = "end";
         logDetails.push("Opponent met specific Win Condition!");
      }

      // Apply Side Effects (Burn, Draw, etc.)
      const effects = result.sideEffects;
      let p1Deck = [...prev.playerDeck];
      let p2Deck = [...prev.opponentDeck];
      let currentRound = prev.round;

      // Incinerator Burns
      if (effects.p1BurnCount) {
         p2Deck = p2Deck.slice(effects.p1BurnCount);
         logDetails.push(`Incinerator burnt ${effects.p1BurnCount} cards from Opponent!`);
      }
      if (effects.p2BurnCount) {
         p1Deck = p1Deck.slice(effects.p2BurnCount);
         logDetails.push(`Incinerator burnt ${effects.p2BurnCount} cards from Player!`);
      }

      // Chronokeeper Round Skip (Actually "Deleting" rounds usually means reversing time or preventing progress?
      // Prompt: "0 Round siler" (Effectively cancels round progress?).
      // If "3 Round siler", maybe we decrement round counter?
      // Let's assume it decrements logic round or cancels this round's increment?
      // NextRound function increments round.
      // If we decrement here, next round will simple go back or stay same.
      if (effects.p1RoundsSkip) {
          currentRound = Math.max(1, currentRound - effects.p1RoundsSkip);
          logDetails.push(`Chronokeeper deleted ${effects.p1RoundsSkip} rounds!`);
      }
      if (effects.p2RoundsSkip) {
          currentRound = Math.max(1, currentRound - effects.p2RoundsSkip);
          logDetails.push(`Chronokeeper deleted ${effects.p2RoundsSkip} rounds!`);
      }

      return {
        ...prev,
        round: currentRound,
        playerHP: newPlayerHP,
        opponentHP: newOpponentHP,
        playerDeck: p1Deck,
        opponentDeck: p2Deck,
        damageResult: {
          playerDamage: result.p1DamageTaken,
          opponentDamage: result.p2DamageTaken,
          details: logDetails
        },
        phase: phase,
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setGameState((prev) => {
      if (prev.round >= 6 || prev.playerHP <= 0 || prev.opponentHP <= 0) {
        return { ...prev, phase: "end" };
      }

      const cardsToDeal = 5;
      const { dealt: playerCards, remaining: playerRemaining } = localDealCards(prev.playerDeck, cardsToDeal);
      const { dealt: opponentCards, remaining: opponentRemaining } = localDealCards(prev.opponentDeck, cardsToDeal);
      
      // We overwrite hand (assuming previous cards are discarded/consumed)
      // "Her round 5 kart oynanır" -> implies consumption.
      
      return {
        ...prev,
        round: prev.round + 1,
        playerDeck: playerRemaining,
        opponentDeck: opponentRemaining,
        playerHand: playerCards,
        opponentHand: opponentCards,
        playerField: [null, null, null, null, null],
        opponentField: [null, null, null, null, null],
        phase: "placement",
        damageResult: null,
      };
    });
  }, []);

  const handleCardSelection = useCallback((selectedIndices: number[]) => {
     // Implement if needed for card-swapping mechanics (Siren/Oracle etc)
     setGameState(prev => ({ ...prev, cardSelectionMode: false }));
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
