import type { Card, Suit, Position } from '../engine/types';
import {
  isTrump,
  isRightBower,
  isLeftBower,
  getEffectiveSuit,
  getCardPower,
} from '../engine/gameRules';

/**
 * Counts trump cards in a hand
 */
export function countTrump(hand: Card[], trump: Suit): number {
  return hand.filter((card) => isTrump(card, trump)).length;
}

/**
 * Counts aces in a hand
 */
export function countAces(hand: Card[]): number {
  return hand.filter((card) => card.rank === 'A').length;
}

/**
 * Checks if hand contains right bower
 */
export function hasRightBower(hand: Card[], trump: Suit): boolean {
  return hand.some((card) => isRightBower(card, trump));
}

/**
 * Checks if hand contains left bower
 */
export function hasLeftBower(hand: Card[], trump: Suit): boolean {
  return hand.some((card) => isLeftBower(card, trump));
}

/**
 * Evaluates hand strength for bidding (0-100 scale)
 * Higher score = stronger hand
 */
export function evaluateHandStrength(hand: Card[], trump: Suit): number {
  let score = 0;

  // Right bower is very valuable
  if (hasRightBower(hand, trump)) {
    score += 30;
  }

  // Left bower is valuable
  if (hasLeftBower(hand, trump)) {
    score += 25;
  }

  // Trump ace is valuable
  const trumpAce = hand.find(
    (card) => card.rank === 'A' && getEffectiveSuit(card, trump) === trump
  );
  if (trumpAce) {
    score += 20;
  }

  // Other trump cards
  const trumpCount = countTrump(hand, trump);
  score += (trumpCount - (hasRightBower(hand, trump) ? 1 : 0) - (hasLeftBower(hand, trump) ? 1 : 0)) * 10;

  // Off-suit aces
  const offSuitAces = hand.filter(
    (card) => card.rank === 'A' && getEffectiveSuit(card, trump) !== trump
  );
  score += offSuitAces.length * 15;

  return Math.min(score, 100);
}

/**
 * Determines if a hand is strong enough to order up
 */
export function shouldOrderUp(hand: Card[], trump: Suit, position: Position, dealer: Position): boolean {
  const strength = evaluateHandStrength(hand, trump);
  const isDealer = position === dealer;

  // Dealer has advantage (gets to pick up card)
  if (isDealer) {
    return strength >= 35;
  }

  // Non-dealers need stronger hand
  return strength >= 45;
}

/**
 * Determines the best suit to pick in round 2
 * Returns null if hand is too weak
 */
export function getBestSuitToPick(
  hand: Card[],
  turnedUpSuit: Suit,
  isDealer: boolean
): Suit | null {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const availableSuits = suits.filter((suit) => suit !== turnedUpSuit);

  let bestSuit: Suit | null = null;
  let bestStrength = 0;

  for (const suit of availableSuits) {
    const strength = evaluateHandStrength(hand, suit);

    if (strength > bestStrength) {
      bestStrength = strength;
      bestSuit = suit;
    }
  }

  // Dealer must pick (stick the dealer), so return best suit
  if (isDealer) {
    return bestSuit;
  }

  // Non-dealer needs a strong enough hand to pick
  if (bestStrength >= 40) {
    return bestSuit;
  }

  return null;
}

/**
 * Determines if player should go alone
 */
export function shouldGoAlone(hand: Card[], trump: Suit): boolean {
  const strength = evaluateHandStrength(hand, trump);

  // Need very strong hand to go alone
  // Must have at least 4 trump including both bowers or right bower + 3 other trump
  const trumpCount = countTrump(hand, trump);
  const hasRight = hasRightBower(hand, trump);
  const hasLeft = hasLeftBower(hand, trump);

  if (trumpCount >= 4 && hasRight && hasLeft) {
    return true;
  }

  if (trumpCount === 5) {
    return true;
  }

  return strength >= 85;
}

/**
 * Gets the highest card from a list of cards
 */
export function getHighestCard(
  cards: Card[],
  trump: Suit,
  leadSuit: Suit
): Card | null {
  if (cards.length === 0) return null;

  let highest = cards[0];
  let highestPower = getCardPower(highest, trump, leadSuit);

  for (let i = 1; i < cards.length; i++) {
    const power = getCardPower(cards[i], trump, leadSuit);
    if (power > highestPower) {
      highestPower = power;
      highest = cards[i];
    }
  }

  return highest;
}

/**
 * Gets the lowest card from a list of cards
 */
export function getLowestCard(
  cards: Card[],
  trump: Suit,
  leadSuit: Suit
): Card | null {
  if (cards.length === 0) return null;

  let lowest = cards[0];
  let lowestPower = getCardPower(lowest, trump, leadSuit);

  for (let i = 1; i < cards.length; i++) {
    const power = getCardPower(cards[i], trump, leadSuit);
    if (power < lowestPower) {
      lowestPower = power;
      lowest = cards[i];
    }
  }

  return lowest;
}

/**
 * Checks if partner is currently winning the trick
 */
export function isPartnerWinning(
  cardsPlayed: { position: Position; card: Card }[],
  currentPosition: Position,
  trump: Suit
): boolean {
  if (cardsPlayed.length === 0) return false;

  const partnerPosition = ((currentPosition + 2) % 4) as Position;
  const leadSuit = getEffectiveSuit(cardsPlayed[0].card, trump);

  let winningPosition = cardsPlayed[0].position;
  let highestPower = getCardPower(cardsPlayed[0].card, trump, leadSuit);

  for (let i = 1; i < cardsPlayed.length; i++) {
    const power = getCardPower(cardsPlayed[i].card, trump, leadSuit);
    if (power > highestPower) {
      highestPower = power;
      winningPosition = cardsPlayed[i].position;
    }
  }

  return winningPosition === partnerPosition;
}

/**
 * Groups cards by effective suit
 */
export function groupCardsBySuit(
  cards: Card[],
  trump: Suit
): Record<Suit, Card[]> {
  const groups: Record<Suit, Card[]> = {
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: [],
  };

  for (const card of cards) {
    const effectiveSuit = getEffectiveSuit(card, trump);
    groups[effectiveSuit].push(card);
  }

  return groups;
}
