import React from 'react';
import { Card } from './Card';
import type { Card as CardType } from '../../engine/types';

interface PlayerHandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  validCards?: CardType[];
  position: 'south' | 'north' | 'east' | 'west';
  faceDown?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardClick,
  validCards = [],
  position,
  faceDown = false,
}) => {
  const isCardValid = (card: CardType) => {
    if (!validCards || validCards.length === 0) return true;
    return validCards.some((c) => c.id === card.id);
  };

  const getHandClasses = () => {
    switch (position) {
      case 'south':
        return 'flex flex-row gap-2 justify-center';
      case 'north':
        return 'flex flex-row gap-2 justify-center';
      case 'east':
        return 'flex flex-col gap-2 items-center';
      case 'west':
        return 'flex flex-col gap-2 items-center';
    }
  };

  return (
    <div className={getHandClasses()}>
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={onCardClick ? () => onCardClick(card) : undefined}
          disabled={!isCardValid(card)}
          faceDown={faceDown}
          size={position === 'south' ? 'medium' : 'small'}
        />
      ))}
    </div>
  );
};
