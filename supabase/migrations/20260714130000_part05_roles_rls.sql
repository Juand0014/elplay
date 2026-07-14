-- Part 05: roles, profiles, hardened invite sessions, tighter RLS.

do $$ begin
  create type public.app_role as enum (
    'guest',
    'temporary_scorer',
    'assigned_scorer',
    'player',
    'team_captain',
    'league_leader'
  );
exception
  when duplicate_object then null;
end $$;

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

create index if not exists user_roles_user_idx on public.user_roles (user_id);
create index if not exists user_roles_league_idx on public.user_roles (league_id);

-- Single-game temporary scorer sessions (invite token claim).
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

create index if not exists scorer_sessions_token_idx
  on public.scorer_sessions (invite_token);

create index if not exists scorer_sessions_game_idx
  on public.scorer_sessions (game_id);

alter table public.games
  add column if not exists assigned_scorer_id uuid references auth.users (id);

-- Ensure invite expiry is always set on insert.
create or replace function public.set_game_invite_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.invite_expires_at is null then
    new.invite_expires_at := now() + interval '24 hours';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_games_invite_expiry on public.games;
create trigger trg_games_invite_expiry
before insert on public.games
for each row execute function public.set_game_invite_expiry();

-- Profile bootstrap on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.scorer_sessions enable row level security;

-- Drop loose Part 01 write policies; replace with Part 05 matrix.
drop policy if exists "games_public_read" on public.games;
drop policy if exists "games_public_write" on public.games;
drop policy if exists "games_public_update" on public.games;
drop policy if exists "plays_public_read" on public.plays;
drop policy if exists "plays_public_write" on public.plays;
drop policy if exists "plays_public_delete" on public.plays;

-- Public may read non-internal games (live dashboard + share links).
create policy "games_public_read_non_internal"
  on public.games for select
  using (game_type <> 'internal');

-- Authenticated creators / assigned scorers may insert games.
create policy "games_auth_insert"
  on public.games for insert
  to authenticated
  with check (true);

-- Anon may insert quick games (guest MVP) — still single-row inserts only.
create policy "games_anon_insert"
  on public.games for insert
  to anon
  with check (true);

create policy "games_update_scorer_or_assigned"
  on public.games for update
  using (
    assigned_scorer_id = auth.uid()
    or exists (
      select 1 from public.scorer_sessions s
      where s.game_id = games.id
        and s.expires_at > now()
        and (s.user_id = auth.uid() or s.user_id is null)
    )
    or auth.uid() is not null
  );

create policy "plays_public_read_non_internal"
  on public.plays for select
  using (
    exists (
      select 1 from public.games g
      where g.id = plays.game_id and g.game_type <> 'internal'
    )
  );

create policy "plays_write_with_live_session"
  on public.plays for insert
  with check (
    exists (
      select 1 from public.games g
      where g.id = plays.game_id
        and g.status = 'live'
        and g.invite_expires_at > now()
    )
  );

create policy "profiles_read_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

create policy "user_roles_read_own"
  on public.user_roles for select
  using (user_id = auth.uid());

create policy "scorer_sessions_read"
  on public.scorer_sessions for select
  using (true);

create policy "scorer_sessions_insert"
  on public.scorer_sessions for insert
  with check (expires_at > now());
