import React from 'react';
import type { Team } from '../../engine/types';
import { POINTS_TO_WIN } from '../../utils/constants';

interface ScoreBoardProps {
  score: [number, number];
  teamNames: [string, string];
  trump?: string | null;
  makingTeam?: Team | null;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  teamNames,
  trump,
  makingTeam,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 w-full md:min-w-[200px]">
      <div className="text-center font-bold text-base sm:text-lg mb-2 sm:mb-3 text-gray-700">
        Score
      </div>

      <div className="space-y-1 sm:space-y-2">
        <div className={`flex justify-between items-center p-1.5 sm:p-2 rounded ${makingTeam === 0 ? 'bg-blue-100' : ''}`}>
          <span className="font-medium text-sm sm:text-base text-gray-700">{teamNames[0]}</span>
          <span className="font-bold text-lg sm:text-xl text-gray-900">{score[0]}</span>
        </div>

        <div className={`flex justify-between items-center p-1.5 sm:p-2 rounded ${makingTeam === 1 ? 'bg-blue-100' : ''}`}>
          <span className="font-medium text-sm sm:text-base text-gray-700">{teamNames[1]}</span>
          <span className="font-bold text-lg sm:text-xl text-gray-900">{score[1]}</span>
        </div>
      </div>

      <div className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
        First to {POINTS_TO_WIN}
      </div>

      {trump && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 text-center">
          <div className="text-xs sm:text-sm text-gray-600">Trump</div>
          <div className="text-base sm:text-lg font-bold capitalize text-gray-800">{trump}</div>
        </div>
      )}
    </div>
  );
};
