-- Part 02: live dashboard fields + indexes (English schema).

do $$ begin
  create type public.game_type as enum ('league', 'tournament', 'internal');
exception
  when duplicate_object then null;
end $$;

alter table public.games
  add column if not exists game_type public.game_type not null default 'league',
  add column if not exists league_id uuid,
  add column if not exists home_hits int not null default 0,
  add column if not exists away_hits int not null default 0,
  add column if not exists home_errors int not null default 0,
  add column if not exists away_errors int not null default 0,
  add column if not exists invite_expires_at timestamptz,
  add column if not exists temporary_scorer_name text;

-- Backfill invite expiry (24h from created_at) for existing rows.
update public.games
set invite_expires_at = created_at + interval '24 hours'
where invite_expires_at is null;

create index if not exists games_status_live_idx
  on public.games (status)
  where status = 'live';

create index if not exists games_league_status_idx
  on public.games (league_id, status);

create index if not exists games_public_live_idx
  on public.games (status, game_type, updated_at desc)
  where status = 'live' and game_type <> 'internal';
