import { useState, useCallback, useEffect } from "react";
import { Card, ClassName, PlayerState } from "../types/game";
import { SavedDeck } from "../types/deck";
import { MASTER_CLASSES, SPECIAL_CARDS_DATA, shuffleDeck } from "../data/gameData";
import { resolveGameRound, checkCounterWinCondition, applyClassAbility } from "../lib/gameLogic";

// Helper for dealing cards locally
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
  phase: "placement" | "waiting" | "reveal" | "damage" | "end";
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
  timeLeft: number; // 60s Timer
  isOnline: boolean;
}

interface GameInitParams {
  playerDeck: SavedDeck;
  opponentClass: ClassName;
  opponentDeck?: Card[]; // For Online PvP
  isOnline?: boolean;
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

export function useGameState(initParams?: GameInitParams) {
  const [gameState, setGameState] = useState<GameState>(() => {
    let pClass = initParams?.playerDeck.mainClass || "Vitalist";
    const oClass = initParams?.opponentClass || "Slayer";

    // Mimic Identity Swap Logic:
    // If Player is Mimic AND Opponent is NOT Mimic, Player BECOMES the Opponent Class.
    // Mimic vs Mimic remains "Mimic" (Knife Master).
    if (pClass === "Mimic" && oClass !== "Mimic") {
        pClass = oClass;
    }

    // Use injected opponent deck for PvP or create bot deck
    let opponentDeck: Card[];
    if (initParams?.opponentDeck && initParams.opponentDeck.length > 0) {
        // If Online, deck is already randomized/fixed in DB. Do NOT shuffle again locally.
        if (initParams.isOnline) {
            opponentDeck = [...initParams.opponentDeck];
        } else {
            opponentDeck = shuffleDeck([...initParams.opponentDeck]);
        }
    } else {
        opponentDeck = createBotDeck(oClass);
    }
    
    // Bot logic for Mimic Opponent (if bot is Mimic)
    if (oClass === "Mimic" && !initParams?.opponentDeck) {
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
    const originalPClass = initParams?.playerDeck.mainClass || "Vitalist";

    if (originalPClass === "Mimic" && oClass !== "Mimic") {
        // Mimic Identity Swap: Fully become the opponent (including Deck)
        // We act exactly like them, so we use their deck.
        playerDeck = opponentDeck.map(c => ({
            ...c,
            id: `mimic-copy-${c.id}-${Date.now()}-${Math.random()}`
        }));
        playerDeck = shuffleDeck(playerDeck);
    } else if (pClass === "Mimic") {
        // Mimic vs Mimic Case:
        // Copy Opponent's Deck + Add 6 Extra Mimic Cards (Knife Master Logic)
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
        
        // Clone opponent deck
        const opponentClones = opponentDeck.map(c => ({
            ...c, 
            id: `mimicked-${c.id}-${Date.now()}`
        }));
        
        playerDeck = shuffleDeck([...opponentClones, ...mimicCards]);
    } else {
        // Normal Case
        const inputCards = initParams?.playerDeck.cards;
        if (inputCards && inputCards.length > 0) {
            if (initParams?.isOnline) {
                playerDeck = [...inputCards];
            } else {
                playerDeck = shuffleDeck([...inputCards]);
            }
        } else {
            playerDeck = createBotDeck(pClass);
        }
    }
    
    // Deal cards for round 1
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
      timeLeft: 45,
      isOnline: !!initParams?.isOnline,
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
        if (prev.isOnline) {
            return { ...prev, phase: "waiting" };
        }

      // Bot Logic: Strategic placement
      const botField: (Card | null)[] = [null, null, null, null, null];
      const maxCapacity = prev.opponentMust4Cards ? 4 : 5;
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
      
      const cardsToPlace = Math.min(targetCount, prev.opponentHand.length);
      const sortedHand = [...prev.opponentHand].sort((a, b) => (b.value || 0) - (a.value || 0));
      const botHandToPlay = sortedHand.slice(0, cardsToPlace);
      
      const shuffledPlay = botHandToPlay.sort(() => Math.random() - 0.5);
      const availableSlots = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
      shuffledPlay.forEach((c, i) => {
          botField[availableSlots[i]] = c;
      });
      
      const remainingBotHand = prev.opponentHand.filter(c => !botHandToPlay.includes(c));
      
      return {
        ...prev,
        opponentField: botField,
        opponentHand: remainingBotHand,
        phase: "reveal",
      };
    });
  }, []);

  const calculateRoundDamage = useCallback(() => {
    setGameState((prev) => {
      const p1Cards = prev.playerField.filter((c): c is Card => c !== null);
      const p2Cards = prev.opponentField.filter((c): c is Card => c !== null);

      const effectiveP1Class = (prev.playerClass === "Mimic" && prev.opponentClass !== "Mimic") ? prev.opponentClass : prev.playerClass;
      
      const result = resolveGameRound(p1Cards, p2Cards, effectiveP1Class, prev.opponentClass);

      let newPlayerHP = prev.playerHP;
      let newOpponentHP = prev.opponentHP;
      
      let winner: "p1" | "p2" | "draw" | undefined = undefined;
      let winReasonText: string | undefined = undefined;

      newPlayerHP += result.abilityResults.p1.hpChange;
      newOpponentHP += result.abilityResults.p2.hpChange;

      newPlayerHP = Math.max(0, newPlayerHP - result.p1DamageTaken);
      newOpponentHP = Math.max(0, newOpponentHP - result.p2DamageTaken);

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

      // Class Logic (Siren, Fateweaver, etc.)
      if (prev.playerClass === "Siren" && p1Cards.filter(c => c.isStolen).length >= 5) {
          logDetails.push("❤️ KADERİN KALBİNE HÜKMETTİM: Siren Kazandı!");
          newOpponentHP = 0;
          if (newPlayerHP <= 0) {
             newPlayerHP = 1;
             logDetails.push("❤️ Aşk Ölümden Güçlüdür: Siren Hayatta!");
          }
      }

      let phase: "placement" | "waiting" | "reveal" | "damage" | "end" = newPlayerHP <= 0 || newOpponentHP <= 0 ? "end" : "damage";

      if (p1InstantWin) {
        newOpponentHP = 0;
        if (newPlayerHP <= 0) newPlayerHP = 1;
        phase = "end";
        logDetails.push(`🏆 ${prev.playerClass} kazanma koşulunu sağladı!`);
      }
      if (p2InstantWin) {
        newPlayerHP = 0;
        phase = "end";
        logDetails.push(`💀 ${prev.opponentClass} kazanma koşulunu sağladı!`);
      }

      if (prev.round === 6) {
          if (prev.playerClass === "Siren") {
              newPlayerHP = Math.max(0, newPlayerHP - 5);
              logDetails.push("🧜‍♀️ LANET: Siren 6. Turda 5 Hasar yedi!");
          }
          if (prev.opponentClass === "Siren") {
              newOpponentHP = Math.max(0, newOpponentHP - 5);
              logDetails.push("🧜‍♀️ LANET: Rakip Siren 6. Turda 5 Hasar yedi!");
          }
      }

      // Determine winner based on HP if not already set
      if (!winner && (newPlayerHP <= 0 || newOpponentHP <= 0)) {
          if (newPlayerHP <= 0 && newOpponentHP <= 0) winner = "draw";
          else if (newPlayerHP <= 0) winner = "p2";
          else if (newOpponentHP <= 0) winner = "p1";
      }


      // Side Effects
      let p1Deck = [...prev.playerDeck];
      let p2Deck = [...prev.opponentDeck];
      let p1Hand = [...prev.playerHand];
      let p2Hand = [...prev.opponentHand];

      if (result.sideEffects.p1SirenSteal) {
          const count = result.sideEffects.p1SirenSteal;
          const stolen = p2Deck.slice(0, count).map(c => ({ ...c, isStolen: true, originalOwner: "p2" }));
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

      if (result.sideEffects.p1DrawCount) {
          const count = result.sideEffects.p1DrawCount;
          const drawn = p1Deck.slice(0, count);
          p1Deck = p1Deck.slice(count);
          p1Hand.push(...drawn);
          logDetails.push(`🔮 Oracle geleceği gördü: ${count} kart çekti!`);
          
          if (p1Deck.length === 0 && prev.playerClass === "Oracle") {
             logDetails.push("🔮 KEHANET GERÇEKLEŞTİ: Deste bitti! ORACLE KAZANDI!");
             newOpponentHP = 0;
             winner = "p1";
             winReasonText = "ORACLE_WIN";
             phase = "end";
          }
      }

       if (result.sideEffects.p2DrawCount) {
          const count = result.sideEffects.p2DrawCount;
          const drawn = p2Deck.slice(0, count);
          p2Deck = p2Deck.slice(count);
          p2Hand.push(...drawn);
          logDetails.push(`🔮 Rakip Oracle kart çekiyor: ${count}`);
          
          if (p2Deck.length === 0 && prev.opponentClass === "Oracle") {
              logDetails.push("🔮 RAKİP KEHANETİ TAMAMLADI: Oracle Kazandı!");
              newPlayerHP = 0;
              winner = "p2";
              winReasonText = "ORACLE_WIN";
              phase = "end";
          }
      }

      if (result.sideEffects.p1BurnCount) {
          const count = result.sideEffects.p1BurnCount;
          p2Deck = p2Deck.slice(count);
          logDetails.push(`🔥 Decay (P1): ${count} kart YAKTI!`);
      }
      if (result.sideEffects.p2BurnCount) {
          const count = result.sideEffects.p2BurnCount;
          p1Deck = p1Deck.slice(count);
          logDetails.push(`🔥 Decay (P2): ${count} kart YAKTI!`);
      }

      const isDecayP1 = prev.playerClass === "Decay";
      const isDecayP2 = prev.opponentClass === "Decay";

      let newPlayerDiceRolls = prev.playerClass === "Fateweaver" ? (prev.playerDiceRolls || 0) : 0;
      
      if (result.sideEffects.p1DiceGain) {
          const gain = result.sideEffects.p1DiceGain;
          newPlayerDiceRolls += gain; 
          logDetails.push(`🎲 Fateweaver Zarları Topluyor: +${gain} Zar Hakkı!`);
      }
      if (result.sideEffects.p1GammaReward) {
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

      if (result.sideEffects.p1CardsAdded) {
          p1Hand.push(...result.sideEffects.p1CardsAdded);
          logDetails.push(`🌌 Vessel Kozmik Gücü: ${result.sideEffects.p1CardsAdded.length} özel kart elde edildi!`);
      }
      if (result.sideEffects.p2CardsAdded) {
          p2Hand.push(...result.sideEffects.p2CardsAdded);
          logDetails.push(`🌌 Rakip Vessel Kozmik Gücü: ${result.sideEffects.p2CardsAdded.length} kart elde etti!`);
      }


      
      if (prev.round >= 7) {
          if (prev.playerClass === "Vitalist" && newPlayerHP > 0) {
              logDetails.push("🌿 Vitalist 7. Raundu gördü! DOĞA KAZANDI!");
              winner = "p1";
          } else if (prev.playerClass === "Chronokeeper" && newPlayerHP > 0) {
              logDetails.push("⏳ Chronokeeper zamanın efendisi oldu! KAZANDINIZ!");
              winner = "p1";
          } else {
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

      const p1Skip = result.sideEffects.p1RoundsSkip || 0;
      const p2Skip = result.sideEffects.p2RoundsSkip || 0;
      const totalSkip = p1Skip + p2Skip;

      if (totalSkip > 0) {
          logDetails.push(`⏳ ZAMAN ATLAMASI: ${totalSkip} Round ileri sarılıyor!`);
      }

      if (prev.round === 5) {
          if (isDecayP1) {
              if (p2Deck.length === 0) {
                  logDetails.push("🔥 DECAY ZAFERİ: Rakip Deste Kül Oldu!");
                  newOpponentHP = 0;
                  winner = "p1";
                  winReasonText = "DECAY_VICTORY";
                  phase = "end";
              } else if (!result.sideEffects.p1NoDeath) {
                  logDetails.push("💀 DECAY CEZASI: Rakip Deste Bitmedi -> ÖLÜM.");
                  newPlayerHP = 0;
                  winner = "p2";
                  winReasonText = "DECAY_DEATH";
                  phase = "end";
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
              }
          }
      }

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

      const mimicSymbol = MASTER_CLASSES.Mimic.symbol;
      const p1MimicAdded = prev.playerClass === "Mimic" ? p1Cards.filter(c => c.symbol === mimicSymbol).length : 0;
      const p2MimicAdded = prev.opponentClass === "Mimic" ? p2Cards.filter(c => c.symbol === mimicSymbol).length : 0;
      const newMimicP1 = (prev.mimicCounter?.p1 || 0) + p1MimicAdded;
      const newMimicP2 = (prev.mimicCounter?.p2 || 0) + p2MimicAdded;

      // Mimic Copy Logic
      if (prev.playerClass === "Mimic" && p1MimicAdded >= 2) {
          const copyCount = p1MimicAdded - 1; // 2->1, 3->2, 4->3, 5->4
          if (copyCount > 0 && p2Deck.length > 0) {
              const available = [...p2Deck];
              const copied: Card[] = [];
              for (let i = 0; i < copyCount; i++) {
                  if (available.length === 0) break;
                  const idx = Math.floor(Math.random() * available.length);
                  const card = available.splice(idx, 1)[0];
                  copied.push({
                      ...card,
                      id: `copied-${card.id}-${Date.now()}-${i}`,
                      isCopied: true, // Mark as copied
                      isStolen: false // Distinct from stolen
                  });
              }
              p1Hand.push(...copied);
              logDetails.push(`🎭 Mimic (P1): ${copied.length} kart kopyaladı!`);
          }
      }

       if (prev.opponentClass === "Mimic" && p2MimicAdded >= 2) {
          const copyCount = p2MimicAdded - 1;
          if (copyCount > 0 && p1Deck.length > 0) {
              const available = [...p1Deck];
              const copied: Card[] = [];
              for (let i = 0; i < copyCount; i++) {
                  if (available.length === 0) break;
                  const idx = Math.floor(Math.random() * available.length);
                  const card = available.splice(idx, 1)[0];
                  copied.push({
                      ...card,
                      id: `copied-bot-${card.id}-${Date.now()}-${i}`,
                      isCopied: true,
                      isStolen: false
                  });
              }
              p2Hand.push(...copied);
              logDetails.push(`🎭 Rakip Mimic: ${copied.length} kart kopyaladı!`);
          }
      }

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
        winner: (winReasonText === "ORACLE_WIN" || prev.winReason === "ORACLE_WIN") ? "p1" : (specialWinner || (p1InstantWin ? "p1" : (p2InstantWin ? "p2" : (newPlayerHP <= 0 ? "p2" : (newOpponentHP <= 0 ? "p1" : winner))))),
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

  const syncOnlineRound = useCallback((opponentField: (Card | null)[]) => {
      setGameState(prev => {
          return {
              ...prev,
              opponentField,
              phase: "reveal"
          };
      });
      // Trigger damage calculation after a short delay to allow field visual update
      setTimeout(() => calculateRoundDamage(), 500);
  }, [calculateRoundDamage]);

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.phase === "placement" && gameState.timeLeft > 0) {
      timer = setInterval(() => {
        setGameState(prev => {
            if (prev.phase !== "placement" || prev.timeLeft <= 0) return prev;
            
            if (prev.timeLeft === 1) {
                return { ...prev, timeLeft: 0 };
            }
            return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState.phase, gameState.timeLeft, endPlacement]);


  const nextRound = useCallback(() => {
    setGameState((prev) => {
      if (prev.round >= 7 || prev.playerHP <= 0 || prev.opponentHP <= 0) {
        return { ...prev, phase: "end" };
      }

      // P1 Draw Logic
      const isVesselP1 = prev.playerClass === "Vessel";
      const isOracleP1 = prev.playerClass === "Oracle";
      const p1BaseCap = 6; // Standard cap for everyone
      
      const currentNormalCards = prev.playerHand.filter(c => {
         if (c.isStolen) return false;
         if (c.isCopied) return false;
         if (isVesselP1 && ["sigma", "delta", "gamma"].includes(c.specialType || "")) return false;
         return true;
      }).length;
      
      let cardsNeeded = Math.max(0, p1BaseCap - currentNormalCards);
      
      // Oracle Passive: Always draw +2 cards ON TOP of the standard refill
      // If hand is full (e.g. 6 cards), refill is 0, but Oracle still draws 2.
      if (isOracleP1) {
          cardsNeeded += 2;
      }
      
      // P2 Draw Logic
      const isVesselP2 = prev.opponentClass === "Vessel";
      const isOracleP2 = prev.opponentClass === "Oracle";
      const p2BaseCap = 6;

      const botNormalCards = prev.opponentHand.filter(c => {
         if (c.isStolen) return false;
         if (c.isCopied) return false;
         if (isVesselP2 && ["sigma", "delta", "gamma"].includes(c.specialType || "")) return false;
         return true;
      }).length;
      
      let botCardsNeeded = Math.max(0, p2BaseCap - botNormalCards);
      
      if (isOracleP2) {
          botCardsNeeded += 2;
      }
      
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
        timeLeft: 45,
      };
    });
  }, []);

  const handleCardSelection = useCallback((selectedIndices: number[]) => {
    setGameState(prev => {
      if (selectedIndices.length !== 2) return { ...prev, cardSelectionMode: false };
      
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

  const rollDice = useCallback(() => {
    setGameState((prev) => {
      const isFateweaverBehavior = prev.playerClass === "Fateweaver" || (prev.playerClass === "Mimic" && prev.opponentClass === "Fateweaver");
      
      if (isFateweaverBehavior) {
        if ((prev.playerDiceRolls || 0) <= 0) return prev;
      }
      
      if (prev.diceUsed >= 2 && !isFateweaverBehavior) {
        return prev;
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
      };
    });
  }, []);

  const cancelDiceResult = useCallback(() => {
    setGameState((prev) => ({ ...prev, pendingDiceResult: null }));
  }, []);

  const rollFate = useCallback(() => {
    setGameState((prev) => {
      if (prev.playerClass !== "Fateweaver" || prev.round < 3 || prev.playerDiceRolls < 1) return prev;
      
      let sum = 0;
      for(let i=0; i<prev.playerDiceRolls; i++) {
        sum += Math.floor(Math.random() * 6) + 1;
      }
      
      const success = sum >= 13 && sum <= 20;
      const logs = [...(prev.logs || [])];
      
      logs.push(`🎲 Fate Roll: ${prev.playerDiceRolls} Zar atıldı. Toplam: ${sum}`);
      
      let newHand = [...prev.playerHand];
      if (success) {
          logs.push("✨ BAŞARILI! (13-20) -> Gamma (γ) kazandın!");
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
      
      return {
          ...prev,
          playerDiceRolls: 0,
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
    syncOnlineRound,
    rollFate,
  };
}
