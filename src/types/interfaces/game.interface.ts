import type { GameStatus, GameType, InningHalf, PlayType } from '../enums';

/** Occupied bases — jersey numbers as strings for guest MVP (no roster ids yet). */
export type BasesState = {
  first: string | null;
  second: string | null;
  third: string | null;
};

export type GamePlay = {
  id: string;
  sequence: number;
  playType: PlayType;
  runsScored: number;
  label: string;
  createdAt: string;
};

/** Local + future DB shape for a scorable game. */
export type Game = {
  id: string;
  inviteToken: string;
  /** ISO timestamp — invite URL invalid after this (Part 05). */
  inviteExpiresAt: string;
  homeTeamName: string;
  awayTeamName: string;
  homeRuns: number;
  awayRuns: number;
  homeHits: number;
  awayHits: number;
  homeErrors: number;
  awayErrors: number;
  inning: number;
  half: InningHalf;
  outs: number;
  balls: number;
  strikes: number;
  bases: BasesState;
  /** Jersey # shown in diamond center — active runner. */
  runnerJerseyNumber: string | null;
  status: GameStatus;
  gameType: GameType;
  leagueId: string | null;
  /** Name entered when claiming the invite link (temporary scorer). */
  temporaryScorerName: string | null;
  plays: GamePlay[];
  createdAt: string;
  updatedAt: string;
};
