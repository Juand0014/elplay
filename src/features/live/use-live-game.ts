import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  subscribeScorerSync,
  useScorerStore,
} from '@/features/scorer';
import { getSupabase, hasSupabaseConfig } from '@/lib';

import {
  LIVE_GAME_COLUMNS,
  mapRemoteGame,
  type RemoteGameRow,
  type RemotePlayRow,
} from './map-remote-game';

export function liveGameQueryKey(gameId: string) {
  return ['live', 'game', gameId] as const;
}

async function fetchRemoteGame(gameId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: row, error } = await supabase
    .from('games')
    .select(LIVE_GAME_COLUMNS)
    .eq('id', gameId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) return null;

  const { data: plays, error: playsError } = await supabase
    .from('plays')
    .select('id, sequence, play_type, runs_scored, label, created_at')
    .eq('game_id', gameId)
    .order('created_at', { ascending: true });

  if (playsError) throw new Error(playsError.message);
  return mapRemoteGame(
    row as unknown as RemoteGameRow,
    (plays ?? []) as unknown as RemotePlayRow[],
  );
}

/**
 * Single public live game — local store + optional Realtime channel `game:{id}`.
 * Always cleans up the channel on unmount.
 */
export function useLiveGame(gameId: string | undefined) {
  const queryClient = useQueryClient();
  const localGame = useScorerStore((s) =>
    gameId ? s.games[gameId] : undefined,
  );
  const upsertRemoteGame = useScorerStore((s) => s.upsertRemoteGame);
  const [syncTick, setSyncTick] = useState(0);

  useEffect(() => {
    return subscribeScorerSync(() => {
      void useScorerStore.persist.rehydrate();
      setSyncTick((n) => n + 1);
      if (gameId) {
        void queryClient.invalidateQueries({
          queryKey: liveGameQueryKey(gameId),
        });
      }
    });
  }, [gameId, queryClient]);

  const remoteQuery = useQuery({
    queryKey: gameId ? liveGameQueryKey(gameId) : ['live', 'game', 'none'],
    queryFn: () => fetchRemoteGame(gameId!),
    enabled: Boolean(gameId) && hasSupabaseConfig(),
    staleTime: 3_000,
  });

  useEffect(() => {
    if (remoteQuery.data) {
      upsertRemoteGame(remoteQuery.data);
    }
  }, [remoteQuery.data, upsertRemoteGame]);

  useEffect(() => {
    if (!gameId || !hasSupabaseConfig()) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: liveGameQueryKey(gameId),
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'plays',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: liveGameQueryKey(gameId),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [gameId, queryClient]);

  const game = useMemo(() => {
    void syncTick;
    const remote = remoteQuery.data ?? undefined;
    if (!localGame) return remote;
    if (!remote) return localGame;
    return new Date(localGame.updatedAt).getTime() >=
      new Date(remote.updatedAt).getTime()
      ? localGame
      : remote;
  }, [localGame, remoteQuery.data, syncTick]);

  return {
    game,
    isLoading: !game && remoteQuery.isLoading,
    isError: remoteQuery.isError,
    missing: Boolean(gameId) && !game && !remoteQuery.isLoading,
  };
}
