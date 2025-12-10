import { ClassData, ClassName, Card, SpecialCardType } from "../types/game";

export const MASTER_CLASSES: Record<ClassName, ClassData> = {
  Vitalist: {
    name: "Vitalist",
    color: "#22c55e", // Green
    symbol: "Φ",
    role: "Tank",
    initialHP: 40,
    passiveDescription: "Starts with 40 HP.",
    abilityScales: [
      { count: 1, effectDescription: "0 Healing" },
      { count: 2, effectDescription: "+4 Healing", value: 4 },
      { count: 3, effectDescription: "+6 Healing", value: 6 },
      { count: 4, effectDescription: "+8 Healing", value: 8 },
      { count: 5, effectDescription: "+15 Healing", value: 15 },
    ],
    winCondition: "Round 6 End: HP > Opponent HP",
    counterLogic: {
      Slayer: "Must have LESS HP than Slayer to win.",
      Chronokeeper: "First to play 5-card flush wins instantly.",
    },
  },
  Slayer: {
    name: "Slayer",
    color: "#ef4444", // Red
    symbol: "Ω",
    role: "DPS / Anti-Meta",
    initialHP: 30,
    passiveDescription: "Immune to Twisted (α) reflection.",
    abilityScales: [
      { count: 1, effectDescription: "0 Damage" },
      { count: 2, effectDescription: "3 Damage", value: 3 },
      { count: 3, effectDescription: "5 Damage", value: 5 },
      { count: 4, effectDescription: "8 Damage", value: 8 },
      { count: 5, effectDescription: "12 Damage (Burst)", value: 12 },
    ],
    winCondition: "Deal 12+ total damage in a single turn.",
    loseCondition: "If 5-card flush & Self HP > Opponent HP.",
    counterLogic: {
      Vitalist: "Must have MORE HP than Vitalist to win.",
    },
  },
  Fateweaver: {
    name: "Fateweaver",
    color: "#fef08a", // White Gold
    symbol: "Π",
    role: "Gambler",
    initialHP: 30,
    passiveDescription: "Can roll dice from Round 3+.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "+2 Rolls", value: 2 },
      { count: 3, effectDescription: "+4 Rolls", value: 4 },
      { count: 4, effectDescription: "+7 Rolls", value: 7 },
      { count: 5, effectDescription: "+8 Rolls & Add Gamma", value: 8 },
    ],
    winCondition: "Play 5 Gamma (γ) cards in one turn.",
  },
  Oracle: {
    name: "Oracle",
    color: "#a855f7", // Purple
    symbol: "Ψ",
    role: "Combo / Self-Mill",
    initialHP: 30,
    passiveDescription: "Draw/Mill mechanic.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "2 Dmg / Draw 2", value: 2 },
      { count: 3, effectDescription: "3 Dmg / Draw 3", value: 3 },
      { count: 4, effectDescription: "4 Dmg / Draw 4", value: 4 },
      { count: 5, effectDescription: "10 Dmg / Draw 5", value: 10 },
    ],
    winCondition: "Empty own deck before Round 4 ends.",
    counterLogic: {
      Vitalist: "Deck empty deals 25 Pure Dmg instead of win.",
      Incinerator: "Burnt deck does not count as win.",
    },
  },
  Chronokeeper: {
    name: "Chronokeeper",
    color: "#ffffff", // Transparent/White
    symbol: "τ",
    role: "Stall",
    initialHP: 20,
    passiveDescription: "Starts with 20 HP.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "Delete 0 Rounds" },
      { count: 3, effectDescription: "Delete 1 Round" },
      { count: 4, effectDescription: "Delete 2 Rounds" },
      { count: 5, effectDescription: "Delete 3 Rounds" },
    ],
    winCondition: "Survive until Round 6 end.",
    counterLogic: {
      Vitalist: "Play 5-card flush before Vitalist to win instantly.",
    },
  },
  Cryomancer: {
    name: "Cryomancer",
    color: "#bae6fd", // Frozen White
    symbol: "Ξ",
    role: "Hard Control",
    initialHP: 30,
    passiveDescription: "Freezes opponent cards.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "Freeze 2 cards" },
      { count: 3, effectDescription: "Freeze 2 Random + 1 Chosen" },
      { count: 4, effectDescription: "Freeze 2 Random + 2 Chosen" },
      { count: 5, effectDescription: "Freeze ALL opponent cards" },
    ],
    winCondition: "Freeze 3 Special Cards in one turn.",
  },
  Incinerator: {
    name: "Incinerator",
    color: "#78350f", // Brown
    symbol: "ρ",
    role: "Aggro Miller",
    initialHP: 30,
    passiveDescription: "Burns opponent deck.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "Burn 3 cards" },
      { count: 3, effectDescription: "Burn 4 cards" },
      { count: 4, effectDescription: "Burn 5 cards" },
      { count: 5, effectDescription: "Burn 8 cards & Cancel LoseCon" },
    ],
    winCondition: "Opponent has 0 cards at start of Round 4.",
    loseCondition: "Die if opponent has cards at start of Round 4 (unless 5-card flush used).",
    counterLogic: {
      Oracle: "Burning Oracle deck continues game.",
    },
  },
  Siren: {
    name: "Siren",
    color: "#ec4899", // Pink
    symbol: "η",
    role: "Thief",
    initialHP: 30,
    passiveDescription: "Steals cards.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "Steal 2 cards" },
      { count: 3, effectDescription: "Steal 3 cards" },
      { count: 4, effectDescription: "Steal 4 cards" },
      { count: 5, effectDescription: "Steal 5 cards" },
    ],
    winCondition: "Play 5 Stolen Cards.",
    loseCondition: "Take 10 Dmg automatically at Round 4.",
  },
  Augmentor: {
    name: "Augmentor",
    color: "#3b82f6", // Blue
    symbol: "Θ",
    role: "Scaler",
    initialHP: 30,
    passiveDescription: "Buffs card values.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "+1 Value to Deck" },
      { count: 3, effectDescription: "+2 Value to Deck" },
      { count: 4, effectDescription: "+3 Value to Deck" },
      { count: 5, effectDescription: "Set one card to 30 OR +6 to one" },
    ],
    winCondition: "Play a Class Card with value 9.",
  },
  Conjurer: {
    name: "Conjurer",
    color: "#f97316", // Orange
    symbol: "μ",
    role: "Summoner",
    initialHP: 30,
    passiveDescription: "Summons special cards.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "Summon Special Cards" },
      { count: 3, effectDescription: "Summon Special Cards" },
      { count: 4, effectDescription: "Summon Special Cards" },
      { count: 5, effectDescription: "Summon 5 Special + 1 Gamma" },
    ],
    winCondition: "Play Sigma (Σ) and Delta (Δ) together.",
  },
  Mimic: {
    name: "Mimic",
    color: "#9ca3af", // Grey
    symbol: "ν",
    role: "Copycat",
    initialHP: 30,
    passiveDescription: "Copies opponent moves.",
    abilityScales: [
      { count: 1, effectDescription: "No Effect" },
      { count: 2, effectDescription: "Copy/Steal played cards" },
      { count: 3, effectDescription: "Copy/Steal played cards" },
      { count: 4, effectDescription: "Copy/Steal played cards" },
      { count: 5, effectDescription: "Copy/Steal played cards" },
    ],
    winCondition: "Achieve Opponent's WinCon before them.",
    counterLogic: {
      Fateweaver: "Copies Dice odds and abilities.",
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

