# ElPlay — Project Memory

> Canonical context for **Cursor** and **Claude Code**. Read this before any task.
> Active part: **00 Foundations** — fresh team start (web + mobile must run).
> Stages map: [docs/STAGES.md](docs/STAGES.md) · Plan: [docs/PLAN.md](docs/PLAN.md) · Trello: [docs/TRELLO.md](docs/TRELLO.md)

## What ElPlay is

Mobile-first PWA for softball league management in the Dominican Republic:
live scoring, public live boards, leagues, teams, standings, internal practice games, and (later) tournaments.

There is **no v1 / v2**. One product, one repo, one Expo app (web + mobile).

## Stack

| Layer | Choice |
|---|---|
| Runtime | Expo SDK **54** (docs: https://docs.expo.dev/versions/v54.0.0/) + Expo Router + react-native-web (PWA) |
| Language | TypeScript **strict** — no `any` |
| Server state | TanStack Query v5 |
| Client UI state | Zustand |
| Validation | Zod |
| Animation | Reanimated (cheap props only) |
| Backend | Supabase (Postgres + Auth + Realtime + RLS) |

Always check **versioned Expo docs** before using Expo / RN / Router APIs.

## Language rules (non-negotiable)

- **Code** (files, identifiers, comments, commits, DB schema): **English**
- **UI copy**: **Spanish only** via `src/i18n/es.ts` — never hardcode strings in JSX
- Example: `PlayType.Single` in code → `t('scorer.playTypes.single')` → `"Sencillo"`

## Repository layout

```
src/app/           # Expo Router — thin screens only
src/features/      # Domain modules (scorer, live, auth, leagues, …)
src/components/    # ui/ + scorer/ presentational
src/lib/           # supabase, query client, env
src/theme/         # design tokens
src/i18n/          # Spanish strings
src/types/         # enums, interfaces, dtos, type-guards
src/validators/    # Zod
db/                # schema reference
supabase/          # migrations + config
specs/             # one spec per part
docs/              # STAGES, ARCHITECTURE, CONTRIBUTING, TEAM_PLAYBOOK
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for boundaries and scale rules.

## Domain invariants (softball)

1. Game types: `league` | `tournament` | `internal`
2. **Never** mix internal-game stats with official stats
3. Internal games **never** appear on the public live dashboard
4. Mercy / KO rules evaluate when a **half-inning closes**. Hierarchy: league → tournament → game
5. Default regulation length: **7 innings** (WBSC softball baseline)
6. Tournament may exist without league; game may exist without tournament
7. Batting stats AVG/OBP/SLG/OPS show `.---` when AB = 0

## Access model (guest + Google)

- **Guest is first-class** (Part 01+): view live, invite scorer, create quick games
- **Primary auth = Google** via Supabase OAuth (Part 03)
- Guest cannot become league leader / captain until Google sign-in (Part 05)
- Optional later: Apple Sign-In, email magic link

## Roles (product)

| Role | Can |
|---|---|
| Guest / Public | Enter without account; view live; score via invite / quick game |
| Temporary scorer | Score one game via invite URL (session) |
| Assigned scorer | Score assigned games (needs account) |
| Player | Team views / own stats |
| Team captain | Roster, internal games, invite scorers (Google account) |
| League leader | League config, KO rules, teams, schedule (Google account) |

Authorization lives in **RLS**, not only the client.

## Build order (parts)

| Part | Spec | Status |
|---|---|---|
| 00 | Foundations (web + mobile runs) | **ACTIVE** |
| 01 | Scorer MVP | Next (code may already exist on main — validate DoD) |
| 02 | Live game + live dashboard | Waiting |
| 03 | Guest session + Google Auth | Waiting |
| 05 | Roles + RLS + temp scorer URL | Waiting |
| 06 | Leagues / teams / roster | Waiting |
| 07 | Standings + KO engine | Waiting |
| 08 | Internal games | Waiting |
| 09 | Notes | Waiting |
| 10+ | Box score, tournaments, zones, push… | Later |

**One active product part at a time.** Do not start the next until DoD of the current part is met.

## Working with Cursor + Claude + humans

- **Trello** assigns work ([docs/TRELLO.md](docs/TRELLO.md)) — bootstrap with `pnpm trello:bootstrap`
- **GitHub** holds PRs and CI
- Respect Trello assignees — do not steal `Doing — Partner` / `Doing — Contributor` cards
- Prefer Conventional Commits in English
- DoD: `pnpm typecheck`, `pnpm lint`, relevant tests, PR review
- New humans: README → START_HERE → STAGES → their Trello card

## Brand & UX bar

- Primary: `#ff4d00` · Accent: `#ff8c00` · BG night field
- Display: Bebas Neue · Body: Inter
- Entry and live screens must feel like a **ballpark scoreboard**
- **Diamond rule:** center shows the **jersey number of the player running**
- Thumb-first actions; one dominant CTA; Spanish copy only via i18n
- Reference: [docs/brand/elplay_identity.html](docs/brand/elplay_identity.html)
