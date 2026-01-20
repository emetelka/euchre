import { getDB } from './schema';
import type { GameResult } from '../engine/types';

/**
 * Saves a game result to IndexedDB
 */
export async function saveGameResult(game: GameResult): Promise<void> {
  const db = await getDB();
  await db.put('games', game);
}

/**
 * Gets a game result by ID
 */
export async function getGameResult(id: string): Promise<GameResult | undefined> {
  const db = await getDB();
  return await db.get('games', id);
}

/**
 * Gets all game results, sorted by timestamp (newest first)
 */
export async function getAllGameResults(): Promise<GameResult[]> {
  const db = await getDB();
  const results = await db.getAllFromIndex('games', 'timestamp');
  return results.reverse(); // Newest first
}

/**
 * Gets recent game results (limited)
 */
export async function getRecentGameResults(limit: number = 10): Promise<GameResult[]> {
  const all = await getAllGameResults();
  return all.slice(0, limit);
}

/**
 * Deletes a game result by ID
 */
export async function deleteGameResult(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('games', id);
}

/**
 * Clears all game results
 */
export async function clearAllGameResults(): Promise<void> {
  const db = await getDB();
  await db.clear('games');
}

/**
 * Gets statistics from game results
 */
export async function getStatistics() {
  const games = await getAllGameResults();

  if (games.length === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageScore: [0, 0] as [number, number],
      totalHandsPlayed: 0,
      euchreCounts: 0,
    };
  }

  const stats = {
    totalGames: games.length,
    wins: games.filter((g) => g.winningTeam === 0).length,
    losses: games.filter((g) => g.winningTeam === 1).length,
    winRate: 0,
    averageScore: [0, 0] as [number, number],
    totalHandsPlayed: 0,
    euchreCounts: 0,
  };

  stats.winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;

  // Calculate average scores
  const totalScore = games.reduce(
    (acc, game) => {
      return [acc[0] + game.finalScore[0], acc[1] + game.finalScore[1]];
    },
    [0, 0]
  );

  stats.averageScore = [
    totalScore[0] / games.length,
    totalScore[1] / games.length,
  ] as [number, number];

  // Count total hands and euchres
  stats.totalHandsPlayed = games.reduce((acc, game) => acc + game.handsPlayed, 0);
  stats.euchreCounts = games.reduce((acc, game) => {
    return acc + game.handResults.filter((h) => h.wasEuchre).length;
  }, 0);

  return stats;
}
