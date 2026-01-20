import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import type { BidAction, Card } from '../engine/types';
import { AI_TURN_DELAYS } from '../utils/constants';

/**
 * Main game loop hook
 * Orchestrates phase transitions, triggers AI turns, coordinates animations
 */
export function useGameLoop() {
  const game = useGameStore((state) => state.game);
  const advancePhase = useGameStore((state) => state.advancePhase);
  const gameSpeed = useSettingsStore((state) => state.gameSpeed);

  const aiDelay = AI_TURN_DELAYS[gameSpeed];

  /**
   * Handles automatic phase advancement for certain phases
   */
  useEffect(() => {
    if (!game) return;

    // Auto-advance from SETUP to start the game
    if (game.phase === 'SETUP') {
      const timer = setTimeout(() => {
        advancePhase();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Auto-advance from DEALING to BIDDING_ROUND_1 after a brief delay
    if (game.phase === 'DEALING') {
      const timer = setTimeout(() => {
        advancePhase();
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Auto-advance from TRICK_COMPLETE after showing the completed trick
    if (game.phase === 'TRICK_COMPLETE') {
      const timer = setTimeout(() => {
        advancePhase();
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Auto-advance from HAND_COMPLETE after showing the score
    if (game.phase === 'HAND_COMPLETE') {
      const timer = setTimeout(() => {
        advancePhase();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [game?.phase, advancePhase]);

  return {
    game,
  };
}

/**
 * Hook for handling AI turns
 * Returns a function to trigger AI actions
 */
export function useAITurn() {
  const game = useGameStore((state) => state.game);
  const processBid = useGameStore((state) => state.processBid);
  const playCard = useGameStore((state) => state.playCard);
  const gameSpeed = useSettingsStore((state) => state.gameSpeed);

  const aiDelay = AI_TURN_DELAYS[gameSpeed];

  /**
   * Executes AI bidding action with delay
   */
  const executeAIBid = useCallback(
    (action: BidAction) => {
      if (aiDelay === 0) {
        processBid(action);
      } else {
        setTimeout(() => {
          processBid(action);
        }, aiDelay);
      }
    },
    [processBid, aiDelay]
  );

  /**
   * Executes AI card play with delay
   */
  const executeAIPlay = useCallback(
    (card: Card) => {
      if (aiDelay === 0) {
        playCard(card);
      } else {
        setTimeout(() => {
          playCard(card);
        }, aiDelay);
      }
    },
    [playCard, aiDelay]
  );

  return {
    executeAIBid,
    executeAIPlay,
    isAITurn: game ? !game.players[game.currentPlayer].isHuman : false,
  };
}
