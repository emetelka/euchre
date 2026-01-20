import { useState, useEffect } from 'react';
import {
  getAllGameResults,
  getRecentGameResults,
  getStatistics,
} from '../db/repository';
import type { GameResult } from '../engine/types';

/**
 * Hook for accessing game history
 */
export function useGameHistory(limit?: number) {
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadGames();
  }, [limit]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const results = limit ? await getRecentGameResults(limit) : await getAllGameResults();
      setGames(results);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    games,
    loading,
    error,
    refresh: loadGames,
  };
}

/**
 * Hook for accessing game statistics
 */
export function useGameStatistics() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStatistics>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statistics = await getStatistics();
      setStats(statistics);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}
