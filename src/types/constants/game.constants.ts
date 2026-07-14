import { GameStatus } from '../enums';

/** Default softball game configuration (WBSC-inspired; leagues may override). */
export const DEFAULT_GAME_CONFIG = {
  INNINGS: 7,
  MIN_INNINGS: 5,
  OUTS_PER_INNING: 3,
  BALLS_FOR_WALK: 4,
  STRIKES_FOR_OUT: 3,
  LINEUP_SIZE: 9,
} as const;

export const FINISHED_GAME_STATUSES = [
  GameStatus.Done,
  GameStatus.Knockout,
] as const;

/** Temporary scorer invite links expire after this many hours (Part 05). */
export const INVITE_TTL_HOURS = 24;
