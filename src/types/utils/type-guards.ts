import { GameStatus, GameType } from '../enums';
import type { Game } from '../interfaces';

/** Public live dashboard: live status and never internal practice games. */
export function isPublicLiveGame(game: Game): boolean {
  return game.status === GameStatus.Live && game.gameType !== GameType.Internal;
}

export function isInviteExpired(game: Game, now = Date.now()): boolean {
  return new Date(game.inviteExpiresAt).getTime() <= now;
}

export function isGameFinished(game: Game): boolean {
  return (
    game.status === GameStatus.Done || game.status === GameStatus.Knockout
  );
}
