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
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <div className="text-center font-bold text-lg mb-3 text-gray-700">
        Score
      </div>

      <div className="space-y-2">
        <div className={`flex justify-between items-center p-2 rounded ${makingTeam === 0 ? 'bg-blue-100' : ''}`}>
          <span className="font-medium text-gray-700">{teamNames[0]}</span>
          <span className="font-bold text-xl text-gray-900">{score[0]}</span>
        </div>

        <div className={`flex justify-between items-center p-2 rounded ${makingTeam === 1 ? 'bg-blue-100' : ''}`}>
          <span className="font-medium text-gray-700">{teamNames[1]}</span>
          <span className="font-bold text-xl text-gray-900">{score[1]}</span>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-3">
        First to {POINTS_TO_WIN}
      </div>

      {trump && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
          <div className="text-sm text-gray-600">Trump</div>
          <div className="text-lg font-bold capitalize text-gray-800">{trump}</div>
        </div>
      )}
    </div>
  );
};
