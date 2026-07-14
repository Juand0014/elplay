-- Part 01: games + plays (English schema). Apply when Supabase is connected.
-- Local scorer works offline via Zustand until then.

create extension if not exists "pgcrypto";

create type public.game_status as enum ('pending', 'live', 'done', 'ko');
create type public.inning_half as enum ('top', 'bottom');

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  invite_token text not null unique,
  home_team_name text not null,
  away_team_name text not null,
  home_runs int not null default 0,
  away_runs int not null default 0,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_status_idx on public.games (status);
create index if not exists games_invite_token_idx on public.games (invite_token);

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

alter table public.games enable row level security;
alter table public.plays enable row level security;

-- Guest-friendly Part 01: anon can read/write (tighten in Part 05 roles).
create policy "games_public_read" on public.games for select using (true);
create policy "games_public_write" on public.games for insert with check (true);
create policy "games_public_update" on public.games for update using (true);
create policy "plays_public_read" on public.plays for select using (true);
create policy "plays_public_write" on public.plays for insert with check (true);
create policy "plays_public_delete" on public.plays for delete using (true);
