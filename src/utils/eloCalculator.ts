/**
 * ELO Rating Calculator
 * Dynamic K-factor based on player's current ELO
 * 
 * Re-exports from eloRankSystem for backwards compatibility
 */

import { calculateEloChange, getRankByElo } from "./eloRankSystem";

/**
 * Calculate expected score for player A against player B
 */
export function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Get K-factor based on player ELO
 * Higher ranks have lower K-factor for more stable ratings
 */
function getKFactor(elo: number): number {
  if (elo >= 2800) return 16;  // Yorea
  if (elo >= 2400) return 20;  // Aeon
  if (elo >= 2000) return 24;  // Tartarus
  if (elo >= 1600) return 28;  // Loreas
  return 32;                    // Lower tiers
}

/**
 * Calculate new ELO ratings after a match
 * @param winnerRating Current rating of winner
 * @param loserRating Current rating of loser
 * @returns Object with new ratings for winner and loser
 */
export function calculateNewRatings(
  winnerRating: number,
  loserRating: number
): { winnerNewRating: number; loserNewRating: number } {
  const kFactorWinner = getKFactor(winnerRating);
  const kFactorLoser = getKFactor(loserRating);
  
  const expectedWinner = getExpectedScore(winnerRating, loserRating);
  const expectedLoser = getExpectedScore(loserRating, winnerRating);

  // Winner gets score of 1, loser gets score of 0
  const winnerNewRating = Math.round(winnerRating + kFactorWinner * (1 - expectedWinner));
  const loserNewRating = Math.round(loserRating + kFactorLoser * (0 - expectedLoser));

  // Ensure ratings don't go below 0
  return {
    winnerNewRating: Math.max(0, winnerNewRating),
    loserNewRating: Math.max(0, loserNewRating)
  };
}

/**
 * Calculate ELO change for a draw
 */
export function calculateDrawRatings(
  player1Rating: number,
  player2Rating: number
): { player1NewRating: number; player2NewRating: number } {
  const kFactor1 = getKFactor(player1Rating);
  const kFactor2 = getKFactor(player2Rating);
  
  const expected1 = getExpectedScore(player1Rating, player2Rating);
  const expected2 = getExpectedScore(player2Rating, player1Rating);

  // Both get score of 0.5 for draw
  const player1NewRating = Math.round(player1Rating + kFactor1 * (0.5 - expected1));
  const player2NewRating = Math.round(player2Rating + kFactor2 * (0.5 - expected2));

  return {
    player1NewRating: Math.max(0, player1NewRating),
    player2NewRating: Math.max(0, player2NewRating)
  };
}

// Re-export rank functions
export { getRankByElo, calculateEloChange } from "./eloRankSystem";
