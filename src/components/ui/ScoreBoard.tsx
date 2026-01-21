import React from 'react';
import { POINTS_TO_WIN } from '../../utils/constants';
import { Avatar } from './Avatar';
import type { PlayerState, AvatarData } from '../../engine/types';

interface ScoreBoardProps {
  score: [number, number];
  teamNames: [string, string];
  players: PlayerState[];
  trump?: string | null;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  teamNames,
  players,
  trump,
}) => {
  // Helper to get avatar src
  const getAvatarSrc = (avatarData: AvatarData | string): string => {
    if (typeof avatarData === 'string') {
      return avatarData;
    }
    return avatarData.type === 'preset' ? avatarData.value : avatarData.value;
  };
  return (
    <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 w-full md:min-w-[200px]">
      {/* Mobile: Horizontal Layout */}
      <div className="md:hidden">
        <div className="text-center font-bold text-sm mb-2 text-gray-700">Score</div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex-1 flex flex-col items-center p-1.5 rounded">
            <div className="flex -space-x-2 mb-1">
              <Avatar
                src={getAvatarSrc(players[0].avatar)}
                alt={players[0].name}
                size="sm"
                className="border-2 border-white"
              />
              <Avatar
                src={getAvatarSrc(players[2].avatar)}
                alt={players[2].name}
                size="sm"
                className="border-2 border-white"
              />
            </div>
            <div className="font-medium text-gray-700 truncate text-center">{teamNames[0]}</div>
            <div className="font-bold text-xl text-gray-900">{score[0]}</div>
          </div>
          <div className="text-gray-400 font-bold">vs</div>
          <div className="flex-1 flex flex-col items-center p-1.5 rounded">
            <div className="flex -space-x-2 mb-1">
              <Avatar
                src={getAvatarSrc(players[1].avatar)}
                alt={players[1].name}
                size="sm"
                className="border-2 border-white"
              />
              <Avatar
                src={getAvatarSrc(players[3].avatar)}
                alt={players[3].name}
                size="sm"
                className="border-2 border-white"
              />
            </div>
            <div className="font-medium text-gray-700 truncate text-center">{teamNames[1]}</div>
            <div className="font-bold text-xl text-gray-900">{score[1]}</div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          First to {POINTS_TO_WIN}
        </div>
      </div>

      {/* Desktop: Vertical Layout */}
      <div className="hidden md:block">
        <div className="text-center font-bold text-lg mb-3 text-gray-700">
          Score
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <Avatar
                  src={getAvatarSrc(players[0].avatar)}
                  alt={players[0].name}
                  size="sm"
                  className="border-2 border-white"
                />
                <Avatar
                  src={getAvatarSrc(players[2].avatar)}
                  alt={players[2].name}
                  size="sm"
                  className="border-2 border-white"
                />
              </div>
              <span className="font-medium text-sm text-gray-700">{teamNames[0]}</span>
            </div>
            <span className="font-bold text-xl text-gray-900">{score[0]}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <Avatar
                  src={getAvatarSrc(players[1].avatar)}
                  alt={players[1].name}
                  size="sm"
                  className="border-2 border-white"
                />
                <Avatar
                  src={getAvatarSrc(players[3].avatar)}
                  alt={players[3].name}
                  size="sm"
                  className="border-2 border-white"
                />
              </div>
              <span className="font-medium text-sm text-gray-700">{teamNames[1]}</span>
            </div>
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
    </div>
  );
};
