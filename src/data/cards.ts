export interface Card {
  id: string;
  name: string;
  symbol: string;
  value?: number;
  type: "numeric" | "special";
  special?: string;
  description?: string;
  color: string;
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
    special: "twisted",
    color: "primary",
    description: "Twisted (α) - Alpha: A powerful reflection card that reverses the flow of damage. When your total numeric value is lower than your opponent's, all damage that would be dealt to you is instead reflected back to your opponent. This card does not have a numeric value but its effect can turn the tide of battle when you're at a disadvantage. The reflection happens during the damage calculation phase, after all numeric totals are computed but before final damage is applied. Use strategically when you know you'll be behind in total card value.",
  },
  {
    id: "twisted-2",
    name: "Twisted",
    symbol: "α",
    type: "special",
    special: "twisted",
    color: "primary",
    description: "Twisted (α) - Alpha: A powerful reflection card that reverses the flow of damage. When your total numeric value is lower than your opponent's, all damage that would be dealt to you is instead reflected back to your opponent. This card does not have a numeric value but its effect can turn the tide of battle when you're at a disadvantage. The reflection happens during the damage calculation phase, after all numeric totals are computed but before final damage is applied. Use strategically when you know you'll be behind in total card value.",
  },
  {
    id: "delta-1",
    name: "Delta",
    symbol: "Δ",
    type: "special",
    special: "delta",
    color: "primary",
    description: "Delta (Δ): An index-based damage amplifier card that calculates position-dependent effects. Delta's position in your 5-card lineup determines which cards are used for calculation. If Delta is placed in position 3, it compares the sum of cards in positions 1-2 from both players. If the opponent's sum is higher, they take 2× the difference as damage. If your sum is higher, you take 2× the difference as damage. This damage is calculated separately from the main damage calculation and is applied in addition to base damage. TRANSFORMATION EFFECT: If the card immediately to the right of Delta (position +1) is Twisted (α), Delta transforms into Sigma (Σ) and uses Sigma's reverse calculation instead, completely changing the damage direction.",
  },
  {
    id: "sigma-1",
    name: "Sigma",
    symbol: "Σ",
    type: "special",
    special: "sigma",
    color: "primary",
    description: "Sigma (Σ): The opposite of Delta, also an index-based damage amplifier. Sigma's position in your lineup determines which cards are compared. If Sigma is placed in position 3, it compares the sum of positions 1-2 from both players. Unlike Delta, if your sum is lower than the opponent's, your opponent takes 2× the difference as damage. If your sum is higher, you take 2× the difference. This inverted calculation can be strategically powerful when combined with low-value cards or other special effects. TRANSFORMATION EFFECT: If the card immediately to the right of Sigma (position +1) is Twisted (α), Sigma transforms into Delta (Δ) and uses Delta's calculation instead, reversing the damage logic.",
  },
  {
    id: "deflate-1",
    name: "Deflate",
    symbol: "β",
    type: "special",
    special: "deflate",
    color: "primary",
    description: "Deflate (β) - Beta: The ultimate nullification card and the most powerful defensive tool in the game. When Deflate is in your lineup, it completely cancels and nullifies all of your opponent's special card effects for that round. This includes: Gamma (γ) - removing invincibility and damage multipliers, Twisted (α) - preventing damage reflection, Sigma (Σ) - stopping index-based reverse damage, and Delta (Δ) - blocking position-based amplification. All these special cards become ordinary cards with no effects whatsoever, reducing the opponent's strategy to just their numeric values. Deflate does not have a numeric value itself and contributes 0 to your total, but its defensive power can prevent devastating special card combinations from your opponent. This card resolves first in the special card resolution order, making it the ultimate counter-strategy tool.",
  },
  {
    id: "deflate-2",
    name: "Deflate",
    symbol: "β",
    type: "special",
    special: "deflate",
    color: "primary",
    description: "Deflate (β) - Beta: The ultimate nullification card and the most powerful defensive tool in the game. When Deflate is in your lineup, it completely cancels and nullifies all of your opponent's special card effects for that round. This includes: Gamma (γ) - removing invincibility and damage multipliers, Twisted (α) - preventing damage reflection, Sigma (Σ) - stopping index-based reverse damage, and Delta (Δ) - blocking position-based amplification. All these special cards become ordinary cards with no effects whatsoever, reducing the opponent's strategy to just their numeric values. Deflate does not have a numeric value itself and contributes 0 to your total, but its defensive power can prevent devastating special card combinations from your opponent. This card resolves first in the special card resolution order, making it the ultimate counter-strategy tool.",
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
