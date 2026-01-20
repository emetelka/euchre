import React from 'react';
import type { Suit } from '../../engine/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../utils/constants';

interface GoAloneDialogProps {
  trump: Suit;
  onGoAlone: () => void;
  onDecline: () => void;
}

export const GoAloneDialog: React.FC<GoAloneDialogProps> = ({
  trump,
  onGoAlone,
  onDecline,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Go Alone?
        </h2>

        <div className="mb-6 text-center">
          <p className="text-gray-700 mb-4">
            You called trump in{' '}
            <span style={{ color: SUIT_COLORS[trump] }} className="font-bold text-2xl">
              {SUIT_SYMBOLS[trump]}
            </span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Going alone means your partner sits out and you play all 5 tricks by yourself.
          </p>
          <p className="text-sm text-gray-600 font-semibold">
            If you win all 5 tricks, you get 4 points instead of 2!
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onGoAlone}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Go Alone
          </button>
          <button
            onClick={onDecline}
            className="w-full py-3 px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-all"
          >
            Play with Partner
          </button>
        </div>
      </div>
    </div>
  );
};
