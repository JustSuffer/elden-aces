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

  // Apply special card effects in order
  let playerSpecials = playerField.map((c, idx) => ({ card: c, idx })).filter((item) => item.card?.type === "special");
  let opponentSpecials = opponentField.map((c, idx) => ({ card: c, idx })).filter((item) => item.card?.type === "special");

  // 1. Deflate cancels all opponent specials
  const playerHasDeflateCard = playerSpecials.some(s => s.card?.special === "deflate");
  const opponentHasDeflateCard = opponentSpecials.some(s => s.card?.special === "deflate");

  if (playerHasDeflate || playerHasDeflateCard) {
    details.push("Player's Deflate β cancels all opponent special cards!");
    opponentSpecials = [];
  }

  if (opponentHasDeflate || opponentHasDeflateCard) {
    details.push("Opponent's Deflate β cancels all player special cards!");
    playerSpecials = [];
  }

  // 2. Gamma - no damage taken, 2x damage dealt
  const playerGamma = playerSpecials.find(s => s.card?.special === "gamma");
  const opponentGamma = opponentSpecials.find(s => s.card?.special === "gamma");

  if (playerGamma) {
    playerDamage = 0;
    if (playerTotal > opponentTotal) {
      opponentDamage *= 2;
      details.push("Player's Gamma γ: no damage taken, 2x damage dealt!");
    } else {
      details.push("Player's Gamma γ: no damage taken!");
    }
  }

  if (opponentGamma) {
    opponentDamage = 0;
    if (opponentTotal > playerTotal) {
      playerDamage *= 2;
      details.push("Opponent's Gamma γ: no damage taken, 2x damage dealt!");
    } else {
      details.push("Opponent's Gamma γ: no damage taken!");
    }
  }

  // 3. Twisted - reverse damage if your total < opponent total
  const playerTwisted = playerSpecials.find(s => s.card?.special === "twisted");
  const opponentTwisted = opponentSpecials.find(s => s.card?.special === "twisted");

  if (playerTwisted && playerTotal < opponentTotal) {
    const temp = playerDamage;
    playerDamage = opponentDamage;
    opponentDamage = temp;
    details.push("Player's Twisted α reversed the damage!");
  }

  if (opponentTwisted && opponentTotal < playerTotal) {
    const temp = playerDamage;
    playerDamage = opponentDamage;
    opponentDamage = temp;
    details.push("Opponent's Twisted α reversed the damage!");
  }

  // 4. Delta - based on index position, checks previous cards
  const playerDelta = playerSpecials.find(s => s.card?.special === "delta");
  const opponentDelta = opponentSpecials.find(s => s.card?.special === "delta");

  if (playerDelta) {
    const deltaIdx = playerDelta.idx;
    const nextCard = playerField[deltaIdx + 1];
    
    // Check if next card is Twisted - transform to Sigma
    if (nextCard?.special === "twisted") {
      details.push("Player's Delta Δ + Twisted α = Sigma Σ transformation!");
      // Apply Sigma effect instead
      if (playerTotal > opponentTotal) {
        playerDamage *= 2;
        details.push("Player's Sigma Σ: You are higher, 2x damage to you!");
      }
    } else {
      // Normal Delta: check cards before this index
      let playerSum = 0;
      let opponentSum = 0;
      for (let i = 0; i < deltaIdx; i++) {
        playerSum += playerField[i]?.type === "numeric" ? (playerField[i]?.value || 0) : 0;
        opponentSum += opponentField[i]?.type === "numeric" ? (opponentField[i]?.value || 0) : 0;
      }
      
      if (opponentSum > playerSum) {
        const diff = opponentSum - playerSum;
        opponentDamage += diff * 2;
        details.push(`Player's Delta Δ: Opponent higher in first ${deltaIdx} cards, +${diff * 2} damage to opponent!`);
      } else if (playerSum > opponentSum) {
        const diff = playerSum - opponentSum;
        playerDamage += diff * 2;
        details.push(`Player's Delta Δ: You higher in first ${deltaIdx} cards, +${diff * 2} damage to you!`);
      }
    }
  }

  if (opponentDelta) {
    const deltaIdx = opponentDelta.idx;
    const nextCard = opponentField[deltaIdx + 1];
    
    if (nextCard?.special === "twisted") {
      details.push("Opponent's Delta Δ + Twisted α = Sigma Σ transformation!");
      if (opponentTotal > playerTotal) {
        opponentDamage *= 2;
        details.push("Opponent's Sigma Σ: Opponent higher, 2x damage to opponent!");
      }
    } else {
      let playerSum = 0;
      let opponentSum = 0;
      for (let i = 0; i < deltaIdx; i++) {
        playerSum += playerField[i]?.type === "numeric" ? (playerField[i]?.value || 0) : 0;
        opponentSum += opponentField[i]?.type === "numeric" ? (opponentField[i]?.value || 0) : 0;
      }
      
      if (playerSum > opponentSum) {
        const diff = playerSum - opponentSum;
        playerDamage += diff * 2;
        details.push(`Opponent's Delta Δ: Player higher in first ${deltaIdx} cards, +${diff * 2} damage to player!`);
      } else if (opponentSum > playerSum) {
        const diff = opponentSum - playerSum;
        opponentDamage += diff * 2;
        details.push(`Opponent's Delta Δ: Opponent higher in first ${deltaIdx} cards, +${diff * 2} damage to opponent!`);
      }
    }
  }

  // 5. Sigma - opposite of Delta
  const playerSigma = playerSpecials.find(s => s.card?.special === "sigma");
  const opponentSigma = opponentSpecials.find(s => s.card?.special === "sigma");

  if (playerSigma) {
    const sigmaIdx = playerSigma.idx;
    const nextCard = playerField[sigmaIdx + 1];
    
    if (nextCard?.special === "twisted") {
      details.push("Player's Sigma Σ + Twisted α = Delta Δ transformation!");
      // Apply Delta effect instead (already handled above logic)
    } else {
      if (playerTotal < opponentTotal) {
        const diff = opponentTotal - playerTotal;
        opponentDamage += diff * 2;
        details.push(`Player's Sigma Σ: You lower, +${diff * 2} damage to opponent!`);
      } else if (playerTotal > opponentTotal) {
        const diff = playerTotal - opponentTotal;
        playerDamage += diff * 2;
        details.push(`Player's Sigma Σ: You higher, +${diff * 2} damage to you!`);
      }
    }
  }

  if (opponentSigma) {
    const sigmaIdx = opponentSigma.idx;
    const nextCard = opponentField[sigmaIdx + 1];
    
    if (nextCard?.special === "twisted") {
      details.push("Opponent's Sigma Σ + Twisted α = Delta Δ transformation!");
    } else {
      if (opponentTotal < playerTotal) {
        const diff = playerTotal - opponentTotal;
        playerDamage += diff * 2;
        details.push(`Opponent's Sigma Σ: Opponent lower, +${diff * 2} damage to player!`);
      } else if (opponentTotal > playerTotal) {
        const diff = opponentTotal - playerTotal;
        opponentDamage += diff * 2;
        details.push(`Opponent's Sigma Σ: Opponent higher, +${diff * 2} damage to opponent!`);
      }
    }
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
