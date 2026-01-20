import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Difficulty, GameSpeed } from '../engine/types';
import {
  DEFAULT_PLAYER_NAMES,
  DEFAULT_PLAYER_AVATARS,
  DEFAULT_DIFFICULTY,
  DEFAULT_GAME_SPEED,
} from '../utils/constants';

interface SettingsStore extends Settings {
  setPlayerName: (position: number, name: string) => void;
  setPlayerAvatar: (position: number, avatar: string) => void;
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

      setPlayerAvatar: (position: number, avatar: string) =>
        set((state) => {
          const newAvatars = [...state.playerAvatars] as [string, string, string, string];
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
    }
  )
);
