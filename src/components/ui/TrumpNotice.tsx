import React from 'react';
import type { Suit, Position } from '../../engine/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../utils/constants';

interface TrumpNoticeProps {
  trump: Suit;
  maker: Position;
  playerNames: [string, string, string, string];
  goingAlone: boolean;
  onConfirm: () => void;
}

export const TrumpNotice: React.FC<TrumpNoticeProps> = ({
  trump,
  maker,
  playerNames,
  goingAlone,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          Trump Selected!
        </h2>

        <div className="mb-4 sm:mb-6 text-center">
          <div className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
            {playerNames[maker]} called trump:
          </div>
          <div className="flex justify-center items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span
              className="text-4xl sm:text-5xl md:text-6xl"
              style={{ color: SUIT_COLORS[trump] }}
            >
              {SUIT_SYMBOLS[trump]}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-gray-800 capitalize">
              {trump}
            </span>
          </div>
          {goingAlone && (
            <div className="text-base sm:text-lg font-bold text-blue-600">
              Going Alone!
            </div>
          )}
        </div>

        <button
          onClick={onConfirm}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold text-base sm:text-lg rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          Start Playing
        </button>
      </div>
    </div>
  );
};
