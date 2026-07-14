import type { Game, GamePlay, GameStatus, GameType, InningHalf } from '@/types';
import {
  GameStatus as GS,
  GameType as GT,
  InningHalf as IH,
  PlayType,
} from '@/types';

export type RemoteGameRow = {
  id: string;
  invite_token: string;
  invite_expires_at: string | null;
  home_team_name: string;
  away_team_name: string;
  home_runs: number;
  away_runs: number;
  home_hits: number | null;
  away_hits: number | null;
  home_errors: number | null;
  away_errors: number | null;
  inning: number;
  half: string;
  outs: number;
  balls: number;
  strikes: number;
  base_first: string | null;
  base_second: string | null;
  base_third: string | null;
  runner_jersey_number: string | null;
  status: string;
  game_type: string | null;
  league_id: string | null;
  temporary_scorer_name: string | null;
  created_at: string;
  updated_at: string;
};

export type RemotePlayRow = {
  id: string;
  sequence: number;
  play_type: string;
  runs_scored: number;
  label: string;
  created_at: string;
};

function asStatus(value: string): GameStatus {
  if (value === GS.Pending) return GS.Pending;
  if (value === GS.Done) return GS.Done;
  if (value === GS.Knockout) return GS.Knockout;
  return GS.Live;
}

function asType(value: string | null): GameType {
  if (value === GT.Internal) return GT.Internal;
  if (value === GT.Tournament) return GT.Tournament;
  return GT.League;
}

function asHalf(value: string): InningHalf {
  return value === IH.Bottom ? IH.Bottom : IH.Top;
}

function asPlayType(value: string): PlayType {
  const values = Object.values(PlayType) as string[];
  if (values.includes(value)) return value as PlayType;
  return PlayType.Out;
}

export function mapRemoteGame(
  row: RemoteGameRow,
  plays: RemotePlayRow[] = [],
): Game {
  const mappedPlays: GamePlay[] = plays.map((play) => ({
    id: play.id,
    sequence: play.sequence,
    playType: asPlayType(play.play_type),
    runsScored: play.runs_scored,
    label: play.label,
    createdAt: play.created_at,
  }));

  return {
    id: row.id,
    inviteToken: row.invite_token,
    inviteExpiresAt:
      row.invite_expires_at ??
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    homeTeamName: row.home_team_name,
    awayTeamName: row.away_team_name,
    homeRuns: row.home_runs,
    awayRuns: row.away_runs,
    homeHits: row.home_hits ?? 0,
    awayHits: row.away_hits ?? 0,
    homeErrors: row.home_errors ?? 0,
    awayErrors: row.away_errors ?? 0,
    inning: row.inning,
    half: asHalf(row.half),
    outs: row.outs,
    balls: row.balls,
    strikes: row.strikes,
    bases: {
      first: row.base_first,
      second: row.base_second,
      third: row.base_third,
    },
    runnerJerseyNumber: row.runner_jersey_number,
    status: asStatus(row.status),
    gameType: asType(row.game_type),
    leagueId: row.league_id,
    temporaryScorerName: row.temporary_scorer_name,
    plays: mappedPlays,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Columns for hot live list queries — avoid select('*'). */
export const LIVE_GAME_COLUMNS = [
  'id',
  'invite_token',
  'invite_expires_at',
  'home_team_name',
  'away_team_name',
  'home_runs',
  'away_runs',
  'home_hits',
  'away_hits',
  'home_errors',
  'away_errors',
  'inning',
  'half',
  'outs',
  'balls',
  'strikes',
  'base_first',
  'base_second',
  'base_third',
  'runner_jersey_number',
  'status',
  'game_type',
  'league_id',
  'temporary_scorer_name',
  'created_at',
  'updated_at',
].join(',');
