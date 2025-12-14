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
  maxRounds: number;
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
  playerDiceRolls: number;
  carryOverCards: Card[];
  pendingRoundSkip: number;
  logs: string[];
  mimicCounter: { p1: number; p2: number };
  winner?: "p1" | "p2" | "draw" | null;
  winReason?: string;
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

  // 18 Filler cards from 3 random other classes (or 24 from 4 for Conjurer)
  const isVessel = className === "Vessel";
  const limit = isVessel ? 4 : 3;
  const otherClasses = Object.keys(MASTER_CLASSES).filter(c => c !== className) as ClassName[];
  const shuffledOthers = otherClasses.sort(() => Math.random() - 0.5).slice(0, limit);
  
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
    
    let opponentDeck = createBotDeck(oClass);
    
    if (oClass === "Mimic") {
        // Bot Mimic: Add 6 Extra Mimic Cards (mimicking the behavior of copying + own class)
        // Total 36 Cards
        const mimicClassData = MASTER_CLASSES["Mimic"];
        const extraMimicCards: Card[] = [];
        for (let i = 1; i <= 6; i++) {
             extraMimicCards.push({
                id: `bot-mimic-extra-${i}-${Date.now()}`,
                name: `${mimicClassData.name} Card`,
                symbol: mimicClassData.symbol,
                value: i,
                type: "numeric",
                classSymbol: mimicClassData.symbol,
                color: mimicClassData.color
             });
        }
        opponentDeck = shuffleDeck([...opponentDeck, ...extraMimicCards]);
    }
    
    let playerDeck: Card[];

    if (pClass === "Mimic") {
        // Mimic Logic: Copy Opponent's entire deck (30 or 36 cards) + Add 6 Mimic Cards = 36/42 Total.
        const mimicClassData = MASTER_CLASSES["Mimic"];
        const mimicCards: Card[] = [];
        for (let i = 1; i <= 6; i++) {
             mimicCards.push({
                id: `mimic-own-${i}-${Date.now()}`,
                name: `${mimicClassData.name} Card`,
                symbol: mimicClassData.symbol,
                value: i,
                type: "numeric",
                classSymbol: mimicClassData.symbol,
                color: mimicClassData.color
             });
        }
        // Deep clone opponent deck with new IDs to prevent reference sharing
        const opponentClones = opponentDeck.map(c => ({
            ...c, 
            id: `mimicked-${c.id}-${Date.now()}`
        }));
        
        playerDeck = shuffleDeck([...opponentClones, ...mimicCards]);
    } else {
        // Standard Logic
        // Fix: If cards array is empty, fallback to default deck
        const inputCards = initParams?.playerDeck.cards;
        playerDeck = inputCards && inputCards.length > 0
          ? shuffleDeck([...inputCards])
          : createBotDeck(pClass);
    }
    
    // Deal 6 cards for round 1 (or 8 for Oracle)
    const p1StartCount = pClass === "Oracle" ? 8 : 6;
    const p2StartCount = oClass === "Oracle" ? 8 : 6;
    const { dealt: initialP, remaining: remainP } = localDealCards(playerDeck, p1StartCount);
    const { dealt: initialO, remaining: remainO } = localDealCards(opponentDeck, p2StartCount);

    return {
      round: 1,
      maxRounds: 7,
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
      playerDiceRolls: pClass === "Fateweaver" ? 2 : 0,
      carryOverCards: [],
      pendingRoundSkip: 0,
      logs: [],
      mimicCounter: { p1: 0, p2: 0 },
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
      // Bot Logic: Strategic placement based on round and class
      const botField: (Card | null)[] = [null, null, null, null, null];
      
      // 1. Determine Max Capacity
      const maxCapacity = prev.opponentMust4Cards ? 4 : 5;
      
      // 2. Decide Target Count (Tactical Decision)
      // Round 1-2: Save resources? 40% chance for 3, 40% for 4, 20% for 5.
      // Round 3-4: Mid game. 20% for 4, 80% for 5.
      // Round 5-6: All out. 100% for 5.
      
      let targetCount = maxCapacity;
      const rand = Math.random();
      
      if (prev.round <= 2) {
          if (rand < 0.4) targetCount = Math.min(3, maxCapacity);
          else if (rand < 0.8) targetCount = Math.min(4, maxCapacity);
          else targetCount = maxCapacity;
      } else if (prev.round <= 4) {
          if (rand < 0.2) targetCount = Math.min(4, maxCapacity);
          else targetCount = maxCapacity;
      } else {
          targetCount = maxCapacity;
      }
      
      // Ensure we have enough cards
      const cardsToPlace = Math.min(targetCount, prev.opponentHand.length);

      // 3. Selection Strategy
      // Sort by value (descending) to play strongest cards? 
      // Or save strongest for later? 
      // Current Logic: Play strongest now.
      const sortedHand = [...prev.opponentHand].sort((a, b) => (b.value || 0) - (a.value || 0));
      const botHandToPlay = sortedHand.slice(0, cardsToPlace);
      
      // 4. Shuffle placement for unpredictability
      const shuffledPlay = botHandToPlay.sort(() => Math.random() - 0.5);
      
      // Place in random slots (fill empty slots)
      // Actually we just fill the array indices 0..4 random? No, field is fixed 5 slots.
      // We should distribute them randomly across the 5 slots?
      // Or just fill 0..N? 
      // Logic: "botField[i] = c" fills 0,1,2... which corresponds to LEFT alignment.
      // Let's scatter them?
      const availableSlots = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
      shuffledPlay.forEach((c, i) => {
          botField[availableSlots[i]] = c;
      });
      
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
    // Check if Fateweaver and dice available
    setGameState((prev) => {
      const isFateweaverBehavior = prev.playerClass === "Fateweaver" || (prev.playerClass === "Mimic" && prev.opponentClass === "Fateweaver");
      
      if (isFateweaverBehavior) {
        if ((prev.playerDiceRolls || 0) <= 0) return prev;
      }
      
      if (prev.diceUsed >= 2 && !isFateweaverBehavior) {
        return prev; // Max 2 rolls for non-Fateweaver
      }

      const result = Math.floor(Math.random() * 20) + 1;
      let effect = "";
      
      if (isFateweaverBehavior) {
          if (result < 11) {
              effect = "Kaderin Cilvesi: Elinize Twisted (α) veya Deflate (β) eklenecek.";
          } else {
              effect = "KADER ÖRÜLDÜ: Efsanevi Gamma (γ) Kartı eklendi!";
          }
      } else {
          if (result <= 5) {
             effect = "Kötü Şans: Elinden rastgele 1 kart silinecek!";
          } else if (result <= 10) {
             effect = "Şans: Twisted (α) veya Deflate (β) kazanacaksın!";
          } else if (result <= 17) {
             effect = "Büyük Şans: Delta (Δ) veya Sigma (Σ) kazanacaksın!";
          } else {
             effect = "EFSANEVİ: Gamma (γ) Kartı kazanacaksın!";
          }
      }

      return {
        ...prev,
        pendingDiceResult: { result, effect },
        diceUsed: prev.diceUsed + 1,
        playerDiceRolls: prev.playerClass === "Fateweaver" ? (prev.playerDiceRolls || 0) - 1 : prev.playerDiceRolls,
      };
    });
  }, []);

  const acknowledgeDiceResult = useCallback(() => {
    setGameState((prev) => {
      if (!prev.pendingDiceResult) return prev;
      
      const result = prev.pendingDiceResult.result;
      const isFateweaver = prev.playerClass === "Fateweaver";
      let newHand = [...prev.playerHand];
      
      const addSpecial = (type: keyof typeof SPECIAL_CARDS_DATA) => {
          const base = SPECIAL_CARDS_DATA[type];
           newHand.push({
              id: `dice-${type}-${Date.now()}`,
              name: base.name,
              symbol: base.symbol,
              type: "special",
              specialType: type,
              value: 0,
              description: base.description
           });
      };

      if (isFateweaver) {
          if (result < 11) {
               Math.random() < 0.5 ? addSpecial("twisted") : addSpecial("deflate");
          } else {
               addSpecial("gamma");
          }
      } else {
          if (result <= 5) {
               if (newHand.length > 0) {
                   const r = Math.floor(Math.random() * newHand.length);
                   newHand.splice(r, 1);
               }
          } else if (result <= 10) {
              Math.random() < 0.5 ? addSpecial("twisted") : addSpecial("deflate");
          } else if (result <= 17) {
               Math.random() < 0.5 ? addSpecial("delta") : addSpecial("sigma");
          } else {
              addSpecial("gamma");
          }
      }

      return {
        ...prev,

        pendingDiceResult: null,
        playerHand: newHand,
        playerMust4Cards: false,
        cardSelectionMode: false,
        // playerDiceRolls handled in rollDice
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

      // Resolve round combat (Steps 1-5 including Ability execution)
      // MIMIC LOGIC: If Mimic vs X, resolve as X vs X (for scaling).
      const effectiveP1Class = (prev.playerClass === "Mimic" && prev.opponentClass !== "Mimic") ? prev.opponentClass : prev.playerClass;
      
      const result = resolveGameRound(p1Cards, p2Cards, effectiveP1Class, prev.opponentClass);

      // Healing is returned in abilityResults, we need to apply it + damage taken
      // result.p1DamageTaken is NET positive damage
      // result.abilityResults.pX.hpChange handles scaling healing (positive value = healing in Logic usually?)
      // Wait, in logic update:
      // Vitalist: "hpChange = scale.value" (Positive)
      // We need to ADD healing and SUBTRACT damage.
      
      let newPlayerHP = prev.playerHP;
      let newOpponentHP = prev.opponentHP;

      // Apply Healing first (Logic: usually healing happens before damage or net change)
      newPlayerHP += result.abilityResults.p1.hpChange;
      newOpponentHP += result.abilityResults.p2.hpChange;

      // Apply Damage
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

      let logDetails = result.logs;

      // Siren Win Condition: 5 Stolen Cards
      if (prev.playerClass === "Siren" && p1Cards.filter(c => c.isStolen).length >= 5) {
          logDetails.push("❤️ KADERİN KALBİNE HÜKMETTİM: Siren Kazandı!");
          newOpponentHP = 0;
          if (newPlayerHP <= 0) {
             newPlayerHP = 1; // Prevent death if win condition met
             logDetails.push("❤️ Aşk Ölümden Güçlüdür: Siren Hayatta!");
          }
      }

      let phase: "placement" | "reveal" | "damage" | "end" = newPlayerHP <= 0 || newOpponentHP <= 0 ? "end" : "damage";

      if (p1InstantWin) {
        newOpponentHP = 0;
        // Fateweaver Invincibility: If I win instantly, I cannot die this round.
        if (newPlayerHP <= 0) newPlayerHP = 1;
        
        phase = "end";
        logDetails.push(`🏆 ${prev.playerClass} kazanma koşulunu sağladı!`);
        
        if (prev.playerClass === "Fateweaver") {
             logDetails.push("👁️ KADERİN GÖZÜ AÇILDI: MUTLAK ZAFER!");
        }
        if (prev.playerClass === "Mimic") {
             logDetails.push("🔪 YÜZÜNÜ ALDIM, ŞİMDİ CANINI ALIYORUM!");
        }
      }
      if (p2InstantWin) {
        newPlayerHP = 0;
        phase = "end";
        logDetails.push(`💀 ${prev.opponentClass} kazanma koşulunu sağladı!`);
      }

      // --- SIREN CURSE (USER REQUEST: ROUND 6 AUTO-DAMAGE) ---
      if (prev.round === 6) {
          // Siren Player takes 5 Damage automatically
          if (prev.playerClass === "Siren") {
              newPlayerHP = Math.max(0, newPlayerHP - 5);
              logDetails.push("🧜‍♀️ LANET: Siren 6. Turda 5 Hasar yedi!");
          }
          // Siren Opponent takes 5 Damage automatically
          if (prev.opponentClass === "Siren") {
              newOpponentHP = Math.max(0, newOpponentHP - 5);
              logDetails.push("🧜‍♀️ LANET: Rakip Siren 6. Turda 5 Hasar yedi!");
          }
      }

      // Apply side effects
      let p1Deck = [...prev.playerDeck];
      let p2Deck = [...prev.opponentDeck];




      // RE-IMPLEMENTING PROPER STATE UPDATES FOR HANDS
      let p1Hand = [...prev.playerHand];
      let p2Hand = [...prev.opponentHand];

      if (result.sideEffects.p1SirenSteal) {
          const count = result.sideEffects.p1SirenSteal;
          const stolen = p2Deck.slice(0, count).map(c => ({ ...c, isStolen: true, originalOwner: "p2" })); // Mark stolen
          p2Deck = p2Deck.slice(count);
          p1Hand.push(...stolen);
          logDetails.push(`🧜‍♀️ Siren çalıyor: ${count} kart!`);
      }
      if (result.sideEffects.p2SirenSteal) {
           const count = result.sideEffects.p2SirenSteal;
          const stolen = p1Deck.slice(0, count).map(c => ({ ...c, isStolen: true, originalOwner: "p1" }));
          p1Deck = p1Deck.slice(count);
          p2Hand.push(...stolen);
          logDetails.push(`🧜‍♀️ Siren çalıyor: ${count} kart!`);
      }

      // --- ORACLE DRAW / SELF-MILL LOGIC ---
      if (result.sideEffects.p1DrawCount) {
          const count = result.sideEffects.p1DrawCount;
          // Draw from OWN deck
          const drawn = p1Deck.slice(0, count);
          p1Deck = p1Deck.slice(count);
          p1Hand.push(...drawn);
          logDetails.push(`🔮 Oracle geleceği gördü: ${count} kart çekti! (Kalan Deste: ${p1Deck.length})`);
          
          if (p1Deck.length === 0 && prev.playerClass === "Oracle") {
             logDetails.push("🔮 KEHANET GERÇEKLEŞTİ: Deste bitti! ORACLE KAZANDI!");
             newOpponentHP = 0; // Win
          }
      }

       if (result.sideEffects.p2DrawCount) {
          const count = result.sideEffects.p2DrawCount;
          const drawn = p2Deck.slice(0, count);
          p2Deck = p2Deck.slice(count);
          p2Hand.push(...drawn);
          logDetails.push(`🔮 Rakip Oracle kart çekiyor: ${count} (Kalan: ${p2Deck.length})`);
          
          if (p2Deck.length === 0 && prev.opponentClass === "Oracle") {
              logDetails.push("🔮 RAKİP KEHANETİ TAMAMLADI: Oracle Kazandı!");
              newPlayerHP = 0;
          }
      }



      // --- DECAY BURN LOGIC ---
      if (result.sideEffects.p1BurnCount) {
          const count = result.sideEffects.p1BurnCount;
          p2Deck = p2Deck.slice(count);
          logDetails.push(`🔥 Decay (P1): ${count} kart YAKTI! (Rakip Kalan: ${p2Deck.length})`);
      }
      if (result.sideEffects.p2BurnCount) {
          const count = result.sideEffects.p2BurnCount;
          p1Deck = p1Deck.slice(count);
          logDetails.push(`🔥 Decay (P2): ${count} kart YAKTI! (Kalan: ${p1Deck.length})`);
      }

      // --- DECAY R5 CHECK ---
      const isDecayP1 = prev.playerClass === "Decay";
      const isDecayP2 = prev.opponentClass === "Decay";

[]

      // --- FATEWEAVER LOGIC (Dice Gain + Gamma) ---
      let newPlayerDiceRolls = prev.playerClass === "Fateweaver" ? (prev.playerDiceRolls || 0) : 0; // Carry over
      
      if (result.sideEffects.p1DiceGain) {
          const gain = result.sideEffects.p1DiceGain;
          newPlayerDiceRolls += gain; 
          logDetails.push(`🎲 Fateweaver Zarları Topluyor: +${gain} Zar Hakkı!`);
      }
      if (result.sideEffects.p1GammaReward) {
          // Add Gamma
           p1Hand.push({
               id: `reward-gamma-${Date.now()}`,
               name: SPECIAL_CARDS_DATA.gamma.name,
               symbol: SPECIAL_CARDS_DATA.gamma.symbol,
               type: "special",
               specialType: "gamma",
               value: 0,
               description: SPECIAL_CARDS_DATA.gamma.description
           });
           logDetails.push("✨ Fateweaver 5 Kart Bonusu: Gamma (γ) kazandı!");
      }
      
      // Bot Fateweaver Logic (Optional logs, keeping state consistent if we tracked it)
       if (result.sideEffects.p2DiceGain) {
          logDetails.push(`🎲 Rakip Fateweaver +${result.sideEffects.p2DiceGain} Zar Hakkı kazandı!`);
      }
      if (result.sideEffects.p2GammaReward) {
          p2Hand.push({
               id: `reward-gamma-bot-${Date.now()}`,
               name: SPECIAL_CARDS_DATA.gamma.name,
               symbol: SPECIAL_CARDS_DATA.gamma.symbol,
               type: "special",
               specialType: "gamma",
               value: 0,
               description: SPECIAL_CARDS_DATA.gamma.description
           });
           logDetails.push("✨ Rakip Fateweaver Gamma (γ) kazandı!");
      }

      // --- VESSEL LOGIC (Cards Added) ---
      if (result.sideEffects.p1CardsAdded) {
          p1Hand.push(...result.sideEffects.p1CardsAdded);
          logDetails.push(`🌌 Vessel Kozmik Gücü: ${result.sideEffects.p1CardsAdded.length} özel kart elde edildi!`);
      }
      if (result.sideEffects.p2CardsAdded) {
          p2Hand.push(...result.sideEffects.p2CardsAdded);
          logDetails.push(`🌌 Rakip Vessel Kozmik Gücü: ${result.sideEffects.p2CardsAdded.length} kart elde etti!`);
      }

      // Check round 7 end condition - REMOVED IMMEDIATE END
      // We allow the "Damage" phase to show the result first.
      // The Transition to "End" phase happens in nextRound() if round >= 7.
      
      // EXCEPTION: Survival Win Conditions immediately end game?
      // "Vitalist/Chronokeeper artık 7. round a kadar yaşarsa kazanacak"
      // If we are at Round 7, and HP > 0, they win.
      // If we don't end phase here, user sees "Round 7 Complete".
      // Then clicks Next -> Victory.
      // This is actually BETTER visuals.
      // But we need to make sure `winner` is set correctly if we delay?
      // Or we just let `nextRound` handle it. 
      // BUT `nextRound` sets `phase="end"`. It doesn't set `winner`. `winner` is usually set in `calculateRoundDamage`.
      // So I DO need to set `winner` here if R7 survival?
      // Or I can calculate winner in `nextRound`? No, `nextRound` assumes state holds result.
      
      // Let's modify the survival check to Log "Victory Assured" but wait for Next click?
      // Or just set `newOpponentHP = 0` (force win) at R7 end, so Damage Result shows "Opponent Defeated"?
      // User said "Son round da hangi hasarı kimin yediği ve kimin ne kosulla kazandığı anlatılacak".
      // If I set HP=0, it looks like a kill.
      // If I want "Vitalist Survived" message, I should add it to logs, and maybe set winner?
      let winner = undefined;
      let winReasonText: string | undefined = undefined;
      
      if (prev.round >= 7) {
          if (prev.playerClass === "Vitalist" && newPlayerHP > 0) {
              logDetails.push("🌿 Vitalist 7. Raundu gördü! DOĞA KAZANDI!");
              winner = "p1";
              // We don't force End Phase yet, so user sees this log in the Damage popup.
          } else if (prev.playerClass === "Chronokeeper" && newPlayerHP > 0) {
              logDetails.push("⏳ Chronokeeper zamanın efendisi oldu! KAZANDINIZ!");
              winner = "p1";
          } else {
             // Normal HP Comparison at end of R7
             if (newPlayerHP > newOpponentHP) {
                  logDetails.push("7. Round Sonucu: HP avantajı ile Zafer!");
                  winner = "p1";
             } else if (newOpponentHP > newPlayerHP) {
                 logDetails.push("7. Round Sonucu: HP dezavantajı ile Yenilgi.");
                 winner = "p2";
             } else {
                 logDetails.push("7. Round Sonucu: Berabere!");
             }
          }
      }

      // Check for Chronokeeper Round Skip
      const p1Skip = result.sideEffects.p1RoundsSkip || 0;
      const p2Skip = result.sideEffects.p2RoundsSkip || 0;
      const totalSkip = p1Skip + p2Skip;

      if (totalSkip > 0) {
          logDetails.push(`⏳ ZAMAN ATLAMASI: ${totalSkip} Round ileri sarılıyor!`);
      }


      // --- DECAY R5 CHECK ---
      if (prev.round === 5) {
          if (isDecayP1) {
              if (p2Deck.length === 0) {
                  logDetails.push("🔥 DECAY ZAFERİ: Rakip Deste Kül Oldu!");
                  newOpponentHP = 0;
                  winner = "p1";
                  winReasonText = "DECAY_VICTORY";
              } else if (!result.sideEffects.p1NoDeath) {
                  logDetails.push("💀 DECAY CEZASI: Rakip Deste Bitmedi -> ÖLÜM.");
                  newPlayerHP = 0;
                  winner = "p2";
                  winReasonText = "DECAY_DEATH";
              } else {
                  logDetails.push("🛡️ Decay Kurtuldu: NoDeath Aktif!");
              }
          }
          if (isDecayP2) {
              if (p1Deck.length === 0) {
                  logDetails.push("🔥 RAKİP DECAY ZAFERİ!");
                  newPlayerHP = 0;
                  winner = "p2";
                  winReasonText = "DECAY_VICTORY";
              } else if (!result.sideEffects.p2NoDeath) {
                  logDetails.push("💀 Rakip Decay Cezası: Ölüm.");
                  newOpponentHP = 0;
                  winner = "p1";
                  winReasonText = "DECAY_DEATH";
              } else {
                   logDetails.push("🛡️ Rakip Decay Kurtuldu!");
              }
          }
      }

      // --- VESSEL WIN CONDITION ---
      const isVesselP1 = prev.playerClass === "Vessel";
      if (isVesselP1) {
          const deltaSigmaCount = p1Cards.filter(c => c.specialType === "delta" || c.specialType === "sigma").length;
          if (deltaSigmaCount >= 5) {
               logDetails.push("✨ VESSEL ZAFERİ: 5 Efsanevi Parça Birleşti!");
               newOpponentHP = 0;
               winner = "p1";
               winReasonText = "VESSEL_WIN";
          }
      }
      const isVesselP2 = prev.opponentClass === "Vessel";
      if (isVesselP2) {
          const deltaSigmaCount = p2Cards.filter(c => c.specialType === "delta" || c.specialType === "sigma").length;
          if (deltaSigmaCount >= 5) {
               logDetails.push("✨ RAKİP VESSEL ZAFERİ!");
               newPlayerHP = 0;
               winner = "p2";
               winReasonText = "VESSEL_WIN";
          }
      }

      // Augmentor Logic (Buffs)
      // Augmentor Logic (Buffs)
      if (result.sideEffects.p1CardValueBuff) {
           const buff = result.sideEffects.p1CardValueBuff;
           p1Hand = p1Hand.map(c => ({...c, value: (c.value || 0) + buff, isBuffed: true}));
           p1Deck = p1Deck.map(c => ({...c, value: (c.value || 0) + buff, isBuffed: true}));
           logDetails.push(`📈 Augmentor (P1): +${buff} Değer (Tüm Kartlar)!`);
      }
      if (result.sideEffects.p2CardValueBuff) {
           const buff = result.sideEffects.p2CardValueBuff;
           p2Hand = p2Hand.map(c => ({...c, value: (c.value || 0) + buff, isBuffed: true}));
           p2Deck = p2Deck.map(c => ({...c, value: (c.value || 0) + buff, isBuffed: true}));
           logDetails.push(`📈 Augmentor (P2): +${buff} Değer (Tüm Kartlar)!`);
      }

      // Mimic Logic
      const mimicSymbol = MASTER_CLASSES.Mimic.symbol;
      const p1MimicAdded = prev.playerClass === "Mimic" ? p1Cards.filter(c => c.symbol === mimicSymbol).length : 0;
      const p2MimicAdded = prev.opponentClass === "Mimic" ? p2Cards.filter(c => c.symbol === mimicSymbol).length : 0;
      const newMimicP1 = (prev.mimicCounter?.p1 || 0) + p1MimicAdded;
      const newMimicP2 = (prev.mimicCounter?.p2 || 0) + p2MimicAdded;

      let specialWinner = winner;
      if (prev.playerClass === "Mimic" && prev.opponentClass === "Mimic") {
          if (newMimicP1 >= 12 && newMimicP2 < 12) specialWinner = "p1";
          else if (newMimicP2 >= 12 && newMimicP1 < 12) specialWinner = "p2";
          else if (newMimicP1 >= 12 && newMimicP2 >= 12) specialWinner = "draw";
      }

      return {
        ...prev,
        playerHP: newPlayerHP,
        opponentHP: newOpponentHP,
        phase,
        logs: [...(prev.logs || []), ...logDetails],
        winner: specialWinner || (p1InstantWin ? "p1" : (p2InstantWin ? "p2" : (newPlayerHP <= 0 ? "p2" : (newOpponentHP <= 0 ? "p1" : winner)))),
        winReason: winReasonText || prev.winReason,
        playerDeck: p1Deck,
        opponentDeck: p2Deck,
        playerHand: p1Hand,
        opponentHand: p2Hand,
        playerDiceRolls: newPlayerDiceRolls,
        pendingRoundSkip: totalSkip,
        mimicCounter: {
            p1: newMimicP1,
            p2: newMimicP2
        },
        damageResult: {
          playerDamage: result.p1DamageTaken,
          opponentDamage: result.p2DamageTaken,
          details: logDetails
        },
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    setGameState((prev) => {
      if (prev.round >= 7 || prev.playerHP <= 0 || prev.opponentHP <= 0) {
        return { ...prev, phase: "end" };
      }

      // Cards not played carry over (player hand already has unplayed cards)
      // Deal new cards to reach 6 total (IGNORING STOLEN CARDS FOR SIREN, SPECIALS FOR VESSEL)
      const isVesselP1 = prev.playerClass === "Vessel";
      const currentNormalCards = prev.playerHand.filter(c => {
         if (c.isStolen) return false;
         // Vessel keeps Sigma/Delta/Gamma as "Extra"
         if (isVesselP1 && ["sigma", "delta", "gamma"].includes(c.specialType || "")) return false;
         return true;
      }).length;
      const cardsNeeded = Math.max(0, 6 - currentNormalCards);
      
      const isVesselP2 = prev.opponentClass === "Vessel";
      const botNormalCards = prev.opponentHand.filter(c => {
         if (c.isStolen) return false;
         if (isVesselP2 && ["sigma", "delta", "gamma"].includes(c.specialType || "")) return false;
         return true;
      }).length;
      const botCardsNeeded = Math.max(0, 6 - botNormalCards);
      
      const { dealt: playerCards, remaining: playerRemaining } = localDealCards(prev.playerDeck, cardsNeeded);
      const { dealt: opponentCards, remaining: opponentRemaining } = localDealCards(prev.opponentDeck, botCardsNeeded);
      
      return {
        ...prev,
        round: prev.round + 1 + (prev.pendingRoundSkip || 0),
        pendingRoundSkip: 0,
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
        playerDiceRolls: prev.playerClass === "Fateweaver" ? prev.playerDiceRolls : 0,
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

  const rollFate = useCallback(() => {
    setGameState((prev) => {
      // Must be Fateweaver, Round 3+, and have dice
      if (prev.playerClass !== "Fateweaver" || prev.round < 3 || prev.playerDiceRolls < 1) return prev;
      
      let sum = 0;
      // Simulate D6 rolls
      for(let i=0; i<prev.playerDiceRolls; i++) {
        sum += Math.floor(Math.random() * 6) + 1;
      }
      
      const success = sum >= 13 && sum <= 20;
      const logs = [...(prev.logs || [])];
      
      logs.push(`🎲 Fate Roll: ${prev.playerDiceRolls} Zar atıldı. Toplam: ${sum}`);
      
      let newHand = [...prev.playerHand];
      if (success) {
          logs.push("✨ BAŞARILI! (13-20) -> Gamma (γ) kazandın!");
          // Add Gamma Card Reward
             const gammaCard: Card = {
                 id: `special-gamma-reward-${Date.now()}`,
                 name: "Gamma",
                 symbol: "γ",
                 type: "special",
                 specialType: "gamma",
                 value: 0,
                 description: "Invincible. Deal 2x Difference as damage."
             };
          newHand.push(gammaCard);
      } else {
          logs.push("❌ BAŞARISIZ. (Hedef: 13-20)");
      }
      
      // Consume Dice? "Tek turda (Nova)". Implies usage.
      // But maybe we keep generating +2 next turn.
      
      return {
          ...prev,
          playerDiceRolls: 0, // Reset pool after Nova
          logs,
          playerHand: newHand
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
    rollFate,
  };
}
