import React from 'react';
import { Card } from './Card';
import type { Position, Card as CardType } from '../../engine/types';

interface PlayAreaProps {
  cardsPlayed: { position: Position; card: CardType }[];
}

export const PlayArea: React.FC<PlayAreaProps> = ({ cardsPlayed }) => {
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
    <div className="relative w-64 h-64 bg-green-800 rounded-xl shadow-inner flex items-center justify-center">
      {cardsPlayed.length === 0 ? (
        <div className="text-green-600 text-sm">Trick Area</div>
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
