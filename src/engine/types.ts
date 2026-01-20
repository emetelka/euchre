// Core card types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique identifier for each card
}

// Player positions
export type Position = 0 | 1 | 2 | 3; // 0=South (human), 1=West, 2=North, 3=East

// Team indices
export type Team = 0 | 1; // Team 0 = South/North (0,2), Team 1 = West/East (1,3)

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Game speed settings
export type GameSpeed = 'slow' | 'medium' | 'fast' | 'instant';

// Bidding actions
export type BidAction =
  | { type: 'order_up' } // Order up the turned-up card
  | { type: 'pass' }
  | { type: 'pick_suit'; suit: Suit } // Pick a different suit
  | { type: 'go_alone' }; // Go alone (must come after order_up or pick_suit)

// Game phases
export type GamePhase =
  | 'SETUP'
  | 'DEALING'
  | 'BIDDING_ROUND_1' // Order up or pass
  | 'BIDDING_ROUND_2' // Pick suit (stick the dealer)
  | 'GO_ALONE_DECISION' // Ask maker if they want to go alone
  | 'DEALER_DISCARD' // Dealer discards a card after ordering up
  | 'TRUMP_SELECTED' // Show trump confirmation before playing
  | 'PLAYING'
  | 'TRICK_COMPLETE'
  | 'HAND_COMPLETE'
  | 'GAME_COMPLETE';

// Bidding state
export interface BiddingState {
  round: 1 | 2; // First round = order up, second round = pick suit
  turnedUpCard: Card | null; // The card turned up from the kitty
  currentBidder: Position;
  dealer: Position;
  passes: number; // Number of consecutive passes
  trump: Suit | null;
  maker: Position | null; // Who called trump
  makingTeam: Team | null;
  goingAlone: boolean;
  alonePlayer: Position | null; // Who is going alone
}

// Trick state
export interface Trick {
  leadPlayer: Position;
  cardsPlayed: { position: Position; card: Card }[];
  winner: Position | null;
}

// Hand state
export interface HandState {
  dealer: Position;
  trump: Suit | null;
  maker: Position | null;
  makingTeam: Team | null;
  goingAlone: boolean;
  alonePlayer: Position | null;
  dealerNeedsDiscard: boolean; // True if dealer ordered up and needs to discard
  tricks: Trick[];
  currentTrick: Trick;
  tricksWon: [number, number]; // [Team 0, Team 1]
  handComplete: boolean;
}

// Player state
export interface PlayerState {
  position: Position;
  name: string;
  avatar: string; // Filename of avatar image
  hand: Card[];
  isHuman: boolean;
  difficulty: Difficulty | null; // null for human
}

// Game state
export interface GameState {
  phase: GamePhase;
  players: PlayerState[];
  currentPlayer: Position;
  deck: Card[];
  kitty: Card[]; // Remaining cards after dealing
  bidding: BiddingState | null;
  hand: HandState | null;
  score: [number, number]; // [Team 0, Team 1]
  gameNumber: number;
  handNumber: number;
  winningTeam: Team | null;
}

// Hand result for history
export interface HandResult {
  handNumber: number;
  dealer: Position;
  trump: Suit;
  maker: Position;
  makingTeam: Team;
  goingAlone: boolean;
  alonePlayer: Position | null;
  tricksWon: [number, number];
  pointsScored: [number, number];
  wasEuchre: boolean; // Did the defending team euchre the making team?
}

// Game result for history (saved to IndexedDB)
export interface GameResult {
  id: string; // UUID
  timestamp: number;
  playerNames: [string, string, string, string];
  playerAvatars: [string, string, string, string];
  finalScore: [number, number];
  winningTeam: Team;
  difficulty: Difficulty;
  handsPlayed: number;
  duration: number; // milliseconds
  handResults: HandResult[];
}

// Settings stored in LocalStorage
export interface Settings {
  playerNames: [string, string, string, string];
  playerAvatars: [string, string, string, string];
  difficulty: Difficulty;
  gameSpeed: GameSpeed;
}

// Helper function to get team from position
export function getTeam(position: Position): Team {
  return position % 2 === 0 ? 0 : 1;
}

// Helper function to get partner position
export function getPartner(position: Position): Position {
  return ((position + 2) % 4) as Position;
}

// Helper function to get next player position
export function getNextPlayer(position: Position): Position {
  return ((position + 1) % 4) as Position;
}

// Helper function to get previous player position
export function getPreviousPlayer(position: Position): Position {
  return ((position + 3) % 4) as Position;
}

// Helper function to determine if a suit is the same color
export function isSameColor(suit1: Suit, suit2: Suit): boolean {
  const redSuits: Suit[] = ['hearts', 'diamonds'];
  const blackSuits: Suit[] = ['clubs', 'spades'];

  return (
    (redSuits.includes(suit1) && redSuits.includes(suit2)) ||
    (blackSuits.includes(suit1) && blackSuits.includes(suit2))
  );
}

// Helper function to get the left bower suit (same color as trump)
export function getLeftBowerSuit(trump: Suit): Suit {
  const colorPairs: Record<Suit, Suit> = {
    hearts: 'diamonds',
    diamonds: 'hearts',
    clubs: 'spades',
    spades: 'clubs',
  };
  return colorPairs[trump];
}
