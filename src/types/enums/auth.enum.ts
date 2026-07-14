/** Product roles — enforced by RLS when Supabase is connected (Part 05). */
export enum UserRole {
  Guest = 'guest',
  TemporaryScorer = 'temporary_scorer',
  AssignedScorer = 'assigned_scorer',
  Player = 'player',
  TeamCaptain = 'team_captain',
  LeagueLeader = 'league_leader',
}
