import React from 'react';
import type { Team } from '../../engine/types';

interface HandWinnerNoticeProps {
  winningTeam: Team;
  teamNames: [string, string];
  pointsScored: [number, number];
  wasEuchre: boolean;
  onContinue: () => void;
  tricksWon?: [number, number];
}

export const HandWinnerNotice: React.FC<HandWinnerNoticeProps> = ({
  winningTeam,
  teamNames,
  pointsScored,
  wasEuchre,
  onContinue,
  tricksWon,
}) => {
  const winningTeamName = teamNames[winningTeam];
  const points = pointsScored[winningTeam];

  return (
    <>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

      {/* Dialog - flexbox centered */}
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
          Hand Complete!
        </h2>

        <div className="mb-4 sm:mb-6 text-center">
          <div className="text-lg sm:text-xl font-bold text-green-600 mb-2">
            {winningTeamName} win{winningTeam === 0 ? '' : 's'}!
          </div>

          <div className="text-base sm:text-lg text-gray-700 mb-2">
            +{points} point{points !== 1 ? 's' : ''}
          </div>

          {wasEuchre && (
            <div className="text-base sm:text-lg font-bold text-red-600 mt-2">
              Euchred! 🎉
            </div>
          )}

          {points === 4 && (
            <div className="text-base sm:text-lg font-bold text-blue-600 mt-2">
              Going Alone Success! 🌟
            </div>
          )}

          {points === 2 && !wasEuchre && (
            <div className="text-base sm:text-lg font-bold text-purple-600 mt-2">
              All 5 Tricks! 👑
            </div>
          )}
        </div>

        {tricksWon && (
          <div className="text-sm sm:text-base text-gray-600 text-center mb-4">
            <div className="font-semibold mb-1">Tricks Won:</div>
            <div className="flex justify-around">
              <div>
                {teamNames[0]}: <span className="font-bold">{tricksWon[0]}</span>
              </div>
              <div>
                {teamNames[1]}: <span className="font-bold">{tricksWon[1]}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onContinue}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          Continue
        </button>
        </div>
      </div>
    </>
  );
};
