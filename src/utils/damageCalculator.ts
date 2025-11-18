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
    details.push(`⚡ Player consecutive bonus: ${playerConsecutive} damage to opponent`);
  }

  if (opponentConsecutive > 0) {
    playerDamage += opponentConsecutive;
    details.push(`⚡ Opponent consecutive bonus: ${opponentConsecutive} damage to player`);
  }

  // Symbol combo bonus (unblockable)
  const playerSymbol = calculateSymbolBonus(playerField);
  const opponentSymbol = calculateSymbolBonus(opponentField);

  if (playerSymbol > 0) {
    opponentDamage += playerSymbol;
    details.push(`🔥 Player symbol combo: ${playerSymbol} damage to opponent`);
  }

  if (opponentSymbol > 0) {
    playerDamage += opponentSymbol;
    details.push(`🔥 Opponent symbol combo: ${opponentSymbol} damage to player`);
  }

  // === SPECIAL CARD RESOLUTION ORDER ===
  // 1. Twisted (α) - Reflects damage
  // 2. Delta (Δ) - Index-based 2x
  // 3. Sigma (Σ) - Index-based 2x (opposite)
  // 4. Beta (β) / Deflate - Cancels opponent specials
  // 5. Gamma (γ) - No damage + 2x bonus

  const playerHasDeflateCard = playerField.some(c => c?.special === "deflate");
  const opponentHasDeflateCard = opponentField.some(c => c?.special === "deflate");

  // === 1. TWISTED (α) ===
  const playerHasTwisted = playerField.some(c => c?.special === "twisted" && !(opponentHasDeflate || opponentHasDeflateCard));
  const opponentHasTwisted = opponentField.some(c => c?.special === "twisted" && !(playerHasDeflate || playerHasDeflateCard));

  if (playerHasTwisted && playerTotal < opponentTotal) {
    const temp = playerDamage;
    playerDamage = opponentDamage;
    opponentDamage = temp;
    details.push("🌀 Player's Twisted (α) reflected damage!");
  }

  if (opponentHasTwisted && opponentTotal < playerTotal) {
    const temp = playerDamage;
    playerDamage = opponentDamage;
    opponentDamage = temp;
    details.push("🌀 Opponent's Twisted (α) reflected damage!");
  }

  // === 2. DELTA (Δ) ===
  const playerDeltaIndex = playerField.findIndex(c => c?.special === "delta");
  const opponentDeltaIndex = opponentField.findIndex(c => c?.special === "delta");

  if (playerDeltaIndex !== -1 && !(opponentHasDeflate || opponentHasDeflateCard)) {
    const nextCard = playerDeltaIndex < 4 ? playerField[playerDeltaIndex + 1] : null;
    const isTransformed = nextCard?.special === "twisted";
    
    // Calculate sum of cards before this index
    let playerSum = 0;
    let opponentSum = 0;
    for (let i = 0; i < playerDeltaIndex; i++) {
      playerSum += playerField[i]?.type === "numeric" ? (playerField[i]?.value || 0) : 0;
      opponentSum += opponentField[i]?.type === "numeric" ? (opponentField[i]?.value || 0) : 0;
    }
    
    if (isTransformed) {
      // Sigma behavior: if player lower, opponent takes 2x; if player higher, player takes 2x
      if (playerSum < opponentSum) {
        opponentDamage += (opponentSum - playerSum) * 2;
        details.push(`⚡ Player's Delta → Sigma transformation: Opponent takes ${(opponentSum - playerSum) * 2} damage`);
      } else if (playerSum > opponentSum) {
        playerDamage += (playerSum - opponentSum) * 2;
        details.push(`⚡ Player's Delta → Sigma transformation: Player takes ${(playerSum - opponentSum) * 2} damage`);
      }
    } else {
      // Normal Delta behavior: if opponent higher, opponent takes 2x; if player higher, player takes 2x
      if (opponentSum > playerSum) {
        opponentDamage += (opponentSum - playerSum) * 2;
        details.push(`⚡ Player's Delta (Δ): Opponent takes ${(opponentSum - playerSum) * 2} damage`);
      } else if (playerSum > opponentSum) {
        playerDamage += (playerSum - opponentSum) * 2;
        details.push(`⚡ Player's Delta (Δ): Player takes ${(playerSum - opponentSum) * 2} damage`);
      }
    }
  }

  if (opponentDeltaIndex !== -1 && !(playerHasDeflate || playerHasDeflateCard)) {
    const nextCard = opponentDeltaIndex < 4 ? opponentField[opponentDeltaIndex + 1] : null;
    const isTransformed = nextCard?.special === "twisted";
    
    // Calculate sum of cards before this index
    let playerSum = 0;
    let opponentSum = 0;
    for (let i = 0; i < opponentDeltaIndex; i++) {
      playerSum += playerField[i]?.type === "numeric" ? (playerField[i]?.value || 0) : 0;
      opponentSum += opponentField[i]?.type === "numeric" ? (opponentField[i]?.value || 0) : 0;
    }
    
    if (isTransformed) {
      // Sigma behavior
      if (opponentSum < playerSum) {
        playerDamage += (playerSum - opponentSum) * 2;
        details.push(`⚡ Opponent's Delta → Sigma transformation: Player takes ${(playerSum - opponentSum) * 2} damage`);
      } else if (opponentSum > playerSum) {
        opponentDamage += (opponentSum - playerSum) * 2;
        details.push(`⚡ Opponent's Delta → Sigma transformation: Opponent takes ${(opponentSum - playerSum) * 2} damage`);
      }
    } else {
      // Normal Delta behavior
      if (playerSum > opponentSum) {
        playerDamage += (playerSum - opponentSum) * 2;
        details.push(`⚡ Opponent's Delta (Δ): Player takes ${(playerSum - opponentSum) * 2} damage`);
      } else if (opponentSum > playerSum) {
        opponentDamage += (opponentSum - playerSum) * 2;
        details.push(`⚡ Opponent's Delta (Δ): Opponent takes ${(opponentSum - playerSum) * 2} damage`);
      }
    }
  }

  // === 3. SIGMA (Σ) ===
  const playerSigmaIndex = playerField.findIndex(c => c?.special === "sigma");
  const opponentSigmaIndex = opponentField.findIndex(c => c?.special === "sigma");

  if (playerSigmaIndex !== -1 && !(opponentHasDeflate || opponentHasDeflateCard)) {
    const nextCard = playerSigmaIndex < 4 ? playerField[playerSigmaIndex + 1] : null;
    const isTransformed = nextCard?.special === "twisted";
    
    // Calculate sum of cards before this index
    let playerSum = 0;
    let opponentSum = 0;
    for (let i = 0; i < playerSigmaIndex; i++) {
      playerSum += playerField[i]?.type === "numeric" ? (playerField[i]?.value || 0) : 0;
      opponentSum += opponentField[i]?.type === "numeric" ? (opponentField[i]?.value || 0) : 0;
    }
    
    if (isTransformed) {
      // Delta behavior
      if (opponentSum > playerSum) {
        opponentDamage += (opponentSum - playerSum) * 2;
        details.push(`⚡ Player's Sigma → Delta transformation: Opponent takes ${(opponentSum - playerSum) * 2} damage`);
      } else if (playerSum > opponentSum) {
        playerDamage += (playerSum - opponentSum) * 2;
        details.push(`⚡ Player's Sigma → Delta transformation: Player takes ${(playerSum - opponentSum) * 2} damage`);
      }
    } else {
      // Normal Sigma behavior: if player lower, opponent takes 2x; if player higher, player takes 2x
      if (playerSum < opponentSum) {
        opponentDamage += (opponentSum - playerSum) * 2;
        details.push(`⚡ Player's Sigma (Σ): Opponent takes ${(opponentSum - playerSum) * 2} damage`);
      } else if (playerSum > opponentSum) {
        playerDamage += (playerSum - opponentSum) * 2;
        details.push(`⚡ Player's Sigma (Σ): Player takes ${(playerSum - opponentSum) * 2} damage`);
      }
    }
  }

  if (opponentSigmaIndex !== -1 && !(playerHasDeflate || playerHasDeflateCard)) {
    const nextCard = opponentSigmaIndex < 4 ? opponentField[opponentSigmaIndex + 1] : null;
    const isTransformed = nextCard?.special === "twisted";
    
    // Calculate sum of cards before this index
    let playerSum = 0;
    let opponentSum = 0;
    for (let i = 0; i < opponentSigmaIndex; i++) {
      playerSum += playerField[i]?.type === "numeric" ? (playerField[i]?.value || 0) : 0;
      opponentSum += opponentField[i]?.type === "numeric" ? (opponentField[i]?.value || 0) : 0;
    }
    
    if (isTransformed) {
      // Delta behavior
      if (playerSum > opponentSum) {
        playerDamage += (playerSum - opponentSum) * 2;
        details.push(`⚡ Opponent's Sigma → Delta transformation: Player takes ${(playerSum - opponentSum) * 2} damage`);
      } else if (opponentSum > playerSum) {
        opponentDamage += (opponentSum - playerSum) * 2;
        details.push(`⚡ Opponent's Sigma → Delta transformation: Opponent takes ${(opponentSum - playerSum) * 2} damage`);
      }
    } else {
      // Normal Sigma behavior
      if (opponentSum < playerSum) {
        playerDamage += (playerSum - opponentSum) * 2;
        details.push(`⚡ Opponent's Sigma (Σ): Player takes ${(playerSum - opponentSum) * 2} damage`);
      } else if (playerSum > opponentSum) {
        opponentDamage += (opponentSum - playerSum) * 2;
        details.push(`⚡ Opponent's Sigma (Σ): Opponent takes ${(opponentSum - playerSum) * 2} damage`);
      }
    }
  }

  // === 4. DEFLATE (β) ===
  if (playerHasDeflate || playerHasDeflateCard) {
    details.push("🛡️ Player's Deflate (β) cancelled opponent's special cards!");
  }
  if (opponentHasDeflate || opponentHasDeflateCard) {
    details.push("🛡️ Opponent's Deflate (β) cancelled player's special cards!");
  }

  // === 5. GAMMA (γ) ===
  const playerHasGamma = playerField.some(c => c?.special === "gamma" && !(opponentHasDeflate || opponentHasDeflateCard));
  const opponentHasGamma = opponentField.some(c => c?.special === "gamma" && !(playerHasDeflate || playerHasDeflateCard));

  if (playerHasGamma) {
    playerDamage = 0;
    if (playerTotal > opponentTotal) {
      opponentDamage *= 2;
      details.push("🌟 Player's Gamma (γ): No damage taken, 2× damage dealt!");
    } else {
      details.push("🌟 Player's Gamma (γ): No damage taken!");
    }
  }

  if (opponentHasGamma) {
    opponentDamage = 0;
    if (opponentTotal > playerTotal) {
      playerDamage *= 2;
      details.push("🌟 Opponent's Gamma (γ): No damage taken, 2× damage dealt!");
    } else {
      details.push("🌟 Opponent's Gamma (γ): No damage taken!");
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
