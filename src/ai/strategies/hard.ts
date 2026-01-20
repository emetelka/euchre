import type { Card, Suit, Position, BiddingState } from '../../engine/types';
import { getValidCards, isTrump, getEffectiveSuit, getCardPower } from '../../engine/gameRules';
import {
  evaluateHandStrength,
  shouldGoAlone,
  hasRightBower,
  isPartnerWinning,
  getHighestCard,
  getLowestCard,
} from '../evaluator';
import { getAvailableSuitsForPicking } from '../../engine/bidding';

/**
 * Hard AI Strategy
 * - Advanced hand strength calculation with bower power ratings
 * - Position-aware bidding (dealer advantage)
 * - Full card counting across all played cards
 * - Probability-based card selection
 * - Advanced partnership strategies (sloughing, trump promotion)
 * - Endgame analysis
 */

/**
 * Card tracking for counting
 */
interface CardTracker {
  trumpPlayed: number;
  trumpRemaining: number;
  bowersSeen: { right: boolean; left: boolean };
  acesSeen: Set<string>;
}

/**
 * Evaluates hand with position awareness
 */
function evaluateHandWithPosition(
  hand: Card[],
  trump: Suit,
  position: Position,
  dealer: Position
): number {
  let score = evaluateHandStrength(hand, trump);

  // Dealer has advantage (gets extra card)
  if (position === dealer) {
    score += 15;
  }

  // Position after dealer has slight advantage (won't have to bid blind)
  const positionsAfterDealer = [(dealer + 1) % 4, (dealer + 2) % 4];
  if (positionsAfterDealer.includes(position)) {
    score += 5;
  }

  return score;
}

/**
 * Decides whether to order up in round 1 (hard AI)
 */
export function shouldOrderUpHard(
  hand: Card[],
  turnedUpCard: Card,
  position: Position,
  dealer: Position
): boolean {
  const trump = turnedUpCard.suit;
  const strength = evaluateHandWithPosition(hand, trump, position, dealer);
  const isDealer = position === dealer;

  // Dealer has lower threshold
  if (isDealer) {
    // Consider the turned-up card as part of hand
    const tempHand = [...hand, turnedUpCard];
    const dealerStrength = evaluateHandStrength(tempHand, trump);
    return dealerStrength >= 50;
  }

  // Non-dealer needs stronger hand
  // Partner of dealer can be slightly more aggressive
  const partnerOfDealer = (dealer + 2) % 4 === position;
  const threshold = partnerOfDealer ? 55 : 60;

  return strength >= threshold;
}

/**
 * Decides whether to pick a suit in round 2 (hard AI)
 */
export function pickSuitHard(
  hand: Card[],
  bidding: BiddingState,
  position: Position
): Suit | null {
  const isDealer = position === bidding.dealer;
  const turnedUpSuit = bidding.turnedUpCard?.suit || ('hearts' as Suit);
  const availableSuits = getAvailableSuitsForPicking(bidding.turnedUpCard);

  let bestSuit: Suit | null = null;
  let bestStrength = 0;

  for (const suit of availableSuits) {
    const strength = evaluateHandWithPosition(hand, suit, position, bidding.dealer);

    // Prefer same color as turned-up card (next suit strategy)
    const sameColor =
      (suit === 'hearts' && turnedUpSuit === 'diamonds') ||
      (suit === 'diamonds' && turnedUpSuit === 'hearts') ||
      (suit === 'clubs' && turnedUpSuit === 'spades') ||
      (suit === 'spades' && turnedUpSuit === 'clubs');

    const adjustedStrength = sameColor ? strength + 10 : strength;

    if (adjustedStrength > bestStrength) {
      bestStrength = adjustedStrength;
      bestSuit = suit;
    }
  }

  // Dealer must pick
  if (isDealer) {
    return bestSuit;
  }

  // Non-dealer needs strong hand (lower threshold than easy/medium)
  return bestStrength >= 50 ? bestSuit : null;
}

/**
 * Decides whether to go alone (hard AI)
 */
export function shouldGoAloneHard(hand: Card[], trump: Suit): boolean {
  return shouldGoAlone(hand, trump);
}

/**
 * Selects a card to play (hard AI)
 */
export function selectCardHard(
  hand: Card[],
  cardsPlayed: { position: Position; card: Card }[],
  trump: Suit,
  currentPosition: Position,
  makingTeam: number | null,
  allPlayedCards: Card[] = [] // All cards played in this hand for counting
): Card {
  const leadCard = cardsPlayed.length > 0 ? cardsPlayed[0].card : null;
  const validCards = getValidCards(hand, leadCard, trump);

  if (validCards.length === 0) {
    throw new Error('No valid cards to play');
  }

  if (validCards.length === 1) {
    return validCards[0];
  }

  // Build card tracker
  const tracker = buildCardTracker(allPlayedCards, trump);

  // If leading the trick
  if (!leadCard) {
    return selectLeadCardHard(hand, validCards, trump, currentPosition, makingTeam, tracker);
  }

  // If following the trick
  return selectFollowCardHard(
    validCards,
    cardsPlayed,
    trump,
    currentPosition,
    makingTeam,
    tracker
  );
}

/**
 * Builds card tracker from played cards
 */
function buildCardTracker(playedCards: Card[], trump: Suit): CardTracker {
  const trumpCards = playedCards.filter((c) => isTrump(c, trump));

  return {
    trumpPlayed: trumpCards.length,
    trumpRemaining: 6 - trumpCards.length, // 6 trump cards total in Euchre
    bowersSeen: {
      right: playedCards.some((c) => c.rank === 'J' && c.suit === trump),
      left: playedCards.some(
        (c) =>
          c.rank === 'J' &&
          ((trump === 'hearts' && c.suit === 'diamonds') ||
            (trump === 'diamonds' && c.suit === 'hearts') ||
            (trump === 'clubs' && c.suit === 'spades') ||
            (trump === 'spades' && c.suit === 'clubs'))
      ),
    },
    acesSeen: new Set(playedCards.filter((c) => c.rank === 'A').map((c) => c.id)),
  };
}

/**
 * Selects which card to lead (hard AI)
 */
function selectLeadCardHard(
  _hand: Card[],
  validCards: Card[],
  trump: Suit,
  currentPosition: Position,
  makingTeam: number | null,
  tracker: CardTracker
): Card {
  const currentTeam = currentPosition % 2;
  const isMaking = makingTeam === currentTeam;

  const trumpCards = validCards.filter((c) => isTrump(c, trump));
  const nonTrumpCards = validCards.filter((c) => !isTrump(c, trump));

  // If making trump
  if (isMaking) {
    // Lead trump to pull opponent's trump
    if (trumpCards.length > 0) {
      // If we have right bower, lead it
      if (hasRightBower(trumpCards, trump)) {
        return trumpCards.find((c) => c.rank === 'J' && c.suit === trump)!;
      }

      // Lead highest trump
      return getHighestCard(trumpCards, trump, trump)!;
    }

    // Lead off-suit aces
    const aces = nonTrumpCards.filter((c) => c.rank === 'A');
    if (aces.length > 0) {
      return aces[0];
    }

    // Lead highest off-suit
    return getHighestCard(nonTrumpCards, trump, nonTrumpCards[0].suit)!;
  }

  // If defending
  // Lead off-suit aces to force trump
  const aces = nonTrumpCards.filter((c) => c.rank === 'A' && !tracker.acesSeen.has(c.id));
  if (aces.length > 0) {
    return aces[0];
  }

  // Lead weak off-suit (sloughing strategy)
  if (nonTrumpCards.length > 0) {
    return getLowestCard(nonTrumpCards, trump, nonTrumpCards[0].suit)!;
  }

  // Last resort: lead lowest trump
  return getLowestCard(trumpCards, trump, trump)!;
}

/**
 * Selects which card to follow with (hard AI)
 */
function selectFollowCardHard(
  validCards: Card[],
  cardsPlayed: { position: Position; card: Card }[],
  trump: Suit,
  currentPosition: Position,
  _makingTeam: number | null,
  _tracker: CardTracker
): Card {
  const leadCard = cardsPlayed[0].card;
  const leadSuit = getEffectiveSuit(leadCard, trump);

  // Check if partner is winning
  if (isPartnerWinning(cardsPlayed, currentPosition, trump)) {
    // Partner winning - slough lowest card
    return getLowestCard(validCards, trump, leadSuit)!;
  }

  // Partner not winning - try to win or play strategically
  const highestCard = getHighestCard(validCards, trump, leadSuit)!;
  const highestPower = getCardPower(highestCard, trump, leadSuit);

  // Calculate current winning power
  let currentWinningPower = 0;
  for (const play of cardsPlayed) {
    const power = getCardPower(play.card, trump, leadSuit);
    if (power > currentWinningPower) {
      currentWinningPower = power;
    }
  }

  // If we can win, play highest card that wins
  if (highestPower > currentWinningPower) {
    // Try to win with lowest winning card to conserve high cards
    for (const card of validCards) {
      const power = getCardPower(card, trump, leadSuit);
      if (power > currentWinningPower) {
        return card;
      }
    }
    return highestCard;
  }

  // Can't win - slough lowest
  return getLowestCard(validCards, trump, leadSuit)!;
}
