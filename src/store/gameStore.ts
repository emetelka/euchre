import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  GameState,
  PlayerState,
  Position,
  Card,
  Suit,
  Team,
  BidAction,
  GamePhase,
  HandResult,
  GameResult,
} from '../engine/types';
import { getTeam, getNextPlayer } from '../engine/types';
import { createDeck, dealCards } from '../engine/deck';
import {
  initializeBidding,
  processBiddingPass,
  processOrderUp,
  processPickSuit,
  processGoAlone,
} from '../engine/bidding';
import { calculateTrickWinner, sortHand } from '../engine/gameRules';
import { calculateHandScore, addPoints, getWinningTeam, createHandResult } from '../engine/scoring';
import { saveGameResult } from '../db/repository';

interface GameStore {
  game: GameState | null;
  handResults: HandResult[];
  gameStartTime: number | null;

  // Actions
  startNewGame: (
    playerNames: [string, string, string, string],
    playerAvatars: [string, string, string, string],
    difficulty: string
  ) => void;
  updatePlayerNames: (playerNames: [string, string, string, string]) => void;
  dealNewHand: () => void;
  processBid: (action: BidAction) => void;
  discardCard: (card: Card) => void;
  playCard: (card: Card) => void;
  advancePhase: () => void;
  resetGame: () => void;
}

const createInitialPlayers = (
  names: [string, string, string, string],
  avatars: [string, string, string, string],
  difficulty: string
): PlayerState[] => {
  return [
    {
      position: 0,
      name: names[0],
      avatar: avatars[0],
      hand: [],
      isHuman: true,
      difficulty: null,
    },
    {
      position: 1,
      name: names[1],
      avatar: avatars[1],
      hand: [],
      isHuman: false,
      difficulty: difficulty as any,
    },
    {
      position: 2,
      name: names[2],
      avatar: avatars[2],
      hand: [],
      isHuman: false,
      difficulty: difficulty as any,
    },
    {
      position: 3,
      name: names[3],
      avatar: avatars[3],
      hand: [],
      isHuman: false,
      difficulty: difficulty as any,
    },
  ];
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    game: null,
    handResults: [],
    gameStartTime: null,

    startNewGame: (playerNames, playerAvatars, difficulty) =>
      set((state) => {
        state.game = {
          phase: 'SETUP',
          players: createInitialPlayers(playerNames, playerAvatars, difficulty),
          currentPlayer: 0,
          deck: createDeck(),
          kitty: [],
          bidding: null,
          hand: null,
          score: [0, 0],
          gameNumber: 1,
          handNumber: 0,
          winningTeam: null,
        };
        state.handResults = [];
        state.gameStartTime = Date.now();
      }),

    updatePlayerNames: (playerNames) =>
      set((state) => {
        if (!state.game) return;
        state.game.players.forEach((player, index) => {
          player.name = playerNames[index];
        });
      }),

    dealNewHand: () =>
      set((state) => {
        if (!state.game) return;

        const dealer = (state.game.handNumber % 4) as Position;
        const { hands, kitty } = dealCards(state.game.deck);

        // Assign hands to players
        state.game.players.forEach((player, index) => {
          player.hand = sortHand(hands[index], null);
        });

        state.game.kitty = kitty;
        state.game.handNumber += 1;
        state.game.phase = 'DEALING';

        // Initialize bidding with turned-up card
        const turnedUpCard = kitty[0];
        state.game.bidding = initializeBidding(dealer, turnedUpCard);

        // Initialize hand state
        state.game.hand = {
          dealer,
          trump: null,
          maker: null,
          makingTeam: null,
          goingAlone: false,
          alonePlayer: null,
          dealerNeedsDiscard: false,
          tricks: [],
          currentTrick: {
            leadPlayer: getNextPlayer(dealer),
            cardsPlayed: [],
            winner: null,
          },
          tricksWon: [0, 0],
          handComplete: false,
        };

        state.game.currentPlayer = getNextPlayer(dealer);
      }),

    processBid: (action: BidAction) =>
      set((state) => {
        if (!state.game || !state.game.bidding) return;

        const bidding = state.game.bidding;

        if (action.type === 'pass') {
          state.game.bidding = processBiddingPass(bidding);

          // Check if we moved to round 2
          if (state.game.bidding.round === 2) {
            state.game.phase = 'BIDDING_ROUND_2';
          }

          state.game.currentPlayer = state.game.bidding.currentBidder;
        } else if (action.type === 'order_up') {
          state.game.bidding = processOrderUp(bidding);

          // Dealer picks up the turned-up card
          if (state.game.hand) {
            const dealer = state.game.bidding.dealer;
            const turnedUpCard = state.game.bidding.turnedUpCard!;
            state.game.players[dealer].hand.push(turnedUpCard);

            // Sort hand with trump
            state.game.players[dealer].hand = sortHand(
              state.game.players[dealer].hand,
              state.game.bidding.trump!
            );

            // Check if dealer is human and needs to discard manually
            const isHumanDealer = state.game.players[dealer].isHuman;

            if (isHumanDealer) {
              // Human dealer - will need to discard after trump notice
              state.game.hand.dealerNeedsDiscard = true;
            } else {
              // AI dealer - automatically discard lowest card now
              state.game.players[dealer].hand.pop();
              state.game.hand.dealerNeedsDiscard = false;
            }
          }

          // Set trump in hand state
          if (state.game.hand) {
            state.game.hand.trump = state.game.bidding.trump;
            state.game.hand.maker = state.game.bidding.maker;
            state.game.hand.makingTeam = state.game.bidding.makingTeam;
          }

          // Go to alone decision phase
          state.game.phase = 'GO_ALONE_DECISION';
          state.game.currentPlayer = state.game.bidding.maker!;
        } else if (action.type === 'pick_suit') {
          state.game.bidding = processPickSuit(bidding, action.suit);

          // Set trump in hand state
          if (state.game.hand) {
            state.game.hand.trump = state.game.bidding.trump;
            state.game.hand.maker = state.game.bidding.maker;
            state.game.hand.makingTeam = state.game.bidding.makingTeam;
          }

          // Go to alone decision phase
          state.game.phase = 'GO_ALONE_DECISION';
          state.game.currentPlayer = state.game.bidding.maker!;
        } else if (action.type === 'go_alone') {
          // Directly set goingAlone flags instead of calling processGoAlone
          // Trump and maker are already set when we reach GO_ALONE_DECISION phase
          state.game.bidding.goingAlone = true;
          state.game.bidding.alonePlayer = state.game.bidding.maker;

          if (state.game.hand) {
            state.game.hand.goingAlone = true;
            state.game.hand.alonePlayer = state.game.bidding.maker;
          }
        }

        // Re-sort all hands with trump
        if (state.game.bidding.trump) {
          state.game.players.forEach((player) => {
            player.hand = sortHand(player.hand, state.game!.bidding!.trump);
          });
        }
      }),

    discardCard: (card: Card) =>
      set((state) => {
        if (!state.game || state.game.phase !== 'DEALER_DISCARD' || !state.game.hand) return;

        const dealer = state.game.currentPlayer;
        const player = state.game.players[dealer];

        // Remove the discarded card from dealer's hand
        player.hand = player.hand.filter((c) => c.id !== card.id);

        // Mark that dealer has discarded
        state.game.hand.dealerNeedsDiscard = false;

        // Advance to playing phase
        state.game.phase = 'PLAYING';
        state.game.currentPlayer = state.game.hand.currentTrick.leadPlayer;
      }),

    playCard: (card: Card) =>
      set((state) => {
        if (!state.game || !state.game.hand || state.game.phase !== 'PLAYING') return;

        const currentPlayer = state.game.currentPlayer;
        const player = state.game.players[currentPlayer];

        // Remove card from player's hand
        player.hand = player.hand.filter((c) => c.id !== card.id);

        // Add card to current trick
        state.game.hand.currentTrick.cardsPlayed.push({
          position: currentPlayer,
          card,
        });

        // Check if trick is complete (4 cards played or 3 if going alone)
        const expectedCards = state.game.hand.goingAlone ? 3 : 4;
        const trickComplete = state.game.hand.currentTrick.cardsPlayed.length === expectedCards;

        if (trickComplete) {
          // Determine winner
          const winner = calculateTrickWinner(
            state.game.hand.currentTrick.cardsPlayed,
            state.game.hand.trump!,
            state.game.hand.currentTrick.leadPlayer
          );

          state.game.hand.currentTrick.winner = winner;

          // Update tricks won
          const winningTeam = getTeam(winner);
          state.game.hand.tricksWon[winningTeam]++;

          // Save completed trick
          state.game.hand.tricks.push({ ...state.game.hand.currentTrick });

          state.game.phase = 'TRICK_COMPLETE';
          state.game.currentPlayer = winner;
        } else {
          // Move to next player
          let nextPlayer = getNextPlayer(currentPlayer);

          // Skip partner if going alone
          if (state.game.hand.goingAlone && state.game.hand.alonePlayer !== null) {
            const partnerPosition = ((state.game.hand.alonePlayer + 2) % 4) as Position;
            if (nextPlayer === partnerPosition) {
              nextPlayer = getNextPlayer(nextPlayer);
            }
          }

          state.game.currentPlayer = nextPlayer;
        }
      }),

    advancePhase: () => {
      const state = get();

      if (!state.game) return;

      if (state.game.phase === 'SETUP') {
        // Call dealNewHand separately, not within a set()
        state.dealNewHand();
        // Don't override the phase - let dealNewHand set it to DEALING
        // Then useGameLoop will auto-advance from DEALING to BIDDING
        return;
      }

      if (state.game.phase === 'HAND_COMPLETE') {
        // Calculate and add points
        if (state.game.hand) {
          const { points, wasEuchre } = calculateHandScore(
            state.game.hand.tricksWon,
            state.game.hand.makingTeam!,
            state.game.hand.goingAlone
          );

          set((state) => {
            if (!state.game || !state.game.hand) return;

            state.game.score = addPoints(state.game.score, points);

            // Save hand result
            const handResult = createHandResult(
              state.game.handNumber,
              state.game.hand.dealer,
              state.game.hand.trump!,
              state.game.hand.maker!,
              state.game.hand.makingTeam!,
              state.game.hand.goingAlone,
              state.game.hand.alonePlayer,
              state.game.hand.tricksWon
            );
            state.handResults.push(handResult);
          });
        }

        // Re-get state after updates
        const updatedState = get();

        // Check if game is over
        const winningTeam = getWinningTeam(updatedState.game!.score);
        if (winningTeam !== null) {
          // Game is over - set phase and save result
          set((state) => {
            if (!state.game) return;

            state.game.winningTeam = winningTeam;
            state.game.phase = 'GAME_COMPLETE';

            // Save game result to IndexedDB
            const gameResult: GameResult = {
              id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              playerNames: state.game.players.map((p) => p.name) as [string, string, string, string],
              playerAvatars: state.game.players.map((p) => p.avatar) as [string, string, string, string],
              finalScore: state.game.score,
              winningTeam,
              difficulty: state.game.players[1].difficulty as any,
              handsPlayed: state.game.handNumber,
              duration: state.gameStartTime ? Date.now() - state.gameStartTime : 0,
              handResults: state.handResults,
            };

            // Save asynchronously
            saveGameResult(gameResult).catch((err) => {
              console.error('Failed to save game result:', err);
            });
          });
        } else {
          // Game continues - deal new hand outside of set()
          updatedState.dealNewHand();
          // Don't override the phase - dealNewHand sets it to DEALING
          // and useGameLoop will auto-advance to BIDDING_ROUND_1
        }
        return;
      }

      set((state) => {
        if (!state.game) return;

        if (state.game.phase === 'DEALING') {
          // Advance from DEALING to BIDDING_ROUND_1
          state.game.phase = 'BIDDING_ROUND_1';
        } else if (state.game.phase === 'GO_ALONE_DECISION') {
          // Advance from GO_ALONE_DECISION to TRUMP_SELECTED
          state.game.phase = 'TRUMP_SELECTED';
          state.game.currentPlayer = state.game.hand!.currentTrick.leadPlayer;
        } else if (state.game.phase === 'TRUMP_SELECTED') {
          // Check if dealer needs to discard
          if (state.game.hand && state.game.hand.dealerNeedsDiscard) {
            // Go to dealer discard phase
            state.game.phase = 'DEALER_DISCARD';
            state.game.currentPlayer = state.game.hand.dealer;
          } else {
            // Advance from TRUMP_SELECTED to PLAYING
            state.game.phase = 'PLAYING';
          }
        } else if (state.game.phase === 'TRICK_COMPLETE') {
          // Check if hand is complete (5 tricks played)
          if (state.game.hand && state.game.hand.tricks.length === 5) {
            state.game.phase = 'HAND_COMPLETE';
          } else {
            // Start new trick
            const winner = state.game.hand!.currentTrick.winner!;
            state.game.hand!.currentTrick = {
              leadPlayer: winner,
              cardsPlayed: [],
              winner: null,
            };
            state.game.phase = 'PLAYING';
            state.game.currentPlayer = winner;
          }
        }
      });
    },

    resetGame: () =>
      set((state) => {
        state.game = null;
        state.handResults = [];
        state.gameStartTime = null;
      }),
  }))
);
