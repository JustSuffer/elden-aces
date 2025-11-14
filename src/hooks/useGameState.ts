import { useState, useCallback } from "react";
import { Card, DECK, shuffleDeck, dealCards } from "@/data/cards";

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
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const shuffledDeck = shuffleDeck([...DECK]);
    const { dealt: playerCards, remaining: afterPlayer } = dealCards(shuffledDeck, 6);
    const { dealt: opponentCards, remaining: remaining } = dealCards(afterPlayer, 6);

    return {
      round: 1,
      playerHP: 30,
      opponentHP: 30,
      playerDeck: remaining,
      opponentDeck: remaining,
      playerHand: playerCards,
      opponentHand: opponentCards,
      playerField: [null, null, null, null, null],
      opponentField: [null, null, null, null, null],
      diceUsed: 0,
      phase: "placement",
      opponentMust4Cards: false,
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
    // Implement dice effects based on result
    // For now, just increment dice used
    setGameState((prev) => ({
      ...prev,
      diceUsed: prev.diceUsed + 1,
    }));

    return result;
  }, []);

  const nextRound = useCallback(() => {
    setGameState((prev) => {
      if (prev.round >= 5) {
        return { ...prev, phase: "end" };
      }

      // Deal new cards
      const { dealt: playerCards, remaining: afterPlayer } = dealCards(prev.playerDeck, 6);
      const { dealt: opponentCards, remaining: remaining } = dealCards(afterPlayer, 6);

      return {
        ...prev,
        round: prev.round + 1,
        playerDeck: remaining,
        opponentDeck: remaining,
        playerHand: playerCards,
        opponentHand: opponentCards,
        playerField: [null, null, null, null, null],
        opponentField: [null, null, null, null, null],
        phase: "placement",
      };
    });
  }, []);

  return {
    gameState,
    placeCard,
    removeCardFromField,
    endPlacement,
    rollDice,
    nextRound,
  };
}
