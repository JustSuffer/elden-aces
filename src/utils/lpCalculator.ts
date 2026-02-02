/**
 * LP (League Points) Calculator
 * Dynamic LP gain/loss based on win rate
 */

// Region tiers for rank display
export const RANK_TIERS = [
  { name: "Unranked", minLp: 0, maxLp: 0 },
  { name: "Bronze", minLp: 1, maxLp: 399 },
  { name: "Silver", minLp: 400, maxLp: 799 },
  { name: "Gold", minLp: 800, maxLp: 1199 },
  { name: "Platinum", minLp: 1200, maxLp: 1599 },
  { name: "Diamond", minLp: 1600, maxLp: 1999 },
  { name: "Ascendant", minLp: 2000, maxLp: 2399 },
  { name: "Immortal", minLp: 2400, maxLp: 2799 },
  { name: "YOREA", minLp: 2800, maxLp: 3199 },
  { name: "Leaderboard", minLp: 3200, maxLp: Infinity },
];

export interface LpChangeResult {
  lpChange: number;
  newLp: number;
  newTier: string;
  tierChanged: boolean;
  previousTier: string;
}

/**
 * Get random number between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, totalGames: number): number {
  if (totalGames === 0) return 50; // Default for new players
  return (wins / totalGames) * 100;
}

/**
 * Get rank tier name from LP
 */
export function getRankTier(lp: number): string {
  for (const tier of RANK_TIERS) {
    if (lp >= tier.minLp && lp <= tier.maxLp) {
      return tier.name;
    }
  }
  return "Unranked";
}

/**
 * Get LP range for gain/loss based on win rate
 */
function getLpRanges(winRate: number): { gainMin: number; gainMax: number; lossMin: number; lossMax: number } {
  if (winRate >= 80) {
    // Smurf / Very High Performance
    return { gainMin: 32, gainMax: 35, lossMin: 6, lossMax: 8 };
  } else if (winRate >= 60) {
    // High Performance (Climber)
    return { gainMin: 24, gainMax: 28, lossMin: 12, lossMax: 15 };
  } else if (winRate >= 20) {
    // Standard Player (Balanced)
    return { gainMin: 19, gainMax: 21, lossMin: 19, lossMax: 21 };
  } else {
    // Low Performance
    return { gainMin: 10, gainMax: 12, lossMin: 28, lossMax: 30 };
  }
}

/**
 * Calculate LP change after a match
 * @param currentLp Current LP
 * @param wins Total wins
 * @param totalGames Total games played
 * @param isWinner Whether the player won this match
 * @returns LP change result with new LP and tier info
 */
export function calculateLpChange(
  currentLp: number,
  wins: number,
  totalGames: number,
  isWinner: boolean
): LpChangeResult {
  const winRate = calculateWinRate(wins, totalGames);
  const ranges = getLpRanges(winRate);
  const previousTier = getRankTier(currentLp);

  let lpChange: number;

  if (isWinner) {
    lpChange = randomBetween(ranges.gainMin, ranges.gainMax);
  } else {
    lpChange = -randomBetween(ranges.lossMin, ranges.lossMax);
  }

  // LP cannot go below 0
  const newLp = Math.max(0, currentLp + lpChange);
  const newTier = getRankTier(newLp);

  return {
    lpChange,
    newLp,
    newTier,
    tierChanged: newTier !== previousTier,
    previousTier,
  };
}

/**
 * Get LP progress within current tier (0-100%)
 */
export function getTierProgress(lp: number): number {
  const currentTierData = RANK_TIERS.find(t => lp >= t.minLp && lp <= t.maxLp);
  if (!currentTierData || currentTierData.maxLp === Infinity) return 100;
  
  const tierRange = currentTierData.maxLp - currentTierData.minLp + 1;
  const progressInTier = lp - currentTierData.minLp;
  return Math.round((progressInTier / tierRange) * 100);
}

/**
 * Get LP needed for next tier
 */
export function getLpToNextTier(lp: number): number {
  const currentTierIndex = RANK_TIERS.findIndex(t => lp >= t.minLp && lp <= t.maxLp);
  if (currentTierIndex === -1 || currentTierIndex === RANK_TIERS.length - 1) return 0;
  
  const nextTier = RANK_TIERS[currentTierIndex + 1];
  return nextTier.minLp - lp;
}
