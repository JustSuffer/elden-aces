import { useState, useCallback } from "react";
import { Card, DECK, shuffleDeck, dealCards } from "@/data/cards";
import { calculateDamage } from "@/utils/damageCalculator";

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
  damageResult: {
    playerDamage: number;
    opponentDamage: number;
    details: string[];
  } | null;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const playerDeck = shuffleDeck([...DECK]);
    const opponentDeck = shuffleDeck([...DECK]);
    
    const { dealt: playerCards, remaining: playerRemaining } = dealCards(playerDeck, 6);
    const { dealt: opponentCards, remaining: opponentRemaining } = dealCards(opponentDeck, 6);

    return {
      round: 1,
      playerHP: 30,
      opponentHP: 30,
      playerDeck: playerRemaining,
      opponentDeck: opponentRemaining,
      playerHand: playerCards,
      opponentHand: opponentCards,
      playerField: [null, null, null, null, null],
      opponentField: [null, null, null, null, null],
      diceUsed: 0, // Global counter for entire match
      phase: "placement",
      opponentMust4Cards: false,
      playerMust4Cards: false,
      damageResult: null,
    };
  });

  const placeCard = useCallback((cardIndex: number, fieldIndex: number) => {
    setGameState((prev) => {
      const newField = [...prev.playerField];
      const card = prev.playerHand[cardIndex];

      // Check if field slot is empty
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

  const endPlacement = useCallback(() => {
    setGameState((prev) => {
      // Bot places cards (simple random strategy)
      const botField: (Card | null)[] = [null, null, null, null, null];
      const cardsToPlace = prev.opponentMust4Cards ? 4 : 5;

      for (let i = 0; i < cardsToPlace && i < prev.opponentHand.length; i++) {
        botField[i] = prev.opponentHand[i];
      }

      return {
        ...prev,
        opponentField: botField,
        phase: "reveal",
      };
    });
  }, []);

  const rollDice = useCallback(() => {
    const result = Math.floor(Math.random() * 20) + 1;
    
    setGameState((prev) => {
      const newState = { ...prev, diceUsed: prev.diceUsed + 1 };

      if (result >= 1 && result <= 5) {
        newState.playerMust4Cards = true;
      } else if (result >= 6 && result <= 10) {
        const handIndices = prev.playerHand.map((_, i) => i);
        const toReplace = handIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        const { dealt: newCards, remaining } = dealCards(prev.playerDeck, 2);
        
        newState.playerHand = prev.playerHand.map((card, i) => 
          toReplace.includes(i) ? (newCards[toReplace.indexOf(i)] || card) : card
        );
        newState.playerDeck = remaining;
      } else if (result >= 11 && result <= 15) {
        // Player chooses 2 cards to replace (simplified: auto-replace for now)
        const handIndices = prev.playerHand.map((_, i) => i);
        const toReplace = handIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        const { dealt: newCards, remaining } = dealCards(prev.playerDeck, 2);
        
        newState.playerHand = prev.playerHand.map((card, i) => 
          toReplace.includes(i) ? (newCards[toReplace.indexOf(i)] || card) : card
        );
        newState.playerDeck = remaining;
      } else if (result >= 16 && result <= 18) {
        const twisted: Card = {
          id: `twisted-dice-${Date.now()}`,
          name: "Twisted",
          symbol: "α",
          type: "special",
          special: "twisted",
          color: "primary",
          description: "Reflects damage if your total < opponent's total.",
        };
        newState.playerDeck = [...prev.playerDeck, twisted];
      } else if (result >= 19 && result <= 20) {
        const gamma: Card = {
          id: `gamma-dice-${Date.now()}`,
          name: "Gamma",
          symbol: "γ",
          type: "special",
          special: "gamma",
          color: "primary",
          description: "No damage taken. 2x damage dealt if higher. Opponent plays 4 cards next round.",
        };
        newState.playerDeck = [...prev.playerDeck, gamma];
      }

      return newState;
    });

    return result;
  }, []);

  const calculateRoundDamage = useCallback(() => {
    setGameState((prev) => {
      const result = calculateDamage(
        prev.playerField,
        prev.opponentField,
        false,
        false
      );

      const newPlayerHP = Math.max(0, prev.playerHP - result.playerDamage);
      const newOpponentHP = Math.max(0, prev.opponentHP - result.opponentDamage);

      // Check for Gamma effect
      const opponentHasGamma = prev.opponentField.some(c => c?.special === "gamma");
      const playerHasGamma = prev.playerField.some(c => c?.special === "gamma");

      return {
        ...prev,
        playerHP: newPlayerHP,
        opponentHP: newOpponentHP,
        damageResult: result,
        phase: newPlayerHP <= 0 || newOpponentHP <= 0 ? "end" : "damage",
        opponentMust4Cards: playerHasGamma,
        playerMust4Cards: opponentHasGamma,
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setGameState((prev) => {
      if (prev.round >= 5 || prev.playerHP <= 0 || prev.opponentHP <= 0) {
        return { ...prev, phase: "end" };
      }

      // Keep unused cards in hand + deal 6 new cards
      const { dealt: playerCards, remaining: playerRemaining } = dealCards(prev.playerDeck, 6);
      const { dealt: opponentCards, remaining: opponentRemaining } = dealCards(prev.opponentDeck, 6);

      return {
        ...prev,
        round: prev.round + 1,
        playerDeck: playerRemaining,
        opponentDeck: opponentRemaining,
        playerHand: [...prev.playerHand, ...playerCards], // Persist unused cards
        opponentHand: [...prev.opponentHand, ...opponentCards],
        playerField: [null, null, null, null, null],
        opponentField: [null, null, null, null, null],
        phase: "placement",
        damageResult: null,
        // diceUsed remains unchanged (global counter)
      };
    });
  }, []);

  return {
    gameState,
    placeCard,
    removeCardFromField,
    endPlacement,
    rollDice,
    calculateRoundDamage,
    nextRound,
  };
}
