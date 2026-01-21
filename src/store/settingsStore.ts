import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Difficulty, GameSpeed, AvatarData } from '../engine/types';
import {
  DEFAULT_PLAYER_NAMES,
  DEFAULT_PLAYER_AVATARS,
  DEFAULT_DIFFICULTY,
  DEFAULT_GAME_SPEED,
} from '../utils/constants';

interface SettingsStore extends Settings {
  setPlayerName: (position: number, name: string) => void;
  setPlayerAvatar: (position: number, avatar: AvatarData) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setGameSpeed: (speed: GameSpeed) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  playerNames: DEFAULT_PLAYER_NAMES,
  playerAvatars: DEFAULT_PLAYER_AVATARS,
  difficulty: DEFAULT_DIFFICULTY,
  gameSpeed: DEFAULT_GAME_SPEED,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setPlayerName: (position: number, name: string) =>
        set((state) => {
          const newNames = [...state.playerNames] as [string, string, string, string];
          newNames[position] = name;
          return { playerNames: newNames };
        }),

      setPlayerAvatar: (position: number, avatar: AvatarData) =>
        set((state) => {
          const newAvatars = [...state.playerAvatars] as [
            AvatarData,
            AvatarData,
            AvatarData,
            AvatarData
          ];
          newAvatars[position] = avatar;
          return { playerAvatars: newAvatars };
        }),

      setDifficulty: (difficulty: Difficulty) =>
        set({ difficulty }),

      setGameSpeed: (speed: GameSpeed) =>
        set({ gameSpeed: speed }),

      resetSettings: () =>
        set(defaultSettings),
    }),
    {
      name: 'euchre-settings',
      migrate: (persistedState: any) => {
        // Migrate old string[] format to AvatarData[]
        if (persistedState && Array.isArray(persistedState.playerAvatars)) {
          // Check if first avatar is a string (old format)
          if (typeof persistedState.playerAvatars[0] === 'string') {
            persistedState.playerAvatars = persistedState.playerAvatars.map(
              (avatar: string) => ({
                type: 'preset',
                value: avatar,
              })
            );
          }
        }
        return persistedState as SettingsStore;
      },
    }
  )
);
