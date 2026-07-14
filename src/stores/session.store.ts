import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SessionMode = 'unknown' | 'guest' | 'authenticated';

export type ScorerClaim = {
  gameId: string;
  name: string;
};

type SessionState = {
  mode: SessionMode;
  userId: string | null;
  displayName: string | null;
  /** Invite token → temporary scorer claim (Part 05). */
  scorerClaims: Record<string, ScorerClaim>;
  enterAsGuest: () => void;
  setAuthenticated: (input: {
    userId: string;
    displayName: string | null;
  }) => void;
  clearSession: () => void;
  rememberScorerClaim: (token: string, claim: ScorerClaim) => void;
  setDisplayName: (name: string | null) => void;
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
    if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
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
      scorerClaims: {},
      enterAsGuest: () =>
        set((state) => ({
          mode: 'guest',
          userId: null,
          displayName: state.displayName,
        })),
      setAuthenticated: ({ userId, displayName }) =>
        set({ mode: 'authenticated', userId, displayName }),
      clearSession: () =>
        set({
          mode: 'unknown',
          userId: null,
          displayName: null,
          // Keep scorerClaims so invite session survives soft sign-out
        }),
      rememberScorerClaim: (token, claim) =>
        set((state) => ({
          scorerClaims: { ...state.scorerClaims, [token]: claim },
          displayName: claim.name,
        })),
      setDisplayName: (name) => set({ displayName: name }),
    }),
    {
      name: 'elplay-session',
      storage,
      partialize: (state) => ({
        mode: state.mode,
        userId: state.userId,
        displayName: state.displayName,
        scorerClaims: state.scorerClaims,
      }),
    },
  ),
);
