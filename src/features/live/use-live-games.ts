import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  subscribeScorerSync,
  useScorerStore,
} from '@/features/scorer';
import { getSupabase, hasSupabaseConfig } from '@/lib';
import { GameStatus, GameType } from '@/types';

import {
  LIVE_GAME_COLUMNS,
  mapRemoteGame,
  type RemoteGameRow,
} from './map-remote-game';
import {
  type LiveLeagueFilter,
  selectPublicLiveGames,
} from './select-public-live-games';

export const LIVE_GAMES_QUERY_KEY = ['live', 'games'] as const;

async function fetchRemoteLiveGames() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('games')
    .select(LIVE_GAME_COLUMNS)
    .eq('status', GameStatus.Live)
    .neq('game_type', GameType.Internal)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    mapRemoteGame(row as unknown as RemoteGameRow),
  );
}

/**
 * Live dashboard data: local store (guest scoring) + optional Supabase list.
 * Dashboard uses one list query; detail screens own per-game channels.
 */
export function useLiveGames(leagueFilter: LiveLeagueFilter = 'all') {
  const queryClient = useQueryClient();
  const gamesMap = useScorerStore((s) => s.games);
  const [syncTick, setSyncTick] = useState(0);

  useEffect(() => {
    return subscribeScorerSync(() => {
      void useScorerStore.persist.rehydrate();
      setSyncTick((n) => n + 1);
      void queryClient.invalidateQueries({ queryKey: LIVE_GAMES_QUERY_KEY });
    });
  }, [queryClient]);

  const remoteQuery = useQuery({
    queryKey: [...LIVE_GAMES_QUERY_KEY, 'remote'],
    queryFn: fetchRemoteLiveGames,
    enabled: hasSupabaseConfig(),
    staleTime: 5_000,
    refetchInterval: hasSupabaseConfig() ? 15_000 : false,
  });

  const localLive = useMemo(
    () => selectPublicLiveGames(Object.values(gamesMap), leagueFilter),
    // syncTick forces recompute after cross-tab rehydrate
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gamesMap, leagueFilter, syncTick],
  );

  const merged = useMemo(() => {
    const byId = new Map(localLive.map((g) => [g.id, g]));
    for (const remote of remoteQuery.data ?? []) {
      if (leagueFilter !== 'all' && remote.leagueId !== leagueFilter) continue;
      const existing = byId.get(remote.id);
      if (
        !existing ||
        new Date(remote.updatedAt).getTime() >
          new Date(existing.updatedAt).getTime()
      ) {
        byId.set(remote.id, remote);
      }
    }
    return [...byId.values()].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [localLive, remoteQuery.data, leagueFilter]);

  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('live-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        () => {
          void queryClient.invalidateQueries({ queryKey: LIVE_GAMES_QUERY_KEY });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    games: merged,
    isLoading: hasSupabaseConfig() ? remoteQuery.isLoading : false,
    isError: remoteQuery.isError,
    error: remoteQuery.error,
    refetch: remoteQuery.refetch,
  };
}
