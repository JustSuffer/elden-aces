export type CardType = "numeric" | "special";
export type SpecialCardType = "twisted" | "deflate" | "gamma" | "delta" | "sigma" | "die";

export type ClassName = 
  | "Vitalist"      // Φ - Green - Tank
  | "Slayer"        // Ω - Red - DPS
  | "Fateweaver"    // Π - White Gold - Gambler
  | "Oracle"        // Ψ - Purple - Self-Mill
  | "Chronokeeper"  // τ - White - Stall
  | "Cryomancer"    // Ξ - Frozen White - Control
  | "Incinerator"   // ρ - Brown - Mill
  | "Siren"         // η - Pink - Thief
  | "Augmentor"     // Θ - Blue - Scaler
  | "Conjurer"      // μ - Orange - Summoner
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
  p1Heal?: number;
  p2Heal?: number;
  p1CardsAdded?: Card[];
  p2CardsAdded?: Card[];
  p1BurnCount?: number;
  p2BurnCount?: number;
  p1SirenSteal?: number;
  p2SirenSteal?: number;
  p1DrawCount?: number;
  p2DrawCount?: number;
  p1DiceGain?: number;
  p2DiceGain?: number;
  p1GammaReward?: boolean;
  p1RoundsSkip?: number;
  p2RoundsSkip?: number;
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
  round: number; // Current round (1-6)
  maxRounds: number;
  players: {
    player: PlayerState;
    opponent: PlayerState;
  };
  phase: "setup" | "draw" | "play" | "resolve" | "end";
  winner?: string; // Player ID
  logs: string[];
  playerDiceRolls?: number;
  diceUsed?: number;
  playerMust4Cards?: boolean;
  pendingRoundSkip?: number;
}
