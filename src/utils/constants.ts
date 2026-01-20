import type { Difficulty, GameSpeed } from '../engine/types';

// Default player names
export const DEFAULT_PLAYER_NAMES: [string, string, string, string] = [
  'You',
  'West',
  'North',
  'East',
];

// Default player avatars
export const DEFAULT_PLAYER_AVATARS: [string, string, string, string] = [
  'avatar-human.svg',
  'avatar-robot-1.svg',
  'avatar-robot-2.svg',
  'avatar-robot-3.svg',
];

// Default difficulty
export const DEFAULT_DIFFICULTY: Difficulty = 'medium';

// Default game speed
export const DEFAULT_GAME_SPEED: GameSpeed = 'medium';

// AI turn delays in milliseconds
export const AI_TURN_DELAYS: Record<GameSpeed, number> = {
  slow: 2000,
  medium: 1000,
  fast: 500,
  instant: 0,
};

// Points to win
export const POINTS_TO_WIN = 15;

// Position names for display
export const POSITION_NAMES = ['South', 'West', 'North', 'East'] as const;

// Team names
export const TEAM_NAMES = ['You & North', 'West & East'] as const;

// Suit symbols for display
export const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// Suit colors for display
export const SUIT_COLORS: Record<string, string> = {
  hearts: '#e74c3c',
  diamonds: '#e74c3c',
  clubs: '#2c3e50',
  spades: '#2c3e50',
};

// Available avatars (to be populated with actual avatar files)
export const AVAILABLE_AVATARS = [
  'avatar-human.svg',
  'avatar-robot-1.svg',
  'avatar-robot-2.svg',
  'avatar-robot-3.svg',
  'avatar-cat.svg',
  'avatar-dog.svg',
  'avatar-bear.svg',
  'avatar-fox.svg',
  'avatar-owl.svg',
  'avatar-penguin.svg',
  'avatar-lion.svg',
  'avatar-tiger.svg',
  'avatar-elephant.svg',
  'avatar-monkey.svg',
  'avatar-panda.svg',
  'avatar-koala.svg',
  'avatar-wolf.svg',
  'avatar-deer.svg',
  'avatar-rabbit.svg',
  'avatar-squirrel.svg',
];
