-- ElPlay schema reference (Parts 01–05). Source of truth: supabase/migrations/

create extension if not exists "pgcrypto";

create type public.game_status as enum ('pending', 'live', 'done', 'ko');
create type public.inning_half as enum ('top', 'bottom');
create type public.game_type as enum ('league', 'tournament', 'internal');
create type public.app_role as enum (
  'guest',
  'temporary_scorer',
  'assigned_scorer',
  'player',
  'team_captain',
  'league_leader'
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  invite_token text not null unique,
  invite_expires_at timestamptz,
  home_team_name text not null,
  away_team_name text not null,
  home_runs int not null default 0,
  away_runs int not null default 0,
  home_hits int not null default 0,
  away_hits int not null default 0,
  home_errors int not null default 0,
  away_errors int not null default 0,
  inning int not null default 1,
  half public.inning_half not null default 'top',
  outs int not null default 0 check (outs between 0 and 2),
  balls int not null default 0 check (balls between 0 and 3),
  strikes int not null default 0 check (strikes between 0 and 2),
  base_first text,
  base_second text,
  base_third text,
  runner_jersey_number text,
  status public.game_status not null default 'live',
  game_type public.game_type not null default 'league',
  league_id uuid,
  temporary_scorer_name text,
  assigned_scorer_id uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_status_idx on public.games (status);
create index if not exists games_invite_token_idx on public.games (invite_token);
create index if not exists games_league_status_idx on public.games (league_id, status);
create index if not exists games_public_live_idx
  on public.games (status, game_type, updated_at desc)
  where status = 'live' and game_type <> 'internal';

create table if not exists public.plays (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  sequence int not null,
  play_type text not null,
  runs_scored int not null default 0,
  label text not null,
  created_at timestamptz not null default now()
);

create index if not exists plays_game_created_idx
  on public.plays (game_id, created_at);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  league_id uuid,
  team_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, role, league_id, team_id)
);

create table if not exists public.scorer_sessions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  invite_token text not null,
  scorer_name text not null,
  user_id uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (game_id, invite_token)
);

alter table public.games enable row level security;
alter table public.plays enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.scorer_sessions enable row level security;
