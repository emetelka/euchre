import type { Card, Suit, Position, BiddingState } from '../../engine/types';
import { getValidCards, isTrump, getEffectiveSuit } from '../../engine/gameRules';
import {
  shouldOrderUp,
  getBestSuitToPick,
  shouldGoAlone,
  isPartnerWinning,
  getHighestCard,
  getLowestCard,
} from '../evaluator';

/**
 * Medium AI Strategy (Default)
 * - Heuristic-based bidding (count trump + aces)
 * - Order up with 3+ trump or 2 trump + 2 aces
 * - Basic partnership play (play low when partner winning)
 * - Simple card counting for trump
 * - Lead trump when making, highest off-suit when defending
 */

/**
 * Decides whether to order up in round 1 (medium AI)
 */
export function shouldOrderUpMedium(
  hand: Card[],
  turnedUpCard: Card,
  position: Position,
  dealer: Position
): boolean {
  return shouldOrderUp(hand, turnedUpCard.suit, position, dealer);
}

/**
 * Decides whether to pick a suit in round 2 (medium AI)
 */
export function pickSuitMedium(
  hand: Card[],
  bidding: BiddingState,
  position: Position
): Suit | null {
  const isDealer = position === bidding.dealer;
  const turnedUpSuit = bidding.turnedUpCard?.suit || ('hearts' as Suit);

  return getBestSuitToPick(hand, turnedUpSuit, isDealer);
}

/**
 * Decides whether to go alone (medium AI)
 */
export function shouldGoAloneMedium(hand: Card[], trump: Suit): boolean {
  return shouldGoAlone(hand, trump);
}

/**
 * Selects a card to play (medium AI)
 */
export function selectCardMedium(
  hand: Card[],
  cardsPlayed: { position: Position; card: Card }[],
  trump: Suit,
  currentPosition: Position,
  makingTeam: number | null
): Card {
  const leadCard = cardsPlayed.length > 0 ? cardsPlayed[0].card : null;
  const validCards = getValidCards(hand, leadCard, trump);

  if (validCards.length === 0) {
    throw new Error('No valid cards to play');
  }

  if (validCards.length === 1) {
    return validCards[0];
  }

  // If leading the trick
  if (!leadCard) {
    return selectLeadCard(hand, validCards, trump, currentPosition, makingTeam);
  }

  // If following the trick
  return selectFollowCard(
    validCards,
    cardsPlayed,
    trump,
    currentPosition
  );
}

/**
 * Selects which card to lead
 */
function selectLeadCard(
  _hand: Card[],
  validCards: Card[],
  trump: Suit,
  currentPosition: Position,
  makingTeam: number | null
): Card {
  const currentTeam = currentPosition % 2;
  const isMaking = makingTeam === currentTeam;

  const trumpCards = validCards.filter((card) => isTrump(card, trump));
  const nonTrumpCards = validCards.filter((card) => !isTrump(card, trump));

  // If making trump, lead trump to pull them out
  if (isMaking && trumpCards.length > 0) {
    return getHighestCard(trumpCards, trump, trump)!;
  }

  // If defending, lead off-suit aces or highest card
  if (!isMaking) {
    const aces = nonTrumpCards.filter((card) => card.rank === 'A');
    if (aces.length > 0) {
      return aces[0];
    }

    if (nonTrumpCards.length > 0) {
      return getHighestCard(nonTrumpCards, trump, nonTrumpCards[0].suit)!;
    }
  }

  // Default: play highest card
  return getHighestCard(validCards, trump, trump)!;
}

/**
 * Selects which card to follow with
 */
function selectFollowCard(
  validCards: Card[],
  cardsPlayed: { position: Position; card: Card }[],
  trump: Suit,
  currentPosition: Position
): Card {
  const leadCard = cardsPlayed[0].card;
  const leadSuit = getEffectiveSuit(leadCard, trump);

  // Check if partner is winning
  if (isPartnerWinning(cardsPlayed, currentPosition, trump)) {
    // Partner winning, play lowest card
    return getLowestCard(validCards, trump, leadSuit)!;
  }

  // Try to win the trick
  const highestCard = getHighestCard(validCards, trump, leadSuit)!;
  return highestCard;
}
