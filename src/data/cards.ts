import { SpecialCardType } from "@/types/game";

export interface Card {
  id: string;
  name: string;
  symbol: string;
  value?: number;
  type: "numeric" | "special";
  special?: string;
  specialType?: SpecialCardType;
  description?: string;
  color?: string;
  classSymbol?: string;
  originalOwner?: string;
  isFrozen?: boolean;
}

export const DECK: Card[] = [
  // Φ (Phi) - Gold/Harmony
  { id: "phi-1", name: "Phi 1", symbol: "Φ", value: 1, type: "numeric", color: "phi" },
  { id: "phi-2", name: "Phi 2", symbol: "Φ", value: 2, type: "numeric", color: "phi" },
  { id: "phi-3", name: "Phi 3", symbol: "Φ", value: 3, type: "numeric", color: "phi" },
  { id: "phi-4", name: "Phi 4", symbol: "Φ", value: 4, type: "numeric", color: "phi" },
  { id: "phi-5", name: "Phi 5", symbol: "Φ", value: 5, type: "numeric", color: "phi" },
  { id: "phi-6", name: "Phi 6", symbol: "Φ", value: 6, type: "numeric", color: "phi" },

  // Θ (Theta) - Blue/Wisdom
  { id: "theta-1", name: "Theta 1", symbol: "Θ", value: 1, type: "numeric", color: "theta" },
  { id: "theta-2", name: "Theta 2", symbol: "Θ", value: 2, type: "numeric", color: "theta" },
  { id: "theta-3", name: "Theta 3", symbol: "Θ", value: 3, type: "numeric", color: "theta" },
  { id: "theta-4", name: "Theta 4", symbol: "Θ", value: 4, type: "numeric", color: "theta" },
  { id: "theta-5", name: "Theta 5", symbol: "Θ", value: 5, type: "numeric", color: "theta" },
  { id: "theta-6", name: "Theta 6", symbol: "Θ", value: 6, type: "numeric", color: "theta" },

  // Ψ (Psi) - Purple/Mind
  { id: "psi-1", name: "Psi 1", symbol: "Ψ", value: 1, type: "numeric", color: "psi" },
  { id: "psi-2", name: "Psi 2", symbol: "Ψ", value: 2, type: "numeric", color: "psi" },
  { id: "psi-3", name: "Psi 3", symbol: "Ψ", value: 3, type: "numeric", color: "psi" },
  { id: "psi-4", name: "Psi 4", symbol: "Ψ", value: 4, type: "numeric", color: "psi" },
  { id: "psi-5", name: "Psi 5", symbol: "Ψ", value: 5, type: "numeric", color: "psi" },
  { id: "psi-6", name: "Psi 6", symbol: "Ψ", value: 6, type: "numeric", color: "psi" },

  // Ω (Omega) - Burgundy/Chaos
  { id: "omega-1", name: "Omega 1", symbol: "Ω", value: 1, type: "numeric", color: "omega" },
  { id: "omega-2", name: "Omega 2", symbol: "Ω", value: 2, type: "numeric", color: "omega" },
  { id: "omega-3", name: "Omega 3", symbol: "Ω", value: 3, type: "numeric", color: "omega" },
  { id: "omega-4", name: "Omega 4", symbol: "Ω", value: 4, type: "numeric", color: "omega" },
  { id: "omega-5", name: "Omega 5", symbol: "Ω", value: 5, type: "numeric", color: "omega" },
  { id: "omega-6", name: "Omega 6", symbol: "Ω", value: 6, type: "numeric", color: "omega" },

  // Special Cards
  {
    id: "twisted-1",
    name: "Twisted",
    symbol: "α",
    type: "special",
    specialType: "twisted",
    color: "primary",
    description: "Twisted (α) - Alpha: A powerful reflection card that reverses the flow of damage. When your total numeric value is lower than your opponent's, all damage that would be dealt to you is instead reflected back to your opponent.",
  },
  {
    id: "twisted-2",
    name: "Twisted",
    symbol: "α",
    type: "special",
    specialType: "twisted",
    color: "primary",
    description: "Twisted (α) - Alpha: A powerful reflection card that reverses the flow of damage.",
  },
  {
    id: "delta-1",
    name: "Delta",
    symbol: "Δ",
    type: "special",
    specialType: "delta",
    color: "primary",
    description: "Delta (Δ): An index-based damage amplifier. Position determines calculation. If followed by Twisted (α), transforms into Sigma.",
  },
  {
    id: "sigma-1",
    name: "Sigma",
    symbol: "Σ",
    type: "special",
    specialType: "sigma",
    color: "primary",
    description: "Sigma (Σ): The opposite of Delta. If followed by Twisted (α), transforms into Delta.",
  },
  {
    id: "deflate-1",
    name: "Deflate",
    symbol: "β",
    type: "special",
    specialType: "deflate",
    color: "primary",
    description: "Deflate (β) - Beta: Nullifies ALL opponent's special card effects for this round.",
  },
  {
    id: "deflate-2",
    name: "Deflate",
    symbol: "β",
    type: "special",
    specialType: "deflate",
    color: "primary",
    description: "Deflate (β) - Beta: Nullifies ALL opponent's special card effects for this round.",
  },
];

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { dealt, remaining };
}
