import { ClassData, ClassName, Card, SpecialCardType } from "../types/game";

export const MASTER_CLASSES: Record<ClassName, ClassData> = {
  Vitalist: {
    name: "Vitalist",
    color: "#22c55e", // Green
    symbol: "Φ",
    role: "Tank",
    initialHP: 50,
    passiveDescription: "Start 50 HP.",
    abilityScales: [
        { count: 1, effectDescription: "0 Can" },
        { count: 2, effectDescription: "+4 Can", value: 4 },
        { count: 3, effectDescription: "+6 Can", value: 6 },
        { count: 4, effectDescription: "+8 Can", value: 8 },
        { count: 5, effectDescription: "+15 Can", value: 15 },
    ],
    winCondition: "7. Raundu Gör",
    counterLogic: {
      Slayer: "Must have LESS HP than Slayer to win.",
    },
  },
  Slayer: {
    name: "Slayer",
    color: "#ef4444", // Red
    symbol: "Ω",
    role: "DPS / Anti-Meta",
    initialHP: 40,
    passiveDescription: "Immune to Twisted (α).",
    abilityScales: [
        { count: 1, effectDescription: "0 Dmg" },
        { count: 2, effectDescription: "3 Dmg", value: 3 },
        { count: 3, effectDescription: "5 Dmg", value: 5 },
        { count: 4, effectDescription: "8 Dmg", value: 8 },
        { count: 5, effectDescription: "12 Dmg", value: 12 },
    ],
    winCondition: "Tek turda 12+ Hasar",
    loseCondition: "If 12 Dmg & Self HP > Opp HP.",
    counterLogic: {
      Vitalist: "Must have MORE HP than Vitalist to win.",
    },
  },
  Fateweaver: {
    name: "Fateweaver",
    color: "#fbbf24", // Amber/Gold
    symbol: "Π",
    role: "Gambler / Late Carry",
    initialHP: 40,
    passiveDescription: "Zar (13-20) Round 3'te açılır.",
    abilityScales: [
        { count: 1, effectDescription: "-" },
        { count: 2, effectDescription: "+2 Zar Hakkı", value: 2 },
        { count: 3, effectDescription: "+3 Zar Hakkı", value: 3 },
        { count: 4, effectDescription: "+5 Zar Hakkı", value: 5 },
        { count: 5, effectDescription: "+6 Hak + 1 Gamma (γ)", value: 6 },
    ],
    winCondition: "5 Gamma (γ) Oyna",
  },
  Oracle: {
    name: "Oracle",
    color: "#a855f7", // Purple
    symbol: "Ψ",
    role: "Combo / Self-Mill",
    initialHP: 40,
    passiveDescription: "Draw/Mill.",
    abilityScales: [
        { count: 1, effectDescription: "0 Dmg/Draw", value: 0 },
        { count: 2, effectDescription: "2 Dmg/Draw", value: 2 },
        { count: 3, effectDescription: "3 Dmg/Draw", value: 3 },
        { count: 4, effectDescription: "4 Dmg/Draw", value: 4 },
        { count: 5, effectDescription: "10 Dmg + 5 Draw", value: 10 },
    ],
    winCondition: "Deste Bitir",
    counterLogic: {
      Vitalist: "Empty Deck = 25 Pure Dmg.",
    },
  },
  Chronokeeper: {
    name: "Chronokeeper",
    color: "#ffffff", // Transparent/White
    symbol: "τ",
    role: "Stall",
    initialHP: 30,
    passiveDescription: "Skip Rounds.",
    abilityScales: [
        { count: 1, effectDescription: "-" },
        { count: 2, effectDescription: "0 Sil" },
        { count: 3, effectDescription: "1 Rnd Sil" },
        { count: 4, effectDescription: "2 Rnd Sil" },
        { count: 5, effectDescription: "3 Rnd Sil" },
    ],
    winCondition: "7. Raundu Gör",
  },
  Cryomancer: { // Fixed Missing Class
    name: "Cryomancer",
    color: "#bae6fd", // Ice Blue
    symbol: "Ξ",
    role: "Control",
    initialHP: 40,
    passiveDescription: "Freezes.",
    abilityScales: [
        { count: 1, effectDescription: "-" },
        { count: 2, effectDescription: "2 Dondur" },
        { count: 3, effectDescription: "3 Dondur" },
        { count: 4, effectDescription: "4 Dondur" },
        { count: 5, effectDescription: "TÜMÜNÜ Dondur" },
    ],
    winCondition: "3 Özel Kart Dondur",
  },
  Incinerator: {
    name: "Incinerator",
    color: "#78350f", // Brown
    symbol: "ρ",
    role: "Aggro Miller",
    initialHP: 40,
    passiveDescription: "Burns deck.",
    abilityScales: [
        { count: 1, effectDescription: "-" },
        { count: 2, effectDescription: "3 Yak" },
        { count: 3, effectDescription: "4 Yak" },
        { count: 4, effectDescription: "5 Yak" },
        { count: 5, effectDescription: "8 Yak + NoDeath" },
    ],
    winCondition: "R4 Rakip Deste 0",
    loseCondition: "Die if opponent has cards at R4.",
  },
  Siren: {
    name: "Siren",
    color: "#ec4899", // Pink
    symbol: "η",
    role: "Thief",
    initialHP: 40,
    passiveDescription: "Steals cards. Takes 5 Dmg at R4.",
    abilityScales: [
        { count: 1, effectDescription: "-" },
        { count: 2, effectDescription: "2 Çal" },
        { count: 3, effectDescription: "3 Çal" },
        { count: 4, effectDescription: "4 Çal" },
        { count: 5, effectDescription: "5 Çal" },
    ],
    winCondition: "5 Çalıntı Kart Oyna",
  },
  Augmentor: {
    name: "Augmentor",
    color: "#3b82f6", // Blue
    symbol: "Θ",
    role: "Scaler",
    initialHP: 40,
    passiveDescription: "Buffs card values.",
    abilityScales: [
        { count: 1, effectDescription: "-" },
        { count: 2, effectDescription: "+1 Değer" },
        { count: 3, effectDescription: "+2 Değer" },
        { count: 4, effectDescription: "+3 Değer" },
        { count: 5, effectDescription: "+6 Değer / Set 30" },
    ],
    winCondition: "9 Değerli Kart Oyna",
  },
  Conjurer: {
    name: "Conjurer",
    color: "#f97316", // Orange
    symbol: "μ",
    role: "Summoner",
    initialHP: 40,
    passiveDescription: "Summons.",
    abilityScales: [
        { count: 1, effectDescription: "-" },
        { count: 2, effectDescription: "Random" },
        { count: 3, effectDescription: "Random" },
        { count: 4, effectDescription: "Random" },
        { count: 5, effectDescription: "5 Kart + Gamma" },
    ],
    winCondition: "Sigma + Delta Kombo",
  },
  Mimic: {
    name: "Mimic",
    color: "#9ca3af", // Grey
    symbol: "ν",
    role: "Copycat",
    initialHP: 40,
    passiveDescription: "Kopies Opp Deck + 6 Mimic Cards (Total 36).",
    abilityScales: [
        { count: 1, effectDescription: "-" },
        { count: 2, effectDescription: "Kopyala" },
        { count: 3, effectDescription: "Kopyala" },
        { count: 4, effectDescription: "Kopyala" },
        { count: 5, effectDescription: "Kopyala" },
    ],
    winCondition: "Rakip WinCon",
    counterLogic: {
      Fateweaver: "Copies Dice odds.",
    },
  },
};

export const SPECIAL_CARDS_DATA: Record<SpecialCardType, { symbol: string; name: string; description: string }> = {
  twisted: { symbol: "α", name: "Twisted", description: "Reflects damage if yours is lower." },
  deflate: { symbol: "β", name: "Deflate", description: "Cancels all special cards this round." },
  gamma: { symbol: "γ", name: "Gamma", description: "Invincible. Deal 2x Difference as damage." },
  die: { symbol: "Π", name: "The Die", description: "Fateweaver only. R3+." },
  delta: { symbol: "Δ", name: "Delta", description: "Amplifies damage difference." },
  sigma: { symbol: "Σ", name: "Sigma", description: "Reverses damage difference." },
};

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createDeck(className: ClassName): Card[] {
  const classData = MASTER_CLASSES[className];
  const deck: Card[] = [];
  
  // 1. Class Cards (6 cards) - Let's assume values 1-6? Or just Generic Class Cards?
  // "Sınıf kartlarının sayısı... o turun yetenek gücünü belirler." 
  // Maybe they have numeric values 1-6 too? The prompt says "Sınıf kartlarının sayısı (1'den 5'e kadar)".
  // Let's make them numeric 1-6 so they contribute to total value too.
  for (let i = 1; i <= 6; i++) {
    deck.push({
      id: `${className}-class-${i}-${Date.now()}`,
      name: `${classData.name} Card`,
      symbol: classData.symbol,
      value: i, // Assuming they add value
      type: "numeric",
      classSymbol: classData.symbol,
      color: classData.color
    });
  }

  // 2. Special Cards (6 cards)
  // Which ones? "6 Özel Kart". Maybe random selection or fixed set?
  // The Prompt lists twisted, deflate, delta, sigma. 
  // Let's give a mix: 2 Twisted, 1 Deflate, 1 Delta, 1 Sigma, 1 Random?
  // Or maybe class specific? 
  // Vitalist "Vitalist kazanmak için Slayer'dan DAHA AZ canda kalmalıdır".
  // Let's add a standard set for now.
  const specialTypes: SpecialCardType[] = ["twisted", "twisted", "deflate", "delta", "sigma", "twisted"];
  // If Fateweaver, swap one for "die" maybe? or "gamma"? Gamma comes from Die. Die is R3+.
  // Let's use the standard set.
  specialTypes.forEach((type, idx) => {
     deck.push({
       id: `special-${type}-${idx}-${Date.now()}`,
       name: SPECIAL_CARDS_DATA[type].name,
       symbol: SPECIAL_CARDS_DATA[type].symbol,
       type: "special",
       specialType: type,
       value: 0,
       description: SPECIAL_CARDS_DATA[type].description
     });
  });

  // 3. Filler Cards (18 cards)
  // Standard numeric cards? 1-9 twice? 18 cards.
  for (let i = 1; i <= 18; i++) {
     const value = (i % 9) + 1; // 1-9 range
     deck.push({
       id: `filler-${i}-${Date.now()}`,
       name: "Standard",
       symbol: value.toString(),
       value: value,
       type: "numeric"
     });
  }

  return shuffleDeck(deck);
}

