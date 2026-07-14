# Contributing — ElPlay

Welcome. ElPlay is built **part by part**. Read [MEMORY.md](../MEMORY.md) first.

## Setup

```bash
pnpm install
cp .env.example .env   # fill EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
pnpm web               # PWA / web
pnpm start             # Expo
```

Requirements: Node ≥ 20, pnpm ≥ 9.

## Workflow

1. Check the **active part** in MEMORY.md and the matching `specs/NN-*.spec.md`
2. Take your **Trello** card (or ask PM to assign one) — see [TRELLO.md](TRELLO.md)
3. Branch: `feat/<part>-short-name` or `fix/short-name`
4. Implement against the spec and [ARCHITECTURE.md](ARCHITECTURE.md)
5. Run locally: `pnpm typecheck` · `pnpm lint` · `pnpm test`
6. Open a PR; move Trello card to Review
7. After merge, move card to Done

## Language

| Surface | Language |
|---|---|
| Source code, comments, commits, schema | English |
| UI strings | Spanish via `src/i18n/es.ts` |
| Trello card body QA notes | Spanish OK |

## Rules of engagement

- **One active product part**
- One primary **assignee** per Trello card
- Agents must not overwrite Partner/Contributor Doing cards unless asked
- Never commit secrets; only `EXPO_PUBLIC_*` in the client
- Conventional Commits: `feat(scorer): add undo last play`
- UX: sports scoreboard clarity, no generic dashboard chrome on entry/live/scorer
## PR expectations

- Small, reviewable diffs preferred
- Screenshots/GIF for UI changes
- DB changes include migration files under `supabase/migrations/`
