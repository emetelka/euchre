import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import type { Card as CardType } from '../../engine/types';
import { useSettingsStore } from '../../store/settingsStore';
import { getAnimationDuration, springTransition } from '../../utils/animations';

interface PlayerHandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  validCards?: CardType[];
  position: 'south' | 'north' | 'east' | 'west';
  faceDown?: boolean;
  showCountOnly?: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardClick,
  validCards = [],
  position,
  faceDown = false,
  showCountOnly = false,
}) => {
  const gameSpeed = useSettingsStore((state) => state.gameSpeed);

  const isCardValid = (card: CardType) => {
    if (!validCards || validCards.length === 0) return true;
    return validCards.some((c) => c.id === card.id);
  };

  const getHandClasses = () => {
    switch (position) {
      case 'south':
        return 'flex flex-row gap-1 sm:gap-2 justify-center';
      case 'north':
        return 'flex flex-row gap-1 sm:gap-2 justify-center';
      case 'east':
        return 'flex flex-col gap-1 sm:gap-2 items-center';
      case 'west':
        return 'flex flex-col gap-1 sm:gap-2 items-center';
    }
  };

  // Show compact card count for side players
  if (showCountOnly) {
    return (
      <div className="bg-gradient-to-br from-blue-800 to-blue-950 border-2 border-blue-900 rounded-lg shadow-lg px-3 py-2 sm:px-4 sm:py-3">
        <div className="text-blue-200 text-xs sm:text-sm font-medium">Cards</div>
        <div className="text-white text-2xl sm:text-3xl font-bold">{cards.length}</div>
      </div>
    );
  }

  return (
    <div className={getHandClasses()}>
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
            disabled={!isCardValid(card)}
            faceDown={faceDown}
            size={position === 'south' ? 'medium' : 'small'}
            layoutId={faceDown ? undefined : `card-${card.id}`}
            transition={{
              duration: getAnimationDuration(gameSpeed),
              delay: index * 0.02,
              ...springTransition,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
