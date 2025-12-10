import { Card, ClassName, PlayerState } from "../types/game";
import { MASTER_CLASSES } from "../data/gameData";

/**
 * Calculates the numeric total of a set of cards.
 * Ignores special cards unless they have a value (rare).
 */
export function calculateNumericTotal(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + (card.value || 0), 0);
}

/**
 * Determines the Ability Scale effect based on the number of class cards played.
 * Returns the description and any numeric value associated with it.
 */
export function getAbilityScale(className: ClassName, playedCards: Card[]) {
  const classData = MASTER_CLASSES[className];
  if (!classData) return { description: "Unknown Class", value: 0 };

  const classSymbol = classData.symbol;
  // Count cards that match the class symbol
  const count = playedCards.filter((c) => c.symbol === classSymbol).length;

  // Find the scale definition for this count (or max if over 5, though max is usually 5)
  // We clamp to 5 as per rules usually, but let's check exact match first
  // The rules say "1'den 5'e kadar".
  const validCount = Math.max(1, Math.min(5, count));
  
  const scale = classData.abilityScales.find((s) => s.count === validCount);
  
  return scale || { description: "No Effect", value: 0 };
}

/**
 * Resolves the special interaction rules for counters.
 * Returns true if a specific win condition is met based on the matchup.
 */
export function checkCounterWinCondition(
  player: PlayerState, 
  opponent: PlayerState, 
  round: number
): boolean | undefined {
  const pClass = player.className;
  const oClass = opponent.className;

  // Vitalist vs Slayer
  if (pClass === "Vitalist" && oClass === "Slayer") {
    // Vitalist wins if HP < Slayer (Normal wincon is reversed)
    // This is checked at Round 6 usually, but let's see if we return 'true' for instant win
    // The rule says "Vitalist kazanmak için Slayer'dan DAHA AZ canda kalmalıdır".
    // This is likely an end-of-game check.
    if (round === 6 && player.hp < opponent.hp) return true;
  }
  
  // Slayer vs Vitalist
  if (pClass === "Slayer" && oClass === "Vitalist") {
    // Slayer wins if HP > Vitalist (to counter the Vitalist's counter)
    if (round === 6 && player.hp > opponent.hp) return true;
  }

  // Chronokeeper vs Vitalist
  if (pClass === "Chronokeeper" && oClass === "Vitalist") {
    // Instant Win: 5 card flush
    const chronCards = player.playedCardsInRound.filter(c => c.symbol === MASTER_CLASSES.Chronokeeper.symbol).length;
    if (chronCards === 5) return true;
  }

  // Fateweaver WinCon
  if (pClass === "Fateweaver") {
    const gammas = player.playedCardsInRound.filter(c => c.specialType === "gamma").length;
    if (gammas === 5) return true;
  }
  
  // Slayer Instant Win
  if (pClass === "Slayer") {
    const totalDamage = calculateNumericTotal(player.playedCardsInRound); // Base numeric damage? 
    // Wait, Slayer ability deals damage.
    const scale = getAbilityScale("Slayer", player.playedCardsInRound);
    if ((scale.value || 0) >= 12) return true;
  }

  // Siren WinCon
  if (pClass === "Siren") {
      // Logic for checking "stolen" cards would be needed here. 
      // Assuming we tag cards with 'originalOwner'
      const stolenCount = player.playedCardsInRound.filter(c => c.originalOwner && c.originalOwner !== player.id).length;
      if (stolenCount === 5) return true;
  }

  // Augmentor WinCon
  if (pClass === "Augmentor") {
      const hasNine = player.playedCardsInRound.some(c => c.symbol === MASTER_CLASSES.Augmentor.symbol && c.value === 9);
      if (hasNine) return true;
  }

  // Conjurer WinCon
  if (pClass === "Conjurer") {
      const hasSigma = player.playedCardsInRound.some(c => c.specialType === "sigma");
      const hasDelta = player.playedCardsInRound.some(c => c.specialType === "delta");
      if (hasSigma && hasDelta) return true;
  }

  return undefined; // No instant win detected
}


export interface GameSideEffects {
  p1FreezeCount?: number;
  p2FreezeCount?: number;
  p1BurnCount?: number;
  p2BurnCount?: number;
  p1StealCount?: number;
  p2StealCount?: number;
  p1DrawCount?: number;
  p2DrawCount?: number;
  p1RoundsSkip?: number;
  p2RoundsSkip?: number;
  // Augmentor
  p1ValueBuff?: number;
  p2ValueBuff?: number;
  p1SetMax?: boolean;
  p2SetMax?: boolean;
}

interface DamageResult {
  p1DamageTaken: number;
  p2DamageTaken: number;
  logs: string[];
  sideEffects: GameSideEffects;
}


/**
 * Resolves the entire round logic including special cards.
 */
export function resolveGameRound(
  p1Cards: Card[], 
  p2Cards: Card[], 
  p1Class: ClassName, 
  p2Class: ClassName
): DamageResult {
  const logs: string[] = [];
  
  // 1. Check for Deflate (Beta)
  // Deflate cancels OPPONENT'S special cards.
  const p1HasDeflate = p1Cards.some(c => c.specialType === "deflate");
  const p2HasDeflate = p2Cards.some(c => c.specialType === "deflate");

  if (p1HasDeflate) logs.push(`Player 1's Deflate nullified Player 2's specials.`);
  if (p2HasDeflate) logs.push(`Player 2's Deflate nullified Player 1's specials.`);

  // 2. Base Ability Damage / Healing & Side Effects
  // Calculate Class Scale Effects
  const p1Scale = getAbilityScale(p1Class, p1Cards);
  const p2Scale = getAbilityScale(p2Class, p2Cards);

  const effects: GameSideEffects = {};

  let p1BaseDamage = 0; // Damage P1 deals to P2
  let p2BaseDamage = 0; // Damage P2 deals to P1

  const processClassEffect = (
      className: ClassName, 
      scaleValue: number, 
      isP1: boolean
  ) => {
      // Direct Damage Classes
      if (className === "Slayer") {
          if (isP1) p1BaseDamage += scaleValue;
          else p2BaseDamage += scaleValue;
      }
      if (className === "Oracle") {
          // Oracle: Recieves value as damage AND draw count?
          // Master Data says: "2 Dmg / Draw 2". Value 2.
          if (isP1) { p1BaseDamage += scaleValue; effects.p1DrawCount = scaleValue; }
          else { p2BaseDamage += scaleValue; effects.p2DrawCount = scaleValue; }
      }
      
      // Healing / Self-Buff
      if (className === "Vitalist") {
         // Healing handled as negative damage
         // No side effect needed here, just HP math later
      }

      // Control / Debuff
      if (className === "Cryomancer") {
          // Scale desc: "Freeze 2", "Freeze All".
          // We need to know HOW MANY to freeze.
          // Let's assume scale logic returned roughly the number? 
          // Master Data doesn't have 'value' for all. We need to check descriptions or specific counts.
          // Let's rely on played count for specifics here as scale value might be 0.
          // Or we update Master Data to have values?
          // Assuming count 1-5.
          // 2->2 cards. 3->3 cards. 5->All (5).
          const count = getCardCount(className, isP1 ? p1Cards : p2Cards);
          let freeze = 0;
          if (count === 2) freeze = 2;
          if (count === 3) freeze = 3; 
          if (count === 4) freeze = 4;
          if (count === 5) freeze = 5;
          
          if (isP1) effects.p2FreezeCount = freeze; // P1 freezes P2
          else effects.p1FreezeCount = freeze;
      }

      if (className === "Incinerator") {
          const count = getCardCount(className, isP1 ? p1Cards : p2Cards);
          let burn = 0;
          if (count === 2) burn = 3;
          if (count === 3) burn = 4;
          if (count === 4) burn = 5;
          if (count === 5) burn = 8;
          
          if (isP1) effects.p2BurnCount = burn;
          else effects.p1BurnCount = burn;
      }
      
      if (className === "Siren") {
          // Stealing cards.
          const count = getCardCount(className, isP1 ? p1Cards : p2Cards);
          if (isP1) effects.p1StealCount = count;
          else effects.p2StealCount = count;
      }

      if (className === "Chronokeeper") {
          // Deleting Rounds
          const count = getCardCount(className, isP1 ? p1Cards : p2Cards);
          let skip = 0;
          if (count === 3) skip = 1;
          if (count === 4) skip = 2;
          if (count === 5) skip = 3;

          if (isP1) effects.p1RoundsSkip = skip; // Affects GLOBAL round counter? Or opponent? "0 Round siler" -> Round counter adjustment.
          else effects.p2RoundsSkip = skip;
      }

      if (className === "Augmentor") {
          const count = getCardCount(className, isP1 ? p1Cards : p2Cards);
          if (count === 5) {
             if (isP1) effects.p1SetMax = true;
             else effects.p2SetMax = true;
          } else if (count >= 2) {
             // +1, +2, +3
             if (isP1) effects.p1ValueBuff = count - 1; 
             else effects.p2ValueBuff = count - 1;
          }
      }
      
      // Fateweaver
      if (className === "Fateweaver") {
          const count = getCardCount(className, isP1 ? p1Cards : p2Cards);
          if (count === 2) { /* +2 Dice Rolls - Handle in hook? */ }
          if (count === 5) { /* +Gamma - Handle in hook */ }
      }
  };

  processClassEffect(p1Class, p1Scale.value || 0, true);
  processClassEffect(p2Class, p2Scale.value || 0, false);

  // Vitalist Healing handled as negative damage
  let p1NetChange = 0; // Positive = Damage Taken
  let p2NetChange = 0;

  if (p1Class === "Vitalist") p1NetChange -= (p1Scale.value || 0);
  if (p2Class === "Vitalist") p2NetChange -= (p2Scale.value || 0);


  // 3. Numeric Totals (for Delta/Sigma comparisons)
  const p1Numeric = calculateNumericTotal(p1Cards);
  const p2Numeric = calculateNumericTotal(p2Cards);

  // 4. Delta / Sigma Logic
  const processAmplifiers = (cards: Card[], isP1: boolean, opponentGenericCards: Card[], opponentHasDeflate: boolean) => {
    if (opponentHasDeflate) return; 

    cards.forEach((card, index) => {
      let type = card.specialType;
      if (type !== "delta" && type !== "sigma") return;

      // Transformation check
      const nextCard = cards[index + 1];
      if (nextCard && nextCard.specialType === "twisted") {
        type = type === "delta" ? "sigma" : "delta"; 
        logs.push(`Item at ${index} transformed to ${type} due to Twisted neighbour.`);
      }

      const mySum = calculateNumericTotal(cards.slice(0, index));
      const oppSum = calculateNumericTotal(opponentGenericCards.slice(0, index));
      
      const diff = Math.abs(mySum - oppSum);
      
      if (type === "delta") {
        if (oppSum > mySum) {
           if (isP1) { p2NetChange += 2 * diff; logs.push(`P1 Delta triggered: P2 takes ${2*diff}`); }
           else { p1NetChange += 2 * diff; logs.push(`P2 Delta triggered: P1 takes ${2*diff}`); }
        } else if (mySum > oppSum) {
           if (isP1) { p1NetChange += 2 * diff; logs.push(`P1 Delta backfired: P1 takes ${2*diff}`); }
           else { p2NetChange += 2 * diff; logs.push(`P2 Delta backfired: P2 takes ${2*diff}`); }
        }
      } else if (type === "sigma") {
        if (mySum < oppSum) {
           if (isP1) { p2NetChange += 2 * diff; logs.push(`P1 Sigma triggered: P2 takes ${2*diff}`); }
           else { p1NetChange += 2 * diff; logs.push(`P2 Sigma triggered: P1 takes ${2*diff}`); }
        } else if (mySum > oppSum) {
           if (isP1) { p1NetChange += 2 * diff; logs.push(`P1 Sigma backfired: P1 takes ${2*diff}`); }
           else { p2NetChange += 2 * diff; logs.push(`P2 Sigma backfired: P2 takes ${2*diff}`); }
        }
      }
    });
  };

  processAmplifiers(p1Cards, true, p2Cards, p2HasDeflate);
  processAmplifiers(p2Cards, false, p1Cards, p1HasDeflate);

  // 5. Add Base Damage
  p1NetChange += p2BaseDamage;
  p2NetChange += p1BaseDamage;

  // 6. Twisted (Alpha) Reflection
  const p1HasTwisted = !p2HasDeflate && p1Cards.some(c => c.specialType === "twisted");
  const p2HasTwisted = !p1HasDeflate && p2Cards.some(c => c.specialType === "twisted");

  const p1IsSlayer = p1Class === "Slayer";
  const p2IsSlayer = p2Class === "Slayer";

  if (p1HasTwisted && p1Numeric < p2Numeric) {
    if (p2IsSlayer) {
      logs.push("P1 tried to reflect with Twisted, but P2 is Slayer (Immune).");
    } else {
      if (p1NetChange > 0) { 
        p2NetChange += p1NetChange;
        logs.push(`P1 Twisted reflected ${p1NetChange} damage to P2.`);
        p1NetChange = 0; 
      }
    }
  }

  if (p2HasTwisted && p2Numeric < p1Numeric) {
     if (p1IsSlayer) {
       logs.push("P2 tried to reflect with Twisted, but P1 is Slayer (Immune).");
     } else {
       if (p2NetChange > 0) {
         p1NetChange += p2NetChange;
         logs.push(`P2 Twisted reflected ${p2NetChange} damage to P1.`);
         p2NetChange = 0;
       }
     }
  }

  return {
    p1DamageTaken: p1NetChange,
    p2DamageTaken: p2NetChange,
    logs,
    sideEffects: effects
  };
}

function getCardCount(className: ClassName, cards: Card[]): number {
    const symbol = MASTER_CLASSES[className].symbol;
    return cards.filter(c => c.symbol === symbol).length;
}
