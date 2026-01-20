import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useGameStore } from '../../store/gameStore';
import type { Difficulty, GameSpeed } from '../../engine/types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();
  const updatePlayerNames = useGameStore((state) => state.updatePlayerNames);
  const [localNames, setLocalNames] = useState(settings.playerNames);
  const [localDifficulty, setLocalDifficulty] = useState(settings.difficulty);
  const [localSpeed, setLocalSpeed] = useState(settings.gameSpeed);

  // Update local state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalNames(settings.playerNames);
      setLocalDifficulty(settings.difficulty);
      setLocalSpeed(settings.gameSpeed);
    }
  }, [isOpen, settings.playerNames, settings.difficulty, settings.gameSpeed]);

  if (!isOpen) return null;

  const handleSave = () => {
    localNames.forEach((name, index) => {
      settings.setPlayerName(index, name);
    });
    settings.setDifficulty(localDifficulty);
    settings.setGameSpeed(localSpeed);

    // Update player names in current game immediately
    updatePlayerNames(localNames);

    onClose();
  };

  const handleCancel = () => {
    setLocalNames(settings.playerNames);
    setLocalDifficulty(settings.difficulty);
    setLocalSpeed(settings.gameSpeed);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

        {/* Player Names */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Player Names</h3>
          <div className="space-y-3">
            {localNames.map((name, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {index === 0 ? 'You (South)' : ['West', 'North', 'East'][index - 1]}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...localNames] as [string, string, string, string];
                    newNames[index] = e.target.value;
                    setLocalNames(newNames);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">AI Difficulty</h3>
          <div className="space-y-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
              <label key={level} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={localDifficulty === level}
                  onChange={() => setLocalDifficulty(level)}
                  className="mr-3 w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Game Speed */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Game Speed</h3>
          <div className="space-y-2">
            {(['slow', 'medium', 'fast', 'instant'] as GameSpeed[]).map((speed) => (
              <label key={speed} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="speed"
                  value={speed}
                  checked={localSpeed === speed}
                  onChange={() => setLocalSpeed(speed)}
                  className="mr-3 w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 capitalize">{speed}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-6 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Note: Changes will apply to new games
        </p>
      </div>
    </div>
  );
};
