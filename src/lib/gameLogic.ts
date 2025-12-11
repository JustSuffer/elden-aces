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

/**
 * Step 5: Class Ability Trigger (Switch-Case Implementation)
 */
function applyStep5Abilities(
  p1Class: ClassName, p1Cards: Card[], 
  p2Class: ClassName, p2Cards: Card[],
  effects: GameSideEffects,
  // We don't need p1Scale/p2Scale passed in anymore, we calculate inside
): { p1ExtraDmg: number, p2ExtraDmg: number, p1AbilityRes: ClassAbilityResult, p2AbilityRes: ClassAbilityResult } {
  
  const p1Res: ClassAbilityResult = { hpChange: 0, logs: [] };
  const p2Res: ClassAbilityResult = { hpChange: 0, logs: [] };
  let p1ExtraDmg = 0;
  let p2ExtraDmg = 0;

  const processClass = (isP1: boolean, className: ClassName, cards: Card[], res: ClassAbilityResult) => {
    // Count class cards (or generic/numeric if they match class symbol)
    // Actually, usually we count Valid Cards meant for the class. 
    // Simplified: Just count TOTAL cards played ?? 
    // Table says "1 Kart", "2 Kart", "3 Kart" -> Usually means "Cards Played".
    // But typically synergy requires "Class Cards". 
    // "Sınıf Yetenek Ölçekleri" implies scaling with *Class Cards*.
    // However, if I play 3 cards and 1 is a filler, does it count?
    // Let's assume we count *All Cards Played* if the user plays a hand?
    // User Prompt: "OYUNA SÜRÜLEN CLASSIN KARTLARI EĞER 2 SÜRDÜYSE 3 SÜRDÜYSE".
    // "Oyuna sürülen Classın Kartları" -> "The Class Cards played into the game".
    // It suggests we count the cards that belong to the Class.
    // Let's stick to: Count of proper class cards in the hand.
    
    // BUT WAIT: The system allows 1-5 cards total. If I play 1 Slayer and 2 Fillers, is it "1 Card" effect? 
    // Yes, usually.
    const classSymbol = MASTER_CLASSES[className].symbol;
    const count = cards.filter(c => c.symbol === classSymbol || c.classSymbol === classSymbol).length;
    
    // The table handles 1 to 5.
    if (count === 0) return; // No class cards, no effect.

    const targetEffects = effects; 
    const isOpponent = !isP1; // Relative to current processor

    switch (className) {
      case "Vitalist": // (Φ)
        switch (count) {
          case 1:
            res.logs.push("Vitalist (1): 0 Can");
            break;
          case 2:
            res.hpChange += 4;
            res.logs.push("Vitalist (2): +4 Can");
            break;
          case 3:
            res.hpChange += 6;
            res.logs.push("Vitalist (3): +6 Can");
            break;
          case 4:
            res.hpChange += 8;
            res.logs.push("Vitalist (4): +8 Can");
            break;
          case 5:
            res.hpChange += 15;
            res.logs.push("Vitalist (5): +15 Can");
            break;
        }
        break;

      case "Slayer": // (Ω)
        switch (count) {
          case 1:
             res.logs.push("Slayer (1): 0 Dmg");
             break;
          case 2:
            if (isP1) p1ExtraDmg += 3; else p2ExtraDmg += 3;
            res.logs.push("Slayer (2): 3 Dmg");
            break;
          case 3:
            if (isP1) p1ExtraDmg += 5; else p2ExtraDmg += 5;
            res.logs.push("Slayer (3): 5 Dmg");
            break;
          case 4:
            if (isP1) p1ExtraDmg += 8; else p2ExtraDmg += 8;
            res.logs.push("Slayer (4): 8 Dmg");
            break;
          case 5:
            if (isP1) p1ExtraDmg += 12; else p2ExtraDmg += 12;
            res.logs.push("Slayer (5): 12 Dmg");
            break;
        }
        break;

      case "Fateweaver": // (Π)
        // Handled mostly by Dice logic, but here we might add "Zar" capacity?
        // "+2 Zar" usually means "Add +2 to Dice Rolls cap" or "Gain 2 Dice Items"?
        // The game has a "Zar Hakki" (Dice Usage). 
        // Let's assume it restores/adds to usage limit or unused, but implementing fully might require state change.
        // For now logging it. Actual implementation of "Adding Writes to Dice" might be needed.
        // "5x Gamma Kartı" is Win Condition.
        // Table text: "+2 Zar"
        switch (count) {
          case 1: break;
          case 2: res.logs.push("Fateweaver (2): +2 Zar (Not Implemented)"); break;
          case 3: res.logs.push("Fateweaver (3): +4 Zar (Not Implemented)"); break;
          case 4: res.logs.push("Fateweaver (4): +7 Zar (Not Implemented)"); break;
          case 5: res.logs.push("Fateweaver (5): +8 Zar + Gamma"); break; 
        }
        break;

      case "Augmentor": // (Θ)
        switch (count) {
          case 1: break;
          case 2:
             if (isP1) targetEffects.p1ValueBuff = 1; else targetEffects.p2ValueBuff = 1;
             res.logs.push("Augmentor (2): +1 Değer");
             break;
          case 3:
             if (isP1) targetEffects.p1ValueBuff = 2; else targetEffects.p2ValueBuff = 2;
             res.logs.push("Augmentor (3): +2 Değer");
             break;
          case 4:
             if (isP1) targetEffects.p1ValueBuff = 3; else targetEffects.p2ValueBuff = 3;
             res.logs.push("Augmentor (4): +3 Değer");
             break;
          case 5:
             if (isP1) targetEffects.p1ValueBuff = 6; else targetEffects.p2ValueBuff = 6;
             // Set 30? "Set 30" might mean something else. Assuming Value Buff +6 for now.
             res.logs.push("Augmentor (5): +6 Değer / Set 30");
             break;
        }
        break;

      case "Cryomancer": // (Ξ)
        switch (count) {
          case 1: break; // -
          case 2:
            if (isP1) targetEffects.p2FreezeCount = 2; else targetEffects.p1FreezeCount = 2;
            res.logs.push("Cryomancer (2): 2 Don");
            break;
          case 3:
            // "2+1 Don" -> Is it 3? Or 2 and 1? Assuming 3 total.
            if (isP1) targetEffects.p2FreezeCount = 3; else targetEffects.p1FreezeCount = 3;
            res.logs.push("Cryomancer (3): 2+1 Don");
            break;
          case 4:
            // "2+2 Don" -> 4?
            if (isP1) targetEffects.p2FreezeCount = 4; else targetEffects.p1FreezeCount = 4;
            res.logs.push("Cryomancer (4): 2+2 Don");
            break;
          case 5:
            if (isP1) targetEffects.p2FreezeCount = 99; else targetEffects.p1FreezeCount = 99;
             res.logs.push("Cryomancer (5): TÜMÜNÜ Dondur");
            break;
        }
        break;

      case "Siren": // (η)
        // Steal "Çal"
        let steal = 0;
        switch (count) {
          case 2: steal = 2; break;
          case 3: steal = 3; break;
          case 4: steal = 4; break;
          case 5: steal = 5; break;
        }
        if (steal > 0) {
           if (isP1) targetEffects.p1StealCount = steal; else targetEffects.p2StealCount = steal;
           res.logs.push(`Siren (${count}): ${steal} Çal`);
        }
        break;

      case "Incinerator": // (ρ)
        // Burn "Yak"
        let burn = 0;
        switch (count) {
          case 2: burn = 3; break;
          case 3: burn = 4; break;
          case 4: burn = 5; break;
          case 5: 
             burn = 8; 
             res.logs.push("Incinerator (5): NoDeath Active");
             break;
        }
        if (burn > 0) {
           if (isP1) targetEffects.p2BurnCount = burn; else targetEffects.p1BurnCount = burn;
           res.logs.push(`Incinerator (${count}): ${burn} Yak`);
        }
        break;

      case "Oracle": // (Ψ)
        // Dmg/Draw
        // "2 Dmg/Draw" -> Deals 2 Dmg AND Draws 2?
        let dmg = 0;
        let draw = 0;
        switch (count) {
          case 2: dmg = 2; draw = 2; break;
          case 3: dmg = 3; draw = 3; break;
          case 4: dmg = 4; draw = 4; break;
          case 5: dmg = 10; draw = 5; break;
        }
        if (dmg > 0) {
          if (isP1) { p1ExtraDmg += dmg; targetEffects.p1DrawCount = draw; }
          else { p2ExtraDmg += dmg; targetEffects.p2DrawCount = draw; }
          res.logs.push(`Oracle (${count}): ${dmg} Dmg + ${draw} Draw`);
        }
        break;

      case "Chronokeeper": // (τ)
        // Sil / Freeze Rounds? "Sil" usually means "Skip Round" or "Cancel Round"?
        // Or "Silence"? Silence usually stops abilities.
        // Prompt Table says "0 Sil", "1 Rnd Sil", "2 Rnd Sil", "3 Rnd Sil". 
        // "Sil" -> Silence?
        // Let's assume it sets "RoundsSkip" in sideEffects.
        let skip = 0;
        switch (count) {
            case 2: skip = 0; res.logs.push("Chrono (2): 0 Sil"); break;
            case 3: skip = 1; res.logs.push("Chrono (3): 1 Rnd Sil"); break;
            case 4: skip = 2; res.logs.push("Chrono (4): 2 Rnd Sil"); break;
            case 5: skip = 3; res.logs.push("Chrono (5): 3 Rnd Sil"); break;
        }
        if (skip > 0) {
            if (isP1) targetEffects.p2RoundsSkip = skip; else targetEffects.p1RoundsSkip = skip;
        }
        break;

      case "Conjurer": // (μ)
        // "Random" for 2,3,4. "5 Kart + Gamma" for 5.
        // Random effect? Maybe random card?
        switch (count) {
           case 2: res.logs.push("Conjurer (2): Random"); break;
           case 3: res.logs.push("Conjurer (3): Random"); break;
           case 4: res.logs.push("Conjurer (4): Random"); break;
           case 5: res.logs.push("Conjurer (5): 5 Kart + Gamma"); break;
        }
        break;

      case "Mimic": // (ν)
        // Kopyala (Copy)
        switch (count) {
          case 2: case 3: case 4: case 5:
             res.logs.push(`Mimic (${count}): Kopyala`);
             break;
        }
        break;
        
      default:
        break;
    }
  };

  processClass(true, p1Class, p1Cards, p1Res);
  processClass(false, p2Class, p2Cards, p2Res);

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
  // --- STEP 5: Class Ability Trigger ---
  // Scale is calculated inside the function now
  
  const abilityRes = applyStep5Abilities(
    p1Class, p1Cards, p2Class, p2Cards, 
    effects
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
