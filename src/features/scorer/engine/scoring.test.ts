import {
  addManualRun,
  advanceHalfInning,
  bumpBalls,
  bumpStrikes,
  createGame,
  recordHit,
  recordOut,
} from './scoring';
import { InningHalf, PlayType, GameStatus } from '@/types';

describe('scorer engine', () => {
  it('creates a live game with empty bases', () => {
    const game = createGame({
      homeTeamName: 'Tigres',
      awayTeamName: 'Leones',
    });
    expect(game.status).toBe(GameStatus.Live);
    expect(game.inning).toBe(1);
    expect(game.half).toBe(InningHalf.Top);
    expect(game.bases.first).toBeNull();
  });

  it('advances half-inning after 3 outs', () => {
    let game = createGame({ homeTeamName: 'A', awayTeamName: 'B' });
    game = { ...game, runnerJerseyNumber: '9' };
    game = recordOut(game);
    game = recordOut(game);
    game = recordOut(game);
    expect(game.outs).toBe(0);
    expect(game.half).toBe(InningHalf.Bottom);
    expect(game.bases.first).toBeNull();
  });

  it('walks on 4 balls', () => {
    let game = createGame({ homeTeamName: 'A', awayTeamName: 'B' });
    game = { ...game, runnerJerseyNumber: '12' };
    game = bumpBalls(game);
    game = bumpBalls(game);
    game = bumpBalls(game);
    game = bumpBalls(game);
    expect(game.bases.first).toBe('12');
    expect(game.balls).toBe(0);
  });

  it('strikeout on 3 strikes', () => {
    let game = createGame({ homeTeamName: 'A', awayTeamName: 'B' });
    game = bumpStrikes(game);
    game = bumpStrikes(game);
    game = bumpStrikes(game);
    expect(game.outs).toBe(1);
    expect(game.strikes).toBe(0);
  });

  it('scores on home run with bases loaded', () => {
    let game = createGame({ homeTeamName: 'A', awayTeamName: 'B' });
    game = {
      ...game,
      runnerJerseyNumber: '7',
      bases: { first: '1', second: '2', third: '3' },
    };
    game = recordHit(game, PlayType.HomeRun);
    expect(game.awayRuns).toBe(4);
    expect(game.bases.first).toBeNull();
  });

  it('manual run increments batting side', () => {
    let game = createGame({ homeTeamName: 'Home', awayTeamName: 'Away' });
    game = advanceHalfInning(game); // bottom — home bats
    game = addManualRun(game);
    expect(game.homeRuns).toBe(1);
  });

  it('counts hits on the batting side', () => {
    let game = createGame({ homeTeamName: 'A', awayTeamName: 'B' });
    game = { ...game, runnerJerseyNumber: '7' };
    game = recordHit(game, PlayType.Single);
    expect(game.awayHits).toBe(1);
    expect(game.homeHits).toBe(0);
  });

  it('sets invite expiry ~24h ahead', () => {
    const game = createGame({ homeTeamName: 'A', awayTeamName: 'B' });
    const created = new Date(game.createdAt).getTime();
    const expires = new Date(game.inviteExpiresAt).getTime();
    expect(expires - created).toBeGreaterThan(23 * 60 * 60 * 1000);
  });
});
