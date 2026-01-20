import type { Team, HandResult } from './types';

/**
 * Calculates points scored for a completed hand
 *
 * Standard Midwest Euchre scoring:
 * - Making team wins 3-4 tricks: 1 point
 * - Making team wins all 5 tricks (march): 2 points
 * - Making team going alone wins all 5 tricks: 4 points
 * - Making team going alone wins 3-4 tricks: 1 point
 * - Defending team wins 3+ tricks (euchre): 2 points
 */
export function calculateHandScore(
  tricksWon: [number, number],
  makingTeam: Team,
  goingAlone: boolean
): { points: [number, number]; wasEuchre: boolean } {
  const defendingTeam: Team = makingTeam === 0 ? 1 : 0;
  const makingTricks = tricksWon[makingTeam];
  const defendingTricks = tricksWon[defendingTeam];

  const points: [number, number] = [0, 0];
  let wasEuchre = false;

  // Check if defending team euchred the making team
  if (defendingTricks >= 3) {
    points[defendingTeam] = 2;
    wasEuchre = true;
    return { points, wasEuchre };
  }

  // Making team won - calculate points
  if (makingTricks === 5) {
    // March (all 5 tricks)
    if (goingAlone) {
      points[makingTeam] = 4; // Alone march
    } else {
      points[makingTeam] = 2; // Regular march
    }
  } else {
    // Won 3-4 tricks
    points[makingTeam] = 1;
  }

  return { points, wasEuchre };
}

/**
 * Determines if a game is over (first team to 15 points)
 */
export function isGameOver(score: [number, number]): boolean {
  return score[0] >= 15 || score[1] >= 15;
}

/**
 * Gets the winning team (or null if game not over)
 */
export function getWinningTeam(score: [number, number]): Team | null {
  if (score[0] >= 15) return 0;
  if (score[1] >= 15) return 1;
  return null;
}

/**
 * Adds points to the current score
 */
export function addPoints(
  currentScore: [number, number],
  pointsToAdd: [number, number]
): [number, number] {
  return [
    currentScore[0] + pointsToAdd[0],
    currentScore[1] + pointsToAdd[1],
  ];
}

/**
 * Creates a hand result for history tracking
 */
export function createHandResult(
  handNumber: number,
  dealer: number,
  trump: string,
  maker: number,
  makingTeam: Team,
  goingAlone: boolean,
  alonePlayer: number | null,
  tricksWon: [number, number]
): HandResult {
  const { points, wasEuchre } = calculateHandScore(tricksWon, makingTeam, goingAlone);

  return {
    handNumber,
    dealer: dealer as any,
    trump: trump as any,
    maker: maker as any,
    makingTeam,
    goingAlone,
    alonePlayer: alonePlayer as any,
    tricksWon,
    pointsScored: points,
    wasEuchre,
  };
}
