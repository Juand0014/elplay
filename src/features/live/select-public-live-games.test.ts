import { selectPublicLiveGames } from './select-public-live-games';
import {
  createGame,
  endGame,
} from '@/features/scorer/engine/scoring';
import { GameStatus, GameType } from '@/types';

describe('selectPublicLiveGames', () => {
  it('returns only live non-internal games', () => {
    const league = createGame({
      homeTeamName: 'Tigres',
      awayTeamName: 'Leones',
      gameType: GameType.League,
    });
    const internal = createGame({
      homeTeamName: 'A',
      awayTeamName: 'B',
      gameType: GameType.Internal,
    });
    const done = endGame(
      createGame({
        homeTeamName: 'C',
        awayTeamName: 'D',
        gameType: GameType.League,
      }),
    );

    const result = selectPublicLiveGames([league, internal, done]);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(league.id);
    expect(result[0]?.status).toBe(GameStatus.Live);
  });

  it('filters by league id when provided', () => {
    const inLeague = {
      ...createGame({ homeTeamName: 'A', awayTeamName: 'B' }),
      leagueId: 'liga-1',
    };
    const other = {
      ...createGame({ homeTeamName: 'C', awayTeamName: 'D' }),
      leagueId: 'liga-2',
    };

    const result = selectPublicLiveGames([inLeague, other], 'liga-1');
    expect(result).toHaveLength(1);
    expect(result[0]?.leagueId).toBe('liga-1');
  });
});
