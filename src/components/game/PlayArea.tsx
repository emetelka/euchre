import React from 'react';
import { Card } from './Card';
import type { Position, Card as CardType, Suit } from '../../engine/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../utils/constants';

interface PlayAreaProps {
  cardsPlayed: { position: Position; card: CardType }[];
  trump?: Suit | null;
}

export const PlayArea: React.FC<PlayAreaProps> = ({ cardsPlayed, trump }) => {
  const getCardPosition = (position: Position) => {
    switch (position) {
      case 0: // South
        return 'absolute bottom-0 left-1/2 -translate-x-1/2';
      case 1: // West
        return 'absolute left-0 top-1/2 -translate-y-1/2';
      case 2: // North
        return 'absolute top-0 left-1/2 -translate-x-1/2';
      case 3: // East
        return 'absolute right-0 top-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-green-800 rounded-xl shadow-inner flex items-center justify-center">
      {cardsPlayed.length === 0 ? (
        <div className="flex flex-col items-center gap-1">
          {trump ? (
            <>
              <div className="text-green-600 text-xs opacity-70">Trump</div>
              <div
                className="text-5xl sm:text-6xl md:text-7xl"
                style={{ color: SUIT_COLORS[trump] }}
              >
                {SUIT_SYMBOLS[trump]}
              </div>
              <div className="text-white text-sm sm:text-base font-semibold capitalize opacity-90">
                {trump}
              </div>
            </>
          ) : (
            <div className="text-green-600 text-xs sm:text-sm">Trick Area</div>
          )}
        </div>
      ) : (
        <>
          {cardsPlayed.map((play) => (
            <div key={play.position} className={getCardPosition(play.position)}>
              <Card card={play.card} size="small" />
            </div>
          ))}
        </>
      )}
    </div>
  );
};
