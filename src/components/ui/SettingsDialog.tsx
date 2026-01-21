import React, { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useGameStore } from '../../store/gameStore';
import type { Difficulty, GameSpeed, AvatarData } from '../../engine/types';
import { Avatar } from './Avatar';
import { AvatarCropModal } from './AvatarCropModal';
import { checkStorageQuota } from '../../utils/imageUtils';
import { DEFAULT_PLAYER_AVATARS } from '../../utils/constants';

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

  // Avatar upload state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropPosition, setCropPosition] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

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

  // Handle file selection for avatar upload
  const handleFileSelect = async (position: number, file: File | undefined) => {
    if (!file) return;

    setUploadError(null);

    try {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Please select a valid image (JPG, PNG, or WEBP)');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image file too large. Please select an image under 10MB');
      }

      // Open crop modal
      setSelectedFile(file);
      setCropPosition(position);
      setCropModalOpen(true);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to load image');
    }
  };

  // Handle save from crop modal
  const handleCropSave = async (base64: string) => {
    if (cropPosition === null) return;

    try {
      // Check storage quota
      const quotaCheck = checkStorageQuota();
      if (!quotaCheck.success) {
        throw new Error(quotaCheck.message || 'Storage limit reached');
      }

      // Save to store
      settings.setPlayerAvatar(cropPosition, { type: 'photo', value: base64 });

      // Close modal
      setCropModalOpen(false);
      setSelectedFile(null);
      setCropPosition(null);
      setUploadError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to save avatar');
      setCropModalOpen(false);
      setSelectedFile(null);
      setCropPosition(null);
    }
  };

  // Handle cancel from crop modal
  const handleCropCancel = () => {
    setCropModalOpen(false);
    setSelectedFile(null);
    setCropPosition(null);
  };

  // Helper to get avatar src for display
  const getAvatarSrc = (avatarData: AvatarData | undefined): string => {
    if (!avatarData) {
      return DEFAULT_PLAYER_AVATARS[0].value; // Fallback to default avatar
    }
    return avatarData.value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

        {/* Player Names and Avatars */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Players</h3>
          <div className="space-y-4">
            {localNames.map((name, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                {/* Player Name */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  maxLength={20}
                />

                {/* Avatar Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Avatar:</label>
                  <div className="flex items-center gap-3">
                    {/* Avatar Preview */}
                    <Avatar
                      src={getAvatarSrc(settings.playerAvatars[index])}
                      alt={localNames[index]}
                      size="lg"
                    />

                    {/* Upload/Reset Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefs[index].current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Upload Photo
                      </button>

                      {/* Reset Button (only show for custom photos) */}
                      {settings.playerAvatars[index].type === 'photo' && (
                        <button
                          type="button"
                          onClick={() => settings.setPlayerAvatar(index, DEFAULT_PLAYER_AVATARS[index])}
                          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                        >
                          Reset to Default
                        </button>
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRefs[index]}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileSelect(index, e.target.files?.[0])}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mt-3 text-red-600 text-sm bg-red-50 p-3 rounded">
              {uploadError}
            </div>
          )}
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

      {/* Avatar Crop Modal */}
      {cropModalOpen && selectedFile && cropPosition !== null && (
        <AvatarCropModal
          imageFile={selectedFile}
          playerName={localNames[cropPosition]}
          onSave={handleCropSave}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};
