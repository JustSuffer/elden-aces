import { Card, ClassName, PlayerState } from "../types/game";
import { MASTER_CLASSES } from "../data/gameData";

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

export interface ClassAbilityResult {
  hpChange: number;
  logs: string[];
}

interface DamageResult {
  p1DamageTaken: number;
  p2DamageTaken: number;
  p1TrueDamage: number;
  p2TrueDamage: number;
  logs: string[];
  sideEffects: GameSideEffects;
  abilityResults: { p1: ClassAbilityResult, p2: ClassAbilityResult };
}

/**
 * Calculates the numeric total of a set of cards (Step 2).
 */
export function calculateNumericTotal(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + (card.value || 0), 0);
}

/**
 * Step 3: Check for Numeric Combinations (Straight/Kind)
 * Returns the bonus damage value.
 */
function calculateNumericCombinationBonus(cards: Card[]): number {
  const numericValues = cards
    .filter(c => c.value && c.value > 0)
    .map(c => c.value!)
    .sort((a, b) => a - b);

  if (numericValues.length < 3) return 0;

  // Check unique values for Straight (to avoid duplicates like 1-1-2-3 counting as straight)
  const uniqueValues = Array.from(new Set(numericValues)).sort((a, b) => a - b);
  
  // Straight Check (e.g., 1-2-3)
  let straightLength = 1;
  let maxStraight = 1;
  for (let i = 0; i < uniqueValues.length - 1; i++) {
    if (uniqueValues[i+1] === uniqueValues[i] + 1) {
      straightLength++;
    } else {
      maxStraight = Math.max(maxStraight, straightLength);
      straightLength = 1;
    }
  }
  maxStraight = Math.max(maxStraight, straightLength);

  // Kind Check (e.g., 5-5-5)
  const counts: Record<number, number> = {};
  let maxKind = 1;
  numericValues.forEach(v => {
    counts[v] = (counts[v] || 0) + 1;
    maxKind = Math.max(maxKind, counts[v]);
  });

  // Priority: Straight or Kind > 3?
  // "Hasar = Kart Sayısı"
  if (maxStraight >= 3) return maxStraight; // e.g. 1-2-3 -> 3 Damage
  if (maxKind >= 3) return maxKind; // e.g. 5-5-5 -> 3 Damage

  return 0;
}

/**
 * Step 4: True Damage based on Class Synergy
 */
function calculateClassSynergyTrueDamage(cards: Card[], playerClass: ClassName): number {
  const classSymbol = MASTER_CLASSES[playerClass].symbol;
  // Count cards that match the playing class OR generic class cards if the user class matches??
  // Rule: "Oyuncunun seçtiği sınıftan bağımsız olarak, yerdeki kartların 'Sınıf Türleri' sayılır."
  // Wait, does it mean if I play 4 Vitalist cards (even if I am Slayer), I deal 4 True Damage?
  // "Count(Same_Class_Cards) -> Örn: 4 tane Vitalist kartı varsa, rakibe 4 True Damage vurulur."
  // This implies we sum up counts of ANY class flush? 
  // Or relative to the PLAYER'S class?
  // Usually synergy implies player's class. Let's assume SAME CLASS as the card itself.
  // But wait, "Sınıf fark etmeksizin kartların sayısal dizilimi" was step 3.
  // Step 4 Says: "Oyuncunun seçtiği sınıftan bağımsız olarak, yerdeki kartların Sınıf Türleri sayılır."
  // Example "4 tane Vitalist kartı varsa".
  // Let's count the MAX occuring class symbol in the played hand.
  
  const symbolCounts: Record<string, number> = {};
  let maxSynergy = 0;

  cards.forEach(c => {
    if (c.symbol && c.symbol.length === 1 && isNaN(Number(c.symbol))) { // Heuristic for class symbols like Φ, Ω
      symbolCounts[c.symbol] = (symbolCounts[c.symbol] || 0) + 1;
      maxSynergy = Math.max(maxSynergy, symbolCounts[c.symbol]);
    } else if (c.classSymbol) { // Numeric cards might have classSymbol
      symbolCounts[c.classSymbol] = (symbolCounts[c.classSymbol] || 0) + 1;
      maxSynergy = Math.max(maxSynergy, symbolCounts[c.classSymbol]);
    }
  });

  // Is there a threshold? Rule example says "4 cards -> 4 damage".
  // Let's assume threshold is 0? No, usually synergy starts at 2 or 3. 
  // Let's return the Raw Max Count.
  return maxSynergy;
}

/**
 * Step 5: Class Ability Trigger
 */
function getAbilityScale(className: ClassName, playedCards: Card[]) {
  const classData = MASTER_CLASSES[className];
  if (!classData) return { description: "Unknown Class", value: 0 };

  const classSymbol = classData.symbol;
  const count = playedCards.filter((c) => c.symbol === classSymbol || c.classSymbol === classSymbol).length;
  const validCount = Math.max(1, Math.min(5, count));
  const scale = classData.abilityScales.find((s) => s.count === validCount);
  return { scale: scale || { description: "No Effect", value: 0 }, count: validCount };
}

/**
 * Step 5 Implementation: Executing Side Effects based on Scale
 */
function applyStep5Abilities(
  p1Class: ClassName, p1Cards: Card[], 
  p2Class: ClassName, p2Cards: Card[],
  effects: GameSideEffects,
  p1Scale: any, p2Scale: any
): { p1ExtraDmg: number, p2ExtraDmg: number, p1AbilityRes: ClassAbilityResult, p2AbilityRes: ClassAbilityResult } {
  
  const p1Res: ClassAbilityResult = { hpChange: 0, logs: [] };
  const p2Res: ClassAbilityResult = { hpChange: 0, logs: [] };
  let p1ExtraDmg = 0;
  let p2ExtraDmg = 0;

  const process = (isP1: boolean, className: ClassName, scaleVal: number, count: number, res: ClassAbilityResult) => {
    const targetEffects = effects; // shared ref
    
    // Vitalist (Healing)
    if (className === "Vitalist") {
      if (scaleVal > 0) {
        res.hpChange = scaleVal;
        res.logs.push(`Vitalist healed for ${scaleVal} HP.`);
      }
    }
    // Slayer (Damage) 
    else if (className === "Slayer") {
      if (isP1) p1ExtraDmg += scaleVal;
      else p2ExtraDmg += scaleVal;
    }
    // Oracle (Dmg/Draw)
    else if (className === "Oracle") {
      if (isP1) { p1ExtraDmg += scaleVal; targetEffects.p1DrawCount = scaleVal; } // "Draw X" logic needed in hook? Usually handled by "Draw X" text. 
      else { p2ExtraDmg += scaleVal; targetEffects.p2DrawCount = scaleVal; }
      // Assuming 'value' in data equals Draw count too roughly, or specific logic needed.
      // Data says "10 Dmg + 5 Draw" for 5. Value is 10.
      if (count === 5 && className === "Oracle") {
         if(isP1) targetEffects.p1DrawCount = 5; else targetEffects.p2DrawCount = 5;
      } else {
         if(isP1) targetEffects.p1DrawCount = count; else targetEffects.p2DrawCount = count; // Roughly
      }
    }
    // Cryomancer (Freeze)
    else if (className === "Cryomancer") {
      let freeze = 0;
      if (count === 2) freeze = 2;
      if (count === 3) freeze = 3; 
      if (count === 4) freeze = 4;
      if (count === 5) freeze = 99; // ALL
      
      if (isP1) targetEffects.p2FreezeCount = freeze;
      else targetEffects.p1FreezeCount = freeze;
    }
    // Incinerator (Burn)
    else if (className === "Incinerator") {
      let burn = 0;
      if (count === 2) burn = 3;
      if (count === 3) burn = 4;
      if (count === 4) burn = 5;
      if (count === 5) burn = 8;
      
      if (isP1) targetEffects.p2BurnCount = burn;
      else targetEffects.p1BurnCount = burn;
    }
    // Siren (Steal)
    else if (className === "Siren") {
      if (isP1) targetEffects.p1StealCount = scaleVal || count; // Logic says "2 Çal", Value is 0 in data probably
      else targetEffects.p2StealCount = scaleVal || count; 
      // Manual mapping from text to count
      if(count === 2) { if(isP1) targetEffects.p1StealCount = 2; else targetEffects.p2StealCount = 2; }
      if(count === 3) { if(isP1) targetEffects.p1StealCount = 3; else targetEffects.p2StealCount = 3; }
      if(count === 4) { if(isP1) targetEffects.p1StealCount = 4; else targetEffects.p2StealCount = 4; }
      if(count === 5) { if(isP1) targetEffects.p1StealCount = 5; else targetEffects.p2StealCount = 5; }
    }
    // Augmentor
    else if (className === "Augmentor") {
      if (count === 5) {
         if (isP1) targetEffects.p1SetMax = true;
         else targetEffects.p2SetMax = true;
      } else if (count >= 2) {
         if (isP1) targetEffects.p1ValueBuff = count - 1; 
         else targetEffects.p2ValueBuff = count - 1;
      }
    }
    // Chronokeeper
    else if (className === "Chronokeeper") {
      let skip = 0;
      if (count === 3) skip = 1;
      if (count === 4) skip = 2;
      if (count === 5) skip = 3;
      if (isP1) targetEffects.p1RoundsSkip = skip;
      else targetEffects.p2RoundsSkip = skip;
    }
    
    // Fateweaver (Rolls - Handled in Hook mostly, but we can flag)
    // Conjurer (Summons - Handled in Hook)
    // Mimic (Copy - Handled in Hook/Logic special case)
  };

  process(true, p1Class, p1Scale.scale.value || 0, p1Scale.count, p1Res);
  process(false, p2Class, p2Scale.scale.value || 0, p2Scale.count, p2Res);

  return { p1ExtraDmg, p2ExtraDmg, p1AbilityRes: p1Res, p2AbilityRes: p2Res };
}

/**
 * ---------------------------------------------------------
 * CORE LOGIC: 5-STEP ALGORITHM (ABSOLUTE TRUTH)
 * ---------------------------------------------------------
 */
export function resolveGameRound(
  p1Cards: Card[], 
  p2Cards: Card[], 
  p1Class: ClassName, 
  p2Class: ClassName
): DamageResult {
  const logs: string[] = [];
  const effects: GameSideEffects = {};

  // --- STEP 1: Deflate (Pre-Calculation) ---
  const p1HasDeflate = p1Cards.some(c => c.specialType === "deflate");
  const p2HasDeflate = p2Cards.some(c => c.specialType === "deflate");

  if (p1HasDeflate) logs.push("P1 Deflate (β) active: P2 specials nullified.");
  if (p2HasDeflate) logs.push("P2 Deflate (β) active: P1 specials nullified.");

  // Helper to check if a player's specials are active
  const isP1SpecialActive = !p2HasDeflate; // P1 is active if P2 NO deflate
  const isP2SpecialActive = !p1HasDeflate; 

  // --- STEP 2: Base Value Collision (Reflectable) ---
  let p1Total = calculateNumericTotal(p1Cards);
  let p2Total = calculateNumericTotal(p2Cards);

  // --- STEP 3: Numeric Combinations (Subject to Reflection) ---
  // Added to Base Total BEFORE difference calc to be part of the "Reflectable" payload?
  // "Bu hasarlar da ADIM 2'deki yönlendirme kurallarına tabidir."
  // If we add it to the Total, it effectively increases the Diff.
  const p1ComboBonus = calculateNumericCombinationBonus(p1Cards);
  const p2ComboBonus = calculateNumericCombinationBonus(p2Cards);
  
  if (p1ComboBonus > 0) logs.push(`P1 Combo Bonus: +${p1ComboBonus}`);
  if (p2ComboBonus > 0) logs.push(`P2 Combo Bonus: +${p2ComboBonus}`);

  p1Total += p1ComboBonus;
  p2Total += p2ComboBonus;

  // Calculate Raw Diff
  let damage = Math.abs(p1Total - p2Total);
  let victim = p1Total < p2Total ? "p1" : (p1Total > p2Total ? "p2" : "draw");
  let attacker = victim === "p1" ? "p2" : (victim === "p2" ? "p1" : "draw");

  // Determine actual victim handling Reflection (Delta/Twisted)
  let finalVictim = victim;
  
  if (victim === "p1") {
    // P1 lost. Check P1 Delta/Twisted
    if (isP1SpecialActive) { // Must not be deflated
       const hasDelta = p1Cards.some(c => c.specialType === "delta");
       const hasTwisted = p1Cards.some(c => c.specialType === "twisted");
       if (hasDelta || hasTwisted) {
         finalVictim = "p2"; // Reflect!
         logs.push(`P1 reflected damage using ${hasDelta ? "Delta" : "Twisted"}!`);
       }
    }
  } else if (victim === "p2") {
    // P2 lost. Check P2 Delta/Twisted
    if (isP2SpecialActive) {
      const hasDelta = p2Cards.some(c => c.specialType === "delta");
      const hasTwisted = p2Cards.some(c => c.specialType === "twisted");
      if (hasDelta || hasTwisted) {
        finalVictim = "p1"; // Reflect!
        logs.push(`P2 reflected damage using ${hasDelta ? "Delta" : "Twisted"}!`);
      }
    }
  }

  // Determine Sigma Amplification (Attacker's Sigma)
  // If reflection happened, the "Attacker" logic is tricky. 
  // Step 2 Rule: "Kontrol 2 (Sigma): B'nin (Kazanan) elinde Sigma var mı? -> Hasar * 2"
  // If P1 reflected, P1 is now dealing damage (Defense becomes Offense?). 
  // The Rule says "Attacker" is the original winner of the total.
  // "B (Kazanan/Attacker): Elinde Sigma var mı?"
  // Let's assume Sigma CHECK is based on the ORIGINAL winner of the numeric clash.
  
  if (attacker === "p1" && isP1SpecialActive && p1Cards.some(c => c.specialType === "sigma")) {
    damage *= 2;
    logs.push("P1 Sigma (Σ) amplified damage x2!");
  } else if (attacker === "p2" && isP2SpecialActive && p2Cards.some(c => c.specialType === "sigma")) {
    damage *= 2;
    logs.push("P2 Sigma (Σ) amplified damage x2!");
  }

  // Assign Step 2+3 Damage
  let p1DamageTaken = finalVictim === "p1" ? damage : 0;
  let p2DamageTaken = finalVictim === "p2" ? damage : 0;

  // --- STEP 4: Class Synergy (TRUE DAMAGE - UNREFLECTABLE) ---
  const p1True = calculateClassSynergyTrueDamage(p1Cards, p1Class);
  const p2True = calculateClassSynergyTrueDamage(p2Cards, p2Class);

  if (p1True > 0) logs.push(`P1 Synergy: ${p1True} True Damage`);
  if (p2True > 0) logs.push(`P2 Synergy: ${p2True} True Damage`);

  // --- STEP 5: Class Ability Trigger ---
  const p1Scale = getAbilityScale(p1Class, p1Cards);
  const p2Scale = getAbilityScale(p2Class, p2Cards);

  const abilityRes = applyStep5Abilities(
    p1Class, p1Cards, p2Class, p2Cards, 
    effects, p1Scale, p2Scale
  );

  // Ability Damage is usually DIRECT (Slayer, Oracle). 
  // Is it True Damage? Or Reflectable? 
  // Rules don't specify, but Step 5 is AFTER Step 2.
  // Usually Abilities are Direct/Magic. Let's add to final Damage Taken directly.
  
  if (abilityRes.p1ExtraDmg > 0) logs.push(`P1 Class Ability deals ${abilityRes.p1ExtraDmg} dmg.`);
  if (abilityRes.p2ExtraDmg > 0) logs.push(`P2 Class Ability deals ${abilityRes.p2ExtraDmg} dmg.`);

  // Final Summation
  p1DamageTaken += p2True + abilityRes.p2ExtraDmg;
  p2DamageTaken += p1True + abilityRes.p1ExtraDmg;

  return {
    p1DamageTaken,
    p2DamageTaken,
    p1TrueDamage: p2True,
    p2TrueDamage: p1True,
    logs: [...logs, ...abilityRes.p1AbilityRes.logs, ...abilityRes.p2AbilityRes.logs],
    sideEffects: effects,
    abilityResults: { p1: abilityRes.p1AbilityRes, p2: abilityRes.p2AbilityRes }
  };
}


/**
 * Called by useGameState to apply Ability HP changes (Healing) BEFORE damage.
 * NOW MOVED INTO MAIN RESOLVE but kept for compatibility if hook needs distinct phases.
 * (The hook calls applyClassAbility AND resolveGameRound separately).
 * We should probably sync them or make this a lightweight wrapper for Step 5 healing.
 */
export function applyClassAbility(
    className: ClassName, 
    playedCards: Card[], 
    currentHP: number
  ): ClassAbilityResult {
    // Check Step 5 just for healing/HP change logs
    const scale = getAbilityScale(className, playedCards);
    const logs: string[] = [];
    let hpChange = 0;
  
    if (className === "Vitalist" && scale.scale.value && scale.scale.value > 0) {
       hpChange = scale.scale.value; // Healing
       logs.push(`Vitalist healed for ${hpChange} HP.`);
    }
  
    return { hpChange, logs };
}

/**
 * Resolves the special interaction rules for counters/Instant Wins.
 */
export function checkCounterWinCondition(
    player: PlayerState, 
    opponent: PlayerState, 
    round: number
): boolean | undefined {
    const pClass = player.className;
    const oClass = opponent.className;
    
    // Vitalist vs Slayer (Override Logic)
    if (pClass === "Vitalist" && oClass === "Slayer") {
       // Only win if HP < Slayer at end of Round 6 (or if checked otherwise)
       // This function returns "Instant Win". 
       // The rule "Vitalist kazanmak için Slayer'dan DAHA AZ canda kalmalıdır" is a Condition Check, not Instant Win.
       // Handled in End Game Check (hook).
    }

    // Chronokeeper vs Vitalist
    if (pClass === "Chronokeeper" && oClass === "Vitalist") {
      const chronCards = player.playedCardsInRound.filter(c => c.symbol === MASTER_CLASSES.Chronokeeper.symbol).length;
      if (chronCards === 5) return true;
    }

    // Fateweaver
    if (pClass === "Fateweaver") {
      const gammas = player.playedCardsInRound.filter(c => c.specialType === "gamma").length;
      if (gammas === 5) return true;
    }

    // Slayer Instant
    if (pClass === "Slayer") {
       // "Tek turda 12+ Hasar" -> Triggered during round? 
       // If scale value >= 12.
       const scale = getAbilityScale("Slayer", player.playedCardsInRound);
       if ((scale.scale.value || 0) >= 12) return true;
    }

    // Siren
    if (pClass === "Siren") {
       // Assuming 'originalOwner' check or just count.
       // "5 Çalıntı Kart Oyna"
       // We can approximate by checking specific metadata on cards if enabled.
    }

    // Augmentor
    if (pClass === "Augmentor") {
        const hasNine = player.playedCardsInRound.some(c => c.symbol === MASTER_CLASSES.Augmentor.symbol && c.value === 9);
        if (hasNine) return true;
    }
  
    // Conjurer
    if (pClass === "Conjurer") {
        const hasSigma = player.playedCardsInRound.some(c => c.specialType === "sigma");
        const hasDelta = player.playedCardsInRound.some(c => c.specialType === "delta");
        if (hasSigma && hasDelta) return true;
    }

    // Oracle (Empty Deck) - Checked elsewhere (hook) usually

    return undefined;
}
