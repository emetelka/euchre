import React from 'react';
import type { Suit, BiddingState, Card as CardType } from '../../engine/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../utils/constants';
import { Card } from '../game/Card';

interface BidDialogProps {
  bidding: BiddingState;
  onOrderUp: () => void;
  onPass: () => void;
  onPickSuit: (suit: Suit) => void;
  onGoAlone: () => void;
  availableSuits?: Suit[];
  playerHand?: CardType[];
  dealerName?: string;
}

export const BidDialog: React.FC<BidDialogProps> = ({
  bidding,
  onOrderUp,
  onPass,
  onPickSuit,
  onGoAlone,
  availableSuits = [],
  playerHand = [],
  dealerName = '',
}) => {
  const isRound1 = bidding.round === 1;
  const isRound2 = bidding.round === 2;
  const isDealer = bidding.currentBidder === bidding.dealer;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {isRound1 ? 'Bidding - Round 1' : 'Bidding - Round 2'}
        </h2>

        {/* Show dealer info */}
        {dealerName && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              Dealer: <span className="font-bold text-blue-600">{dealerName}</span>
            </p>
          </div>
        )}

        {/* Show player's hand during bidding */}
        {playerHand.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 text-center">Your hand:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {playerHand.map((card) => (
                <Card key={card.id} card={card} size="small" />
              ))}
            </div>
          </div>
        )}

        {isRound1 && bidding.turnedUpCard && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Turned-up card:</p>
            <div className="flex justify-center items-center gap-2">
              <span
                className="text-4xl"
                style={{ color: SUIT_COLORS[bidding.turnedUpCard.suit] }}
              >
                {SUIT_SYMBOLS[bidding.turnedUpCard.suit]}
              </span>
              <span className="text-2xl font-bold text-gray-800">
                {bidding.turnedUpCard.rank}
              </span>
            </div>
          </div>
        )}

        {isRound2 && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Pick a suit{isDealer ? ' (dealer must pick)' : ''}:
            </p>
            <div className="flex justify-center gap-3">
              {availableSuits.map((suit) => (
                <button
                  key={suit}
                  onClick={() => onPickSuit(suit)}
                  className="p-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all"
                  style={{ color: SUIT_COLORS[suit] }}
                >
                  <span className="text-4xl">{SUIT_SYMBOLS[suit]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isRound1 && (
            <button
              onClick={onOrderUp}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Order Up
            </button>
          )}

          {!(isDealer && isRound2) && (
            <button
              onClick={onPass}
              className="w-full py-3 px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-all"
            >
              Pass
            </button>
          )}

          {isDealer && isRound2 && (
            <p className="text-sm text-center text-gray-600 italic">
              Dealer must pick a suit
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
