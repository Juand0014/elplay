# ElPlay — Project Memory

> Canonical context for **Cursor** and **Claude Code**. Read this before any task.
> Active part: **00 Foundations** (next product: **01 Scorer MVP**).

## What ElPlay is

Mobile-first PWA for softball league management in the Dominican Republic:
live scoring, public live boards, leagues, teams, standings, internal practice games, and (later) tournaments.

There is **no v1 / v2**. One product, one repo, one app.

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
docs/              # ARCHITECTURE, CONTRIBUTING, TEAM_PLAYBOOK
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for boundaries and scale rules.

## Domain invariants (softball)

1. Game types: `league` | `tournament` | `internal`
2. **Never** mix internal-game stats with official stats
3. Internal games **never** appear on the public live dashboard
4. Mercy / KO rules evaluate when a **half-inning closes** (not only on runs). Hierarchy: league → tournament → game (most specific wins)
5. Default regulation length: **7 innings** (WBSC softball baseline); leagues may override
6. Tournament may exist without league; game may exist without tournament
7. Batting stats AVG/OBP/SLG/OPS show `.---` when AB = 0

## Roles (product)

| Role | Can |
|---|---|
| Public | View live / live dashboard |
| Temporary scorer | Score one game via invite URL (session) |
| Assigned scorer | Score assigned games |
| Player | Team views / own stats |
| Team captain | Roster, internal games, invite scorers |
| League leader | League config, KO rules, teams, schedule |

Authorization lives in **RLS**, not only the client.

## Build order (parts)

| Part | Spec | Status |
|---|---|---|
| 00 | Foundations | **ACTIVE** |
| 01 | Scorer MVP (no auth) | Next |
| 02 | Live game + live dashboard | Waiting |
| 03 | Email auth | Waiting |
| 04 | OAuth | Waiting |
| 05 | Roles + RLS | Waiting |
| 06 | Leagues / teams / roster | Waiting |
| 07 | Standings + KO engine | Waiting |
| 08 | Internal games | Waiting |
| 09 | Notes | Waiting |
| 10+ | Box score, tournaments, zones, push… | Later |

**One active product part at a time.** Do not start the next until DoD of the current part is met.

## Working with Cursor + Claude + humans

- Respect Issue assignees — do not steal work from a human assignee
- Prefer Conventional Commits in English: `feat(scorer): …`
- DoD for every change: `pnpm typecheck`, `pnpm lint`, relevant tests, PR review
- New humans: read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) then this file

## Brand

- Primary: `#ff4d00` · Accent: `#ff8c00` · BG: `#0a0a0f`
- Display font: Bebas Neue · Body: readable sans (see theme tokens)
- Sports scoreboard feel — not generic SaaS
- Reference: [docs/brand/elplay_identity.html](docs/brand/elplay_identity.html)
