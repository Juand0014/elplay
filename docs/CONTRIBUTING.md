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
2. Pick an Issue assigned to you (or a `good-first-issue`)
3. Branch: `feat/<part>-short-name` or `fix/short-name` (Cloud agents use `cursor/...-d9e6`)
4. Implement against the spec and [ARCHITECTURE.md](ARCHITECTURE.md)
5. Run locally:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test` (when tests exist for the area)
6. Open a PR using the template — include “How to test”
7. Wait for review (CODEOWNERS). Do not merge your own critical paths without a second look when possible

## Language

| Surface | Language |
|---|---|
| Source code, comments, commits, schema | English |
| UI strings | Spanish via `src/i18n/es.ts` |
| Specs / MEMORY product prose | English preferred for agents; Spanish OK in QA notes |

## Rules of engagement

- **One active product part** — do not start Part N+1 until Part N DoD is green
- One primary **assignee** per Issue
- Agents (Cursor/Claude) must not overwrite work assigned to a human unless asked
- Never commit secrets; only `EXPO_PUBLIC_*` in the client
- Conventional Commits: `feat(scorer): add undo last play`

## PR expectations

- Small, reviewable diffs preferred
- Screenshots/GIF for UI changes
- DB changes include migration files under `supabase/migrations/`
