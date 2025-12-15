export type CardType = "numeric" | "special";
export type SpecialCardType = "twisted" | "deflate" | "gamma" | "delta" | "sigma" | "die";

export type ClassName = 
  | "Vitalist"      // Φ - Green - Tank
  | "Slayer"        // Ω - Red - DPS
  | "Fateweaver"    // Π - White Gold - Gambler
  | "Oracle"        // Ψ - Purple - Self-Mill
  | "Chronokeeper"  // τ - White - Stall
  | "Cryomancer"    // Ξ - Frozen White - Control
  | "Decay"         // ρ - Brown - Mill
  | "Siren"         // η - Pink - Thief
  | "Augmentor"     // Θ - Blue - Scaler
  | "Vessel"        // μ - Orange - Summoner
  | "Mimic";        // ν - Grey - Copycat

export interface Card {
  id: string;
  name: string;
  symbol: string;
  value?: number; // 0 for special cards usually
  type: CardType;
  specialType?: SpecialCardType;
  classSymbol?: string; // To track which class this numeric card belongs to (for scaling)
  description?: string;
  originalOwner?: string; // For Siren/Mimic tracking
  isStolen?: boolean; // For Siren visual effect
  isFrozen?: boolean;
  isCopied?: boolean;
  isBuffed?: boolean; // For Augmentor buff visual
  color?: string;
}

export interface AbilityScale {
  count: number;
  effectDescription: string;
  value?: number; // Numeric value of the effect (damage amount, heal amount, etc.)
}

export interface ClassData {
  name: ClassName;
  color: string;
  symbol: string;
  role: string;
  initialHP: number;
  passiveDescription: string;
  abilityScales: AbilityScale[];
  winCondition: string;
  loseCondition?: string;
  counterLogic?: {
    [key in ClassName]?: string;
  };
}

export interface GameSideEffects {
  p1DamageTaken?: number;
  p2DamageTaken?: number;
  p1SelfDamage?: number;
  p2SelfDamage?: number;
  p1Heal?: number;
  p2Heal?: number;
  p1CardValueBuff?: number;
  p2CardValueBuff?: number;
  p1NoDeath?: boolean;
  p2NoDeath?: boolean;
  p1CardsAdded?: Card[];
  p2CardsAdded?: Card[];
  p1BurnCount?: number;
  p2BurnCount?: number;
  p1FreezeCount?: number;
  p2FreezeCount?: number;
  p1StealCount?: number;
  p2StealCount?: number;
  p1SirenSteal?: number;
  p2SirenSteal?: number;
  p1DrawCount?: number;
  p2DrawCount?: number;
  p1DiceGain?: number;
  p2DiceGain?: number;
  p1GammaReward?: boolean;
  p2GammaReward?: boolean;
  p1RoundsSkip?: number;
  p2RoundsSkip?: number;
  p1ValueBuff?: number;
  p2ValueBuff?: number;
  p1SetMax?: boolean;
  p2SetMax?: boolean;
}

export interface PlayerState {
  id: string;
  className: ClassName;
  hp: number;
  maxHP: number;
  deck: Card[];
  hand: Card[];
  graveyard: Card[]; // Played cards go here
  playedCardsInRound: Card[]; // The 5 cards currently on the board
  wins: number; // For match tracking if needed
  isEliminated: boolean;
  specialStatus?: {
    roundSkipped?: number; // Chronokeeper
    cardsFrozen?: number; // Cryomancer
  };
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
  pendingDiceResult: number | null;
  damageResult: GameResult | null;
  playerClass: ClassName;
  opponentClass: ClassName;
  playerDiceRolls?: number;
  carryOverCards: Card[];
  pendingRoundSkip: number;
  logs: string[];
  mimicCounter?: { p1: number; p2: number };
  winReason?: string;
  winner?: "p1" | "p2" | "draw"; // p1 = player, p2 = opponent
}

export interface ClassAbilityResult {
  hpChange: number;
  logs: string[];
}

export interface GameResult {
  p1DamageTaken: number;
  p2DamageTaken: number;
  logs: string[];
  sideEffects: GameSideEffects;
  abilityResults: {
    p1: ClassAbilityResult;
    p2: ClassAbilityResult;
  };
}
