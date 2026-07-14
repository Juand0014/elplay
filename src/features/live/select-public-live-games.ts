import { isPublicLiveGame } from '@/types';
import type { Game } from '@/types';

export type LiveLeagueFilter = string | 'all';

/**
 * Public live dashboard selection — never includes internal practice games.
 * Optional league filter prepares Part 06 league-scoped dashboards.
 */
export function selectPublicLiveGames(
  games: Iterable<Game>,
  leagueFilter: LiveLeagueFilter = 'all',
): Game[] {
  return [...games]
    .filter(isPublicLiveGame)
    .filter((game) =>
      leagueFilter === 'all' ? true : game.leagueId === leagueFilter,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}
