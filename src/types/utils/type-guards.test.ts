import { isInviteExpired, isPublicLiveGame } from './type-guards';
import { createGame, endGame } from '@/features/scorer/engine/scoring';
import { GameType } from '../enums';

describe('type guards', () => {
  it('excludes internal and finished games from public live', () => {
    const live = createGame({ homeTeamName: 'A', awayTeamName: 'B' });
    const internal = createGame({
      homeTeamName: 'A',
      awayTeamName: 'B',
      gameType: GameType.Internal,
    });
    expect(isPublicLiveGame(live)).toBe(true);
    expect(isPublicLiveGame(internal)).toBe(false);
    expect(isPublicLiveGame(endGame(live))).toBe(false);
  });

  it('detects expired invites', () => {
    const game = {
      ...createGame({ homeTeamName: 'A', awayTeamName: 'B' }),
      inviteExpiresAt: new Date(Date.now() - 1000).toISOString(),
    };
    expect(isInviteExpired(game)).toBe(true);
  });
});
