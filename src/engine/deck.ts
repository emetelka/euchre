import type { Card, Rank, Suit } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['9', '10', 'J', 'Q', 'K', 'A'];

/**
 * Creates a standard 24-card Euchre deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
      });
    }
  }

  return deck;
}

/**
 * Shuffles a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Deals cards to 4 players (5 cards each) and leaves 4 in the kitty
 * Returns an array of 4 hands and the kitty
 */
export function dealCards(deck: Card[]): {
  hands: [Card[], Card[], Card[], Card[]];
  kitty: Card[];
} {
  const shuffled = shuffleDeck(deck);

  // Deal 5 cards to each player
  const hands: [Card[], Card[], Card[], Card[]] = [[], [], [], []];

  // Standard Euchre dealing: 2-3-2-3 or 3-2-3-2 pattern
  // For simplicity, we'll just deal 5 to each in order
  for (let i = 0; i < 5; i++) {
    for (let player = 0; player < 4; player++) {
      hands[player].push(shuffled[i * 4 + player]);
    }
  }

  // Remaining 4 cards go to the kitty
  const kitty = shuffled.slice(20);

  return { hands, kitty };
}
