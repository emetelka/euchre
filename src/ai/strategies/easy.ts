import type { Card, Suit, Position, BiddingState } from '../../engine/types';
import { getValidCards } from '../../engine/gameRules';
import { getAvailableSuitsForPicking } from '../../engine/bidding';

/**
 * Easy AI Strategy
 * - Random decisions with basic validity checking
 * - 70% pass rate on bidding
 * - Random card selection from valid plays
 * - No card counting or partnership awareness
 */

/**
 * Decides whether to order up in round 1 (easy AI)
 * 70% chance to pass
 */
export function shouldOrderUpEasy(
  _hand: Card[],
  _turnedUpCard: Card,
  _position: Position,
  _dealer: Position
): boolean {
  return Math.random() > 0.7;
}

/**
 * Decides whether to pick a suit in round 2 (easy AI)
 * Returns a random suit or null (70% pass rate, unless dealer)
 */
export function pickSuitEasy(
  _hand: Card[],
  bidding: BiddingState,
  position: Position
): Suit | null {
  const isDealer = position === bidding.dealer;

  // Dealer must pick (stick the dealer)
  if (isDealer) {
    const availableSuits = getAvailableSuitsForPicking(bidding.turnedUpCard);
    const randomIndex = Math.floor(Math.random() * availableSuits.length);
    return availableSuits[randomIndex];
  }

  // Non-dealer has 70% chance to pass
  if (Math.random() > 0.3) {
    return null;
  }

  const availableSuits = getAvailableSuitsForPicking(bidding.turnedUpCard);
  const randomIndex = Math.floor(Math.random() * availableSuits.length);
  return availableSuits[randomIndex];
}

/**
 * Decides whether to go alone (easy AI)
 * Never goes alone
 */
export function shouldGoAloneEasy(_hand: Card[], _trump: Suit): boolean {
  return false;
}

/**
 * Selects a card to play (easy AI)
 * Randomly selects from valid cards
 */
export function selectCardEasy(
  hand: Card[],
  cardsPlayed: { position: Position; card: Card }[],
  trump: Suit
): Card {
  const leadCard = cardsPlayed.length > 0 ? cardsPlayed[0].card : null;
  const validCards = getValidCards(hand, leadCard, trump);

  if (validCards.length === 0) {
    throw new Error('No valid cards to play');
  }

  const randomIndex = Math.floor(Math.random() * validCards.length);
  return validCards[randomIndex];
}
