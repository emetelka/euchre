import type { BiddingState, Position, Suit, Card, Team } from './types';
import { getNextPlayer, getTeam } from './types';

/**
 * Initializes bidding state for a new hand
 */
export function initializeBidding(dealer: Position, turnedUpCard: Card): BiddingState {
  return {
    round: 1,
    turnedUpCard,
    currentBidder: getNextPlayer(dealer), // Player to left of dealer bids first
    dealer,
    passes: 0,
    trump: null,
    maker: null,
    makingTeam: null,
    goingAlone: false,
    alonePlayer: null,
  };
}

/**
 * Processes a pass during bidding
 * Returns updated bidding state
 */
export function processBiddingPass(bidding: BiddingState): BiddingState {
  const nextBidder = getNextPlayer(bidding.currentBidder);
  const newPasses = bidding.passes + 1;

  // If all 4 players pass in round 1, move to round 2
  if (bidding.round === 1 && newPasses === 4) {
    return {
      ...bidding,
      round: 2,
      currentBidder: getNextPlayer(bidding.dealer), // Start with player to left of dealer
      passes: 0,
    };
  }

  // In round 2, dealer cannot pass (stick the dealer rule)
  // This should be enforced by the UI/game logic

  return {
    ...bidding,
    currentBidder: nextBidder,
    passes: newPasses,
  };
}

/**
 * Processes ordering up the turned-up card
 * Returns updated bidding state
 */
export function processOrderUp(bidding: BiddingState): BiddingState {
  if (bidding.round !== 1 || !bidding.turnedUpCard) {
    throw new Error('Can only order up in round 1 with a turned-up card');
  }

  return {
    ...bidding,
    trump: bidding.turnedUpCard.suit,
    maker: bidding.currentBidder,
    makingTeam: getTeam(bidding.currentBidder),
  };
}

/**
 * Processes picking a suit (round 2 bidding)
 * Returns updated bidding state
 */
export function processPickSuit(bidding: BiddingState, suit: Suit): BiddingState {
  if (bidding.round !== 2) {
    throw new Error('Can only pick suit in round 2');
  }

  // Cannot pick the same suit as the turned-up card
  if (bidding.turnedUpCard && suit === bidding.turnedUpCard.suit) {
    throw new Error('Cannot pick the same suit as the turned-up card');
  }

  return {
    ...bidding,
    trump: suit,
    maker: bidding.currentBidder,
    makingTeam: getTeam(bidding.currentBidder),
  };
}

/**
 * Processes going alone
 * Should be called after trump is set
 */
export function processGoAlone(bidding: BiddingState): BiddingState {
  if (!bidding.trump || !bidding.maker) {
    throw new Error('Cannot go alone before trump is set');
  }

  return {
    ...bidding,
    goingAlone: true,
    alonePlayer: bidding.maker,
  };
}

/**
 * Gets available suits for picking in round 2
 * Cannot pick the suit of the turned-up card
 */
export function getAvailableSuitsForPicking(turnedUpCard: Card | null): Suit[] {
  const allSuits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

  if (!turnedUpCard) {
    return allSuits;
  }

  return allSuits.filter((suit) => suit !== turnedUpCard.suit);
}

/**
 * Checks if the current bidder is the dealer (stick the dealer scenario)
 */
export function isStickTheDealer(bidding: BiddingState): boolean {
  return bidding.round === 2 && bidding.currentBidder === bidding.dealer;
}

/**
 * Determines if bidding is complete
 */
export function isBiddingComplete(bidding: BiddingState): boolean {
  return bidding.trump !== null;
}
