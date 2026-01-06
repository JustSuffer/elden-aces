/**
 * ELO Rating Calculator
 * Standard ELO system with K-factor of 32
 */

const K_FACTOR = 32;

/**
 * Calculate expected score for player A against player B
 */
export function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
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
  const expectedWinner = getExpectedScore(winnerRating, loserRating);
  const expectedLoser = getExpectedScore(loserRating, winnerRating);

  // Winner gets score of 1, loser gets score of 0
  const winnerNewRating = Math.round(winnerRating + K_FACTOR * (1 - expectedWinner));
  const loserNewRating = Math.round(loserRating + K_FACTOR * (0 - expectedLoser));

  // Ensure ratings don't go below 100
  return {
    winnerNewRating: Math.max(100, winnerNewRating),
    loserNewRating: Math.max(100, loserNewRating)
  };
}

/**
 * Calculate ELO change for a draw
 */
export function calculateDrawRatings(
  player1Rating: number,
  player2Rating: number
): { player1NewRating: number; player2NewRating: number } {
  const expected1 = getExpectedScore(player1Rating, player2Rating);
  const expected2 = getExpectedScore(player2Rating, player1Rating);

  // Both get score of 0.5 for draw
  const player1NewRating = Math.round(player1Rating + K_FACTOR * (0.5 - expected1));
  const player2NewRating = Math.round(player2Rating + K_FACTOR * (0.5 - expected2));

  return {
    player1NewRating: Math.max(100, player1NewRating),
    player2NewRating: Math.max(100, player2NewRating)
  };
}
