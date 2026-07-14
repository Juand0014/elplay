# Agents — ElPlay

You are working on **ElPlay** with Cursor and/or Claude Code in the same repo.

## Required reading (in order)

1. [MEMORY.md](MEMORY.md) — project memory (canonical)
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — structure, scale, boundaries
3. [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — how humans and agents contribute
4. [docs/TEAM_PLAYBOOK.md](docs/TEAM_PLAYBOOK.md) — role responsibilities
5. Active spec under `specs/` for the current part
6. [docs/TRELLO.md](docs/TRELLO.md) — assigning Partner / 3rd parties

## Hard rules

- **Expo SDK 54** — read https://docs.expo.dev/versions/v54.0.0/ before Expo/RN/Router APIs
- Code/comments/commits/schema: **English**
- UI strings: **Spanish** only via `src/i18n/es.ts`
- Work only on the **active part** unless the task is a critical bug or docs/chore
- Do not take Trello cards in `Doing — Partner` / `Doing — Contributor` unless asked
- No `any`. Prefer enums, constants, Zod at boundaries, type guards over `as`
- RLS in the database — never authz-only in the UI
- Always clean up Supabase Realtime channels on unmount
- UX bar: sports scoreboard, thumb-first, not generic SaaS

## Kickoff line

Active part = **01 Scorer MVP**. Part 00 Foundations is done.  
Auth: guest first-class + Google (Part 03). Assign humans via **Trello**.
