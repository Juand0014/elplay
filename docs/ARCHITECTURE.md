# Architecture — ElPlay

Owner role: **Architect**. Update this doc when module boundaries or scale strategy change.

## Goals

1. Grow features without god-files or cross-feature spaghetti
2. Stay maintainable with multiple contributors and AI agents
3. Survive live-traffic spikes (many viewers on the same game / dashboard)
4. Keep the mobile-first PWA as the single client surface for now

## High-level

```
src/app (routes) → src/features/<domain> → src/lib + Supabase
                 ↘ src/components (presentational)
```

- **Routes are thin**: load data via feature hooks, render components, no business rules
- **Features own domain**: hooks, mutations, domain helpers, feature-local components if needed
- **Shared UI** lives in `src/components/ui`
- **Server cache** = TanStack Query · **ephemeral UI state** = Zustand · do not mix

## Feature boundaries

Allowed:

- `features/scorer` → `lib`, `types`, `validators`, `components/ui`, `i18n`, `theme`
- `features/live` may **read** game/play types from `types`, not import scorer pad internals

Forbidden:

- `features/a` importing deep paths from `features/b` (e.g. `features/b/hooks/internal-foo`)
- Business logic inside `src/app/**`
- Hardcoded colors/spacing (use `src/theme/tokens.ts`)
- Hardcoded UI strings (use `src/i18n/es.ts`)

When a feature stabilizes, export a public barrel `features/<name>/index.ts`.

## File size

Target 200–400 lines. Split before 500. Prefer early returns over deep nesting.

## Scale & traffic (pragmatic)

| Concern | Practice |
|---|---|
| Live lists | Index `games(status)`, `games(league_id, status)`, `plays(game_id, created_at)` |
| Realtime | One channel per `game:{id}`; dashboard = query list + invalidation, not N blind sockets |
| Selects | Column lists for hot paths — avoid `select('*')` on large lists |
| Scorer writes | One atomic write (or RPC) per play |
| Authz | RLS always |
| Cache | Explicit React Query `staleTime` per feature (live short, standings longer) |
| Heavy rules | KO / aggregations → SQL RPC when client must not be source of truth |
| Observability | Add Sentry when live shipping starts (Part 02+) |
| Bundle | Route-level code splitting via Expo Router |

We do **not** introduce microservices or edge farms in early parts. We do leave indexes, RLS, and clear write paths so Part 02 live can scale.

## Schema language

Tables/columns in **English** snake_case: `games`, `home_team_name`, `away_runs`, `plays`.

## Definition of Done (architecture checklist on PRs)

- [ ] Logic in the correct feature folder
- [ ] No new cross-feature deep imports
- [ ] Types + Zod at API/form boundaries
- [ ] i18n for any user-visible text
- [ ] Migrations + regenerated types if DB changed
- [ ] Realtime unsubscribe on unmount when applicable
