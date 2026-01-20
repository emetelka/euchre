import type { Card, Suit, Position } from './types';
import { getLeftBowerSuit } from './types';

/**
 * Determines if a card is the right bower (Jack of trump suit)
 */
export function isRightBower(card: Card, trump: Suit): boolean {
  return card.rank === 'J' && card.suit === trump;
}

/**
 * Determines if a card is the left bower (Jack of same color as trump)
 */
export function isLeftBower(card: Card, trump: Suit): boolean {
  const leftBowerSuit = getLeftBowerSuit(trump);
  return card.rank === 'J' && card.suit === leftBowerSuit;
}

/**
 * Determines if a card is a bower (right or left)
 */
export function isBower(card: Card, trump: Suit): boolean {
  return isRightBower(card, trump) || isLeftBower(card, trump);
}

/**
 * Gets the effective suit of a card (left bower is considered trump suit)
 */
export function getEffectiveSuit(card: Card, trump: Suit): Suit {
  if (isLeftBower(card, trump)) {
    return trump;
  }
  return card.suit;
}

/**
 * Determines if a card is trump
 */
export function isTrump(card: Card, trump: Suit): boolean {
  return getEffectiveSuit(card, trump) === trump;
}

/**
 * Gets the power value of a card for comparison
 * Higher value = more powerful
 */
export function getCardPower(card: Card, trump: Suit, leadSuit: Suit): number {
  // Right bower is most powerful
  if (isRightBower(card, trump)) {
    return 1000;
  }

  // Left bower is second most powerful
  if (isLeftBower(card, trump)) {
    return 900;
  }

  const effectiveSuit = getEffectiveSuit(card, trump);

  // Trump cards (not bowers) are powerful
  if (effectiveSuit === trump) {
    const trumpRankValues: Record<string, number> = {
      A: 800,
      K: 700,
      Q: 600,
      '10': 500,
      '9': 400,
    };
    return trumpRankValues[card.rank] || 0;
  }

  // Lead suit cards have power
  if (effectiveSuit === leadSuit) {
    const leadRankValues: Record<string, number> = {
      A: 300,
      K: 200,
      Q: 150,
      J: 140, // Jack of lead suit (not a bower)
      '10': 130,
      '9': 120,
    };
    return leadRankValues[card.rank] || 0;
  }

  // Off-suit cards have no power
  return 0;
}

/**
 * Determines the winner of a trick
 * Returns the position of the winning player
 */
export function calculateTrickWinner(
  cardsPlayed: { position: Position; card: Card }[],
  trump: Suit,
  leadPosition: Position
): Position {
  if (cardsPlayed.length === 0) {
    return leadPosition;
  }

  const leadCard = cardsPlayed[0].card;
  const leadSuit = getEffectiveSuit(leadCard, trump);

  let winningPlay = cardsPlayed[0];
  let highestPower = getCardPower(leadCard, trump, leadSuit);

  for (let i = 1; i < cardsPlayed.length; i++) {
    const play = cardsPlayed[i];
    const power = getCardPower(play.card, trump, leadSuit);

    if (power > highestPower) {
      highestPower = power;
      winningPlay = play;
    }
  }

  return winningPlay.position;
}

/**
 * Determines if a player can play a specific card
 * Must follow suit if possible
 */
export function canPlayCard(
  card: Card,
  hand: Card[],
  leadCard: Card | null,
  trump: Suit
): boolean {
  // If this is the lead card, any card can be played
  if (!leadCard) {
    return true;
  }

  const leadSuit = getEffectiveSuit(leadCard, trump);
  const cardSuit = getEffectiveSuit(card, trump);

  // If the card matches the lead suit, it can be played
  if (cardSuit === leadSuit) {
    return true;
  }

  // Otherwise, check if player has any cards of the lead suit
  const hasLeadSuit = hand.some(
    (c) => getEffectiveSuit(c, trump) === leadSuit
  );

  // If player doesn't have lead suit, any card can be played
  return !hasLeadSuit;
}

/**
 * Gets all valid cards that can be played from a hand
 */
export function getValidCards(
  hand: Card[],
  leadCard: Card | null,
  trump: Suit
): Card[] {
  return hand.filter((card) => canPlayCard(card, hand, leadCard, trump));
}

/**
 * Sorts a hand by suit and rank (bowers considered trump)
 */
export function sortHand(hand: Card[], trump: Suit | null): Card[] {
  const sorted = [...hand];

  sorted.sort((a, b) => {
    if (!trump) {
      // No trump yet, just sort by suit and rank
      if (a.suit !== b.suit) {
        return a.suit.localeCompare(b.suit);
      }
      const rankOrder = ['9', '10', 'J', 'Q', 'K', 'A'];
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    }

    const aSuit = getEffectiveSuit(a, trump);
    const bSuit = getEffectiveSuit(b, trump);

    // Trump cards come first
    const aIsTrump = aSuit === trump;
    const bIsTrump = bSuit === trump;

    if (aIsTrump !== bIsTrump) {
      return bIsTrump ? 1 : -1;
    }

    // Within same suit, sort by power
    if (aSuit === bSuit) {
      const aPower = getCardPower(a, trump, trump);
      const bPower = getCardPower(b, trump, trump);
      return bPower - aPower;
    }

    // Different non-trump suits, sort alphabetically
    return aSuit.localeCompare(bSuit);
  });

  return sorted;
}
