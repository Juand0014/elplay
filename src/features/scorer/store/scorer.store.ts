import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BasesState, Game } from '@/types';
import { PlayType } from '@/types';
import {
  addManualRun,
  advanceHalfInning,
  bumpBalls,
  bumpStrikes,
  createGame,
  endGame,
  recordHit,
  recordOut,
  recordWalk,
  setBase,
  setRunner,
} from '@/features/scorer/engine/scoring';

type ScorerState = {
  games: Record<string, Game>;
  /** Previous snapshots per game id for undo. */
  history: Record<string, Game[]>;
  createQuickGame: (homeTeamName: string, awayTeamName: string) => Game;
  getGame: (id: string) => Game | undefined;
  getGameByToken: (token: string) => Game | undefined;
  apply: (gameId: string, mutator: (game: Game) => Game) => void;
  undo: (gameId: string) => void;
  bumpBalls: (gameId: string) => void;
  bumpStrikes: (gameId: string) => void;
  recordOut: (gameId: string) => void;
  recordWalk: (gameId: string) => void;
  recordHit: (
    gameId: string,
    type: PlayType.Single | PlayType.Double | PlayType.Triple | PlayType.HomeRun,
  ) => void;
  addRun: (gameId: string) => void;
  advanceHalf: (gameId: string) => void;
  setRunnerNumber: (gameId: string, jersey: string | null) => void;
  setBaseOccupant: (
    gameId: string,
    base: keyof BasesState,
    jersey: string | null,
  ) => void;
  finish: (gameId: string) => void;
};

const webStorage = {
  getItem: async (name: string) =>
    typeof localStorage === 'undefined' ? null : localStorage.getItem(name),
  setItem: async (name: string, value: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
  },
};

const storage = createJSONStorage(() =>
  Platform.OS === 'web' ? webStorage : AsyncStorage,
);

function pushHistory(
  history: Record<string, Game[]>,
  gameId: string,
  previous: Game,
): Record<string, Game[]> {
  const stack = history[gameId] ?? [];
  return {
    ...history,
    [gameId]: [...stack.slice(-29), previous],
  };
}

export const useScorerStore = create<ScorerState>()(
  persist(
    (set, get) => ({
      games: {},
      history: {},
      createQuickGame: (homeTeamName, awayTeamName) => {
        const game = createGame({ homeTeamName, awayTeamName });
        set((state) => ({
          games: { ...state.games, [game.id]: game },
          history: { ...state.history, [game.id]: [] },
        }));
        return game;
      },
      getGame: (id) => get().games[id],
      getGameByToken: (token) =>
        Object.values(get().games).find((g) => g.inviteToken === token),
      apply: (gameId, mutator) => {
        const current = get().games[gameId];
        if (!current) return;
        const next = mutator(current);
        set((state) => ({
          games: { ...state.games, [gameId]: next },
          history: pushHistory(state.history, gameId, current),
        }));
      },
      undo: (gameId) => {
        const stack = get().history[gameId] ?? [];
        if (stack.length === 0) return;
        const previous = stack[stack.length - 1];
        if (!previous) return;
        set((state) => ({
          games: { ...state.games, [gameId]: previous },
          history: {
            ...state.history,
            [gameId]: stack.slice(0, -1),
          },
        }));
      },
      bumpBalls: (gameId) => get().apply(gameId, bumpBalls),
      bumpStrikes: (gameId) => get().apply(gameId, bumpStrikes),
      recordOut: (gameId) => get().apply(gameId, (g) => recordOut(g)),
      recordWalk: (gameId) => get().apply(gameId, recordWalk),
      recordHit: (gameId, type) =>
        get().apply(gameId, (g) => recordHit(g, type)),
      addRun: (gameId) => get().apply(gameId, addManualRun),
      advanceHalf: (gameId) => get().apply(gameId, advanceHalfInning),
      setRunnerNumber: (gameId, jersey) =>
        get().apply(gameId, (g) => setRunner(g, jersey)),
      setBaseOccupant: (gameId, base, jersey) =>
        get().apply(gameId, (g) => setBase(g, base, jersey)),
      finish: (gameId) => get().apply(gameId, endGame),
    }),
    {
      name: 'elplay-scorer',
      storage,
      partialize: (state) => ({
        games: state.games,
        history: state.history,
      }),
    },
  ),
);
