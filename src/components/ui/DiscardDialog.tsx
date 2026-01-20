import React from 'react';
import type { Card as CardType, Suit } from '../../engine/types';
import { Card } from '../game/Card';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../utils/constants';

interface DiscardDialogProps {
  hand: CardType[];
  trump: Suit;
  onDiscard: (card: CardType) => void;
}

export const DiscardDialog: React.FC<DiscardDialogProps> = ({
  hand,
  trump,
  onDiscard,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-3xl w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Discard a Card
        </h2>

        <div className="mb-6 text-center">
          <p className="text-lg text-gray-600 mb-2">
            Trump is{' '}
            <span
              className="font-bold text-2xl"
              style={{ color: SUIT_COLORS[trump] }}
            >
              {SUIT_SYMBOLS[trump]} {trump}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            You picked up the turned-up card. Select a card to discard:
          </p>
        </div>

        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {hand.map((card) => (
            <button
              key={card.id}
              onClick={() => onDiscard(card)}
              className="transform transition-all hover:scale-110 hover:shadow-2xl"
            >
              <Card card={card} size="medium" />
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 italic">
          Click on a card to discard it
        </p>
      </div>
    </div>
  );
};
