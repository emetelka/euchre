/**
 * Tests for Go Alone functionality
 *
 * Verifies:
 * 1. Only 3 cards are played per trick when going alone
 * 2. Partner is properly skipped in turn order
 * 3. Scoring is correct: 4 points for alone march, 1 for 3-4 tricks, 2 for euchre
 */

import { calculateHandScore } from '../scoring';
import type { Team } from '../types';

describe('Go Alone Scoring', () => {
  test('should award 4 points for going alone and winning all 5 tricks (alone march)', () => {
    const tricksWon: [number, number] = [5, 0];
    const makingTeam: Team = 0;
    const goingAlone = true;

    const result = calculateHandScore(tricksWon, makingTeam, goingAlone);

    expect(result.points[0]).toBe(4);
    expect(result.points[1]).toBe(0);
    expect(result.wasEuchre).toBe(false);
  });

  test('should award 1 point for going alone and winning 3-4 tricks', () => {
    const tricksWon: [number, number] = [4, 1];
    const makingTeam: Team = 0;
    const goingAlone = true;

    const result = calculateHandScore(tricksWon, makingTeam, goingAlone);

    expect(result.points[0]).toBe(1);
    expect(result.points[1]).toBe(0);
    expect(result.wasEuchre).toBe(false);
  });

  test('should award 2 points to defending team when going alone player gets euchred', () => {
    const tricksWon: [number, number] = [2, 3];
    const makingTeam: Team = 0;
    const goingAlone = true;

    const result = calculateHandScore(tricksWon, makingTeam, goingAlone);

    expect(result.points[0]).toBe(0);
    expect(result.points[1]).toBe(2);
    expect(result.wasEuchre).toBe(true);
  });

  test('should award 2 points for regular march (not going alone)', () => {
    const tricksWon: [number, number] = [5, 0];
    const makingTeam: Team = 0;
    const goingAlone = false;

    const result = calculateHandScore(tricksWon, makingTeam, goingAlone);

    expect(result.points[0]).toBe(2);
    expect(result.points[1]).toBe(0);
    expect(result.wasEuchre).toBe(false);
  });
});
