import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type SessionMode = 'unknown' | 'guest' | 'authenticated';

type SessionState = {
  mode: SessionMode;
  userId: string | null;
  displayName: string | null;
  enterAsGuest: () => void;
  setAuthenticated: (input: { userId: string; displayName: string | null }) => void;
  clearSession: () => void;
};

const webStorage = {
  getItem: (name: string) => {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(name);
  },
};

const storage = createJSONStorage(() =>
  Platform.OS === 'web' ? webStorage : AsyncStorage,
);

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      mode: 'unknown',
      userId: null,
      displayName: null,
      enterAsGuest: () =>
        set({ mode: 'guest', userId: null, displayName: null }),
      setAuthenticated: ({ userId, displayName }) =>
        set({ mode: 'authenticated', userId, displayName }),
      clearSession: () =>
        set({ mode: 'unknown', userId: null, displayName: null }),
    }),
    {
      name: 'elplay-session',
      storage,
      partialize: (state) => ({
        mode: state.mode,
        userId: state.userId,
        displayName: state.displayName,
      }),
    },
  ),
);
