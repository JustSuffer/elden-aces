import { Card } from "@/data/cards";

export interface DamageResult {
  playerDamage: number;
  opponentDamage: number;
  consecutiveBonus: number;
  symbolBonus: number;
  details: string[];
}

export function calculateDamage(
  playerField: (Card | null)[],
  opponentField: (Card | null)[],
  playerHasDeflate: boolean,
  opponentHasDeflate: boolean
): DamageResult {
  let playerDamage = 0;
  let opponentDamage = 0;
  const details: string[] = [];

  // Calculate base damage from each slot
  let playerTotal = 0;
  let opponentTotal = 0;

  for (let i = 0; i < 5; i++) {
    const playerCard = playerField[i];
    const opponentCard = opponentField[i];

    const playerValue = playerCard?.type === "numeric" ? (playerCard.value || 0) : 0;
    const opponentValue = opponentCard?.type === "numeric" ? (opponentCard.value || 0) : 0;

    playerTotal += playerValue;
    opponentTotal += opponentValue;
  }

  const baseDiff = Math.abs(playerTotal - opponentTotal);
  if (playerTotal > opponentTotal) {
    opponentDamage += baseDiff;
    details.push(`Base damage: ${baseDiff} to opponent (${playerTotal} vs ${opponentTotal})`);
  } else if (opponentTotal > playerTotal) {
    playerDamage += baseDiff;
    details.push(`Base damage: ${baseDiff} to player (${opponentTotal} vs ${playerTotal})`);
  } else {
    details.push(`No base damage (tie: ${playerTotal})`);
  }

  // Consecutive number bonus (unblockable)
  const playerConsecutive = calculateConsecutiveBonus(playerField);
  const opponentConsecutive = calculateConsecutiveBonus(opponentField);

  if (playerConsecutive > 0) {
    opponentDamage += playerConsecutive;
    details.push(`Player consecutive bonus: ${playerConsecutive} damage to opponent`);
  }

  if (opponentConsecutive > 0) {
    playerDamage += opponentConsecutive;
    details.push(`Opponent consecutive bonus: ${opponentConsecutive} damage to player`);
  }

  // Symbol combo bonus (unblockable)
  const playerSymbol = calculateSymbolBonus(playerField);
  const opponentSymbol = calculateSymbolBonus(opponentField);

  if (playerSymbol > 0) {
    opponentDamage += playerSymbol;
    details.push(`Player symbol combo: ${playerSymbol} damage to opponent`);
  }

  if (opponentSymbol > 0) {
    playerDamage += opponentSymbol;
    details.push(`Opponent symbol combo: ${opponentSymbol} damage to player`);
  }

  // Apply special card effects
  const playerSpecials = playerField.filter((c) => c?.type === "special").map((c) => c!.special!);
  const opponentSpecials = opponentField.filter((c) => c?.type === "special").map((c) => c!.special!);

  // Deflate cancels all opponent specials
  if (playerHasDeflate || playerSpecials.includes("deflate")) {
    details.push("Player's Deflate cancels all opponent special cards!");
    opponentSpecials.length = 0;
  }

  if (opponentHasDeflate || opponentSpecials.includes("deflate")) {
    details.push("Opponent's Deflate cancels all player special cards!");
    playerSpecials.length = 0;
  }

  // Twisted - reverse damage if opponent total is higher
  if (playerSpecials.includes("twisted") && opponentTotal > playerTotal) {
    const temp = playerDamage;
    playerDamage = opponentDamage;
    opponentDamage = temp;
    details.push("Player's Twisted reversed the damage!");
  }

  if (opponentSpecials.includes("twisted") && playerTotal > opponentTotal) {
    const temp = playerDamage;
    playerDamage = opponentDamage;
    opponentDamage = temp;
    details.push("Opponent's Twisted reversed the damage!");
  }

  // Delta - 2x damage
  if (playerSpecials.includes("delta")) {
    opponentDamage *= 2;
    details.push("Player's Delta doubled the damage!");
  }

  if (opponentSpecials.includes("delta")) {
    playerDamage *= 2;
    details.push("Opponent's Delta doubled the damage!");
  }

  // Sigma - reverse of delta (halve damage)
  if (playerSpecials.includes("sigma")) {
    playerDamage = Math.floor(playerDamage / 2);
    details.push("Player's Sigma halved the damage taken!");
  }

  if (opponentSpecials.includes("sigma")) {
    opponentDamage = Math.floor(opponentDamage / 2);
    details.push("Opponent's Sigma halved the damage taken!");
  }

  // Gamma - no damage taken, 2x damage dealt
  if (playerSpecials.includes("gamma")) {
    playerDamage = 0;
    opponentDamage *= 2;
    details.push("Player's Gamma: no damage taken, 2x damage dealt!");
  }

  if (opponentSpecials.includes("gamma")) {
    opponentDamage = 0;
    playerDamage *= 2;
    details.push("Opponent's Gamma: no damage taken, 2x damage dealt!");
  }

  return {
    playerDamage,
    opponentDamage,
    consecutiveBonus: playerConsecutive + opponentConsecutive,
    symbolBonus: playerSymbol + opponentSymbol,
    details,
  };
}

function calculateConsecutiveBonus(field: (Card | null)[]): number {
  const values = field
    .filter((c) => c?.type === "numeric" && c.value)
    .map((c) => c!.value!)
    .sort((a, b) => a - b);

  if (values.length === 0) return 0;

  let maxConsecutive = 1;
  let currentConsecutive = 1;

  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1] + 1) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else if (values[i] !== values[i - 1]) {
      currentConsecutive = 1;
    }
  }

  return maxConsecutive >= 3 ? maxConsecutive : 0;
}

function calculateSymbolBonus(field: (Card | null)[]): number {
  const symbols: { [key: string]: number } = {};

  field.forEach((card) => {
    if (card?.type === "numeric" && card.symbol) {
      symbols[card.symbol] = (symbols[card.symbol] || 0) + 1;
    }
  });

  const maxSymbolCount = Math.max(...Object.values(symbols), 0);
  return maxSymbolCount >= 3 ? maxSymbolCount : 0;
}
