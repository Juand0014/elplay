# Contributing — ElPlay

Welcome. ElPlay is built **part by part**. Read [MEMORY.md](../MEMORY.md) and [STAGES.md](STAGES.md) first.

## Setup (web + mobile)

```bash
pnpm install
cp .env.example .env
pnpm web      # PWA in browser → http://localhost:8081
pnpm start    # Expo Go QR for phone
# aliases: pnpm mobile == pnpm start
```

Requirements: Node ≥ 20, pnpm ≥ 9. Supabase env is optional for Part 00.

## Workflow

1. Check the **active part** in MEMORY.md and [STAGES.md](STAGES.md)
2. Take your **Trello** card — see [TRELLO.md](TRELLO.md) / [BOARD.md](BOARD.md)
3. Branch: `feat/<part>-short-name` or `fix/short-name`
4. Implement against the spec and [ARCHITECTURE.md](ARCHITECTURE.md)
5. Run locally: `pnpm typecheck` · `pnpm lint` · `pnpm test`
6. Open a PR; move Trello card to Review
7. After merge, move card to Done

## Refresh Trello stage cards

```bash
export TRELLO_API_KEY=...
export TRELLO_TOKEN=...
pnpm trello:bootstrap -- --archive-open
```

## Language

| Surface | Language |
|---|---|
| Source code, comments, commits, schema | English |
| UI strings | Spanish via `src/i18n/es.ts` |
| Trello card body QA notes | Spanish OK |

## Rules of engagement

- **One active product part** (now: Part 00 Foundations)
- One primary **assignee** per Trello card
- Agents must not overwrite Partner/Contributor Doing cards unless asked
- Never commit secrets; only `EXPO_PUBLIC_*` in the client
- Conventional Commits: `feat(scorer): add undo last play`
- UX: sports scoreboard clarity, no generic dashboard chrome on entry/live/scorer

## PR expectations

- Small, reviewable diffs preferred
- Screenshots/GIF for UI changes
- DB changes include migration files under `supabase/migrations/`
